// src/components/ModernPickersExample.tsx
// Example demonstrating TimePicker, RecurrenceSelector, and ModernCheckboxList

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import TimePicker from './TimePicker';
import RecurrenceSelector from './RecurrenceSelector';
import ModernCheckboxList from './ModernCheckboxList';

const ModernPickersExample: React.FC = () => {
  // TimePicker state
  const [selectedDuration, setSelectedDuration] = useState('30m');
  const durationOptions = ['15m', '30m', '45m', '1h', '1h 30m', '2h', '3h'];

  // RecurrenceSelector state
  const [selectedRecurrence, setSelectedRecurrence] = useState('None');
  const recurrenceOptions = ['None', 'Daily', 'Weekly', 'Monthly'];

  // ModernCheckboxList state
  const [checkedAlerts, setCheckedAlerts] = useState(['alert1']);
  const alertOptions = [
    { id: 'alert1', label: '5 minutes before' },
    { id: 'alert2', label: '15 minutes before' },
    { id: 'alert3', label: '30 minutes before' },
    { id: 'alert4', label: '1 hour before' },
    { id: 'alert5', label: '1 day before' },
  ];

  const handleAlertToggle = (id: string) => {
    setCheckedAlerts(prev => 
      prev.includes(id) 
        ? prev.filter(alertId => alertId !== id)
        : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Modern Picker Components</Text>

        {/* TimePicker Example */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Component 1: Time Picker</Text>
          <Text style={styles.sectionSubtitle}>How long?</Text>
          <TimePicker
            options={durationOptions}
            selectedValue={selectedDuration}
            onSelect={setSelectedDuration}
          />
          <Text style={styles.stateText}>Selected: {selectedDuration}</Text>
        </View>

        {/* RecurrenceSelector Example */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Component 2: Recurrence Selector</Text>
          <Text style={styles.sectionSubtitle}>Repeat</Text>
          <RecurrenceSelector
            options={recurrenceOptions}
            selectedValue={selectedRecurrence}
            onSelect={setSelectedRecurrence}
          />
          <Text style={styles.stateText}>Selected: {selectedRecurrence}</Text>
        </View>

        {/* ModernCheckboxList Example */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Component 3: Modern Checkbox List</Text>
          <Text style={styles.sectionSubtitle}>Alerts</Text>
          <ModernCheckboxList
            options={alertOptions}
            checkedValues={checkedAlerts}
            onToggle={handleAlertToggle}
          />
          <Text style={styles.stateText}>
            Checked: {checkedAlerts.length} alert{checkedAlerts.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Current State Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Current Selection Summary:</Text>
          <Text style={styles.summaryText}>Duration: {selectedDuration}</Text>
          <Text style={styles.summaryText}>Recurrence: {selectedRecurrence}</Text>
          <Text style={styles.summaryText}>
            Alerts: {checkedAlerts.map(id => 
              alertOptions.find(opt => opt.id === id)?.label
            ).join(', ') || 'None'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E26',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E26',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    fontWeight: '500',
  },
  stateText: {
    fontSize: 14,
    color: '#4A7C3A',
    marginTop: 12,
    fontWeight: '500',
  },
  summarySection: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E26',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#5A6B54',
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default ModernPickersExample;