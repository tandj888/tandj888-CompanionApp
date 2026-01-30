import api from './client';
import { User } from '../types';

export const userApi = {
    register: async (phone: string, password: string, nickname?: string) => {
        const response = await api.post<User>('/auth/register', { phone, password, nickname });
        return response.data;
    },

    login: async (phone: string, password: string) => {
        const response = await api.post<User>('/auth/login', { phone, password });
        return response.data;
    },

    getProfile: async (id: string) => {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    updateProfile: async (id: string, updates: Partial<User>) => {
        const response = await api.put<User>(`/users/${id}`, updates);
        return response.data;
    }
};
