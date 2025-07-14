import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Calendar, Search, Filter, ChevronLeft, ChevronRight } from '@tamagui/lucide-icons';
import { colors, typography, spacing, shadows } from '../../styles';
import { useReactions, ReactionDisplay } from '../../components/reactions/ReactionSystem';

const { width } = Dimensions.get('window');

// Types for our enhanced tasks
interface Task {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  time: string;
  endTime: string;
  date: string;
  isShared: boolean;
  isCompleted: boolean;
  assignedTo: string[];
  category?: string;
  gradientColors: string[];
  reactions: Array<{
    emoji: string;
    count: number;
    isFromPartner: boolean;
  }>;
}

// Generate week dates around today
const generateWeekDates = () => {
  const today = new Date();
  const dates = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Get 5 days starting from 2 days ago
  for (let i = -2; i <= 2; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      day: days[date.getDay()],
      date: date.getDate(),
      isToday: i === 0,
      fullDate: date,
      month: months[date.getMonth()],
      year: date.getFullYear(),
    });
  }
  return dates;
};

// Enhanced mock data with gradients
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Morning Workout',
    subtitle: 'Strength training session at the gym',
    emoji: '💪',
    time: '8:00',
    endTime: '9:00',
    date: 'today',
    isShared: false,
    isCompleted: false,
    assignedTo: ['Alex'],
    category: 'HEALTH',
    gradientColors: ['#FFE5B4', '#FFEAA7'], // Light peach
    reactions: [{ emoji: '🔥', count: 1, isFromPartner: true }],
  },
  {
    id: '2',
    title: 'Grocery Shopping Together',
    subtitle: 'Weekly meal prep ingredients for healthy cooking',
    emoji: '🛒',
    time: '10:30',
    endTime: '11:45',
    date: 'today',
    isShared: true,
    isCompleted: false,
    assignedTo: ['Alex', 'Blake'],
    category: 'SHARED',
    gradientColors: ['#A8E6CF', '#DCEDC1'], // Light green
    reactions: [
      { emoji: '💖', count: 1, isFromPartner: true },
      { emoji: '👍', count: 1, isFromPartner: false },
    ],
  },
  {
    id: '3',
    title: 'Read "Atomic Habits"',
    subtitle: 'Chapter 5: The Best Way to Start New Habits',
    emoji: '📚',
    time: '14:00',
    endTime: '15:00',
    date: 'today',
    isShared: false,
    isCompleted: true,
    assignedTo: ['Blake'],
    category: 'LEARNING',
    gradientColors: ['#C7CEEA', '#B8C6DB'], // Light blue
    reactions: [{ emoji: '🌟', count: 2, isFromPartner: false }],
  },
  {
    id: '4',
    title: 'Cook Dinner Date',
    subtitle: 'Trying the new pasta recipe we found',
    emoji: '🍽️',
    time: '18:00',
    endTime: '19:30',
    date: 'today',
    isShared: true,
    isCompleted: false,
    assignedTo: ['Alex', 'Blake'],
    category: 'TOGETHER',
    gradientColors: ['#FFB6C1', '#FFC0CB'], // Light pink
    reactions: [
      { emoji: '😋', count: 1, isFromPartner: true },
      { emoji: '🎉', count: 1, isFromPartner: false },
    ],
  },
];

const TimelineScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Mine' | 'Shared'>('All');
  const [selectedDateIndex, setSelectedDateIndex] = useState(2); // Today is index 2
  const [searchQuery, setSearchQuery] = useState('');
  
  const weekDates = generateWeekDates();
  const selectedDate = weekDates[selectedDateIndex];

  const filteredTasks = mockTasks.filter(task => {
    const matchesFilter = selectedFilter === 'All' || 
      (selectedFilter === 'Mine' && !task.isShared) ||
      (selectedFilter === 'Shared' && task.isShared);
    
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const { reactions, toggleReaction } = useReactions(task.reactions);

    const handleTaskPress = () => {
      // Navigate to task detail
      console.log('Navigate to task detail:', task.id);
    };

    const handleEmojiPress = () => {
      toggleReaction('🎉', false, 'current-user');
    };

    return (
      <TouchableOpacity 
        style={[
          styles.taskCard,
          { backgroundColor: task.gradientColors[0] },
          task.isCompleted && styles.taskCardCompleted
        ]}
        onPress={handleTaskPress}
        activeOpacity={0.8}
      >
        {/* Task Header */}
        <View style={styles.taskHeader}>
          <View style={styles.taskHeaderLeft}>
            <View style={styles.taskTitleRow}>
              <TouchableOpacity onPress={handleEmojiPress}>
                <Text style={[
                  styles.taskEmoji,
                  task.isCompleted && styles.taskEmojiCompleted
                ]}>
                  {task.emoji}
                </Text>
              </TouchableOpacity>
              <Text style={[
                styles.taskTitle,
                task.isCompleted && styles.taskTitleCompleted
              ]}>
                {task.title}
              </Text>
            </View>
            <Text style={styles.taskTime}>
              {task.time} - {task.endTime} AM (UTC)
            </Text>
          </View>
          
          {/* Category Badge */}
          {task.category && (
            <View style={[
              styles.categoryBadge,
              task.isShared && styles.categoryBadgeShared
            ]}>
              <Text style={[
                styles.categoryText,
                task.isShared && styles.categoryTextShared
              ]}>
                {task.category}
              </Text>
            </View>
          )}
        </View>

        {/* Task Description */}
        <Text style={styles.taskSubtitle}>{task.subtitle}</Text>

        {/* Avatars & Additional Info */}
        <XStack justifyContent="space-between" alignItems="center" marginTop="$3">
          <XStack alignItems="center" gap="$2">
            {task.assignedTo.map((person, index) => (
              <View key={index} style={styles.avatar}>
                <Text style={styles.avatarText}>{person.charAt(0)}</Text>
              </View>
            ))}
            {task.assignedTo.length > 2 && (
              <View style={[styles.avatar, styles.avatarMore]}>
                <Text style={styles.avatarText}>+{task.assignedTo.length - 2}</Text>
              </View>
            )}
          </XStack>
          
          {task.isShared && (
            <Text style={styles.platformText}>Together 🤝</Text>
          )}
        </XStack>

        {/* Reactions */}
        {reactions.length > 0 && (
          <View style={styles.reactionsContainer}>
            <ReactionDisplay 
              reactions={reactions} 
              onReactionPress={(reaction) => console.log('Reaction pressed:', reaction)}
            />
          </View>
        )}

        {/* Progress for completed tasks */}
        {task.isCompleted && (
          <View style={styles.completedIndicator}>
            <Text style={styles.completedText}>✓ Completed</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Calendar size={24} color={colors.textPrimary} />
          <Text style={styles.headerTitle}>Timeline</Text>
        </View>
      </View>

      {/* Month/Year Display */}
      <View style={styles.monthHeader}>
        <TouchableOpacity>
          <ChevronLeft size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {selectedDate.month}, {selectedDate.year}
        </Text>
        <TouchableOpacity>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Date Strip */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.dateStrip}
        contentContainerStyle={styles.dateStripContent}
      >
        {weekDates.map((dateInfo, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedDateIndex(index)}
            style={[
              styles.dateItem,
              selectedDateIndex === index && styles.dateItemSelected
            ]}
          >
            <Text style={[
              styles.dayText,
              selectedDateIndex === index && styles.dayTextSelected
            ]}>
              {dateInfo.day}
            </Text>
            <Text style={[
              styles.dateText,
              selectedDateIndex === index && styles.dateTextSelected
            ]}>
              {dateInfo.date.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['All', 'Mine', 'Shared'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={styles.filterTab}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter && styles.filterTabTextActive
            ]}>
              {filter}
            </Text>
            {selectedFilter === filter && <View style={styles.filterTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks List */}
      <ScrollView 
        style={styles.tasksList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tasksListContent}
      >
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        
        {filteredTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🌟</Text>
            <Text style={styles.emptyStateTitle}>No tasks found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Create your first task to get started'}
            </Text>
          </View>
        )}

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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  monthText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  dateStrip: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dateStripContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    minWidth: 50,
    backgroundColor: 'transparent',
  },
  dateItemSelected: {
    backgroundColor: colors.timelineActive,
    ...shadows.sm,
  },
  dayText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
    fontWeight: typography.weights.medium,
  },
  dayTextSelected: {
    color: colors.white,
  },
  dateText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  dateTextSelected: {
    color: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    padding: 0,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterTab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginRight: spacing.md,
    position: 'relative',
  },
  filterTabText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.timelineActive,
    fontWeight: typography.weights.semibold,
  },
  filterTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.md,
    right: spacing.md,
    height: 2,
    backgroundColor: colors.timelineActive,
    borderRadius: 1,
  },
  tasksList: {
    flex: 1,
  },
  tasksListContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  taskCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  taskCardCompleted: {
    opacity: 0.7,
  },
  taskEmoji: {
    fontSize: 24,
  },
  taskEmojiCompleted: {
    opacity: 0.6,
  },
  taskTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskTime: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    marginLeft: 32, // Offset for emoji
  },
  taskSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.relaxed * typography.sizes.md,
    marginVertical: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeShared: {
    backgroundColor: colors.secondary,
  },
  categoryText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  categoryTextShared: {
    color: colors.white,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  taskHeaderLeft: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarMore: {
    backgroundColor: colors.textSecondary,
  },
  avatarText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  platformText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  reactionsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
  },
  completedIndicator: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: typography.weights.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.sizes.md,
  },
});

export default TimelineScreen;