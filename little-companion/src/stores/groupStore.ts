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
}

interface GroupState {
  groups: Group[];
  createGroup: (config: CreateGroupConfig) => Promise<void>;
  joinGroup: (code: string, user: User) => Promise<boolean>;
  leaveGroup: (groupId: string, userId: string) => void;
  dissolveGroup: (groupId: string) => void;
  kickMember: (groupId: string, memberId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  refreshInviteCode: (groupId: string) => void;
  syncUserCheckIn: (userId: string, hasCheckedIn: boolean) => void;
  simulateMemberJoin: (groupId: string) => void;
  getGroupShareToken: (groupId: string) => string;
  syncWithBackend: () => Promise<void>;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: [],
      
      createGroup: async (config) => {
        const streak = useCheckInStore.getState().getStreak();
        const newGroup: Group = {
            id: 'group-' + Date.now(),
            name: config.name,
            description: config.description,
            leaderId: config.creator.id,
            members: [{ ...config.creator, hasCheckedInToday: false, streak }],
            createTime: Date.now(),
            inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            inviteExpires: Date.now() + 24 * 60 * 60 * 1000,
            maxMembers: config.maxMembers,
            status: 'active',
            startDate: config.startDate,
            endDate: config.endDate,
            startTime: config.startTime,
            endTime: config.endTime,
            rewards: config.rewards
        };
        
        set((state) => ({
          groups: [newGroup, ...state.groups]
        }));

        const user = useUserStore.getState().user;
        if (user && user.phone) {
             try {
                 const savedGroup = await groupApi.createGroup({ ...newGroup, userId: user.id });
                 set((state) => ({
                     groups: state.groups.map(g => g.id === newGroup.id ? savedGroup : g)
                 }));
             } catch (e) {
                 console.error("Failed to create group on server", e);
             }
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
                     return true;
                 }
             } catch (e) {
                 console.log("Backend join failed, falling back to local/token logic", e);
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
                        if (existingLocal.members.some(m => m.id === user.id)) return false;
                        
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
                        
                        return true;
                    } else {
                        // New Group from Token
                        const joinedGroup = { ...groupData, members: [...groupData.members, { ...user, hasCheckedInToday: false, streak: currentStreak }] };
                        set((state) => ({
                            groups: [...state.groups, joinedGroup]
                        }));
                        
                         if (user.phone) {
                             groupApi.syncGroup({ ...joinedGroup, userId: user.id }).catch(console.error);
                        }
                        return true;
                    }
                }
            }
        } catch (e) {
            // Not a token, continue to local code match
        }

        // 3. Local match (for offline testing or same device)
        const targetGroup = get().groups.find(g => g.inviteCode === codeOrToken && g.status === 'active');
        if (targetGroup) {
          if (targetGroup.members.some(m => m.id === user.id)) return false;
          if (targetGroup.members.length >= targetGroup.maxMembers) return false;
          
          set((state) => ({
            groups: state.groups.map(g => 
              g.id === targetGroup.id 
              ? { ...g, members: [...g.members, { ...user, hasCheckedInToday: false, streak: currentStreak }] }
              : g
            )
          }));
          return true;
        }

        return false;
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

      syncUserCheckIn: (userId, hasCheckedIn) => {
        set((state) => ({
          groups: state.groups.map(g => ({
            ...g,
            members: g.members.map(m => 
              m.id === userId
              ? { ...m, hasCheckedInToday: hasCheckedIn, streak: hasCheckedIn ? m.streak + 1 : m.streak }
              : m
            )
          }))
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
                  if (groups) {
                      set({ groups });
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
