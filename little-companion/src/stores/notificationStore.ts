import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification } from '../types';
import { notificationApi } from '../api/notificationApi';
import { useUserStore } from './userStore';

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      isLoading: false,
      fetchNotifications: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        set({ isLoading: true });
        try {
          const notifications = await notificationApi.getNotifications(user.id);
          set({ notifications });
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      markAsRead: async (id: string) => {
        try {
          await notificationApi.markAsRead(id);
          set((state) => ({
            notifications: state.notifications.map((n) => 
              n.id === id ? { ...n, read: true } : n
            ),
          }));
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
        }
      },
      markAllRead: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        try {
          await notificationApi.markAllAsRead(user.id);
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
          }));
        } catch (error) {
          console.error('Failed to mark all notifications as read:', error);
        }
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);
