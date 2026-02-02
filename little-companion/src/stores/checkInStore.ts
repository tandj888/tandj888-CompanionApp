import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CheckIn, MicroRecord } from '../types';
import { format, subDays, parseISO, isSameDay } from 'date-fns';
import { useGoalStore } from './goalStore';
import { useUserStore } from './userStore';
import { checkInApi } from '../api/checkInApi';

interface CheckInState {
  checkIns: CheckIn[];
  checkIn: (goalId: string, record?: MicroRecord) => Promise<void>;
  getTodayCheckIn: (goalId: string) => CheckIn | undefined;
  addRecordToToday: (goalId: string, text: string, image?: string) => Promise<void>;
  getStreak: (goalId: string) => number;
  getCumulativeCheckIns: (goalId: string) => number;
  syncWithBackend: () => Promise<void>;
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
      checkIn: async (goalId, record) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const existing = get().checkIns.find((c) => c.date === today && c.goalId === goalId);
        if (existing) return;

        // Check for supervisor notification
        const goal = useGoalStore.getState().goals.find(g => g.id === goalId);
        
        // Randomly assign anonymous like
        const hasAnonymousLike = Math.random() > 0.3; 
        const anonymousLike = hasAnonymousLike 
          ? ANONYMOUS_MESSAGES[Math.floor(Math.random() * ANONYMOUS_MESSAGES.length)]
          : undefined;

        const user = useUserStore.getState().user;

        const newCheckIn: CheckIn = {
          id: 'checkin-' + Date.now(),
          userId: user?.id,
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

        if (user && user.phone) {
            try {
                const savedCheckIn = await checkInApi.createCheckIn(newCheckIn);
                // Update with server response (e.g. real ID)
                set((state) => ({ 
                    checkIns: state.checkIns.map(c => c.id === newCheckIn.id ? savedCheckIn : c) 
                }));
            } catch (e) {
                console.error("Failed to sync check-in to server", e);
            }
        }
      },
      getTodayCheckIn: (goalId) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return get().checkIns.find((c) => c.date === today && c.goalId === goalId);
      },
      addRecordToToday: async (goalId, text, image) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const checkIns = get().checkIns;
        const targetCheckIn = checkIns.find(c => c.date === today && c.goalId === goalId);
        
        if (targetCheckIn) {
             const updatedRecord = {
                id: 'record-' + Date.now(),
                text,
                image,
                createdAt: Date.now(),
              };
             
             const updatedCheckIn = { ...targetCheckIn, record: updatedRecord };

             set((state) => ({
                checkIns: state.checkIns.map((c) => c.id === targetCheckIn.id ? updatedCheckIn : c),
             }));

             const user = useUserStore.getState().user;
             if (user && user.phone) {
                 try {
                     await checkInApi.updateCheckIn(targetCheckIn.id, { record: updatedRecord });
                 } catch (e) {
                     console.error("Failed to update check-in on server", e);
                 }
             }
        }
      },
      getStreak: (goalId) => {
        const checkIns = get().checkIns.filter(c => c.goalId === goalId);
        if (checkIns.length === 0) return 0;

        // Sort by date descending
        const sortedCheckIns = [...checkIns].sort((a, b) => b.timestamp - a.timestamp);
        
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        
        // Check if the latest check-in is today or yesterday
        // If the latest check-in is older than yesterday, streak is 0 (broken)
        // Unless... well, for now let's assume strict daily streak.
        // TODO: Handle frequency (e.g. alternate days). For now assuming daily.
        
        const latest = sortedCheckIns[0];
        if (latest.date !== todayStr && latest.date !== yesterdayStr) {
            return 0;
        }

        let streak = 0;
        let currentDate = new Date();
        
        // If not checked in today yet, start checking from yesterday
        if (latest.date !== todayStr) {
            currentDate = subDays(currentDate, 1);
        }

        for (const checkIn of sortedCheckIns) {
            if (checkIn.date === format(currentDate, 'yyyy-MM-dd')) {
                streak++;
                currentDate = subDays(currentDate, 1);
            } else {
                // Gap detected
                break;
            }
        }
        
        return streak;
      },
      getCumulativeCheckIns: (goalId) => {
        const checkIns = get().checkIns.filter(c => c.goalId === goalId);
        return checkIns.length;
      },
      syncWithBackend: async () => {
          const user = useUserStore.getState().user;
          if (user && user.phone) {
              try {
                  const serverCheckIns = await checkInApi.getCheckIns({ userId: user.id });
                  if (serverCheckIns) {
                      set({ checkIns: serverCheckIns });
                  }
              } catch (e) {
                  console.error("Failed to fetch check-ins", e);
              }
          }
      }
    }),
    {
      name: 'checkin-storage',
      partialize: (state) => ({ checkIns: state.checkIns }),
    }
  )
);
