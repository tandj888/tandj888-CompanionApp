import client from './client';
import { Notification } from '../types';

export const notificationApi = {
  getNotifications: async (userId: string) => {
    const response = await client.get<Notification[]>(`/notifications/${userId}`);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await client.put<{ success: boolean }>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (userId: string) => {
    const response = await client.put<{ success: boolean }>(`/notifications/read-all`, { userId });
    return response.data;
  },
};
