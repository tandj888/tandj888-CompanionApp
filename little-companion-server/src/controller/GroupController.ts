import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Group } from "../entity/Group";
import { GroupMember } from "../entity/GroupMember";
import { User } from "../entity/User";
import { Notification } from "../entity/Notification";

export class GroupController {
    private groupRepository = AppDataSource.getRepository(Group);
    private memberRepository = AppDataSource.getRepository(GroupMember);
    private userRepository = AppDataSource.getRepository(User);
    private notificationRepository = AppDataSource.getRepository(Notification);

    async createGroup(req: Request, res: Response) {
        try {
            const { userId, ...groupData } = req.body;
            
            // Create Group
            const group = new Group();
            group.id = groupData.id || 'group-' + Date.now();
            Object.assign(group, groupData);
            await this.groupRepository.save(group);

            // Create Leader Member
            const member = new GroupMember();
            member.id = `mem-${group.id}-${userId}`;
            member.groupId = group.id;
            member.userId = userId;
            member.hasCheckedInToday = false;
            member.streak = 0;
            await this.memberRepository.save(member);

            return res.json(group);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error creating group" });
        }
    }

    async getGroups(req: Request, res: Response) {
        try {
            const userId = req.query.userId as string;
            if (!userId) {
                return res.status(400).json({ message: "UserId is required" });
            }

            // Find all memberships for the user
            const memberships = await this.memberRepository.find({
                where: { userId },
                relations: ["group"]
            });

            // Extract groups
            const groups = memberships.map(m => m.group);

            // For each group, we might want to fetch all members to show in UI
            // But doing it for all groups might be expensive.
            // For now, let's just return the groups.
            // If the UI needs full member details (like avatar, nickname), we need to fetch them.
            
            const validGroups = groups.filter(g => g !== null && g !== undefined);

            const fullGroups = await Promise.all(validGroups.map(async (g) => {
                 const members = await this.memberRepository.find({
                     where: { groupId: g.id },
                     relations: ["user"]
                 });
                 const groupMembers = members
                    .filter(m => m.user) // Filter out members where user is null
                    .map(m => ({
                     ...m.user, // User fields
                     ...m,      // Member fields (streak, etc.)
                     id: m.user.id, // Ensure id is User ID
                     memberId: m.id // Keep Member ID accessible
                 }));
                 return { ...g, members: groupMembers };
            }));

            return res.json(fullGroups);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching groups" });
        }
    }

    async joinGroup(req: Request, res: Response) {
        try {
            const { userId, inviteCode } = req.body;
            
            const groups = await this.groupRepository.find({ where: { inviteCode } });
            const group = groups[0];
            if (!group) {
                return res.status(404).json({ message: "Invalid invite code" });
            }

            // Check if already member
            const existingMembers = await this.memberRepository.find({ where: { groupId: group.id, userId } });
            const existingMember = existingMembers[0];
            if (existingMember) {
                return res.status(400).json({ message: "Already a member" });
            }

            const member = new GroupMember();
            member.id = `mem-${group.id}-${userId}`;
            member.groupId = group.id;
            member.userId = userId;
            await this.memberRepository.save(member);

            return res.json({ message: "Joined successfully", groupId: group.id });
        } catch (error) {
            return res.status(500).json({ message: "Error joining group" });
        }
    }
    
    // Sync existing group (for offline creation then sync)
    async syncGroup(req: Request, res: Response) {
         try {
            const { userId, ...groupData } = req.body;
            // Similar to create, but checks if exists
            let groups = await this.groupRepository.find({ where: { id: groupData.id } });
            let group = groups[0];
            if (!group) {
                group = new Group();
                group.id = groupData.id;
                Object.assign(group, groupData);
                await this.groupRepository.save(group);
                
                // Add user as member if not exists
                const existingMembers = await this.memberRepository.find({ where: { groupId: group.id, userId } });
                const existingMember = existingMembers[0];
                if (!existingMember) {
                    const member = new GroupMember();
                    member.id = `mem-${group.id}-${userId}`;
                    member.groupId = group.id;
                    member.userId = userId;
                    await this.memberRepository.save(member);
                }
            } else {
                // Update?
                // For now, assume server wins or last write wins?
                // Let's just update fields
                this.groupRepository.merge(group, groupData);
                await this.groupRepository.save(group);
            }
            return res.json(group);
         } catch (error) {
             return res.status(500).json({ message: "Error syncing group" });
         }
    }

    async leaveGroup(req: Request, res: Response) {
        try {
            const { groupId, userId } = req.body;
            const members = await this.memberRepository.find({ where: { groupId, userId } });
            const member = members[0];
            if (member) {
                await this.memberRepository.remove(member);
            }
            return res.json({ message: "Left group successfully" });
        } catch (error) {
            return res.status(500).json({ message: "Error leaving group" });
        }
    }

