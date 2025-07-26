import React, { useState, useCallback, useEffect } from 'react';
import { useRealTasks } from '../../hooks/useRealTasks';
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
  Modal,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Calendar, Users, Edit3, Trash2, Copy, Check } from '@tamagui/lucide-icons';
import { typography, spacing, shadows } from '../../styles';
import { useReactions, ReactionDisplay } from '../../components/reactions/ReactionSystem';

const { width: screenWidth } = Dimensions.get('window');

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
  
  // Group colors (soft pastels, Zelda-inspired)
  groupColors: {
    health: '#B8E6B8',      // Soft mint green
    home: '#FFE4B5',        // Soft peach
    work: '#E6E6FA',        // Soft lavender
    social: '#FFB6C1',      // Soft pink
    learning: '#B0E0E6',    // Soft powder blue
    creative: '#FFEFD5',    // Soft papaya
  },
  
  // Special
  white: '#FFFFFF',
  black: '#000000',
} as const;

// Enhanced Task interface that matches your SimpleTask but with additional fields
interface EnhancedTask {
  id: string;
  title: string;
  subtitle?: string;
  emoji?: string;
  time?: string;
  endTime?: string;
  date: string;
  isShared: boolean;
  isCompleted: boolean;
  assignedTo: string[];
  category?: string;
  groupId?: string;
  reactions: Array<{
    emoji: string;
    count: number;
    isFromPartner: boolean;
    users: string[];
  }>;
  priority?: 'low' | 'medium' | 'high';
  progress?: number;
  notes?: string;
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
  color: keyof typeof colors.groupColors;
  shortName: string; // For the pill tag
}

// Task Detail Tray Component
interface TaskDetailTrayProps {
  visible: boolean;
  task: EnhancedTask | null;
  group?: TaskGroup | null;
  onClose: () => void;
  onEdit: (task: EnhancedTask) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (task: EnhancedTask) => void;
  onComplete: (taskId: string) => void;
  groupProgress?: { completed: number; total: number };
}

