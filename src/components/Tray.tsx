// src/components/Tray.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ChevronLeft } from '@tamagui/lucide-icons';

const { height: screenHeight } = Dimensions.get('window');

interface TrayButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'primary';
}

interface TrayProps {
  visible: boolean;  
  onClose: () => void;
  onBack?: () => void;
  title: string;
  children: React.ReactNode;
  height?: 'short' | 'medium' | 'tall';
  isDarkMode?: boolean;
  leftButton?: TrayButton;
  rightButton?: TrayButton;
}

const Tray: React.FC<TrayProps> = ({
  visible,
  onClose,
  onBack,
  title,
  children,
  height = 'medium',
  isDarkMode = false,
  leftButton,
  rightButton,
}) => {
  const theme = {
    background: isDarkMode ? '#1F2937' : '#FFFFFF',
    text: isDarkMode ? '#F9FAFB' : '#111827',
    textSecondary: isDarkMode ? '#D1D5DB' : '#6B7280',
    border: isDarkMode ? '#374151' : '#E5E7EB',
    buttonPrimary: '#4A7C3A',
    buttonSecondary: isDarkMode ? '#4B5563' : '#F3F4F6',
    dragHandle: isDarkMode ? '#4B5563' : '#D1D5DB',
  };

  // Animation values
  const translateY = useSharedValue(screenHeight);
  const opacity = useSharedValue(0);

  // Height configurations
  const heightConfig = {
    short: '50%',
    medium: '70%', 
    tall: '85%',
  };

  const showTray = () => {
    'worklet';
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
      mass: 1,
    });
  };

  const hideTray = (callback?: () => void) => {
    'worklet';
    translateY.value = withTiming(screenHeight, { duration: 300 });
    opacity.value = withTiming(0, { duration: 250 }, finished => {
      if (finished && callback) {
        runOnJS(callback)();
      }
    });
  };

  useEffect(() => {
    if (visible) {
      translateY.value = screenHeight;
      opacity.value = 0;
      setTimeout(() => {
        showTray();
      }, 50);
    }
  }, [visible]);

  const handleClose = () => {
    hideTray(() => onClose());
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const trayStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.3)" barStyle="dark-content" />

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Tray */}
      <Animated.View 
        style={[
          styles.trayContainer, 
          { height: heightConfig[height] },
          trayStyle
        ]}
      >
        <View style={[styles.tray, { backgroundColor: theme.background }]}>
          {/* Drag Handle */}
          <View style={[styles.dragHandle, { backgroundColor: theme.dragHandle }]} />

          {/* Header */}
          <View style={styles.header}>
            {/* Left Button or Back Button */}
            <View style={styles.headerLeft}>
              {onBack ? (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={onBack}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
              ) : leftButton ? (
                <TouchableOpacity
                  style={[
                    styles.headerButton,
                    { backgroundColor: theme.buttonSecondary }
                  ]}
                  onPress={leftButton.onPress}
                >
                  <Text style={[styles.headerButtonText, { color: theme.text }]}>
                    {leftButton.text}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.headerButtonPlaceholder} />
              )}
            </View>

            {/* Title */}
            <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
              {title}
            </Text>

            {/* Right Button */}
            <View style={styles.headerRight}>
              {rightButton ? (
                <TouchableOpacity
                  style={[
                    styles.headerButton,
                    rightButton.style === 'primary' && { backgroundColor: theme.buttonPrimary }
                  ]}
                  onPress={rightButton.onPress}
                >
                  <Text 
                    style={[
                      styles.headerButtonText,
                      { color: rightButton.style === 'primary' ? '#FFFFFF' : theme.text }
                    ]}
                  >
                    {rightButton.text}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.headerButtonPlaceholder} />
              )}
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  trayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tray: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerLeft: {
    width: 80,
    alignItems: 'flex-start',
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  headerButton: {
    paddingHorizontal: 12, 
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerButtonPlaceholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
});

export default Tray;