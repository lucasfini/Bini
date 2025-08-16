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
import Svg, { Path, Circle } from 'react-native-svg';

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
  const minMinutes = 1; // Minimum 1 minute
  const center = size / 2;
  const radius = (size - 60) / 2;
  const activeStrokeWidth = 12; // Thicker for pink arc
  const inactiveStrokeWidth = 6; // Thinner for gray track

  // Convert minutes to angle for 280-degree arc starting at 220°
  const minutesToAngle = (minutes: number): number => {
    'worklet';
    // 280-degree arc: 1 minute = 220°, max minutes = 500° (140° wrapped)
    // Leaves 80° gap from 140° to 220°
    const clampedMinutes = Math.max(minMinutes, Math.min(maxMinutes, minutes));
    const progress = (clampedMinutes - minMinutes) / (maxMinutes - minMinutes); // 0 to 1
    const angle = 220 + (progress * 280); // 220° to 500°
    return angle > 360 ? angle - 360 : angle; // Wrap around for angles > 360°
  };

  // Convert angle to minutes for 280-degree arc starting at 220°
  const angleToMinutes = (angle: number): number => {
    'worklet';
    // Handle the arc that goes from 220° to 140° (wrapping around)
    // Valid range: 220° to 360°, then 0° to 140°
    let adjustedAngle = angle;
    
    if (angle >= 220) {
      // First part: 220° to 360°
      adjustedAngle = angle;
    } else if (angle <= 140) {
      // Second part: 0° to 140° (add 360° to put in continuous range)
      adjustedAngle = angle + 360;
    } else {
      // In the gap (141° to 219°), snap to nearest valid angle
      const distToStart = Math.abs(angle - 220);
      const distToEnd = Math.abs(angle - 140);
      adjustedAngle = distToStart <= distToEnd ? 220 : 140 + 360;
    }
    
    // Calculate progress from 220° to 500° (140° + 360°)
    const progress = (adjustedAngle - 220) / 280;
    const minutes = Math.round(minMinutes + (progress * (maxMinutes - minMinutes)));
    return Math.max(minMinutes, Math.min(maxMinutes, minutes));
  };

  // Calculate angle from touch position for 280-degree circle starting at 220°
  const positionToAngle = (x: number, y: number): number => {
    'worklet';
    const deltaX = x - center;
    const deltaY = y - center;
    let angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
    
    // Convert to 0-360 range
    if (angle < 0) {
      angle += 360;
    }
    
    // Handle the gap (141° to 219°)
    // If touch is in the gap area, snap to nearest valid angle
    if (angle > 140 && angle < 220) {
      // Determine which side of the gap is closer
      const distToStart = Math.abs(angle - 220);
      const distToEnd = Math.abs(angle - 140);
      
      angle = distToStart <= distToEnd ? 220 : 140;
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

  // State for display time (since we can't use worklet values directly in Text)
  const [displayTime, setDisplayTime] = useState(formatTime(Math.max(minMinutes, initialMinutes)));
  const [currentProgress, setCurrentProgress] = useState((Math.max(minMinutes, initialMinutes) - minMinutes) / (maxMinutes - minMinutes));

  // Sync with external changes to initialMinutes
  useEffect(() => {
    const clampedMinutes = Math.max(minMinutes, initialMinutes);
    currentMinutes.value = clampedMinutes;
    setDisplayTime(formatTime(clampedMinutes));
    setCurrentProgress((clampedMinutes - minMinutes) / (maxMinutes - minMinutes));
  }, [initialMinutes]);


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
      const newMinutes = Math.max(minMinutes, Math.min(convertedMinutes, maxMinutes));
      console.log('New minutes:', newMinutes);
      
      currentMinutes.value = newMinutes;
      setDisplayTime(formatTime(newMinutes));
      setCurrentProgress((newMinutes - minMinutes) / (maxMinutes - minMinutes));
      onTimeChange?.(newMinutes);
    },
    
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      const angle = positionToAngle(locationX, locationY);
      const convertedMinutes = angleToMinutes(angle);
      const newMinutes = Math.max(minMinutes, Math.min(convertedMinutes, maxMinutes));
      
      currentMinutes.value = newMinutes;
      setDisplayTime(formatTime(newMinutes));
      setCurrentProgress((newMinutes - minMinutes) / (maxMinutes - minMinutes));
      onTimeChange?.(newMinutes);
    },
    
    onPanResponderRelease: () => {
      // Add smooth animation
      currentMinutes.value = withSpring(currentMinutes.value, { damping: 20, stiffness: 300 });
    },
  });


  // Calculate progress for active arc
  const progress = useDerivedValue(() => {
    return (currentMinutes.value - minMinutes) / (maxMinutes - minMinutes);
  });


  // Create animated style for 280-degree arc
  const arcStyle = useAnimatedStyle(() => {
    const progressValue = (currentMinutes.value - minMinutes) / (maxMinutes - minMinutes);
    
    // For 280-degree arc, calculate circumference and dash offset
    const circumference = (280 / 360) * 2 * Math.PI * radius; // 280° arc circumference
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
          {/* Inactive track - 280-degree arc starting at 220° */}
          <Path
            d={`M ${center + radius * Math.cos((220 * Math.PI) / 180)} ${center + radius * Math.sin((220 * Math.PI) / 180)}
                A ${radius} ${radius} 0 1 1 ${center + radius * Math.cos((140 * Math.PI) / 180)} ${center + radius * Math.sin((140 * Math.PI) / 180)}`}
            stroke="#F2F2F7"
            strokeWidth={inactiveStrokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Active arc - thick pink 280-degree arc starting at 220° */}
          {currentProgress > 0 && (
            <Path
              d={`M ${center + radius * Math.cos((220 * Math.PI) / 180)} ${center + radius * Math.sin((220 * Math.PI) / 180)}
                  A ${radius} ${radius} 0 1 1 ${center + radius * Math.cos((140 * Math.PI) / 180)} ${center + radius * Math.sin((140 * Math.PI) / 180)}`}
              stroke="#EC4899"
              strokeWidth={activeStrokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(280 / 360) * 2 * Math.PI * radius}`}
              strokeDashoffset={(280 / 360) * 2 * Math.PI * radius * (1 - currentProgress)}
            />
          )}
          
          {/* Start indicator - circle at 220° */}
          <Circle
            cx={center + radius * Math.cos((220 * Math.PI) / 180)}
            cy={center + radius * Math.sin((220 * Math.PI) / 180)}
            r={10}
            fill="#EC4899"
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        </Svg>

        {/* Center Display with HH:MM */}
        <View style={[styles.centerDisplay, { 
          width: radius * 1.4, 
          height: radius * 1.4,
          borderRadius: radius * 0.7,
        }]}>
          <Text style={styles.timeText}>
            {displayTime}
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