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
  date: string;
  is_shared: boolean;
  is_completed: boolean;
  created_by: string;
  emoji?: string;
  start_time?: string; // Renamed from time for clarity
  end_time?: string;
  duration?: number; // Duration in minutes
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  reoccurrence?: { // Renamed from recurrence 
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: string[];
  };
  alerts?: string[];
  details?: string; // Renamed from subtitle
  steps?: Array<{ // Renamed from subtasks
    id: string;
    title: string;
    completed: boolean;
  }>;
  assignedTo?: string[];
  groupId?: string; // Link to task group
  reactions?: Array<{
    emoji: string;
    count: number;
    isFromPartner: boolean;
    users: string[];
  }>;
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
