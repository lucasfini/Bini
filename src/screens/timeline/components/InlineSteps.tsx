import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';

interface Step {
  id: string;
  title: string;
  completed: boolean;
}

interface InlineStepsProps {
  steps: Step[];
  taskId: string;
  onStepToggle: (taskId: string, stepId: string) => void;
  maxVisible?: number;
}

export const InlineSteps: React.FC<InlineStepsProps> = ({
  steps,
  taskId,
  onStepToggle,
  maxVisible = 4,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!steps?.length) return null;

  const visibleSteps = isExpanded ? steps : steps.slice(0, maxVisible);
  const remainingCount = steps.length - maxVisible;
  const showExpandButton = remainingCount > 0;

  const handleStepPress = (stepId: string) => {
    onStepToggle(taskId, stepId);
  };

  const handleExpandPress = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {visibleSteps.map((step, index) => (
        <StepRow 
          key={step.id}
          step={step}
          onPress={() => handleStepPress(step.id)}
        />
      ))}
      
      {showExpandButton && !isExpanded && (
        <Pressable style={styles.expandButton} onPress={handleExpandPress}>
          <Text style={styles.expandText}>+{remainingCount} more</Text>
        </Pressable>
      )}
    </View>
  );
};

interface StepRowProps {
  step: Step;
  onPress: () => void;
}

const StepRow: React.FC<StepRowProps> = ({ step, onPress }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.94, { duration: 60 }, () => {
      scale.value = withSpring(1, { duration: 120 });
    });
    onPress();
  };

  return (
    <Pressable style={styles.stepRow} onPress={handlePress}>
      <Animated.View style={[styles.checkbox, step.completed && styles.checkboxCompleted, animatedStyle]}>
        {step.completed && (
          <Check size={12} color="#FFFFFF" strokeWidth={3} />
        )}
      </Animated.View>
      <Text 
        style={[
          styles.stepText, 
          step.completed && styles.stepTextCompleted
        ]}
        numberOfLines={1}
      >
        {step.title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
    paddingBottom: 4,
    paddingTop: 2,
    marginTop: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 30,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxCompleted: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#CCCCCC',
    opacity: 0.7,
  },
  stepTextCompleted: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  expandButton: {
    marginTop: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B9D',
    opacity: 0.8,
  },
});