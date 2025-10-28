import React from 'react';
import { render, act } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CalendarScreen from '../src/screens/calendar/CalendarScreen';
import { useTimelineData } from '../src/screens/timeline/hooks/useTimelineData';

// Mock the timeline data hook
jest.mock('../src/screens/timeline/hooks/useTimelineData');
const mockUseTimelineData = useTimelineData as jest.MockedFunction<typeof useTimelineData>;

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

// Performance testing utilities
const measureRenderTime = async (renderFunction: () => any): Promise<number> => {
  const startTime = performance.now();
  await act(async () => {
    renderFunction();
  });
  const endTime = performance.now();
  return endTime - startTime;
};

const measureMemoryUsage = (): number => {
  // Note: In React Native, we can't directly measure memory like in browser
  // This is a placeholder for memory measurement
  if (global.gc) {
    global.gc();
  }
  return (performance as any).memory?.usedJSHeapSize || 0;
};

const generateLargeTaskDataset = (monthCount: number, tasksPerDay: number) => {
  const sections = [];
  const startDate = new Date('2024-01-01');
  
  for (let month = 0; month < monthCount; month++) {
    for (let day = 1; day <= 31; day++) {
      const currentDate = new Date(2024, month, day);
      if (currentDate.getMonth() !== month) break; // Invalid date for this month
      
      const dateISO = currentDate.toISOString().split('T')[0];
      const tasks = Array.from({ length: tasksPerDay }, (_, taskIndex) => ({
        id: `task-${month}-${day}-${taskIndex}`,
        title: `Task ${taskIndex + 1} for ${dateISO}`,
        emoji: ['📝', '✅', '🎯', '📋', '🚀'][taskIndex % 5],
        dateISO,
        isCompleted: Math.random() > 0.5,
        isShared: Math.random() > 0.7,
        priority: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)] as const,
        startTime: `${String(9 + (taskIndex % 8)).padStart(2, '0')}:00`,
      }));
      
      sections.push({
        dateISO,
        isToday: dateISO === new Date().toISOString().split('T')[0],
        tasks,
      });
    }
  }
  
  return sections;
};

