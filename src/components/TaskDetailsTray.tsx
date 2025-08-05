// src/components/TaskDetailsTray.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
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

const { height: screenHeight } = Dimensions.get('window');

interface TaskDetailsTrayProps {
  visible: boolean;
  task: UnifiedTask | null;
  onClose: () => void;
  onEdit?: (task: UnifiedTask) => void;
  onDuplicate?: (task: UnifiedTask) => void;
  onDelete?: (task: UnifiedTask) => void;
  onComplete?: (task: UnifiedTask) => void;
}

// Precise color palette as specified
const colors = {
  background: '#F7F7F7',
  handle: '#E0E0E0',
  labelText: '#666',
  valueText: '#000',
  buttonBackground: '#E0E0E0',
  deleteButton: '#FF6347',
  completeButton: '#4CAF50',
  white: '#FFFFFF',
  icon: '#666',
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
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.3)" barStyle="light-content" />

      {/* Backdrop */}
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          activeOpacity={1}
        />
      </View>

      {/* Tray */}
      <Animated.View style={[styles.trayContainer, trayStyle]}>
        <View style={styles.tray}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.avatarEmoji}>{task.emoji || '📝'}</Text>
              <View style={styles.titleInfo}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskCategory}>
                  {task.category || 'Personal Task'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.icon} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  trayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
  },
  tray: {
    flex: 1,
    backgroundColor: colors.background, // #F7F7F7
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  dragHandle: {
    backgroundColor: colors.handle, // #E0E0E0
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  titleInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.valueText, // #000
  },
  taskCategory: {
    fontSize: 14,
    color: colors.labelText, // #666
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  sectionLabel: {
    fontWeight: 'bold',
    color: colors.labelText, // #666
    marginBottom: 5,
  },
  sectionValue: {
    fontSize: 16,
    color: colors.valueText, // #000
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  addButton: {
    padding: 4,
  },
  stepsList: {
    marginTop: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.labelText,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  stepCheckboxCompleted: {
    backgroundColor: colors.completeButton,
    borderColor: colors.completeButton,
  },
  stepText: {
    fontSize: 16,
    color: colors.valueText,
    flex: 1,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.labelText,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.buttonBackground, // #E0E0E0
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  actionButtonText: {
    color: colors.valueText, // #000
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: colors.deleteButton, // #FF6347
  },
  deleteButtonText: {
    color: colors.white, // #FFFFFF
  },
  completeButton: {
    backgroundColor: colors.completeButton, // #4CAF50
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: colors.white, // #FFFFFF
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  completedIndicator: {
    backgroundColor: colors.buttonBackground,
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: colors.completeButton,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default TaskDetailsTray;
