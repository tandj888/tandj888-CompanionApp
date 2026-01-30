import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Goal, Category } from '../types';
import { goalApi } from '../api/goalApi';
import { useUserStore } from './userStore';

interface GoalState {
  goals: Goal[];
  currentGoal: Goal | null; // Kept for compatibility, but might be deprecated
  categories: Category[];
  setGoal: (goal: Goal) => Promise<void>; // Adds or updates goal
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  addCategory: (name: string, icon: string) => void;
  removeCategory: (id: string) => void;
  syncWithBackend: () => Promise<void>;
}

const DEFAULT_CATEGORIES: Category[] = [
    { id: 'all', name: '全部', icon: '📋', isCustom: false },
    { id: 'water', name: '喝水', icon: '💧', isCustom: false },
    { id: 'reading', name: '阅读', icon: '📚', isCustom: false },
    { id: 'exercise', name: '运动', icon: '🏃', isCustom: false },
    { id: 'sleep', name: '作息', icon: '😴', isCustom: false },
    { id: 'other', name: '其他', icon: '✨', isCustom: false },
];

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      currentGoal: null,
      categories: DEFAULT_CATEGORIES,
      setGoal: async (goal) => {
          // If goal exists, update it, otherwise add it
          const { goals } = get();
          const existingIndex = goals.findIndex(g => g.id === goal.id);
          
          let newGoals;
          if (existingIndex >= 0) {
              newGoals = [...goals];
              newGoals[existingIndex] = goal;
          } else {
              newGoals = [...goals, goal];
          }
          
          set({ goals: newGoals, currentGoal: goal });

          const user = useUserStore.getState().user;
          if (user && user.phone) {
              try {
                  // Check if it's a new goal (no server ID usually, but here we generate ID locally)
                  // We'll assume if it's in the list it might need create or update. 
                  // For simplicity, let's try to create, if fails (or we know it exists), update.
                  // Actually, best to rely on caller or check if we fetched it.
                  // But `setGoal` is usually called after wizard.
                  const savedGoal = await goalApi.createGoal({ ...goal, userId: user.id });
                  // Update the goal in store with server response (e.g. valid ID if changed)
                  const updatedGoals = newGoals.map(g => g.id === goal.id ? savedGoal : g);
                  set({ goals: updatedGoals, currentGoal: savedGoal });
              } catch (e) {
                  console.error("Failed to create goal on server", e);
              }
          }
      },
      updateGoal: async (id, updates) => {
        const { goals } = get();
        const goalIndex = goals.findIndex(g => g.id === id);
        
        if (goalIndex >= 0) {
            const goal = goals[goalIndex];
            const updated = { ...goal, ...updates };
            
            const newGoals = [...goals];
            newGoals[goalIndex] = updated;
            
            set({ goals: newGoals, currentGoal: updated });
            
            const user = useUserStore.getState().user;
            if (user && user.phone) {
                try {
                    await goalApi.updateGoal(id, updates);
                } catch (e) {
                    console.error("Failed to update goal on server", e);
                }
            }
        }
      },
      removeGoal: async (id) => {
          const { goals } = get();
          const newGoals = goals.filter(g => g.id !== id);
          set({ goals: newGoals, currentGoal: newGoals.length > 0 ? newGoals[0] : null });
          
          const user = useUserStore.getState().user;
          if (user && user.phone) {
              try {
                  await goalApi.deleteGoal(id);
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
                  if (goals) {
                      set({ goals: goals, currentGoal: goals.length > 0 ? goals[0] : null });
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
        goals: state.goals,
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
