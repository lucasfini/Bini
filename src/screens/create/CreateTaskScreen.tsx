import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  PanResponder,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Clean color palette matching your timeline
const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#F0F0F0',
  primary: '#FF6B9D',
  secondary: '#6B73FF',
  success: '#4CAF50',
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  white: '#FFFFFF',
  black: '#000000',
};

interface TaskFormData {
  title: string;
  description?: string;
  emoji?: string;
  dueDate?: Date;
  dueTime?: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  tags: string[];
  isShared: boolean;
  isGroupTask: boolean;
  groupId?: string;
  reward?: string;
}

interface CreateTaskProps {
  visible: boolean;
  onClose: () => void;
  onCreateTask: (task: TaskFormData) => void;
}

// Emoji Picker Component
const EmojiPicker: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  selectedEmoji?: string;
}> = ({ visible, onClose, onSelect, selectedEmoji }) => {
  const emojis = [
    '✨', '💪', '🎯', '📚', '🏃‍♂️', '🧘‍♀️', '💼', '🎨',
    '🍽️', '🛒', '🏠', '💡', '🌟', '🔥', '💖', '🎉',
    '🚀', '⚡', '🌈', '🦋', '🎵', '📝', '❤️', '🌱',
    '🎪', '🎭', '🎨', '🎲', '🎸', '🎺', '🎼', '🎤',
    '☕', '🍕', '🍎', '🥗', '🍔', '🌮', '🍜', '🍰',
    '🚗', '🚲', '✈️', '🚂', '🏖️', '🏔️', '🌊', '🌸'
  ];

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.emojiModalOverlay}>
        <View style={styles.emojiModalContent}>
          <View style={styles.emojiModalHeader}>
            <Text style={styles.emojiModalTitle}>Choose Emoji</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.emojiModalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.emojiGrid}>
            {emojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emojiOption,
                  selectedEmoji === emoji && styles.emojiOptionSelected
                ]}
                onPress={() => {
                  onSelect(emoji);
                  onClose();
                }}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Date Picker Component
