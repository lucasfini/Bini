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
  TextInput,
  Alert,
} from 'react-native';
import {
  Calendar,
  Users,
  User,
  Edit3,
  Trash2,
  Copy,
  Check,
  Clock,
  Bell,
  RotateCcw,
  Share2,
  Plus,
  GripVertical,
  X,
  PlusCircle,
} from '@tamagui/lucide-icons';
import { typography, spacing, shadows } from '../../styles';
import {
  useReactions,
  ReactionDisplay,
} from '../../components/reactions/ReactionSystem';
import { UnifiedTask } from '../../types/tasks'; // Use unified task interface

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  accentPrimary: '#FF6B9D', // Pink for shared/today
  accentSecondary: '#6B73FF', // Blue for default
  accentWarning: '#FF6B6B', // Red for high priority
  accentSuccess: '#4CAF50', // Green for completed

  // Status colors
  completed: '#999999',
  todo: '#FF6B9D',

  // Group colors (soft pastels, Zelda-inspired)
  groupColors: {
    health: '#B8E6B8', // Soft mint green
    home: '#FFE4B5', // Soft peach
    work: '#E6E6FA', // Soft lavender
    social: '#FFB6C1', // Soft pink
    learning: '#B0E0E6', // Soft powder blue
    creative: '#FFEFD5', // Soft papaya
  },

  // Special
  white: '#FFFFFF',
  black: '#000000',
} as const;

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
  task: UnifiedTask | null;
  group?: TaskGroup | null;
  onClose: () => void;
  onEdit: (task: UnifiedTask) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (task: UnifiedTask) => void;
  onComplete: (taskId: string) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string) => void;
  onStepsUpdate: (taskId: string, steps: Array<{id: string; title: string; completed: boolean}>) => void;
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
  onSubtaskToggle,
  onStepsUpdate,
  groupProgress,
}) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStepTitle, setEditingStepTitle] = useState('');
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [localSteps, setLocalSteps] = useState<Array<{id: string; title: string; completed: boolean}>>([]);

  // Sync local steps with task steps
  useEffect(() => {
    if (task) {
      const taskSteps = task.steps || task.subtasks || [];
      setLocalSteps([...taskSteps]);
    }
  }, [task]);

  useEffect(() => {
    console.log('🎭 TaskDetailTray visibility changed:', visible);
    console.log('📝 TaskDetailTray received task:', task ? task.title : 'null');
    if (task) {
      console.log(
        '📋 TaskDetailTray task details:',
        JSON.stringify(
          {
            id: task.id,
            title: task.title,
            details: task.details,
            startTime: task.startTime,
            endTime: task.endTime,
            steps: task.steps,
            alerts: task.alerts,
            recurrence: task.recurrence,
          },
          null,
          2,
        ),
      );
    }

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
      // Reset editing state when closing
      setEditingStepId(null);
      setEditingStepTitle('');
    }
  }, [visible, task]);

  if (!task) {
    console.log('❌ TaskDetailTray: No task provided, returning null');
    return null;
  }

  // FIXED: Get task steps using unified fields (use local state for editing)
  const getTaskSteps = () => {
    return localSteps;
  };

  // FIXED: Check if all subtasks are completed
  const allSubtasksCompleted = () => {
    const steps = getTaskSteps();
    return steps.length === 0 || steps.every(step => step.completed);
  };

  // Step management functions
  const handleAddStep = () => {
    const newStep = {
      id: Date.now().toString(),
      title: 'New step',
      completed: false,
    };
    const updatedSteps = [...localSteps, newStep];
    setLocalSteps(updatedSteps);
    onStepsUpdate(task!.id, updatedSteps);
    
    // Start editing the new step immediately
    setEditingStepId(newStep.id);
    setEditingStepTitle(newStep.title);
  };

  const handleDeleteStep = (stepId: string) => {
    Alert.alert(
      'Delete Step',
      'Are you sure you want to delete this step?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedSteps = localSteps.filter(step => step.id !== stepId);
            setLocalSteps(updatedSteps);
            onStepsUpdate(task!.id, updatedSteps);
          },
        },
      ],
    );
  };

  const handleStepToggle = (stepId: string) => {
    const updatedSteps = localSteps.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    setLocalSteps(updatedSteps);
    onSubtaskToggle(task!.id, stepId);
  };

  const handleStartEditStep = (stepId: string, currentTitle: string) => {
    setEditingStepId(stepId);
    setEditingStepTitle(currentTitle);
  };

  const handleSaveStepEdit = () => {
    if (editingStepId && editingStepTitle.trim()) {
      const updatedSteps = localSteps.map(step =>
        step.id === editingStepId
          ? { ...step, title: editingStepTitle.trim() }
          : step
      );
      setLocalSteps(updatedSteps);
      onStepsUpdate(task!.id, updatedSteps);
    }
    setEditingStepId(null);
    setEditingStepTitle('');
  };

  const handleCancelStepEdit = () => {
    setEditingStepId(null);
    setEditingStepTitle('');
  };

  const handleMoveStep = (fromIndex: number, toIndex: number) => {
    const updatedSteps = [...localSteps];
    const [movedStep] = updatedSteps.splice(fromIndex, 1);
    updatedSteps.splice(toIndex, 0, movedStep);
    setLocalSteps(updatedSteps);
    onStepsUpdate(task!.id, updatedSteps);
  };

  // FIXED: Format time range display using unified fields
  const getTimeRangeDisplay = () => {
    const startTime = task.startTime || task.time;
    const endTime = task.endTime;

    if (!startTime || startTime === 'TODO') {
      return 'No specific time set';
    }
    if (endTime) {
      return `${startTime} - ${endTime}`;
    }
    if (task.duration) {
      return `${startTime} (${task.duration} min)`;
    }
    return startTime;
  };

  // FIXED: Format recurrence display using unified fields
  const getRecurrenceDisplay = () => {
    const recurrenceData = task.recurrence;
    if (!recurrenceData || recurrenceData.frequency === 'none') {
      return 'One-time task';
    }

    const { frequency, interval } = recurrenceData;
    const intervalText = interval > 1 ? `${interval} ` : '';
    const frequencyText =
      frequency === 'daily'
        ? 'day'
        : frequency === 'weekly'
        ? 'week'
        : frequency === 'monthly'
        ? 'month'
        : frequency;
    const pluralSuffix = interval > 1 ? 's' : '';

    return `Every ${intervalText}${frequencyText}${pluralSuffix}`;
  };

  // FIXED: Format alerts display
  const getAlertsDisplay = () => {
    if (!task.alerts || task.alerts.length === 0) {
      return 'No alerts set';
    }

    const alertLabels = task.alerts.map(alertId => {
      switch (alertId) {
        case 'start':
          return 'At start';
        case 'end':
          return 'At end';
        case '5min':
          return '5 min before';
        case '10min':
          return '10 min before';
        case '15min':
          return '15 min before';
        case '30min':
          return '30 min before';
        case '1hour':
          return '1 hour before';
        default:
          return alertId;
      }
    });

    return alertLabels.join(', ');
  };

  // Enhanced steps section with full management functionality
  const renderStepsSection = () => {
    const steps = getTaskSteps();

    const createDragHandler = (stepId: string, index: number) => {
      const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dy) > 10;
        },
        onPanResponderGrant: () => {
          setDraggedStepId(stepId);
        },
        onPanResponderMove: (_, gestureState) => {
          // Visual feedback could be added here
        },
        onPanResponderRelease: (_, gestureState) => {
          const moveThreshold = 60;
          if (Math.abs(gestureState.dy) > moveThreshold) {
            const direction = gestureState.dy > 0 ? 1 : -1;
            const newIndex = Math.max(0, Math.min(steps.length - 1, index + direction));
            if (newIndex !== index) {
              handleMoveStep(index, newIndex);
            }
          }
          setDraggedStepId(null);
        },
      });
      return panResponder;
    };

    return (
      <View style={styles.detailSection}>
        <View style={styles.detailHeader}>
          <Check size={18} color={colors.textSecondary} />
          <Text style={styles.detailLabel}>
            Steps{' '}
            {steps.length > 0 &&
              `(${steps.filter(s => s.completed).length}/${steps.length})`}
          </Text>
          <TouchableOpacity
            style={styles.addStepButtonSmall}
            onPress={handleAddStep}
          >
            <Plus size={14} color={colors.accentSecondary} />
          </TouchableOpacity>
        </View>
        
        {steps.length > 0 ? (
          <View style={styles.subtasksList}>
            {steps.map((step, index) => {
              const isEditing = editingStepId === step.id;
              const isDragging = draggedStepId === step.id;
              const dragHandler = createDragHandler(step.id, index);
              
              return (
                <View
                  key={step.id}
                  style={[
                    styles.subtaskItem,
                    isDragging && styles.subtaskItemDragging,
                  ]}
                >
                  {/* Drag Handle */}
                  <View
                    style={styles.dragHandle}
                    {...dragHandler.panHandlers}
                  >
                    <GripVertical size={16} color={colors.textTertiary} />
                  </View>

                  {/* Checkbox */}
                  <TouchableOpacity
                    onPress={() => handleStepToggle(step.id)}
                    style={[
                      styles.subtaskCheckbox,
                      step.completed && styles.subtaskCheckboxCompleted,
                    ]}
                  >
                    {step.completed && <Check size={12} color={colors.white} />}
                  </TouchableOpacity>

                  {/* Step Title (Editable) */}
                  <View style={styles.subtaskTextContainer}>
                    {isEditing ? (
                      <View style={styles.editingContainer}>
                        <TextInput
                          style={styles.stepEditInput}
                          value={editingStepTitle}
                          onChangeText={setEditingStepTitle}
                          onSubmitEditing={handleSaveStepEdit}
                          onBlur={handleSaveStepEdit}
                          autoFocus
                          multiline
                          placeholder="Enter step title"
                        />
                        <View style={styles.editingActions}>
                          <TouchableOpacity
                            onPress={handleSaveStepEdit}
                            style={styles.editActionButton}
                          >
                            <Check size={14} color={colors.accentSuccess} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleCancelStepEdit}
                            style={styles.editActionButton}
                          >
                            <X size={14} color={colors.accentWarning} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text
                        style={[
                          styles.subtaskText,
                          step.completed && styles.subtaskTextCompleted,
                        ]}
                      >
                        {step.title}
                      </Text>
                    )}
                  </View>

                  {/* Edit/Delete Actions */}
                  {!isEditing && (
                    <View style={styles.stepActions}>
                      <TouchableOpacity
                        onPress={() => handleStartEditStep(step.id, step.title)}
                        style={styles.stepActionButton}
                      >
                        <Edit3 size={14} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteStep(step.id)}
                        style={styles.stepActionButton}
                      >
                        <Trash2 size={14} color={colors.accentWarning} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.detailValue}>No steps added</Text>
        )}
      </View>
    );
  };

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
              minHeight: '70%',
              maxHeight: '90%',
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [500, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.trayHandle} />

          <ScrollView
            style={styles.trayScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
            }}
          >
            {/* Task Header */}
            <View style={styles.trayHeader}>
              <View style={styles.trayTitleRow}>
                {task.emoji && (
                  <Text style={styles.trayEmoji}>{task.emoji}</Text>
                )}
                <Text style={styles.trayTitle}>{task.title}</Text>
                {task.isShared && (
                  <View style={styles.sharedBadge}>
                    <Share2 size={14} color={colors.accentPrimary} />
                  </View>
                )}
                {task.isShared && (
                  <View style={styles.profileBadge}>
                    <User size={14} color={colors.accentPrimary} />
                  </View>
                )}
              </View>
              <Text style={styles.taskCategory}>
                {task.category || 'Personal'}
              </Text>
            </View>

            {/* Time Range */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <Clock size={18} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Time</Text>
              </View>
              <Text style={styles.detailValue}>{getTimeRangeDisplay()}</Text>
            </View>

            {/* FIXED: Task Details using unified fields */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <Edit3 size={18} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Details</Text>
              </View>
              <Text style={styles.detailValue}>
                {task.details || task.subtitle || 'No details added'}
              </Text>
            </View>

            {/* FIXED: Steps section using unified fields */}
            {renderStepsSection()}

            {/* Recurrence */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <RotateCcw size={18} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Recurrence</Text>
              </View>
              <Text style={styles.detailValue}>{getRecurrenceDisplay()}</Text>
            </View>

            {/* Alerts */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <Bell size={18} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Alerts</Text>
              </View>
              <Text style={styles.detailValue}>{getAlertsDisplay()}</Text>
            </View>

            {/* Group Info */}
            {group && (
              <View
                style={[
                  styles.groupInfoSection,
                  { backgroundColor: colors.groupColors[group.color] + '20' },
                ]}
              >
                <View style={styles.groupInfoHeader}>
                  <View
                    style={[
                      styles.groupDot,
                      { backgroundColor: colors.groupColors[group.color] },
                    ]}
                  />
                  <Text style={styles.groupInfoTitle}>
                    Part of {group.title}
                  </Text>
                </View>
                {groupProgress && (
                  <Text style={styles.groupProgress}>
                    {groupProgress.completed}/{groupProgress.total} complete
                  </Text>
                )}
                <Text style={styles.groupReward}>🎁 {group.reward}</Text>
              </View>
            )}

            {/* Spacer to ensure buttons are always visible */}
            <View style={{ height: 20 }} />

            {/* Action Buttons Section */}
            <View style={styles.bottomActionsContainer}>
              {/* Three Action Buttons Row */}
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
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: colors.accentWarning },
                    ]}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>

              {/* FIXED: Complete Button with unified logic */}
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  task.isCompleted && styles.uncompleteButton,
                  !allSubtasksCompleted() &&
                    !task.isCompleted &&
                    styles.completeButtonDisabled,
                ]}
                onPress={() => onComplete(task.id)}
                disabled={!allSubtasksCompleted() && !task.isCompleted}
              >
                <Check size={20} color={colors.white} />
                <Text style={styles.completeButtonText}>
                  {task.isCompleted ? 'Mark Incomplete' : 'Complete Task'}
                </Text>
              </TouchableOpacity>

              {!allSubtasksCompleted() && !task.isCompleted && (
                <Text style={styles.completeDisabledText}>
                  Complete all steps first to mark this task as done
                </Text>
              )}
            </View>

            {/* Bottom Spacer */}
            <View style={{ height: 60 }} />
          </ScrollView>
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
    { emoji: '⭐', label: "You're a star!" },
    { emoji: '🎉', label: "Let's celebrate!" },
  ];

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
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
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Show a wider range: 30 days in the past to 90 days in the future
  for (let i = -30; i <= 90; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      day: days[date.getDay()],
      date: date.getDate(),
      isToday: i === 0,
      fullDate: date,
      month: months[date.getMonth()],
      year: date.getFullYear(),
      dayKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    });
  }
  return dates;
};

const TimelineScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<
    'All' | 'Mine' | 'Shared'
  >('All');
  const [refreshing, setRefreshing] = useState(false);
  const [encouragementModalVisible, setEncouragementModalVisible] =
    useState(false);
  const [selectedTaskForEncouragement, setSelectedTaskForEncouragement] =
    useState<string | null>(null);
  const [taskDetailTrayVisible, setTaskDetailTrayVisible] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] =
    useState<UnifiedTask | null>(null);

  // FIXED: Get real tasks using updated hook
  const {
    tasks: realTasks,
    loading: tasksLoading,
    toggleTaskCompletion,
    refreshTasks,
    deleteTask,
    updateTaskSteps, // Correct name from the hook
  } = useRealTasks();

  // Debug log the real tasks
  console.log('🏠 useRealTasks returned:', JSON.stringify(realTasks, null, 2));

  // Task Groups State
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([
    {
      id: 'group1',
      title: 'Healthy Week Challenge',
      description: "Let's build healthy habits together",
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
    },
  ]);

  // FIXED: Use tasks directly (they're already UnifiedTask[])
  const tasks = realTasks; // No conversion needed!

  const timelineDates = generateTimelineDates();

  // Check if timeline is empty
  const isTimelineEmpty = () => {
    const allTasks = Object.values(realTasks).flat();
    const filteredTasks = allTasks.filter(task => {
      return (
        selectedFilter === 'All' ||
        (selectedFilter === 'Mine' && !task.isShared) ||
        (selectedFilter === 'Shared' && task.isShared)
      );
    });
    return filteredTasks.length === 0;
  };

  // Get tasks for a specific date key with filtering
  const getTasksForDate = (
    dateKey: string,
    isToday: boolean,
    fullDate: Date,
  ) => {
    let taskList: UnifiedTask[] = [];

    // Try to get tasks by the date key first (for timeline grouping)
    if (isToday) {
      taskList = tasks['today'] || [];
    } else if (dateKey === 'tomorrow') {
      taskList = tasks['tomorrow'] || [];
    } else if (dateKey === 'saturday') {
      taskList = tasks['saturday'] || [];
    }

    // If no tasks found by key, try to find by actual date string
    if (taskList.length === 0) {
      const dateString = fullDate.toISOString().split('T')[0];
      taskList = tasks[dateString] || [];
    }

    // Also check all date keys that match this date
    const allTasks: UnifiedTask[] = [];
    Object.keys(tasks).forEach(key => {
      const keyTasks = tasks[key] || [];
      keyTasks.forEach(task => {
        const taskDate = new Date(task.date).toISOString().split('T')[0];
        const targetDate = fullDate.toISOString().split('T')[0];
        if (taskDate === targetDate) {
          allTasks.push(task);
        }
      });
    });

    // Combine and deduplicate
    const combinedTasks = [...taskList, ...allTasks];
    const uniqueTasks = combinedTasks.filter(
      (task, index, arr) => arr.findIndex(t => t.id === task.id) === index,
    );

    // Apply filter
    return uniqueTasks.filter(task => {
      return (
        selectedFilter === 'All' ||
        (selectedFilter === 'Mine' && !task.isShared) ||
        (selectedFilter === 'Shared' && task.isShared)
      );
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
  const createSwipeHandler = (task: UnifiedTask) => {
    const translateX = new Animated.Value(0);

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 100
        );
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
  const handleTaskEdit = (task: UnifiedTask) => {
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

  const handleTaskDuplicate = (task: UnifiedTask) => {
    console.log('Duplicate task:', task.title);
    setTaskDetailTrayVisible(false);
  };

  const handleTaskComplete = (taskId: string) => {
    toggleTaskCompletion(taskId);
    setTaskDetailTrayVisible(false);
  };

  // FIXED: Updated subtask toggle handler using unified fields
  const handleSubtaskToggle = async (taskId: string, subtaskId: string) => {
    try {
      console.log('🔄 Toggling subtask:', subtaskId, 'for task:', taskId);

      // Find the task in our local state
      const allTasks = Object.values(realTasks).flat();
      const task = allTasks.find(t => t.id === taskId);

      // FIXED: Use unified field names
      const taskSteps = task?.steps || task?.subtasks || [];
      if (!task || taskSteps.length === 0) {
        throw new Error('Task or steps not found');
      }

      // Toggle the subtask completion
      const updatedSteps = taskSteps.map(step =>
        step.id === subtaskId ? { ...step, completed: !step.completed } : step,
      );

      // FIXED: Use the updateTaskSteps method from the hook
      await updateTaskSteps(taskId, updatedSteps);

      console.log('✅ Subtask toggled successfully');
    } catch (err) {
      console.error('❌ Failed to toggle subtask:', err);
    }
  };

  // Handle steps update from TaskDetailTray
  const handleStepsUpdate = async (taskId: string, steps: Array<{id: string; title: string; completed: boolean}>) => {
    try {
      console.log('📝 Updating steps for task:', taskId);
      await updateTaskSteps(taskId, steps);
      console.log('✅ Steps updated successfully');
    } catch (err) {
      console.error('❌ Failed to update steps:', err);
    }
  };

  const TaskItem: React.FC<{ task: UnifiedTask }> = ({ task }) => {
    const { reactions } = useReactions(task.reactions || []);
    const [translateX] = useState(new Animated.Value(0));
    const group = task.groupId ? getGroupById(task.groupId) : null;

    const swipeHandler = createSwipeHandler(task);

    const handleTaskPress = () => {
      console.log('🔍 Task pressed:', task.title, 'ID:', task.id);
      console.log('📊 Task data:', JSON.stringify(task, null, 2));
      console.log('🎭 Setting task detail tray visible to true');
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

    // FIXED: Get time display using unified fields
    const getTimeDisplay = () => {
      const displayTime = task.startTime || task.time || 'TODO';
      return displayTime;
    };

    return (
      <Animated.View
        style={[
          { transform: [{ translateX }] },
          task.isCompleted && styles.taskItemCompleted,
        ]}
        {...swipeHandler.panHandlers}
      >
        <Pressable onPress={handleTaskPress} style={styles.taskItem}>
          <View style={styles.taskContent}>
            {/* Time or Status */}
            <View style={styles.taskTimeContainer}>
              {task.isCompleted ? (
                <Text style={styles.taskStatusDone}>DONE</Text>
              ) : getTimeDisplay() === 'TODO' ? (
                <Text
                  style={[styles.taskStatusTodo, { color: getAccentColor() }]}
                >
                  TODO
                </Text>
              ) : (
                <Text style={[styles.taskTime, { color: getAccentColor() }]}>
                  {getTimeDisplay()}
                </Text>
              )}
            </View>

            {/* Task Details */}
            <View style={styles.taskDetails}>
              <View style={styles.taskTitleRow}>
                {task.emoji && (
                  <Text 
                    style={[
                      styles.taskEmoji,
                      task.isCompleted && { opacity: 0.6 }
                    ]}
                  >
                    {task.emoji}
                  </Text>
                )}
                <Text
                  style={[
                    styles.taskTitle,
                    task.isCompleted && styles.taskTitleCompleted,
                  ]}
                >
                  {task.title}
                </Text>

                {/* Group Tag - only show if task is shared */}
                {group && task.isShared && (
                  <TouchableOpacity style={styles.groupTag}>
                    <View
                      style={[
                        styles.groupTagDot,
                        { backgroundColor: colors.groupColors[group.color] },
                      ]}
                    />
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

              {/* FIXED: Use unified field with fallback */}
              {(task.details || task.subtitle) && (
                <Text
                  style={[
                    styles.taskSubtitle,
                    task.isCompleted && styles.taskSubtitleCompleted,
                  ]}
                >
                  {task.details || task.subtitle}
                </Text>
              )}
            </View>
          </View>

          {/* Reactions */}
          {reactions.length > 0 && (
            <View style={styles.reactionsContainer}>
              <ReactionDisplay
                reactions={reactions}
                onReactionPress={reaction =>
                  console.log('Reaction pressed:', reaction)
                }
              />
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  // Empty State Component
  const EmptyTimelineState: React.FC = () => {
    const getEmptyStateContent = () => {
      switch (selectedFilter) {
        case 'Mine':
          return {
            emoji: '📝',
            title: 'No Personal Tasks Yet',
            subtitle: 'Your personal task timeline is empty',
            description: 'Create your first personal task to get started with planning your day!'
          };
        case 'Shared':
          return {
            emoji: '👥',
            title: 'No Shared Tasks Yet',
            subtitle: 'Your shared task timeline is empty',
            description: 'Create tasks with "Share with partner" enabled to collaborate together!'
          };
        default:
          return {
            emoji: '🌟',
            title: 'Your Timeline Awaits',
            subtitle: 'No tasks scheduled yet',
            description: 'Create your first task to start organizing your day and achieving your goals!'
          };
      }
    };

    const content = getEmptyStateContent();

    return (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyStateContent}>
          <Text style={styles.emptyStateEmoji}>{content.emoji}</Text>
          <Text style={styles.emptyStateTitle}>{content.title}</Text>
          <Text style={styles.emptyStateSubtitle}>{content.subtitle}</Text>
          <Text style={styles.emptyStateDescription}>{content.description}</Text>
          
          <View style={styles.emptyStateActions}>
            <TouchableOpacity style={styles.emptyStateButton}>
              <PlusCircle size={20} color={colors.white} />
              <Text style={styles.emptyStateButtonText}>Create Your First Task</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.emptyStateTips}>
            <Text style={styles.emptyStateTipsTitle}>✨ Pro Tips:</Text>
            <Text style={styles.emptyStateTip}>• Set specific times for better planning</Text>
            <Text style={styles.emptyStateTip}>• Add steps to break down complex tasks</Text>
            <Text style={styles.emptyStateTip}>• Use emojis to make tasks more fun</Text>
            <Text style={styles.emptyStateTip}>• Share tasks with your partner to collaborate</Text>
          </View>
        </View>
      </View>
    );
  };

  const DateSection: React.FC<{ dateInfo: any }> = ({ dateInfo }) => {
    const tasks = getTasksForDate(
      dateInfo.isToday
        ? 'today'
        : dateInfo.day === 'Thursday'
        ? 'tomorrow'
        : dateInfo.day === 'Saturday'
        ? 'saturday'
        : 'none',
      dateInfo.isToday,
      dateInfo.fullDate,
    );

    if (tasks.length === 0) return null;

    return (
      <View style={styles.dateSection}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text
            style={[
              styles.dateNumber,
              dateInfo.isToday && styles.dateNumberToday,
            ]}
          >
            {dateInfo.date}
          </Text>
          <View style={styles.dateInfo}>
            <Text
              style={[
                styles.dateName,
                dateInfo.isToday && styles.dateNameToday,
              ]}
            >
              {dateInfo.day}
            </Text>
            <Text style={styles.dateMonth}>{dateInfo.month}</Text>
          </View>
        </View>

        {/* Tasks for this date */}
        <View style={styles.tasksContainer}>
          {tasks.map(task => (
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
        {(['All', 'Mine', 'Shared'] as const).map(filter => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.filterTabActive,
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === filter && styles.filterTabTextActive,
              ]}
            >
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
        {isTimelineEmpty() ? (
          <EmptyTimelineState />
        ) : (
          <View style={styles.timelineContent}>
            {timelineDates.map((dateInfo, index) => (
              <DateSection key={index} dateInfo={dateInfo} />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FIXED: Task Detail Tray with unified task support */}
      <TaskDetailTray
        visible={taskDetailTrayVisible}
        task={selectedTaskForDetail}
        group={
          selectedTaskForDetail?.groupId
            ? getGroupById(selectedTaskForDetail.groupId)
            : null
        }
        groupProgress={
          selectedTaskForDetail?.groupId
            ? getGroupProgress(selectedTaskForDetail.groupId)
            : undefined
        }
        onClose={() => {
          console.log('🚪 TaskDetailTray onClose called');
          setTaskDetailTrayVisible(false);
        }}
        onEdit={handleTaskEdit}
        onDelete={handleTaskDelete}
        onDuplicate={handleTaskDuplicate}
        onComplete={handleTaskComplete}
        onSubtaskToggle={handleSubtaskToggle}
        onStepsUpdate={handleStepsUpdate}
      />

      {/* Encouragement Modal */}
      <EncouragementModal
        visible={encouragementModalVisible}
        onClose={() => setEncouragementModalVisible(false)}
        onEncouragementSelect={emoji => {
          if (selectedTaskForEncouragement) {
            console.log(
              'Encouragement sent:',
              emoji,
              'for task:',
              selectedTaskForEncouragement,
            );
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
  taskItemCompleted: {
    opacity: 0.6,
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
    textDecorationLine: 'line-through',
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
    textDecorationLine: 'line-through',
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
    flex: 1,
    maxHeight: '90%',
  },
  trayHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  trayScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  trayHeader: {
    marginBottom: 24,
  },
  trayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
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
  sharedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentPrimary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  taskCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  subtasksList: {
    gap: 12,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  subtaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskCheckboxCompleted: {
    backgroundColor: colors.accentSuccess,
    borderColor: colors.accentSuccess,
  },
  subtaskText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  subtaskTextCompleted: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  subtaskItemDragging: {
    backgroundColor: colors.border,
    borderRadius: 8,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dragHandle: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginRight: 8,
  },
  subtaskTextContainer: {
    flex: 1,
  },
  editingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stepEditInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.accentSecondary,
    minHeight: 36,
  },
  editingActions: {
    flexDirection: 'row',
    gap: 4,
  },
  editActionButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: colors.background,
  },
  stepActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  stepActionButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  addStepButtonSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.accentSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
  bottomActionsContainer: {
    backgroundColor: colors.background,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    marginHorizontal: -20, // Extend to edges
    paddingHorizontal: 20,
    marginTop: 20,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  editButton: {
    borderWidth: 1.5,
    borderColor: colors.accentSecondary,
  },
  duplicateButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  deleteButton: {
    borderWidth: 1.5,
    borderColor: colors.accentWarning,
    backgroundColor: colors.accentWarning + '10',
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
    paddingVertical: 18,
    gap: 8,
    marginBottom: 8,
    shadowColor: colors.accentSuccess,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  uncompleteButton: {
    backgroundColor: colors.textTertiary,
  },
  completeButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  completeDisabledText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
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

  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
    minHeight: screenHeight * 0.7,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateDescription: {
    fontSize: 15,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyStateActions: {
    width: '100%',
    marginBottom: 40,
  },
  emptyStateButton: {
    backgroundColor: colors.accentPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  emptyStateTips: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateTipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateTip: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
});

export default TimelineScreen;
