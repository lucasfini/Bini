import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import CustomDurationTray from './CustomDurationTray';
import { useTheme } from '../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

// Simplified time options for modern, clean interface
const TIME_OPTIONS = [
  { value: 1, label: '1m', displayLabel: '1 minute' },
  { value: 15, label: '15m', displayLabel: '15 minutes' },
  { value: 30, label: '30m', displayLabel: '30 minutes' },
  { value: 45, label: '45m', displayLabel: '45 minutes' },
  { value: 60, label: '1h', displayLabel: '1 hour' },
  { value: 90, label: '1.5h', displayLabel: '1.5 hours' },
  { value: 120, label: '2h', displayLabel: '2 hours' },
];

interface ModernTimeSpentSliderProps {
  initialValue?: number;
  onValueChange?: (minutes: number) => void;
  containerWidth?: number;
}

const ModernTimeSpentSlider: React.FC<ModernTimeSpentSliderProps> = ({
  initialValue = 60,
  onValueChange,
  containerWidth,
}) => {
  const { theme } = useTheme();
  const [showCustomTray, setShowCustomTray] = useState(false);

  // Find initial index from the provided value
  const getInitialIndex = () => {
    const index = TIME_OPTIONS.findIndex(option => option.value === initialValue);
    return index >= 0 ? index : 3; // Default to 1 hour if not found
  };

  const [selectedIndex, setSelectedIndex] = useState(getInitialIndex());
  
  // Calculate dimensions
  const sliderWidth = containerWidth || screenWidth - 64; // 32px padding on each side
  const stepWidth = sliderWidth / (TIME_OPTIONS.length - 1);
  
  // Find closest discrete time option from position
  const findClosestTimeOption = (position: number) => {
    'worklet';
    const normalizedPosition = Math.max(0, Math.min(sliderWidth, position));
    const percentage = normalizedPosition / sliderWidth;
    
    // Find closest time option
    let closestIndex = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < TIME_OPTIONS.length; i++) {
      const optionPercentage = i / (TIME_OPTIONS.length - 1);
      const distance = Math.abs(percentage - optionPercentage);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    
    return closestIndex;
  };

  // Convert time option index to position
  const indexToPosition = (index: number): number => {
    'worklet';
    const percentage = index / (TIME_OPTIONS.length - 1);
    return percentage * sliderWidth;
  };

  // Convert position to continuous value for smooth dragging
  const positionToValue = (position: number): number => {
    'worklet';
    const normalizedPosition = Math.max(0, Math.min(sliderWidth, position));
    const percentage = normalizedPosition / sliderWidth;
    const minValue = 1;
    const maxValue = 120;
    return Math.round(minValue + (percentage * (maxValue - minValue)));
  };

  // Find initial index and position
  const getInitialIndexFromValue = (value: number) => {
    const index = TIME_OPTIONS.findIndex(option => option.value === value);
    return index >= 0 ? index : 3; // Default to 1 hour if not found
  };

  // Shared values for animations
  const initialIndex = getInitialIndexFromValue(initialValue);
  const translateX = useSharedValue(indexToPosition(initialIndex));
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);

  // Update animations when initialValue changes
  useEffect(() => {
    const newIndex = getInitialIndexFromValue(initialValue);
    translateX.value = withSpring(indexToPosition(newIndex), {
      damping: 20,
      stiffness: 200,
    });
  }, [initialValue, sliderWidth]);

  // Haptic feedback helper
  const triggerHapticFeedback = useCallback(() => {
    console.log('🎯 Haptic feedback triggered');
  }, []);

  // Handle value change and notify parent
  const handleValueChange = useCallback((newValue: number) => {
    if (newValue !== initialValue) {
      onValueChange?.(newValue);
    }
  }, [initialValue, onValueChange]);

  // Handle tap on step
  const handleStepPress = (index: number) => {
    const newValue = TIME_OPTIONS[index].value;
    handleValueChange(newValue);
    translateX.value = withSpring(indexToPosition(index), {
      damping: 20,
      stiffness: 200,
    });
  };

  // Gesture handler with snapping to discrete values
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
      isDragging.value = true;
      scale.value = withTiming(1.1, { duration: 150 });
    },
    onActive: (event, context) => {
      const newPosition = context.startX + event.translationX;
      const clampedPosition = Math.max(0, Math.min(sliderWidth, newPosition));
      translateX.value = clampedPosition;
    },
    onEnd: () => {
      isDragging.value = false;
      scale.value = withTiming(1, { duration: 200 });
      
      // Find closest time option and snap to it
      const closestIndex = findClosestTimeOption(translateX.value);
      const targetPosition = indexToPosition(closestIndex);
      const targetValue = TIME_OPTIONS[closestIndex].value;
      
      // Animate to the target position
      translateX.value = withSpring(targetPosition, {
        damping: 20,
        stiffness: 200,
      });
      
      // Update the value
      runOnJS(handleValueChange)(targetValue);
    },
  });

  // Animated styles
  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  const trackAnimatedStyle = useAnimatedStyle(() => {
    // Calculate progress directly from position (0 to 1)
    const progress = translateX.value / sliderWidth;
    const opacity = 0.3 + (progress * 0.7); // 0.3 to 1.0 opacity
    
    return {
      width: translateX.value,
      backgroundColor: `rgba(236, 72, 153, ${opacity})`, // Pink with variable opacity
    };
  });

  // Get current value label for display
  const getCurrentLabel = () => {
    if (initialValue >= 60) {
      return initialValue === 60 ? '1h' : `${(initialValue / 60).toFixed(1)}h`;
    }
    return `${initialValue}m`;
  };

  return (
    <View style={styles.container}>
      {/* Header with Title and Extra */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Time spent?
        </Text>
        <TouchableOpacity onPress={() => setShowCustomTray(true)}>
          <Text style={[styles.extraButton, { color: theme.primary }]}>
            extra..
          </Text>
        </TouchableOpacity>
      </View>


      {/* Slider Section */}
      <GestureHandlerRootView style={styles.sliderSection}>
        <View style={[styles.sliderContainer, { width: sliderWidth }]}>
          {/* Background Track */}
          <View style={[styles.backgroundTrack, { width: sliderWidth }]} />
          
          {/* Active Track */}
          <Animated.View style={[styles.activeTrack, trackAnimatedStyle]} />
          
          
          {/* Draggable Thumb */}
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.thumb, thumbAnimatedStyle]}>
              <View style={styles.thumbInner} />
            </Animated.View>
          </PanGestureHandler>
        </View>
      </GestureHandlerRootView>

      {/* Time Labels */}
      <View style={[styles.labelsContainer, { width: sliderWidth }]}>
        {TIME_OPTIONS.map((option, index) => {
          const position = (index / (TIME_OPTIONS.length - 1)) * sliderWidth;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.labelButton,
                {
                  position: 'absolute',
                  left: position - 20, // Center the 40px wide label
                }
              ]}
              onPress={() => handleStepPress(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.intervalLabel,
                  TIME_OPTIONS[index].value === initialValue && styles.intervalLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Duration Tray */}
      <CustomDurationTray
        visible={showCustomTray}
        onClose={() => setShowCustomTray(false)}
        selectedDuration={initialValue}
        onDurationChange={(value) => onValueChange?.(value)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  extraButton: {
    fontSize: 16,
    fontWeight: '400',
  },
  sliderSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundTrack: {
    height: 30,
    backgroundColor: '#F2F2F7',
    borderRadius: 7,
    position: 'absolute',
  },
  activeTrack: {
    height: 20,
    backgroundColor: '#EC4899',
    borderRadius: 7,
    position: 'absolute',
    left: 0,
  },
  stepDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D1D6',
    zIndex: 2,
    top: 26, // Center vertically in 60px container (30px - 4px = 26px)
  },
  stepDotActive: {
    backgroundColor: '#EC4899',
    transform: [{ scale: 1.2 }],
  },
  thumb: {
    position: 'absolute',
    width: 40,
    height: 30,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    top: 15, // Center vertically in 60px container (30px - 12px = 18px)
    left: -12, // Center the thumb (-width/2)
  },
  thumbInner: {
    width: 38,
    height: 28,
    borderRadius: 5,
    backgroundColor: '#EC4899',
  },
  labelsContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  labelButton: {
    paddingVertical: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
    width: 40,
  },
  intervalLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  intervalLabelActive: {
    color: '#EC4899',
    fontWeight: '600',
  },
});

export default ModernTimeSpentSlider;