import { Task, DaySection } from '../../src/screens/timeline/types';

/**
 * Calendar Testing Utilities
 * 
 * This module provides comprehensive testing utilities for the CalendarScreen component,
 * including mock data generators, gesture simulators, and validation helpers.
 */

// Type definitions for test data
export interface MockTaskOptions {
  id?: string;
  title?: string;
  emoji?: string;
  dateISO?: string;
  isCompleted?: boolean;
  isShared?: boolean;
  priority?: 'low' | 'normal' | 'high';
  startTime?: string;
}

export interface MockGestureEvent {
  velocityX: number;
  translationX: number;
  velocityY?: number;
  translationY?: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  animationFrames?: number;
}

/**
 * Mock Data Generators
 */
export class MockDataGenerator {
  /**
   * Creates a mock task with default or custom properties
   */
  static createTask(dateISO: string, options: MockTaskOptions = {}): Task {
    const id = options.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      title: options.title || `Mock Task ${id.slice(-4)}`,
      emoji: options.emoji || '📝',
      dateISO: options.dateISO || dateISO,
      isCompleted: options.isCompleted ?? false,
      isShared: options.isShared ?? false,
      priority: options.priority || 'normal',
      startTime: options.startTime || '09:00',
    };
  }

  /**
   * Creates a day section with multiple tasks
   */
  static createDaySection(dateISO: string, taskCount: number = 3, taskOptions: MockTaskOptions = {}): DaySection {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      dateISO,
      isToday: dateISO === today,
      tasks: Array.from({ length: taskCount }, (_, index) => 
        this.createTask(dateISO, {
          ...taskOptions,
          id: `${dateISO}-task-${index}`,
          title: taskOptions.title || `Task ${index + 1} for ${dateISO}`,
          isCompleted: taskOptions.isCompleted ?? (index % 2 === 0),
          isShared: taskOptions.isShared ?? (index % 3 === 0),
        })
      ),
    };
  }

  /**
   * Creates timeline data spanning multiple dates
   */
  static createTimelineData(
    startDate: string, 
    dayCount: number, 
    tasksPerDay: number = 2,
    taskOptions: MockTaskOptions = {}
  ): DaySection[] {
    const sections: DaySection[] = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < dayCount; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateISO = currentDate.toISOString().split('T')[0];
      
      sections.push(this.createDaySection(dateISO, tasksPerDay, taskOptions));
    }
    
    return sections;
  }

  /**
   * Creates a large dataset for performance testing
   */
  static createLargeDataset(monthCount: number, tasksPerDay: number): DaySection[] {
    const sections: DaySection[] = [];
    const startDate = new Date('2024-01-01');
    
    for (let month = 0; month < monthCount; month++) {
      for (let day = 1; day <= 31; day++) {
        const currentDate = new Date(2024, month, day);
        
        // Skip invalid dates (like Feb 30)
        if (currentDate.getMonth() !== month) continue;
        
        const dateISO = currentDate.toISOString().split('T')[0];
        sections.push(this.createDaySection(dateISO, tasksPerDay));
      }
    }
    
    return sections;
  }

  /**
   * Creates test data with specific patterns for edge case testing
   */
  static createEdgeCaseData(): DaySection[] {
    return [
      // Empty day
      this.createDaySection('2024-01-01', 0),
      
      // Day with many tasks (overflow testing)
      this.createDaySection('2024-01-15', 10),
      
      // Day with only completed tasks
      this.createDaySection('2024-01-20', 3, { isCompleted: true }),
      
      // Day with only shared tasks
      this.createDaySection('2024-01-25', 3, { isShared: true }),
      
      // Day with mixed priority tasks
      {
        dateISO: '2024-01-30',
        isToday: false,
        tasks: [
          this.createTask('2024-01-30', { priority: 'high', title: 'High Priority Task' }),
          this.createTask('2024-01-30', { priority: 'normal', title: 'Normal Priority Task' }),
          this.createTask('2024-01-30', { priority: 'low', title: 'Low Priority Task' }),
        ],
      },
    ];
  }
}

/**
 * Gesture Simulation Utilities
 */
export class GestureSimulator {
  /**
   * Creates a swipe left gesture event (next month)
   */
  static swipeLeft(strength: 'weak' | 'normal' | 'strong' = 'normal'): MockGestureEvent {
    const multiplier = this.getStrengthMultiplier(strength);
    
    return {
      velocityX: -600 * multiplier,
      translationX: -150 * multiplier,
      velocityY: 0,
      translationY: 0,
    };
  }

  /**
   * Creates a swipe right gesture event (previous month)
   */
  static swipeRight(strength: 'weak' | 'normal' | 'strong' = 'normal'): MockGestureEvent {
    const multiplier = this.getStrengthMultiplier(strength);
    
    return {
      velocityX: 600 * multiplier,
      translationX: 150 * multiplier,
      velocityY: 0,
      translationY: 0,
    };
  }

