import React, { useEffect, memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
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
import { Check } from 'lucide-react-native';
import { Task } from '../types';
import { layout } from '../../../theme/designTokens';

interface Step {
  id: string;
  title: string;
  completed: boolean;
}

interface EnhancedTaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onSwipeComplete: (id: string) => void;
  onStepToggle: (taskId: string, stepId: string) => void;
  index: number;
}

/**
 * Enhanced Task Card Component with Professional Layout
 * 
 * Features:
 * - Visual containment of sub-tasks within parent task container
 * - Proper spacing and alignment for all elements
 * - Responsive design for different screen sizes
 * - Clean modern styling with consistent visual hierarchy
 */
export const EnhancedTaskCard = memo<EnhancedTaskCardProps>(({ 
  task, 
  onPress, 
  onSwipeComplete, 
  onStepToggle, 
  index 
}) => {
  // Animation values
  const translateX = useSharedValue(-20);
  const opacity = useSharedValue(0);
  const height = useSharedValue(60);
  const pulseOpacity = useSharedValue(1);

  const swipeThreshold = layout.window.width * 0.25;
  const windowWidth = layout.window.width;

  // Initialize animations on mount
  useEffect(() => {
    const delay = index * 80;
    
    setTimeout(() => {
      translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 400 });
    }, delay);

    // High priority pulse animation
    if (task.priority === 'high' && !task.isCompleted) {
      pulseOpacity.value = withRepeat(
        withTiming(0.7, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [task.priority, task.isCompleted, index]);

  // Swipe gesture handling
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
        height.value = withTiming(0, { duration: 350 });
        runOnJS(handleSwipeComplete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
    height: height.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Time formatting utility
  const formatTime = (startTime?: string, durationMin?: number) => {
    if (!startTime) return 'All day';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  // Step toggle handler
  const handleStepToggle = useCallback((stepId: string) => {
    onStepToggle(task.id, stepId);
  }, [task.id, onStepToggle]);

  // Render individual step item
  const renderStepItem = ({ item: step }: { item: Step }) => (
    <StepItem 
      step={step} 
      onToggle={() => handleStepToggle(step.id)} 
    />
  );

  // Calculate if we need to show steps
  const hasSteps = task.steps && task.steps.length > 0;
  const visibleSteps = hasSteps ? task.steps.slice(0, 4) : [];
  const remainingStepsCount = hasSteps ? Math.max(0, task.steps.length - 4) : 0;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View 
        style={[styles.container, animatedStyle]} 
        entering={FadeIn.delay(index * 50)}
      >
        <Pressable
          style={[
            styles.card,
            task.priority === 'high' && !task.isCompleted && styles.cardHighPriority,
            hasSteps && styles.cardWithSteps, // Additional styling when steps are present
          ]}
          onPress={() => onPress(task)}
        >
          {/* Shared task accent stripe */}
          {task.isShared && (
            <View style={styles.sharedStripe} />
          )}
          
          {/* Main task content container */}
          <View style={styles.taskContainer}>
            {/* Header section with time, emoji, and title */}
            <View style={styles.taskHeader}>
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
              
              {/* Title Content */}
              <View style={styles.titleContent}>
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
              </View>
            </View>
            
            {/* Steps section - visually contained within the task card */}
            {hasSteps && (
              <View style={styles.stepsContainer}>
                {/* Steps list header */}
                <View style={styles.stepsHeader}>
                  <View style={styles.stepsIndicatorLine} />
                </View>
                
                {/* Render steps using FlatList for performance */}
                <View style={styles.stepsList}>
                  <FlatList
                    data={visibleSteps}
                    renderItem={renderStepItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.stepSeparator} />}
                  />
                  
                  {/* Show remaining steps count if applicable */}
                  {remainingStepsCount > 0 && (
                    <Pressable style={styles.moreStepsButton}>
                      <Text style={styles.moreStepsText}>
                        +{remainingStepsCount} more step{remainingStepsCount !== 1 ? 's' : ''}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
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

/**
 * Individual Step Item Component
 * 
 * Features:
 * - Consistent checkbox styling with animations
 * - Proper indentation and spacing
 * - Clear visual hierarchy as sub-item
 */
const StepItem = memo<{
  step: Step;
  onToggle: () => void;
}>(({ step, onToggle }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.94, { duration: 60 }, () => {
      scale.value = withSpring(1, { duration: 120 });
    });
    onToggle();
  };

  return (
    <Pressable style={styles.stepItem} onPress={handlePress}>
      {/* Step checkbox */}
      <Animated.View style={[
        styles.stepCheckbox, 
        step.completed && styles.stepCheckboxCompleted,
        animatedStyle
      ]}>
        {step.completed && (
          <Check size={10} color="#FFFFFF" strokeWidth={3} />
        )}
      </Animated.View>
      
      {/* Step text */}
      <Text 
        style={[
          styles.stepText, 
          step.completed && styles.stepTextCompleted
        ]}
        numberOfLines={2}
      >
        {step.title}
      </Text>
    </Pressable>
  );
});

/**
 * Comprehensive StyleSheet with Professional Styling
 * 
 * Design principles:
 * - Consistent spacing using 4px base unit
 * - Clear visual hierarchy with typography and colors
 * - Proper containment and indentation for nested elements
 * - Responsive design considerations
 */
const styles = StyleSheet.create({
  // Container styles
  container: {
    marginBottom: 12, // Increased spacing between task cards
  },
  
  // Main card styling
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 38, 0.08)',
  },
  
  // Card variants
  cardHighPriority: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF8A00',
    backgroundColor: 'rgba(255, 138, 0, 0.02)',
  },
  
  cardWithSteps: {
    paddingBottom: 20, // Extra padding when steps are present
  },
  
  // Shared task accent
  sharedStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#FF6B9D',
    borderRadius: 2,
  },
  
  // Main task container
  taskContainer: {
    flex: 1,
  },
  
  // Task header section
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  // Time column styling
  timeColumn: {
    width: 80,
    paddingRight: 16,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A6B54',
    textAlign: 'right',
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
  
  // Title content area
  titleContent: {
    flex: 1,
  },
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  
  emoji: {
    fontSize: 18,
    lineHeight: 24,
  },
  
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E26',
    lineHeight: 22,
  },
  
  titleCompleted: {
    color: '#5A6B54',
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  
  // Steps container - provides visual containment
  stepsContainer: {
    marginTop: 16,
    marginLeft: 96, // Align with title content (time column width + padding)
    backgroundColor: 'rgba(247, 243, 233, 0.3)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(90, 107, 84, 0.2)',
  },
  
  stepsHeader: {
    marginBottom: 8,
  },
  
  stepsIndicatorLine: {
    height: 1,
    backgroundColor: 'rgba(90, 107, 84, 0.15)',
    marginBottom: 4,
  },
  
  stepsList: {
    gap: 2,
  },
  
  stepSeparator: {
    height: 4,
  },
  
  // Individual step styling
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 12,
    minHeight: 32,
  },
  
  stepCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(90, 107, 84, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 2, // Align with text baseline
  },
  
  stepCheckboxCompleted: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  
  stepText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#5A6B54',
    lineHeight: 20,
    opacity: 0.8,
  },
  
  stepTextCompleted: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  
  // More steps indicator
  moreStepsButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  
  moreStepsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B9D',
    opacity: 0.8,
  },
  
  // Completion overlay
  completionOverlay: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  completionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default EnhancedTaskCard;