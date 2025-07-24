import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Clean minimal color palette
const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#F0F0F0',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#CCCCCC',
  accentPrimary: '#FF6B9D',
  accentSecondary: '#6B73FF',
  accentWarning: '#FF6B6B',
  accentSuccess: '#4CAF50',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.4)',
};

interface TaskForm {
  title: string;
  description: string;
  emoji: string;
  time: string;
  endTime: string;
  when: string; // Date selection
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  alerts: string[]; // Array of alert types
  category: string;
  priority: 'low' | 'medium' | 'high';
  isShared: boolean;
}

interface CreateTaskTrayProps {
  visible: boolean;
  onClose: () => void;
  onCreateTask: (task: TaskForm) => void;
}

const CreateTaskTray: React.FC<CreateTaskTrayProps> = ({ visible, onClose, onCreateTask }) => {
  const [formData, setFormData] = useState<TaskForm>({
    title: '',
    description: '',
    emoji: '✨',
    time: '',
    endTime: '',
    when: new Date().toISOString().split('T')[0],
    frequency: 'once',
    alerts: [],
    category: 'Personal',
    priority: 'medium',
    isShared: false,
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const previewOpacity = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(1)).current;
  const titleUnderlineWidth = useRef(new Animated.Value(0)).current;
  const createButtonScale = useRef(new Animated.Value(0)).current;
  const sharedMessageOpacity = useRef(new Animated.Value(0)).current;

  const emojiOptions = [
    '✨', '💪', '🛒', '📚', '🍽️', '💼', '🏃', '🧘',
    '🎯', '🌱', '🎨', '🎵', '📝', '💡', '🏠', '❤️',
    '🌟', '🔥', '💖', '🎉', '🚀', '⚡', '🌈', '🦋'
  ];

  const timeOptions = [
    { label: '08:00', value: '08:00' },
    { label: '08:30', value: '08:30' },
    { label: '09:00', value: '09:00', featured: true },
    { label: '08:45', value: '08:45' },
    { label: '10:45', value: '10:45' },
    { label: '11:00', value: '11:00' },
    { label: '11:15', value: '11:15' },
  ];
  
  const endTimeOptions = [
    { label: '09:30', value: '09:30' },
    { label: '10:00', value: '10:00' },
    { label: '10:30', value: '10:30', featured: true },
    { label: '11:00', value: '11:00' },
    { label: '11:30', value: '11:30' },
    { label: '12:00', value: '12:00' },
  ];
  
  const categoryOptions = ['Personal', 'Work', 'Health', 'Learning', 'Home', 'Social', 'Creative'];
  
  const frequencyOptions = [
    { key: 'once', label: 'Once', icon: '1️⃣' },
    { key: 'daily', label: 'Daily', icon: '📅' },
    { key: 'weekly', label: 'Weekly', icon: '📆' },
    { key: 'monthly', label: 'Monthly', icon: '🗓️' },
  ];
  
  const alertOptions = [
    { key: 'start', label: 'At start of task', icon: '🔔' },
    { key: 'end', label: 'At end of task', icon: '⏰' },
    { key: 'before', label: '5 min before start', icon: '⚡' },
  ];
  const priorityOptions = [
    { key: 'low', label: 'Low', color: colors.accentSuccess },
    { key: 'medium', label: 'Medium', color: colors.accentPrimary },
    { key: 'high', label: 'High', color: colors.accentWarning },
  ];

  // Pan gesture for swipe to dismiss
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 10 && Math.abs(gestureState.dx) < 100;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150) {
        handleClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    },
  });

  // Show/hide animations
  useEffect(() => {
    if (visible) {
      // Reset form when opening
      setFormData({
        title: '',
        description: '',
        emoji: '✨',
        time: '',
        endTime: '',
        when: new Date().toISOString().split('T')[0],
        frequency: 'once',
        alerts: [],
        category: 'Personal',
        priority: 'medium',
        isShared: false,
      });

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start(() => {
        // Show preview after tray appears
        Animated.timing(previewOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [visible]);

  // Watch for title changes
  useEffect(() => {
    const hasTitle = formData.title.trim().length > 0;
    
    Animated.timing(createButtonScale, {
      toValue: hasTitle ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [formData.title]);

  // Watch for shared toggle
  useEffect(() => {
    Animated.timing(sharedMessageOpacity, {
      toValue: formData.isShared ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [formData.isShared]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleCreateTask = () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title');
      return;
    }

    onCreateTask(formData);
    handleClose();
  };

  const updateField = (field: keyof TaskForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Animate emoji selection
    if (field === 'emoji') {
      Animated.sequence([
        Animated.spring(emojiScale, {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
        Animated.spring(emojiScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    }
  };

  const toggleAlert = (alertKey: string) => {
    setFormData(prev => ({
      ...prev,
      alerts: prev.alerts.includes(alertKey)
        ? prev.alerts.filter(a => a !== alertKey)
        : [...prev.alerts, alertKey]
    }));
  };

  const handleTitleFocus = () => {
    setTitleFocused(true);
    Animated.timing(titleUnderlineWidth, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleTitleBlur = () => {
    setTitleFocused(false);
    if (!formData.title) {
      Animated.timing(titleUnderlineWidth, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };


  // Animated Toggle Switch
  const AnimatedToggle = () => {
    const toggleAnim = useRef(new Animated.Value(formData.isShared ? 1 : 0)).current;
    
    useEffect(() => {
      Animated.timing(toggleAnim, {
        toValue: formData.isShared ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [formData.isShared]);

    const backgroundColor = toggleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.border, colors.accentPrimary],
    });

    const translateX = toggleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 22],
    });

    return (
      <TouchableOpacity
        style={styles.toggleContainer}
        onPress={() => updateField('isShared', !formData.isShared)}
        activeOpacity={0.8}
      >
        <Text style={styles.toggleIcon}>🤝</Text>
        <View style={styles.toggleText}>
          <Text style={styles.toggleTitle}>Shared Goal</Text>
          <Text style={styles.toggleSubtitle}>Work together</Text>
        </View>
        <Animated.View style={[styles.toggleTrack, { backgroundColor }]}>
          <Animated.View 
            style={[styles.toggleThumb, { transform: [{ translateX }] }]}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Emoji Picker Modal
  const EmojiPicker = () => (
    <Modal visible={showEmojiPicker} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={() => setShowEmojiPicker(false)}>
        <View style={styles.emojiModalOverlay}>
          <View style={styles.emojiModalContent}>
            <View style={styles.emojiModalHeader}>
              <Text style={styles.emojiModalTitle}>Choose Emoji</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <Text style={styles.emojiModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.emojiGrid}>
              {emojiOptions.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.emojiOption,
                    formData.emoji === emoji && styles.emojiOptionSelected
                  ]}
                  onPress={() => {
                    updateField('emoji', emoji);
                    setShowEmojiPicker(false);
                  }}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View 
            style={[styles.backdrop, { opacity: backdropOpacity }]} 
          />
        </TouchableWithoutFeedback>

        {/* Tray */}
        <Animated.View 
          style={[
            styles.tray,
            { transform: [{ translateY: slideAnim }] }
          ]}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create New Task</Text>
            <Text style={styles.headerSubtitle}>What would you like to accomplish?</Text>
          </View>

          

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Title Input */}
            <View style={styles.inputSection}>
              <TextInput
                style={styles.titleInput}
                placeholder="What needs to be done?"
                value={formData.title}
                onChangeText={(text) => updateField('title', text)}
                onFocus={handleTitleFocus}
                onBlur={handleTitleBlur}
                placeholderTextColor={colors.textTertiary}
                multiline
              />
              <Animated.View 
                style={[
                  styles.titleUnderline,
                  {
                    width: titleUnderlineWidth.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    })
                  }
                ]} 
              />
            </View>

            {/* Description Input */}
            <TouchableOpacity 
              style={styles.descriptionSection}
              onPress={() => setDescriptionExpanded(true)}
            >
              {descriptionExpanded ? (
                <TextInput
                  style={styles.descriptionInput}
                  placeholder="Add some details..."
                  value={formData.description}
                  onChangeText={(text) => updateField('description', text)}
                  onBlur={() => !formData.description && setDescriptionExpanded(false)}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  autoFocus
                />
              ) : (
                <Text style={styles.descriptionPlaceholder}>
                  {formData.description || 'Add details...'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Emoji Selection */}
            <TouchableOpacity 
              style={styles.section}
              onPress={() => setShowEmojiPicker(true)}
            >
              <Text style={styles.sectionIcon}>{formData.emoji}</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>Emoji</Text>
                <Text style={styles.sectionSubtitle}>Tap to change</Text>
              </View>
            </TouchableOpacity>

            {/* Time Selection - Visual Timeline */}
            <View style={styles.section}>
              <Text style={styles.sectionIcon}>⏰</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>When?</Text>
                
                {/* Start Time */}
                <Text style={styles.subSectionTitle}>Start Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.timelineContainer}>
                    {timeOptions.map((timeOption, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.timeSlot,
                          formData.time === timeOption.value && styles.timeSlotSelected,
                          timeOption.featured && styles.timeSlotFeatured,
                        ]}
                        onPress={() => updateField('time', timeOption.value)}
                      >
                        <Text style={[
                          styles.timeSlotText,
                          formData.time === timeOption.value && styles.timeSlotTextSelected,
                          timeOption.featured && styles.timeSlotTextFeatured,
                        ]}>
                          {timeOption.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* End Time */}
                <Text style={styles.subSectionTitle}>End Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.timelineContainer}>
                    {endTimeOptions.map((timeOption, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.timeSlot,
                          formData.endTime === timeOption.value && styles.timeSlotSelected,
                          timeOption.featured && styles.timeSlotFeatured,
                        ]}
                        onPress={() => updateField('endTime', timeOption.value)}
                      >
                        <Text style={[
                          styles.timeSlotText,
                          formData.endTime === timeOption.value && styles.timeSlotTextSelected,
                          timeOption.featured && styles.timeSlotTextFeatured,
                        ]}>
                          {timeOption.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* Date Selection */}
                <Text style={styles.subSectionTitle}>Date</Text>
                <TouchableOpacity 
                  style={styles.dateSelector}
                  onPress={() => {
                    // You could add a date picker modal here
                    Alert.alert('Date Picker', 'Add a date picker component here');
                  }}
                >
                  <Text style={styles.dateSelectorIcon}>📅</Text>
                  <Text style={styles.dateSelectorText}>
                    {new Date(formData.when).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* How Often */}
            <View style={styles.section}>
              <Text style={styles.sectionIcon}>🔄</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>How Often?</Text>
                <View style={styles.frequencyContainer}>
                  {frequencyOptions.map((freq) => (
                    <TouchableOpacity
                      key={freq.key}
                      style={[
                        styles.frequencyOption,
                        formData.frequency === freq.key && styles.frequencyOptionSelected
                      ]}
                      onPress={() => updateField('frequency', freq.key)}
                    >
                      <Text style={styles.frequencyIcon}>{freq.icon}</Text>
                      <Text style={[
                        styles.frequencyText,
                        formData.frequency === freq.key && styles.frequencyTextSelected
                      ]}>
                        {freq.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Alerts/Nudges */}
            <View style={styles.section}>
              <Text style={styles.sectionIcon}>🔔</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>Need Alerts? (Nudge)</Text>
                <View style={styles.alertsContainer}>
                  {alertOptions.map((alert) => (
                    <TouchableOpacity
                      key={alert.key}
                      style={[
                        styles.alertOption,
                        formData.alerts.includes(alert.key) && styles.alertOptionSelected
                      ]}
                      onPress={() => toggleAlert(alert.key)}
                    >
                      <Text style={styles.alertIcon}>{alert.icon}</Text>
                      <Text style={[
                        styles.alertText,
                        formData.alerts.includes(alert.key) && styles.alertTextSelected
                      ]}>
                        {alert.label}
                      </Text>
                      {formData.alerts.includes(alert.key) && (
                        <Text style={styles.alertCheck}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionIcon}>📁</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {categoryOptions.map((category, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.chip,
                          formData.category === category && styles.chipSelected
                        ]}
                        onPress={() => updateField('category', category)}
                      >
                        <Text style={[
                          styles.chipText,
                          formData.category === category && styles.chipTextSelected
                        ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* Priority Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionIcon}>🎯</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>Priority</Text>
                <View style={styles.priorityContainer}>
                  {priorityOptions.map((priority) => (
                    <TouchableOpacity
                      key={priority.key}
                      style={[
                        styles.priorityOption,
                        formData.priority === priority.key && {
                          backgroundColor: priority.color + '20',
                          borderColor: priority.color,
                        }
                      ]}
                      onPress={() => updateField('priority', priority.key)}
                    >
                      <Text style={[
                        styles.priorityText,
                        formData.priority === priority.key && { color: priority.color }
                      ]}>
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Shared Toggle */}
            <AnimatedToggle />

            {/* Shared Message */}
            <Animated.View 
              style={[
                styles.sharedMessage,
                { opacity: sharedMessageOpacity }
              ]}
            >
              <Text style={styles.sharedMessageText}>
                🎉 You can cheer each other on!
              </Text>
            </Animated.View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Create Button */}
          <Animated.View 
            style={[
              styles.createButtonContainer,
              { transform: [{ scale: createButtonScale }] }
            ]}
          >
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateTask}
              activeOpacity={0.9}
            >
              <Text style={styles.createButtonText}>Create Task ✨</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <EmojiPicker />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  tray: {
    position: 'absolute',
    bottom: 30, // Lift it off the bottom
    left: screenWidth * 0.025, // 5% margin on left
    right: screenWidth * 0.025, // 5% margin on right
    width: screenWidth * 0.95, // 90% of screen width
    backgroundColor: colors.surface,
    borderRadius: 24, // Round all corners now
    maxHeight: screenHeight * 0.8, // Slightly shorter
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 }, // Stronger shadow since it's floating
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 25,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  preview: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background,
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentPrimary,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewEmoji: {
    fontSize: 24,
  },
  previewText: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  previewTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  previewWhen: {
    fontSize: 12,
    color: colors.accentPrimary,
    marginTop: 2,
  },
  previewFrequency: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  previewSharedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentPrimary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewSharedIcon: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textPrimary,
    paddingVertical: 12,
    paddingBottom: 8,
    minHeight: 40,
  },
  titleUnderline: {
    height: 2,
    backgroundColor: colors.accentPrimary,
    borderRadius: 1,
  },
  descriptionSection: {
    marginBottom: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
  descriptionInput: {
    fontSize: 16,
    color: colors.textSecondary,
    paddingVertical: 8,
    minHeight: 60,
  },
  descriptionPlaceholder: {
    fontSize: 16,
    color: colors.textTertiary,
    paddingVertical: 12,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 16,
  },
  sectionIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.white,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 16,
  },
  toggleIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sharedMessage: {
    backgroundColor: colors.accentPrimary + '10',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  sharedMessageText: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  createButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  createButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  emojiModalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  emojiModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  emojiModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emojiModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emojiModalClose: {
    fontSize: 18,
    color: colors.textSecondary,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  emojiOption: {
    width: (screenWidth - 48 - 60) / 6,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiOptionSelected: {
    backgroundColor: colors.accentPrimary + '20',
    borderColor: colors.accentPrimary,
  },
  emojiText: {
    fontSize: 24,
  },
  
  // Timeline/When Section Styles
  timelineContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  timeSlot: {
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 70,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  timeSlotFeatured: {
    backgroundColor: '#FFD93D',
    borderColor: '#FFD93D',
    transform: [{ scale: 1.05 }],
    shadowColor: '#FFD93D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  timeSlotTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  timeSlotTextFeatured: {
    color: colors.white,
    fontWeight: '600',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  dateSelectorIcon: {
    fontSize: 20,
  },
  dateSelectorText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  
  // Frequency Section Styles
  frequencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyOption: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  frequencyOptionSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  frequencyIcon: {
    fontSize: 20,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  frequencyTextSelected: {
    color: colors.white,
  },
  
  // Alerts Section Styles
  alertsContainer: {
    gap: 8,
  },
  alertOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  alertOptionSelected: {
    backgroundColor: colors.accentPrimary + '20',
    borderColor: colors.accentPrimary,
  },
  alertIcon: {
    fontSize: 20,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  alertTextSelected: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  alertCheck: {
    fontSize: 16,
    color: colors.accentPrimary,
    fontWeight: 'bold',
  },
});

// Usage Example Component
const ExampleUsage: React.FC = () => {
  const [showCreateTray, setShowCreateTray] = useState(false);

  const handleCreateTask = (task: TaskForm) => {
    console.log('Created task:', task);
    Alert.alert('Task Created!', `"${task.title}" has been added to your timeline`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Your existing screen content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: colors.textPrimary, marginBottom: 20 }}>
          Your Timeline/Calendar/Profile Screen
        </Text>
        
        <TouchableOpacity
          style={{
            backgroundColor: colors.accentPrimary,
            borderRadius: 12,
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
          onPress={() => setShowCreateTray(true)}
        >
          <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>
            Create Task
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating Create Task Tray */}
      <CreateTaskTray
        visible={showCreateTray}
        onClose={() => setShowCreateTray(false)}
        onCreateTask={handleCreateTask}
      />
    </View>
  );
};

export default CreateTaskTray;
export { ExampleUsage };