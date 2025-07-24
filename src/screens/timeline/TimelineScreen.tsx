import React, { useState, useCallback, useMemo, useEffect } from 'react';
import GroupedTaskCard from '../../components/tasks/GroupedTaskCard';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Pressable,
  Modal
} from 'react-native';
import { Calendar, Users, User } from '@tamagui/lucide-icons';
import { typography, spacing, shadows } from '../../styles';
import { useReactions, ReactionDisplay, ReactionSystem } from '../../components/reactions/ReactionSystem';

// Updated minimal color palette for clean timeline design
const colors = {
  // Base colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#F0F0F0',
  
  // Text colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#CCCCCC',
  
  // Accent colors (configurable based on user preference)
  accentPrimary: '#FF6B9D',    // Pink for shared/today
  accentSecondary: '#6B73FF',  // Blue for default
  accentWarning: '#FF6B6B',    // Red for high priority
  accentSuccess: '#4CAF50',    // Green for completed
  
  // Status colors
  completed: '#999999',
  todo: '#FF6B9D',
  
  // Special
  white: '#FFFFFF',
  black: '#000000',
} as const;

// Enhanced Task interface
interface EnhancedTask {
  id: string;
  title: string;
  subtitle?: string;
  emoji?: string;
  time: string;
  endTime?: string;
  date: string;
  isShared: boolean;
  isCompleted: boolean;
  assignedTo: string[];
  category?: string;
  groupId?: string; // Link to task group
  reactions: Array<{
    emoji: string;
    count: number;
    isFromPartner: boolean;
    users: string[];
  }>;
  priority: 'low' | 'medium' | 'high';
  progress?: number;
}

