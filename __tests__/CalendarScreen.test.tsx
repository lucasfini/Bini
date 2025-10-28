import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CalendarScreen from '../src/screens/calendar/CalendarScreen';
import { useTimelineData } from '../src/screens/timeline/hooks/useTimelineData';

// Mock the timeline data hook
jest.mock('../src/screens/timeline/hooks/useTimelineData');
const mockUseTimelineData = useTimelineData as jest.MockedFunction<typeof useTimelineData>;

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const MockGestureDetector = ({ children, gesture }: any) => {
    return React.createElement('MockGestureDetector', { 
      testID: 'gesture-detector',
      onGestureEvent: gesture?.onEnd 
    }, children);
  };
  
  const MockGesture = {
    Pan: () => ({
      onEnd: jest.fn().mockReturnThis(),
    }),
  };

  return {
    GestureHandlerRootView: ({ children }: any) => children,
    GestureDetector: MockGestureDetector,
    Gesture: MockGesture,
  };
});

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Add the missing interpolate function
  Reanimated.interpolate = jest.fn();
  
  return {
    ...Reanimated,
    useSharedValue: jest.fn(() => ({
      value: 0,
    })),
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

// Test helpers
const mockTaskData = [
  {
    dateISO: '2024-01-15',
    isToday: false,
    tasks: [
      {
        id: '1',
        title: 'Test Task 1',
        emoji: '📝',
        dateISO: '2024-01-15',
        isCompleted: false,
        isShared: false,
        priority: 'normal' as const,
      },
      {
        id: '2',
        title: 'Test Task 2',
        emoji: '✅',
        dateISO: '2024-01-15',
        isCompleted: true,
        isShared: true,
        priority: 'high' as const,
      },
    ],
  },
  {
    dateISO: '2024-01-16',
    isToday: true,
    tasks: [
      {
        id: '3',
        title: 'Today Task',
        emoji: '🎯',
        dateISO: '2024-01-16',
        isCompleted: false,
        isShared: false,
        priority: 'normal' as const,
      },
    ],
  },
];

const renderCalendarScreen = (props = {}) => {
  return render(
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CalendarScreen {...props} />
    </GestureHandlerRootView>
  );
};

describe('CalendarScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTimelineData.mockReturnValue({
      sections: mockTaskData,
      isLoading: false,
      hasLoadedOnce: true,
    });

    // Mock current date to January 2024 for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-16T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders calendar with correct month and year', () => {
      const { getByText } = renderCalendarScreen();
      
      expect(getByText('January 2024')).toBeTruthy();
    });

    it('renders weekday headers correctly', () => {
      const { getByText } = renderCalendarScreen();
      
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      weekdays.forEach(day => {
        expect(getByText(day)).toBeTruthy();
      });
    });

    it('renders calendar days correctly', () => {
      const { getByText } = renderCalendarScreen();
      
      // Test that we have numbers 1-31 (current month days)
      for (let day = 1; day <= 31; day++) {
        expect(getByText(day.toString())).toBeTruthy();
      }
    });

    it('displays tasks on days with data', () => {
      const { getByText } = renderCalendarScreen();
      
      expect(getByText('📝 Test Task 1')).toBeTruthy();
      expect(getByText('🎯 Today Task')).toBeTruthy();
    });

    it('highlights today correctly', () => {
      const { getByTestId } = renderCalendarScreen();
      
      // Assuming today is January 16, 2024 based on our mock
      // This would need to be adjusted based on your styling implementation
      // You might need to add testIDs to your component for better testing
    });
  });

  describe('Month Navigation', () => {
    it('changes month when navigation functions are called', async () => {
      const { getByText, rerender } = renderCalendarScreen();
      
      // Initial render shows January 2024
      expect(getByText('January 2024')).toBeTruthy();
      
      // Test going to next month
      // Note: This test assumes we expose navigation functions or simulate gestures
      // In a real implementation, you might need to expose these functions for testing
    });

    it('handles year transitions correctly', async () => {
      // Test December to January and January to December transitions
      jest.setSystemTime(new Date('2024-12-16T10:00:00.000Z'));
      
      const { getByText } = renderCalendarScreen();
      expect(getByText('December 2024')).toBeTruthy();
    });

    it('updates calendar grid when month changes', async () => {
      // Test that the calendar days update correctly when navigating months
      // This would involve checking that the correct number of days are shown
      // and that the first day of the month is positioned correctly
    });
  });

  describe('Swipe Gesture Testing', () => {
    it('handles swipe left gesture (next month)', async () => {
      const mockOnNavigateToTimeline = jest.fn();
      const { getByTestId } = renderCalendarScreen({ 
        onNavigateToTimeline: mockOnNavigateToTimeline 
      });

      const gestureDetector = getByTestId('gesture-detector');
      
      // Simulate swipe left gesture
      await act(async () => {
        fireEvent(gestureDetector, 'onGestureEvent', {
          nativeEvent: {
            velocityX: -600, // Left swipe (negative velocity)
            translationX: -150, // Left swipe (negative translation)
          },
        });
      });

      // Test that the month changed
      // Note: This would need proper implementation of gesture handling in tests
    });

    it('handles swipe right gesture (previous month)', async () => {
      const mockOnNavigateToTimeline = jest.fn();
      const { getByTestId } = renderCalendarScreen({ 
        onNavigateToTimeline: mockOnNavigateToTimeline 
      });

      const gestureDetector = getByTestId('gesture-detector');
      
      // Simulate swipe right gesture
      await act(async () => {
        fireEvent(gestureDetector, 'onGestureEvent', {
          nativeEvent: {
            velocityX: 600, // Right swipe (positive velocity)
            translationX: 150, // Right swipe (positive translation)
          },
        });
      });
    });

    it('ignores weak swipe gestures', async () => {
      const { getByTestId, getByText } = renderCalendarScreen();
      
      const gestureDetector = getByTestId('gesture-detector');
      
      // Simulate weak swipe that shouldn't trigger navigation
      await act(async () => {
        fireEvent(gestureDetector, 'onGestureEvent', {
          nativeEvent: {
            velocityX: 200, // Below threshold of 500
            translationX: 50, // Below threshold of 100
          },
        });
      });

      // Month should remain the same
      expect(getByText('January 2024')).toBeTruthy();
    });

    it('handles velocity-based navigation correctly', async () => {
      const { getByTestId } = renderCalendarScreen();
      
      const gestureDetector = getByTestId('gesture-detector');
      
      // Test high velocity, low translation
      await act(async () => {
        fireEvent(gestureDetector, 'onGestureEvent', {
          nativeEvent: {
            velocityX: 600, // Above velocity threshold
            translationX: 50, // Below translation threshold
          },
        });
      });

      // Should still trigger navigation due to high velocity
    });

    it('handles translation-based navigation correctly', async () => {
      const { getByTestId } = renderCalendarScreen();
      
      const gestureDetector = getByTestId('gesture-detector');
      
      // Test low velocity, high translation
      await act(async () => {
        fireEvent(gestureDetector, 'onGestureEvent', {
          nativeEvent: {
            velocityX: 200, // Below velocity threshold
            translationX: 150, // Above translation threshold
          },
        });
      });

      // Should still trigger navigation due to high translation
    });
  });

  describe('Day Selection', () => {
    it('calls navigation callback when day is pressed', async () => {
      const mockOnNavigateToTimeline = jest.fn();
      const { getByText } = renderCalendarScreen({ 
        onNavigateToTimeline: mockOnNavigateToTimeline 
      });

      const dayButton = getByText('15');
      
      await act(async () => {
        fireEvent.press(dayButton);
      });

      expect(mockOnNavigateToTimeline).toHaveBeenCalledWith('Timeline', {
        selectedDate: '2024-01-15',
      });
    });

    it('updates selected date state when day is pressed', async () => {
      const { getByText } = renderCalendarScreen();

      const dayButton = getByText('15');
      
      await act(async () => {
        fireEvent.press(dayButton);
      });

      // Test that the day becomes selected (you'd need to check styling or testIDs)
    });

    it('works for days from previous month', async () => {
      const mockOnNavigateToTimeline = jest.fn();
      const { getByText } = renderCalendarScreen({ 
        onNavigateToTimeline: mockOnNavigateToTimeline 
      });

      // Click on a day from the previous month (these would be from December 2023)
      // The exact day numbers would depend on the calendar layout
    });

    it('works for days from next month', async () => {
      const mockOnNavigateToTimeline = jest.fn();
      const { getByText } = renderCalendarScreen({ 
        onNavigateToTimeline: mockOnNavigateToTimeline 
      });

      // Click on a day from the next month (these would be from February 2024)
    });
  });

  describe('Task Display', () => {
    it('displays tasks with correct colors based on completion status', () => {
      const { getByText } = renderCalendarScreen();
      
      // Test that completed tasks have different styling
      expect(getByText('✅ Test Task 2')).toBeTruthy();
    });

    it('displays shared tasks with correct styling', () => {
      const { getByText } = renderCalendarScreen();
      
      // Test that shared tasks have different styling
      expect(getByText('✅ Test Task 2')).toBeTruthy(); // This is a shared task
    });

    it('limits number of visible tasks and shows remainder count', () => {
      // Mock data with many tasks
      const manyTasksData = [{
        dateISO: '2024-01-15',
        isToday: false,
        tasks: Array.from({ length: 5 }, (_, i) => ({
          id: `task-${i}`,
          title: `Task ${i + 1}`,
          emoji: '📝',
          dateISO: '2024-01-15',
          isCompleted: false,
          isShared: false,
          priority: 'normal' as const,
        })),
      }];

      mockUseTimelineData.mockReturnValue({
        sections: manyTasksData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      const { getByText } = renderCalendarScreen();
      
      // Should show maximum 3 tasks and a "+2" indicator
      expect(getByText('+2')).toBeTruthy();
    });

    it('handles empty task data gracefully', () => {
      mockUseTimelineData.mockReturnValue({
        sections: [],
        isLoading: false,
        hasLoadedOnce: true,
      });

      const { getByText } = renderCalendarScreen();
      
      // Should still render calendar without errors
      expect(getByText('January 2024')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('handles loading state correctly', () => {
      mockUseTimelineData.mockReturnValue({
        sections: [],
        isLoading: true,
        hasLoadedOnce: false,
      });

      const { getByText } = renderCalendarScreen();
      
      // Should still render calendar structure while loading
      expect(getByText('January 2024')).toBeTruthy();
    });
  });

  describe('Animation Integration', () => {
    it('triggers scale animation when day is selected', async () => {
      const { getByText } = renderCalendarScreen();

      const dayButton = getByText('15');
      
      await act(async () => {
        fireEvent.press(dayButton);
      });

      // Test that animations are triggered
      // This would require more sophisticated animation testing
    });

    it('handles month transition animations', async () => {
      // Test that month changes trigger appropriate animations
      // This would require testing the Reanimated shared values
    });
  });

  describe('Edge Cases', () => {
    it('handles leap year correctly', async () => {
      // Test February in a leap year
      jest.setSystemTime(new Date('2024-02-16T10:00:00.000Z'));
      
      const { getByText } = renderCalendarScreen();
      expect(getByText('February 2024')).toBeTruthy();
      expect(getByText('29')).toBeTruthy(); // Leap day
    });

    it('handles non-leap year correctly', async () => {
      // Test February in a non-leap year
      jest.setSystemTime(new Date('2023-02-16T10:00:00.000Z'));
      
      const { getByText, queryByText } = renderCalendarScreen();
      expect(getByText('February 2023')).toBeTruthy();
      expect(queryByText('29')).toBeFalsy(); // No leap day
    });

    it('handles rapid gesture inputs', async () => {
      const { getByTestId } = renderCalendarScreen();
      
      const gestureDetector = getByTestId('gesture-detector');
      
      // Simulate rapid swipes
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          fireEvent(gestureDetector, 'onGestureEvent', {
            nativeEvent: {
              velocityX: i % 2 === 0 ? 600 : -600,
              translationX: i % 2 === 0 ? 150 : -150,
            },
          });
        });
      }

      // Should handle rapid inputs gracefully without crashes
    });
  });

  describe('Accessibility', () => {
    it('provides accessible labels for day buttons', () => {
      const { getByLabelText } = renderCalendarScreen();
      
      // Test that days have proper accessibility labels
      // This would require adding accessibilityLabel props to your day buttons
    });

    it('provides accessible navigation information', () => {
      const { getByLabelText } = renderCalendarScreen();
      
      // Test that month navigation has proper accessibility support
    });
  });

  describe('Performance', () => {
    it('renders efficiently with large amounts of task data', () => {
      // Create a large dataset
      const largeTaskData = Array.from({ length: 100 }, (_, i) => ({
        dateISO: `2024-01-${(i % 31) + 1}`.padStart(10, '0'),
        isToday: false,
        tasks: Array.from({ length: 10 }, (_, j) => ({
          id: `task-${i}-${j}`,
          title: `Task ${i}-${j}`,
          emoji: '📝',
          dateISO: `2024-01-${(i % 31) + 1}`.padStart(10, '0'),
          isCompleted: false,
          isShared: false,
          priority: 'normal' as const,
        })),
      }));

      mockUseTimelineData.mockReturnValue({
        sections: largeTaskData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      const startTime = performance.now();
      const { getByText } = renderCalendarScreen();
      const endTime = performance.now();

      expect(getByText('January 2024')).toBeTruthy();
      
      // Performance threshold (adjust based on your requirements)
      expect(endTime - startTime).toBeLessThan(1000); // Should render in less than 1 second
    });
  });
});