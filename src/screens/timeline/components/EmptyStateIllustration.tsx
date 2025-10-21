import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';

interface EmptyStateIllustrationProps {
  onCreateTask: () => void;
}

export const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({ 
  onCreateTask 
}) => {
  // Animation values for the interlocking pills
  const leftPillY = useSharedValue(0);
  const rightPillY = useSharedValue(0);
  const leftPillRotation = useSharedValue(15);
  const rightPillRotation = useSharedValue(-15);
  const leftPillScale = useSharedValue(1);
  const rightPillScale = useSharedValue(1);
  const logoGlow = useSharedValue(0);
  const breathingScale = useSharedValue(1);
  
  useEffect(() => {
    // Gentle breathing animation
    breathingScale.value = withRepeat(
      withTiming(1.05, {
        duration: 2500,
      }),
      -1,
      true
    );
    
    // Subtle glow breathing
    logoGlow.value = withRepeat(
      withTiming(1, {
        duration: 3000,
      }),
      -1,
      true
    );
    
    // Very subtle pill movement
    leftPillY.value = withRepeat(
      withTiming(-2, {
        duration: 4000,
      }),
      -1,
      true
    );
    
    rightPillY.value = withRepeat(
      withTiming(2, {
        duration: 4000,
      }),
      -1,
      true
    );
  }, []);

  // Animated styles for left pill
  const leftPillStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: -15 },
        { translateY: leftPillY.value - 8 },
        { rotate: `${leftPillRotation.value}deg` },
        { scale: breathingScale.value },
      ],
    };
  });

  // Animated styles for right pill
  const rightPillStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: 15 },
        { translateY: rightPillY.value + 8 },
        { rotate: `${rightPillRotation.value}deg` },
        { scale: breathingScale.value },
      ],
    };
  });

  // Animated styles for logo glow effect
  const logoGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(logoGlow.value, [0, 1], [0.2, 0.4]);
    const scale = interpolate(logoGlow.value, [0, 1], [1, 1.1]);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Animated styles for container
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathingScale.value }],
    };
  });

  return (
    <Pressable onPress={onCreateTask} accessibilityRole="button" accessibilityLabel="Create your first task">
      <Animated.View style={[styles.container, containerStyle]}>
        
        {/* Logo Glow Background Effect */}
        <Animated.View style={[styles.logoGlow, logoGlowStyle]} />
        
        {/* Left Pill - Pink */}
        <Animated.View style={[styles.leftPill, leftPillStyle]} />
        
        {/* Right Pill - Blue */}
        <Animated.View style={[styles.rightPill, rightPillStyle]} />
        
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  // Logo Glow Effect
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 40,
    shadowColor: '#FFE55C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 10,
  },
  
  // Pill Shapes - matching StartupAnimation
  leftPill: {
    position: 'absolute',
    width: 100,
    height: 36,
    backgroundColor: '#FF9FB2', // Same pink as StartupAnimation
    borderRadius: 18,
    shadowColor: '#FF9FB2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  rightPill: {
    position: 'absolute',
    width: 100,
    height: 36,
    backgroundColor: '#9BC4E2', // Same blue as StartupAnimation
    borderRadius: 18,
    shadowColor: '#9BC4E2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});