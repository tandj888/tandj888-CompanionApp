import api from './client';
import { Group } from '../types';

export const groupApi = {
    createGroup: async (group: Partial<Group> & { userId: string }) => {
        const response = await api.post<Group>('/groups', group);
        return response.data;
    },

    getGroups: async (userId: string) => {
        const response = await api.get<Group[]>('/groups', { params: { userId } });
        return response.data;
    },

    joinGroup: async (userId: string, inviteCode: string) => {
        const response = await api.post<{ message: string; groupId: string }>('/groups/join', { userId, inviteCode });
        return response.data;
    },

    syncGroup: async (group: Partial<Group> & { userId: string }) => {
        const response = await api.post<Group>('/groups/sync', group);
        return response.data;
    },

    leaveGroup: async (groupId: string, userId: string) => {
        const response = await api.post<{ message: string }>('/groups/leave', { groupId, userId });
        return response.data;
    },

    dissolveGroup: async (groupId: string) => {
        const response = await api.post<{ message: string }>('/groups/dissolve', { groupId });
        return response.data;
    },

    kickMember: async (groupId: string, memberId: string) => {
        const response = await api.post<{ message: string }>('/groups/kick', { groupId, memberId });
        return response.data;
    },

    updateGroup: async (groupId: string, updates: Partial<Group>) => {
        const response = await api.put<Group>(`/groups/${groupId}`, updates);
        return response.data;
    },
};
