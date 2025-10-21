import React, { useEffect, memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  runOnJS,
  FadeIn,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Task } from '../types';
import { layout } from '../../../theme/designTokens';
import { InlineSteps } from './InlineSteps';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onSwipeComplete: (id: string) => void;
  onStepToggle: (taskId: string, stepId: string) => void;
  index: number;
}

export const TaskCard = memo<TaskCardProps>(({ task, onPress, onSwipeComplete, onStepToggle, index }) => {
  const translateX = useSharedValue(-20);
  const opacity = useSharedValue(0);
  const pulseOpacity = useSharedValue(1);

  const swipeThreshold = layout.window.width * 0.25;
  const windowWidth = layout.window.width;

  useEffect(() => {
    const delay = index * 80;
    
    setTimeout(() => {
      translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 400 });
    }, delay);

    // High priority pulse
    if (task.priority === 'high' && !task.isCompleted) {
      pulseOpacity.value = withRepeat(
        withTiming(0.7, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [task.priority, task.isCompleted, index]);

  const handleSwipeComplete = useCallback(() => {
    onSwipeComplete(task.id);
  }, [onSwipeComplete, task.id]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = Math.min(event.translationX, swipeThreshold * 1.2);
      }
    })
    .onEnd((event) => {
      if (event.translationX > swipeThreshold) {
        translateX.value = withTiming(windowWidth, { duration: 250 });
        runOnJS(handleSwipeComplete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const formatTime = (startTime?: string, durationMin?: number) => {
    if (!startTime) return 'All day';
    
    // Convert 24h to 12h format
    const [hours, minutes] = startTime.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };



  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]} entering={FadeIn.delay(index * 50)}>
        <Pressable
          style={[
            styles.card,
            task.isCompleted && styles.cardCompleted,
            task.priority === 'high' && !task.isCompleted && styles.cardHighPriority,
          ]}
          onPress={() => onPress(task)}
        >
          {/* Shared task accent stripe */}
          {task.isShared && (
            <View style={styles.sharedStripe} />
          )}
          <View style={styles.content}>
            {/* Time Column */}
            <View style={styles.timeColumn}>
              <Animated.Text 
                style={[
                  styles.timeText,
                  task.priority === 'high' && !task.isCompleted && pulseStyle,
                ]}
              >
                {formatTime(task.startTime, task.durationMin)}
              </Animated.Text>
            </View>
            
            {/* Task Content */}
            <View style={styles.taskContent}>
              {/* Title */}
              <View style={styles.titleRow}>
                {task.emoji && (
                  <Text style={styles.emoji}>{task.emoji}</Text>
                )}
                <Text 
                  style={[
                    styles.title,
                    task.isCompleted && styles.titleCompleted,
                  ]}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
              </View>
              
              {/* Inline Steps - only show for incomplete tasks */}
              {!task.isCompleted && (
                <InlineSteps 
                  steps={task.steps || []}
                  taskId={task.id}
                  onStepToggle={onStepToggle}
                  maxVisible={4}
                />
              )}
            </View>
          </View>
          
          {/* Completion indicator */}
          {task.isCompleted && (
            <View style={styles.completionOverlay}>
              <Text style={styles.completionText}>✓</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    minHeight: 50,
  },
  card: {
    backgroundColor: 'transparent',
    paddingTop: 7,
    paddingBottom: 7,
    paddingHorizontal: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  cardCompleted: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  cardHighPriority: {
    backgroundColor: 'rgba(255, 138, 0, 0.1)',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  // Time Column
  timeColumn: {
    width: 72,
    paddingRight: 12,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 6,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CCCCCC',
    textAlign: 'right',
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
  
  // Task Content
  taskContent: {
    flex: 1,
    paddingTop: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
    minHeight: 26,
  },
  emoji: {
    fontSize: 16,
    lineHeight: 22,
    paddingTop: 1,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  titleCompleted: {
    color: '#CCCCCC',
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  
  
  // Completion
  completionOverlay: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  
  // Shared task stripe
  sharedStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FF6B9D',
    borderRadius: 1,
  },
});