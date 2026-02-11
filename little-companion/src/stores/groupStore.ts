import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Group, User, Reward } from '../types';
import { useCheckInStore } from './checkInStore';
import { groupApi } from '../api/groupApi';
import { useUserStore } from './userStore';

interface CreateGroupConfig {
    name: string;
    description: string;
    creator: User;
    maxMembers: number;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    rewards?: Reward[];
    timeRestriction?: {
        enabled: boolean;
    };
    supervisor?: {
        enabled: boolean;
        name: string;
        contact: string;
        method: 'sms' | 'app';
        notifyOnCheckIn: boolean;
        notifyOnOverdue: boolean;
    };
}

interface GroupState {
  groups: Group[];
  createGroup: (config: CreateGroupConfig) => Promise<void>;
  joinGroup: (code: string, user: User) => Promise<{ success: boolean; code?: string; message?: string }>;
  leaveGroup: (groupId: string, userId: string) => void;
  dissolveGroup: (groupId: string) => void;
  kickMember: (groupId: string, memberId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  checkInGroup: (groupId: string) => Promise<void>;
  likeMember: (groupId: string, memberId: string) => Promise<void>;
  remindMember: (groupId: string, memberId: string) => Promise<void>;
  refreshInviteCode: (groupId: string) => void;
  syncWithBackend: () => Promise<void>;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: [],
      
      createGroup: async (config) => {
        const user = useUserStore.getState().user;
        if (!user || !user.phone) {
             throw new Error("请先登录");
        }

        const streak = useCheckInStore.getState().getStreak();
        // Prepare payload without ID (let backend generate it)
        // But we need to structure it as a Group object minus ID for the API?
        // Actually the API expects Partial<Group> & { userId }.
        
        // We construct the "Member" part on backend? 
        // No, backend GroupController.ts says:
        // const { userId, ...groupData } = req.body;
        // group.id = groupData.id || ...
        // It also creates the leader member automatically.
        
        // So we just send the group metadata.
        
        const newGroupPayload: Partial<Group> = {
            name: config.name,
            description: config.description,
            leaderId: config.creator.id,
            // members: [], // Backend handles leader creation
            createTime: Date.now(),
            inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(), // We can still suggest one or let backend do it. Backend uses what we send.
            inviteExpires: Date.now() + 24 * 60 * 60 * 1000,
            maxMembers: config.maxMembers,
            status: 'active',
            startDate: config.startDate,
            endDate: config.endDate,
            startTime: config.startTime,
            endTime: config.endTime,
            rewards: config.rewards,
            timeRestriction: config.timeRestriction,
            supervisor: config.supervisor
        };

        try {
             const savedGroup = await groupApi.createGroup({ ...newGroupPayload, userId: user.id });
             
             if (savedGroup && savedGroup.id) {
                 // If backend returns members, use them. Otherwise, manually add leader.
                 let groupWithMember: Group;
                 
                 if (savedGroup.members && savedGroup.members.length > 0) {
                      groupWithMember = savedGroup as Group;
                 } else {
                      const leaderMember = { ...config.creator, hasCheckedInToday: false, streak };
                      groupWithMember = { ...savedGroup, members: [leaderMember] } as Group;
                 }

                 set((state) => ({
                     groups: [groupWithMember, ...state.groups]
                 }));
                 
                 // Ensure list reflects server state immediately
                 await get().syncWithBackend();
             } else {
                 throw new Error("服务器返回数据异常");
             }
        } catch (e: any) {
             console.error("Failed to create group on server", e);
             throw new Error(e.response?.data?.message || "创建失败，请检查网络");
        }
      },

      joinGroup: async (codeOrToken, user) => {
        const currentStreak = useCheckInStore.getState().getStreak();
        
        try {
            const result = await groupApi.joinGroup(user.id, codeOrToken);
            if (result && result.groupId) {
                await get().syncWithBackend();
                return { success: true, code: 'joined' };
            }
        } catch (e: any) {
            if (e.response?.data?.message?.includes('already')) {
                return { success: true, code: 'already_joined', message: '已在陪团中' };
            }
        }
        return { success: false, code: 'invalid', message: '邀请码无效' };
      },

      leaveGroup: async (groupId, userId) => {
        set((state) => ({
          groups: state.groups.map(g => 
            g.id === groupId
            ? { ...g, members: g.members.filter(m => m.id !== userId) }
            : g
          ).filter(g => g.members.length > 0)
        }));
        
        try {
            await groupApi.leaveGroup(groupId, userId);
        } catch (e) {
            console.error("Failed to leave group on server", e);
        }
      },

      dissolveGroup: async (groupId) => {
        set((state) => ({
          groups: state.groups.map(g => 
            g.id === groupId
            ? { ...g, status: 'dissolved', dissolvedAt: Date.now() }
            : g
          )
        }));
        
        try {
            await groupApi.dissolveGroup(groupId);
        } catch (e) {
            console.error("Failed to dissolve group on server", e);
        }
      },

      kickMember: async (groupId, memberId) => {
        set((state) => ({
          groups: state.groups.map(g => 
            g.id === groupId
            ? { ...g, members: g.members.filter(m => m.id !== memberId) }
            : g
          )
        }));
        
        try {
            await groupApi.kickMember(groupId, memberId);
        } catch (e) {
            console.error("Failed to kick member on server", e);
        }
      },

      updateGroup: async (groupId, updates) => {
        set((state) => ({
          groups: state.groups.map(g => 
            g.id === groupId
            ? { ...g, ...updates }
            : g
          )
        }));
        
        try {
            await groupApi.updateGroup(groupId, updates);
        } catch (e) {
            console.error("Failed to update group on server", e);
        }
      },

      checkInGroup: async (groupId) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        // Optimistic update
        set((state) => ({
            groups: state.groups.map(g => {
                if (g.id === groupId) {
                    return {
                        ...g,
                        members: g.members.map(m => {
                            if (m.id === user.id) {
                                return {
                                    ...m,
                                    hasCheckedInToday: true,
                                    streak: (m.streak || 0) + 1
                                };
                            }
                            return m;
                        })
                    };
                }
                return g;
            })
        }));

        try {
            await groupApi.checkInGroup(groupId, user.id);
            // Optionally sync with backend to get exact state
            // await get().syncWithBackend(); 
        } catch (e) {
            console.error("Failed to check in group on server", e);
            // Revert on failure? For now, let's assume success or user will retry.
            // A toast in UI would be better handled by the caller or a global error handler.
        }
      },