const DateTimePicker: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
}> = ({ visible, onClose, onSelectDate, onSelectTime, selectedDate, selectedTime }) => {
  const [activeDate, setActiveDate] = useState(selectedDate || new Date());
  const [activeTime, setActiveTime] = useState(selectedTime || '');

  if (!visible) return null;

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = activeDate.getMonth();
    const currentYear = activeDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        date,
        isCurrentMonth: date.getMonth() === currentMonth,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: activeDate.toDateString() === date.toDateString(),
      });
    }
    return days;
  };

  const times = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.datePickerOverlay}>
        <View style={styles.datePickerContent}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.datePickerCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.datePickerTitle}>Select Date & Time</Text>
            <TouchableOpacity onPress={() => {
              onSelectDate(activeDate);
              if (activeTime) onSelectTime(activeTime);
              onClose();
            }}>
              <Text style={styles.datePickerDone}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {/* Calendar */}
            <View style={styles.calendarSection}>
              <Text style={styles.sectionTitle}>Date</Text>
              <View style={styles.calendarGrid}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <Text key={day} style={styles.calendarHeader}>{day}</Text>
                ))}
                {generateCalendarDays().map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      !day.isCurrentMonth && styles.calendarDayInactive,
                      day.isToday && styles.calendarDayToday,
                      day.isSelected && styles.calendarDaySelected,
                    ]}
                    onPress={() => setActiveDate(day.date)}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      !day.isCurrentMonth && styles.calendarDayTextInactive,
                      day.isToday && styles.calendarDayTextToday,
                      day.isSelected && styles.calendarDayTextSelected,
                    ]}>
                      {day.date.getDate()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time */}
            <View style={styles.timeSection}>
              <Text style={styles.sectionTitle}>Time (Optional)</Text>
              <View style={styles.timeGrid}>
                {times.map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      activeTime === time && styles.timeOptionSelected
                    ]}
                    onPress={() => setActiveTime(activeTime === time ? '' : time)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      activeTime === time && styles.timeOptionTextSelected
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const CreateTaskScreen: React.FC<CreateTaskProps> = ({
  visible,
  onClose,
  onCreateTask,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    emoji: '✨',
    dueDate: undefined,
    dueTime: undefined,
    repeat: 'none',
    tags: [],
    isShared: false,
    isGroupTask: false,
    reward: '',
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newTag, setNewTag] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const titleRef = useRef<TextInput>(null);

  const repeatOptions = [
    { label: 'None', value: 'none' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  useEffect(() => {
    if (visible) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        emoji: '✨',
        dueDate: undefined,
        dueTime: undefined,
        repeat: 'none',
        tags: [],
        isShared: false,
        isGroupTask: false,
        reward: '',
      });

      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => titleRef.current?.focus(), 100);
      });
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const updateField = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateField('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    updateField('tags', formData.tags.filter(t => t !== tag));
  };

  const handleCreateTask = async () => {
    if (!formData.title.trim()) return;

    try {
      await onCreateTask(formData);
      onClose();
    } catch (error) {
      console.error('Task creation failed:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: slideAnim }]}>
        <Animated.View
          style={[
            styles.floatingCard,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Task</Text>
            <TouchableOpacity 
              onPress={handleCreateTask}
              disabled={!formData.title.trim()}
            >
              <Text style={[
                styles.doneButton,
                !formData.title.trim() && styles.doneButtonDisabled
              ]}>
                Create
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              {/* Task Title */}
              <View style={styles.inputSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>📝</Text>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Task Title *</Text>
                    <TextInput
                      ref={titleRef}
                      style={styles.textInput}
                      value={formData.title}
                      onChangeText={(text) => updateField('title', text)}
                      placeholder="What needs to be done?"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </View>
              </View>

              {/* Emoji Picker */}
              <View style={styles.inputSection}>
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => setShowEmojiPicker(true)}
                >
                  <Text style={styles.inputIcon}>🎨</Text>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Icon</Text>
                    <View style={styles.emojiDisplay}>
                      <Text style={styles.selectedEmoji}>{formData.emoji}</Text>
                      <Text style={styles.tapToChange}>Tap to change</Text>
                    </View>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Due Date & Time */}
              <View style={styles.inputSection}>
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.inputIcon}>📅</Text>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Due Date & Time</Text>
                    <Text style={styles.inputValue}>
                      {formData.dueDate ? 
                        `${formatDate(formData.dueDate)}${formData.dueTime ? ` at ${formData.dueTime}` : ''}` : 
                        'Select date'
                      }
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Repeat */}
              <View style={styles.inputSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🔄</Text>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Repeat</Text>
                    <View style={styles.segmentedControl}>
                      {repeatOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.segment,
                            formData.repeat === option.value && styles.segmentActive
                          ]}
                          onPress={() => updateField('repeat', option.value as any)}
                        >
                          <Text style={[
                            styles.segmentText,
                            formData.repeat === option.value && styles.segmentTextActive
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.inputSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🏷️</Text>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Tags</Text>
                    <View style={styles.tagsContainer}>
                      {formData.tags.map((tag, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.tag}
                          onPress={() => removeTag(tag)}
                        >
                          <Text style={styles.tagText}>{tag}</Text>
                          <Text style={styles.tagRemove}>×</Text>
                        </TouchableOpacity>
                      ))}
                      <View style={styles.addTagContainer}>
                        <TextInput
                          style={styles.addTagInput}
                          value={newTag}
                          onChangeText={setNewTag}
                          placeholder="Add tag"
                          placeholderTextColor={colors.textTertiary}
                          onSubmitEditing={addTag}
                          returnKeyType="done"
                        />
                        <TouchableOpacity onPress={addTag} style={styles.addTagButton}>
                          <Text style={styles.addTagButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Shared Goal */}
              <View style={styles.inputSection}>
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => updateField('isShared', !formData.isShared)}
                >
                  <Text style={styles.inputIcon}>🤝</Text>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Shared Goal</Text>
                    <Text style={styles.inputSubtitle}>Work on this together</Text>
                  </View>
                  <View style={[
                    styles.toggle,
                    formData.isShared && styles.toggleActive
                  ]}>
                    <View style={[
                      styles.toggleThumb,
                      formData.isShared && styles.toggleThumbActive
                    ]} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Group Task */}
              <View style={styles.inputSection}>
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => updateField('isGroupTask', !formData.isGroupTask)}
                >
                  <Text style={styles.inputIcon}>👥</Text>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Group Task</Text>
                    <Text style={styles.inputSubtitle}>Link to group rewards</Text>
                  </View>
                  <View style={[
                    styles.toggle,
                    formData.isGroupTask && styles.toggleActive
                  ]}>
                    <View style={[
                      styles.toggleThumb,
                      formData.isGroupTask && styles.toggleThumbActive
                    ]} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Reward */}
              <View style={styles.inputSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🎁</Text>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Reward (Optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.reward}
                      onChangeText={(text) => updateField('reward', text)}
                      placeholder="e.g., Movie night, treat yourself"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.inputSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>📋</Text>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Description (Optional)</Text>
                    <TextInput
                      style={[styles.textInput, styles.textInputMultiline]}
                      value={formData.description}
                      onChangeText={(text) => updateField('description', text)}
                      placeholder="Add any notes or details..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
              </View>

              <View style={{ height: 50 }} />
            </KeyboardAvoidingView>
          </ScrollView>

          {/* Modals */}
          <EmojiPicker
            visible={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onSelect={(emoji) => updateField('emoji', emoji)}
            selectedEmoji={formData.emoji}
          />

          <DateTimePicker
            visible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            onSelectDate={(date) => updateField('dueDate', date)}
            onSelectTime={(time) => updateField('dueTime', time)}
            selectedDate={formData.dueDate}
            selectedTime={formData.dueTime}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  floatingCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    width: '100%',
    height: '85%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  doneButtonDisabled: {
    color: colors.textTertiary,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  inputIcon: {
    fontSize: 20,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  inputSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  textInputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  chevron: {
    fontSize: 18,
    color: colors.textTertiary,
  },
  
  // Emoji Display
  emojiDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedEmoji: {
    fontSize: 24,
  },
  tapToChange: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginTop: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: colors.white,
    fontWeight: '600',
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  tagRemove: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  addTagInput: {
    fontSize: 14,
    color: colors.text,
    minWidth: 80,
  },
  addTagButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },

  // Toggle
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },

  // Emoji Modal
  emojiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emojiModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: '100%',
    maxHeight: '70%',
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
    fontSize: 18,
    color: colors.textSecondary,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  emojiOption: {
    width: (screenWidth - 104) / 6,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiOptionSelected: {
    backgroundColor: colors.primary + '20',
  },
  emojiText: {
    fontSize: 24,
  },

  // Date Picker Modal
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  datePickerContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  datePickerCancel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  
  // Calendar Section
  calendarSection: {
    padding: 20,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 8,
  },
  calendarDayInactive: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: colors.secondary + '20',
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
  },
  calendarDayText: {
    fontSize: 16,
    color: colors.text,
  },
  calendarDayTextInactive: {
    color: colors.textTertiary,
  },
  calendarDayTextToday: {
    color: colors.secondary,
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },

  // Time Section
  timeSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeOptionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  timeOptionTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default CreateTaskScreen;