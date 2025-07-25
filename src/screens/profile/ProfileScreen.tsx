// src/screens/profile/ProfileScreen.tsx - Updated with Supabase
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { colors, typography, spacing, shadows } from '../../styles';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';

interface UserStats {
  tasksCompleted: number;
  sharedGoals: number;
  streak: number;
  totalPoints: number;
  weeklyGoal: number;
  weeklyProgress: number;
  joinedDate: Date;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  partner_code: string;
  partner_id?: string;
  created_at: string;
}

interface PartnerInfo {
  name: string;
  avatar: string;
  tasksCompleted: number;
  sharedWith: number;
  isConnected: boolean;
}

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [cheerNotifications, setCheerNotifications] = useState(true);
  const [partnerUpdates, setPartnerUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock user stats - we'll make these real later
  const userStats: UserStats = {
    tasksCompleted: 0, // We'll calculate this from real tasks
    sharedGoals: 0,
    streak: 0,
    totalPoints: 0,
    weeklyGoal: 15,
    weeklyProgress: 0,
    joinedDate: user?.createdAt || new Date(),
  };

  const partner: PartnerInfo = {
    name: 'Blake',
    avatar: 'B',
    tasksCompleted: 203,
    sharedWith: 89,
    isConnected: false, // Will be true when they have a partner
  };

  // Fetch user profile data from Supabase
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        console.log('🔍 Fetching profile data for:', user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ Profile fetch failed:', error);
          return;
        }

        console.log('✅ Profile data fetched:', data);
        setProfileData(data);
      } catch (error) {
        console.error('❌ Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const achievements = [
    { title: 'First Steps', description: 'Created your account', emoji: '👶', earned: true },
    { title: 'Task Creator', description: 'Created your first task', emoji: '✨', earned: false },
    { title: 'Team Player', description: 'Connected with your partner', emoji: '🤝', earned: !!profileData?.partner_id },
    { title: 'Goal Crusher', description: 'Complete 10 tasks', emoji: '💪', earned: false },
    { title: 'Streak Master', description: '7 day completion streak', emoji: '🔥', earned: false },
    { title: 'Consistency King', description: '30 day streak', emoji: '👑', earned: false },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('🚀 Signing out...');
              await logout();
              console.log('✅ Logout successful');
            } catch (error) {
              console.error('❌ Logout failed:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        user: user?.name,
        email: user?.email,
        partnerCode: profileData?.partner_code,
        joinedDate: user?.createdAt,
        // Add more data as needed
      };

      const result = await Share.share({
        message: `Bini Account Data:\n\nName: ${exportData.user}\nEmail: ${exportData.email}\nPartner Code: ${exportData.partnerCode}\nJoined: ${exportData.joinedDate?.toLocaleDateString()}`,
        title: 'Bini Data Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleSharePartnerCode = () => {
    if (!profileData?.partner_code) {
      Alert.alert('Error', 'Partner code not available');
      return;
    }

    Alert.alert(
      'Share Partner Code',
      `Your partner code is: ${profileData.partner_code}\n\nShare this code with your partner so they can connect with you!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share Code', 
          onPress: async () => {
            try {
              await Share.share({
                message: `Hey! Join me on Bini using my partner code: ${profileData.partner_code}\n\nLet's achieve our goals together! 💪`,
                title: 'Join me on Bini!',
              });
            } catch (error) {
              console.error('Share failed:', error);
            }
          }
        }
      ]
    );
  };

  const handleInvitePartner = () => {
    handleSharePartnerCode();
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    emoji: string; 
    color?: string;
    subtitle?: string;
  }> = ({ title, value, emoji, color = colors.accentPrimary, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardHeader}>
        <Text style={styles.statEmoji}>{emoji}</Text>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );

  const SettingRow: React.FC<{ 
    title: string; 
    description?: string; 
    value?: boolean; 
    onToggle?: (value: boolean) => void;
    onPress?: () => void;
    emoji: string;
    showArrow?: boolean;
    textColor?: string;
  }> = ({ title, description, value, onToggle, onPress, emoji, showArrow = false, textColor }) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onPress}
      disabled={!onPress && value === undefined}
    >
      <View style={styles.settingContent}>
        <Text style={styles.settingEmoji}>{emoji}</Text>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, textColor && { color: textColor }]}>
            {title}
          </Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
      </View>
      
      {value !== undefined && onToggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.accentPrimary + '40' }}
          thumbColor={value ? colors.accentPrimary : colors.textSecondary}
        />
      ) : showArrow ? (
        <Text style={styles.settingArrow}>→</Text>
      ) : null}
    </TouchableOpacity>
  );

  const SettingsModal = () => (
    <Modal visible={showSettings} transparent animationType="slide">
      <View style={styles.settingsOverlay}>
        <View style={styles.settingsModal}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>App Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.settingsClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
            {/* Account Section */}
            <Text style={styles.settingsSectionTitle}>Account</Text>
            <SettingRow
              title="Partner Code"
              description={`Your code: ${profileData?.partner_code || 'Loading...'}`}
              onPress={handleSharePartnerCode}
              emoji="🔗"
              showArrow
            />
            <SettingRow
              title="Export Data"
              description="Download your account information"
              onPress={handleExportData}
              emoji="📱"
              showArrow
            />

            {/* Notifications Section */}
            <Text style={styles.settingsSectionTitle}>Notifications</Text>
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

            {/* Appearance Section */}
            <Text style={styles.settingsSectionTitle}>Appearance</Text>
            <SettingRow
              title="Dark Mode"
              description="Switch to dark theme"
              value={darkMode}
              onToggle={setDarkMode}
              emoji="🌙"
            />
            <SettingRow
              title="Theme Color"
              description="Customize your accent color"
              onPress={() => Alert.alert('Theme Colors', 'Color picker coming soon!')}
              emoji="🎨"
              showArrow
            />

            {/* Support Section */}
            <Text style={styles.settingsSectionTitle}>Support</Text>
            <SettingRow
              title="Help & Support"
              description="Get help or send feedback"
              onPress={() => Alert.alert('Support', 'Contact support at help@bini.app')}
              emoji="❓"
              showArrow
            />
            <SettingRow
              title="About Bini"
              description="Version 1.0.0"
              onPress={() => Alert.alert('About Bini', 'Built with ❤️ for couples')}
              emoji="ℹ️"
              showArrow
            />

            {/* Danger Zone */}
            <Text style={styles.settingsSectionTitle}>Danger Zone</Text>
            <SettingRow
              title="Sign Out"
              onPress={handleLogout}
              emoji="🚪"
              textColor={colors.error}
              showArrow
            />

            <View style={{ height: 50 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Not logged in</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileSubtitle}>
            Partner Code: {profileData?.partner_code || 'Loading...'}
          </Text>
          <Text style={styles.profileSubtitle}>
            Member since {user.createdAt.toLocaleDateString()}
          </Text>
        </View>
        
        {/* Settings Button */}
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weekly Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week's Progress</Text>
          
          <View style={styles.weeklyProgressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Weekly Goal</Text>
              <Text style={styles.progressCount}>
                {userStats.weeklyProgress}/{userStats.weeklyGoal}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { width: `${(userStats.weeklyProgress / userStats.weeklyGoal) * 100}%` }
                ]} />
              </View>
            </View>
            <Text style={styles.progressSubtext}>
              {userStats.weeklyGoal - userStats.weeklyProgress} more tasks to reach your goal!
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Tasks Completed" 
              value={userStats.tasksCompleted} 
              emoji="✅" 
              color={colors.accentPrimary}
            />
            <StatCard 
              title="Shared Goals" 
              value={userStats.sharedGoals} 
              emoji="🤝" 
              color={colors.accentSecondary}
            />
            <StatCard 
              title="Current Streak" 
              value={`${userStats.streak} days`} 
              emoji="🔥" 
              color="#FF6B6B"
            />
            <StatCard 
              title="Partner Code" 
              value={profileData?.partner_code || '...'} 
              emoji="🔗" 
              color="#FFD93D"
            />
          </View>
        </View>

        {/* Partner Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Partner</Text>
          
          {profileData?.partner_id ? (
            <View style={styles.partnerCard}>
              <View style={styles.partnerInfo}>
                <View style={styles.partnerAvatar}>
                  <Text style={styles.partnerAvatarText}>P</Text>
                </View>
                <View style={styles.partnerDetails}>
                  <Text style={styles.partnerName}>Partner Connected</Text>
                  <Text style={styles.partnerStats}>
                    Working together on shared goals
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.cheerButton}>
                <Text style={styles.cheerButtonText}>🎉 Cheer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.invitePartnerCard}>
              <Text style={styles.inviteEmoji}>👋</Text>
              <Text style={styles.inviteTitle}>Invite Your Partner</Text>
              <Text style={styles.inviteDescription}>
                Share your partner code: {profileData?.partner_code || '...'}
              </Text>
              <TouchableOpacity style={styles.inviteButton} onPress={handleInvitePartner}>
                <Text style={styles.inviteButtonText}>Share Partner Code</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement, index) => (
              <View 
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
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <SettingsModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileInfo: {
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.lg,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  settingsIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  weeklyProgressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    ...shadows.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressCount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accentPrimary,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 6,
  },
  progressSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statEmoji: {
    fontSize: 24,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 2,
  },
  partnerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  partnerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accentSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  partnerAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  partnerStats: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cheerButton: {
    backgroundColor: colors.accentSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cheerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  invitePartnerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...shadows.md,
  },
  inviteEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  inviteTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inviteDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  inviteButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    ...shadows.sm,
  },
  achievementCardLocked: {
    opacity: 0.6,
    backgroundColor: colors.background,
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  achievementEmojiLocked: {
    opacity: 0.5,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: colors.textSecondary,
  },
  achievementDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  achievementDescriptionLocked: {
    opacity: 0.7,
  },
  earnedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentSuccess,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedBadgeText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '700',
  },

  // Settings Modal Styles
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  settingsModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  settingsClose: {
    fontSize: 18,
    color: colors.textSecondary,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingEmoji: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 16,
    color: colors.textTertiary,
  },
});

export default ProfileScreen;