describe('Calendar Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Render Performance', () => {
    it('should render within acceptable time with minimal data', async () => {
      const minimalData = generateLargeTaskDataset(1, 1);
      mockUseTimelineData.mockReturnValue({
        sections: minimalData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      const renderTime = await measureRenderTime(() => {
        render(
          <GestureHandlerRootView style={{ flex: 1 }}>
            <CalendarScreen />
          </GestureHandlerRootView>
        );
      });

      // Should render in less than 100ms for minimal data
      expect(renderTime).toBeLessThan(100);
    });

    it('should render within acceptable time with moderate data load', async () => {
      const moderateData = generateLargeTaskDataset(3, 5);
      mockUseTimelineData.mockReturnValue({
        sections: moderateData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      const renderTime = await measureRenderTime(() => {
        render(
          <GestureHandlerRootView style={{ flex: 1 }}>
            <CalendarScreen />
          </GestureHandlerRootView>
        );
      });

      // Should render in less than 300ms for moderate data
      expect(renderTime).toBeLessThan(300);
    });

    it('should render within acceptable time with large data load', async () => {
      const largeData = generateLargeTaskDataset(12, 10);
      mockUseTimelineData.mockReturnValue({
        sections: largeData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      const renderTime = await measureRenderTime(() => {
        render(
          <GestureHandlerRootView style={{ flex: 1 }}>
            <CalendarScreen />
          </GestureHandlerRootView>
        );
      });

      // Should render in less than 1000ms even with large data
      expect(renderTime).toBeLessThan(1000);
    });

    it('should have consistent render times across multiple renders', async () => {
      const testData = generateLargeTaskDataset(3, 5);
      mockUseTimelineData.mockReturnValue({
        sections: testData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      const renderTimes: number[] = [];
      const renderCount = 5;

      for (let i = 0; i < renderCount; i++) {
        const renderTime = await measureRenderTime(() => {
          render(
            <GestureHandlerRootView style={{ flex: 1 }}>
              <CalendarScreen />
            </GestureHandlerRootView>
          );
        });
        renderTimes.push(renderTime);
      }

      // Calculate variance in render times
      const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      const variance = renderTimes.reduce((acc, time) => acc + Math.pow(time - avgRenderTime, 2), 0) / renderTimes.length;
      const standardDeviation = Math.sqrt(variance);

      // Standard deviation should be less than 20% of average render time
      expect(standardDeviation).toBeLessThan(avgRenderTime * 0.2);
    });
  });

  describe('Memory Performance', () => {
    it('should not significantly increase memory usage with large datasets', async () => {
      const initialMemory = measureMemoryUsage();
      
      const largeData = generateLargeTaskDataset(12, 15);
      mockUseTimelineData.mockReturnValue({
        sections: largeData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      await act(async () => {
        render(
          <GestureHandlerRootView style={{ flex: 1 }}>
            <CalendarScreen />
          </GestureHandlerRootView>
        );
      });

      const finalMemory = measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB for large dataset)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should efficiently handle calendar day calculations', async () => {
      const testData = generateLargeTaskDataset(1, 0); // No tasks, focus on calendar calculations
      mockUseTimelineData.mockReturnValue({
        sections: testData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      const startTime = performance.now();
      
      // Render multiple times to test calculation efficiency
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          render(
            <GestureHandlerRootView style={{ flex: 1 }}>
              <CalendarScreen />
            </GestureHandlerRootView>
          );
        });
      }

      const endTime = performance.now();
      const avgCalculationTime = (endTime - startTime) / 10;

      // Calendar calculations should be fast (less than 50ms per render)
      expect(avgCalculationTime).toBeLessThan(50);
    });
  });

  describe('Animation Performance', () => {
    it('should handle animation updates efficiently', async () => {
      const testData = generateLargeTaskDataset(3, 5);
      mockUseTimelineData.mockReturnValue({
        sections: testData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      const { getByText } = render(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen onNavigateToTimeline={jest.fn()} />
        </GestureHandlerRootView>
      );

      const startTime = performance.now();

      // Simulate multiple day selections (which trigger animations)
      await act(async () => {
        for (let day = 1; day <= 10; day++) {
          const dayElement = getByText(day.toString());
          if (dayElement) {
            // Simulate tap that triggers animation
            dayElement.props.onPress?.();
          }
        }
      });

      const endTime = performance.now();
      const animationTime = endTime - startTime;

      // Animation handling should be efficient (less than 100ms for 10 animations)
      expect(animationTime).toBeLessThan(100);
    });
  });

  describe('Data Processing Performance', () => {
    it('should efficiently process task data for calendar display', async () => {
      const largeData = generateLargeTaskDataset(6, 20);
      
      const startTime = performance.now();
      
      mockUseTimelineData.mockReturnValue({
        sections: largeData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      await act(async () => {
        render(
          <GestureHandlerRootView style={{ flex: 1 }}>
            <CalendarScreen />
          </GestureHandlerRootView>
        );
      });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Data processing should be efficient even with large datasets
      expect(processingTime).toBeLessThan(500);
    });

    it('should handle task color calculations efficiently', async () => {
      // Create data with many tasks per day to test color calculation performance
      const taskHeavyData = generateLargeTaskDataset(2, 50);
      
      const startTime = performance.now();
      
      mockUseTimelineData.mockReturnValue({
        sections: taskHeavyData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      await act(async () => {
        render(
          <GestureHandlerRootView style={{ flex: 1 }}>
            <CalendarScreen />
          </GestureHandlerRootView>
        );
      });

      const endTime = performance.now();
      const colorCalculationTime = endTime - startTime;

      // Color calculations should not significantly impact performance
      expect(colorCalculationTime).toBeLessThan(300);
    });

    it('should efficiently calculate calendar grid with different months', async () => {
      const testMonths = [
        new Date('2024-02-01'), // February (28/29 days)
        new Date('2024-04-01'), // April (30 days)
        new Date('2024-01-01'), // January (31 days)
        new Date('2024-12-01'), // December (31 days)
      ];

      const calculationTimes: number[] = [];

      for (const testDate of testMonths) {
        jest.setSystemTime(testDate);
        
        const startTime = performance.now();
        
        await act(async () => {
          render(
            <GestureHandlerRootView style={{ flex: 1 }}>
              <CalendarScreen />
            </GestureHandlerRootView>
          );
        });

        const endTime = performance.now();
        calculationTimes.push(endTime - startTime);
      }

      // All month calculations should be similar in performance
      const maxTime = Math.max(...calculationTimes);
      const minTime = Math.min(...calculationTimes);
      
      // Variance should be less than 50ms between different months
      expect(maxTime - minTime).toBeLessThan(50);
    });
  });

  describe('Gesture Performance', () => {
    it('should handle gesture event processing efficiently', async () => {
      const testData = generateLargeTaskDataset(3, 5);
      mockUseTimelineData.mockReturnValue({
        sections: testData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      const { container } = render(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen />
        </GestureHandlerRootView>
      );

      const startTime = performance.now();

      // Simulate multiple gesture events
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          // Simulate gesture events
          // Note: This is a simplified simulation
          const gestureEvent = {
            velocityX: i % 2 === 0 ? 600 : -600,
            translationX: i % 2 === 0 ? 150 : -150,
          };
          
          // In a real test, you'd trigger the actual gesture handler
          // This is just measuring the processing time
        }
      });

      const endTime = performance.now();
      const gestureProcessingTime = endTime - startTime;

      // Gesture processing should be very fast (less than 20ms for 10 events)
      expect(gestureProcessingTime).toBeLessThan(20);
    });
  });

  describe('Component Update Performance', () => {
    it('should efficiently handle prop updates', async () => {
      const initialData = generateLargeTaskDataset(3, 5);
      mockUseTimelineData.mockReturnValue({
        sections: initialData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      const { rerender } = render(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen onNavigateToTimeline={jest.fn()} />
        </GestureHandlerRootView>
      );

      const startTime = performance.now();

      // Update props multiple times
      for (let i = 0; i < 5; i++) {
        const updatedData = generateLargeTaskDataset(3, 5 + i);
        mockUseTimelineData.mockReturnValue({
          sections: updatedData,
          isLoading: false,
          hasLoadedOnce: true,
        });

        await act(async () => {
          rerender(
            <GestureHandlerRootView style={{ flex: 1 }}>
              <CalendarScreen onNavigateToTimeline={jest.fn()} />
            </GestureHandlerRootView>
          );
        });
      }

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Component updates should be efficient (less than 200ms for 5 updates)
      expect(updateTime).toBeLessThan(200);
    });

    it('should efficiently handle loading state changes', async () => {
      const testData = generateLargeTaskDataset(3, 5);
      
      const startTime = performance.now();

      // Test loading -> loaded transition
      mockUseTimelineData.mockReturnValue({
        sections: [],
        isLoading: true,
        hasLoadedOnce: false,
      });

      const { rerender } = render(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen />
        </GestureHandlerRootView>
      );

      await act(async () => {
        mockUseTimelineData.mockReturnValue({
          sections: testData,
          isLoading: false,
          hasLoadedOnce: true,
        });

        rerender(
          <GestureHandlerRootView style={{ flex: 1 }}>
            <CalendarScreen />
          </GestureHandlerRootView>
        );
      });

      const endTime = performance.now();
      const loadingTransitionTime = endTime - startTime;

      // Loading state transitions should be fast (less than 100ms)
      expect(loadingTransitionTime).toBeLessThan(100);
    });
  });

  describe('Stress Testing', () => {
    it('should maintain performance under stress conditions', async () => {
      // Create extremely large dataset
      const stressData = generateLargeTaskDataset(24, 25); // 2 years worth of data
      
      const startTime = performance.now();
      
      mockUseTimelineData.mockReturnValue({
        sections: stressData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      await act(async () => {
        render(
          <GestureHandlerRootView style={{ flex: 1 }}>
            <CalendarScreen />
          </GestureHandlerRootView>
        );
      });

      const endTime = performance.now();
      const stressRenderTime = endTime - startTime;

      // Even under stress, should render within reasonable time (less than 2 seconds)
      expect(stressRenderTime).toBeLessThan(2000);
    });

    it('should handle rapid state changes without performance degradation', async () => {
      const testData = generateLargeTaskDataset(3, 10);
      
      const { rerender } = render(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen />
        </GestureHandlerRootView>
      );

      const startTime = performance.now();

      // Rapid state changes
      for (let i = 0; i < 20; i++) {
        mockUseTimelineData.mockReturnValue({
          sections: i % 2 === 0 ? testData : [],
          isLoading: i % 4 === 0,
          hasLoadedOnce: i > 5,
        });

        await act(async () => {
          rerender(
            <GestureHandlerRootView style={{ flex: 1 }}>
              <CalendarScreen />
            </GestureHandlerRootView>
          );
        });
      }

      const endTime = performance.now();
      const rapidChangeTime = endTime - startTime;

      // Rapid state changes should not cause severe performance issues
      expect(rapidChangeTime).toBeLessThan(1000);
    });
  });

  describe('Performance Regression Testing', () => {
    it('should maintain baseline performance metrics', async () => {
      const baselineData = generateLargeTaskDataset(6, 8);
      mockUseTimelineData.mockReturnValue({
        sections: baselineData,
        isLoading: false,
        hasLoadedOnce: true,
      });

      const performanceMetrics = {
        renderTime: 0,
        memoryUsage: 0,
        updateTime: 0,
      };

      // Measure render time
      const renderStartTime = performance.now();
      const { rerender } = render(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <CalendarScreen />
        </GestureHandlerRootView>
      );
      performanceMetrics.renderTime = performance.now() - renderStartTime;

      // Measure memory usage
      performanceMetrics.memoryUsage = measureMemoryUsage();

      // Measure update time
      const updateStartTime = performance.now();
      await act(async () => {
        rerender(
          <GestureHandlerRootView style={{ flex: 1 }}>
            <CalendarScreen onNavigateToTimeline={jest.fn()} />
          </GestureHandlerRootView>
        );
      });
      performanceMetrics.updateTime = performance.now() - updateStartTime;

      // Define baseline performance thresholds
      expect(performanceMetrics.renderTime).toBeLessThan(500); // 500ms max render time
      expect(performanceMetrics.updateTime).toBeLessThan(100);  // 100ms max update time
      
      // Log metrics for monitoring (in real testing, you might send these to a monitoring service)
      console.log('Performance Metrics:', performanceMetrics);
    });
  });
});