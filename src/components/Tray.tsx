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
import { colors } from '../styles';
import { useTheme } from '../context/ThemeContext';

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
  leftButton,
  rightButton,
}) => {
  const { theme } = useTheme();
  
  // Force dark theme for this component
  const darkTheme = {
    background: '#1A1A1A',
    surface: '#2A2A2A',
    border: '#3A3A3A',
    textPrimary: '#FFFFFF',
    textSecondary: '#CCCCCC',
  };

  // Animation values
  const translateY = useSharedValue(screenHeight);
  const opacity = useSharedValue(0);

  // Height configurations - updated to match ModernDateTimePicker heights
  const heightConfig = {
    short: screenHeight * 0.5,  // 50% for compact trays
    medium: screenHeight * 0.6, // 60% for medium trays  
    tall: screenHeight * 0.65,  // 65% for large trays
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
      <StatusBar backgroundColor="rgba(0,0,0,0.3)" barStyle="light-content" />

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
        <View style={[styles.tray, { backgroundColor: darkTheme.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: darkTheme.border }]}>
            {/* Title */}
            <Text style={[styles.headerTitle, { color: darkTheme.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
            
            {/* Close Button */}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: darkTheme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  trayContainer: {
    position: 'absolute',
    bottom: 40,
    left: '5%',
    right: '5%',
    width: '90%',
    alignSelf: 'center',
  },
  tray: {
    flex: 1,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '400',
  },
  content: {
    flex: 1,
  },
});

export default Tray;