  /**
   * Creates a gesture that should be ignored (below thresholds)
   */
  static weakGesture(): MockGestureEvent {
    return {
      velocityX: 200, // Below 500 threshold
      translationX: 50, // Below 100 threshold
      velocityY: 0,
      translationY: 0,
    };
  }

  /**
   * Creates a vertical swipe (should not trigger month navigation)
   */
  static verticalSwipe(direction: 'up' | 'down' = 'up'): MockGestureEvent {
    const multiplier = direction === 'up' ? -1 : 1;
    
    return {
      velocityX: 0,
      translationX: 0,
      velocityY: 600 * multiplier,
      translationY: 150 * multiplier,
    };
  }

  /**
   * Creates a diagonal swipe
   */
  static diagonalSwipe(xDirection: 'left' | 'right', yDirection: 'up' | 'down'): MockGestureEvent {
    const xMultiplier = xDirection === 'left' ? -1 : 1;
    const yMultiplier = yDirection === 'up' ? -1 : 1;
    
    return {
      velocityX: 600 * xMultiplier,
      translationX: 150 * xMultiplier,
      velocityY: 300 * yMultiplier,
      translationY: 75 * yMultiplier,
    };
  }

  /**
   * Creates a high velocity, low translation gesture
   */
  static highVelocityLowTranslation(direction: 'left' | 'right'): MockGestureEvent {
    const multiplier = direction === 'left' ? -1 : 1;
    
    return {
      velocityX: 800 * multiplier, // High velocity
      translationX: 50 * multiplier, // Low translation
      velocityY: 0,
      translationY: 0,
    };
  }

  /**
   * Creates a low velocity, high translation gesture
   */
  static lowVelocityHighTranslation(direction: 'left' | 'right'): MockGestureEvent {
    const multiplier = direction === 'left' ? -1 : 1;
    
    return {
      velocityX: 300 * multiplier, // Low velocity
      translationX: 200 * multiplier, // High translation
      velocityY: 0,
      translationY: 0,
    };
  }

  private static getStrengthMultiplier(strength: 'weak' | 'normal' | 'strong'): number {
    switch (strength) {
      case 'weak': return 0.5;
      case 'strong': return 2;
      default: return 1;
    }
  }
}

/**
 * Date and Time Utilities
 */
export class DateTestUtils {
  /**
   * Sets up a mock date for consistent testing
   */
  static mockDate(dateString: string): void {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(dateString));
  }

  /**
   * Resets date mocking
   */
  static resetDate(): void {
    jest.useRealTimers();
  }

  /**
   * Gets the first day of the week for a given date (0 = Sunday)
   */
  static getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
  }

  /**
   * Gets the number of days in a month
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Checks if a year is a leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Generates date strings for a month
   */
  static generateMonthDates(year: number, month: number): string[] {
    const daysInMonth = this.getDaysInMonth(year, month);
    const dates: string[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dates.push(dateString);
    }
    
    return dates;
  }

  /**
   * Gets the next month/year combination
   */
  static getNextMonth(year: number, month: number): { year: number; month: number } {
    if (month === 11) {
      return { year: year + 1, month: 0 };
    }
    return { year, month: month + 1 };
  }

  /**
   * Gets the previous month/year combination
   */
  static getPreviousMonth(year: number, month: number): { year: number; month: number } {
    if (month === 0) {
      return { year: year - 1, month: 11 };
    }
    return { year, month: month - 1 };
  }
}

/**
 * Performance Testing Utilities
 */
export class PerformanceTestUtils {
  /**
   * Measures the execution time of a function
   */
  static async measureExecutionTime<T>(fn: () => Promise<T> | T): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    return {
      result,
      duration: end - start,
    };
  }

  /**
   * Measures memory usage (limited in React Native environment)
   */
  static measureMemoryUsage(): number {
    if (global.gc) {
      global.gc();
    }
    return (performance as any).memory?.usedJSHeapSize || 0;
  }

  /**
   * Creates a performance benchmark
   */
  static createBenchmark(name: string) {
    const startTime = performance.now();
    let startMemory = this.measureMemoryUsage();
    
    return {
      finish: (): PerformanceMetrics => {
        const endTime = performance.now();
        const endMemory = this.measureMemoryUsage();
        
        const metrics: PerformanceMetrics = {
          renderTime: endTime - startTime,
          memoryUsage: endMemory - startMemory,
        };
        
        console.log(`Performance Benchmark [${name}]:`, metrics);
        return metrics;
      },
    };
  }

  /**
   * Validates performance against thresholds
   */
  static validatePerformance(
    metrics: PerformanceMetrics,
    thresholds: { maxRenderTime?: number; maxMemoryUsage?: number }
  ): { passed: boolean; failures: string[] } {
    const failures: string[] = [];
    
    if (thresholds.maxRenderTime && metrics.renderTime > thresholds.maxRenderTime) {
      failures.push(`Render time ${metrics.renderTime}ms exceeds threshold ${thresholds.maxRenderTime}ms`);
    }
    
    if (thresholds.maxMemoryUsage && metrics.memoryUsage > thresholds.maxMemoryUsage) {
      failures.push(`Memory usage ${metrics.memoryUsage} bytes exceeds threshold ${thresholds.maxMemoryUsage} bytes`);
    }
    
    return {
      passed: failures.length === 0,
      failures,
    };
  }
}

