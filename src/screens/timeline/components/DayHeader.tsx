import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Easing } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '../../../theme/designTokens';

interface DayHeaderProps {
  date: Date;
  isToday: boolean;
}

export const DayHeader: React.FC<DayHeaderProps> = ({ date, isToday }) => {
  const glowOpacity = useSharedValue(0);

  const dayNumber = date.getDate();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });

  useEffect(() => {
    if (isToday) {
      glowOpacity.value = withTiming(0.25, {
        duration: 450,
      });
    }
  }, [isToday]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.spineGutter} />
      <View style={styles.content}>
        <Animated.Text
          style={[
            styles.dayNumber,
            isToday && styles.todayNumber,
            isToday && {
              shadowColor: colors.accentPrimary,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 8,
            },
            isToday && glowStyle,
          ]}
        >
          {dayNumber}
        </Animated.Text>
        <View style={styles.dateInfo}>
          <Text style={styles.weekday}>{weekday}</Text>
          <Text style={styles.month}>{month}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  spineGutter: {
    width: 28,
  },
  content: {
    flex: 1,
    paddingLeft: spacing.md,
  },
  dayNumber: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.light,
    color: colors.textPrimary,
    lineHeight: typography.sizes.display * typography.lineHeights.tight,
  },
  todayNumber: {
    color: colors.accentPrimary,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  weekday: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  month: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
});