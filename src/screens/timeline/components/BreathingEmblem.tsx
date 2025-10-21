import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Easing } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors, layout } from '../../../theme/designTokens';

interface BreathingEmblemProps {
  onCreateTask: () => void;
}

export const BreathingEmblem: React.FC<BreathingEmblemProps> = ({ onCreateTask }) => {
  const scale = useSharedValue(0.96);
  const glowOpacity = useSharedValue(0.15);

  const size = layout.isSmallDevice ? 180 : 220;
  
  // Define colors as constants that can be used in worklets
  const lightBlueColor = colors.lightBlue;
  const primaryLightColor = colors.primaryLight;

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.04, {
        duration: 3750,
      }),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withTiming(0.35, {
        duration: 3750,
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const glowColor = interpolateColor(
      glowOpacity.value,
      [0.15, 0.35],
      [lightBlueColor, primaryLightColor]
    );

    return {
      opacity: glowOpacity.value,
      shadowColor: glowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 30,
      shadowOpacity: 1,
    };
  });

  return (
    <Pressable onPress={onCreateTask} accessibilityRole="button" accessibilityLabel="Create your first task">
      <Animated.View style={[styles.container, { width: size, height: size }]}>
        <Animated.View style={[styles.glow, glowStyle, { width: size, height: size }]} />
        <Animated.View style={[animatedStyle, { width: size, height: size }]}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Defs>
              <RadialGradient id="innerGradient" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={colors.primaryLight} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.6" />
              </RadialGradient>
              <RadialGradient id="middleGradient" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={colors.lightBlue} stopOpacity="0.6" />
                <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0.4" />
              </RadialGradient>
              <RadialGradient id="outerGradient" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={colors.primaryLight} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={colors.lightBlue} stopOpacity="0.2" />
              </RadialGradient>
            </Defs>
            
            {/* Outer ring */}
            <Path
              d={`M ${size * 0.5} ${size * 0.1} 
                  C ${size * 0.8} ${size * 0.1} ${size * 0.9} ${size * 0.4} ${size * 0.9} ${size * 0.5}
                  C ${size * 0.9} ${size * 0.75} ${size * 0.7} ${size * 0.9} ${size * 0.5} ${size * 0.9}
                  C ${size * 0.3} ${size * 0.9} ${size * 0.1} ${size * 0.75} ${size * 0.1} ${size * 0.5}
                  C ${size * 0.1} ${size * 0.4} ${size * 0.2} ${size * 0.1} ${size * 0.5} ${size * 0.1} Z`}
              fill="url(#outerGradient)"
              stroke={colors.border}
              strokeWidth="1"
            />
            
            {/* Middle ring */}
            <Path
              d={`M ${size * 0.5} ${size * 0.2} 
                  C ${size * 0.75} ${size * 0.2} ${size * 0.8} ${size * 0.45} ${size * 0.8} ${size * 0.5}
                  C ${size * 0.8} ${size * 0.7} ${size * 0.65} ${size * 0.8} ${size * 0.5} ${size * 0.8}
                  C ${size * 0.35} ${size * 0.8} ${size * 0.2} ${size * 0.7} ${size * 0.2} ${size * 0.5}
                  C ${size * 0.2} ${size * 0.45} ${size * 0.25} ${size * 0.2} ${size * 0.5} ${size * 0.2} Z`}
              fill="url(#middleGradient)"
              stroke={colors.borderLight}
              strokeWidth="0.5"
            />
            
            {/* Inner teardrop */}
            <Path
              d={`M ${size * 0.5} ${size * 0.35} 
                  C ${size * 0.62} ${size * 0.35} ${size * 0.65} ${size * 0.47} ${size * 0.65} ${size * 0.5}
                  C ${size * 0.65} ${size * 0.58} ${size * 0.58} ${size * 0.65} ${size * 0.5} ${size * 0.65}
                  C ${size * 0.42} ${size * 0.65} ${size * 0.35} ${size * 0.58} ${size * 0.35} ${size * 0.5}
                  C ${size * 0.35} ${size * 0.47} ${size * 0.38} ${size * 0.35} ${size * 0.5} ${size * 0.35} Z`}
              fill="url(#innerGradient)"
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.background,
  },
});