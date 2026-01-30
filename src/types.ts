export interface User {
  id: string;
  nickname: string;
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

export interface Goal {
  id: string;
  templateId?: string;
  name: string;
  category: string; // Changed from enum to string to support custom
  duration: number; // minutes
  frequency: 'daily' | 'alternate' | 'week3' | 'week5' | 'custom';
  intervalDays?: number; // For custom frequency
  
  // New time settings
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
}

export interface MicroRecord {
  id: string;
  text: string;
  image?: string;
  createdAt: number;
}

export interface CheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  goalId: string;
  status: 'completed' | 'missed';
  record?: MicroRecord;
  starsEarned: number;
  likes: string[]; // User IDs who liked
  anonymousLike?: string; // Content of anonymous like
  timestamp: number;
}

export interface GroupMember extends User {
  hasCheckedInToday: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  members: GroupMember[];
  createTime: number;
  inviteCode?: string;
  inviteExpires?: number;
}

export interface Gift {
  id: string;
  name: string;
  image: string;
  requiredDays: number;
  description: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'reminder' | 'system' | 'invite';
  content: string;
  timestamp: number;
  read: boolean;
}
