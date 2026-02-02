import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { userApi } from '../api/userApi';
import { useGoalStore } from './goalStore';
import { useCheckInStore } from './checkInStore';
import { useGroupStore } from './groupStore';
import { useMicroRecordStore } from './microRecordStore';
import { useGiftStore } from './giftStore';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  login: (userInfo: Partial<User> & { password?: string, phone?: string }) => Promise<void>; // Updated signature
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>; // Updated signature
  addStars: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      login: async (userInfo) => {
        try {
            // Check if we have phone and password for real login
            if (userInfo.phone && userInfo.password) {
                const user = await userApi.login(userInfo.phone, userInfo.password);
                set({ user, isLoggedIn: true });
                
                // Sync other stores
                try {
                    await Promise.all([
                        useGoalStore.getState().syncWithBackend(),
                        useCheckInStore.getState().syncWithBackend(),
                        useGroupStore.getState().syncWithBackend(),
                        useMicroRecordStore.getState().fetchRecords(),
                        useGiftStore.getState().syncWithBackend()
                    ]);
                } catch (error) {
                    console.error("Error syncing data after login", error);
                }
            } else if (userInfo.phone && userInfo.password === undefined) {
                 // Fallback for mock login or incomplete data? 
                 // For now, if no password provided, we assume it's a mock login or registration flow handled elsewhere
                 // But strictly speaking, we should force API usage.
                 // Let's assume for now, if "password" is provided, we call API.
                 console.warn("Login called without password, falling back to local mock state if applicable");
                 set({
                    user: {
                      id: 'user-' + Date.now(),
                      nickname: '微信用户',
                      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                      level: 1,
                      stars: 0,
                      role: 'user',
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
                  });
            } else {
                 // Original Mock Logic
                 set({
                    user: {
                      id: 'user-' + Date.now(),
                      nickname: '微信用户',
                      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                      level: 1,
                      stars: 0,
                      role: 'user',
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
                  });
            }
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
      },
      logout: () => set({ user: null, isLoggedIn: false }),
      updateUser: async (updates) => {
          const { user } = get();
          if (user) {
              // Optimistic update
              set({ user: { ...user, ...updates } });
              // Sync with backend
              try {
                  await userApi.updateProfile(user.id, updates);
              } catch (e) {
                  console.error("Failed to sync user update", e);
                  // Optionally revert?
              }
          }
      },
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
