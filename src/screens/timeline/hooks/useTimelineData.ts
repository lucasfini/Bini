import { useState, useEffect } from 'react';
import { DaySection, Task } from '../types';
import UnifiedTaskService from '../../../services/tasks/unifiedTaskService';
import { UnifiedTask } from '../../../types/tasks';

const MOCK_EMPTY = false; // Set to false to use real data

export const useTimelineData = (refreshKey?: number): { sections: DaySection[]; isLoading: boolean; hasLoadedOnce: boolean } => {
  const [sections, setSections] = useState<DaySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (MOCK_EMPTY) {
      setSections([]);
      setIsLoading(false);
      setHasLoadedOnce(true);
      return;
    }

    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const tasksGroupedByDate = await UnifiedTaskService.getTasksForTimeline();
        
        // Convert UnifiedTask to Task format and create sections
        const sectionMap = new Map<string, DaySection>();
        const today = new Date().toISOString().split('T')[0];
        
        Object.entries(tasksGroupedByDate).forEach(([date, unifiedTasks]) => {
          // Include all tasks (both completed and incomplete)
          const allTasks = unifiedTasks;
          
          const tasks: Task[] = allTasks.map((unifiedTask: UnifiedTask) => ({
            id: unifiedTask.id,
            title: unifiedTask.title,
            emoji: unifiedTask.emoji || undefined,
            details: unifiedTask.details || undefined,
            dateISO: date,
            startTime: unifiedTask.startTime || undefined,
            durationMin: unifiedTask.duration || undefined,
            isShared: unifiedTask.isShared || false,
            isCompleted: unifiedTask.isCompleted || false,
            priority: (unifiedTask.priority as 'low' | 'normal' | 'high') || 'normal',
            steps: unifiedTask.isCompleted ? undefined : unifiedTask.steps ? unifiedTask.steps.map((step: any) => ({
              id: step.id,
              title: step.title,
              completed: step.completed
            })) : undefined,
            recurrence: unifiedTask.recurrence || undefined,
            alerts: unifiedTask.alerts || undefined,
          }));

          // Sort tasks by start time
          const sortedTasks = tasks.sort((a, b) => {
            const timeA = a.startTime || '23:59';
            const timeB = b.startTime || '23:59';
            return timeA.localeCompare(timeB);
          });

          sectionMap.set(date, {
            dateISO: date,
            isToday: date === today,
            tasks: sortedTasks
          });
        });

        // Convert to array and sort by date
        const sectionsArray = Array.from(sectionMap.values())
          .filter(section => section.tasks.length > 0)
          .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());

        setSections(sectionsArray);
      } catch (error) {
        console.error('Failed to fetch timeline data:', error);
        setSections([]);
      } finally {
        setIsLoading(false);
        setHasLoadedOnce(true);
      }
    };

    fetchTasks();
  }, [refreshKey]);

  return { sections, isLoading, hasLoadedOnce };
};