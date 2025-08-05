// src/screens/create/CreateTaskScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  StatusBar,
  Alert,
  Image,
  Animated as RNAnimated,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

// Import the new tray components
import EmojiTray from '../../components/EmojiTray';
import DateTray from '../../components/DateTray';
import AlertsTray from '../../components/AlertsTray';
import TrayManager from '../../components/TrayManager';

// Import the new modern form components
import GoalDurationSlider from '../../components/GoalDurationSlider';
import RecurrenceSelector from '../../components/RecurrenceSelector';
import ModernCheckboxList from '../../components/ModernCheckboxList';
import AnimatedWhenSelector from '../../components/AnimatedWhenSelector';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Clean Family app inspired colors
const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#E8E8E8',
  text: '#2C3E26',
  textSecondary: '#5A6B54',
  textTertiary: '#888888',
  primary: '#4A7C3A',
  secondary: '#D4AF37',
  white: '#FFFFFF',
  gray: '#F0F0F0',
  lightGray: '#E0E0E0',
  dragHandle: '#CCCCCC',
  selectedBackground: '#E8F5E8',
};

import { TaskFormData } from '../../types/tasks';

interface CreateTaskProps {
  onCreateTask: (task: TaskFormData) => void;
  onBack?: () => void;
}

// Enhanced Time Selector that shows time range
const TimeSelector: React.FC<{
  selectedTime: string;
  onTimeChange: (time: string) => void;
  durationMinutes: number;
}> = ({ selectedTime, onTimeChange, durationMinutes }) => {
  const times = [
    '06:00',
    '06:30',
    '07:00',
    '07:30',
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00',
    '22:30',
    '23:00',
    '23:30',
  ];

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(
      2,
      '0',
    )}`;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.timeScrollContainer}
      style={styles.timeScroll}
    >
      {times.map(time => {
        const isSelected = time === selectedTime;
        const endTime = calculateEndTime(time, durationMinutes);

        return (
          <TouchableOpacity
            key={time}
            style={[styles.timeButton, isSelected && styles.timeButtonSelected]}
            onPress={() => onTimeChange(time)}
          >
            <Text
              style={[
                styles.timeButtonText,
                isSelected && styles.timeButtonTextSelected,
              ]}
            >
              {time}
            </Text>
            {isSelected && <Text style={styles.endTimeText}>to {endTime}</Text>}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// Modern Partner Share Component with Enhanced Profile Picture
const PartnerShareCheckbox: React.FC<{
  checked: boolean;
  onPress: () => void;
}> = ({ checked, onPress }) => {
  const [scaleAnim] = useState(new RNAnimated.Value(1));

  const handlePress = () => {
    // Animated bounce/scale effect
    RNAnimated.sequence([
      RNAnimated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      RNAnimated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 150,
        useNativeDriver: true,
      }),
      RNAnimated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <RNAnimated.View
      style={[
        styles.partnerShareContainer,
        { transform: [{ scale: scaleAnim }] },
        checked && styles.partnerShareContainerActive,
      ]}
    >
      <TouchableOpacity
        style={styles.partnerShareTouchable}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.partnerShareContent}>
          {/* Enhanced Profile Picture with Status Ring */}
          <View style={styles.profileContainer}>
            <View style={[
              styles.profileRing,
              checked && styles.profileRingActive
            ]}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=120&h=120&fit=crop&crop=face',
                }}
                style={styles.profileImage}
              />
              {/* Online status indicator */}
              <View style={styles.onlineIndicator} />
            </View>
            
            {/* Checkmark overlay with modern design */}
            {checked && (
              <RNAnimated.View style={styles.checkmarkContainer}>
                <View style={styles.checkmarkBackground}>
                  <Text style={styles.checkmarkIcon}>✓</Text>
                </View>
              </RNAnimated.View>
            )}
          </View>

          {/* Enhanced Text Content */}
          <View style={styles.partnerText}>
            <View style={styles.partnerNameRow}>
              <Text style={styles.partnerName}>Share with Sarah</Text>
              <View style={styles.partnerBadge}>
                <Text style={styles.partnerBadgeText}>Partner</Text>
              </View>
            </View>
            <Text style={styles.partnerSubtext}>
              {checked 
                ? "✓ Sarah will be notified about this task" 
                : "Tap to share this task with your partner"
              }
            </Text>
            {checked && (
              <Text style={styles.partnerActiveText}>
                Shared tasks appear in both your timelines
              </Text>
            )}
          </View>

        </View>
      </TouchableOpacity>
    </RNAnimated.View>
  );
};

// Modern Checkbox Component
const Checkbox: React.FC<{
  checked: boolean;
  onPress: () => void;
  label: string;
}> = ({ checked, onPress, label }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const CreateTaskScreen: React.FC<CreateTaskProps> = ({
  onCreateTask,
  onBack,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    emoji: '🍽️',
    when: {
      date: new Date().toISOString().split('T')[0],
      time: '20:30',
    },
    durationMinutes: 60,
    recurrence: {
      frequency: 'none',
      interval: 1,
    },
    alerts: [],
    details: '',
    isShared: false,
    subtasks: [],
  });

  // Tray visibility states
  const [showEmojiTray, setShowEmojiTray] = useState(false);
  const [showDateTray, setShowDateTray] = useState(false);
  const [showAlertsTray, setShowAlertsTray] = useState(false);

  const [showRecurrenceDetails, setShowRecurrenceDetails] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const titleRef = useRef<TextInput>(null);

  const alertOptions = [
    { id: 'start', label: 'At start of task' },
    { id: 'end', label: 'At end of task' },
    { id: '5min', label: '5 minutes before' },
    { id: '10min', label: '10 minutes before' },
    { id: '15min', label: '15 minutes before' },
    { id: '30min', label: '30 minutes before' },
    { id: '1hour', label: '1 hour before' },
    { id: '2hours', label: '2 hours before' },
    { id: '1day', label: '1 day before' },
  ];

  const addSubtask = () => {
    const newSubtask = {
      id: Date.now().toString(),
      title: '',
      completed: false,
    };
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, newSubtask],
    }));
  };

  const updateSubtask = (id: string, title: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(task =>
        task.id === id ? { ...task, title } : task,
      ),
    }));
  };

  const removeSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(task => task.id !== id),
    }));
  };

  const toggleAlert = (alertId: string) => {
    setFormData(prev => ({
      ...prev,
      alerts: prev.alerts.includes(alertId)
        ? prev.alerts.filter(id => id !== alertId)
        : [...prev.alerts, alertId],
    }));
  };

  const getAlertLabel = (alertId: string) => {
    const option = alertOptions.find(opt => opt.id === alertId);
    return option ? option.label : alertId;
  };

  useEffect(() => {
    // Initialize form data when component mounts
    setFormData({
      title: '',
      emoji: '🍽️',
      when: {
        date: new Date().toISOString().split('T')[0],
        time: '20:30',
      },
      durationMinutes: 60,
      recurrence: {
        frequency: 'none',
        interval: 1,
      },
      alerts: [],
      details: '',
      isShared: false,
      subtasks: [],
    });

    // Focus title input after a short delay
    setTimeout(() => titleRef.current?.focus(), 300);
  }, []);

  const updateField = <K extends keyof TaskFormData>(
    field: K,
    value: TaskFormData[K],
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title');
      return;
    }

    try {
      await onCreateTask(formData);
      onBack?.(); // Navigate back after successful creation
    } catch (error) {
      console.error('Task creation failed:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
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

  // Handle scroll to detect if user is near bottom
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100; // How close to bottom triggers the state change
    const isNearEnd =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    setIsNearBottom(isNearEnd);
  };

  // Determine if create button should be solid (all conditions met)
  const isCreateButtonReady = formData.title.trim().length > 0 && isNearBottom;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />

      {/* Header with back button */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>New Task</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Emoji & Title */}
        <View style={styles.emojiTitleSection}>
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => setShowEmojiTray(true)}
          >
            <Text style={styles.emoji}>{formData.emoji}</Text>
          </TouchableOpacity>
          <TextInput
            ref={titleRef}
            style={styles.titleInput}
            value={formData.title}
            onChangeText={text => updateField('title', text)}
            placeholder="What needs to be done?"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Partner Share */}
        <View style={styles.section}>
          <PartnerShareCheckbox
            checked={formData.isShared}
            onPress={() => updateField('isShared', !formData.isShared)}
          />
        </View>

        {/* When? - Animated Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When?</Text>
          <AnimatedWhenSelector
            selectedDate={formData.when.date}
            selectedTime={formData.when.time}
            onDateChange={date => updateField('when', { ...formData.when, date })}
            onTimeChange={time => updateField('when', { ...formData.when, time })}
            durationMinutes={formData.durationMinutes}
          />
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <GoalDurationSlider
            selectedValue={formData.durationMinutes}
            onSelect={value => updateField('durationMinutes', value)}
          />
        </View>

        {/* Recurrence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recurrence</Text>
          <RecurrenceSelector
            options={['None', 'Daily', 'Weekly', 'Monthly']}
            selectedValue={
              formData.recurrence.frequency.charAt(0).toUpperCase() +
              formData.recurrence.frequency.slice(1)
            }
            onSelect={value => {
              const frequency = value.toLowerCase() as
                | 'none'
                | 'daily'
                | 'weekly'
                | 'monthly';
              updateField('recurrence', {
                ...formData.recurrence,
                frequency,
              });
              setShowRecurrenceDetails(frequency !== 'none');
            }}
          />

          {showRecurrenceDetails &&
            formData.recurrence.frequency !== 'none' && (
              <View style={styles.recurrenceDetails}>
                <Text style={styles.detailLabel}>Every</Text>
                <View style={styles.intervalRow}>
                  {[1, 2, 3, 4].map(interval => (
                    <TouchableOpacity
                      key={interval}
                      style={[
                        styles.intervalButton,
                        formData.recurrence.interval === interval &&
                          styles.intervalButtonActive,
                      ]}
                      onPress={() =>
                        updateField('recurrence', {
                          ...formData.recurrence,
                          interval,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.intervalButtonText,
                          formData.recurrence.interval === interval &&
                            styles.intervalButtonTextActive,
                        ]}
                      >
                        {interval}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.intervalLabel}>
                    {formData.recurrence.frequency === 'daily'
                      ? 'day(s)'
                      : formData.recurrence.frequency === 'weekly'
                      ? 'week(s)'
                      : formData.recurrence.frequency === 'monthly'
                      ? 'month(s)'
                      : ''}
                  </Text>
                </View>
              </View>
            )}
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          <TouchableOpacity
            style={styles.alertsButton}
            onPress={() => setShowAlertsTray(true)}
          >
            <Text style={styles.alertsButtonText}>
              Select alerts +
            </Text>
          </TouchableOpacity>
          
          {/* Selected Alerts Display */}
          {formData.alerts.length > 0 && (
            <View style={styles.selectedAlertsContainer}>
              {formData.alerts.map((alertId) => (
                <View key={alertId} style={styles.selectedAlertChip}>
                  <Text style={styles.selectedAlertText}>
                    {getAlertLabel(alertId)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleAlert(alertId)}
                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  >
                    <Text style={styles.removeAlertText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Details & Subtasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details & Steps</Text>
          <TextInput
            style={styles.detailsInput}
            value={formData.details}
            onChangeText={text => updateField('details', text)}
            placeholder="Add notes, links, or additional details..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
          />

          {/* Subtasks */}
          {formData.subtasks.length > 0 && (
            <View style={styles.subtasksSection}>
              <Text style={styles.subtasksTitle}>Steps to complete:</Text>
              {formData.subtasks.map((task, index) => (
                <View key={task.id} style={styles.subtaskRow}>
                  <Text style={styles.subtaskNumber}>{index + 1}.</Text>
                  <TextInput
                    style={styles.subtaskInput}
                    placeholder={`Step ${index + 1}`}
                    value={task.title}
                    onChangeText={text => updateSubtask(task.id, text)}
                    placeholderTextColor={colors.textTertiary}
                  />
                  <TouchableOpacity onPress={() => removeSubtask(task.id)}>
                    <Text style={styles.removeSubtask}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addSubtaskButton}
            onPress={addSubtask}
          >
            <Text style={styles.addSubtaskText}>+ Add step</Text>
          </TouchableOpacity>
        </View>
        {/* Extra spacing to ensure create button doesn't cover content */}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Fixed Create Button */}
      <View style={styles.createButtonContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={[
            styles.createButton,
            {
              opacity: isCreateButtonReady ? 1.0 : 0.6, // Solid when ready, semi-transparent when not
              backgroundColor: isCreateButtonReady ? colors.primary : '#7BA86F', // Light green when disabled
            },
          ]}
          onPress={handleCreate}
          disabled={!formData.title.trim()}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.createButtonText,
              { color: isCreateButtonReady ? colors.white : colors.white },
            ]}
          >
            Create Task
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tray Manager for coordinating multiple trays */}
      <TrayManager>
        {/* Emoji Tray */}
        <EmojiTray
          visible={showEmojiTray}
          onClose={() => setShowEmojiTray(false)}
          selectedEmoji={formData.emoji}
          onEmojiSelect={emoji => {
            updateField('emoji', emoji);
            setShowEmojiTray(false);
          }}
        />

        {/* Date Tray */}
        <DateTray
          visible={showDateTray}
          onClose={() => setShowDateTray(false)}
          selectedDate={formData.when.date}
          onDateSelect={date => {
            updateField('when', { ...formData.when, date });
            setShowDateTray(false);
          }}
        />

        {/* Alerts Tray */}
        <AlertsTray
          visible={showAlertsTray}
          onClose={() => setShowAlertsTray(false)}
          selectedAlerts={formData.alerts}
          onAlertsChange={alerts => {
            updateField('alerts', alerts);
          }}
        />
      </TrayManager>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60, // Same width as back button to center title
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140, // Enough space for create button (18px padding + 16px border radius + extra margin)
    minHeight: screenHeight * 1.2, // Ensure content is taller than screen to enable scrolling
  },

  // Emoji & Title Section
  emojiTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emojiButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 32,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    padding: 0,
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },

  // Modern Partner Share Styles
  partnerShareContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginHorizontal: 4,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  partnerShareContainerActive: {
    backgroundColor: '#F0F9F0',
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
  },
  partnerShareTouchable: {
    padding: 20,
  },
  partnerShareContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Enhanced Profile Picture Styles
  profileContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    backgroundColor: colors.border,
  },
  profileRingActive: {
    backgroundColor: colors.primary,
  },
  profileImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.gray,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 10,
  },
  checkmarkBackground: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmarkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Enhanced Text Styles
  partnerText: {
    flex: 1,
    paddingRight: 12,
  },
  partnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  partnerName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  partnerBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  partnerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  partnerSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 2,
  },
  partnerActiveText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  

  // Time Selector
  timeScroll: {
    marginBottom: 12,
  },
  timeScrollContainer: {
    paddingHorizontal: 4,
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  timeButtonSelected: {
    backgroundColor: colors.primary,
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  timeButtonTextSelected: {
    color: colors.white,
  },
  endTimeText: {
    fontSize: 12,
    color: colors.white,
    marginTop: 2,
    opacity: 0.8,
  },

  // Date Button
  dateButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },

  // Duration Grid
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  durationButtonActive: {
    backgroundColor: colors.primary,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  durationButtonTextActive: {
    color: colors.white,
  },

  // Recurrence Grid
  recurrenceGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  recurrenceButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recurrenceButtonActive: {
    backgroundColor: colors.primary,
  },
  recurrenceButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  recurrenceButtonTextActive: {
    color: colors.white,
  },

  // Recurrence Details
  recurrenceDetails: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intervalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intervalButtonActive: {
    backgroundColor: colors.primary,
  },
  intervalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  intervalButtonTextActive: {
    color: colors.white,
  },
  intervalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Alerts Button
  alertsButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  alertsButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  
  // Selected Alerts Display
  selectedAlertsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  selectedAlertChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.selectedBackground,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectedAlertText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
    marginRight: 6,
  },
  removeAlertText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    opacity: 0.7,
  },

  // Checkbox Styles
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },

  // Details Input
  detailsInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },

  // Subtasks
  subtasksSection: {
    marginTop: 16,
  },
  subtasksTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtaskNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    width: 20,
  },
  subtaskInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    fontSize: 14,
    color: colors.text,
    marginRight: 8,
  },
  removeSubtask: {
    fontSize: 16,
    color: colors.textTertiary,
    paddingHorizontal: 8,
  },
  addSubtaskButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  addSubtaskText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // Bottom scroll area
  bottomScrollArea: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.selectedBackground,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  scrollHintText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Fixed Create Button
  createButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100, // Position above floating navigation
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
    zIndex: 1001, // Higher than navigation (1000) but lower than trays
  },
  createButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default CreateTaskScreen;
