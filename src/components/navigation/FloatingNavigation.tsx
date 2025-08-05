// src/components/navigation/FloatingNavigation.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Clock,
  Calendar,
  Plus,
  BookOpen,
  User,
  Sparkles,
} from '@tamagui/lucide-icons';

const { width: screenWidth } = Dimensions.get('window');

// Navigation configuration matching your app structure
const navItems = [
  {
    key: 'Timeline',
    label: 'Timeline',
    icon: Clock,
    activeColor: '#E0D5FA', // Lavender
    textColor: '#7C3AED',
  },
  {
    key: 'Calendar',
    label: 'Calendar',
    icon: Calendar,
    activeColor: '#FBD5E5', // Blush Pink
    textColor: '#EC4899',
  },
  {
    key: 'Create',
    label: 'Create',
    icon: Sparkles,
    activeColor: '#FEF3C0', // Pale Gold
    textColor: '#F59E0B',
  },
  {
    key: 'Knowledge',
    label: 'Knowledge',
    icon: BookOpen,
    activeColor: '#D1ECF3', // Sky Blue
    textColor: '#0EA5E9',
  },
  {
    key: 'Profile',
    label: 'Profile',
    icon: User,
    activeColor: '#D3F2F2', // Teal Mint
    textColor: '#14B8A6',
  },
];

interface FloatingNavigationProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  onCreatePress: () => void;
}

const FloatingNavigation: React.FC<FloatingNavigationProps> = ({
  activeRoute,
  onNavigate,
  onCreatePress,
}) => {
  const [scaleAnims] = useState(
    navItems.reduce((acc, item) => {
      acc[item.key] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>),
  );

  const handlePress = (item: any) => {
    // Animate button press
    const anim = scaleAnims[item.key];
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Handle navigation - set Create as active route and trigger create action
    if (item.key === 'Create') {
      onNavigate(item.key); // Set Create as active route first
      onCreatePress(); // Then trigger create action
    } else {
      onNavigate(item.key);
    }
  };

  const NavButton: React.FC<{ item: any; isActive: boolean }> = ({
    item,
    isActive,
  }) => {
    const IconComponent = item.icon;

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnims[item.key] }] }}>
        <TouchableOpacity
          style={[
            styles.navButton,
            isActive && {
              backgroundColor: item.activeColor,
              paddingHorizontal: 16,
            },
          ]}
          onPress={() => handlePress(item)}
          activeOpacity={0.7}
        >
          <IconComponent
            size={20}
            color={isActive ? item.textColor : '#9CA3AF'}
            strokeWidth={isActive ? 2.5 : 2}
          />
          {isActive && (
            <Text style={[styles.navLabel, { color: item.textColor }]}>
              {item.label}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigationBar}>
        {navItems.map(item => (
          <NavButton
            key={item.key}
            item={item}
            isActive={activeRoute === item.key}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? -10 : 8, // Extend underneath iOS home indicator
    left: 0, // Full width
    right: 0, // Full width
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 0, // Remove border radius for full width
    borderTopLeftRadius: 28, // Add top border radius only
    borderTopRightRadius: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 1000,
    backdropFilter: 'blur(20px)',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    borderRadius: 0, // Remove border radius for full width
    paddingVertical: 16, // Increased height
    paddingHorizontal: 20, // More horizontal padding for full width
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Extra bottom padding for iOS home indicator
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, // Increased button height
    paddingHorizontal: 12,
    borderRadius: 24,
    minWidth: 48, // Larger minimum width
    gap: 8,
    overflow: 'hidden',
  },
  navLabel: {
    fontSize: 14, // Slightly larger text
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#3C3C43',
    borderRadius: 3,
    marginTop: 8,
    opacity: 0.3,
  },
});

export default FloatingNavigation;
