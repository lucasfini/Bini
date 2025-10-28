import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, typography, spacing, shadows } from '../../styles';
import { useTimelineData } from '../timeline/hooks/useTimelineData';
import { Task } from '../timeline/types';

const { width } = Dimensions.get('window');

// Task colors for different types
const getTaskColor = (task: Task, index: number) => {
  if (task.isCompleted) return colors.completed;
  if (task.isShared) return colors.shared;
  
  // Cycle through different colors for variety
  const colors_array = [colors.primary, colors.secondary, colors.accentSuccess, colors.accentInfo, colors.warning];
  return colors_array[index % colors_array.length];
};

interface CalendarScreenProps {
  onNavigateToTimeline?: (route: string, params?: { selectedDate?: string }) => void;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ onNavigateToTimeline }) => {
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { sections } = useTimelineData();
  
  // Animation values
  const monthTransition = useSharedValue(0);
  const calendarScale = useSharedValue(1);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Get previous month's last days to fill the grid
  const prevMonth = new Date(year, month - 1, 0);
  const daysInPrevMonth = prevMonth.getDate();

  // Create tasks lookup by date
  const tasksByDate = useMemo(() => {
    const lookup: Record<string, Task[]> = {};
    sections.forEach(section => {
      lookup[section.dateISO] = section.tasks;
    });
    return lookup;
  }, [sections]);

  // Generate calendar grid (42 days - 6 weeks)
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      const prevYear = month === 0 ? year - 1 : year;
      const prevMonth = month === 0 ? 12 : month;
      const dateString = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        date,
        dateString,
        isCurrentMonth: false,
        tasks: tasksByDate[dateString] || []
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Create date string directly to avoid any timezone issues
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        date,
        dateString,
        isCurrentMonth: true,
        tasks: tasksByDate[dateString] || []
      });
    }

    // Next month's days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const nextYear = month === 11 ? year + 1 : year;
      const nextMonth = month === 11 ? 1 : month + 2;
      const dateString = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        date,
        dateString,
        isCurrentMonth: false,
        tasks: tasksByDate[dateString] || []
      });
    }

    return days;
  }, [year, month, daysInMonth, startingDayOfWeek, daysInPrevMonth, tasksByDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
  };

  // Swipe gesture for month navigation
  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      const { velocityX, translationX } = event;
      
      // Determine swipe direction based on velocity and translation
      if (Math.abs(velocityX) > 500 || Math.abs(translationX) > 100) {
        if (velocityX > 0 || translationX > 0) {
          // Swipe right - go to previous month
          runOnJS(goToPreviousMonth)();
        } else {
          // Swipe left - go to next month
          runOnJS(goToNextMonth)();
        }
      }
    });

  const handleDayPress = (dateString: string) => {
    setSelectedDate(dateString);
    calendarScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    // Navigate to timeline with the selected date
    console.log('📅 Calendar: Navigating to timeline with date:', dateString);
    if (onNavigateToTimeline) {
      onNavigateToTimeline('Timeline', { selectedDate: dateString });
    }
  };

  // Animated styles
  const monthAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(monthTransition.value, [-1, 0, 1], [-50, 0, 50]);
    const opacity = interpolate(monthTransition.value, [-1, 0, 1], [0.7, 1, 0.7]);
    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  const calendarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: calendarScale.value }],
    };
  });

  const renderTasksInDay = (tasks: Task[], daySize: number) => {
    if (tasks.length === 0) return null;

    const maxVisible = daySize > 50 ? 3 : 2; // Adjust based on day cell size
    const visibleTasks = tasks.slice(0, maxVisible);
    const remainingCount = tasks.length - maxVisible;

    return (
      <View style={styles.tasksContainer}>
        {visibleTasks.map((task, index) => (
          <View
            key={task.id}
            style={[
              styles.taskDot,
              {
                backgroundColor: getTaskColor(task, index),
                opacity: task.isCompleted ? 0.5 : 1,
              }
            ]}
          >
            <Text style={styles.taskText} numberOfLines={1}>
              {task.emoji || '•'} {task.title}
            </Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[styles.taskDot, { backgroundColor: colors.textTertiary }]}>
            <Text style={styles.taskText}>+{remainingCount}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Month */}
      <Animated.View style={[styles.monthHeader, monthAnimatedStyle]}>
        <Animated.Text style={styles.monthTitle}>
          {monthNames[month]} {year}
        </Animated.Text>
      </Animated.View>

      {/* Calendar Grid - Full Screen with Swipe Gestures */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.calendarContainer, calendarAnimatedStyle]}>
          {/* Week headers */}
          <View style={styles.weekHeaderRow}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekHeaderCell}>
                <Text style={styles.weekHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar days */}
          <View style={styles.daysGrid}>
            {calendarDays.map((item, index) => {
              const isToday = item.dateString === todayString;
              const isSelected = item.dateString === selectedDate;
              const hasTasks = item.tasks.length > 0;

              return (
                <Pressable
                  key={`${item.dateString}-${index}`}
                  style={[
                    styles.dayCell,
                    !item.isCurrentMonth && styles.dayOtherMonth,
                    isToday && styles.dayToday,
                    isSelected && styles.daySelected,
                    hasTasks && styles.dayWithTasks,
                  ]}
                  onPress={() => handleDayPress(item.dateString)}
                  android_ripple={{ color: colors.primary, radius: 30 }}
                >
                  <View style={styles.dayContent}>
                    <Text
                      style={[
                        styles.dayText,
                        !item.isCurrentMonth && styles.dayTextOtherMonth,
                        isToday && styles.dayTextToday,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {item.day}
                    </Text>
                    {renderTasksInDay(item.tasks, 80)}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Month Header
  monthHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'left',
  },

  // Calendar - Full Screen
  calendarContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  weekHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  weekHeaderText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },

  // Days Grid
  daysGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    alignContent: 'flex-start',
  },
  dayCell: {
    width: (width - spacing.md * 2 - 12) / 7, // Account for padding and gaps
    height: 80, // Fixed height for better layout
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  dayOtherMonth: {
    backgroundColor: 'transparent',
    opacity: 0.3,
  },
  dayToday: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  daySelected: {
    backgroundColor: colors.secondary,
    ...shadows.lg,
  },
  dayWithTasks: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayContent: {
    flex: 1,
    padding: spacing.xs,
    alignItems: 'center',
  },
  dayText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  dayTextOtherMonth: {
    color: colors.textTertiary,
  },
  dayTextToday: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },

  // Tasks in day cells
  tasksContainer: {
    flex: 1,
    width: '100%',
    gap: 1,
  },
  taskDot: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    minHeight: 12,
    justifyContent: 'center',
  },
  taskText: {
    fontSize: 8,
    fontWeight: typography.weights.medium,
    color: colors.white,
    textAlign: 'center',
  },

});

export default CalendarScreen;