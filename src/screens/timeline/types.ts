export type TaskPriority = 'low' | 'normal' | 'high';

export type Task = {
  id: string;
  title: string;
  emoji?: string;
  details?: string;
  dateISO: string;        // 'YYYY-MM-DD'
  startTime?: string;     // 'HH:mm'
  durationMin?: number;
  isShared?: boolean;
  isCompleted?: boolean;
  priority?: TaskPriority;
  steps?: { id: string; title: string; completed: boolean }[];
  recurrence?: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: string[];
  };
  alerts?: string[];
};

export type DaySection = {
  dateISO: string;
  isToday: boolean;
  tasks: Task[];
};