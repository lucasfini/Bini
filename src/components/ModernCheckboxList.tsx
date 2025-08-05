// src/components/ModernCheckboxList.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated as RNAnimated,
} from 'react-native';
import { Check } from '@tamagui/lucide-icons';

interface CheckboxOption {
  id: string;
  label: string;
  description?: string;
}

interface ModernCheckboxListProps {
  options: CheckboxOption[];
  checkedValues: string[];
  onToggle: (id: string) => void;
  isDarkMode?: boolean;
  style?: 'square' | 'circle';
}

const ModernCheckboxList: React.FC<ModernCheckboxListProps> = ({
  options,
  checkedValues,
  onToggle,
  isDarkMode = false,
  style = 'square',
}) => {
  const [scaleAnims] = useState(
    options.reduce((acc, option) => {
      acc[option.id] = new RNAnimated.Value(1);
      return acc;
    }, {} as Record<string, RNAnimated.Value>)
  );

  const theme = {
    background: isDarkMode ? '#1F2937' : '#FFFFFF',
    itemBackground: isDarkMode ? '#374151' : '#F9FAFB',
    text: isDarkMode ? '#F9FAFB' : '#111827',
    textSecondary: isDarkMode ? '#D1D5DB' : '#6B7280',
    border: isDarkMode ? '#4B5563' : '#E5E7EB',
    checkboxBackground: '#4A7C3A',
    checkboxBorder: isDarkMode ? '#6B7280' : '#D1D5DB',
    selectedBackground: isDarkMode ? 'rgba(74, 124, 58, 0.2)' : '#E8F5E8',
  };

  const handlePress = (option: CheckboxOption) => {
    // Animate checkbox
    const anim = scaleAnims[option.id];
    RNAnimated.sequence([
      RNAnimated.timing(anim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      RNAnimated.timing(anim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      RNAnimated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onToggle(option.id);
  };

  const renderCheckbox = (isChecked: boolean, optionId: string) => {
    const checkboxStyle = style === 'circle' ? styles.checkboxCircle : styles.checkboxSquare;
    
    return (
      <RNAnimated.View
        style={[
          checkboxStyle,
          {
            backgroundColor: isChecked ? theme.checkboxBackground : 'transparent',
            borderColor: isChecked ? theme.checkboxBackground : theme.checkboxBorder,
            transform: [{ scale: scaleAnims[optionId] }],
          },
        ]}
      >
        {isChecked && (
          <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
        )}
      </RNAnimated.View>
    );
  };

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isChecked = checkedValues.includes(option.id);
        const isLast = index === options.length - 1;
        
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.item,
              {
                backgroundColor: isChecked ? theme.selectedBackground : theme.itemBackground,
                borderBottomColor: theme.border,
                borderBottomWidth: isLast ? 0 : 1,
              },
            ]}
            onPress={() => handlePress(option)}
            activeOpacity={0.7}
          >
            <View style={styles.itemContent}>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: theme.text,
                      fontWeight: isChecked ? '600' : '500',
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {option.description && (
                  <Text
                    style={[
                      styles.description,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {option.description}
                  </Text>
                )}
              </View>
              
              {renderCheckbox(isChecked, option.id)}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkboxSquare: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ModernCheckboxList;