const TaskDetailTray: React.FC<TaskDetailTrayProps> = ({
  visible,
  task,
  group,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onComplete,
  groupProgress,
}) => {
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!task) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.trayOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.trayContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [400, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.trayHandle} />
          
          {/* Task Header */}
          <View style={styles.trayHeader}>
            <View style={styles.trayTitleRow}>
              {task.emoji && <Text style={styles.trayEmoji}>{task.emoji}</Text>}
              <Text style={styles.trayTitle}>{task.title}</Text>
            </View>
            {task.time && (
              <Text style={styles.trayTime}>{task.time}</Text>
            )}
          </View>

          {/* Group Info */}
          {group && (
            <View style={[styles.groupInfoSection, { backgroundColor: colors.groupColors[group.color] + '20' }]}>
              <View style={styles.groupInfoHeader}>
                <View style={[styles.groupDot, { backgroundColor: colors.groupColors[group.color] }]} />
                <Text style={styles.groupInfoTitle}>Part of {group.title}</Text>
              </View>
              {groupProgress && (
                <Text style={styles.groupProgress}>
                  {groupProgress.completed}/{groupProgress.total} complete
                </Text>
              )}
              <Text style={styles.groupReward}>🎁 {group.reward}</Text>
            </View>
          )}

          {/* Task Notes */}
          {task.subtitle && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{task.subtitle}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(task)}
            >
              <Edit3 size={18} color={colors.textPrimary} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.duplicateButton]}
              onPress={() => onDuplicate(task)}
            >
              <Copy size={18} color={colors.textPrimary} />
              <Text style={styles.actionButtonText}>Duplicate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(task.id)}
            >
              <Trash2 size={18} color={colors.accentWarning} />
              <Text style={[styles.actionButtonText, { color: colors.accentWarning }]}>Delete</Text>
            </TouchableOpacity>
          </View>

          {/* Complete Button */}
          {!task.isCompleted && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => onComplete(task.id)}
            >
              <Check size={20} color={colors.white} />
              <Text style={styles.completeButtonText}>Complete Task</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// Encouragement Modal Component (simplified)
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
  const encouragementOptions = [
    { emoji: '💪', label: 'You got this!' },
    { emoji: '🔥', label: 'On fire!' },
    { emoji: '⭐', label: 'You\'re a star!' },
    { emoji: '🎉', label: 'Let\'s celebrate!' },
  ];

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.encouragementOverlay} onPress={onClose}>
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementTitle}>Send Encouragement</Text>
          <View style={styles.encouragementOptions}>
            {encouragementOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onEncouragementSelect(option.emoji)}
                style={styles.encouragementOption}
              >
                <Text style={styles.encouragementEmoji}>{option.emoji}</Text>
                <Text style={styles.encouragementLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

// Generate dates for timeline
const generateTimelineDates = () => {
  const today = new Date();
  const dates = [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
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
  const [taskDetailTrayVisible, setTaskDetailTrayVisible] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<EnhancedTask | null>(null);

  // Get real tasks using your existing hook
  const { 
    tasks: realTasks, 
    loading: tasksLoading, 
    toggleTaskCompletion,
    refreshTasks,
    deleteTask
  } = useRealTasks();

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
      color: 'health',
      shortName: 'Health',
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
      color: 'home',
      shortName: 'Home Org',
    }
  ]);

  // Convert SimpleTask to EnhancedTask to add missing properties
  const convertToEnhancedTasks = (simpleTasks: Record<string, any[]>): Record<string, EnhancedTask[]> => {
    const enhancedTasks: Record<string, EnhancedTask[]> = {};
    
    Object.keys(simpleTasks).forEach(dateKey => {
      enhancedTasks[dateKey] = simpleTasks[dateKey].map(task => ({
        ...task,
        // Ensure all required properties exist with defaults
        time: task.time || 'TODO',
        reactions: task.reactions || [],
        priority: task.priority || 'medium',
        groupId: task.groupId || undefined,
        progress: task.progress || undefined,
        notes: task.notes || undefined,
      }));
    });
    
    return enhancedTasks;
  };

  // Convert real tasks to enhanced tasks
  const tasks = convertToEnhancedTasks(realTasks);
  
  const timelineDates = generateTimelineDates();
  
  // Get tasks for a specific date key with filtering
  const getTasksForDate = (dateKey: string, isToday: boolean) => {
    let taskList: EnhancedTask[] = [];
    
    if (isToday) {
      taskList = tasks['today'] || [];
    } else if (dateKey === 'tomorrow') {
      taskList = tasks['tomorrow'] || [];
    } else if (dateKey === 'saturday') {
      taskList = tasks['saturday'] || [];
    }
    
    // Apply filter
    return taskList.filter(task => {
      return selectedFilter === 'All' || 
        (selectedFilter === 'Mine' && !task.isShared) ||
        (selectedFilter === 'Shared' && task.isShared);
    });
  };

  // Get group progress for a specific group
  const getGroupProgress = (groupId: string) => {
    const allTasks = Object.values(tasks).flat();
    const groupTasks = allTasks.filter(task => task.groupId === groupId);
    const completed = groupTasks.filter(task => task.isCompleted).length;
    return { completed, total: groupTasks.length };
  };

  // Get group by ID
  const getGroupById = (groupId: string) => {
    return taskGroups.find(group => group.id === groupId);
  };

  // Handle swipe to complete
  const createSwipeHandler = (task: EnhancedTask) => {
    const translateX = new Animated.Value(0);
    
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 100;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(translateX._value);
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        
        if (Math.abs(gestureState.dx) > screenWidth * 0.3) {
          // Complete the task
          Animated.timing(translateX, {
            toValue: gestureState.dx > 0 ? screenWidth : -screenWidth,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            toggleTaskCompletion(task.id);
            translateX.setValue(0);
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  };

  // Handle refresh with your existing refreshTasks function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  }, [refreshTasks]);

  // Task action handlers
  const handleTaskEdit = (task: EnhancedTask) => {
    console.log('Edit task:', task.title);
    setTaskDetailTrayVisible(false);
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTaskDetailTrayVisible(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleTaskDuplicate = (task: EnhancedTask) => {
    console.log('Duplicate task:', task.title);
    setTaskDetailTrayVisible(false);
  };

  const handleTaskComplete = (taskId: string) => {
    toggleTaskCompletion(taskId);
    setTaskDetailTrayVisible(false);
  };

  const TaskItem: React.FC<{ task: EnhancedTask }> = ({ task }) => {
    const { reactions } = useReactions(task.reactions);
    const [translateX] = useState(new Animated.Value(0));
    const group = task.groupId ? getGroupById(task.groupId) : null;
    const groupProgress = task.groupId ? getGroupProgress(task.groupId) : null;

    const swipeHandler = createSwipeHandler(task);

    const handleTaskPress = () => {
      setSelectedTaskForDetail(task);
      setTaskDetailTrayVisible(true);
    };

    const handleSharedIconPress = () => {
      if (task.isShared) {
        setSelectedTaskForEncouragement(task.id);
        setEncouragementModalVisible(true);
      }
    };

    const getAccentColor = () => {
      if (task.isShared) return colors.accentPrimary;
      if (task.priority === 'high') return colors.accentWarning;
      return colors.accentSecondary;
    };

    return (
      <Animated.View 
        style={[{ transform: [{ translateX }] }]}
        {...swipeHandler.panHandlers}
      >
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

                {/* Group Tag */}
                {group && (
                  <TouchableOpacity style={styles.groupTag}>
                    <View style={[
                      styles.groupTagDot, 
                      { backgroundColor: colors.groupColors[group.color] }
                    ]} />
                    <Text style={styles.groupTagText}>{group.shortName}</Text>
                  </TouchableOpacity>
                )}
                
                {/* Shared indicator */}
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

  return (
    <SafeAreaView style={styles.container}>
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
          {timelineDates.map((dateInfo, index) => (
            <DateSection key={index} dateInfo={dateInfo} />
          ))}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Task Detail Tray */}
      <TaskDetailTray
        visible={taskDetailTrayVisible}
        task={selectedTaskForDetail}
        group={selectedTaskForDetail?.groupId ? getGroupById(selectedTaskForDetail.groupId) : null}
        groupProgress={selectedTaskForDetail?.groupId ? getGroupProgress(selectedTaskForDetail.groupId) : undefined}
        onClose={() => setTaskDetailTrayVisible(false)}
        onEdit={handleTaskEdit}
        onDelete={handleTaskDelete}
        onDuplicate={handleTaskDuplicate}
        onComplete={handleTaskComplete}
      />

      {/* Encouragement Modal */}
      <EncouragementModal
        visible={encouragementModalVisible}
        onClose={() => setEncouragementModalVisible(false)}
        onEncouragementSelect={(emoji) => {
          if (selectedTaskForEncouragement) {
            console.log('Encouragement sent:', emoji, 'for task:', selectedTaskForEncouragement);
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
    fontSize: 34,
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
    paddingLeft: 20,
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
    minWidth: 20,
    alignItems: 'flex-start',
  },
  taskStatusDone: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.completed,
    letterSpacing: 0.5,
  },
  taskStatusTodo: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  taskTime: {
    fontSize: 10,
    fontWeight: '500',
  },
  taskDetails: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 45,
    marginBottom: 2,
    flexWrap: 'wrap',
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
  groupTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  groupTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  groupTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
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
    paddingLeft: 45,
  },
  taskSubtitleCompleted: {
    color: colors.textTertiary,
  },
  reactionsContainer: {
    marginTop: 8,
    marginLeft: 76,
  },
  
  // Task Detail Tray Styles
  trayOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  trayContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 40,
    minHeight: 300,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  trayHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  trayHeader: {
    marginBottom: 20,
  },
  trayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },
  trayEmoji: {
    fontSize: 24,
  },
  trayTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  trayTime: {
    fontSize: 16,
    color: colors.accentPrimary,
    fontWeight: '500',
  },
  groupInfoSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  groupInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  groupInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  groupProgress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  groupReward: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  editButton: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  duplicateButton: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.accentWarning + '40',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  completeButton: {
    backgroundColor: colors.accentSuccess,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
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
  encouragementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  encouragementOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  encouragementOption: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    minWidth: 70,
    borderWidth: 1,
    borderColor: colors.border, 
  },
  encouragementEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
});

export default TimelineScreen;