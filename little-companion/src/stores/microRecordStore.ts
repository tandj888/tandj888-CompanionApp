import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MicroRecord } from '../types';
import { microRecordApi } from '../api/microRecordApi';
import { useUserStore } from './userStore';

interface MicroRecordState {
  records: MicroRecord[];
  addRecord: (record: Omit<MicroRecord, 'id' | 'createdAt'> & { goalId?: string, checkInId?: string }) => Promise<void>;
  fetchRecords: () => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useMicroRecordStore = create<MicroRecordState>()(
  persist(
    (set, get) => ({
      records: [],
      addRecord: async (recordData) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        try {
            const newRecord = await microRecordApi.createRecord({
                ...recordData,
                userId: user.id,
                createdAt: Date.now() // Optimistic, backend will overwrite or we use this
            });
            
            // Backend returns Date string for createdAt usually, we might need to normalize
            // For now assuming backend returns what we sent or we just use local update for speed
            
            set((state) => ({
                records: [newRecord, ...state.records]
            }));
        } catch (error) {
            console.error("Failed to create micro record", error);
            // Fallback for offline? Or just throw?
            // User requested backend interaction, so we prioritize that.
        }
      },
      fetchRecords: async () => {
          const user = useUserStore.getState().user;
          if (!user) return;
          try {
              const records = await microRecordApi.getRecords(user.id);
              set({ records });
          } catch (error) {
              console.error("Failed to fetch records", error);
          }
      },
      deleteRecord: async (id) => {
          try {
              await microRecordApi.deleteRecord(id);
              set((state) => ({
                  records: state.records.filter(r => r.id !== id)
              }));
          } catch (error) {
              console.error("Failed to delete record", error);
          }
      }
    }),
    {
      name: 'micro-record-storage',
    }
  )
);
