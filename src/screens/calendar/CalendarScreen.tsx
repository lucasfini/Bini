import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { YStack, XStack } from 'tamagui';
import { colors, typography, spacing, shadows } from '../../styles';
import { Heart, TrendingUp, Award, MessageCircle, Target, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PartnerAnalyticsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  // Mock data - in real app, fetch from backend
  const partnerName = 'Alex';
  const currentStreak = 12;
  const longestStreak = 28;
  const sharedTasksCompleted = 45;
  const myTasksCompleted = 38;
  const partnerTasksCompleted = 42;

  const recentActivity = [
    { partner: 'Alex', action: 'completed', task: 'Morning Workout', time: '2h ago', emoji: '💪' },
    { partner: 'You', action: 'completed', task: 'Grocery Shopping', time: '4h ago', emoji: '🛒' },
    { partner: 'Alex', action: 'added', task: 'Book Restaurant', time: '6h ago', emoji: '🍽️' },
    { partner: 'You', action: 'completed', task: 'Pay Bills', time: '1d ago', emoji: '💰' },
  ];

  const milestones = [
    { title: '30 Day Streak', icon: '🔥', unlocked: false, progress: 40 },
    { title: '100 Shared Tasks', icon: '🎯', unlocked: false, progress: 45 },
    { title: 'Perfect Week', icon: '⭐', unlocked: true, progress: 100 },
    { title: 'Early Bird', icon: '🌅', unlocked: true, progress: 100 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Partnership</Text>
          <Text style={styles.headerSubtitle}>Together is better</Text>
        </View>
        <View style={styles.headerIcon}>
          <Heart size={28} color="#FF6B9D" fill="#FF6B9D" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>🔥 Current Streak</Text>
            <Text style={styles.streakDays}>{currentStreak} days</Text>
          </View>
          <Text style={styles.streakSubtext}>
            Keep it up! Longest: {longestStreak} days
          </Text>
          <View style={styles.streakProgress}>
            <View style={[styles.streakProgressFill, { width: `${(currentStreak / longestStreak) * 100}%` }]} />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statCardNumber}>{sharedTasksCompleted}</Text>
            <Text style={styles.statCardLabel}>Shared</Text>
            <Target size={20} color="#FF6B9D" style={styles.statCardIcon} />
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCardNumber}>{myTasksCompleted}</Text>
            <Text style={styles.statCardLabel}>You</Text>
            <TrendingUp size={20} color="#6B73FF" style={styles.statCardIcon} />
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCardNumber}>{partnerTasksCompleted}</Text>
            <Text style={styles.statCardLabel}>{partnerName}</Text>
            <Award size={20} color="#4CAF50" style={styles.statCardIcon} />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityCard}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <YStack gap="$3" marginTop="$3">
            {recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    <Text style={styles.activityPartner}>{activity.partner}</Text>
                    {' '}{activity.action}{' '}
                    <Text style={styles.activityTask}>{activity.task}</Text>
                  </Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </YStack>
        </View>

        {/* Milestones */}
        <View style={styles.milestonesCard}>
          <Text style={styles.cardTitle}>Milestones</Text>
          <YStack gap="$3" marginTop="$3">
            {milestones.map((milestone, index) => (
              <View key={index} style={styles.milestoneItem}>
                <View style={styles.milestoneHeader}>
                  <View style={styles.milestoneLeft}>
                    <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
                    <Text style={[
                      styles.milestoneTitle,
                      !milestone.unlocked && styles.milestoneLocked
                    ]}>
                      {milestone.title}
                    </Text>
                  </View>
                  {milestone.unlocked && (
                    <Text style={styles.milestoneUnlocked}>✓</Text>
                  )}
                </View>
                <View style={styles.milestoneProgress}>
                  <View style={[
                    styles.milestoneProgressFill,
                    { width: `${milestone.progress}%` },
                    milestone.unlocked && styles.milestoneProgressUnlocked
                  ]} />
                </View>
              </View>
            ))}
          </YStack>
        </View>

        {/* Weekly Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.cardTitle}>This Week's Progress</Text>
            <View style={styles.periodToggle}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === 'week' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod('week')}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === 'week' && styles.periodButtonTextActive
                ]}>Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === 'month' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod('month')}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === 'month' && styles.periodButtonTextActive
                ]}>Month</Text>
              </TouchableOpacity>
            </View>
          </View>

          <YStack gap="$3" marginTop="$3">
            <View>
              <XStack justifyContent="space-between" marginBottom="$1">
                <Text style={styles.progressLabel}>Shared Tasks</Text>
                <Text style={styles.progressPercentage}>75%</Text>
              </XStack>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
            </View>

            <View>
              <XStack justifyContent="space-between" marginBottom="$1">
                <Text style={styles.progressLabel}>Individual Tasks</Text>
                <Text style={styles.progressPercentage}>85%</Text>
              </XStack>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, styles.progressFillBlue, { width: '85%' }]} />
              </View>
            </View>
          </YStack>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <YStack gap="$2" marginTop="$3">
            <TouchableOpacity style={styles.quickActionButton}>
              <MessageCircle size={20} color="#FF6B9D" />
              <Text style={styles.quickActionText}>Send Encouragement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Calendar size={20} color="#FF6B9D" />
              <Text style={styles.quickActionText}>Suggest Shared Task</Text>
            </TouchableOpacity>
          </YStack>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PartnerAnalyticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },

  // Streak Card
  streakCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  streakTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  streakDays: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    color: '#FF6B9D',
  },
  streakSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  streakProgress: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  streakProgressFill: {
    height: '100%',
    backgroundColor: '#FF6B9D',
    borderRadius: 4,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.md,
  },
  statCardNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statCardLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  statCardIcon: {
    marginTop: spacing.xs,
  },

  // Activity Card
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  activityPartner: {
    fontWeight: typography.weights.bold,
    color: '#FF6B9D',
  },
  activityTask: {
    fontWeight: typography.weights.semibold,
  },
  activityTime: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },

  // Milestones Card
  milestonesCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  milestoneItem: {
    marginBottom: spacing.sm,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  milestoneIcon: {
    fontSize: 24,
  },
  milestoneTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  milestoneLocked: {
    opacity: 0.5,
  },
  milestoneUnlocked: {
    fontSize: 20,
    color: '#4CAF50',
  },
  milestoneProgress: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  milestoneProgressFill: {
    height: '100%',
    backgroundColor: colors.textSecondary,
    borderRadius: 3,
  },
  milestoneProgressUnlocked: {
    backgroundColor: '#4CAF50',
  },

  // Progress Card
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: colors.surface,
  },
  periodButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
  },
  progressLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  progressPercentage: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B9D',
    borderRadius: 4,
  },
  progressFillBlue: {
    backgroundColor: '#6B73FF',
  },

  // Quick Actions Card
  quickActionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(255, 107, 157, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.2)',
  },
  quickActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});