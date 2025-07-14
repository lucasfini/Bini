import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { YStack, XStack, Button } from 'tamagui';
import { colors, typography, spacing, shadows } from '../../styles';

interface UserStats {
  tasksCompleted: number;
  sharedGoals: number;
  streak: number;
  totalPoints: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface PartnerInfo {
  name: string;
  avatar: string;
  tasksCompleted: number;
  sharedWith: number;
}

const ProfileScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [cheerNotifications, setCheerNotifications] = useState(true);
  const [partnerUpdates, setPartnerUpdates] = useState(true);

  const userStats: UserStats = {
    tasksCompleted: 247,
    sharedGoals: 89,
    streak: 12,
    totalPoints: 3420,
    weeklyGoal: 15,
    weeklyProgress: 11,
  };

  const partner: PartnerInfo = {
    name: 'Blake',
    avatar: 'B',
    tasksCompleted: 203,
    sharedWith: 89,
  };

  const achievements = [
    { title: 'First Steps', description: 'Completed your first task', emoji: '👶', earned: true },
    { title: 'Team Player', description: 'Completed 50 shared goals', emoji: '🤝', earned: true },
    { title: 'Streak Master', description: '7 day completion streak', emoji: '🔥', earned: true },
    { title: 'Goal Crusher', description: 'Complete 100 tasks', emoji: '💪', earned: true },
    { title: 'Supportive Partner', description: 'Give 100 cheers', emoji: '🎉', earned: false },
    { title: 'Consistency King', description: '30 day streak', emoji: '👑', earned: false },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {
          // Handle logout logic
          console.log('User signed out');
        }}
      ]
    );
  };

  const StatCard: React.FC<{ title: string; value: string | number; emoji: string; color?: string }> = ({ 
    title, value, emoji, color = colors.primary 
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <XStack alignItems="center" gap="$3">
        <Text style={styles.statEmoji}>{emoji}</Text>
        <YStack flex={1}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </YStack>
      </XStack>
    </View>
  );

  const SettingRow: React.FC<{ 
    title: string; 
    description: string; 
    value: boolean; 
    onToggle: (value: boolean) => void;
    emoji: string;
  }> = ({ title, description, value, onToggle, emoji }) => (
    <View style={styles.settingRow}>
      <XStack alignItems="center" gap="$3">
        <Text style={styles.settingEmoji}>{emoji}</Text>
        <YStack flex={1}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </YStack>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={value ? colors.primary : colors.textSecondary}
        />
      </XStack>
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
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>A</Text>
          </View>
          <Text style={styles.profileName}>Alex Johnson</Text>
          <Text style={styles.profileSubtitle}>Your Journey Together</Text>
        </YStack>
      </YStack>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>This Week's Progress</Text>
          
          <View style={styles.weeklyProgress}>
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
              <Text style={styles.progressTitle}>Weekly Goal Progress</Text>
              <Text style={styles.progressText}>{userStats.weeklyProgress}/{userStats.weeklyGoal}</Text>
            </XStack>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill, 
                { width: `${(userStats.weeklyProgress / userStats.weeklyGoal) * 100}%` }
              ]} />
            </View>
            <Text style={styles.progressSubtext}>
              {userStats.weeklyGoal - userStats.weeklyProgress} more tasks to reach your weekly goal!
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <StatCard 
              title="Tasks Completed" 
              value={userStats.tasksCompleted} 
              emoji="✅" 
              color={colors.primary}
            />
            <StatCard 
              title="Shared Goals" 
              value={userStats.sharedGoals} 
              emoji="🤝" 
              color={colors.secondary}
            />
            <StatCard 
              title="Current Streak" 
              value={`${userStats.streak} days`} 
              emoji="🔥" 
              color="#FF6B6B"
            />
            <StatCard 
              title="Total Points" 
              value={userStats.totalPoints} 
              emoji="⭐" 
              color="#FFD93D"
            />
          </View>
        </View>

        {/* Partner Section */}
        <View style={styles.partnerSection}>
          <Text style={styles.sectionTitle}>Your Partner</Text>
          
          <View style={styles.partnerCard}>
            <XStack alignItems="center" gap="$4">
              <View style={styles.partnerAvatar}>
                <Text style={styles.partnerAvatarText}>{partner.avatar}</Text>
              </View>
              <YStack flex={1}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerStats}>
                  {partner.tasksCompleted} tasks completed • {partner.sharedWith} shared together
                </Text>
              </YStack>
              <TouchableOpacity style={styles.cheerButton}>
                <Text style={styles.cheerButtonText}>🎉 Cheer</Text>
              </TouchableOpacity>
            </XStack>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.achievementCard,
                  !achievement.earned && styles.achievementCardLocked
                ]}
              >
                <Text style={[
                  styles.achievementEmoji,
                  !achievement.earned && styles.achievementEmojiLocked
                ]}>
                  {achievement.emoji}
                </Text>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && styles.achievementTitleLocked
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.earned && styles.achievementDescriptionLocked
                ]}>
                  {achievement.description}
                </Text>
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <Text style={styles.earnedBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingsCard}>
            <SettingRow
              title="Push Notifications"
              description="Get notified about task reminders and updates"
              value={notificationsEnabled}
              onToggle={setNotificationsEnabled}
              emoji="🔔"
            />
            
            <SettingRow
              title="Cheer Notifications"
              description="Know when your partner cheers you on"
              value={cheerNotifications}
              onToggle={setCheerNotifications}
              emoji="🎉"
            />
            
            <SettingRow
              title="Partner Updates"
              description="Updates when your partner completes tasks"
              value={partnerUpdates}
              onToggle={setPartnerUpdates}
              emoji="👥"
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingButton}>
              <XStack alignItems="center" gap="$3">
                <Text style={styles.settingEmoji}>🎨</Text>
                <YStack flex={1}>
                  <Text style={styles.settingTitle}>Theme & Appearance</Text>
                  <Text style={styles.settingDescription}>Customize your app experience</Text>
                </YStack>
                <Text style={styles.settingArrow}>→</Text>
              </XStack>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingButton}>
              <XStack alignItems="center" gap="$3">
                <Text style={styles.settingEmoji}>📱</Text>
                <YStack flex={1}>
                  <Text style={styles.settingTitle}>Export Data</Text>
                  <Text style={styles.settingDescription}>Download your task history</Text>
                </YStack>
                <Text style={styles.settingArrow}>→</Text>
              </XStack>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingButton}>
              <XStack alignItems="center" gap="$3">
                <Text style={styles.settingEmoji}>❓</Text>
                <YStack flex={1}>
                  <Text style={styles.settingTitle}>Help & Support</Text>
                  <Text style={styles.settingDescription}>Get help or send feedback</Text>
                </YStack>
                <Text style={styles.settingArrow}>→</Text>
              </XStack>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            onPress={handleLogout}
            backgroundColor="transparent"
            borderColor="#FF6B6B"
            borderWidth={2}
            borderRadius="$5"
            size="$4"
            fontWeight="bold"
            color="#FF6B6B"
            pressStyle={{ scale: 0.95, backgroundColor: '#FF6B6B20' }}
          >
            Sign Out
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
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.lg,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  profileName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  weeklyProgress: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  progressTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  progressText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  progressSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: spacing.md,
    borderLeftWidth: 4,
    ...shadows.md,
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  statTitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  partnerSection: {
    marginBottom: spacing.xl,
  },
  partnerCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    ...shadows.lg,
  },
  partnerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  partnerAvatarText: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  partnerName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  partnerStats: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cheerButton: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cheerButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  achievementsSection: {
    marginBottom: spacing.xl,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievementCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: spacing.md,
    alignItems: 'center',
    position: 'relative',
    ...shadows.md,
  },
  achievementCardLocked: {
    opacity: 0.6,
    backgroundColor: colors.background,
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  achievementEmojiLocked: {
    opacity: 0.5,
  },
  achievementTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  achievementTitleLocked: {
    color: colors.textSecondary,
  },
  achievementDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.sizes.xs,
  },
  achievementDescriptionLocked: {
    opacity: 0.7,
  },
  earnedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedBadgeText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  settingsSection: {
    marginBottom: spacing.xl,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    ...shadows.lg,
  },
  settingRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingButton: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingEmoji: {
    fontSize: 20,
  },
  settingTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  settingDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingArrow: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },
  logoutSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});

export default ProfileScreen;