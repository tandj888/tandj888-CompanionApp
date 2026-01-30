import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CheckIn, MicroRecord } from '../types';
import { format } from 'date-fns';

interface CheckInState {
  checkIns: CheckIn[];
  checkIn: (goalId: string, record?: MicroRecord) => void;
  getTodayCheckIn: () => CheckIn | undefined;
  addRecordToToday: (text: string, image?: string) => void;
  getStreak: () => number;
}

const ANONYMOUS_MESSAGES = [
  "你好棒！继续加油呀～",
  "微小的坚持，终将成就更好的你✨",
  "今天也做到啦，太厉害啦！",
  "陪伴你的第N天，一起变得更好～",
  "不慌不忙，慢慢成长，你超优秀！",
  "今天的你也闪闪发光呢！",
  "坚持就是胜利，为你点赞！",
];

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      checkIns: [],
      checkIn: (goalId, record) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const existing = get().checkIns.find((c) => c.date === today);
        if (existing) return;

        // Randomly assign anonymous like (50% chance or always? Requirement says "System randomly distributes")
        const hasAnonymousLike = Math.random() > 0.3; // 70% chance
        const anonymousLike = hasAnonymousLike 
          ? ANONYMOUS_MESSAGES[Math.floor(Math.random() * ANONYMOUS_MESSAGES.length)]
          : undefined;

        const newCheckIn: CheckIn = {
          id: 'checkin-' + Date.now(),
          date: today,
          goalId,
          status: 'completed',
          record,
          starsEarned: 1,
          likes: [],
          anonymousLike,
          timestamp: Date.now(),
        };

        set((state) => ({ checkIns: [newCheckIn, ...state.checkIns] }));
      },
      getTodayCheckIn: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return get().checkIns.find((c) => c.date === today);
      },
      addRecordToToday: (text, image) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        set((state) => ({
          checkIns: state.checkIns.map((c) => {
            if (c.date === today) {
              return {
                ...c,
                record: {
                  id: 'record-' + Date.now(),
                  text,
                  image,
                  createdAt: Date.now(),
                },
              };
            }
            return c;
          }),
        }));
      },
      getStreak: () => {
        // Simple streak calculation
        // In real app, would need to account for frequency
        let streak = 0;
        const checkIns = get().checkIns;
        // Logic to calculate streak based on dates
        // ... (simplified for now)
        return checkIns.length; 
      },
    }),
    {
      name: 'checkin-storage',
    }
  )
);
