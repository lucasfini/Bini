// src/components/StartupAnimation.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface StartupAnimationProps {
  onAnimationComplete: () => void;
}

const StartupAnimation: React.FC<StartupAnimationProps> = ({ onAnimationComplete }) => {
  // Animation values - start pills far apart for dramatic entrance
  const leftPillX = useSharedValue(-200); // Further left
  const rightPillX = useSharedValue(200); // Further right
  const leftPillY = useSharedValue(0);
  const rightPillY = useSharedValue(0);
  const leftPillOpacity = useSharedValue(0);
  const rightPillOpacity = useSharedValue(0);
  const leftPillScale = useSharedValue(0.8); // Start closer to full size
  const rightPillScale = useSharedValue(0.8); // Start closer to full size
  const leftPillRotation = useSharedValue(0);
  const rightPillRotation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const backgroundOpacity = useSharedValue(1);
  const logoGlow = useSharedValue(0);
  
  useEffect(() => {
    // Start the animation sequence
    startAnimation();
  }, []);

  const startAnimation = () => {
    // Start movement from far left/right positions immediately
    leftPillX.value = withSpring(-20, {
      damping: 15,
      stiffness: 120,
    });
    rightPillX.value = withSpring(20, {
      damping: 15,
      stiffness: 120,
    });
    leftPillY.value = withSpring(-10, {
      damping: 15,
      stiffness: 120,
    });
    rightPillY.value = withSpring(10, {
      damping: 15,
      stiffness: 120,
    });
    
    // Quick fade in - pills become visible almost immediately after movement starts
    setTimeout(() => {
      leftPillOpacity.value = withTiming(1, { duration: 200 }); // Quick fade
      rightPillOpacity.value = withTiming(1, { duration: 200 }); // Quick fade
      leftPillScale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      rightPillScale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }, 50); // Very short delay - almost immediate

    // Phase 2: Add rotation while continuing movement (0.8-1.8s)
    setTimeout(() => {
      // Rotate pills to form interlocking shape
      leftPillRotation.value = withSpring(15, { damping: 15 });
      rightPillRotation.value = withSpring(-15, { damping: 15 });
    }, 800);

    // Phase 3: Transform pills into final logo shape (1.8-2.5s)
    setTimeout(() => {
      // Move to final positions to create logo
      leftPillX.value = withSpring(-15, { damping: 12 });
      rightPillX.value = withSpring(15, { damping: 12 });
      leftPillY.value = withSpring(-8, { damping: 12 });
      rightPillY.value = withSpring(8, { damping: 12 });
      
      // Scale slightly larger for logo formation
      leftPillScale.value = withSpring(1.1, { damping: 12 });
      rightPillScale.value = withSpring(1.1, { damping: 12 });
      
      // Final rotation for interlocked appearance
      leftPillRotation.value = withSpring(20, { damping: 12 });
      rightPillRotation.value = withSpring(-20, { damping: 12 });
      
      // Add glow effect
      logoGlow.value = withTiming(1, { duration: 600 });
    }, 1800);

    // Phase 4: Show title (1.8-2.4s) - 1 second sooner
    setTimeout(() => {
      titleOpacity.value = withTiming(1, { duration: 600 });
      titleTranslateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
    }, 1800);

    // Phase 5: Complete animation (4s)
    setTimeout(() => {
      backgroundOpacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onAnimationComplete)();
      });
    }, 4000);
  };

  // Animated styles for left pill
  const leftPillStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: leftPillX.value },
        { translateY: leftPillY.value },
        { rotate: `${leftPillRotation.value}deg` },
        { scale: leftPillScale.value },
      ],
      opacity: leftPillOpacity.value,
    };
  });

  // Animated styles for right pill
  const rightPillStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: rightPillX.value },
        { translateY: rightPillY.value },
        { rotate: `${rightPillRotation.value}deg` },
        { scale: rightPillScale.value },
      ],
      opacity: rightPillOpacity.value,
    };
  });

  // Animated styles for logo glow effect
  const logoGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: logoGlow.value * 0.6,
      transform: [{ scale: 1 + logoGlow.value * 0.1 }],
    };
  });

  // Animated styles for title
  const titleStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }],
    };
  });

  // Animated styles for background
  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      <StatusBar backgroundColor="#1A1A1A" barStyle="light-content" />
      
      {/* Animation Stage */}
      <View style={styles.animationContainer}>
        
        {/* Logo Glow Background Effect */}
        <Animated.View style={[styles.logoGlow, logoGlowStyle]} />
        
        {/* Left Pill - Light Pink */}
        <Animated.View style={[styles.leftPill, leftPillStyle]} />
        
        {/* Right Pill - Light Blue */}
        <Animated.View style={[styles.rightPill, rightPillStyle]} />
        
        {/* App Title */}
        <Animated.Text style={[styles.appTitle, titleStyle]}>
          BINI
        </Animated.Text>
        
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  // Logo Glow Effect
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 40,
    shadowColor: '#FFE55C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 10,
  },
  
  // Pill Shapes - Larger and more prominent
  leftPill: {
    position: 'absolute',
    width: 100,
    height: 36,
    backgroundColor: '#FF9FB2', // Slightly stronger pink
    borderRadius: 18,
    shadowColor: '#FF9FB2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  rightPill: {
    position: 'absolute',
    width: 100,
    height: 36,
    backgroundColor: '#9BC4E2', // Slightly stronger blue
    borderRadius: 18,
    shadowColor: '#9BC4E2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // App Title
  appTitle: {
    position: 'absolute',
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 6,
    marginTop: 120,
    textAlign: 'center',
    fontFamily: 'System',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default StartupAnimation;