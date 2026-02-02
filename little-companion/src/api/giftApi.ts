import api from './client';
import { Gift, RedemptionRecord } from '../types';

export const giftApi = {
    getGifts: async () => {
        const response = await api.get<Gift[]>('/gifts');
        return response.data;
    },

    createGift: async (gift: Partial<Gift>) => {
        const response = await api.post<Gift>('/gifts', gift);
        return response.data;
    },

    redeemGift: async (userId: string, giftId: string) => {
        const response = await api.post<{ success: boolean, record: RedemptionRecord, remainingStars: number, message?: string }>('/gifts/redeem', { userId, giftId });
        return response.data;
    },

    getRedemptions: async (userId: string) => {
        const response = await api.get<RedemptionRecord[]>('/redemptions', {
            params: { userId }
        });
        return response.data;
    },

    deleteGift: async (id: string) => {
        const response = await api.delete(`/gifts/${id}`);
        return response.data;
    }
};
