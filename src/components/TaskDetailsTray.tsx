// src/components/TaskDetailsTray.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  X,
  Clock,
  FileText,
  CheckSquare,
  RefreshCw,
  Bell,
  Edit3,
  Copy,
  Trash2,
  Check,
  Plus,
} from '@tamagui/lucide-icons';
import { UnifiedTask } from '../types/tasks';
import { colors } from '../styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TaskDetailsTrayProps {
  visible: boolean;
  task: UnifiedTask | null;
  onClose: () => void;
  onEdit?: (task: UnifiedTask) => void;
  onDuplicate?: (task: UnifiedTask) => void;
  onDelete?: (task: UnifiedTask) => void;
  onComplete?: (task: UnifiedTask) => void;
  onStepToggle?: (taskId: string, stepId: string) => void;
  onAddStep?: (taskId: string, stepText?: string) => void;
}

// Using colors from design system

const TaskDetailsTray: React.FC<TaskDetailsTrayProps> = ({
  visible,
  task,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onComplete,
  onStepToggle,
  onAddStep,
}) => {
  const translateY = useSharedValue(screenHeight);
  const containerHeight = useSharedValue(250); // Start with compact height
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setIsExpanded(false); // Reset to collapsed when opening
      containerHeight.value = 250; // Reset to compact height
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 120,
      });
    } else {
      translateY.value = withTiming(screenHeight, { duration: 300 });
    }
  }, [visible]);

  React.useEffect(() => {
    if (isExpanded) {
      containerHeight.value = withSpring(screenHeight * 0.8, {
        damping: 18,
        stiffness: 100,
      });
    } else {
      containerHeight.value = withSpring(250, {
        damping: 18,
        stiffness: 100,
      });
    }
  }, [isExpanded]);

  const trayStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: containerHeight.value,
  }));

  if (!task) return null;

  // Enhanced button handlers with user feedback
  const handleEdit = () => {
    onEdit?.(task);
    onClose(); // Close tray when editing
  };

  const handleDuplicate = () => {
    Alert.alert(
      'Duplicate Task',
      `Create a copy of "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Duplicate', 
          onPress: () => {
            onDuplicate?.(task);
            onClose();
          }
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDelete?.(task);
            onClose();
          }
        },
      ]
    );
  };

  const handleComplete = () => {
    const action = task.isCompleted ? 'mark as incomplete' : 'complete';
    Alert.alert(
      'Complete Task',
      `${action.charAt(0).toUpperCase() + action.slice(1)} "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: task.isCompleted ? 'Mark Incomplete' : 'Complete', 
          onPress: () => onComplete?.(task)
        },
      ]
    );
  };

  const handleAddStep = () => {
    Alert.prompt(
      'Add Step',
      'Enter a description for the new step:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: (text) => {
            if (text && text.trim()) {
              onAddStep?.(task.id, text.trim());
            }
          }
        },
      ],
      'plain-text'
    );
  };

  const formatTime = (time?: string) => {
    if (!time) return 'Not set';
    // Format time to be more readable
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatRecurrence = (recurrence?: UnifiedTask['recurrence']) => {
    if (!recurrence || recurrence.frequency === 'none') return 'Never';

    const { frequency, interval, daysOfWeek } = recurrence;

    if (frequency === 'daily') {
      return interval === 1 ? 'Daily' : `Every ${interval} days`;
    }

    if (frequency === 'weekly') {
      if (daysOfWeek && daysOfWeek.length > 0) {
        return `Weekly on ${daysOfWeek.join(', ')}`;
      }
      return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
    }

    if (frequency === 'monthly') {
      return interval === 1 ? 'Monthly' : `Every ${interval} months`;
    }

    return 'Custom';
  };

  const formatAlerts = (alerts?: string[]) => {
    if (!alerts || alerts.length === 0) return 'None';
    return alerts.join(', ');
  };

  const stepsCount = task.steps?.length || 0;
  const completedSteps = task.steps?.filter(step => step.completed).length || 0;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <Animated.View style={[styles.container, trayStyle]}>
          <View style={styles.containerInner}>

            {/* Compact Header with Task Info */}
            <View style={styles.compactHeader}>
              <View style={styles.taskTitleRow}>
                <Text style={styles.taskEmoji}>{task.emoji || '📝'}</Text>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskCategory}>
                    {task.isShared ? 'Shared' : 'Personal'} • {formatTime(task.startTime || task.time)}
                    {task.endTime && ` - ${formatTime(task.endTime)}`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons - Always Visible */}
            <View style={styles.actionButtonsContainer}>
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleEdit}
                >
                  <Edit3 size={16} color={colors.textSecondary} />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleDuplicate}
                >
                  <Copy size={16} color={colors.textSecondary} />
                  <Text style={styles.actionButtonText}>Duplicate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <Trash2 size={16} color={colors.white} />
                  <Text
                    style={[styles.actionButtonText, styles.deleteButtonText]}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Complete button in separate row */}
              {!task.isCompleted ? (
                <TouchableOpacity
                  style={styles.completeButtonFull}
                  onPress={handleComplete}
                >
                  <Check size={16} color={colors.white} />
                  <Text style={styles.completeButtonFullText}>Complete Task</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.completedButtonFull}>
                  <Check size={16} color={colors.white} />
                  <Text style={styles.completedButtonFullText}>Task Completed</Text>
                </View>
              )}
            </View>

            {/* Show Details Button */}
            {!isExpanded && (
              <TouchableOpacity
                style={styles.showDetailsButton}
                onPress={() => setIsExpanded(true)}
              >
                <Text style={styles.showDetailsButtonText}>Show Details</Text>
              </TouchableOpacity>
            )}

            {/* Expanded Content */}
            {isExpanded && (
              <>
                <ScrollView
                  style={styles.expandedContent}
                  showsVerticalScrollIndicator={false}
                >
              {/* Enhanced Details Cards */}
              <View style={styles.detailsContainer}>
                {/* Time Card */}
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <Clock size={16} color={colors.primary} />
                    <Text style={styles.detailCardTitle}>Scheduled Time</Text>
                  </View>
                  <Text style={styles.detailCardValue}>
                    {formatTime(task.startTime || task.time)}
                    {task.endTime && ` - ${formatTime(task.endTime)}`}
                  </Text>
                </View>

                {/* Details Card */}
                {task.details && (
                  <View style={styles.detailCard}>
                    <View style={styles.detailCardHeader}>
                      <FileText size={16} color={colors.primary} />
                      <Text style={styles.detailCardTitle}>Notes</Text>
                    </View>
                    <Text style={styles.detailCardValue}>{task.details}</Text>
                  </View>
                )}

                {/* Recurrence Card */}
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <RefreshCw size={16} color={colors.primary} />
                    <Text style={styles.detailCardTitle}>Repeat</Text>
                  </View>
                  <Text style={styles.detailCardValue}>
                    {formatRecurrence(task.recurrence)}
                  </Text>
                </View>

                {/* Alerts Card */}
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <Bell size={16} color={colors.primary} />
                    <Text style={styles.detailCardTitle}>Alerts</Text>
                  </View>
                  <Text style={styles.detailCardValue}>
                    {formatAlerts(task.alerts)}
                  </Text>
                </View>
              </View>

              {/* Enhanced Steps Section */}
              <View style={styles.stepsCard}>
                <View style={styles.stepsCardHeader}>
                  <View style={styles.detailCardHeader}>
                    <CheckSquare size={16} color={colors.primary} />
                    <Text style={styles.detailCardTitle}>Steps</Text>
                  </View>
                  <View style={styles.stepsProgress}>
                    <Text style={styles.stepsProgressText}>
                      {completedSteps}/{stepsCount}
                    </Text>
                    <TouchableOpacity 
                      style={styles.addStepButton}
                      onPress={handleAddStep}
                    >
                      <Plus size={14} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {stepsCount > 0 && (
                  <View style={styles.stepsProgressBar}>
                    <View style={styles.stepsProgressBarBg}>
                      <View 
                        style={[
                          styles.stepsProgressBarFill,
                          { width: `${(completedSteps / stepsCount) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                )}
                
                {stepsCount > 0 ? (
                  <View style={styles.stepsList}>
                    {task.steps?.map((step, index) => (
                      <TouchableOpacity 
                        key={step.id} 
                        style={styles.stepItem}
                        onPress={() => onStepToggle?.(task.id, step.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.stepCheckbox,
                            step.completed && styles.stepCheckboxCompleted,
                          ]}
                        >
                          {step.completed && (
                            <Check size={12} color={colors.white} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.stepText,
                            step.completed && styles.stepTextCompleted,
                          ]}
                        >
                          {step.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyStepsText}>No steps added yet</Text>
                )}
              </View>
                </ScrollView>
                
                {/* Hide Details Button - Fixed at bottom */}
                <TouchableOpacity
                  style={styles.hideDetailsButton}
                  onPress={() => setIsExpanded(false)}
                >
                  <Text style={styles.hideDetailsButtonText}>Hide Details</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: screenWidth * 0.9,
  },
  containerInner: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    flex: 1,
    overflow: 'hidden',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.textSecondary,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  expandedContent: {
    maxHeight: screenHeight * 0.5,
    paddingTop: 16,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  detailCardValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
    lineHeight: 20,
  },
  stepsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
  },
  stepsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepsProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepsProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addStepButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsProgressBar: {
    marginBottom: 16,
  },
  stepsProgressBarBg: {
    height: 6,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  stepsProgressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskEmoji: {
    fontSize: 28,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  taskCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stepsList: {
    gap: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepCheckboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  emptyStepsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
    opacity: 0.7,
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.white,
  },
  completeButtonFull: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonFullText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  completedButtonFull: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completedButtonFullText: {
    color: colors.success,
    fontWeight: '600',
    fontSize: 16,
  },
  showDetailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showDetailsButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  hideDetailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hideDetailsButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default TaskDetailsTray;
