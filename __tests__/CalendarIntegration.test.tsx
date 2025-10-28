import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CalendarScreen from '../src/screens/calendar/CalendarScreen';
import { useTimelineData } from '../src/screens/timeline/hooks/useTimelineData';
import UnifiedTaskService from '../src/services/tasks/unifiedTaskService';

// Mock the timeline data hook
jest.mock('../src/screens/timeline/hooks/useTimelineData');
const mockUseTimelineData = useTimelineData as jest.MockedFunction<typeof useTimelineData>;

// Mock the UnifiedTaskService
jest.mock('../src/services/tasks/unifiedTaskService');
const mockUnifiedTaskService = UnifiedTaskService as jest.Mocked<typeof UnifiedTaskService>;

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  GestureDetector: ({ children }: any) => children,
  Gesture: {
    Pan: () => ({
      onEnd: jest.fn().mockReturnThis(),
    }),
  },
}));

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  return {
    ...Reanimated,
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((value) => value),
    withSequence: jest.fn((value) => value),
    interpolate: jest.fn(),
  };
});

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Test data factories
const createMockTask = (id: string, dateISO: string, overrides = {}) => ({
  id,
  title: `Task ${id}`,
  emoji: '📝',
  dateISO,
  isCompleted: false,
  isShared: false,
  priority: 'normal' as const,
  startTime: '09:00',
  ...overrides,
});

const createMockTimelineData = (dates: string[], tasksPerDate = 2) => {
  return dates.map(dateISO => ({
    dateISO,
    isToday: dateISO === new Date().toISOString().split('T')[0],
    tasks: Array.from({ length: tasksPerDate }, (_, i) => 
      createMockTask(`${dateISO}-${i}`, dateISO, {
        title: `Task ${i + 1} for ${dateISO}`,
        isCompleted: i % 2 === 0,
        isShared: i % 3 === 0,
      })
    ),
  }));
};

const renderCalendarWithData = (timelineData: any[], props = {}) => {
  mockUseTimelineData.mockReturnValue({
    sections: timelineData,
    isLoading: false,
    hasLoadedOnce: true,
  });

  return render(
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CalendarScreen {...props} />
    </GestureHandlerRootView>
  );
};

