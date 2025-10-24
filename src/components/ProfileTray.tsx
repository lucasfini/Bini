import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Tray from './Tray';
import Avatar from './Avatar';

interface ProfileTrayProps {
  visible: boolean;
  onClose: () => void;
  isUser?: boolean; // true for user, false for partner
  avatarSeed: string;
  name: string;
  currentStatus?: string;
  onStatusChange?: (status: string) => void;
  onSendAction?: (action: string) => void;
}

const ProfileTray: React.FC<ProfileTrayProps> = ({
  visible,
  onClose,
  isUser = true,
  avatarSeed,
  name,
  currentStatus,
  onStatusChange,
  onSendAction,
}) => {
  const [showCustomMessage, setShowCustomMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  
  // Breathing animation for avatar
  const breathingScale = useSharedValue(1);
  const statusChangeScale = useSharedValue(1);
  
  useEffect(() => {
    if (visible) {
      // Start breathing animation
      breathingScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 2000 }),
          withTiming(1, { duration: 2000 })
        ),
        -1,
        false
      );
    }
  }, [visible]);

  const handleSetStatus = (status: string) => {
    // Animate status change
    statusChangeScale.value = withSequence(
      withTiming(1.1, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
    
    if (onStatusChange) {
      onStatusChange(status);
    }
    setTimeout(() => onClose(), 200);
  };

  const handleOpenCustomMessage = () => {
    setShowCustomMessage(true);
  };

  const handleSubmitCustomMessage = () => {
    if (customMessage.trim() && onStatusChange) {
      onStatusChange(customMessage.trim());
      setCustomMessage('');
      setShowCustomMessage(false);
      setTimeout(() => onClose(), 200);
    }
  };

  const handleSendAction = (action: string) => {
    if (onSendAction) {
      onSendAction(action);
    }
    setTimeout(() => onClose(), 200);
  };

  // Get status color based on current status
  const getStatusColor = () => {
    if (!currentStatus) return '#FF6B9D';
    if (currentStatus.includes('Focused')) return '#4ECDC4';
    if (currentStatus.includes('Crushing')) return '#FF6B9D';
    if (currentStatus.includes('break')) return '#FFE066';
    if (currentStatus.includes('help')) return '#FF6B6B';
    if (currentStatus.includes('Celebrating')) return '#A8E6CF';
    return '#FF6B9D';
  };

  const statusOptions = [
    { emoji: '🎯', text: 'Focused', color: '#4ECDC4' },
    { emoji: '💪', text: 'Crushing it', color: '#FF6B9D' },
    { emoji: '☕', text: 'Taking break', color: '#FFE066' },
    { emoji: '🆘', text: 'Need help', color: '#FF6B6B' },
    { emoji: '🎉', text: 'Celebrating', color: '#A8E6CF' },
  ];

  const partnerActions = [
    { emoji: '👋', text: 'Send Nudge', color: '#4ECDC4' },
    { emoji: '✋', text: 'Send High-Five', color: '#FF6B9D' },
    { emoji: '❤️', text: 'Send Heart', color: '#FF6B6B' },
    { emoji: '💪', text: 'Send Encouragement', color: '#A8E6CF' },
  ];

  // Animated styles
  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breathingScale.value * statusChangeScale.value }
    ],
  }));

  const statusRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));

  return (
    <Tray
      visible={visible}
      onClose={onClose}
      title={name}
      height="medium"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Enhanced Profile Section */}
        <View style={styles.profileSection}>
          {/* Status Ring */}
          <Animated.View style={[styles.statusRing, statusRingStyle]}>
            <LinearGradient
              colors={[getStatusColor() + '40', getStatusColor() + '10', 'transparent']}
              style={styles.statusRingGradient}
            />
          </Animated.View>
          
          {/* Avatar with breathing animation */}
          <Animated.View style={[styles.avatarContainer, avatarAnimatedStyle]}>
            <Avatar seed={avatarSeed} size={72} />
          </Animated.View>
          
          {/* Status with background glow */}
          {currentStatus && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
              <Text style={[styles.currentStatus, { color: getStatusColor() }]}>
                {currentStatus}
              </Text>
            </View>
          )}
          
          {/* Mood indicator */}
          <Text style={styles.moodIndicator}>
            {isUser ? "How are you feeling?" : `Send some love to ${name}`}
          </Text>
        </View>

        {/* Custom Message Modal */}
        {showCustomMessage && (
          <Animated.View style={styles.customMessageSection}>
            <LinearGradient
              colors={['#FF6B9D20', 'transparent']}
              style={styles.customMessageGradient}
            />
            <Text style={styles.sectionTitle}>Custom Status</Text>
            <TextInput
              style={styles.customMessageInput}
              value={customMessage}
              onChangeText={(text) => {
                if (text.length <= 40) {
                  setCustomMessage(text);
                }
              }}
              placeholder="Your status message..."
              placeholderTextColor="#666666"
              maxLength={40}
              autoFocus
            />
            <Text style={styles.charCount}>{customMessage.length}/40</Text>
            <View style={styles.customMessageButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCustomMessage(false);
                  setCustomMessage('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !customMessage.trim() && styles.submitButtonDisabled
                ]}
                onPress={handleSubmitCustomMessage}
                disabled={!customMessage.trim()}
              >
                <LinearGradient
                  colors={['#FF6B9D', '#FF8FB3']}
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>Set Status</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Enhanced Status Options for User */}
        {isUser && !showCustomMessage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Status</Text>
            <View style={styles.pillContainer}>
              {statusOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.pillButton}
                  onPress={() => handleSetStatus(`${option.text} ${option.emoji}`)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[option.color + '30', option.color + '10']}
                    style={styles.pillGradient}
                  >
                    <Text style={styles.pillEmoji}>{option.emoji}</Text>
                    <Text style={[styles.pillText, { color: option.color }]}>
                      {option.text}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
              
              {/* Custom message pill */}
              <TouchableOpacity
                style={styles.pillButton}
                onPress={handleOpenCustomMessage}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FF6B9D30', '#FF6B9D10']}
                  style={styles.pillGradient}
                >
                  <Text style={styles.pillEmoji}>✏️</Text>
                  <Text style={[styles.pillText, { color: '#FF6B9D' }]}>
                    Custom...
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Enhanced Partner Actions */}
        {!isUser && !showCustomMessage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send Some Love</Text>
            <View style={styles.pillContainer}>
              {partnerActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.pillButton}
                  onPress={() => handleSendAction(`${action.text}`)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[action.color + '30', action.color + '10']}
                    style={styles.pillGradient}
                  >
                    <Text style={styles.pillEmoji}>{action.emoji}</Text>
                    <Text style={[styles.pillText, { color: action.color }]}>
                      {action.text.replace('Send ', '')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Bottom padding to prevent cutoff */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </Tray>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingBottom: 24,
    marginBottom: 28,
    position: 'relative',
  },
  statusRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -14,
  },
  statusRingGradient: {
    flex: 1,
    borderRadius: 50,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  currentStatus: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  moodIndicator: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  pillButton: {
    minWidth: '45%',
    maxWidth: '48%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  pillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  pillEmoji: {
    fontSize: 18,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  customMessageSection: {
    marginBottom: 24,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 20,
  },
  customMessageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  customMessageInput: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderWidth: 1,
    borderColor: '#4A4A4A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 11,
    color: '#888888',
    textAlign: 'right',
    marginBottom: 16,
  },
  customMessageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(58, 58, 58, 0.8)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 24,
  },
});

export default ProfileTray;