import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Goal, Category } from '../types';

interface GoalState {
  currentGoal: Goal | null;
  categories: Category[];
  setGoal: (goal: Goal) => void;
  updateGoal: (updates: Partial<Goal>) => void;
  removeGoal: () => void;
  addCategory: (name: string, icon: string) => void;
  removeCategory: (id: string) => void;
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
    (set) => ({
      currentGoal: null,
      categories: DEFAULT_CATEGORIES,
      setGoal: (goal) => set({ currentGoal: goal }),
      updateGoal: (updates) =>
        set((state) => ({
          currentGoal: state.currentGoal ? { ...state.currentGoal, ...updates } : null,
        })),
      removeGoal: () => set({ currentGoal: null }),
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
  { name: '喝8杯水', category: 'water', duration: 5, frequency: 'daily' },
  { name: '读10页书', category: 'reading', duration: 20, frequency: 'daily' },
  { name: '做20个深蹲', category: 'exercise', duration: 5, frequency: 'daily' },
  { name: '23点前睡觉', category: 'sleep', duration: 0, frequency: 'daily' },
];
