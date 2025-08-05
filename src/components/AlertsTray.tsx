// src/components/AlertsTray.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Check } from '@tamagui/lucide-icons';
import Tray from './Tray';
import ModernCheckboxList from './ModernCheckboxList';

interface AlertOption {
  id: string;
  label: string;
  description?: string;
}

interface AlertsTrayProps {
  visible: boolean;
  onClose: () => void;
  onBack?: () => void;
  selectedAlerts: string[];
  onAlertsChange: (alerts: string[]) => void;
  isDarkMode?: boolean;
}

const ALERT_OPTIONS: AlertOption[] = [
  {
    id: 'start',
    label: 'At start of task',
    description: 'Notify when task begins',
  },
  { id: 'end', label: 'At end of task', description: 'Notify when task ends' },
  { id: '5min', label: '5 minutes before', description: 'Early reminder' },
  { id: '10min', label: '10 minutes before', description: 'Short notice' },
  { id: '15min', label: '15 minutes before', description: 'Quick preparation' },
  { id: '30min', label: '30 minutes before', description: 'Moderate notice' },
  { id: '1hour', label: '1 hour before', description: 'Long preparation' },
  { id: '2hours', label: '2 hours before', description: 'Extended notice' },
  { id: '1day', label: '1 day before', description: 'Day ahead planning' },
];

const AlertsTray: React.FC<AlertsTrayProps> = ({
  visible,
  onClose,
  onBack,
  selectedAlerts,
  onAlertsChange,
  isDarkMode = false,
}) => {
  const theme = {
    background: isDarkMode ? '#1F2937' : '#FFFFFF',
    text: isDarkMode ? '#F9FAFB' : '#111827',
    textSecondary: isDarkMode ? '#D1D5DB' : '#6B7280',
    border: isDarkMode ? '#374151' : '#E5E7EB',
    itemBackground: isDarkMode ? '#374151' : '#F9FAFB',
    selectedBackground: '#E8F5E8',
    checkboxActive: '#4A7C3A',
    checkboxInactive: isDarkMode ? '#4B5563' : '#E5E7EB',
  };

  const handleToggleAlert = (alertId: string) => {
    if (selectedAlerts.includes(alertId)) {
      onAlertsChange(selectedAlerts.filter(id => id !== alertId));
    } else {
      onAlertsChange([...selectedAlerts, alertId]);
    }
  };

  const handleDone = () => {
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const renderAlertOption = (option: AlertOption) => {
    const isSelected = selectedAlerts.includes(option.id);

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.alertItem,
          {
            backgroundColor: theme.itemBackground,
            borderColor: theme.border,
          },
          isSelected && {
            backgroundColor: theme.selectedBackground,
            borderColor: theme.checkboxActive,
          },
        ]}
        onPress={() => handleToggleAlert(option.id)}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={option.label}
      >
        <View style={styles.alertContent}>
          <View style={styles.alertText}>
            <Text
              style={[
                styles.alertLabel,
                { color: theme.text },
                isSelected && styles.alertLabelSelected,
              ]}
            >
              {option.label}
            </Text>
            {option.description && (
              <Text
                style={[
                  styles.alertDescription,
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
    <Tray
      visible={visible}
      onClose={onClose}
      onBack={onBack}
      title="Select Alerts"
      height="short"
      isDarkMode={isDarkMode}
      leftButton={
        !onBack
          ? {
              text: 'Cancel',
              onPress: handleCancel,
            }
          : undefined
      }
      rightButton={{
        text: 'Done',
        onPress: handleDone,
      }}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ModernCheckboxList
          options={ALERT_OPTIONS}
          checkedValues={selectedAlerts}
          onToggle={handleToggleAlert}
          isDarkMode={isDarkMode}
          style="square"
        />

        {/* Selected alerts summary */}
        {selectedAlerts.length > 0 && (
          <View
            style={[styles.summaryContainer, { borderColor: theme.border }]}
          >
            <Text style={[styles.summaryTitle, { color: theme.text }]}>
              Selected Alerts ({selectedAlerts.length})
            </Text>
            <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
              {selectedAlerts
                .map(id => {
                  const option = ALERT_OPTIONS.find(opt => opt.id === id);
                  return option?.label;
                })
                .join(', ')}
            </Text>
          </View>
        )}
      </ScrollView>
    </Tray>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  alertText: {
    flex: 1,
    marginRight: 12,
  },
  alertLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  alertLabelSelected: {
    fontWeight: '600',
  },
  alertDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(74, 124, 58, 0.05)',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AlertsTray;
