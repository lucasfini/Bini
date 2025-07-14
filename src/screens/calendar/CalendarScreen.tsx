import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { YStack, XStack } from 'tamagui';
import { colors, typography, spacing, shadows } from '../../styles';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width - (spacing.lg * 2);
const DAY_SIZE = (CALENDAR_WIDTH - (spacing.sm * 6)) / 7;

interface CalendarDay {
  date: number;
  hasEvents: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  events?: Array<{
    id: string;
    title: string;
    emoji: string;
    isShared: boolean;
  }>;
}

interface MonthData {
  month: string;
  year: number;
  days: CalendarDay[];
}

// Generate calendar data
const generateCalendarData = (month: number, year: number): MonthData => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days: CalendarDay[] = [];
  const today = new Date();
  
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const isCurrentMonth = currentDate.getMonth() === month;
    const isToday = currentDate.toDateString() === today.toDateString();
    const hasEvents = Math.random() > 0.7; // Random events for demo
    
    days.push({
      date: currentDate.getDate(),
      hasEvents: hasEvents && isCurrentMonth,
      isToday,
      isCurrentMonth,
      events: hasEvents ? [
        {
          id: '1',
          title: 'Morning Workout',
          emoji: '💪',
          isShared: false,
        },
        {
          id: '2',
          title: 'Grocery Shopping',
          emoji: '🛒',
          isShared: true,
        }
      ] : [],
    });
  }
  
  return {
    month: monthNames[month],
    year,
    days,
  };
};

const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<CalendarDay | null>(null);
  
  const monthData = generateCalendarData(
    currentDate.getMonth(),
    currentDate.getFullYear()
  );
  
  const todaysTasks = [
    { emoji: '💪', title: 'Morning Workout', assignee: 'Alex' },
    { emoji: '🛒', title: 'Grocery Shopping', assignee: 'Shared' },
    { emoji: '📚', title: 'Read Chapter 5', assignee: 'Blake' },
    { emoji: '🍽️', title: 'Cook Dinner', assignee: 'Shared' },
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const CalendarDay: React.FC<{ day: CalendarDay; onPress: () => void }> = ({ day, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.calendarDay,
        day.isToday && styles.calendarDayToday,
        !day.isCurrentMonth && styles.calendarDayInactive,
        selectedDate?.date === day.date && styles.calendarDaySelected,
      ]}
    >
      <Text style={[
        styles.calendarDayText,
        day.isToday && styles.calendarDayTextToday,
        !day.isCurrentMonth && styles.calendarDayTextInactive,
        selectedDate?.date === day.date && styles.calendarDayTextSelected,
      ]}>
        {day.date}
      </Text>
      {day.hasEvents && (
        <View style={[
          styles.eventDot,
          day.isToday && styles.eventDotToday,
        ]} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <YStack padding="$4" backgroundColor="white" borderBottomLeftRadius="$7" borderBottomRightRadius="$7" shadowColor="black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.1} shadowRadius={8} elevation={4}>
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Text style={styles.navButton}>◀</Text>
          </TouchableOpacity>
          <YStack alignItems="center">
            <Text style={styles.monthTitle}>{monthData.month} {monthData.year}</Text>
            <Text style={styles.monthSubtitle}>Monthly Overview</Text>
          </YStack>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <Text style={styles.navButton}>▶</Text>
          </TouchableOpacity>
        </XStack>
      </YStack>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendar}>
            {/* Week headers */}
            <View style={styles.weekHeader}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <View key={index} style={styles.weekHeaderDay}>
                  <Text style={styles.weekHeaderText}>{day}</Text>
                </View>
              ))}
            </View>
            
            {/* Calendar days */}
            <View style={styles.calendarGrid}>
              {monthData.days.map((day, index) => (
                <CalendarDay
                  key={index}
                  day={day}
                  onPress={() => setSelectedDate(day)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Today's Summary</Text>
          
          <XStack gap="$3" marginBottom="$4">
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxGold]}>
              <Text style={[styles.statNumber, styles.statNumberGold]}>2</Text>
              <Text style={styles.statLabel}>Shared</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxBlue]}>
              <Text style={[styles.statNumber, styles.statNumberBlue]}>1</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </XStack>
          
          <YStack gap="$2">
            {todaysTasks.map((task, index) => (
              <XStack key={index} alignItems="center" gap="$3">
                <Text style={styles.taskEmoji}>{task.emoji}</Text>
                <YStack flex={1}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskAssignee}>({task.assignee})</Text>
                </YStack>
              </XStack>
            ))}
          </YStack>
        </View>

        {/* Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.cardTitle}>Legend</Text>
          
          <YStack gap="$3">
            <XStack alignItems="center" gap="$3">
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>My Tasks</Text>
            </XStack>
            <XStack alignItems="center" gap="$3">
              <View style={[styles.legendDot, styles.legendDotGold]} />
              <Text style={styles.legendText}>Partner's Tasks</Text>
            </XStack>
            <XStack alignItems="center" gap="$3">
              <View style={[styles.legendDot, styles.legendDotShared]} />
              <Text style={styles.legendText}>Shared Goals</Text>
            </XStack>
          </YStack>
        </View>

        {/* Weekly Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>This Week's Progress</Text>
          
          <YStack gap="$3" marginTop="$3">
            <View>
              <XStack justifyContent="space-between" marginBottom="$1">
                <Text style={styles.progressLabel}>Tasks Completed</Text>
                <Text style={styles.progressPercentage}>75%</Text>
              </XStack>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
            </View>
            
            <View>
              <XStack justifyContent="space-between" marginBottom="$1">
                <Text style={styles.progressLabel}>Shared Goals</Text>
                <Text style={styles.progressPercentage}>60%</Text>
              </XStack>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, styles.progressFillGold, { width: '60%' }]} />
              </View>
            </View>
          </YStack>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  monthTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  monthSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  navButton: {
    fontSize: typography.sizes.lg,
    color: colors.primary,
    fontWeight: typography.weights.bold,
    padding: spacing.sm,
  },
  calendarContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  calendar: {
    width: '100%',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  weekHeaderDay: {
    width: DAY_SIZE,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  weekHeaderText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DAY_SIZE / 2,
    marginBottom: spacing.xs,
    position: 'relative',
  },
  calendarDayToday: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  calendarDaySelected: {
    backgroundColor: colors.secondary,
    ...shadows.sm,
  },
  calendarDayInactive: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  calendarDayTextToday: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  calendarDayTextSelected: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  calendarDayTextInactive: {
    color: colors.textSecondary,
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
  eventDotToday: {
    backgroundColor: colors.white,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  statBoxGold: {
    backgroundColor: colors.secondary + '15',
  },
  statBoxBlue: {
    backgroundColor: colors.timelineActive + '15',
  },
  statNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 2,
  },
  statNumberGold: {
    color: colors.secondary,
  },
  statNumberBlue: {
    color: colors.timelineActive,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  taskEmoji: {
    fontSize: 20,
  },
  taskTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  taskAssignee: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  legendCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  legendDotGold: {
    backgroundColor: colors.secondary,
  },
  legendDotShared: {
    backgroundColor: colors.timelineActive,
  },
  legendText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  progressLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  progressPercentage: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressFillGold: {
    backgroundColor: colors.secondary,
  },
});

export default CalendarScreen;