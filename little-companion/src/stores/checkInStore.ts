import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CheckIn, MicroRecord } from '../types';
import { format, subDays } from 'date-fns';
import { useGoalStore } from './goalStore';
import { useUserStore } from './userStore';
import { checkInApi } from '../api/checkInApi';
import { microRecordApi } from '../api/microRecordApi';
import { useMicroRecordStore } from './microRecordStore';

interface CheckInState {
  checkIns: CheckIn[];
  checkIn: (goalId: string, record?: MicroRecord) => Promise<void>;
  getTodayCheckIn: (goalId: string) => CheckIn | undefined;
  addRecordToToday: (goalId: string, text: string, image?: string) => Promise<void>;
  getStreak: (goalId?: string) => number;
  getCumulativeCheckIns: (goalId: string) => number;
  syncWithBackend: () => Promise<void>;
  addLikeToUserToday: (userId: string) => Promise<boolean>;
}

// Removed anonymous like mock messages

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      checkIns: [],
      checkIn: async (goalId, record) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const existing = get().checkIns.find((c) => c.date === today && c.goalId === goalId);
        if (existing) return;

        // Check for time restriction
        const goal = useGoalStore.getState().goals.find(g => g.id === goalId);
        if (goal?.timeRestriction?.enabled && goal.startTime && goal.endTime) {
            const now = new Date();
            const currentHm = format(now, 'HH:mm');
            
            // Handle cross-midnight (e.g. 23:00 - 02:00)
            const isCrossMidnight = goal.startTime > goal.endTime;
            
            let isAllowed = false;
            if (isCrossMidnight) {
                isAllowed = currentHm >= goal.startTime || currentHm <= goal.endTime;
            } else {
                isAllowed = currentHm >= goal.startTime && currentHm <= goal.endTime;
            }
            
            if (!isAllowed) {
                // We should probably return a rejection or throw an error.
                // Since this is async void, throwing is the best way to signal UI.
                throw new Error(`当前不在打卡时间段内 (${goal.startTime} - ${goal.endTime})`);
            }
        }
        
        // Check for supervisor notification

        
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
             let microRecordId = 'record-' + Date.now();
             const user = useUserStore.getState().user;

             if (user && user.phone) {
                 try {
                     const newRecord = await microRecordApi.createRecord({
                         text,
                         image,
                         userId: user.id,
                         goalId,
                         checkInId: targetCheckIn.id
                     });
                     microRecordId = newRecord.id;
                     
                     // Refresh micro records
                     useMicroRecordStore.getState().fetchRecords();
                 } catch (e) {
                     console.error("Failed to create micro record backend", e);
                 }
             }

             const updatedRecord = {
                id: microRecordId,
                text,
                image,
                createdAt: Date.now(),
              };
             
             const updatedCheckIn = { ...targetCheckIn, record: updatedRecord };

             set((state) => ({
                checkIns: state.checkIns.map((c) => c.id === targetCheckIn.id ? updatedCheckIn : c),
             }));

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
        const checkIns = get().checkIns;
        // If goalId provided, filter. If not, use all checkins (global streak)
        // For global streak, we care if *any* goal was checked in on a date.
        const relevantCheckIns = goalId ? checkIns.filter(c => c.goalId === goalId) : checkIns;
        
        if (relevantCheckIns.length === 0) return 0;

        // Sort by date descending
        const sortedCheckIns = [...relevantCheckIns].sort((a, b) => b.timestamp - a.timestamp);
        
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        
        // Deduplicate dates for global streak calculation
        const dates = Array.from(new Set(sortedCheckIns.map(c => c.date))).sort().reverse();

        if (dates.length === 0) return 0;

        const latestDate = dates[0];
        if (latestDate !== todayStr && latestDate !== yesterdayStr) {
            return 0;
        }

        let streak = 0;
        let currentDate = new Date();
        
        // If not checked in today yet, start checking from yesterday
        if (latestDate !== todayStr) {
            currentDate = subDays(currentDate, 1);
        }

        for (const date of dates) {
            if (date === format(currentDate, 'yyyy-MM-dd')) {
                streak++;
                currentDate = subDays(currentDate, 1);
            } else {
                // Since dates are unique and sorted descending, if we mismatch, it's a gap
                // But wait, if we have multiple checkins on same day (different goals), Set handles it.
                // If we skip a day in the Set, it's a gap.
                // However, the loop iterates over *existing* dates.
                // We need to check if the existing date matches the *expected* consecutive date.
                // If date < expected, we missed a day.
                // If date > expected (impossible if sorted desc and started from today/yesterday), ignore?
                
                // Let's re-verify the logic.
                // We expect date to be currentDateStr.
                // If date is OLDER than currentDateStr, it means we missed the currentDateStr.
                // (e.g. we expect Yesterday, but next available is 3 days ago).
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
      },
      addLikeToUserToday: async (targetUserId) => {
          try {
              const today = format(new Date(), 'yyyy-MM-dd');
              const targetCheckIns = await checkInApi.getCheckIns({ userId: targetUserId, date: today });
              const target = targetCheckIns?.[0];
              if (!target) return false;
              const me = useUserStore.getState().user;
              if (!me?.id) return false;
              const likes = Array.isArray(target.likes) ? target.likes : [];
              if (likes.includes(me.id)) return true;
              const updated = await checkInApi.updateCheckIn(target.id, { likes: [...likes, me.id] });
              // If the liked target is myself, update local state; otherwise, rely on their device to sync
              const myId = useUserStore.getState().user?.id;
              if (target.userId === myId) {
                 set((state) => ({
                   checkIns: state.checkIns.map(c => c.id === target.id ? updated : c)
                 }));
              }
              return true;
          } catch (e) {
              console.error("Failed to add like", e);
              return false;
          }
      }
    }),
    {
      name: 'checkin-storage',
      partialize: (state) => ({ checkIns: state.checkIns }),
    }
  )
);
