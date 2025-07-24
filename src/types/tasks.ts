// src/types/tasks.ts

export interface TaskGroup {
  id: string;
  title: string;
  description: string;
  emoji: string;
  reward: string;
  createdAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  participants: string[];
}

export interface EnhancedTask {
  id: string;
  title: string;
  subtitle?: string;
  emoji?: string;
  time: string;
  endTime?: string;
  date: string;
  isShared: boolean;
  isCompleted: boolean;
  assignedTo: string[];
  category?: string;
  groupId?: string; // Link to task group
  reactions: Array<{
    emoji: string;
    count: number;
    isFromPartner: boolean;
    users: string[];
  }>;
  priority: 'low' | 'medium' | 'high';
  progress?: number;
}

export interface DateInfo {
  day: string;
  date: number;
  isToday: boolean;
  fullDate: Date;
  month: string;
  year: number;
  dayKey: string;
}