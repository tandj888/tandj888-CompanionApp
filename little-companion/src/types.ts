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

export interface GroupMember extends User {
  hasCheckedInToday: boolean;
  streak: number;
  totalCheckIns?: number;
  todayLikes?: string[]; // User IDs who liked this member today
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
  name: string;
  icon: string;
  consecutiveDays?: number;
  cumulativeDays?: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  members: GroupMember[];
  createTime: number;
  inviteCode: string;
  inviteExpires: number;
  maxMembers: number;
  status: 'active' | 'dissolved';
  dissolvedAt?: number;
  
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  
  // New: Time Restriction
  timeRestriction?: {
    enabled: boolean;
  };

  rewards?: Reward[];
  
  // New: Supervisor
  supervisor?: {
    enabled: boolean;
    name: string;
    contact: string;
    method: 'sms' | 'app';
    notifyOnCheckIn: boolean;
    notifyOnOverdue: boolean;
  };
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
  
  // Time Restriction (New)
  timeRestriction?: {
    enabled: boolean;
  };

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

export interface Gift {
  id: string;
  name: string;
  image: string;
  cost?: number;
  requiredDays?: number;
  description: string;
  stock: number;
  type: 'star' | 'streak';
  category: 'virtual' | 'physical' | 'coupon';
}

export interface RedemptionRecord {
  id: string;
  userId: string;
  giftId: string;
  giftName: string;
  cost: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'rejected';
}

export interface Notification {
  id: string;
  type: 'like' | 'system' | 'comment' | 'follow';
  content: string;
  timestamp: number;
  read: boolean;
  likerId?: string;
  title?: string; // Optional title
}

export interface Article {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  images?: string[];
  tags: string[];
  status: 'draft' | 'published';
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isRecommended: boolean;
  author: User;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  articleId: string;
  user: User;
  userId: string;
  parentId?: string;
  images?: string[];
  likeCount: number;
  createdAt: string;
}

export interface CreateArticleDTO {
  title: string;
  content: string;
  coverImage?: string;
  images?: string[];
  tags: string[];
  userId: string;
  status?: 'draft' | 'published';
}

export interface CreateCommentDTO {
  articleId: string;
  userId: string;
  content: string;
  parentId?: string;
  images?: string[];
}
