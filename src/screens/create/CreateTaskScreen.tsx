// src/screens/create/ModernCreateTaskScreen.tsx
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
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Clean modern color palette
const colors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  primary: '#6366F1',
  primaryLight: '#A5B4FC',
  primaryDark: '#4338CA',
  secondary: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  text: '#1F2937',
  textLight: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  white: '#FFFFFF',
  black: '#000000',
};

interface TaskFormData {
  title: string;
  description?: string;
  emoji?: string;
  time?: string;
  endTime?: string;
  when: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  alerts: string[];
  category: string;
  priority: 'low' | 'medium' | 'high';
  isShared: boolean;
}

interface ModernCreateTaskProps {
  visible: boolean;
  onClose: () => void;
  onCreateTask: (task: TaskFormData) => void;
}

const ModernCreateTaskScreen: React.FC<ModernCreateTaskProps> = ({
  visible,
  onClose,
  onCreateTask,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
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

  const [currentStep, setCurrentStep] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    { id: 0, title: 'What?', subtitle: 'What do you want to do?' },
    { id: 1, title: 'When?', subtitle: 'When will you do it?' },
    { id: 2, title: 'Details', subtitle: 'Final touches' },
  ];

  const quickTimes = [
    { label: 'Morning', value: '09:00', icon: '🌅' },
    { label: 'Afternoon', value: '14:00', icon: '☀️' },
    { label: 'Evening', value: '18:00', icon: '🌅' },
    { label: 'Night', value: '21:00', icon: '🌙' },
  ];

  const quickDates = [
    { label: 'Today', value: new Date().toISOString().split('T')[0], icon: '📅' },
    { 
      label: 'Tomorrow', 
      value: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
      icon: '📆' 
    },
    { 
      label: 'This Weekend', 
      value: getWeekendDate(), 
      icon: '🏖️' 
    },
  ];

  const categories = [
    { name: 'Personal', icon: '👤', color: colors.primary },
    { name: 'Work', icon: '💼', color: colors.secondary },
    { name: 'Health', icon: '💪', color: colors.success },
    { name: 'Learning', icon: '📚', color: colors.warning },
    { name: 'Home', icon: '🏠', color: colors.error },
    { name: 'Social', icon: '👥', color: colors.primaryLight },
  ];

  const priorities = [
    { key: 'low', label: 'Low', color: colors.gray400, icon: '⬇️' },
    { key: 'medium', label: 'Medium', color: colors.warning, icon: '➡️' },
    { key: 'high', label: 'High', color: colors.error, icon: '⬆️' },
  ];

  const emojiOptions = [
    '✨', '💪', '🎯', '📚', '🏃‍♂️', '🧘‍♀️', '💼', '🎨',
    '🍽️', '🛒', '🏠', '💡', '🌟', '🔥', '💖', '🎉',
    '🚀', '⚡', '🌈', '🦋', '🎵', '📝', '❤️', '🌱'
  ];

  function getWeekendDate() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek) % 7;
    const saturday = new Date(today.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000);
    return saturday.toISOString().split('T')[0];
  }

  useEffect(() => {
    if (visible) {
      // Reset form and step
      setCurrentStep(0);
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

      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    // Update progress bar
    Animated.timing(progressAnim, {
      toValue: currentStep / (steps.length - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const updateField = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateTask = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title');
      return;
    }

    try {
      await onCreateTask(formData);
      onClose();
    } catch (error) {
      console.error('Task creation failed:', error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.title.trim().length > 0;
      case 1:
        return formData.when.length > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const renderStep0 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What do you want to accomplish?</Text>
      
      {/* Title Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Task Title</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="e.g., Morning workout, Buy groceries..."
          placeholderTextColor={colors.textMuted}
          value={formData.title}
          onChangeText={(text) => updateField('title', text)}
          autoFocus
          multiline
        />
      </View>

      {/* Emoji Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Choose an Emoji</Text>
        <TouchableOpacity 
          style={styles.emojiSelector}
          onPress={() => setShowEmojiPicker(true)}
        >
          <Text style={styles.selectedEmoji}>{formData.emoji}</Text>
          <Text style={styles.emojiSelectorText}>Tap to change</Text>
        </TouchableOpacity>
      </View>

      {/* Category Quick Select */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryChip,
                  { borderColor: category.color },
                  formData.category === category.name && {
                    backgroundColor: category.color,
                  }
                ]}
                onPress={() => updateField('category', category.name)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  formData.category === category.name && styles.categoryTextSelected
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>When will you do this?</Text>
      
      {/* Quick Date Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Day</Text>
        <View style={styles.quickSelectContainer}>
          {quickDates.map((dateOption) => (
            <TouchableOpacity
              key={dateOption.label}
              style={[
                styles.quickSelectChip,
                formData.when === dateOption.value && styles.quickSelectChipSelected
              ]}
              onPress={() => updateField('when', dateOption.value)}
            >
              <Text style={styles.quickSelectIcon}>{dateOption.icon}</Text>
              <Text style={[
                styles.quickSelectText,
                formData.when === dateOption.value && styles.quickSelectTextSelected
              ]}>
                {dateOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Time Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Time (Optional)</Text>
        <View style={styles.quickSelectContainer}>
          {quickTimes.map((timeOption) => (
            <TouchableOpacity
              key={timeOption.label}
              style={[
                styles.quickSelectChip,
                formData.time === timeOption.value && styles.quickSelectChipSelected
              ]}
              onPress={() => updateField('time', timeOption.value)}
            >
              <Text style={styles.quickSelectIcon}>{timeOption.icon}</Text>
              <Text style={[
                styles.quickSelectText,
                formData.time === timeOption.value && styles.quickSelectTextSelected
              ]}>
                {timeOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Custom Time Input */}
      {formData.time && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specific Time</Text>
          <TextInput
            style={styles.timeInput}
            placeholder="e.g., 9:30 AM"
            placeholderTextColor={colors.textMuted}
            value={formData.time}
            onChangeText={(text) => updateField('time', text)}
          />
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Final details</Text>
      
      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Add any notes or details..."
          placeholderTextColor={colors.textMuted}
          value={formData.description}
          onChangeText={(text) => updateField('description', text)}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Priority */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityContainer}>
          {priorities.map((priority) => (
            <TouchableOpacity
              key={priority.key}
              style={[
                styles.priorityChip,
                { borderColor: priority.color },
                formData.priority === priority.key && {
                  backgroundColor: priority.color,
                }
              ]}
              onPress={() => updateField('priority', priority.key)}
            >
              <Text style={styles.priorityIcon}>{priority.icon}</Text>
              <Text style={[
                styles.priorityText,
                formData.priority === priority.key && styles.priorityTextSelected
              ]}>
                {priority.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Shared Toggle */}
      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={styles.sharedToggle}
          onPress={() => updateField('isShared', !formData.isShared)}
        >
          <View style={styles.sharedToggleLeft}>
            <Text style={styles.sharedIcon}>🤝</Text>
            <View>
              <Text style={styles.sharedTitle}>Shared Goal</Text>
              <Text style={styles.sharedSubtitle}>Work on this together</Text>
            </View>
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
    </View>
  );

  const EmojiPickerModal = () => (
    <Modal visible={showEmojiPicker} transparent animationType="slide">
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
    </Modal>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          style={[
            styles.content,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <SafeAreaView>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>{steps[currentStep].title}</Text>
                <Text style={styles.headerSubtitle}>{steps[currentStep].subtitle}</Text>
              </View>
              
              <Text style={styles.stepCounter}>{currentStep + 1}/{steps.length}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    })
                  }
                ]} 
              />
            </View>
          </SafeAreaView>

          {/* Step Content */}
          <ScrollView style={styles.stepScrollView} showsVerticalScrollIndicator={false}>
            {currentStep === 0 && renderStep0()}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
          </ScrollView>

          {/* Bottom Actions */}
          <SafeAreaView>
            <View style={styles.bottomActions}>
              {currentStep > 0 && (
                <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !canProceed() && styles.nextButtonDisabled,
                  currentStep === 0 && styles.nextButtonFullWidth
                ]}
                onPress={currentStep === steps.length - 1 ? handleCreateTask : nextStep}
                disabled={!canProceed()}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1 ? 'Create Task ✨' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>

        <EmojiPickerModal />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  stepCounter: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  stepScrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stepContainer: {
    padding: 20,
    paddingTop: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  emojiSelector: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  selectedEmoji: {
    fontSize: 32,
  },
  emojiSelectorText: {
    fontSize: 16,
    color: colors.textLight,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    gap: 8,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryTextSelected: {
    color: colors.white,
  },
  quickSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 8,
    minWidth: '45%',
  },
  quickSelectChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickSelectIcon: {
    fontSize: 18,
  },
  quickSelectText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  quickSelectTextSelected: {
    color: colors.white,
  },
  timeInput: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
  },
  descriptionInput: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    height: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
    gap: 8,
  },
  priorityIcon: {
    fontSize: 16,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  priorityTextSelected: {
    color: colors.white,
  },
  sharedToggle: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sharedToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  sharedIcon: {
    fontSize: 24,
  },
  sharedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sharedSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray300,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  nextButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonFullWidth: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  
  // Emoji Modal Styles
  emojiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  emojiModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
  },
  emojiModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emojiModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emojiModalClose: {
    fontSize: 18,
    color: colors.textLight,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  emojiOption: {
    width: (screenWidth - 48 - 80) / 6,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  emojiOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  emojiText: {
    fontSize: 24,
  },
});

export default ModernCreateTaskScreen;