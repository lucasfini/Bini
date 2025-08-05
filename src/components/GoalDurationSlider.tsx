// src/components/GoalDurationSlider.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';

const { width: screenWidth } = Dimensions.get('window');

interface DurationOption {
  value: number; // Duration in minutes
  label: string;
}

interface GoalDurationSliderProps {
  selectedValue: number;
  onSelect: (value: number) => void;
  isDarkMode?: boolean;
}

const GoalDurationSlider: React.FC<GoalDurationSliderProps> = ({
  selectedValue,
  onSelect,
  isDarkMode = false,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  // Duration options for slider marks
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

  // Theme colors
  const theme = {
    background: isDarkMode ? '#1F2937' : '#FFFFFF',
    textPrimary: isDarkMode ? '#F9FAFB' : '#1F2937',
    textSecondary: isDarkMode ? '#9CA3AF' : '#64748B',
    buttonBackground: isDarkMode ? '#374151' : '#F3F4F6',
    buttonActive: '#4A7C3A',
    buttonText: '#FFFFFF',
  };

  const handleSliderChange = (value: number) => {
    onSelect(Math.round(value));
  };

  const handleCustomSubmit = () => {
    const minutes = parseInt(customValue);
    if (minutes && minutes > 0 && minutes <= 600) { // Max 10 hours
      onSelect(minutes);
      setShowCustomInput(false);
      setCustomValue('');
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Title */}
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Duration: {getSelectedLabel()}
      </Text>

      {/* Slider Container */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={minValue}
          maximumValue={maxValue}
          step={step}
          value={Math.min(Math.max(selectedValue, minValue), maxValue)}
          onValueChange={handleSliderChange}
          minimumTrackTintColor={theme.buttonActive}
          maximumTrackTintColor={isDarkMode ? '#374151' : '#E5E7EB'}
          thumbStyle={{
            backgroundColor: theme.buttonActive,
            width: 24,
            height: 24,
          }}
          trackStyle={{
            height: 6,
            borderRadius: 3,
          }}
        />
        
        {/* Slider Labels */}
        <View style={styles.labelsContainer}>
          {durationOptions.map((option, index) => {
            const position = (option.value - minValue) / (maxValue - minValue);
            return (
              <Text
                key={option.value}
                style={[
                  styles.sliderLabel,
                  {
                    left: `${position * 100}%`,
                    color: theme.textSecondary,
                  }
                ]}
              >
                {option.label}
              </Text>
            );
          })}
        </View>
      </View>

      {/* Custom Duration Button */}
      <TouchableOpacity
        style={[styles.customButton, { backgroundColor: theme.buttonBackground }]}
        onPress={() => setShowCustomInput(true)}
      >
        <Text style={[styles.customButtonText, { color: theme.textPrimary }]}>
          Set Custom Duration
        </Text>
      </TouchableOpacity>

      {/* Custom Duration Modal */}
      <Modal
        visible={showCustomInput}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Custom Duration
            </Text>
            <TextInput
              style={[styles.customInput, { color: theme.textPrimary }]}
              value={customValue}
              onChangeText={setCustomValue}
              placeholder="Minutes (1-600)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.buttonBackground }]}
                onPress={() => {
                  setShowCustomInput(false);
                  setCustomValue('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.textPrimary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.buttonActive }]}
                onPress={handleCustomSubmit}
              >
                <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>
                  Set
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 40,
    textAlign: 'center',
  },
  sliderContainer: {
    width: '100%',
    maxWidth: screenWidth - 80,
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
  labelsContainer: {
    position: 'relative',
    height: 20,
    width: '100%',
  },
  sliderLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    width: 40,
    marginLeft: -20,
  },
  customButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: screenWidth - 80,
    maxWidth: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoalDurationSlider;