// src/components/RecurrenceSelector.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated as RNAnimated,
  LayoutChangeEvent,
} from 'react-native';

interface RecurrenceSelectorProps {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  isDarkMode?: boolean;
}

const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  options,
  selectedValue,
  onSelect,
  isDarkMode = false,
}) => {
  const [indicatorPosition] = useState(new RNAnimated.Value(0));
  const [indicatorWidth] = useState(new RNAnimated.Value(0));
  const [buttonLayouts, setButtonLayouts] = useState<Record<string, { x: number; width: number }>>({});

  const theme = {
    background: isDarkMode ? '#1F2937' : '#FFFFFF',
    containerBackground: isDarkMode ? '#374151' : '#F3F4F6',
    indicatorBackground: '#4A7C3A',
    text: isDarkMode ? '#D1D5DB' : '#6B7280',
    textSelected: '#FFFFFF',
    border: isDarkMode ? '#4B5563' : '#E5E7EB',
  };

  const handleButtonLayout = (event: LayoutChangeEvent, option: string) => {
    const { x, width } = event.nativeEvent.layout;
    setButtonLayouts(prev => ({
      ...prev,
      [option]: { x, width }
    }));
  };

  const animateIndicator = (option: string) => {
    const layout = buttonLayouts[option];
    if (layout) {
      RNAnimated.parallel([
        RNAnimated.timing(indicatorPosition, {
          toValue: layout.x,
          duration: 250,
          useNativeDriver: false,
        }),
        RNAnimated.timing(indicatorWidth, {
          toValue: layout.width,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  useEffect(() => {
    animateIndicator(selectedValue);
  }, [selectedValue, buttonLayouts]);

  const handlePress = (option: string) => {
    onSelect(option);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.containerBackground }]}>
      {/* Animated Indicator */}
      <RNAnimated.View
        style={[
          styles.indicator,
          {
            backgroundColor: theme.indicatorBackground,
            left: indicatorPosition,
            width: indicatorWidth,
          },
        ]}
      />
      
      {/* Options */}
      {options.map((option, index) => {
        const isSelected = option === selectedValue;
        
        return (
          <TouchableOpacity
            key={option}
            style={styles.button}
            onPress={() => handlePress(option)}
            onLayout={(event) => handleButtonLayout(event, option)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: isSelected ? theme.textSelected : theme.text,
                  fontWeight: isSelected ? '600' : '500',
                },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    zIndex: 1,
  },
  buttonText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default RecurrenceSelector;