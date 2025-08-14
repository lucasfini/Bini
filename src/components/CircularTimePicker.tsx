import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface CircularTimePickerProps {
  initialMinutes?: number;
  onTimeChange?: (minutes: number) => void;
  size?: number;
}

const CircularTimePicker: React.FC<CircularTimePickerProps> = ({
  initialMinutes = 0,
  onTimeChange,
  size = 220, // Smaller to fit in tray
}) => {
  const maxMinutes = 12 * 60; // 12 hours in minutes
  const center = size / 2;
  const radius = (size - 60) / 2;
  const activeStrokeWidth = 12; // Thicker for pink arc
  const inactiveStrokeWidth = 6; // Thinner for gray track

  // Convert minutes to angle for semi-circular arc (left to right)
  const minutesToAngle = (minutes: number): number => {
    'worklet';
    // Semi-circular: 0 minutes = 180° (left), 12 hours = 0° (right)
    // Arc goes from left (180°) to right (0°) = 180° total
    const progress = minutes / maxMinutes; // 0 to 1
    return 180 - (progress * 180); // 180° to 0°
  };

  // Convert angle to minutes for semi-circular arc
  const angleToMinutes = (angle: number): number => {
    'worklet';
    // Clamp angle to semi-circle range: 0° to 180°
    const clampedAngle = Math.max(0, Math.min(180, angle));
    // Right (0°) = max time (12h), Left (180°) = min time (0h)
    // So: angle 0° = progress 1.0, angle 180° = progress 0.0
    const progress = 1 - (clampedAngle / 180); // Flipped the calculation
    return Math.round(progress * maxMinutes);
  };

  // Calculate angle from touch position for left-to-right semi-circle OVER THE TOP
  const positionToAngle = (x: number, y: number): number => {
    'worklet';
    const deltaX = x - center;
    const deltaY = y - center;
    let angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
    
    // Convert to 0-360 range
    if (angle < 0) {
      angle += 360;
    }
    
    // Map touches to the upper semicircle (where the pink arc is)
    // Upper semicircle: 180° (left) to 0° (right) going over the top
    if (angle > 180) {
      // Bottom half - map to upper semicircle
      // 181°-359° maps to 179°-1° (flip to upper semicircle)
      angle = 360 - angle;
    }
    
    return angle;
  };

  // Format minutes to HH:MM (non-worklet version)
  const formatTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };


  // Shared values - respect initialMinutes prop
  const currentMinutes = useSharedValue(initialMinutes);
  const currentSeconds = useSharedValue(0); // Add seconds
  

  // State for display time (since we can't use worklet values directly in Text)
  const [displayTime, setDisplayTime] = useState(formatTime(initialMinutes));
  const [displaySeconds, setDisplaySeconds] = useState('00');
  const [currentProgress, setCurrentProgress] = useState(initialMinutes / maxMinutes);


  // PanResponder for handling touch events on the entire circle
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Always capture touch events for better responsiveness
      return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
    },
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    
    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      console.log('Touch at:', locationX, locationY);
      
      const angle = positionToAngle(locationX, locationY);
      console.log('Calculated angle:', angle);
      
      const convertedMinutes = angleToMinutes(angle);
      const newMinutes = Math.max(0, Math.min(convertedMinutes, maxMinutes));
      console.log('New minutes:', newMinutes);
      
      currentMinutes.value = newMinutes;
      setDisplayTime(formatTime(newMinutes));
      setCurrentProgress(newMinutes / maxMinutes);
      onTimeChange?.(newMinutes);
    },
    
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      const angle = positionToAngle(locationX, locationY);
      const convertedMinutes = angleToMinutes(angle);
      const newMinutes = Math.max(0, Math.min(convertedMinutes, maxMinutes));
      
      currentMinutes.value = newMinutes;
      setDisplayTime(formatTime(newMinutes));
      setCurrentProgress(newMinutes / maxMinutes);
      onTimeChange?.(newMinutes);
    },
    
    onPanResponderRelease: () => {
      // Add smooth animation
      currentMinutes.value = withSpring(currentMinutes.value, { damping: 20, stiffness: 300 });
    },
  });


  // Calculate progress for active arc
  const progress = useDerivedValue(() => {
    return currentMinutes.value / maxMinutes;
  });


  // Create animated style for semi-circular arc
  const semiArcStyle = useAnimatedStyle(() => {
    const progressValue = currentMinutes.value / maxMinutes;
    
    // For semi-circular arc, we'll use strokeDasharray to show progress
    const circumference = Math.PI * radius; // Half circle circumference
    const strokeDashoffset = circumference * (1 - progressValue);
    
    return {
      opacity: progressValue > 0 ? 1 : 0,
      // Will be used with SVG
    };
  });

  return (
    <View style={styles.container}>
      <View 
        style={[styles.circularContainer, { 
          width: size, 
          height: size,
          backgroundColor: 'transparent', // Make sure it's touchable
        }]}
        {...panResponder.panHandlers}
      >
        {/* SVG for precise arc rendering */}
        <Svg width={size} height={size} style={styles.svg}>
          {/* Inactive track - thin gray semi-circle from left to right */}
          <Path
            d={`M ${center - radius} ${center}
                A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            stroke="#F2F2F7"
            strokeWidth={inactiveStrokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Active arc - thick pink semi-circular from left to right */}
          {currentProgress > 0 && (
            <Path
              d={`M ${center - radius} ${center}
                  A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
              stroke="#EC4899"
              strokeWidth={activeStrokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${Math.PI * radius}`}
              strokeDashoffset={Math.PI * radius * (1 - currentProgress)}
            />
          )}
        </Svg>

        {/* Center Display with HH:MM and SS */}
        <View style={[styles.centerDisplay, { 
          width: radius * 1.4, 
          height: radius * 1.4,
          borderRadius: radius * 0.7,
        }]}>
          <Text style={styles.timeText}>
            {displayTime}
          </Text>
          <Text style={styles.secondsText}>
            {displaySeconds}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  backgroundCircle: {
    position: 'absolute',
    borderColor: '#F2F2F7',
  },
  activeArcContainer: {
    position: 'absolute',
  },
  activeArc: {
    borderColor: 'transparent',
    borderTopColor: '#EC4899',
  },
  centerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  svg: {
    position: 'absolute',
  },
  timeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1,
  },
  secondsText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666666',
    marginTop: 2,
  },
});

export default CircularTimePicker;