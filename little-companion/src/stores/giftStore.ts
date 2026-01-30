import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Gift, RedemptionRecord } from '../types';
import { useUserStore } from './userStore';

interface GiftState {
  gifts: Gift[];
  redemptions: RedemptionRecord[];
  addGift: (gift: Omit<Gift, 'id'>) => void;
  updateGift: (id: string, updates: Partial<Gift>) => void;
  removeGift: (id: string) => void;
  redeemGift: (userId: string, giftId: string) => { success: boolean; message: string };
}

export const useGiftStore = create<GiftState>()(
  persist(
    (set, get) => ({
      gifts: [
        // Streak Rewards (Legacy)
        { id: 'gift-1', name: '限定发夹', requiredDays: 7, image: '🎀', description: '坚持7天打卡领取', type: 'streak', category: 'physical', stock: 10 },
        { id: 'gift-2', name: '萌宠玩偶', requiredDays: 30, image: '🧸', description: '坚持30天打卡领取', type: 'streak', category: 'physical', stock: 5 },
        
        // Star Rewards (New)
        { id: 'gift-star-1', name: '补签卡', cost: 50, image: '🎟️', description: '可补签一次任意目标', type: 'star', category: 'virtual', stock: 999 },
        { id: 'gift-star-2', name: '星巴克咖啡', cost: 500, image: '☕', description: '中杯拿铁电子兑换券', type: 'star', category: 'coupon', stock: 20 },
        { id: 'gift-star-3', name: '一个月会员', cost: 1000, image: '👑', description: '解锁所有高级统计功能', type: 'star', category: 'virtual', stock: 999 },
        { id: 'gift-star-4', name: '神秘盲盒', cost: 300, image: '🎁', description: '随机开出10-1000陪伴星', type: 'star', category: 'virtual', stock: 50 },
      ],
      redemptions: [],
      addGift: (gift) =>
        set((state) => ({
          gifts: [
            ...state.gifts,
            { ...gift, id: 'gift-' + Date.now() }
          ]
        })),
      updateGift: (id, updates) =>
        set((state) => ({
          gifts: state.gifts.map(g => g.id === id ? { ...g, ...updates } : g)
        })),
      removeGift: (id) =>
        set((state) => ({
          gifts: state.gifts.filter(g => g.id !== id)
        })),
      redeemGift: (userId, giftId) => {
        const { gifts, redemptions } = get();
        const gift = gifts.find(g => g.id === giftId);
        
        if (!gift) return { success: false, message: '礼品不存在' };
        if (gift.stock !== undefined && gift.stock <= 0) return { success: false, message: '库存不足' };

        // Handle Star Cost
        if (gift.type === 'star' && gift.cost) {
             const userStore = useUserStore.getState();
             if (userStore.user && userStore.user.stars < gift.cost) {
                 return { success: false, message: '陪伴星不足' };
             }
             // Deduct stars
             // Note: userStore needs a method to deduct stars or set stars. 
             // Currently it has addStars. I might need to add deductStars or allow negative add.
             userStore.addStars(-gift.cost);
        }

        // Add Redemption Record
        const newRedemption: RedemptionRecord = {
            id: 'redeem-' + Date.now(),
            userId,
            giftId,
            giftName: gift.name,
            cost: gift.cost || 0,
            timestamp: Date.now(),
            status: 'pending'
        };

        set((state) => ({
            redemptions: [newRedemption, ...state.redemptions],
            gifts: state.gifts.map(g => 
                g.id === giftId && g.stock !== undefined 
                ? { ...g, stock: g.stock - 1 } 
                : g
            )
        }));

        return { success: true, message: '兑换成功' };
      }
    }),
    {
      name: 'gift-storage',
    }
  )
);
