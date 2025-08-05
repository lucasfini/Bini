// src/components/TimePicker.tsx
import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';

interface TimePickerProps {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  const animatedValues = useRef(
    options.reduce((acc, option) => {
      acc[option] = new Animated.Value(selectedValue === option ? 1 : 0);
      return acc;
    }, {} as Record<string, Animated.Value>),
  ).current;

  const handleSelect = (option: string) => {
    if (option === selectedValue) return;

    // Animate out the currently selected option
    if (selectedValue && animatedValues[selectedValue]) {
      Animated.timing(animatedValues[selectedValue], {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }

    // Animate in the newly selected option
    Animated.timing(animatedValues[option], {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();

    onSelect(option);
  };

  const getAnimatedStyle = (option: string) => {
    const animatedValue = animatedValues[option];

    return {
      backgroundColor: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#F0F0F0', '#4A7C3A'], // neutral to accent color
      }),
      transform: [
        {
          scale: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05],
          }),
        },
      ],
    };
  };

  const getAnimatedTextStyle = (option: string) => {
    const animatedValue = animatedValues[option];

    return {
      color: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#666666', '#FFFFFF'], // gray to white
      }),
    };
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {options.map(option => (
        <TouchableOpacity
          key={option}
          onPress={() => handleSelect(option)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedValue === option }}
          accessibilityLabel={`Select ${option} duration`}
        >
          <Animated.View style={[styles.pill, getAnimatedStyle(option)]}>
            <Animated.Text
              style={[styles.pillText, getAnimatedTextStyle(option)]}
            >
              {option}
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 6,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default TimePicker;
