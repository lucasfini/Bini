// src/components/DurationPicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated as RNAnimated,
} from 'react-native';

interface DurationOption {
  value: number;
  label: string;
}

interface DurationPickerProps {
  options: DurationOption[];
  selectedValue: number;
  onSelect: (value: number) => void;
  isDarkMode?: boolean;
}

const DurationPicker: React.FC<DurationPickerProps> = ({
  options,
  selectedValue,
  onSelect,
  isDarkMode = false,
}) => {
  const [scaleAnims] = useState(
    options.reduce((acc, option) => {
      acc[option.value] = new RNAnimated.Value(1);
      return acc;
    }, {} as Record<number, RNAnimated.Value>)
  );

  const theme = {
    containerBackground: isDarkMode ? '#1F2937' : '#F8F9FA',
    pillBackground: isDarkMode ? '#374151' : '#FFFFFF',
    pillSelectedBackground: '#4A7C3A',
    text: isDarkMode ? '#D1D5DB' : '#6B7280',
    textSelected: '#FFFFFF',
    border: isDarkMode ? '#4B5563' : '#E5E7EB',
    shadow: isDarkMode ? '#000000' : '#000000',
  };

  const handlePress = (option: DurationOption) => {
    // Animate button press with subtle feedback
    const anim = scaleAnims[option.value];
    RNAnimated.sequence([
      RNAnimated.timing(anim, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      RNAnimated.timing(anim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    onSelect(option.value);
  };

  // Helper function to format multi-line text
  const formatLabel = (label: string) => {
    // Handle labels like "1h 30m" by splitting on space
    if (label.includes(' ') && label.length > 4) {
      const parts = label.split(' ');
      return parts;
    }
    return [label];
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.containerBackground }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          const labelParts = formatLabel(option.label);
          
          return (
            <RNAnimated.View
              key={option.value}
              style={[
                styles.pillContainer,
                { transform: [{ scale: scaleAnims[option.value] }] }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected 
                      ? theme.pillSelectedBackground 
                      : theme.pillBackground,
                    borderColor: isSelected 
                      ? theme.pillSelectedBackground 
                      : theme.border,
                    shadowColor: theme.shadow,
                    shadowOpacity: isSelected ? 0.25 : 0.08,
                    shadowRadius: isSelected ? 8 : 4,
                    elevation: isSelected ? 6 : 2,
                  },
                ]}
                onPress={() => handlePress(option)}
                activeOpacity={0.9}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <View style={styles.textContainer}>
                  {labelParts.length > 1 ? (
                    // Multi-line text layout
                    labelParts.map((part, index) => (
                      <Text
                        key={index}
                        style={[
                          styles.pillText,
                          styles.pillTextMultiLine,
                          {
                            color: isSelected ? theme.textSelected : theme.text,
                            fontWeight: isSelected ? '700' : '600',
                          },
                        ]}
                      >
                        {part}
                      </Text>
                    ))
                  ) : (
                    // Single line text
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color: isSelected ? theme.textSelected : theme.text,
                          fontWeight: isSelected ? '700' : '600',
                        },
                      ]}
                    >
                      {labelParts[0]}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </RNAnimated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContainer: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  pillContainer: {
    marginHorizontal: 6,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 16, // Increased for better multi-line support
    borderRadius: 24,
    borderWidth: 2,
    minWidth: 70, // Increased minimum width
    minHeight: 56, // Fixed minimum height to prevent squishing
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  pillText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 18,
  },
  pillTextMultiLine: {
    fontSize: 14,
    lineHeight: 16,
    marginVertical: 1, // Small spacing between lines
  },
});

export default DurationPicker;