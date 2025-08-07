// src/components/GoalDurationSlider.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
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
  const [currentSliderValue, setCurrentSliderValue] = useState(selectedValue);
  const [showCustomTray, setShowCustomTray] = useState(false);

  // Animation references
  const labelAnimations = useRef<{ [key: number]: Animated.Value }>({}).current;
  const tickFlashAnimations = useRef<{ [key: number]: Animated.Value }>(
    {},
  ).current;

  // Duration options for slider marks - evenly spaced labels
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

  // Initialize animations immediately
  durationOptions.forEach(option => {
    if (!labelAnimations[option.value]) {
      labelAnimations[option.value] = new Animated.Value(1);
    }
    if (!tickFlashAnimations[option.value]) {
      tickFlashAnimations[option.value] = new Animated.Value(0);
    }
  });

  const handleSliderChange = (value: number) => {
    const roundedValue = Math.round(value);
    setCurrentSliderValue(roundedValue);

    // Animate labels based on selection and proximity
    durationOptions.forEach(option => {
      const distance = Math.abs(option.value - roundedValue);
      const isSelected = option.value === selectedValue;
      const scale = (distance < 10 ? 1.2 : 1) * (isSelected ? 1.3 : 1);

      Animated.spring(labelAnimations[option.value], {
        toValue: scale,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    });
  };

  const handleSliderComplete = (value: number) => {
    const roundedValue = Math.round(value);
    onSelect(roundedValue);

    // Flash the tick mark if it matches a preset
    const matchingOption = durationOptions.find(
      opt => opt.value === roundedValue,
    );
    if (matchingOption) {
      Animated.sequence([
        Animated.timing(tickFlashAnimations[matchingOption.value], {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(tickFlashAnimations[matchingOption.value], {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const getSelectedLabel = () => {
    if (selectedValue < 60) {
      return `${selectedValue}m`;
    } else {
      const hours = Math.floor(selectedValue / 60);
      const minutes = selectedValue % 60;
      if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Title and Extra */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Time spent?
        </Text>
        <TouchableOpacity onPress={() => setShowCustomTray(true)}>
          <Text style={[styles.extraText, { color: colors.textSecondary }]}>
            extra..
          </Text>
        </TouchableOpacity>
      </View>

      {/* Slider Container */}
      <View style={styles.sliderContainer}>
        {/* Rounded Rectangle Track Container */}
        <View
          style={[styles.trackContainer, { backgroundColor: colors.border }]}
        >
          <Slider
            style={styles.slider}
            minimumValue={minValue}
            maximumValue={maxValue}
            step={step}
            value={Math.min(Math.max(currentSliderValue, minValue), maxValue)}
            onValueChange={handleSliderChange}
            onSlidingComplete={handleSliderComplete}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor="transparent"
            thumbStyle={[styles.thumbStyle, { backgroundColor: theme.primary }]}
            trackStyle={styles.trackStyle}
          />
        </View>

        {/* Time Labels Inside Track */}
        <View style={styles.labelsContainer}>
          {durationOptions.map((option, index) => {
            // Space labels evenly across the slider regardless of their actual values
            const evenPosition = index / (durationOptions.length - 1);
            const isSelected = option.value === selectedValue;

            return (
              <View
                key={option.value}
                style={[
                  styles.tickContainer,
                  { left: `${evenPosition * 100}%` },
                ]}
              >
                {/* Time Label Inside Track */}
                <Text
                  style={[
                    styles.sliderLabel,
                    {
                      color: isSelected ? colors.white : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                      fontSize: 13,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </View>
            );
          })}

        </View>
      </View>

      {/* Custom Duration Tray */}
      <CustomDurationTray
        visible={showCustomTray}
        onClose={() => setShowCustomTray(false)}
        selectedDuration={selectedValue}
        onDurationChange={minutes => {
          onSelect(minutes);
          setCurrentSliderValue(
            Math.min(Math.max(minutes, minValue), maxValue),
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  extraText: {
    fontSize: 16,
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
  sliderContainer: {
    width: '100%',
    maxWidth: screenWidth - 50,
    marginBottom: 3,
    position: 'relative',
  },
  trackContainer: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    marginBottom: 2,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 2,
  },
  // Large pill-shaped thumb
  thumbStyle: {
    width: 1,
    height: 0,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  trackStyle: {
    height: 32,
    borderRadius: 16,
  },
  labelsContainer: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    height: 20,
    width: '100%',
  },
  tickContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -20,
    width: 40,
    height: 20,
    zIndex: 1,
  },
  tickMark: {
    width: 2,
    height: 10,
    borderRadius: 1,
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
});

export default GoalDurationSlider;
