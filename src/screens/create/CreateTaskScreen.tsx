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
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Clean color palette matching your timeline
const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  parchment: '#F7F3E9',
  border: '#F0F0F0',
  primary: '#FF6B9D',
  secondary: '#6B73FF',
  success: '#4CAF50',
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  white: '#FFFFFF',
  black: '#000000',
  dragHandle: '#CCCCCC',
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

// Date Picker Component (simplified for demo)
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

  const times = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  if (!visible) return null;

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

          <ScrollView style={styles.timeSection}>
            <Text style={styles.sectionTitle}>Quick Times</Text>
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
  const titleRef = useRef<TextInput>(null);

  // Reanimated values - Initialize properly
  const translateY = useSharedValue(screenHeight);
  const opacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const repeatOptions = [
    { label: 'None', value: 'none' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  // Animation functions
  const showTray = () => {
    'worklet';
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
      mass: 1,
    });
    contentOpacity.value = withTiming(1, { duration: 400 });
  };

  const hideTray = (callback?: () => void) => {
    'worklet';
    contentOpacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(screenHeight, { 
      duration: 300,
    });
    opacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished && callback) {
        runOnJS(callback)();
      }
    });
  };

  // Gesture handler - Fixed worklet annotations
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      'worklet';
      // Store initial position
    },
    onActive: (event) => {
      'worklet';
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        // Fade out content as user drags down
        const progress = interpolate(
          event.translationY,
          [0, screenHeight * 0.3],
          [1, 0],
          Extrapolate.CLAMP
        );
        contentOpacity.value = progress;
      }
    },
    onEnd: (event) => {
      'worklet';
      const shouldDismiss = event.translationY > screenHeight * 0.25 || event.velocityY > 1000;
      
      if (shouldDismiss) {
        runOnJS(() => {
          hideTray(() => onClose());
        })();
      } else {
        // Snap back
        translateY.value = withSpring(0);
        contentOpacity.value = withTiming(1);
      }
    },
  });

  // Animated styles - Fixed worklet annotations
  const backdropStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: opacity.value,
    };
  });

  const trayStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: contentOpacity.value,
    };
  });

  // Effects
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

      // Start from bottom and animate up
      translateY.value = screenHeight;
      opacity.value = 0;
      contentOpacity.value = 0;
      
      // Trigger animations
      setTimeout(() => {
        showTray();
        setTimeout(() => titleRef.current?.focus(), 600);
      }, 50);
    } else {
      // Reset to hidden position
      translateY.value = screenHeight;
      opacity.value = 0;
      contentOpacity.value = 0;
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
      hideTray(() => onClose());
    } catch (error) {
      console.error('Task creation failed:', error);
    }
  };

  const handleBackdropPress = () => {
    hideTray(() => onClose());
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
    <GestureHandlerRootView style={StyleSheet.absoluteFillObject}>
      <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
        <StatusBar backgroundColor="rgba(0,0,0,0.4)" barStyle="light-content" />
        
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject} 
            onPress={handleBackdropPress}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Tray */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.trayContainer, trayStyle]}>
            <View style={styles.tray}>
              {/* Drag Handle */}
              <View style={styles.dragHandle} />

              {/* Header */}
              <Animated.View style={[styles.header, contentStyle]}>
                <TouchableOpacity onPress={() => hideTray(() => onClose())}>
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
              </Animated.View>

              {/* Content */}
              <Animated.View style={[styles.content, contentStyle]}>
                <KeyboardAvoidingView 
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.keyboardView}
                >
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
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
                  </ScrollView>
                </KeyboardAvoidingView>
              </Animated.View>
            </View>
          </Animated.View>
        </PanGestureHandler>

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
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
    backgroundColor: colors.parchment,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: colors.dragHandle,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
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
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.background,
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
    maxHeight: '70%',
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