import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Text, Easing } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { colors, borderRadius, shadows } from '../../../theme/designTokens';

interface FloatingPlusOrbProps {
  onPress: () => void;
}

export const FloatingPlusOrb: React.FC<FloatingPlusOrbProps> = ({ onPress }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.9);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 2000 }),
        withTiming(0, { duration: 2000 }),
        withTiming(-3, { duration: 2000 })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withTiming(1.0, { duration: 4000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1.0, { duration: 150 });
    onPress();
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        style={styles.orb}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel="Create new task"
      >
        <View style={styles.plusIcon}>
          <View style={[styles.plusBar, styles.horizontal]} />
          <View style={[styles.plusBar, styles.vertical]} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 56,
    alignSelf: 'center',
    zIndex: 10,
  },
  orb: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.timelineActive,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  plusIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBar: {
    backgroundColor: colors.timelineActive,
    position: 'absolute',
  },
  horizontal: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  vertical: {
    width: 2,
    height: 16,
    borderRadius: 1,
  },
});