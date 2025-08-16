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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TaskDetailsTrayProps {
  visible: boolean;
  task: UnifiedTask | null;
  onClose: () => void;
  onEdit?: (task: UnifiedTask) => void;
  onDuplicate?: (task: UnifiedTask) => void;
  onDelete?: (task: UnifiedTask) => void;
  onComplete?: (task: UnifiedTask) => void;
}

// Using consistent colors matching CreateTaskScreen
const colors = {
  white: '#FFFFFF',
  icon: '#666666',
};

const TaskDetailsTray: React.FC<TaskDetailsTrayProps> = ({
  visible,
  task,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onComplete,
}) => {
  const translateY = useSharedValue(screenHeight);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 120,
      });
    } else {
      translateY.value = withTiming(screenHeight, { duration: 300 });
    }
  }, [visible]);

  const trayStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!task) return null;

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

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Task Details</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Task Title Section */}
              <View style={styles.section}>
                <View style={styles.taskTitleRow}>
                  <Text style={styles.taskEmoji}>{task.emoji || '📝'}</Text>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
                <Text style={styles.taskCategory}>
                  {task.category || 'Personal Task'}
                </Text>
              </View>

              {/* Time Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Time</Text>
                <Text style={styles.sectionValue}>
                  {formatTime(task.startTime || task.time)}
                  {task.endTime && ` - ${formatTime(task.endTime)}`}
                </Text>
              </View>

              {/* Details Section */}
              {task.details && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Details</Text>
                  <Text style={styles.sectionValue}>{task.details}</Text>
                </View>
              )}

              {/* Steps Section */}
              <View style={styles.section}>
                <View style={styles.stepsHeader}>
                  <Text style={styles.sectionLabel}>Steps</Text>
                  <TouchableOpacity style={styles.addButton}>
                    <Plus size={16} color={colors.icon} />
                  </TouchableOpacity>
                </View>
                {stepsCount > 0 ? (
                  <>
                    <Text style={styles.sectionValue}>
                      {completedSteps} of {stepsCount} completed
                    </Text>
                    <View style={styles.stepsList}>
                      {task.steps?.map((step, index) => (
                        <View key={step.id} style={styles.stepItem}>
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
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={styles.sectionValue}>No steps added</Text>
                )}
              </View>

              {/* Recurrence Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Recurrence</Text>
                <Text style={styles.sectionValue}>
                  {formatRecurrence(task.recurrence)}
                </Text>
              </View>

              {/* Alerts Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Alerts</Text>
                <Text style={styles.sectionValue}>
                  {formatAlerts(task.alerts)}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit?.(task)}
                >
                  <Edit3 size={16} color={colors.icon} />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onDuplicate?.(task)}
                >
                  <Copy size={16} color={colors.icon} />
                  <Text style={styles.actionButtonText}>Duplicate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => onDelete?.(task)}
                >
                  <Trash2 size={16} color={colors.white} />
                  <Text
                    style={[styles.actionButtonText, styles.deleteButtonText]}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Complete Task Button */}
              {!task.isCompleted && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => onComplete?.(task)}
                >
                  <Text style={styles.completeButtonText}>Complete Task</Text>
                </TouchableOpacity>
              )}

              {task.isCompleted && (
                <View style={styles.completedIndicator}>
                  <Text style={styles.completedText}>Task Completed</Text>
                </View>
              )}
            </ScrollView>
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
    height: screenHeight * 0.8,
  },
  containerInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '400',
    color: '#666666',
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  taskCategory: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    lineHeight: 22,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsList: {
    gap: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  stepCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepCheckboxCompleted: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  stepText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#666666',
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
  completeButton: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  completedIndicator: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TaskDetailsTray;
