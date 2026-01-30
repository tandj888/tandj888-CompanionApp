import api from './client';
import { CheckIn } from '../types';

export const checkInApi = {
    createCheckIn: async (checkIn: Partial<CheckIn>) => {
        const response = await api.post<CheckIn>('/checkins', checkIn);
        return response.data;
    },

    getCheckIns: async (params: { userId?: string; goalId?: string; date?: string }) => {
        const response = await api.get<CheckIn[]>('/checkins', { params });
        return response.data;
    },

    syncCheckIns: async (checkIns: CheckIn[]) => {
        const response = await api.post<CheckIn[]>('/checkins/sync', checkIns);
        return response.data;
    },

    updateCheckIn: async (checkInId: string, updates: Partial<CheckIn>) => {
        const response = await api.put<CheckIn>(`/checkins/${checkInId}`, updates);
        return response.data;
    }
};
