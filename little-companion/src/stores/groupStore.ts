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
  refreshInviteCode: (groupId: string) => void;
  syncUserCheckIn: (groupId: string, userId: string, hasCheckedIn: boolean) => void;
  simulateMemberJoin: (groupId: string) => void;
  getGroupShareToken: (groupId: string) => string;
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

      getGroupShareToken: (groupId) => {
        const group = get().groups.find(g => g.id === groupId);
        if (!group) return '';
        try {
            const data = JSON.stringify(group);
            return btoa(unescape(encodeURIComponent(data)));
        } catch (e) {
            console.error('Token generation failed', e);
            return '';
        }
      },

      joinGroup: async (codeOrToken, user) => {
        const currentStreak = useCheckInStore.getState().getStreak();
        
        // 1. Try backend join first if it's a short code
        if (codeOrToken.length <= 10 && user.phone) {
             try {
                 const result = await groupApi.joinGroup(user.id, codeOrToken);
                 if (result && result.groupId) {
                     // Fetch groups to update local state
                     await get().syncWithBackend();
                     
                     // FORCE UPDATE: Ensure I am in the member list of the joined group locally
                     // This handles cases where backend getGroups returns the group but members list is stale/cached
                     // or if syncWithBackend failed but we want to show optimistic success (though without group data we can't do much)
                     
                     const groupExists = get().groups.find(g => g.id === result.groupId);
                     
                     if (groupExists) {
                         set(state => ({
                             groups: state.groups.map(g => {
                                 if (g.id === result.groupId) {
                                     const isMember = g.members.some(m => m.id === user.id);
                                     if (!isMember) {
                                         return {
                                             ...g,
                                             members: [...g.members, { ...user, hasCheckedInToday: false, streak: currentStreak }]
                                         };
                                     }
                                 }
                                 return g;
                             })
                         }));
                     } else {
                         // If sync didn't get the group (e.g. latency), we might want to trigger another sync or warn.
                         // But since we don't have the group data, we can't add it locally.
                         // We will rely on the user refreshing or the next sync.
                         // To help the user, we can try one more sync after a short delay?
                         setTimeout(() => get().syncWithBackend(), 1000);
                     }
                     
                     return { success: true, code: 'joined' };
                 }
             } catch (e: any) {
                 console.log("Backend join failed, falling back to local/token logic", e);
                 // If backend explicitly says "already member", handle it
                 if (e.response?.data?.message?.includes('already')) {
                     return { success: true, code: 'already_joined', message: '已在陪团中' };
                 }
             }
        }

        // 2. Try to decode as Cross-Device Token (Legacy/Offline Support)
        try {
            if (codeOrToken.length > 20) {
                const jsonStr = decodeURIComponent(escape(atob(codeOrToken)));
                const groupData = JSON.parse(jsonStr) as Group;
                
                if (groupData && groupData.id && groupData.name) {
                    const existingLocal = get().groups.find(g => g.id === groupData.id);
                    
                    if (existingLocal) {
                        if (existingLocal.members.some(m => m.id === user.id)) {
                             return { success: true, code: 'already_joined', message: '已在陪团中' };
                        }
                        
                        set((state) => ({
                            groups: state.groups.map(g => 
                                g.id === groupData.id 
                                ? { ...g, members: [...g.members, { ...user, hasCheckedInToday: false, streak: currentStreak }] }
                                : g
                            )
                        }));
                        
                        // Sync join to backend if possible
                        if (user.phone) {
                             // We might need a separate API or just sync the group state
                             // For now, assume syncWithBackend handles it on next load or explicit call
                             groupApi.syncGroup({ ...groupData, userId: user.id }).catch(console.error);
                        }
                        
                        return { success: true, code: 'joined' };
                    } else {
                        // New Group from Token
                        const joinedGroup = { ...groupData, members: [...groupData.members, { ...user, hasCheckedInToday: false, streak: currentStreak }] };
                        set((state) => ({
                            groups: [...state.groups, joinedGroup]
                        }));
                        
                         if (user.phone) {
                             groupApi.syncGroup({ ...joinedGroup, userId: user.id }).catch(console.error);
                        }
                        return { success: true, code: 'joined' };
                    }
                }
            }
        } catch (e) {
            // Not a token, continue to local code match
        }

        // 3. Local match (for offline testing or same device)
        const targetGroup = get().groups.find(g => g.inviteCode === codeOrToken && g.status === 'active');
        if (targetGroup) {
          if (targetGroup.members.some(m => m.id === user.id)) {
               return { success: true, code: 'already_joined', message: '已在陪团中' };
          }
          if (targetGroup.members.length >= targetGroup.maxMembers) {
               return { success: false, code: 'full', message: '陪团人数已满' };
          }
          
          set((state) => ({
            groups: state.groups.map(g => 
              g.id === targetGroup.id 
              ? { ...g, members: [...g.members, { ...user, hasCheckedInToday: false, streak: currentStreak }] }
              : g
            )
          }));
          return { success: true, code: 'joined' };
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

      syncUserCheckIn: (groupId, userId, hasCheckedIn) => {
        set((state) => ({
          groups: state.groups.map(g => 
            g.id === groupId
            ? {
                ...g,
                members: g.members.map(m => 
                  m.id === userId
                  ? { ...m, hasCheckedInToday: hasCheckedIn, streak: hasCheckedIn ? m.streak + 1 : m.streak }
                  : m
                )
              }
            : g
          )
        }));
      },

      simulateMemberJoin: (groupId) => {
          const names = ["Alex", "Sam", "Jordan", "Taylor", "Morgan"];
          const randomName = names[Math.floor(Math.random() * names.length)];
          const newMember: User = {
              id: 'user-' + Math.random().toString(36).substr(2, 9),
              nickname: randomName,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomName}`,
              level: 1,
              stars: 0,
              role: 'user',
              unlockedBadges: [],
              settings: { anonymousLikes: true }
          };
          
          set((state) => ({
              groups: state.groups.map(g => 
                  g.id === groupId
                  ? { ...g, members: [...g.members, { ...newMember, hasCheckedInToday: false, streak: 0 }] }
                  : g
              )
          }));
      },
      
      syncWithBackend: async () => {
          const user = useUserStore.getState().user;
          if (user && user.phone) {
              try {
                  const groups = await groupApi.getGroups(user.id);
                  if (groups && Array.isArray(groups)) {
                      // MERGE STRATEGY: 
                      // 1. Keep local groups that are NOT in backend (offline created)
                      // 2. Update/Add groups from backend
                      // 3. DO NOT delete local groups just because backend didn't return them (unless we are sure)
                      // But for now, let's just merge by ID.
                      
                      set((state) => {
                          const backendGroupIds = new Set(groups.map(g => g.id));
                          const localUnique = state.groups.filter(g => !backendGroupIds.has(g.id));
                          return { groups: [...localUnique, ...groups] };
                      });
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
