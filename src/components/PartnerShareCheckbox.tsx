// src/components/PartnerShareCheckbox.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { Check } from '@tamagui/lucide-icons';

interface PartnerShareCheckboxProps {
  partnerName: string;
  partnerAvatarUrl?: string;
  isChecked: boolean;
  onPress: () => void;
}

const PartnerShareCheckbox: React.FC<PartnerShareCheckboxProps> = ({
  partnerName,
  partnerAvatarUrl,
  isChecked,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(isChecked ? 1 : 0)).current;
  const checkScale = useRef(new Animated.Value(isChecked ? 1 : 0)).current;

  useEffect(() => {
    // Animate overlay and checkmark when checked state changes
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: isChecked ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: isChecked ? 1 : 0,
        tension: 150,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isChecked]);

  const handlePress = () => {
    // Bounce animation on tap
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  // Generate initials if no avatar URL
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked }}
      accessibilityLabel={`Share with ${partnerName}`}
      accessibilityHint={`${isChecked ? 'Uncheck' : 'Check'} to ${
        isChecked ? 'stop sharing' : 'share'
      } this task with ${partnerName}`}
    >
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Profile Picture or Initials */}
        <View style={styles.avatar}>
          {partnerAvatarUrl ? (
            <Image source={{ uri: partnerAvatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>{getInitials(partnerName)}</Text>
            </View>
          )}
        </View>

        {/* Overlay when checked */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            <Check size={20} color="#FFFFFF" strokeWidth={3} />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* Text Label */}
      <Text style={styles.label}>Share with {partnerName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 48, // Accessibility minimum touch target
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initialsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A7C3A', // Primary green color
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50', // Success green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E26',
    flex: 1,
  },
});

export default PartnerShareCheckbox;