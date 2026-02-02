export interface User {
  id: string;
  nickname: string;
  phone?: string; // User's phone number
  avatar: string;
  level: number;
  stars: number;
  role: 'user' | 'admin';
  unlockedBadges: string[]; // Badge IDs
  settings: {
    anonymousLikes: boolean;
    reminder?: {
      enabled: boolean;
      startTime?: string; // HH:mm
      interval: number; // minutes
      lastReminded?: number;
    };
    // Deprecated: Supervisor settings moved to per-goal
    supervisor?: {
      enabled: boolean;
      name: string;
      contact: string; // Phone or ID
      method: 'sms' | 'app';
      startTime?: string; // HH:mm
      interval?: number; // minutes
      lastNotified?: number;
    };
  };
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: string;
  category: 'water' | 'reading' | 'exercise' | 'sleep' | 'social' | 'streak';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  isCustom: boolean;
}

export interface Reward {
  id: string;
  days: number;
  name: string;
  icon: string;
  type: 'consecutive' | 'cumulative';
}

export interface Goal {
  id: string;
  userId?: string; // Added for sync
  templateId?: string;
  name: string;
  category: string; // Changed from enum to string to support custom
  duration: number; // minutes
  frequency: 'daily' | 'alternate' | 'week3' | 'week5' | 'custom';
  intervalDays?: number; // For custom frequency
  
  // Time settings
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (Start of execution window)
  endTime?: string; // HH:mm (End of execution window)
  
  // Notification / Deadline
  deadlineTime?: string; // HH:mm (If not checked in by this time, notify)
  lastDeadlineNotified?: number; // Timestamp

  // Rewards
  rewards?: Reward[];

  // Supervisor (Per Goal)
  supervisor?: {
    enabled: boolean;
    name: string;
    contact: string;
    method: 'sms' | 'app';
    notifyOnCheckIn: boolean; // Notify supervisor when user checks in
    notifyOnOverdue: boolean; // Notify supervisor if deadline missed
  };
}

export interface MicroRecord {
  id: string;
  text: string;
  image?: string;
  createdAt: number;
}

export interface CheckIn {
  id: string;
  userId?: string; // Added for sync
  date: string; // YYYY-MM-DD
  goalId: string;
  status: 'completed' | 'missed';
  record?: MicroRecord;
  starsEarned: number;
  likes: string[]; // User IDs
  anonymousLike?: string; // Random encouragement message
  timestamp: number;
}