// Task Group interface
interface TaskGroup {
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

// Encouragement Modal Component
interface EncouragementModalProps {
  visible: boolean;
  onClose: () => void;
  onEncouragementSelect: (emoji: string) => void;
}

const EncouragementModal: React.FC<EncouragementModalProps> = ({
  visible,
  onClose,
  onEncouragementSelect,
}) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));

  const encouragementOptions = [
    { emoji: '💪', label: 'You got this!' },
    { emoji: '🔥', label: 'On fire!' },
    { emoji: '⭐', label: 'You\'re a star!' },
    { emoji: '🎉', label: 'Let\'s celebrate!' },
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleEncouragementPress = (emoji: string) => {
    onEncouragementSelect(emoji);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.encouragementOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.encouragementContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
                { scale: scaleAnim },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          <View style={styles.encouragementContent}>
            <Text style={styles.encouragementTitle}>Send Encouragement</Text>
            <Text style={styles.encouragementSubtitle}>Motivate your partner to complete this task!</Text>
            
            <View style={styles.encouragementOptions}>
              {encouragementOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleEncouragementPress(option.emoji)}
                  style={styles.encouragementOption}
                  activeOpacity={0.7}
                >
                  <Text style={styles.encouragementEmoji}>{option.emoji}</Text>
                  <Text style={styles.encouragementLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// Generate dates for timeline (showing past and future days)
const generateTimelineDates = () => {
  const today = new Date();
  const dates = [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Get 7 days: 2 past, today, 4 future
  for (let i = -2; i <= 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      day: days[date.getDay()],
      date: date.getDate(),
      isToday: i === 0,
      fullDate: date,
      month: months[date.getMonth()],
      year: date.getFullYear(),
      dayKey: date.toISOString().split('T')[0],
    });
  }
  return dates;
};

const TimelineScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Mine' | 'Shared'>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [encouragementModalVisible, setEncouragementModalVisible] = useState(false);
  const [selectedTaskForEncouragement, setSelectedTaskForEncouragement] = useState<string | null>(null);
  
  // Task Groups State
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([
    {
      id: 'group1',
      title: 'Healthy Week Challenge',
      description: 'Let\'s build healthy habits together',
      emoji: '🏃‍♀️',
      reward: 'Spa Day Together',
      createdAt: new Date(),
      isCompleted: false,
      participants: ['Alex', 'Blake'],
    },
    {
      id: 'group2',
      title: 'Home Organization Sprint',
      description: 'Get our space organized and clutter-free',
      emoji: '🏠',
      reward: 'Movie Night with Takeout',
      createdAt: new Date(),
      isCompleted: false,
      participants: ['Alex', 'Blake'],
    }
  ]);

  // Enhanced mock data organized by date with groupId
  const [tasks, setTasks] = useState<Record<string, EnhancedTask[]>>({
    'today': [
      {
        id: '1',
        title: 'Morning Workout',
        subtitle: 'Strength training session at the gym',
        emoji: '💪',
        time: '8:00 AM',
        groupId: 'group1', // Link to Healthy Week Challenge
        date: 'today',
        isShared: true,
        isCompleted: false,
        assignedTo: ['Alex'],
        reactions: [],
        priority: 'high',
      },
      {
        id: '2',
        title: 'Organize Kitchen Pantry',
        subtitle: 'Sort and label all items',
        emoji: '🗂️',
        time: '2:00 PM',
        groupId: 'group2', // Link to Home Organization Sprint
        date: 'today',
        isShared: true,
        isCompleted: true,
        assignedTo: ['Blake'],
        reactions: [{ emoji: '🎉', count: 1, isFromPartner: true, users: ['Alex'] }],
        priority: 'medium',
      },
      {
        id: '7',
        title: 'Lunch Meeting',
        subtitle: 'Quarterly review with team',
        emoji: '🍽️',
        time: '12:30 PM',
        date: 'today',
        isShared: false,
        isCompleted: true,
        assignedTo: ['Alex'],
        reactions: [],
        priority: 'high',
      },
    ],
    'tomorrow': [
      {
        id: '3',
        title: 'Evening Yoga Session',
        emoji: '🧘‍♀️',
        time: '7:00 PM',
        groupId: 'group1', // Link to Healthy Week Challenge
        date: 'tomorrow',
        isShared: true,
        isCompleted: false,
        assignedTo: ['Alex', 'Blake'],
        reactions: [],
        priority: 'medium',
      },
      {
        id: '4',
        title: 'Declutter Bedroom',
        emoji: '🛏️',
        time: '10:00 AM',
        groupId: 'group2', // Link to Home Organization Sprint
        date: 'tomorrow',
        isShared: true,
        isCompleted: false,
        assignedTo: ['Alex', 'Blake'],
        reactions: [],
        priority: 'low',
      },
      {
        id: '5',
        title: 'Groceries',
        emoji: '🛒',
        time: '4:00 PM',
        date: 'tomorrow',
        isShared: true,
        isCompleted: false,
        assignedTo: ['Alex', 'Blake'],
        reactions: [],
        priority: 'medium',
      },
    ],
    'saturday': [
      {
        id: '6',
        title: 'Hiking Trip',
        emoji: '🥾',
        time: 'TODO',
        groupId: 'group1', // Link to Healthy Week Challenge
        date: 'saturday',
        isShared: true,
        isCompleted: false,
        assignedTo: ['Alex', 'Blake'],
        reactions: [],
        priority: 'high',
      },
    ],
  });
  
  const timelineDates = generateTimelineDates();
  
  // Get tasks for a specific date key
  const getTasksForDate = (dateKey: string, isToday: boolean) => {
    let taskList: EnhancedTask[] = [];
    
    if (isToday) {
      taskList = tasks['today'] || [];
    } else if (dateKey === 'tomorrow') {
      taskList = tasks['tomorrow'] || [];
    } else if (dateKey === 'saturday') {
      taskList = tasks['saturday'] || [];
    }
    
    // Apply filter and exclude grouped tasks (they'll be shown in GroupedTaskCard)
    return taskList.filter(task => {
      const matchesFilter = selectedFilter === 'All' || 
        (selectedFilter === 'Mine' && !task.isShared) ||
        (selectedFilter === 'Shared' && task.isShared);
      
      const isNotGrouped = !task.groupId; // Only show non-grouped tasks in regular timeline
      
      return matchesFilter && isNotGrouped;
    });
  };

  // Get grouped tasks for display
  const getGroupedTasks = (): { [groupId: string]: EnhancedTask[] } => {
    const groupedTasks: { [groupId: string]: EnhancedTask[] } = {};
    
    Object.values(tasks).flat().forEach(task => {
      if (task.groupId) {
        if (!groupedTasks[task.groupId]) {
          groupedTasks[task.groupId] = [];
        }
        groupedTasks[task.groupId].push(task);
      }
    });
    
    return groupedTasks;
  };

  // Filter grouped tasks based on current filter
  const getFilteredGroupedTasks = () => {
    const groupedTasks = getGroupedTasks();
    const filteredGroups: { [groupId: string]: EnhancedTask[] } = {};
    
    Object.keys(groupedTasks).forEach(groupId => {
      const filteredTasks = groupedTasks[groupId].filter(task => {
        return selectedFilter === 'All' || 
          (selectedFilter === 'Mine' && !task.isShared) ||
          (selectedFilter === 'Shared' && task.isShared);
      });
      
      if (filteredTasks.length > 0) {
        filteredGroups[groupId] = filteredTasks;
      }
    });
    
    return filteredGroups;
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      
      // Find and update the task in all date categories
      Object.keys(newTasks).forEach(dateKey => {
        newTasks[dateKey] = newTasks[dateKey].map(task => {
          if (task.id === taskId) {
            return { ...task, isCompleted: !task.isCompleted };
          }
          return task;
        });
      });
      
      return newTasks;
    });
  };

  // Handle reward claiming
  const handleRewardClaim = (group: TaskGroup) => {
    setTaskGroups(prev => 
      prev.map(g => 
        g.id === group.id 
          ? { ...g, completedAt: new Date(), isCompleted: true }
          : g
      )
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const TaskItem: React.FC<{ task: EnhancedTask }> = ({ task }) => {
    const { reactions, toggleReaction } = useReactions(task.reactions);
    const [scaleAnim] = useState(new Animated.Value(1));

    const handleTaskPress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Toggle task completion
      toggleTaskCompletion(task.id);
    };

    const handleSharedIconPress = () => {
      if (task.isShared) {
        setSelectedTaskForEncouragement(task.id);
        setEncouragementModalVisible(true);
      }
    };

    const getAccentColor = () => {
      if (task.isShared) return colors.accentPrimary; // Pink accent for shared
      if (task.priority === 'high') return colors.accentWarning; // Red accent for high priority
      return colors.accentSecondary; // Blue accent default
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable onPress={handleTaskPress} style={styles.taskItem}>
          <View style={styles.taskContent}>
            {/* Time or Status */}
            <View style={styles.taskTimeContainer}>
              {task.isCompleted ? (
                <Text style={styles.taskStatusDone}>DONE</Text>
              ) : task.time === 'TODO' ? (
                <Text style={[styles.taskStatusTodo, { color: getAccentColor() }]}>TODO</Text>
              ) : (
                <Text style={[styles.taskTime, { color: getAccentColor() }]}>{task.time}</Text>
              )}
            </View>

            {/* Task Details */}
            <View style={styles.taskDetails}>
              <View style={styles.taskTitleRow}>
                {task.emoji && (
                  <Text style={styles.taskEmoji}>{task.emoji}</Text>
                )}
                <Text style={[
                  styles.taskTitle,
                  task.isCompleted && styles.taskTitleCompleted
                ]}>
                  {task.title}
                </Text>
                
                {/* Shared indicator - clickable for encouragement */}
                {task.isShared && (
                  <TouchableOpacity 
                    onPress={handleSharedIconPress}
                    style={styles.sharedIndicator}
                  >
                    <Users size={12} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              
              {task.subtitle && (
                <Text style={[
                  styles.taskSubtitle,
                  task.isCompleted && styles.taskSubtitleCompleted
                ]}>
                  {task.subtitle}
                </Text>
              )}
            </View>
          </View>

          {/* Reactions */}
          {reactions.length > 0 && (
            <View style={styles.reactionsContainer}>
              <ReactionDisplay 
                reactions={reactions} 
                onReactionPress={(reaction) => console.log('Reaction pressed:', reaction)}
              />
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  const DateSection: React.FC<{ dateInfo: any }> = ({ dateInfo }) => {
    const tasks = getTasksForDate(
      dateInfo.isToday ? 'today' : 
      dateInfo.day === 'Thursday' ? 'tomorrow' : 
      dateInfo.day === 'Saturday' ? 'saturday' : 'none', 
      dateInfo.isToday
    );

    if (tasks.length === 0) return null;

    return (
      <View style={styles.dateSection}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={[
            styles.dateNumber,
            dateInfo.isToday && styles.dateNumberToday
          ]}>
            {dateInfo.date}
          </Text>
          <View style={styles.dateInfo}>
            <Text style={[
              styles.dateName,
              dateInfo.isToday && styles.dateNameToday
            ]}>
              {dateInfo.day}
            </Text>
            <Text style={styles.dateMonth}>{dateInfo.month}</Text>
          </View>
        </View>

        {/* Tasks for this date */}
        <View style={styles.tasksContainer}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </View>
      </View>
    );
  };

  const filteredGroupedTasks = getFilteredGroupedTasks();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Calendar size={24} color={colors.textPrimary} />
          <Text style={styles.headerTitle}>Timeline</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['All', 'Mine', 'Shared'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.filterTabActive
            ]}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter && styles.filterTabTextActive
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timeline */}
      <ScrollView 
        style={styles.timeline} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textSecondary}
            colors={[colors.textSecondary]}
          />
        }
      >
        <View style={styles.timelineContent}>
          {/* Render Grouped Tasks First */}
          {taskGroups.map(group => {
            const groupTasks = filteredGroupedTasks[group.id] || [];
            if (groupTasks.length === 0) return null;
            
            return (
              <GroupedTaskCard
                key={group.id}
                group={group}
                tasks={groupTasks}
                onTaskPress={(task) => {
                  console.log('Task pressed:', task.title);
                  // Navigate to task detail or handle task interaction
                }}
                onTaskToggle={toggleTaskCompletion}
                onRewardClaim={handleRewardClaim}
              />
            );
          })}

          {/* Render Individual Timeline Tasks */}
          {timelineDates.map((dateInfo, index) => (
            <DateSection key={index} dateInfo={dateInfo} />
          ))}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Encouragement Modal */}
      <EncouragementModal
        visible={encouragementModalVisible}
        onClose={() => setEncouragementModalVisible(false)}
        onEncouragementSelect={(emoji) => {
          if (selectedTaskForEncouragement) {
            console.log('Encouragement sent:', emoji, 'for task:', selectedTaskForEncouragement);
            // Here you would send the encouragement to your partner
          }
          setEncouragementModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterTabActive: {
    backgroundColor: colors.background,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  filterTabTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  timeline: {
    flex: 1,
  },
  timelineContent: {
    paddingTop: 20,
  },
  dateSection: {
    marginBottom: 40,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dateNumber: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.textDisabled,
    lineHeight: 48,
    marginRight: 20,
    minWidth: 80,
  },
  dateNumberToday: {
    color: colors.accentPrimary,
    fontWeight: '400',
  },
  dateInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 8,
  },
  dateName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  dateNameToday: {
    color: colors.accentPrimary,
  },
  dateMonth: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '400',
  },
  tasksContainer: {
    paddingLeft: 100, // Align with date info
    paddingRight: 20,
  },
  taskItem: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  taskTimeContainer: {
    minWidth: 60,
    alignItems: 'flex-start',
  },
  taskStatusDone: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.completed,
    letterSpacing: 0.5,
  },
  taskStatusTodo: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  taskTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskDetails: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  taskEmoji: {
    fontSize: 16,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
  taskTitleCompleted: {
    color: colors.completed,
  },
  sharedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  taskSubtitleCompleted: {
    color: colors.textTertiary,
  },
  reactionsContainer: {
    marginTop: 8,
    marginLeft: 76, // Align with task content
  },
  
  // Encouragement Modal Styles
  encouragementOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  encouragementContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 320,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  encouragementContent: {
    alignItems: 'center',
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  encouragementSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  encouragementOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  encouragementOption: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.border,
  },
  encouragementEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  encouragementLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default TimelineScreen;