      likeMember: async (groupId, memberId) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        // Optimistic update
        set((state) => ({
            groups: state.groups.map(g => {
                if (g.id === groupId) {
                    return {
                        ...g,
                        members: g.members.map(m => {
                            if (m.id === memberId) {
                                const likes = m.todayLikes || [];
                                if (!likes.includes(user.id)) {
                                    return {
                                        ...m,
                                        todayLikes: [...likes, user.id]
                                    };
                                }
                            }
                            return m;
                        })
                    };
                }
                return g;
            })
        }));

        try {
            await groupApi.likeMember(groupId, memberId, user.id);
        } catch (e) {
            console.error("Failed to like member on server", e);
        }
      },

      remindMember: async (groupId, memberId) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        try {
            await groupApi.remindMember(groupId, memberId, user.id);
        } catch (e) {
            console.error("Failed to remind member on server", e);
            throw e; // Propagate error to UI to show toast
        }
      },

      refreshInviteCode: (groupId) => {
        set((state) => ({
          groups: state.groups.map(g => 
            g.id === groupId
            ? { 
                ...g, 
                inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                inviteExpires: Date.now() + 24 * 60 * 60 * 1000
              }
            : g
          )
        }));
      },

      // Removed simulation helpers
      
      syncWithBackend: async () => {
          const user = useUserStore.getState().user;
          if (user && user.phone) {
              try {
                  const groups = await groupApi.getGroups(user.id);
                  if (groups && Array.isArray(groups)) {
                      // MERGE STRATEGY: 
                      // Backend is source of truth. Replace local groups with backend groups.
                      set({ groups: groups });
                  }
              } catch (e) {
                  console.error("Failed to fetch groups", e);
              }
          }
      }
    }),
    {
      name: 'group-storage',
    }
  )
);