    async dissolveGroup(req: Request, res: Response) {
        try {
            const { groupId } = req.body; // Should verify if requester is leader
            const groups = await this.groupRepository.find({ where: { id: groupId } });
            const group = groups[0];
            if (group) {
                group.status = 'dissolved';
                // group.dissolvedAt = Date.now(); // Need to add this field to entity if not exists, or just use status
                await this.groupRepository.save(group);
            }
            return res.json({ message: "Group dissolved" });
        } catch (error) {
            return res.status(500).json({ message: "Error dissolving group" });
        }
    }

    async kickMember(req: Request, res: Response) {
        try {
            const { groupId, memberId } = req.body;
            const members = await this.memberRepository.find({ where: { groupId, userId: memberId } });
            const member = members[0];
            if (member) {
                await this.memberRepository.remove(member);
            }
            return res.json({ message: "Member kicked" });
        } catch (error) {
            return res.status(500).json({ message: "Error kicking member" });
        }
    }

    async updateGroup(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const updates = req.body;
            let groups = await this.groupRepository.find({ where: { id } });
            let group = groups[0];
            if (group) {
                this.groupRepository.merge(group, updates);
                await this.groupRepository.save(group);
                return res.json(group);
            }
            return res.status(404).json({ message: "Group not found" });
        } catch (error) {
            return res.status(500).json({ message: "Error updating group" });
        }
    }

    async checkIn(req: Request, res: Response) {
        try {
            const id = req.params.id as string; // groupId
            const { userId } = req.body;
            
            // Find member
            const members = await this.memberRepository.find({ where: { groupId: id, userId } });
            const member = members[0];
            
            if (!member) {
                return res.status(404).json({ message: "Member not found in this group" });
            }

            if (member.hasCheckedInToday) {
                return res.json({ message: "Already checked in", alreadyDone: true, streak: member.streak });
            }

            member.hasCheckedInToday = true;
            member.streak += 1;
            await this.memberRepository.save(member);
            
            return res.json({ message: "Check-in successful", streak: member.streak });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error checking in" });
        }
    }

    async remindMember(req: Request, res: Response) {
        try {
            const groupId = req.params.groupId as string;
            const memberId = req.params.memberId as string; // memberId is the userId of the member being reminded
            const { reminderId } = req.body; // User sending the reminder

            const members = await this.memberRepository.find({ 
                where: { groupId, userId: memberId },
                relations: ["user", "group"]
            });
            const member = members[0];
            
            if (!member) return res.status(404).json({ message: "Member not found" });

            if (member.hasCheckedInToday) {
                 return res.status(400).json({ message: "Member already checked in" });
            }

            // Create Notification
            if (memberId !== reminderId) {
                const reminderUsers = await this.userRepository.find({ where: { id: reminderId } });
                const reminderUser = reminderUsers[0];
                if (reminderUser) {
                    const notification = new Notification();
                    notification.userId = memberId;
                    notification.actorId = reminderId;
                    notification.type = "group_reminder";
                    notification.title = "打卡提醒";
                    notification.content = `${member.group?.name || '陪团'} 的 ${reminderUser.nickname} 提醒你打卡啦！`;
                    notification.relatedId = groupId;
                    await this.notificationRepository.save(notification);
                }
            }

            return res.json({ message: "Reminder sent successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error sending reminder" });
        }
    }

    async likeMember(req: Request, res: Response) {
        try {
            const groupId = req.params.groupId as string;
            const memberId = req.params.memberId as string; // memberId is the userId of the member being liked
            const { likerId } = req.body;

            const members = await this.memberRepository.find({ 
                where: { groupId, userId: memberId },
                relations: ["user", "group"]
            });
            const member = members[0];
            
            if (!member) return res.status(404).json({ message: "Member not found" });

            const likes = member.todayLikes || [];
            if (likes.includes(likerId)) {
                return res.json({ message: "Already liked", liked: true });
            }

            member.todayLikes = [...likes, likerId];
            await this.memberRepository.save(member);

            // Create Notification
            if (memberId !== likerId) {
                const likers = await this.userRepository.find({ where: { id: likerId } });
                const liker = likers[0];
                if (liker) {
                    const notification = new Notification();
                    notification.userId = memberId;
                    notification.actorId = likerId;
                    notification.type = "group_like";
                    notification.title = "收到点赞";
                    notification.content = `${member.group?.name || '陪团'} 的 ${liker.nickname} 给你点赞了`; // As requested
                    notification.relatedId = groupId;
                    await this.notificationRepository.save(notification);
                }
            }

            return res.json({ message: "Liked successfully", liked: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error liking member" });
        }
    }
}
