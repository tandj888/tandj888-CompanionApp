import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  login: (userInfo: Partial<User>) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addStars: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      login: (userInfo) =>
        set((state) => ({
          user: {
            id: 'user-' + Date.now(),
            nickname: '微信用户',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            level: 1,
            stars: 0,
            role: 'user', // Default role
            unlockedBadges: [],
            settings: { 
              anonymousLikes: true,
              reminder: {
                enabled: false,
                startTime: '09:00',
                interval: 60,
                lastReminded: 0
              },
              supervisor: {
                enabled: false,
                name: '',
                contact: '',
                method: 'app'
              }
            },
            ...userInfo,
          } as User,
          isLoggedIn: true,
        })),
      logout: () => set({ user: null, isLoggedIn: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      addStars: (amount) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, stars: state.user.stars + amount }
            : null,
        })),
      unlockBadge: (badgeId) =>
        set((state) => ({
          user: state.user && !state.user.unlockedBadges.includes(badgeId)
            ? { ...state.user, unlockedBadges: [...state.user.unlockedBadges, badgeId] }
            : state.user,
        })),
    }),
    {
      name: 'user-storage',
    }
  )
);
