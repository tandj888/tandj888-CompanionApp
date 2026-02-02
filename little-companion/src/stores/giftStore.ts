import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Gift, RedemptionRecord } from '../types';
import { giftApi } from '../api/giftApi';
import { useUserStore } from './userStore';

interface GiftState {
  gifts: Gift[];
  redemptions: RedemptionRecord[];
  fetchGifts: () => Promise<void>;
  fetchRedemptions: () => Promise<void>;
  addGift: (gift: Omit<Gift, 'id'>) => Promise<void>;
  redeemGift: (userId: string, giftId: string) => Promise<{ success: boolean; message: string }>;
  syncWithBackend: () => Promise<void>;
}

export const useGiftStore = create<GiftState>()(
  persist(
    (set, get) => ({
      gifts: [],
      redemptions: [],
      
      fetchGifts: async () => {
          try {
              const gifts = await giftApi.getGifts();
              set({ gifts });
          } catch (error) {
              console.error("Failed to fetch gifts", error);
          }
      },

      fetchRedemptions: async () => {
          const user = useUserStore.getState().user;
          if (!user) return;
          try {
              const redemptions = await giftApi.getRedemptions(user.id);
              set({ redemptions });
          } catch (error) {
              console.error("Failed to fetch redemptions", error);
          }
      },

      addGift: async (giftData) => {
          try {
              const newGift = await giftApi.createGift(giftData);
              set((state) => ({
                  gifts: [...state.gifts, newGift]
              }));
          } catch (error) {
              console.error("Failed to create gift", error);
          }
      },

      removeGift: async (id) => {
          try {
              await giftApi.deleteGift(id);
              set((state) => ({
                  gifts: state.gifts.filter(g => g.id !== id)
              }));
          } catch (error) {
              console.error("Failed to delete gift", error);
          }
      },

      redeemGift: async (userId, giftId) => {
        try {
            const result = await giftApi.redeemGift(userId, giftId);
            if (result.success) {
                // Update local state
                set((state) => ({
                    redemptions: [result.record, ...state.redemptions],
                    gifts: state.gifts.map(g => 
                        g.id === giftId && g.stock !== undefined 
                        ? { ...g, stock: g.stock - 1 } 
                        : g
                    )
                }));
                
                // Update user stars
                if (result.remainingStars !== undefined) {
                     useUserStore.getState().updateUser({ stars: result.remainingStars });
                }
                
                return { success: true, message: '兑换成功' };
            } else {
                return { success: false, message: result.message || '兑换失败' };
            }
        } catch (error: any) {
            console.error("Redemption failed", error);
            return { success: false, message: error.response?.data?.message || '兑换失败' };
        }
      },

      syncWithBackend: async () => {
          await Promise.all([
              get().fetchGifts(),
              get().fetchRedemptions()
          ]);
      }
    }),
    {
      name: 'gift-storage',
    }
  )
);