describe('Calendar Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Timeline Data Integration', () => {
    it('should display tasks from timeline data correctly', async () => {
      const testDates = ['2024-01-15', '2024-01-16', '2024-01-17'];
      const timelineData = createMockTimelineData(testDates, 3);

      const { getByText } = renderCalendarWithData(timelineData);

      // Verify tasks are displayed
      expect(getByText('📝 Task 1 for 2024-01-15')).toBeTruthy();
      expect(getByText('📝 Task 2 for 2024-01-16')).toBeTruthy();
      expect(getByText('📝 Task 3 for 2024-01-17')).toBeTruthy();
    });

    it('should handle task completion status correctly', async () => {
      const timelineData = createMockTimelineData(['2024-01-15'], 4);
      
      // Mark some tasks as completed
      timelineData[0].tasks[0].isCompleted = true;
      timelineData[0].tasks[2].isCompleted = true;

      const { getByText } = renderCalendarWithData(timelineData);

      // All tasks should be visible regardless of completion status
      expect(getByText('📝 Task 1 for 2024-01-15')).toBeTruthy();
      expect(getByText('📝 Task 2 for 2024-01-15')).toBeTruthy();
      expect(getByText('📝 Task 3 for 2024-01-15')).toBeTruthy();
      expect(getByText('📝 Task 4 for 2024-01-15')).toBeTruthy();
    });

    it('should handle shared task indicators correctly', async () => {
      const timelineData = createMockTimelineData(['2024-01-15'], 3);
      
      // Mark some tasks as shared
      timelineData[0].tasks[1].isShared = true;

      const { getByText } = renderCalendarWithData(timelineData);

      // Shared tasks should be displayed with appropriate styling
      expect(getByText('📝 Task 2 for 2024-01-15')).toBeTruthy();
    });

    it('should update calendar when timeline data changes', async () => {
      const initialData = createMockTimelineData(['2024-01-15'], 2);
      const { getByText, rerender } = renderCalendarWithData(initialData);

      // Verify initial tasks
      expect(getByText('📝 Task 1 for 2024-01-15')).toBeTruthy();

      // Update timeline data
      const updatedData = createMockTimelineData(['2024-01-15'], 3);
      updatedData[0].tasks.push(createMockTask('new-task', '2024-01-15', {
        title: 'New Task Added',
        emoji: '🆕',
      }));

      mockUseTimelineData.mockReturnValue({
        sections: updatedData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      rerender(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen />
        </GestureHandlerRootView>
      );

      // Verify new task appears
      await waitFor(() => {
        expect(getByText('🆕 New Task Added')).toBeTruthy();
      });
    });

    it('should handle empty timeline data gracefully', async () => {
      const { getByText } = renderCalendarWithData([]);

      // Calendar should still render correctly
      expect(getByText('January 2024')).toBeTruthy();
      expect(getByText('15')).toBeTruthy(); // Current day should be visible
    });

    it('should maintain task data consistency across different months', async () => {
      // Create data spanning multiple months
      const multiMonthData = [
        ...createMockTimelineData(['2024-01-15', '2024-01-30'], 2),
        ...createMockTimelineData(['2024-02-14', '2024-02-28'], 2),
        ...createMockTimelineData(['2024-03-15'], 1),
      ];

      const { getByText } = renderCalendarWithData(multiMonthData);

      // January tasks should be visible
      expect(getByText('📝 Task 1 for 2024-01-15')).toBeTruthy();
      expect(getByText('📝 Task 1 for 2024-01-30')).toBeTruthy();

      // February and March tasks should be processed but not necessarily visible in January view
      // This tests that data processing handles multiple months correctly
    });
  });

  describe('Navigation Integration', () => {
    it('should navigate to timeline with correct date when day is selected', async () => {
      const mockOnNavigateToTimeline = jest.fn();
      const timelineData = createMockTimelineData(['2024-01-15'], 2);

      const { getByText } = renderCalendarWithData(timelineData, {
        onNavigateToTimeline: mockOnNavigateToTimeline,
      });

      // Select a day with tasks
      await act(async () => {
        fireEvent.press(getByText('15'));
      });

      expect(mockOnNavigateToTimeline).toHaveBeenCalledWith('Timeline', {
        selectedDate: '2024-01-15',
      });
    });

    it('should navigate to timeline even for days without tasks', async () => {
      const mockOnNavigateToTimeline = jest.fn();
      const timelineData = createMockTimelineData(['2024-01-15'], 2);

      const { getByText } = renderCalendarWithData(timelineData, {
        onNavigateToTimeline: mockOnNavigateToTimeline,
      });

      // Select a day without tasks
      await act(async () => {
        fireEvent.press(getByText('20'));
      });

      expect(mockOnNavigateToTimeline).toHaveBeenCalledWith('Timeline', {
        selectedDate: '2024-01-20',
      });
    });

    it('should handle navigation for previous month days', async () => {
      const mockOnNavigateToTimeline = jest.fn();
      const timelineData = createMockTimelineData(['2023-12-31'], 1);

      const { getByText } = renderCalendarWithData(timelineData, {
        onNavigateToTimeline: mockOnNavigateToTimeline,
      });

      // Days from previous month should be visible and selectable
      // This depends on your calendar implementation showing previous month's days
      const dayElements = getByText('31'); // December 31st would appear in January's calendar
      
      await act(async () => {
        fireEvent.press(dayElements);
      });

      expect(mockOnNavigateToTimeline).toHaveBeenCalledWith('Timeline', {
        selectedDate: '2023-12-31',
      });
    });
  });

  describe('Data Synchronization', () => {
    it('should reflect real-time task updates in calendar display', async () => {
      const initialData = createMockTimelineData(['2024-01-15'], 2);
      const { getByText, rerender } = renderCalendarWithData(initialData);

      // Verify initial state
      expect(getByText('📝 Task 1 for 2024-01-15')).toBeTruthy();

      // Simulate task service updating data
      const updatedData = createMockTimelineData(['2024-01-15'], 2);
      updatedData[0].tasks[0].isCompleted = true;
      updatedData[0].tasks[0].title = 'Updated Task 1';

      mockUseTimelineData.mockReturnValue({
        sections: updatedData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      rerender(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen />
        </GestureHandlerRootView>
      );

      // Verify updated task appears
      await waitFor(() => {
        expect(getByText('📝 Updated Task 1')).toBeTruthy();
      });
    });

    it('should handle task service errors gracefully', async () => {
      // Mock timeline hook to simulate error state
      mockUseTimelineData.mockReturnValue({
        sections: [],
        isLoading: false,
        hasLoadedOnce: false, // Indicates error or no data loaded
      });

      const { getByText } = render(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen />
        </GestureHandlerRootView>
      );

      // Calendar should still render basic structure
      expect(getByText('January 2024')).toBeTruthy();
    });

    it('should handle loading states during data updates', async () => {
      // Start with loading state
      mockUseTimelineData.mockReturnValue({
        sections: [],
        isLoading: true,
        hasLoadedOnce: false,
      });

      const { getByText, rerender } = render(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen />
        </GestureHandlerRootView>
      );

      // Calendar should render during loading
      expect(getByText('January 2024')).toBeTruthy();

      // Complete loading with data
      const timelineData = createMockTimelineData(['2024-01-15'], 3);
      mockUseTimelineData.mockReturnValue({
        sections: timelineData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      rerender(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen />
        </GestureHandlerRootView>
      );

      // Tasks should appear after loading
      await waitFor(() => {
        expect(getByText('📝 Task 1 for 2024-01-15')).toBeTruthy();
      });
    });
  });

  describe('Date Handling Integration', () => {
    it('should correctly map timeline dates to calendar days', async () => {
      const timelineData = [
        {
          dateISO: '2024-01-01',
          isToday: false,
          tasks: [createMockTask('new-year', '2024-01-01', { title: 'New Year Task', emoji: '🎉' })],
        },
        {
          dateISO: '2024-01-15',
          isToday: true,
          tasks: [createMockTask('mid-month', '2024-01-15', { title: 'Mid Month Task' })],
        },
        {
          dateISO: '2024-01-31',
          isToday: false,
          tasks: [createMockTask('end-month', '2024-01-31', { title: 'End Month Task' })],
        },
      ];

      const { getByText } = renderCalendarWithData(timelineData);

      // Verify tasks appear on correct days
      expect(getByText('🎉 New Year Task')).toBeTruthy();
      expect(getByText('📝 Mid Month Task')).toBeTruthy();
      expect(getByText('📝 End Month Task')).toBeTruthy();
    });

    it('should handle timezone differences correctly', async () => {
      // Test with dates that might have timezone issues
      const timelineData = [
        {
          dateISO: '2024-01-15',
          isToday: false,
          tasks: [createMockTask('tz-test', '2024-01-15', { 
            title: 'Timezone Test Task',
            startTime: '23:59' // Edge case time
          })],
        },
      ];

      const { getByText } = renderCalendarWithData(timelineData);

      expect(getByText('📝 Timezone Test Task')).toBeTruthy();
    });

    it('should handle date format variations correctly', async () => {
      const timelineData = [
        {
          dateISO: '2024-01-05', // Single digit day
          isToday: false,
          tasks: [createMockTask('format-test', '2024-01-05', { title: 'Format Test Task' })],
        },
      ];

      const { getByText } = renderCalendarWithData(timelineData);

      expect(getByText('📝 Format Test Task')).toBeTruthy();
    });
  });

  describe('Task Filtering and Display', () => {
    it('should limit displayed tasks per day correctly', async () => {
      // Create a day with many tasks
      const manyTasksData = [{
        dateISO: '2024-01-15',
        isToday: false,
        tasks: Array.from({ length: 10 }, (_, i) => 
          createMockTask(`task-${i}`, '2024-01-15', {
            title: `Task ${i + 1}`,
            emoji: '📝'
          })
        ),
      }];

      const { getByText, queryByText } = renderCalendarWithData(manyTasksData);

      // Should show only first few tasks and a count indicator
      expect(getByText('📝 Task 1')).toBeTruthy();
      expect(getByText('📝 Task 2')).toBeTruthy();
      expect(getByText('📝 Task 3')).toBeTruthy();
      
      // Should show remainder count
      expect(getByText('+7')).toBeTruthy();
      
      // Later tasks should not be individually visible
      expect(queryByText('📝 Task 10')).toBeFalsy();
    });

    it('should prioritize task display correctly', async () => {
      const prioritizedTasksData = [{
        dateISO: '2024-01-15',
        isToday: false,
        tasks: [
          createMockTask('low', '2024-01-15', { title: 'Low Priority', priority: 'low' }),
          createMockTask('high', '2024-01-15', { title: 'High Priority', priority: 'high' }),
          createMockTask('normal', '2024-01-15', { title: 'Normal Priority', priority: 'normal' }),
        ],
      }];

      const { getByText } = renderCalendarWithData(prioritizedTasksData);

      // All tasks should be visible (assuming less than display limit)
      expect(getByText('📝 Low Priority')).toBeTruthy();
      expect(getByText('📝 High Priority')).toBeTruthy();
      expect(getByText('📝 Normal Priority')).toBeTruthy();
    });

    it('should handle task colors based on status and type', async () => {
      const colorTestData = [{
        dateISO: '2024-01-15',
        isToday: false,
        tasks: [
          createMockTask('completed', '2024-01-15', { 
            title: 'Completed Task', 
            isCompleted: true 
          }),
          createMockTask('shared', '2024-01-15', { 
            title: 'Shared Task', 
            isShared: true 
          }),
          createMockTask('normal', '2024-01-15', { 
            title: 'Normal Task' 
          }),
        ],
      }];

      const { getByText } = renderCalendarWithData(colorTestData);

      // All task types should be displayed
      expect(getByText('📝 Completed Task')).toBeTruthy();
      expect(getByText('📝 Shared Task')).toBeTruthy();
      expect(getByText('📝 Normal Task')).toBeTruthy();
    });
  });

  describe('Performance Integration', () => {
    it('should efficiently handle large datasets from timeline service', async () => {
      // Create large dataset spanning multiple months
      const largeDates = Array.from({ length: 100 }, (_, i) => {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + i);
        return date.toISOString().split('T')[0];
      });

      const largeTimelineData = createMockTimelineData(largeDates, 5);

      const startTime = performance.now();
      const { getByText } = renderCalendarWithData(largeTimelineData);
      const endTime = performance.now();

      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
      expect(getByText('January 2024')).toBeTruthy();
    });

    it('should efficiently update when timeline data changes frequently', async () => {
      const baseData = createMockTimelineData(['2024-01-15'], 3);
      const { rerender } = renderCalendarWithData(baseData);

      const startTime = performance.now();

      // Simulate frequent data updates
      for (let i = 0; i < 10; i++) {
        const updatedData = createMockTimelineData(['2024-01-15'], 3 + i);
        mockUseTimelineData.mockReturnValue({
          sections: updatedData,
          isLoading: false,
          hasLoadedOnce: true,
        });

        rerender(
          <GestureHandlerRootView style={{ flex: 1 }}>
            <CalendarScreen />
          </GestureHandlerRootView>
        );
      }

      const endTime = performance.now();

      // Frequent updates should not cause performance issues
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle malformed timeline data gracefully', async () => {
      const malformedData = [
        {
          dateISO: '2024-01-15',
          isToday: false,
          tasks: [
            // Missing required fields
            { id: '1', title: 'Incomplete Task' },
            // Invalid date
            createMockTask('invalid', 'not-a-date'),
            // Valid task
            createMockTask('valid', '2024-01-15', { title: 'Valid Task' }),
          ],
        },
      ];

      const { getByText } = renderCalendarWithData(malformedData);

      // Should handle errors gracefully and still render calendar
      expect(getByText('January 2024')).toBeTruthy();
      
      // Valid task should still appear
      expect(getByText('📝 Valid Task')).toBeTruthy();
    });

    it('should recover from timeline service failures', async () => {
      // Start with error state
      mockUseTimelineData.mockReturnValue({
        sections: [],
        isLoading: false,
        hasLoadedOnce: false,
      });

      const { getByText, rerender } = render(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen />
        </GestureHandlerRootView>
      );

      expect(getByText('January 2024')).toBeTruthy();

      // Recover with valid data
      const recoveryData = createMockTimelineData(['2024-01-15'], 2);
      mockUseTimelineData.mockReturnValue({
        sections: recoveryData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      rerender(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen />
        </GestureHandlerRootView>
      );

      await waitFor(() => {
        expect(getByText('📝 Task 1 for 2024-01-15')).toBeTruthy();
      });
    });
  });
});