// src/components/tasks/GroupedTaskCard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { typography, spacing, shadows } from '../../styles';

// Use the same color scheme as TimelineScreen for consistency
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
  
  // Accent colors
  accentPrimary: '#FF6B9D',    // Pink for shared/today
  accentSecondary: '#6B73FF',  // Blue for default
  accentWarning: '#FF6B6B',    // Red for high priority
  accentSuccess: '#4CAF50',    // Green for completed
  
  // Special
  white: '#FFFFFF',
  black: '#000000',
} as const;

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
  groupId?: string;
  reactions: Array<{
    emoji: string;
    count: number;
    isFromPartner: boolean;
    users: string[];
  }>;
  priority: 'low' | 'medium' | 'high';
  progress?: number;
}

interface GroupedTaskCardProps {
  group: TaskGroup;
  tasks: EnhancedTask[];
  onTaskPress: (task: EnhancedTask) => void;
  onRewardClaim: (group: TaskGroup) => void;
  onTaskToggle: (taskId: string) => void;
}

const GroupedTaskCard: React.FC<GroupedTaskCardProps> = ({
  group,
  tasks,
  onTaskPress,
  onRewardClaim,
  onTaskToggle,
}) => {
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const isGroupCompleted = progress === 1 && totalTasks > 0;

  const [glowAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Start glow animation when completed
    if (isGroupCompleted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isGroupCompleted, progress]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleRewardClaim = () => {
    Alert.alert(
      '🎉 Reward Unlocked!',
      `Congratulations! You've earned: ${group.reward}`,
      [
        { text: 'Amazing!', onPress: () => onRewardClaim(group) }
      ]
    );
  };

  return (
    <View style={[
      styles.groupCard,
      isGroupCompleted && styles.groupCardCompleted
    ]}>
      {/* Group Header */}
      <View style={styles.groupHeader}>
        <View style={styles.groupTitleRow}>
          <Text style={styles.groupEmoji}>{group.emoji}</Text>
          <View style={styles.groupTitleContainer}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <Text style={styles.groupDescription}>{group.description}</Text>
          </View>
        </View>
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { 
                  width: progressWidth,
                  backgroundColor: isGroupCompleted ? '#FFE55C' : colors.accentPrimary,
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {completedTasks}/{totalTasks} completed
          </Text>
        </View>
      </View>

      {/* Tasks List */}
      <View style={styles.groupTasks}>
        {tasks.map((task, index) => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.groupTaskItem,
              task.isCompleted && styles.groupTaskItemCompleted
            ]}
            onPress={() => onTaskPress(task)}
            onLongPress={() => onTaskToggle(task.id)}
          >
            <TouchableOpacity 
              style={[
                styles.taskCheckbox,
                task.isCompleted && styles.taskCheckboxCompleted
              ]}
              onPress={() => onTaskToggle(task.id)}
            >
              {task.isCompleted && (
                <Text style={styles.taskCheckboxText}>✓</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.groupTaskEmoji}>{task.emoji}</Text>
            <View style={styles.groupTaskContent}>
              <Text style={[
                styles.groupTaskTitle,
                task.isCompleted && styles.groupTaskTitleCompleted
              ]}>
                {task.title}
              </Text>
              {task.time && (
                <Text style={styles.groupTaskTime}>
                  {task.time}{task.endTime ? ` - ${task.endTime}` : ''}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reward Section */}
      <View style={[
        styles.rewardSection,
        isGroupCompleted && styles.rewardSectionActive
      ]}>
        <Text style={styles.rewardIcon}>🎁</Text>
        <View style={styles.rewardContent}>
          <Text style={styles.rewardLabel}>Reward:</Text>
          <Text style={[
            styles.rewardText,
            isGroupCompleted && styles.rewardTextActive
          ]}>
            {group.reward}
          </Text>
        </View>
        {isGroupCompleted && !group.completedAt && (
          <TouchableOpacity
            style={styles.claimButton}
            onPress={handleRewardClaim}
          >
            <Text style={styles.claimButtonText}>Claim! 🎉</Text>
          </TouchableOpacity>
        )}
        {group.completedAt && (
          <View style={styles.claimedBadge}>
            <Text style={styles.claimedText}>Claimed ✓</Text>
          </View>
        )}
      </View>

      {/* Completion Glow Effect */}
      {isGroupCompleted && (
        <Animated.View 
          style={[
            styles.completionGlow,
            { opacity: glowOpacity }
          ]} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    margin: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD93D',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  groupCardCompleted: {
    borderColor: '#FFE55C',
    shadowColor: '#FFE55C',
    shadowOpacity: 0.3,
  },
  completionGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFE55C',
    opacity: 0.1,
    borderRadius: 14,
  },
  groupHeader: {
    marginBottom: 16,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  groupEmoji: {
    fontSize: 24,
  },
  groupTitleContainer: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  groupTasks: {
    gap: 8,
    marginBottom: 16,
  },
  groupTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    gap: 12,
  },
  groupTaskItemCompleted: {
    opacity: 0.7,
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxCompleted: {
    backgroundColor: colors.accentSuccess,
    borderColor: colors.accentSuccess,
  },
  taskCheckboxText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
  },
  groupTaskEmoji: {
    fontSize: 16,
  },
  groupTaskContent: {
    flex: 1,
  },
  groupTaskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  groupTaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  groupTaskTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    gap: 12,
  },
  rewardSectionActive: {
    backgroundColor: '#FFE55C20',
    borderWidth: 1,
    borderColor: '#FFE55C',
  },
  rewardIcon: {
    fontSize: 20,
  },
  rewardContent: {
    flex: 1,
  },
  rewardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rewardTextActive: {
    color: '#FF8C00',
  },
  claimButton: {
    backgroundColor: '#FFE55C',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#FFE55C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  claimedBadge: {
    backgroundColor: colors.accentSuccess,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  claimedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
});

export default GroupedTaskCard;