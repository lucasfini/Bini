// src/components/GoalDurationSlider.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { colors } from '../styles';
import { useTheme } from '../context/ThemeContext';
import CustomDurationTray from './CustomDurationTray';

const { width: screenWidth } = Dimensions.get('window');

interface DurationOption {
  value: number; // Duration in minutes
  label: string;
}

interface GoalDurationSliderProps {
  selectedValue: number;
  onSelect: (value: number) => void;
}

const GoalDurationSlider: React.FC<GoalDurationSliderProps> = ({
  selectedValue,
  onSelect,
}) => {
  const { theme } = useTheme();
  const [showCustomTray, setShowCustomTray] = useState(false);

  // Duration options for slider marks
  const durationOptions: DurationOption[] = [
    { value: 15, label: '15m' },
    { value: 30, label: '30m' },
    { value: 45, label: '45m' },
    { value: 60, label: '1h' },
    { value: 90, label: '1.5h' },
    { value: 120, label: '2h' },
  ];

  const minValue = 15;
  const maxValue = 120;
  const step = 15;
  
  // Container dimensions
  const containerWidth = screenWidth - 50; // Total container width
  const thumbWidth = 48; // Thumb width in pixels
  const trackWidth = containerWidth - thumbWidth; // Available track width for movement
  
  // Animated values
  const translateX = useSharedValue(
    ((selectedValue - minValue) / (maxValue - minValue)) * trackWidth
  );

  // Update translateX when selectedValue changes externally
  React.useEffect(() => {
    translateX.value = ((selectedValue - minValue) / (maxValue - minValue)) * trackWidth;
  }, [selectedValue, trackWidth, minValue, maxValue]);

  // Update selected value from translateX
  const updateValue = (x: number) => {
    const clampedX = Math.max(0, Math.min(trackWidth, x));
    const percentage = clampedX / trackWidth;
    const rawValue = minValue + percentage * (maxValue - minValue);
    const steppedValue = Math.round(rawValue / step) * step;
    const finalValue = Math.max(minValue, Math.min(maxValue, steppedValue));
    onSelect(finalValue);
  };

  // Pan gesture handler
  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const newX = context.startX + event.translationX;
      translateX.value = Math.max(0, Math.min(trackWidth, newX));
      runOnJS(updateValue)(translateX.value);
    },
  });

  // Animated styles for thumb
  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Animated styles for progress track
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value + (thumbWidth / 2), // Extend to thumb center
    };
  });

  // Get current label for thumb
  const getCurrentLabel = () => {
    const option = durationOptions.find(opt => opt.value === selectedValue);
    return option ? option.label : `${selectedValue}m`;
  };

  return (
    <View className="py-2.5 px-2.5">
      {/* Header with Title and Extra */}
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-base font-semibold" style={{ color: theme.textPrimary }}>
          Time spent?
        </Text>
        <TouchableOpacity onPress={() => setShowCustomTray(true)}>
          <Text className="text-base font-normal" style={{ color: theme.primary }}>
            extra..
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Slider Container */}
      <View className="w-full mb-5" style={{ width: containerWidth }}>
        {/* Slider Track Background */}
        <View className="w-full h-10 rounded-[20px] relative" style={{ backgroundColor: colors.border }}>
          
          {/* Pink progress track - animated */}
          <Animated.View 
            className="absolute left-0 top-0 h-10 bg-pink-500 rounded-[20px]"
            style={[progressStyle, { zIndex: 1 }]}
          />
          
          {/* Time Labels Inside Track */}
          <View className="absolute inset-0 flex-row items-center justify-between px-3" style={{ zIndex: 2 }}>
            {durationOptions.map((option) => {
              // Position labels evenly across the track
              const labelPosition = ((option.value - minValue) / (maxValue - minValue)) * 100;
              const isSelected = option.value === selectedValue;
              
              // Check if thumb is covering this label
              const thumbCenter = ((selectedValue - minValue) / (maxValue - minValue)) * 100;
              const coverageThreshold = 8; // Percentage threshold for coverage
              const isCovered = Math.abs(thumbCenter - labelPosition) < coverageThreshold;

              return (
                <View
                  key={option.value}
                  className="absolute items-center justify-center"
                  style={{ 
                    left: `${labelPosition}%`,
                    transform: [{ translateX: -12 }] // Center the 24px wide label
                  }}
                >
                  <Text
                    className="text-[12px] text-center font-medium"
                    style={{
                      color: (isCovered && isSelected) ? colors.white : colors.textSecondary,
                    }}
                  >
                    {option.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Custom Draggable Thumb */}
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View 
              className="absolute top-0 bg-pink-500 rounded-[20px] justify-center items-center shadow-lg"
              style={[
                thumbStyle,
                { 
                  width: thumbWidth, 
                  height: 40,
                  zIndex: 10 
                }
              ]}
            >
              <Text className="text-white text-[13px] font-bold">
                {getCurrentLabel()}
              </Text>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </View>

      {/* Custom Duration Tray */}
      <CustomDurationTray
        visible={showCustomTray}
        onClose={() => setShowCustomTray(false)}
        selectedDuration={selectedValue}
        onDurationChange={onSelect}
      />
    </View>
  );
};


export default GoalDurationSlider;