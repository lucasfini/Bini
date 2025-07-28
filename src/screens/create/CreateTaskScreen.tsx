import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import EmojiSelector from 'react-native-emoji-selector';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Clean light mode colors
const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#E8E8E8',
  underline: '#D0D0D0',
  text: '#2C3E26',
  textSecondary: '#5A6B54',
  textTertiary: '#888888',
  primary: '#4A7C3A',
  secondary: '#D4AF37',
  white: '#FFFFFF',
  gray: '#F0F0F0',
  lightGray: '#E0E0E0',
  dragHandle: '#CCCCCC',
  selectedTime: '#FFFFFF',
  selectedTimeBorder: '#E0E0E0',
  checkboxActive: '#4A7C3A',
  checkboxInactive: '#E8E8E8',
};

interface TaskFormData {
  title: string;
  emoji: string;
  when: {
    date: string;
    time: string;
  };
  durationMinutes: number;
  recurrence: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: string[];
  };
  alerts: string[];
  details: string;
  isShared: boolean;
  subtasks: { id: string; title: string; completed: boolean }[];
}

interface CreateTaskProps {
  visible: boolean;
  onClose: () => void;
  onCreateTask: (task: TaskFormData) => void;
}

// Enhanced Time Selector that shows time range
const TimeSelector: React.FC<{
  selectedTime: string;
  onTimeChange: (time: string) => void;
  durationMinutes: number;
}> = ({ selectedTime, onTimeChange, durationMinutes }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + duration;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    return `${endHour.toString().padStart(2, '0')}:${endMinute
      .toString()
      .padStart(2, '0')}`;
  };

  const timeOptions = generateTimeOptions();
  const selectedIndex = timeOptions.findIndex(time => time === selectedTime);
  const ITEM_HEIGHT = 50;

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, timeOptions.length - 1));

    if (
      clampedIndex !== selectedIndex &&
      timeOptions[clampedIndex] !== selectedTime
    ) {
      onTimeChange(timeOptions[clampedIndex]);
    }
  };

  const scrollToTime = (timeIndex: number) => {
    if (scrollViewRef.current && timeIndex >= 0) {
      scrollViewRef.current.scrollTo({
        y: timeIndex * ITEM_HEIGHT,
        animated: true,
      });
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0) {
      setTimeout(() => {
        scrollToTime(selectedIndex);
      }, 200);
    }
  }, []);

  const endTime = calculateEndTime(selectedTime, durationMinutes);

  return (
    <View style={styles.timeSelectorContainer}>
      <View style={styles.timeListContainer}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * 2,
          }}
        >
          {timeOptions.map((time, index) => {
            const isSelected = time === selectedTime;
            const timeEndTime = calculateEndTime(time, durationMinutes);

            return (
              <TouchableOpacity
                key={time}
                style={[styles.timeItem, isSelected && styles.timeItemSelected]}
                onPress={() => {
                  onTimeChange(time);
                  scrollToTime(index);
                }}
              >
                <Text
                  style={[
                    styles.timeText,
                    isSelected && styles.timeTextSelected,
                    !isSelected && { opacity: 0.4 },
                  ]}
                >
                  {time} - {timeEndTime}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

// Calendar Modal with proper grid layout
const CalendarModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  onDateSelect: (date: string) => void;
}> = ({ visible, onClose, selectedDate, onDateSelect }) => {
  if (!visible) return null;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Generate calendar grid
  const calendarDays = [];

  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ day: null, dateString: null });
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateString = date.toISOString().split('T')[0];
    calendarDays.push({ day, dateString });
  }

  const monthName = firstDayOfMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.calendarOverlay}>
        <View style={styles.calendarContent}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.calendarCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>{monthName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.calendarDone}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {/* Week headers */}
            <View style={styles.weekHeaderRow}>
              {weekDays.map(day => (
                <View key={day} style={styles.weekHeaderCell}>
                  <Text style={styles.weekHeaderText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar days */}
            <View style={styles.daysGrid}>
              {calendarDays.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    item.dateString === selectedDate && styles.daySelected,
                    !item.day && styles.dayCellEmpty,
                  ]}
                  onPress={() => {
                    if (item.dateString) {
                      onDateSelect(item.dateString);
                      onClose();
                    }
                  }}
                  disabled={!item.day}
                >
                  {item.day && (
                    <Text
                      style={[
                        styles.dayText,
                        item.dateString === selectedDate &&
                          styles.dayTextSelected,
                      ]}
                    >
                      {item.day}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Emoji Picker using react-native-emoji-selector library
const EmojiPicker: React.FC<{
  visible: boolean;
  onClose: () => void;
  onEmojiSelected: (emoji: string) => void;
}> = ({ visible, onClose, onEmojiSelected }) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.emojiModalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.emojiModalContainer}
        >
          <View style={styles.emojiModalContent}>
            <View style={styles.emojiModalHeader}>
              <Text style={styles.emojiModalTitle}>Choose Emoji</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.emojiModalClose}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.emojiSelectorContainer}>
              <EmojiSelector
                onEmojiSelected={emoji => {
                  onEmojiSelected(emoji);
                  onClose();
                }}
                showTabs={true}
                showSearchBar={true}
                showSectionTitles={true}
                category={undefined}
                placeholder="Search emoji..."
                columns={8}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// Custom Checkbox Component
const Checkbox: React.FC<{
  checked: boolean;
  onPress: () => void;
  label: string;
}> = ({ checked, onPress, label }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <Text style={styles.checkboxIcon}>✓</Text>}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const RefinedCreateTaskScreen: React.FC<CreateTaskProps> = ({
  visible,
  onClose,
  onCreateTask,
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

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showRecurrenceDetails, setShowRecurrenceDetails] = useState(false);
  const titleRef = useRef<TextInput>(null);

  const alertOptions = [
    { id: 'start', label: 'At start of task' },
    { id: 'end', label: 'At end of task' },
    { id: '5min', label: '5 minutes before' },
    { id: '10min', label: '10 minutes before' },
    { id: '15min', label: '15 minutes before' },
    { id: '30min', label: '30 minutes before' },
    { id: '1hour', label: '1 hour before' },
  ];

  const addSubtask = () => {
    setFormData(prev => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        { id: Date.now().toString(), title: '', completed: false },
      ],
    }));
  };

  const updateSubtask = (id: string, newTitle: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(task =>
        task.id === id ? { ...task, title: newTitle } : task,
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

  // Animation values
  const translateY = useSharedValue(screenHeight);
  const opacity = useSharedValue(0);

  const showTray = () => {
    'worklet';
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
      mass: 1,
    });
  };

  const hideTray = (callback?: () => void) => {
    'worklet';
    translateY.value = withTiming(screenHeight, { duration: 300 });
    opacity.value = withTiming(0, { duration: 250 }, finished => {
      if (finished && callback) {
        runOnJS(callback)();
      }
    });
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      'worklet';
    },
    onActive: event => {
      'worklet';
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    },
    onEnd: event => {
      'worklet';
      const shouldDismiss =
        event.translationY > screenHeight * 0.25 || event.velocityY > 1000;

      if (shouldDismiss) {
        runOnJS(() => {
          hideTray(() => onClose());
        })();
      } else {
        translateY.value = withSpring(0);
      }
    },
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const trayStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (visible) {
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

      translateY.value = screenHeight;
      opacity.value = 0;

      setTimeout(() => {
        showTray();
        setTimeout(() => titleRef.current?.focus(), 600);
      }, 50);
    }
  }, [visible]);

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
      hideTray(() => onClose());
    } catch (error) {
      console.error('Task creation failed:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!visible) return null;

  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFillObject}>
      <Modal
        transparent
        visible={visible}
        animationType="none"
        statusBarTranslucent
      >
        <StatusBar backgroundColor="rgba(0,0,0,0.1)" barStyle="dark-content" />

        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => hideTray(() => onClose())}
            activeOpacity={1}
          />
        </Animated.View>

        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.trayContainer, trayStyle]}>
            <View style={styles.tray}>
              <View style={styles.dragHandle} />

              <View style={styles.header}>
                <Text style={styles.headerTitle}>New Task</Text>
              </View>

              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Emoji & Title */}
                <View style={styles.emojiTitleSection}>
                  <TouchableOpacity
                    style={styles.emojiButton}
                    onPress={() => setShowEmojiPicker(true)}
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

                {/* Shared Checkbox */}
                <View style={styles.section}>
                  <Checkbox
                    checked={formData.isShared}
                    onPress={() => updateField('isShared', !formData.isShared)}
                    label="Share with partner"
                  />
                </View>

                {/* When? */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>When?</Text>

                  <TimeSelector
                    selectedTime={formData.when.time}
                    onTimeChange={time =>
                      updateField('when', { ...formData.when, time })
                    }
                    durationMinutes={formData.durationMinutes}
                  />

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowCalendar(true)}
                  >
                    <Text style={styles.dateText}>
                      {formatDateDisplay(formData.when.date)}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Duration */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>How long?</Text>
                  <View style={styles.durationGrid}>
                    {[15, 30, 45, 60, 90, 120, 180, 240].map(duration => (
                      <TouchableOpacity
                        key={duration}
                        style={[
                          styles.durationButton,
                          formData.durationMinutes === duration &&
                            styles.durationButtonActive,
                        ]}
                        onPress={() => updateField('durationMinutes', duration)}
                      >
                        <Text
                          style={[
                            styles.durationButtonText,
                            formData.durationMinutes === duration &&
                              styles.durationButtonTextActive,
                          ]}
                        >
                          {duration < 60 ? `${duration}m` : `${duration / 60}h`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Recurrence */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recurrence</Text>
                  <View style={styles.recurrenceGrid}>
                    {(['none', 'daily', 'weekly', 'monthly'] as const).map(
                      freq => (
                        <TouchableOpacity
                          key={freq}
                          style={[
                            styles.recurrenceButton,
                            formData.recurrence.frequency === freq &&
                              styles.recurrenceButtonActive,
                          ]}
                          onPress={() => {
                            updateField('recurrence', {
                              ...formData.recurrence,
                              frequency: freq,
                            });
                            setShowRecurrenceDetails(freq !== 'none');
                          }}
                        >
                          <Text
                            style={[
                              styles.recurrenceButtonText,
                              formData.recurrence.frequency === freq &&
                                styles.recurrenceButtonTextActive,
                            ]}
                          >
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>

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
                  <View style={styles.alertGrid}>
                    {alertOptions.map(option => (
                      <Checkbox
                        key={option.id}
                        checked={formData.alerts.includes(option.id)}
                        onPress={() => toggleAlert(option.id)}
                        label={option.label}
                      />
                    ))}
                  </View>
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
                      <Text style={styles.subtasksTitle}>
                        Steps to complete:
                      </Text>
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
                          <TouchableOpacity
                            onPress={() => removeSubtask(task.id)}
                          >
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

                <View style={{ height: 120 }} />
              </ScrollView>

              {/* Floating Create Button */}
              <View style={styles.floatingCreateWrapper}>
                <TouchableOpacity
                  style={[
                    styles.floatingCreateButton,
                    !formData.title.trim() &&
                      styles.floatingCreateButtonDisabled,
                  ]}
                  onPress={handleCreate}
                  disabled={!formData.title.trim()}
                >
                  <Text style={styles.floatingCreateText}>Create Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>

        {/* Modals */}
        <EmojiPicker
          visible={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onEmojiSelected={emoji => updateField('emoji', emoji)}
        />

        <CalendarModal
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          selectedDate={formData.when.date}
          onDateSelect={date => updateField('when', { ...formData.when, date })}
        />
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  trayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
  },
  tray: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.dragHandle,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Emoji & Title Section
  emojiTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  titleInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.underline,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 16,
  },

  // Checkbox Component
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.checkboxInactive,
    backgroundColor: colors.white,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.checkboxActive,
    borderColor: colors.checkboxActive,
  },
  checkboxIcon: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },

  // Time Selector
  timeSelectorContainer: {
    alignItems: 'center',
  },
  timeListContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  timeItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timeItemSelected: {
    backgroundColor: colors.selectedTime,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.selectedTimeBorder,
    marginHorizontal: 20,
  },
  timeText: {
    fontSize: 18,
    color: colors.text,
  },
  timeTextSelected: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },

  // Date Button
  dateButton: {
    alignSelf: 'center',
    marginTop: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Duration Grid
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  durationButtonActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  durationButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  durationButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },

  // Recurrence Grid
  recurrenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recurrenceButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  recurrenceButtonActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  recurrenceButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  recurrenceButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  recurrenceDetails: {
    marginTop: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intervalButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intervalButtonActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  intervalButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  intervalButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  intervalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Alert Grid
  alertGrid: {
    gap: 8,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Subtasks
  subtasksSection: {
    marginTop: 16,
  },
  subtasksTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  subtaskNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
    minWidth: 20,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  removeSubtask: {
    fontSize: 18,
    color: colors.textTertiary,
    paddingHorizontal: 8,
  },
  addSubtaskButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.gray,
  },
  addSubtaskText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // Floating Create Button
  floatingCreateWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  floatingCreateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingCreateButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  floatingCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },

  // Emoji Modal
  emojiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  emojiModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  emojiModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  emojiModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emojiModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emojiModalClose: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  emojiSelectorContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Calendar Modal
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  calendarContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  calendarCancel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  calendarDone: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  calendarGrid: {
    padding: 20,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayCellEmpty: {
    backgroundColor: 'transparent',
  },
  daySelected: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: colors.text,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default RefinedCreateTaskScreen;
