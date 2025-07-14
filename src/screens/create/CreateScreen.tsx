import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { YStack, XStack, Button } from 'tamagui';
import { colors, typography, spacing, shadows } from '../../styles';

interface TaskForm {
  title: string;
  description: string;
  emoji: string;
  time: string;
  date: string;
  isShared: boolean;
  assignedTo: string[];
  priority: 'low' | 'medium' | 'high';
  category: string;
}

const CreateScreen: React.FC = () => {
  const [formData, setFormData] = useState<TaskForm>({
    title: '',
    description: '',
    emoji: '✨',
    time: '',
    date: new Date().toISOString().split('T')[0],
    isShared: false,
    assignedTo: ['Me'],
    priority: 'medium',
    category: 'Personal',
  });

  const emojiOptions = [
    '💪', '🛒', '📚', '🍽️', '💼', '🏃', '🧘', '🎯',
    '🌱', '✨', '🎨', '🎵', '📝', '💡', '🏠', '❤️',
    '🌟', '🔥', '💖', '🎉', '🚀', '⚡', '🌈', '🦋'
  ];

  const timeSlots = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
  ];

  const categories = [
    'Personal', 'Work', 'Health', 'Learning', 'Home', 'Social', 'Creative'
  ];

  const updateField = (field: keyof TaskForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTask = () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title');
      return;
    }
    
    // Here you would typically save to your backend/state
    Alert.alert(
      'Task Created! 🎉',
      `"${formData.title}" has been added to your timeline`,
      [{ text: 'Great!', onPress: () => {
        // Reset form or navigate back
        setFormData({
          title: '',
          description: '',
          emoji: '✨',
          time: '',
          date: new Date().toISOString().split('T')[0],
          isShared: false,
          assignedTo: ['Me'],
          priority: 'medium',
          category: 'Personal',
        });
      }}]
    );
  };

  const EmojiSelector: React.FC = () => (
    <View style={styles.emojiContainer}>
      <Text style={styles.sectionTitle}>Choose an Emoji</Text>
      <View style={styles.emojiGrid}>
        {emojiOptions.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => updateField('emoji', emoji)}
            style={[
              styles.emojiOption,
              formData.emoji === emoji && styles.emojiOptionSelected
            ]}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const TimeSelector: React.FC = () => (
    <View style={styles.timeContainer}>
      <Text style={styles.sectionTitle}>Select Time</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.timeScroll}
        contentContainerStyle={styles.timeScrollContent}
      >
        {timeSlots.map((time, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => updateField('time', time)}
            style={[
              styles.timeOption,
              formData.time === time && styles.timeOptionSelected
            ]}
          >
            <Text style={[
              styles.timeText,
              formData.time === time && styles.timeTextSelected
            ]}>
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <YStack 
        padding="$4" 
        backgroundColor="white" 
        borderBottomLeftRadius="$7" 
        borderBottomRightRadius="$7"
        shadowColor="black"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
        elevation={4}
      >
        <YStack alignItems="center">
          <Text style={styles.headerTitle}>Create New Task</Text>
          <Text style={styles.headerSubtitle}>What would you like to accomplish?</Text>
        </YStack>
      </YStack>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Preview</Text>
          <View style={styles.previewTask}>
            <XStack alignItems="center" gap="$3" marginBottom="$2">
              <Text style={styles.previewEmoji}>{formData.emoji}</Text>
              <YStack flex={1}>
                <Text style={styles.previewTitle}>
                  {formData.title || 'Your awesome task'}
                </Text>
                {formData.description && (
                  <Text style={styles.previewDescription}>
                    {formData.description}
                  </Text>
                )}
                {formData.time && (
                  <Text style={styles.previewTime}>{formData.time}</Text>
                )}
              </YStack>
            </XStack>
            {formData.isShared && (
              <View style={styles.sharedBadge}>
                <Text style={styles.sharedBadgeText}>🤝 Shared Goal</Text>
              </View>
            )}
          </View>
        </View>

        {/* Task Details Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What needs to be done?"
              value={formData.title}
              onChangeText={(text) => updateField('title', text)}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              placeholder="Add details about your task..."
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => updateField('category', category)}
                  style={[
                    styles.categoryOption,
                    formData.category === category && styles.categoryOptionSelected
                  ]}
                >
                  <Text style={[
                    styles.categoryText,
                    formData.category === category && styles.categoryTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Emoji Selection */}
        <View style={styles.formCard}>
          <EmojiSelector />
        </View>

        {/* Time Selection */}
        <View style={styles.formCard}>
          <TimeSelector />
        </View>

        {/* Sharing Options */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Sharing & Collaboration</Text>
          
          <TouchableOpacity
            onPress={() => updateField('isShared', !formData.isShared)}
            style={styles.sharedToggle}
          >
            <XStack alignItems="center" gap="$3">
              <View style={[
                styles.checkbox,
                formData.isShared && styles.checkboxSelected
              ]}>
                {formData.isShared && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <YStack flex={1}>
                <Text style={styles.toggleTitle}>Make this a shared goal</Text>
                <Text style={styles.toggleDescription}>
                  Work on this task together with your partner
                </Text>
              </YStack>
              <Text style={styles.toggleEmoji}>🤝</Text>
            </XStack>
          </TouchableOpacity>

          {formData.isShared && (
            <View style={styles.collaborationOptions}>
              <Text style={styles.collaborationText}>
                🎉 Great! This will appear in both your timelines and you can cheer each other on.
              </Text>
            </View>
          )}
        </View>

        {/* Priority Selection */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Priority Level</Text>
          <XStack gap="$3">
            {(['low', 'medium', 'high'] as const).map((priority) => (
              <TouchableOpacity
                key={priority}
                onPress={() => updateField('priority', priority)}
                style={[
                  styles.priorityOption,
                  formData.priority === priority && styles.priorityOptionSelected,
                  priority === 'high' && styles.priorityHigh,
                  priority === 'medium' && styles.priorityMedium,
                  priority === 'low' && styles.priorityLow,
                ]}
              >
                <Text style={[
                  styles.priorityText,
                  formData.priority === priority && styles.priorityTextSelected
                ]}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </XStack>
        </View>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleCreateTask}
            backgroundColor={colors.primary}
            borderRadius="$5"
            size="$5"
            fontWeight="bold"
            color="white"
            pressStyle={{ scale: 0.95 }}
            shadowColor={colors.primary}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={8}
          >
            <XStack alignItems="center" gap="$2">
              <Text style={styles.createButtonText}>Create Task</Text>
              <Text style={styles.createButtonEmoji}>✨</Text>
            </XStack>
          </Button>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  previewLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  previewTask: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  previewEmoji: {
    fontSize: 24,
  },
  previewTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  previewDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  previewTime: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    marginTop: 4,
  },
  sharedBadge: {
    backgroundColor: colors.secondary + '20',
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  sharedBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.secondary,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  categoryOption: {
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  categoryTextSelected: {
    color: colors.white,
  },
  emojiContainer: {
    width: '100%',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emojiOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  emojiOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    ...shadows.sm,
  },
  emojiText: {
    fontSize: 24,
  },
  timeContainer: {
    width: '100%',
  },
  timeScroll: {
    marginHorizontal: -spacing.lg,
  },
  timeScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  timeOption: {
    backgroundColor: colors.background,
    borderRadius: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  timeTextSelected: {
    color: colors.white,
  },
  sharedToggle: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  toggleTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  toggleDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggleEmoji: {
    fontSize: 20,
  },
  collaborationOptions: {
    backgroundColor: colors.secondary + '10',
    borderRadius: 15,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  collaborationText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.sizes.sm,
  },
  priorityOption: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 15,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  priorityOptionSelected: {
    ...shadows.sm,
  },
  priorityHigh: {
    borderColor: '#FF6B6B',
  },
  priorityMedium: {
    borderColor: '#FFD93D',
  },
  priorityLow: {
    borderColor: '#6BCF7F',
  },
  priorityText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  priorityTextSelected: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  createButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  createButtonEmoji: {
    fontSize: 18,
  },
});


export default CreateScreen;