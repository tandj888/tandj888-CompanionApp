import api from './client';
import { MicroRecord } from '../types';

export const microRecordApi = {
    createRecord: async (record: Partial<MicroRecord> & { userId: string, goalId?: string, checkInId?: string }) => {
        const response = await api.post<MicroRecord>('/micro-records', record);
        return response.data;
    },

    getRecords: async (userId: string, goalId?: string) => {
        const response = await api.get<MicroRecord[]>('/micro-records', {
            params: { userId, goalId }
        });
        return response.data;
    },

    deleteRecord: async (id: string) => {
        const response = await api.delete(`/micro-records/${id}`);
        return response.data;
    }
};
