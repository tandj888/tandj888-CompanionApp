import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Group, User } from '../types';

interface GroupState {
  group: Group | null;
  createGroup: (name: string, description: string, creator: User) => void;
  joinGroup: (code: string, user: User) => void;
  leaveGroup: (userId: string) => void;
  addMember: (user: User) => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      group: null,
      createGroup: (name, description, creator) =>
        set({
          group: {
            id: 'group-' + Date.now(),
            name,
            description,
            leaderId: creator.id,
            members: [{ ...creator, hasCheckedInToday: false }],
            createTime: Date.now(),
            inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          },
        }),
      joinGroup: (code, user) => {
        // Mock join logic - simulates joining a predefined group
        set({
            group: {
              id: 'group-joined-' + Date.now(),
              name: '快乐打卡小分队',
              description: '一起坚持，互相鼓励！',
              leaderId: 'leader-mock',
              members: [
                { 
                  id: 'user-mock-1', 
                  nickname: '早起鸟', 
                  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bird',
                  level: 2, stars: 10, unlockedBadges: [], settings: { anonymousLikes: true },
                  hasCheckedInToday: true 
                },
                { ...user, hasCheckedInToday: false }
              ],
              createTime: Date.now(),
              inviteCode: code
            }
          });
      },
      leaveGroup: (userId) => set({ group: null }),
      addMember: (user) =>
        set((state) => ({
          group: state.group
            ? {
                ...state.group,
                members: [...state.group.members, { ...user, hasCheckedInToday: false }],
              }
            : null,
        })),
    }),
    {
      name: 'group-storage',
    }
  )
);
