// src/components/TraySequenceExample.tsx
// Complete example demonstrating Family app style tray sequence

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import TrayManager, { TrayType } from './TrayManager';

const TraySequenceExample: React.FC = () => {
  // Tray state management
  const [activeTray, setActiveTray] = useState<TrayType>(null);
  const [trayStack, setTrayStack] = useState<TrayType[]>([]);

  // Form data
  const [selectedEmoji, setSelectedEmoji] = useState('🍽️');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);

  // Tray management functions
  const openTray = (trayType: TrayType) => {
    setTrayStack(prev => [...prev, trayType]);
    setActiveTray(trayType);
  };

  const closeTray = () => {
    setActiveTray(null);
    setTrayStack([]);
  };

  const goBackTray = () => {
    setTrayStack(prev => {
      const newStack = [...prev];
      newStack.pop();
      setActiveTray(newStack[newStack.length - 1] || null);
      return newStack;
    });
  };

  // Data handlers
  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    closeTray();
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    closeTray();
  };

  const handleAlertsSelect = (alerts: string[]) => {
    setSelectedAlerts(alerts);
    closeTray();
  };

  const formatDateDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Family Style Tray System</Text>
        <Text style={styles.subtitle}>
          Tap buttons to see floating modals in sequence
        </Text>

        {/* Trigger Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.triggerButton}
            onPress={() => openTray('emoji')}
          >
            <Text style={styles.triggerButtonEmoji}>{selectedEmoji}</Text>
            <Text style={styles.triggerButtonText}>Choose Emoji</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.triggerButton}
            onPress={() => openTray('date')}
          >
            <Text style={styles.triggerButtonText}>
              📅 {formatDateDisplay(selectedDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.triggerButton}
            onPress={() => openTray('alerts')}
          >
            <Text style={styles.triggerButtonText}>
              🔔{' '}
              {selectedAlerts.length > 0
                ? `${selectedAlerts.length} Alert${
                    selectedAlerts.length !== 1 ? 's' : ''
                  }`
                : 'Add Alerts'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sequence Flow Demonstration */}
        <View style={styles.flowSection}>
          <Text style={styles.flowTitle}>Tray Sequence Flow:</Text>
          <Text style={styles.flowText}>
            1. Choose Emoji (Tall) - Cancel button
          </Text>
          <Text style={styles.flowText}>
            2. Select Date (Medium) - Back arrow
          </Text>
          <Text style={styles.flowText}>
            3. Select Alerts (Short) - Back arrow
          </Text>
        </View>

        {/* Current Selections */}
        <View style={styles.selectionSection}>
          <Text style={styles.selectionTitle}>Current Selections:</Text>
          <Text style={styles.selectionText}>Emoji: {selectedEmoji}</Text>
          <Text style={styles.selectionText}>
            Date: {formatDateDisplay(selectedDate)}
          </Text>
          <Text style={styles.selectionText}>
            Alerts:{' '}
            {selectedAlerts.length > 0 ? selectedAlerts.join(', ') : 'None'}
          </Text>
        </View>
      </View>

      {/* Tray Manager */}
      <TrayManager
        activeTray={activeTray}
        trayStack={trayStack}
        onCloseTray={closeTray}
        onBackTray={goBackTray}
        emoji={{
          selected: selectedEmoji,
          onSelect: handleEmojiSelect,
        }}
        date={{
          selected: selectedDate,
          onSelect: handleDateSelect,
        }}
        alerts={{
          selected: selectedAlerts,
          onSelect: handleAlertsSelect,
        }}
        isDarkMode={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonSection: {
    gap: 16,
    marginBottom: 40,
  },
  triggerButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  triggerButtonEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  triggerButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  flowSection: {
    backgroundColor: '#EEF2FF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  flowTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  flowText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 4,
  },
  selectionSection: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  selectionText: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 4,
  },
});

export default TraySequenceExample;
