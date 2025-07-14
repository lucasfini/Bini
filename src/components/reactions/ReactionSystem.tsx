import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { XStack, YStack } from 'tamagui';
import { colors, typography, spacing, shadows } from '../../styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Reaction {
  emoji: string;
  count: number;
  isFromPartner: boolean;
  users: string[];
}

interface ReactionSystemProps {
  visible: boolean;
  onClose: () => void;
  onReactionSelect: (emoji: string) => void;
  existingReactions?: Reaction[];
  targetPosition?: { x: number; y: number };
}

const reactionOptions = [
  { emoji: '👍', label: 'Like' },
  { emoji: '💖', label: 'Love' },
  { emoji: '😆', label: 'Laugh' },
  { emoji: '💬', label: 'Comment' },
  { emoji: '🌟', label: 'Star' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '💪', label: 'Strong' },
];

export const ReactionSystem: React.FC<ReactionSystemProps> = ({
  visible,
  onClose,
  onReactionSelect,
  existingReactions = [],
  targetPosition = { x: screenWidth / 2, y: screenHeight / 2 },
}) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleReactionPress = (emoji: string) => {
    // Add haptic feedback animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onReactionSelect(emoji);
    setTimeout(onClose, 300); // Close after animation
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      // Check if touch is outside the reaction container
      const { locationY } = evt.nativeEvent;
      if (locationY < screenHeight - 200) {
        onClose();
      }
    },
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.reactionContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
                { scale: scaleAnim },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          <View style={styles.reactionRibbon}>
            <XStack gap="$2" paddingHorizontal="$3">
              {reactionOptions.map((reaction, index) => {
                const hasReacted = existingReactions.some(r => r.emoji === reaction.emoji);
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleReactionPress(reaction.emoji)}
                    style={[
                      styles.reactionOption,
                      hasReacted && styles.reactionOptionActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </XStack>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

interface ReactionBadgeProps {
  reaction: Reaction;
  onPress?: () => void;
  size?: 'small' | 'medium';
}

export const ReactionBadge: React.FC<ReactionBadgeProps> = ({
  reaction,
  onPress,
  size = 'medium',
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  const handlePress = () => {
    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.reactionBadge,
          reaction.isFromPartner ? styles.reactionPartner : styles.reactionMine,
          size === 'small' && styles.reactionBadgeSmall,
        ]}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.badgeEmoji,
          size === 'small' && styles.badgeEmojiSmall,
        ]}>
          {reaction.emoji}
        </Text>
        <Text style={[
          styles.badgeCount,
          size === 'small' && styles.badgeCountSmall,
        ]}>
          {reaction.count}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface ReactionDisplayProps {
  reactions: Reaction[];
  onReactionPress?: (reaction: Reaction) => void;
  maxDisplay?: number;
}

export const ReactionDisplay: React.FC<ReactionDisplayProps> = ({
  reactions,
  onReactionPress,
  maxDisplay = 5,
}) => {
  const displayedReactions = reactions.slice(0, maxDisplay);
  const hasMore = reactions.length > maxDisplay;

  return (
    <XStack gap="$1" flexWrap="wrap" alignItems="center">
      {displayedReactions.map((reaction, index) => (
        <ReactionBadge
          key={`${reaction.emoji}-${index}`}
          reaction={reaction}
          onPress={() => onReactionPress?.(reaction)}
        />
      ))}
      {hasMore && (
        <Text style={styles.moreReactions}>
          +{reactions.length - maxDisplay}
        </Text>
      )}
    </XStack>
  );
};

// Hook for managing reactions
export const useReactions = (initialReactions: Reaction[] = []) => {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);

  const addReaction = (emoji: string, isFromPartner: boolean = false, userId: string = 'current') => {
    setReactions(prev => {
      const existingIndex = prev.findIndex(r => r.emoji === emoji);
      
      if (existingIndex >= 0) {
        // Update existing reaction
        const updated = [...prev];
        const existing = updated[existingIndex];
        
        if (!existing.users.includes(userId)) {
          updated[existingIndex] = {
            ...existing,
            count: existing.count + 1,
            users: [...existing.users, userId],
          };
        }
        return updated;
      } else {
        // Add new reaction
        return [...prev, {
          emoji,
          count: 1,
          isFromPartner,
          users: [userId],
        }];
      }
    });
  };

  const removeReaction = (emoji: string, userId: string = 'current') => {
    setReactions(prev => {
      return prev.map(reaction => {
        if (reaction.emoji === emoji && reaction.users.includes(userId)) {
          const newUsers = reaction.users.filter(u => u !== userId);
          return {
            ...reaction,
            count: Math.max(0, reaction.count - 1),
            users: newUsers,
          };
        }
        return reaction;
      }).filter(reaction => reaction.count > 0);
    });
  };

  const toggleReaction = (emoji: string, isFromPartner: boolean = false, userId: string = 'current') => {
    const existing = reactions.find(r => r.emoji === emoji);
    if (existing && existing.users.includes(userId)) {
      removeReaction(emoji, userId);
    } else {
      addReaction(emoji, isFromPartner, userId);
    }
  };

  return {
    reactions,
    addReaction,
    removeReaction,
    toggleReaction,
    setReactions,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  reactionContainer: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  reactionRibbon: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    paddingVertical: spacing.md,
    ...shadows.lg,
    backdropFilter: 'blur(10px)',
  },
  reactionOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  reactionOptionActive: {
    backgroundColor: colors.primary + '20',
    ...shadows.sm,
  },
  reactionEmoji: {
    fontSize: 28,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 3,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  reactionBadgeSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
  },
  reactionMine: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary + '40',
  },
  reactionPartner: {
    backgroundColor: colors.secondary + '20',
    borderColor: colors.secondary + '40',
  },
  badgeEmoji: {
    fontSize: typography.sizes.sm,
  },
  badgeEmojiSmall: {
    fontSize: typography.sizes.xs,
  },
  badgeCount: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  badgeCountSmall: {
    fontSize: 10,
  },
  moreReactions: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs,
  },
});

export default ReactionSystem;