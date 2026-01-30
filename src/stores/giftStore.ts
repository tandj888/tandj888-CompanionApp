import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Gift } from '../types';

interface GiftState {
  gifts: Gift[];
  addGift: (name: string, requiredDays: number, image: string, description: string) => void;
  updateGift: (id: string, updates: Partial<Gift>) => void;
  removeGift: (id: string) => void;
}

export const useGiftStore = create<GiftState>()(
  persist(
    (set) => ({
      gifts: [
        { id: 'gift-1', name: '限定发夹', requiredDays: 7, image: '🎀', description: '坚持7天打卡领取' },
        { id: 'gift-2', name: '萌宠玩偶', requiredDays: 30, image: '🧸', description: '坚持30天打卡领取' },
        { id: 'gift-3', name: '智能手机', requiredDays: 100, image: '📱', description: '坚持100天打卡领取' },
      ],
      addGift: (name, requiredDays, image, description) =>
        set((state) => ({
          gifts: [
            ...state.gifts,
            { id: 'gift-' + Date.now(), name, requiredDays, image, description }
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
    }),
    {
      name: 'gift-storage',
    }
  )
);
