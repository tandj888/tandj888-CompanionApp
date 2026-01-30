import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Group } from "../entity/Group";
import { GroupMember } from "../entity/GroupMember";
import { User } from "../entity/User";

export class GroupController {
    private groupRepository = AppDataSource.getRepository(Group);
    private memberRepository = AppDataSource.getRepository(GroupMember);
    private userRepository = AppDataSource.getRepository(User);

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
            
            const fullGroups = await Promise.all(groups.map(async (g) => {
                 const members = await this.memberRepository.find({
                     where: { groupId: g.id },
                     relations: ["user"]
                 });
                 // Transform to match frontend GroupMember interface
                 const groupMembers = members.map(m => ({
                     ...m.user, // User fields
                     ...m,      // Member fields (streak, etc.)
                     // Avoid circular ref or duplicate fields if any
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
            const group = await this.groupRepository.findOne({ where: { id: groupId } });
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
            const member = await this.memberRepository.findOne({ where: { groupId, userId: memberId } });
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
            const { id } = req.params;
            const updates = req.body;
            let groups = await this.groupRepository.find({ where: { id: id as string } });
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
}
