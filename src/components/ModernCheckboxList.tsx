import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
  style?: 'square' | 'rounded';
}

const ModernCheckboxList: React.FC<ModernCheckboxListProps> = ({
  options,
  checkedValues,
  onToggle,
  isDarkMode = false,
  style = 'rounded',
}) => {
  const theme = {
    background: isDarkMode ? '#1F2937' : '#FFFFFF',
    text: isDarkMode ? '#F9FAFB' : '#111827',
    textSecondary: isDarkMode ? '#D1D5DB' : '#6B7280',
    border: isDarkMode ? '#374151' : '#E5E7EB',
    itemBackground: isDarkMode ? '#374151' : '#F9FAFB',
    selectedBackground: isDarkMode ? '#065F46' : '#E8F5E8',
    checkboxActive: '#EC4899',
    checkboxInactive: isDarkMode ? '#4B5563' : '#E5E7EB',
  };

  const borderRadius = style === 'square' ? 6 : 12;
  const checkboxRadius = style === 'square' ? 4 : 6;

  const renderOption = (option: CheckboxOption) => {
    const isSelected = checkedValues.includes(option.id);

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.item,
          {
            backgroundColor: theme.itemBackground,
            borderColor: theme.border,
            borderRadius,
          },
          isSelected && {
            backgroundColor: theme.selectedBackground,
            borderColor: theme.checkboxActive,
          },
        ]}
        onPress={() => onToggle(option.id)}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={option.label}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.label,
                { color: theme.text },
                isSelected && styles.labelSelected,
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

          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: isSelected
                  ? theme.checkboxActive
                  : 'transparent',
                borderColor: isSelected
                  ? theme.checkboxActive
                  : theme.checkboxInactive,
                borderRadius: checkboxRadius,
              },
            ]}
          >
            {isSelected && (
              <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {options.map(renderOption)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  item: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  labelSelected: {
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ModernCheckboxList;