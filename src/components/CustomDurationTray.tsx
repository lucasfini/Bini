// src/components/CustomDurationTray.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Tray from './Tray';
import { colors } from '../styles';
import { useTheme } from '../context/ThemeContext';

interface CustomDurationTrayProps {
  visible: boolean;
  onClose: () => void;
  onBack?: () => void;
  selectedDuration: number; // in minutes
  onDurationChange: (duration: number) => void;
}

const CustomDurationTray: React.FC<CustomDurationTrayProps> = ({
  visible,
  onClose,
  onBack,
  selectedDuration,
  onDurationChange,
}) => {
  const { theme } = useTheme();
  const [hours, setHours] = useState(Math.floor(selectedDuration / 60));
  const [minutes, setMinutes] = useState(selectedDuration % 60);

  const handleClose = () => {
    // Apply changes when closing
    const totalMinutes = hours * 60 + minutes;
    onDurationChange(totalMinutes);
    onClose();
  };

  const formatDuration = () => {
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  const renderTimePicker = () => {
    return (
      <View style={styles.pickerContainer}>
        {/* Hours Picker */}
        <View style={styles.pickerSection}>
          <Text style={[styles.pickerLabel, { color: theme.textPrimary }]}>Hours</Text>
          <View style={[styles.pickerWheel, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {Array.from({ length: 24 }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.pickerItem,
                    hours === i && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setHours(i)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    { color: hours === i ? colors.white : theme.textPrimary },
                    hours === i && { fontWeight: '600' }
                  ]}>
                    {i}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Minutes Picker */}
        <View style={styles.pickerSection}>
          <Text style={[styles.pickerLabel, { color: theme.textPrimary }]}>Minutes</Text>
          <View style={[styles.pickerWheel, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {Array.from({ length: 60 }, (_, i) => i * 5).map((minute) => (
                <TouchableOpacity
                  key={minute}
                  style={[
                    styles.pickerItem,
                    minutes === minute && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setMinutes(minute)}
                >
                  <Text style={[
                    styles.pickerItemText,
                    { color: minutes === minute ? colors.white : theme.textPrimary },
                    minutes === minute && { fontWeight: '600' }
                  ]}>
                    {minute}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Tray
      visible={visible}
      onClose={handleClose}
      title="Custom Duration"
      height="short"
    >
      <View style={styles.container}>
        {/* Current Duration Display */}
        <View style={[styles.currentDuration, { backgroundColor: colors.background }]}>
          <Text style={[styles.currentDurationLabel, { color: theme.textSecondary }]}>
            Selected Duration
          </Text>
          <Text style={[styles.currentDurationValue, { color: theme.textPrimary }]}>
            {formatDuration()}
          </Text>
        </View>

        {/* Quick Presets */}
        <View style={styles.presetsSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Select</Text>
          <View style={styles.presetButtons}>
            {[
              { label: '15m', value: 15 },
              { label: '30m', value: 30 },
              { label: '1h', value: 60 },
              { label: '1h 30m', value: 90 },
              { label: '2h', value: 120 },
              { label: '3h', value: 180 },
            ].map((preset) => (
              <TouchableOpacity
                key={preset.value}
                style={[
                  styles.presetButton,
                  { backgroundColor: colors.background },
                  (hours * 60 + minutes) === preset.value && { 
                    backgroundColor: theme.primary 
                  }
                ]}
                onPress={() => {
                  setHours(Math.floor(preset.value / 60));
                  setMinutes(preset.value % 60);
                }}
              >
                <Text style={[
                  styles.presetButtonText,
                  { color: (hours * 60 + minutes) === preset.value ? colors.white : theme.textPrimary }
                ]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Time Picker */}
        <View style={styles.customSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Or Set Custom Time</Text>
          {renderTimePicker()}
        </View>
      </View>
    </Tray>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentDuration: {
    marginTop: 12,
    marginBottom: 16,
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentDurationLabel: {
    fontSize: 13,
    marginBottom: 3,
  },
  currentDurationValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  presetsSection: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 6,
  },
  presetButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  customSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 15,
    flex: 1,
    maxHeight: 120,
  },
  pickerSection: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'center',
  },
  pickerWheel: {
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    marginVertical: 1,
    borderRadius: 6,
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomDurationTray;