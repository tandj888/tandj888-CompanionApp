import api from './client';
import { Goal } from '../types';

export const goalApi = {
    createGoal: async (goal: Partial<Goal>) => {
        const response = await api.post<Goal>('/goals', goal);
        return response.data;
    },

    getGoals: async (userId: string) => {
        const response = await api.get<Goal[]>('/goals', { params: { userId } });
        return response.data;
    },

    updateGoal: async (id: string, updates: Partial<Goal>) => {
        const response = await api.put<Goal>(`/goals/${id}`, updates);
        return response.data;
    },

    deleteGoal: async (id: string) => {
        const response = await api.delete(`/goals/${id}`);
        return response.data;
    }
};
