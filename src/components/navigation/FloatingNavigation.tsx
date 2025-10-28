import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock,
  Calendar,
  Plus,
  MoreHorizontal,
  BookOpen,
  User,
  X,
  Heart,
} from 'lucide-react-native';
import { colors } from '../../styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  const insets = useSafeAreaInsets();
  const [isMoreSheetVisible, setIsMoreSheetVisible] = useState(false);
  
  // Animation values
  const plusScale = useSharedValue(1);
  const moreScale = useSharedValue(1);
  const timelineScale = useSharedValue(1);
  const calendarScale = useSharedValue(1);
  
  // Tray animation values
  const translateY = useSharedValue(screenHeight);

  const handleTimelinePress = () => {
    timelineScale.value = withSpring(0.9, {}, () => {
      timelineScale.value = withSpring(1);
    });
    onNavigate('Timeline');
  };

  const handleCalendarPress = () => {
    calendarScale.value = withSpring(0.9, {}, () => {
      calendarScale.value = withSpring(1);
    });
    onNavigate('Calendar');
  };

  const handleCreatePress = () => {
    plusScale.value = withSpring(0.85, {}, () => {
      plusScale.value = withSpring(1);
    });
    onCreatePress();
  };

  const handleMorePress = () => {
    moreScale.value = withSpring(0.9, {}, () => {
      moreScale.value = withSpring(1);
    });
    setIsMoreSheetVisible(true);
  };

  // Handle tray animations
  React.useEffect(() => {
    if (isMoreSheetVisible) {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 120,
      });
    } else {
      translateY.value = withTiming(screenHeight, { duration: 300 });
    }
  }, [isMoreSheetVisible]);

  const handleMoreItemPress = (route: string) => {
    setIsMoreSheetVisible(false);
    setTimeout(() => {
      onNavigate(route);
    }, 150);
  };

  // Animated styles
  const timelineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timelineScale.value }],
  }));

  const calendarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: calendarScale.value }],
  }));

  const plusAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plusScale.value }],
  }));

  const moreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: moreScale.value }],
  }));

  const trayStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <>
      {/* Unified Navigation Bar */}
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.unifiedNav}>
          {/* Left Section - Timeline & Calendar */}
          <View style={styles.leftSection}>
            {/* Timeline Tab */}
            <Animated.View style={timelineAnimatedStyle}>
              <TouchableOpacity
                style={[
                  styles.navTab,
                  activeRoute === 'Timeline' && styles.navTabActive,
                ]}
                onPress={handleTimelinePress}
                activeOpacity={0.8}
              >
                <Clock 
                  size={18} 
                  color={activeRoute === 'Timeline' ? '#FF6B9D' : '#CCCCCC'} 
                  strokeWidth={2}
                />
                <Text style={[
                  styles.navTabText,
                  activeRoute === 'Timeline' && styles.navTabTextActive,
                ]}>
                  Timeline
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Calendar Tab */}
            <Animated.View style={calendarAnimatedStyle}>
              <TouchableOpacity
                style={[
                  styles.navTab,
                  activeRoute === 'Calendar' && styles.navTabActive,
                ]}
                onPress={handleCalendarPress}
                activeOpacity={0.8}
              >
                <Calendar 
                  size={18} 
                  color={activeRoute === 'Calendar' ? '#FF6B9D' : '#CCCCCC'} 
                  strokeWidth={2}
                />
                <Text style={[
                  styles.navTabText,
                  activeRoute === 'Calendar' && styles.navTabTextActive,
                ]}>
                  Calendar
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Right Section - Action Buttons */}
          <View style={styles.rightSection}>
            {/* More Button */}
            <Animated.View style={moreAnimatedStyle}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleMorePress}
                activeOpacity={0.8}
              >
                <MoreHorizontal size={20} color="#CCCCCC" strokeWidth={2.5} />
              </TouchableOpacity>
            </Animated.View>

            {/* Create Button */}
            <Animated.View style={plusAnimatedStyle}>
              <LinearGradient
                colors={['#FF7BA3', '#FF5A8A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.createAction}
              >
                <TouchableOpacity
                  style={styles.createActionInner}
                  onPress={handleCreatePress}
                  activeOpacity={0.9}
                >
                  <Plus size={26} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </View>
        </View>
      </View>

      {/* More Tray Modal - Matching TaskDetailsTray design */}
      <Modal transparent visible={isMoreSheetVisible} animationType="none">
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            onPress={() => setIsMoreSheetVisible(false)}
            activeOpacity={1}
          />

          <Animated.View style={[styles.trayContainer, trayStyle]}>
            <View style={styles.containerInner}>
              {/* Header */}
              <View style={styles.compactHeader}>
                <View style={styles.headerInfo}>
                  <Text style={styles.headerTitle}>More</Text>
                  <Text style={styles.headerSubtitle}>Additional features and settings</Text>
                </View>
                <TouchableOpacity onPress={() => setIsMoreSheetVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.trayContent}>
                <TouchableOpacity
                  style={[
                    styles.trayOption,
                    activeRoute === 'Knowledge' && styles.trayOptionActive,
                  ]}
                  onPress={() => handleMoreItemPress('Knowledge')}
                >
                  <View style={[
                    styles.trayOptionIcon,
                    activeRoute === 'Knowledge' && styles.trayOptionIconActive,
                  ]}>
                    <BookOpen 
                      size={20} 
                      color={activeRoute === 'Knowledge' ? colors.primary : colors.textSecondary} 
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.trayOptionContent}>
                    <Text style={[
                      styles.trayOptionTitle,
                      activeRoute === 'Knowledge' && styles.trayOptionTitleActive,
                    ]}>
                      Knowledge
                    </Text>
                    <Text style={styles.trayOptionSubtitle}>
                      Insights and analytics
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.trayOption,
                    activeRoute === 'Profile' && styles.trayOptionActive,
                  ]}
                  onPress={() => handleMoreItemPress('Profile')}
                >
                  <View style={[
                    styles.trayOptionIcon,
                    activeRoute === 'Profile' && styles.trayOptionIconActive,
                  ]}>
                    <User 
                      size={20} 
                      color={activeRoute === 'Profile' ? colors.primary : colors.textSecondary} 
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.trayOptionContent}>
                    <Text style={[
                      styles.trayOptionTitle,
                      activeRoute === 'Profile' && styles.trayOptionTitleActive,
                    ]}>
                      Profile
                    </Text>
                    <Text style={styles.trayOptionSubtitle}>
                      Settings and preferences
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* DevShowcase (Development Only) */}
                {__DEV__ && (
                  <TouchableOpacity
                    style={[
                      styles.trayOption,
                      activeRoute === 'DevShowcase' && styles.trayOptionActive,
                    ]}
                    onPress={() => handleMoreItemPress('DevShowcase')}
                  >
                    <View style={[
                      styles.trayOptionIcon,
                      activeRoute === 'DevShowcase' && styles.trayOptionIconActive,
                    ]}>
                      <Heart 
                        size={20} 
                        color={activeRoute === 'DevShowcase' ? colors.primary : colors.textSecondary} 
                        strokeWidth={2}
                      />
                    </View>
                    <View style={styles.trayOptionContent}>
                      <Text style={[
                        styles.trayOptionTitle,
                        activeRoute === 'DevShowcase' && styles.trayOptionTitleActive,
                      ]}>
                        Partner Features
                      </Text>
                      <Text style={styles.trayOptionSubtitle}>
                        Dev showcase (Development only)
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 72,
  },
  
  // Unified Navigation
  unifiedNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Left Section - Timeline & Calendar
  leftSection: {
    flexDirection: 'row',
    flex: 1,
    paddingLeft: 8,
  },
  navTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
    minHeight: 40,
    marginRight: 4,
  },
  navTabActive: {
  },
  navTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  navTabTextActive: {
    color: '#FF6B9D',
  },
  
  // Right Section - Action Buttons
  rightSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingRight: 8,
    paddingBottom: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 30,
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  createAction: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  createActionInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  
  // Tray Modal - Matching TaskDetailsTray design
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20, // Position above the navigation bar
    paddingHorizontal: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  trayContainer: {
    width: screenWidth * 0.9,
    height: 280, // Fixed height for More tray
  },
  containerInner: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    flex: 1,
    overflow: 'hidden',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.textSecondary,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  trayContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  trayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  trayOptionActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    borderColor: colors.primary,
  },
  trayOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  trayOptionIconActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: colors.primary,
  },
  trayOptionContent: {
    flex: 1,
  },
  trayOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  trayOptionTitleActive: {
    color: colors.primary,
  },
  trayOptionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default FloatingNavigation;