/**
 * Validation Utilities
 */
export class ValidationUtils {
  /**
   * Validates that a month title is correctly formatted
   */
  static validateMonthTitle(title: string, expectedMonth: number, expectedYear: number): boolean {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const expectedTitle = `${monthNames[expectedMonth]} ${expectedYear}`;
    return title === expectedTitle;
  }

  /**
   * Validates calendar grid structure
   */
  static validateCalendarGrid(days: any[], expectedMonth: number, expectedYear: number): boolean {
    // Should have 42 days (6 weeks × 7 days)
    if (days.length !== 42) return false;
    
    // Find the first day of the current month
    const firstCurrentMonthIndex = days.findIndex(day => day.isCurrentMonth && day.day === 1);
    if (firstCurrentMonthIndex === -1) return false;
    
    // Validate that the first day appears on the correct day of the week
    const expectedDayOfWeek = DateTestUtils.getFirstDayOfMonth(expectedYear, expectedMonth);
    return firstCurrentMonthIndex === expectedDayOfWeek;
  }

  /**
   * Validates task display limits
   */
  static validateTaskDisplay(tasksDisplayed: number, totalTasks: number, maxDisplay: number = 3): boolean {
    if (totalTasks <= maxDisplay) {
      return tasksDisplayed === totalTasks;
    } else {
      return tasksDisplayed === maxDisplay;
    }
  }

  /**
   * Validates gesture threshold logic
   */
  static shouldTriggerNavigation(gesture: MockGestureEvent): boolean {
    const velocityThreshold = 500;
    const translationThreshold = 100;
    
    return Math.abs(gesture.velocityX) > velocityThreshold || 
           Math.abs(gesture.translationX) > translationThreshold;
  }
}

/**
 * Test Assertion Helpers
 */
export class AssertionHelpers {
  /**
   * Asserts that performance metrics meet requirements
   */
  static assertPerformance(
    metrics: PerformanceMetrics,
    requirements: { maxRenderTime?: number; maxMemoryUsage?: number }
  ): void {
    if (requirements.maxRenderTime && metrics.renderTime > requirements.maxRenderTime) {
      throw new Error(`Render time ${metrics.renderTime}ms exceeds requirement ${requirements.maxRenderTime}ms`);
    }
    
    if (requirements.maxMemoryUsage && metrics.memoryUsage > requirements.maxMemoryUsage) {
      throw new Error(`Memory usage ${metrics.memoryUsage} bytes exceeds requirement ${requirements.maxMemoryUsage} bytes`);
    }
  }

  /**
   * Asserts that month navigation occurred correctly
   */
  static assertMonthChange(
    initialMonth: string,
    newMonth: string,
    direction: 'next' | 'previous'
  ): void {
    // Parse month titles to compare
    const parseMonthTitle = (title: string) => {
      const [monthName, year] = title.split(' ');
      const monthIndex = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ].indexOf(monthName);
      return { month: monthIndex, year: parseInt(year) };
    };
    
    const initial = parseMonthTitle(initialMonth);
    const current = parseMonthTitle(newMonth);
    
    if (direction === 'next') {
      const expected = DateTestUtils.getNextMonth(initial.year, initial.month);
      if (current.month !== expected.month || current.year !== expected.year) {
        throw new Error(`Expected next month to be ${expected.month + 1}/${expected.year}, got ${current.month + 1}/${current.year}`);
      }
    } else {
      const expected = DateTestUtils.getPreviousMonth(initial.year, initial.month);
      if (current.month !== expected.month || current.year !== expected.year) {
        throw new Error(`Expected previous month to be ${expected.month + 1}/${expected.year}, got ${current.month + 1}/${current.year}`);
      }
    }
  }
}

// Export convenience functions
export const createMockTask = MockDataGenerator.createTask;
export const createMockTimelineData = MockDataGenerator.createTimelineData;
export const simulateSwipe = {
  left: GestureSimulator.swipeLeft,
  right: GestureSimulator.swipeRight,
  weak: GestureSimulator.weakGesture,
};
export const mockDate = DateTestUtils.mockDate;
export const resetDate = DateTestUtils.resetDate;
export const measurePerformance = PerformanceTestUtils.measureExecutionTime;