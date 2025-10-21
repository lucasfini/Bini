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
import CustomDurationTray from '../../components/CustomDurationTray';
import TrayManager from '../../components/TrayManager';

// Import the new modern form components
import ModernTimeSpentSlider from '../../components/ModernTimeSpentSlider';
import RecurrenceSelector from '../../components/RecurrenceSelector';
import ModernDateTimePicker from '../../components/ModernDateTimePicker';
import { useTheme } from '../../context/ThemeContext';
import { colors, typography, spacing } from '../../styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

import { TaskFormData } from '../../types/tasks';
import { populateSampleTasks } from '../../utils/populateSampleTasks';

interface CreateTaskProps {
  onCreateTask: (task: TaskFormData, mode?: 'create' | 'edit' | 'duplicate', taskId?: string) => void;
  onBack?: () => void;
  editingTask?: any; // Task being edited
  duplicatingTask?: any; // Task being duplicated
  mode?: 'create' | 'edit' | 'duplicate';
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
            <View
              style={[styles.profileRing, checked && styles.profileRingActive]}
            >
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
                ? '✓ Sarah will be notified about this task'
                : 'Tap to share this task with your partner'}
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
  editingTask,
  duplicatingTask,
  mode = 'create',
}) => {
  const { theme } = useTheme();
  
  // Force dark theme for this screen
  const darkTheme = {
    background: '#1A1A1A',
    surface: '#2A2A2A',
    border: '#3A3A3A',
    textPrimary: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textTertiary: '#999999',
    primary: '#FF6B9D',
  };
  
  // Debug: Log props on mount and change
  useEffect(() => {
    console.log('🎬 CreateTaskScreen props:', {
      mode,
      editingTask: editingTask ? 'present' : 'null',
      duplicatingTask: duplicatingTask ? 'present' : 'null'
    });
    if (editingTask) {
      console.log('📝 Editing task data:', JSON.stringify(editingTask, null, 2));
    }
    if (duplicatingTask) {
      console.log('📋 Duplicating task data:', JSON.stringify(duplicatingTask, null, 2));
    }
  }, [mode, editingTask, duplicatingTask]);

  // Helper function to convert UnifiedTask to TaskFormData
  const taskToFormData = (task: any, isDuplicate: boolean = false): TaskFormData => {
    console.log('🔄 Converting task to form data:', JSON.stringify(task, null, 2));
    console.log('📋 Is duplicate mode:', isDuplicate);
    
    // Debug each field individually
    console.log('🔍 Field debugging:');
    console.log('  - task.title:', task.title, '(type:', typeof task.title, ')');
    console.log('  - task.emoji:', task.emoji, '(type:', typeof task.emoji, ')');
    console.log('  - task.date:', task.date, '(type:', typeof task.date, ')');
    console.log('  - task.startTime:', task.startTime, '(type:', typeof task.startTime, ')');
    console.log('  - task.time:', task.time, '(type:', typeof task.time, ')');
    console.log('  - task.duration:', task.duration, '(type:', typeof task.duration, ')');
    console.log('  - task.details:', task.details, '(type:', typeof task.details, ')');
    console.log('  - task.subtitle:', task.subtitle, '(type:', typeof task.subtitle, ')');
    console.log('  - task.recurrence:', task.recurrence, '(type:', typeof task.recurrence, ')');
    console.log('  - task.alerts:', task.alerts, '(type:', typeof task.alerts, ', isArray:', Array.isArray(task.alerts), ')');
    console.log('  - task.steps:', task.steps, '(type:', typeof task.steps, ', isArray:', Array.isArray(task.steps), ')');
    console.log('  - task.subtasks:', task.subtasks, '(type:', typeof task.subtasks, ', isArray:', Array.isArray(task.subtasks), ')');
    console.log('  - task.isShared:', task.isShared, '(type:', typeof task.isShared, ')');
    
    const formData = {
      title: task.title || '',
      emoji: task.emoji || '🍽️',
      when: {
        date: isDuplicate ? new Date().toISOString().split('T')[0] : (task.date || new Date().toISOString().split('T')[0]),
        time: isDuplicate ? '20:30' : (task.startTime || task.time || '20:30'),
      },
      durationMinutes: task.duration || 60,
      recurrence: task.recurrence || {
        frequency: 'none',
        interval: 1,
        daysOfWeek: [],
      },
      alerts: Array.isArray(task.alerts) ? task.alerts : [],
      details: task.details || task.subtitle || '',
      isShared: Boolean(task.isShared),
      subtasks: Array.isArray(task.steps) ? task.steps : (Array.isArray(task.subtasks) ? task.subtasks : []),
    };
    
    console.log('✅ Converted form data:', JSON.stringify(formData, null, 2));
    
    // Debug the converted values
    console.log('🎯 Final converted values:');
    console.log('  - title:', formData.title, '(length:', formData.title.length, ')');
    console.log('  - emoji:', formData.emoji);
    console.log('  - date:', formData.when.date);
    console.log('  - time:', formData.when.time);
    console.log('  - duration:', formData.durationMinutes);
    console.log('  - details:', formData.details, '(length:', formData.details.length, ')');
    console.log('  - alerts count:', formData.alerts.length);
    console.log('  - subtasks count:', formData.subtasks.length);
    
    return formData;
  };

  // Initialize form data based on mode
  const getInitialFormData = (): TaskFormData => {
    if (mode === 'edit' && editingTask) {
      return taskToFormData(editingTask, false);
    } else if (mode === 'duplicate' && duplicatingTask) {
      return taskToFormData(duplicatingTask, true);
    } else {
      return {
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
      };
    }
  };

  const [formData, setFormData] = useState<TaskFormData>(() => {
    console.log('🏁 Initial state calculation, mode:', mode);
    return getInitialFormData();
  });

  // Tray visibility states
  const [showEmojiTray, setShowEmojiTray] = useState(false);
  const [showDateTray, setShowDateTray] = useState(false);
  const [showAlertsTray, setShowAlertsTray] = useState(false);
  const [showCustomDurationTray, setShowCustomDurationTray] = useState(false);
  const [showModernDateTime, setShowModernDateTime] = useState(false);

  const [showRecurrenceDetails, setShowRecurrenceDetails] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const titleRef = useRef<TextInput>(null);

  // Reinitialize form data when editing/duplicating task changes
  useEffect(() => {
    console.log('🔄 Reinitializing form data, mode:', mode);
    console.log('📝 Editing task:', editingTask);
    console.log('📋 Duplicating task:', duplicatingTask);
    
    if (mode === 'edit' && editingTask) {
      const editFormData = taskToFormData(editingTask, false);
      console.log('✏️ Setting edit form data:', JSON.stringify(editFormData, null, 2));
      setFormData(editFormData);
    } else if (mode === 'duplicate' && duplicatingTask) {
      const duplicateFormData = taskToFormData(duplicatingTask, true);
      console.log('📋 Setting duplicate form data:', JSON.stringify(duplicateFormData, null, 2));
      setFormData(duplicateFormData);
    } else {
      // Reset to default for create mode
      const defaultFormData = {
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
      };
      console.log('🆕 Setting default form data for create mode');
      setFormData(defaultFormData);
    }
  }, [editingTask, duplicatingTask, mode]);

  // Debug: Track formData changes
  useEffect(() => {
    console.log('📊 Form data updated:', JSON.stringify(formData, null, 2));
  }, [formData]);

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
      const taskId = mode === 'edit' ? editingTask?.id : undefined;
      await onCreateTask(formData, mode, taskId);
      onBack?.(); // Navigate back after successful creation
    } catch (error) {
      console.error(`Task ${mode} failed:`, error);
      Alert.alert('Error', `Failed to ${mode} task. Please try again.`);
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

  // Create theme-aware styles
  const getThemedStyles = () => {
    return StyleSheet.create({
      ...styles,
      // Override specific styles with dark theme colors
      container: {
        ...styles.container,
        backgroundColor: darkTheme.background,
      },
      header: {
        ...styles.header,
        backgroundColor: darkTheme.background,
        borderBottomColor: darkTheme.border,
      },
      headerTitle: {
        ...styles.headerTitle,
        color: darkTheme.textPrimary,
      },
      titleInput: {
        ...styles.titleInput,
        color: darkTheme.textPrimary,
      },
      sectionTitle: {
        ...styles.sectionTitle,
        color: darkTheme.textSecondary,
      },
      partnerName: {
        ...styles.partnerName,
        color: darkTheme.textPrimary,
      },
      partnerSubtext: {
        ...styles.partnerSubtext,
        color: darkTheme.textSecondary,
      },
      dayText: {
        ...styles.dayText,
        color: darkTheme.textSecondary,
      },
      dateNumber: {
        ...styles.dateNumber,
        color: darkTheme.textPrimary,
      },
      monthText: {
        ...styles.monthText,
        color: darkTheme.textSecondary,
      },
      timeLabel: {
        ...styles.timeLabel,
        color: darkTheme.textSecondary,
      },
      timeDisplay: {
        ...styles.timeDisplay,
        color: darkTheme.textPrimary,
      },
      timeSubtext: {
        ...styles.timeSubtext,
        color: darkTheme.textSecondary,
      },
      recurrenceMainText: {
        ...styles.recurrenceMainText,
        color: darkTheme.textPrimary,
      },
      recurrenceSubtext: {
        ...styles.recurrenceSubtext,
        color: darkTheme.textSecondary,
      },
      alertsMainText: {
        ...styles.alertsMainText,
        color: darkTheme.textPrimary,
      },
      alertsSubtext: {
        ...styles.alertsSubtext,
        color: darkTheme.textSecondary,
      },
      subtasksTitle: {
        ...styles.subtasksTitle,
        color: darkTheme.textPrimary,
      },
      subtaskNumber: {
        ...styles.subtaskNumber,
        color: darkTheme.textSecondary,
      },
      subtaskInput: {
        ...styles.subtaskInput,
        color: darkTheme.textPrimary,
        backgroundColor: darkTheme.surface,
        borderColor: darkTheme.border,
      },
      detailsInput: {
        ...styles.detailsInput,
        color: darkTheme.textPrimary,
        backgroundColor: darkTheme.surface,
        borderColor: darkTheme.border,
      },
      whenContent: {
        ...styles.whenContent,
        borderColor: darkTheme.border,
      },
      verticalDivider: {
        ...styles.verticalDivider,
        backgroundColor: darkTheme.border,
      },
      recurrenceContent: {
        ...styles.recurrenceContent,
        borderColor: darkTheme.border,
      },
      alertsContent: {
        ...styles.alertsContent,
        borderColor: darkTheme.border,
      },
      intervalLabel: {
        ...styles.intervalLabel,
        color: darkTheme.textSecondary,
      },
      weekDayText: {
        ...styles.weekDayText,
        color: darkTheme.textSecondary,
      },
      recurrenceOptionText: {
        ...styles.recurrenceOptionText,
        color: darkTheme.textSecondary,
      },
      subOptionsTitle: {
        ...styles.subOptionsTitle,
        color: darkTheme.textSecondary,
      },
      addSubtaskText: {
        ...styles.addSubtaskText,
        color: darkTheme.textSecondary,
      },
    });
  };

  const themedStyles = getThemedStyles();

  return (
    <GestureHandlerRootView style={themedStyles.container}>
      <StatusBar backgroundColor={darkTheme.background} barStyle="light-content" />

      {/* Header with back button */}
      <View style={themedStyles.header}>
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={themedStyles.headerTitle}>
          {mode === 'edit' ? 'Edit Task' : mode === 'duplicate' ? 'Duplicate Task' : 'New Task'}
        </Text>
        <TouchableOpacity
          onPress={async () => {
            console.log('Creating sample tasks...');
            await populateSampleTasks();
            Alert.alert('Sample Tasks Created', '5 sample tasks have been created!');
          }}
          style={{ padding: 8 }}
        >
          <Text style={{ color: darkTheme.primary, fontSize: 12 }}>Sample</Text>
        </TouchableOpacity>
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
            style={themedStyles.titleInput}
            value={formData.title}
            onChangeText={text => updateField('title', text)}
            placeholder="What needs to be done?"
            placeholderTextColor={darkTheme.textTertiary}
          />
        </View>

        {/* Partner Share */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={themedStyles.sectionTitle}>SHARE WITH PARTNER</Text>
            <View style={[styles.actionDot, { backgroundColor: colors.primary }]} />
          </View>
          
          <TouchableOpacity
            style={[
              styles.partnerShareModernContainer,
              formData.isShared && styles.partnerShareModernContainerActive
            ]}
            onPress={() => updateField('isShared', !formData.isShared)}
            activeOpacity={0.8}
          >
            <View style={styles.partnerShareContent}>
              {/* Profile Picture */}
              <View style={styles.profileContainer}>
                <View style={[styles.profileRing, formData.isShared && styles.profileRingActive]}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=120&h=120&fit=crop&crop=face',
                    }}
                    style={styles.profileImage}
                  />
                  <View style={styles.onlineIndicator} />
                </View>
              </View>
              
              {/* Text Content */}
              <View style={styles.partnerTextContent}>
                <View style={styles.partnerNameRow}>
                  <Text style={themedStyles.partnerName}>Sarah</Text>
                  <View style={styles.partnerBadge}>
                    <Text style={styles.partnerBadgeText}>Partner</Text>
                  </View>
                </View>
                <Text style={themedStyles.partnerSubtext}>
                  {formData.isShared
                    ? 'Will be notified about this task'
                    : 'Tap to share this task with your partner'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Combined Scheduling Section */}
        <View style={styles.combinedSection}>
          <View style={styles.titleRow}>
            <Text style={themedStyles.sectionTitle}>SCHEDULED FOR</Text>
            <View style={[styles.actionDot, { backgroundColor: colors.primary }]} />
          </View>
          
          <TouchableOpacity
            style={styles.modernWhenContainer}
            onPress={() => setShowModernDateTime(true)}
            activeOpacity={0.8}
          >
            {/* Main Content */}
            <View style={themedStyles.whenContent}>
              {/* Date Section */}
              <View style={styles.dateBlock}>
                <Text style={themedStyles.dayText}>
                  {(() => {
                    try {
                      const date = new Date(formData.when.date);
                      if (isNaN(date.getTime())) {
                        return 'Select';
                      }
                      return date.toLocaleDateString('en-US', {
                        weekday: 'short',
                      }).toUpperCase();
                    } catch (error) {
                      return 'SELECT';
                    }
                  })()}
                </Text>
                <Text style={themedStyles.dateNumber}>
                  {(() => {
                    try {
                      const date = new Date(formData.when.date);
                      if (isNaN(date.getTime())) {
                        return '--';
                      }
                      return date.getDate().toString().padStart(2, '0');
                    } catch (error) {
                      return '--';
                    }
                  })()}
                </Text>
                <Text style={themedStyles.monthText}>
                  {(() => {
                    try {
                      const date = new Date(formData.when.date);
                      if (isNaN(date.getTime())) {
                        return 'Month';
                      }
                      return date.toLocaleDateString('en-US', {
                        month: 'short',
                      }).toUpperCase();
                    } catch (error) {
                      return 'MONTH';
                    }
                  })()}
                </Text>
              </View>

              {/* Divider */}
              <View style={themedStyles.verticalDivider} />

              {/* Time Section */}
              <View style={styles.timeBlock}>
                <Text style={themedStyles.timeLabel}>AT</Text>
                <Text style={themedStyles.timeDisplay}>
                  {(() => {
                    try {
                      if (!formData.when.time) {
                        return 'Select Time';
                      }
                      const [hours, minutes] = formData.when.time.split(':');
                      const date = new Date();
                      date.setHours(parseInt(hours), parseInt(minutes));
                      return date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      });
                    } catch (error) {
                      return 'Select Time';
                    }
                  })()}
                </Text>
                <Text style={themedStyles.timeSubtext}>Start time</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* TIME SPENT Section - No border divider */}
          <View style={styles.timeSpentSubsection}>
          <View style={styles.titleRow}>
            <Text style={themedStyles.sectionTitle}>TIME SPENT</Text>
            <View style={styles.titleRowActions}>
              <TouchableOpacity 
                onPress={() => setShowCustomDurationTray(true)}
                style={styles.customButton}
              >
                <Text style={[styles.customButtonText, { color: colors.primary }]}>
                  Custom
                </Text>
              </TouchableOpacity>
              <View style={[styles.actionDot, { backgroundColor: colors.primary }]} />
            </View>
          </View>
          
          {/* Duration Display - close to title */}
          <View style={styles.durationDisplayContainer}>
            <Text style={styles.durationDisplayText}>
              {(() => {
                const startTime = formData.when.time;
                const duration = formData.durationMinutes;
                
                if (!startTime) return `${duration >= 60 ? Math.floor(duration / 60) + 'h ' : ''}${duration % 60 > 0 ? (duration % 60) + 'm' : ''}`;
                
                try {
                  const [hours, minutes] = startTime.split(':').map(Number);
                  const startMinutes = hours * 60 + minutes;
                  const endMinutes = startMinutes + duration;
                  const endHours = Math.floor(endMinutes / 60) % 24;
                  const endMins = endMinutes % 60;
                  const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
                  
                  const formatTime12Hour = (timeStr: string): string => {
                    const [h, m] = timeStr.split(':').map(Number);
                    const date = new Date();
                    date.setHours(h, m);
                    return date.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    });
                  };
                  
                  return `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`;
                } catch {
                  return `${duration >= 60 ? Math.floor(duration / 60) + 'h ' : ''}${duration % 60 > 0 ? (duration % 60) + 'm' : ''}`;
                }
              })()}
            </Text>
          </View>
          
          <ModernTimeSpentSlider
            initialValue={formData.durationMinutes}
            showHeader={false}
            onValueChange={value => updateField('durationMinutes', value)}
            startTime={formData.when.time}
          />
          </View>
        </View>

        {/* Recurrence */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={themedStyles.sectionTitle}>REPEAT</Text>
            <View style={[styles.actionDot, { backgroundColor: colors.primary }]} />
          </View>
          
          <TouchableOpacity
            style={styles.recurrenceModernContainer}
            onPress={() => setShowRecurrenceDetails(!showRecurrenceDetails)}
            activeOpacity={0.8}
          >
            <View style={[
              themedStyles.recurrenceContent,
              formData.recurrence.frequency !== 'none' && styles.recurrenceContentActive
            ]}>
              <View style={styles.recurrenceTextContent}>
                <Text style={themedStyles.recurrenceMainText}>
                  {formData.recurrence.frequency === 'none' 
                    ? 'Once' 
                    : formData.recurrence.frequency.charAt(0).toUpperCase() + formData.recurrence.frequency.slice(1)
                  }
                </Text>
                <Text style={themedStyles.recurrenceSubtext}>
                  {formData.recurrence.frequency === 'none'
                    ? 'Task occurs once'
                    : formData.recurrence.frequency === 'weekly' && formData.recurrence.daysOfWeek && formData.recurrence.daysOfWeek.length > 0
                      ? formData.recurrence.daysOfWeek
                          .sort((a, b) => parseInt(a) - parseInt(b))
                          .map(dayIndex => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][parseInt(dayIndex)])
                          .join(' ')
                      : `Every ${formData.recurrence.interval} ${formData.recurrence.frequency === 'daily' ? 'day' : formData.recurrence.frequency === 'weekly' ? 'week' : 'month'}${formData.recurrence.interval > 1 ? 's' : ''}`
                  }
                </Text>
              </View>
              
              <View style={[
                styles.recurrenceArrow,
                formData.recurrence.frequency !== 'none' && styles.recurrenceArrowActive
              ]}>
                <Text style={[
                  styles.recurrenceArrowText,
                  formData.recurrence.frequency !== 'none' && styles.recurrenceArrowTextActive
                ]}>
                  {showRecurrenceDetails ? '−' : '+'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          
          {/* Recurrence Options */}
          {showRecurrenceDetails && (
            <View style={styles.recurrenceOptionsContainer}>
              {/* Main Options */}
              <View style={styles.recurrenceOptions}>
                {['Once', 'Daily', 'Weekly', 'Monthly'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.recurrenceOptionButton,
                      formData.recurrence.frequency === (option === 'Once' ? 'none' : option.toLowerCase()) && styles.recurrenceOptionButtonActive
                    ]}
                    onPress={() => {
                      const frequency = option === 'Once' ? 'none' : option.toLowerCase() as 'none' | 'daily' | 'weekly' | 'monthly';
                      updateField('recurrence', {
                        ...formData.recurrence,
                        frequency,
                        interval: 1, // Reset interval when changing frequency
                      });
                    }}
                  >
                    <Text style={[
                      styles.recurrenceOptionText,
                      formData.recurrence.frequency === (option === 'Once' ? 'none' : option.toLowerCase()) && styles.recurrenceOptionTextActive
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Sub Options */}
              {formData.recurrence.frequency === 'daily' && (
                <View style={styles.subOptionsContainer}>
                  <View style={styles.intervalControl}>
                    <Text style={styles.intervalLabel}>Every</Text>
                    <Text style={styles.intervalNumberPink}>{formData.recurrence.interval}</Text>
                    <Text style={styles.intervalLabel}>
                      {formData.recurrence.interval === 1 ? 'day' : 'days'}
                    </Text>
                    <View style={styles.arrowContainer}>
                      <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={() => {
                          const newInterval = Math.max(1, formData.recurrence.interval - 1);
                          updateField('recurrence', {
                            ...formData.recurrence,
                            interval: newInterval,
                          });
                        }}
                      >
                        <Text style={styles.arrowText}>‹</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={() => {
                          const newInterval = Math.min(365, formData.recurrence.interval + 1);
                          updateField('recurrence', {
                            ...formData.recurrence,
                            interval: newInterval,
                          });
                        }}
                      >
                        <Text style={styles.arrowText}>›</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              
              {formData.recurrence.frequency === 'weekly' && (
                <View style={styles.subOptionsContainer}>
                  <Text style={styles.subOptionsTitle}>Days of the week:</Text>
                  <View style={styles.weekDaysContainer}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.weekDayButton,
                          formData.recurrence.daysOfWeek?.includes(index.toString()) && styles.weekDayButtonActive
                        ]}
                        onPress={() => {
                          const currentDays = formData.recurrence.daysOfWeek || [];
                          const dayStr = index.toString();
                          const newDays = currentDays.includes(dayStr)
                            ? currentDays.filter(d => d !== dayStr)
                            : [...currentDays, dayStr];
                          updateField('recurrence', {
                            ...formData.recurrence,
                            daysOfWeek: newDays,
                          });
                        }}
                      >
                        <Text style={[
                          styles.weekDayText,
                          formData.recurrence.daysOfWeek?.includes(index.toString()) && styles.weekDayTextActive
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              
              {formData.recurrence.frequency === 'monthly' && (
                <View style={styles.subOptionsContainer}>
                  <View style={styles.intervalControl}>
                    <Text style={styles.intervalLabel}>Every</Text>
                    <Text style={styles.intervalNumberPink}>{formData.recurrence.interval}</Text>
                    <Text style={styles.intervalLabel}>
                      {formData.recurrence.interval === 1 ? 'month' : 'months'}
                    </Text>
                    <View style={styles.arrowContainer}>
                      <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={() => {
                          const newInterval = Math.max(1, formData.recurrence.interval - 1);
                          updateField('recurrence', {
                            ...formData.recurrence,
                            interval: newInterval,
                          });
                        }}
                      >
                        <Text style={styles.arrowText}>‹</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={() => {
                          const newInterval = Math.min(12, formData.recurrence.interval + 1);
                          updateField('recurrence', {
                            ...formData.recurrence,
                            interval: newInterval,
                          });
                        }}
                      >
                        <Text style={styles.arrowText}>›</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={themedStyles.sectionTitle}>ALERTS</Text>
            <View style={[styles.actionDot, { backgroundColor: colors.primary }]} />
          </View>
          
          <TouchableOpacity
            style={styles.alertsModernContainer}
            onPress={() => setShowAlertsTray(true)}
            activeOpacity={0.8}
          >
            <View style={[
              themedStyles.alertsContent,
              formData.alerts.length > 0 && styles.alertsContentActive
            ]}>
              <View style={styles.alertsTextContent}>
                <Text style={themedStyles.alertsMainText}>Select Alerts</Text>
                <Text style={themedStyles.alertsSubtext}>
                  {formData.alerts.length > 0 
                    ? `${formData.alerts.length} alert${formData.alerts.length > 1 ? 's' : ''} selected`
                    : 'Choose when to be notified'
                  }
                </Text>
              </View>
              
              <View style={[
                styles.alertsArrow,
                formData.alerts.length > 0 && styles.alertsArrowActive
              ]}>
                <Text style={[
                  styles.alertsArrowText,
                  formData.alerts.length > 0 && styles.alertsArrowTextActive
                ]}>+</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Selected Alerts Display */}
          {formData.alerts.length > 0 && (
            <View style={styles.selectedAlertsContainer}>
              {formData.alerts.map(alertId => (
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
          <View style={styles.titleRow}>
            <Text style={themedStyles.sectionTitle}>DETAILS & STEPS</Text>
            <View style={[styles.actionDot, { backgroundColor: colors.primary }]} />
          </View>
          <TextInput
            style={themedStyles.detailsInput}
            value={formData.details}
            onChangeText={text => updateField('details', text)}
            placeholder="Add notes, links, or additional details..."
            placeholderTextColor={darkTheme.textTertiary}
            multiline
            numberOfLines={3}
          />

          {/* Subtasks */}
          {formData.subtasks.length > 0 && (
            <View style={styles.subtasksSection}>
              <Text style={themedStyles.subtasksTitle}>Steps to complete:</Text>
              {formData.subtasks.map((task, index) => (
                <View key={task.id} style={styles.subtaskRow}>
                  <Text style={themedStyles.subtaskNumber}>{index + 1}.</Text>
                  <TextInput
                    style={themedStyles.subtaskInput}
                    placeholder={`Step ${index + 1}`}
                    value={task.title}
                    onChangeText={text => updateSubtask(task.id, text)}
                    placeholderTextColor={darkTheme.textTertiary}
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
            <Text style={themedStyles.addSubtaskText}>+ Add step</Text>
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
            {mode === 'edit' ? 'Update Task' : mode === 'duplicate' ? 'Create Copy' : 'Create Task'}
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

        {/* Custom Duration Tray */}
        <CustomDurationTray
          visible={showCustomDurationTray}
          onClose={() => setShowCustomDurationTray(false)}
          selectedDuration={formData.durationMinutes}
          onDurationChange={duration => updateField('durationMinutes', duration)}
          useCircularPicker={true}
        />

        {/* Modern Date/Time Picker */}
        <ModernDateTimePicker
          visible={showModernDateTime}
          onClose={() => setShowModernDateTime(false)}
          selectedDate={formData.when.date}
          selectedTime={formData.when.time}
          onDateChange={date => updateField('when', { ...formData.when, date })}
          onTimeChange={time => updateField('when', { ...formData.when, time })}
        />
      </TrayManager>
    </GestureHandlerRootView>
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
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
  
  // Combined Section Styles
  combinedSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeSpentSubsection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 0,
  },

  // Modern Partner Share Styles
  partnerShareModernContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
    backgroundColor: 'transparent',
  },
  partnerShareModernContainerActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  partnerShareContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  partnerTextContent: {
    flex: 1,
    marginLeft: 16,
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

  // Modern Alerts Styles
  alertsModernContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  alertsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minWidth: 280,
  },
  alertsTextContent: {
    flex: 1,
  },
  alertsMainText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  alertsSubtext: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    opacity: 0.8,
  },
  alertsArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertsArrowText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  alertsContentActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: colors.primary,
  },
  alertsArrowTextActive: {
    color: colors.primary,
  },
  alertsArrowActive: {
    backgroundColor: 'transparent',
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

  // Modern When Container Styles
  modernWhenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    width: '100%',
  },
  
  // When Title Row
  whenTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  editDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
  
  // When Content
  whenContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: 40,
  },
  
  // Date Block
  dateBlock: {
    alignItems: 'center',
    paddingRight: 20,
  },
  dayText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 36,
    marginBottom: 2,
  },
  monthText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  
  // Vertical Divider
  verticalDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },
  
  // Time Block
  timeBlock: {
    flex: 1,
    paddingLeft: 4,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  timeDisplay: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  timeSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    opacity: 0.8,
  },

  // Consistent title row styles
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  customButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
  
  // Duration display - close to title
  durationDisplayContainer: {
    alignItems: 'flex-start',
    marginBottom: 8,
    marginTop: -8,
  },
  durationDisplayText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(236, 72, 153, 0.7)',
    letterSpacing: 0.5,
  },
  
  // Modern Recurrence Styles
  recurrenceModernContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  recurrenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minWidth: 280,
  },
  recurrenceTextContent: {
    flex: 1,
  },
  recurrenceMainText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  recurrenceSubtext: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    opacity: 0.8,
  },
  recurrenceArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recurrenceArrowText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  recurrenceContentActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: colors.primary,
  },
  recurrenceArrowTextActive: {
    color: colors.primary,
  },
  recurrenceArrowActive: {
    backgroundColor: 'transparent',
  },
  
  // Recurrence Options
  recurrenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
  recurrenceOptionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recurrenceOptionButtonActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: colors.primary,
  },
  recurrenceOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recurrenceOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Section container styles
  alertsContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  // Recurrence sub-options styles
  recurrenceOptionsContainer: {
    marginTop: 16,
  },
  subOptionsContainer: {
    marginTop: 12,
  },
  subOptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Interval control styles (for daily/monthly)
  intervalControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  intervalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  arrowButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  intervalNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 30,
    textAlign: 'center',
  },
  intervalNumberPink: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  
  // Weekly controls styles
  weekDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  weekDayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  weekDayTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default CreateTaskScreen;
