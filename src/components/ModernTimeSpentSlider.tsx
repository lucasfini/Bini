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
import { colors } from '../styles';

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
  startTime?: string;
  showHeader?: boolean;
}

const ModernTimeSpentSlider: React.FC<ModernTimeSpentSliderProps> = ({
  initialValue = 60,
  onValueChange,
  containerWidth,
  startTime,
  showHeader = true,
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
    return index >= 0 ? index : -1; // Return -1 if not found (custom value)
  };

  // Shared values for animations
  const initialIndex = getInitialIndexFromValue(initialValue);
  const getInitialPosition = () => {
    if (initialIndex >= 0) {
      return indexToPosition(initialIndex);
    } else {
      // Custom value, position proportionally
      const minValue = 1;
      const maxValue = 120;
      const percentage = (initialValue - minValue) / (maxValue - minValue);
      return Math.max(0, Math.min(sliderWidth, percentage * sliderWidth));
    }
  };
  const translateX = useSharedValue(getInitialPosition());
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);

  // Update animations when initialValue changes
  useEffect(() => {
    const newIndex = getInitialIndexFromValue(initialValue);
    if (newIndex >= 0) {
      // Value exists in TIME_OPTIONS, position on that option
      translateX.value = withSpring(indexToPosition(newIndex), {
        damping: 20,
        stiffness: 200,
      });
    } else {
      // Custom value, position proportionally between min and max
      const minValue = 1;
      const maxValue = 120;
      const percentage = (initialValue - minValue) / (maxValue - minValue);
      const customPosition = Math.max(0, Math.min(sliderWidth, percentage * sliderWidth));
      translateX.value = withSpring(customPosition, {
        damping: 20,
        stiffness: 200,
      });
    }
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

  // Custom label style - always centered above thumb
  const customLabelAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
    };
  });

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
      const hours = Math.floor(initialValue / 60);
      const minutes = initialValue % 60;
      if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
    return `${initialValue}m`;
  };

  // Check if current value is a preset
  const isPresetValue = () => {
    return TIME_OPTIONS.some(option => option.value === initialValue);
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTimeStr: string, durationMinutes: number): string => {
    if (!startTimeStr) return '';
    
    try {
      const [hours, minutes] = startTimeStr.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + durationMinutes;
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  // Format time to 12-hour format
  const formatTime12Hour = (timeStr: string): string => {
    if (!timeStr) return '';
    
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

  // Get time range display
  const getTimeRangeDisplay = () => {
    if (!startTime) return getCurrentLabel();
    
    const endTime = calculateEndTime(startTime, initialValue);
    const startFormatted = formatTime12Hour(startTime);
    const endFormatted = formatTime12Hour(endTime);
    
    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      {showHeader && (
        <View style={styles.premiumHeader}>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            TIME SPENT
          </Text>
          
          {startTime && (
            <Text style={[styles.centerTimeRange, { color: theme.textSecondary }]}>
              {getTimeRangeDisplay()}
            </Text>
          )}
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setShowCustomTray(true)}
              style={styles.customButton}
            >
              <Text style={[styles.customButtonText, { color: theme.primary }]}>
                Custom
              </Text>
            </TouchableOpacity>
            <View style={[styles.actionDot, { backgroundColor: theme.primary }]} />
          </View>
        </View>
        </View>
      )}

      {/* Slider Section */}
      <GestureHandlerRootView style={styles.sliderSection}>
        <View style={[styles.sliderContainer, { width: sliderWidth }]}>
          {/* Background Track */}
          <View style={[styles.backgroundTrack, { width: sliderWidth }]} />
          
          {/* Active Track */}
          <Animated.View style={[styles.activeTrack, trackAnimatedStyle]} />
          
          
          {/* Custom Value Label */}
          {!isPresetValue() && (
            <Animated.View style={[styles.customValueLabel, customLabelAnimatedStyle]}>
              <Text style={styles.customValueText}>{getCurrentLabel()}</Text>
            </Animated.View>
          )}
          
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

      {/* Custom Duration Tray with Circular Time Picker */}
      <CustomDurationTray
        visible={showCustomTray}
        onClose={() => setShowCustomTray(false)}
        selectedDuration={initialValue}
        onDurationChange={(value) => onValueChange?.(value)}
        useCircularPicker={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  // Premium Header Styles
  premiumHeader: {
    width: '100%',
    marginBottom: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  customButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
  centerTimeRange: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    opacity: 0.8,
    textAlign: 'center',
    flex: 1,
  },
  sliderSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 2,
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
    left: -20, // Center the thumb (-width/2 = -40/2 = -20)
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
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },
  intervalLabelActive: {
    color: '#EC4899',
    fontWeight: '600',
  },
  customValueLabel: {
    position: 'absolute',
    top: -10, // Position closer to the thumb, just above it
    left: -30, // Center the label (-width/2 = -60/2 = -30)
    width: 60,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: '#EC4899',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
  customValueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ModernTimeSpentSlider;