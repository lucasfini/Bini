// src/types/tasks.ts - TYPES ONLY (NO SERVICE CODE)
export interface UnifiedTask {
  // Core fields (always present)
  id: string;
  title: string;
  date: string;
  isShared: boolean;
  isCompleted: boolean;
  createdBy: string;

  // Enhanced fields (new schema)
  emoji?: string;
  startTime?: string; // Primary field
  endTime?: string; // Primary field
  duration?: number;
  details?: string; // Primary field
  steps?: Array<{
    // Primary field
    id: string;
    title: string;
    completed: boolean;
  }>;
  recurrence?: {
    // Primary field
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: string[];
  };
  alerts?: string[];
  assignedTo?: string[];
  category?: string;
  priority?: 'low' | 'medium' | 'high';

  // Backward compatibility aliases (DEPRECATED - use primary fields above)
  /** @deprecated Use startTime instead */
  time?: string;
  /** @deprecated Use details instead */
  subtitle?: string;
  /** @deprecated Use steps instead */
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;

  // UI-specific fields
  reactions?: Array<{
    emoji: string;
    count: number;
    isFromPartner: boolean;
    users: string[];
  }>;
  groupId?: string;
  progress?: number;
}

// Form data from CreateTaskScreen
export interface TaskFormData {
  title: string;
  emoji: string;
  when: {
    date: string;
    time: string;
  };
  durationMinutes: number;
  recurrence: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: string[];
  };
  alerts: string[];
  details: string;
  isShared: boolean;
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

// Legacy interfaces for backward compatibility
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
  start_time?: string;
  end_time?: string;
  duration?: number;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  reoccurrence?: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: string[];
  };
  alerts?: string[];
  details?: string;
  steps?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  assignedTo?: string[];
  groupId?: string;
  reactions?: Array<{
    emoji: string;
    count: number;
    isFromPartner: boolean;
    users: string[];
  }>;
  priority?: 'low' | 'medium' | 'high';
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
