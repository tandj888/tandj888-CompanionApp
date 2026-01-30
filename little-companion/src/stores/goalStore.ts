import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Goal, Category } from '../types';
import { goalApi } from '../api/goalApi';
import { useUserStore } from './userStore';

interface GoalState {
  currentGoal: Goal | null;
  categories: Category[];
  setGoal: (goal: Goal) => Promise<void>;
  updateGoal: (updates: Partial<Goal>) => Promise<void>;
  removeGoal: () => Promise<void>;
  addCategory: (name: string, icon: string) => void;
  removeCategory: (id: string) => void;
  syncWithBackend: () => Promise<void>;
}

const DEFAULT_CATEGORIES: Category[] = [
    { id: 'water', name: '喝水', icon: '💧', isCustom: false },
    { id: 'reading', name: '阅读', icon: '📚', isCustom: false },
    { id: 'exercise', name: '运动', icon: '🏃', isCustom: false },
    { id: 'sleep', name: '作息', icon: '😴', isCustom: false },
    { id: 'other', name: '其他', icon: '✨', isCustom: false },
];

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      currentGoal: null,
      categories: DEFAULT_CATEGORIES,
      setGoal: async (goal) => {
          set({ currentGoal: goal });
          const user = useUserStore.getState().user;
          if (user && user.phone) {
              try {
                  const savedGoal = await goalApi.createGoal({ ...goal, userId: user.id });
                  set({ currentGoal: savedGoal });
              } catch (e) {
                  console.error("Failed to create goal on server", e);
              }
          }
      },
      updateGoal: async (updates) => {
        const { currentGoal } = get();
        if (currentGoal) {
            const updated = { ...currentGoal, ...updates };
            set({ currentGoal: updated });
            
            const user = useUserStore.getState().user;
            if (user && user.phone) {
                try {
                    await goalApi.updateGoal(currentGoal.id, updates);
                } catch (e) {
                    console.error("Failed to update goal on server", e);
                }
            }
        }
      },
      removeGoal: async () => {
          const { currentGoal } = get();
          set({ currentGoal: null });
          
          const user = useUserStore.getState().user;
          if (user && user.phone && currentGoal) {
              try {
                  await goalApi.deleteGoal(currentGoal.id);
              } catch (e) {
                  console.error("Failed to delete goal on server", e);
              }
          }
      },
      addCategory: (name, icon) => 
        set((state) => ({
            categories: [
                ...state.categories, 
                { id: 'cat-' + Date.now(), name, icon, isCustom: true }
            ]
        })),
      removeCategory: (id) =>
        set((state) => ({
            categories: state.categories.filter(c => c.id !== id || !c.isCustom)
        })),
      syncWithBackend: async () => {
          const user = useUserStore.getState().user;
          if (user && user.phone) {
              try {
                  const goals = await goalApi.getGoals(user.id);
                  if (goals && goals.length > 0) {
                      set({ currentGoal: goals[0] });
                  }
              } catch (e) {
                  console.error("Failed to fetch goals", e);
              }
          }
      }
    }),
    {
      name: 'goal-storage',
      partialize: (state) => ({ 
        currentGoal: state.currentGoal,
        categories: state.categories 
      }),
    }
  )
);

export const GOAL_TEMPLATES: Omit<Goal, 'id'>[] = [
  { name: '读10页书', category: 'reading', duration: 20, frequency: 'daily' },
  { name: '做20个深蹲', category: 'exercise', duration: 5, frequency: 'daily' },
  { name: '23点前睡觉', category: 'sleep', duration: 0, frequency: 'daily' },
];
