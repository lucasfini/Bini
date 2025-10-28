import React, { useEffect, useRef } from 'react';
import { View, Pressable, Text } from 'react-native';
// Removed Tamagui components due to token parsing issues
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  interpolate,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { Play, Pause, RotateCcw, Users, Heart } from 'lucide-react-native';
// Safe import with error handling
let HapticFeedback: any;
try {
  HapticFeedback = require('react-native-haptic-feedback');
} catch (error) {
  // Fallback if haptic feedback is not available
  HapticFeedback = {
    trigger: () => console.log('Haptic feedback not available'),
  };
}
import LottieView from 'lottie-react-native';
import { usePartnerInteraction } from '../../providers/PartnerInteractionProvider';
import { useFeatureFlags } from '../../providers/FeatureFlagsProvider';

interface SynchroBeatRitualProps {
  style?: any;
}

export default function SynchroBeatRitual({ style }: SynchroBeatRitualProps) {
  const { isFeatureEnabled } = useFeatureFlags();
  const { 
    synchroBeat, 
    startSynchroBeat, 
    joinSynchroBeat,
    isPartnerOnline 
  } = usePartnerInteraction();
  
  const store = usePartnerInteraction();
  const countdownScale = useSharedValue(1);
  const breathingScale = useSharedValue(1);
  const backgroundGlow = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);
  const lottieRef = useRef<LottieView>(null);
  
  // Don't render if feature is disabled
  if (!isFeatureEnabled('synchroBeat')) {
    return null;
  }

  // Countdown animation
  useEffect(() => {
    if (synchroBeat.stage === 'counting' && synchroBeat.countdown > 0) {
      countdownScale.value = withRepeat(
        withTiming(1.2, { duration: 500, easing: Easing.out(Easing.quad) }),
        2,
        true
      );
      
      // Trigger haptic feedback for each count
      HapticFeedback.trigger('impactLight');
      
      // Auto-decrement countdown
      const timer = setTimeout(() => {
        if (synchroBeat.countdown > 1) {
          store.setSynchroBeatCountdown(synchroBeat.countdown - 1);
        } else {
          // Start breathing phase
          runOnJS(() => store.setSynchroBeatStage('breathing'))();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [synchroBeat.stage, synchroBeat.countdown]);

  // Breathing animation
  useEffect(() => {
    if (synchroBeat.stage === 'breathing') {
      breathingScale.value = withRepeat(
        withTiming(1.3, { 
          duration: 4000, // 4 second inhale/exhale cycle
          easing: Easing.inOut(Easing.sine) 
        }),
        -1,
        true
      );
      
      // Auto-complete after 15 seconds of breathing
      const timer = setTimeout(() => {
        runOnJS(() => store.setSynchroBeatStage('complete'))();
      }, 15000);
      
      return () => clearTimeout(timer);
    } else {
      breathingScale.value = withTiming(1);
    }
  }, [synchroBeat.stage]);

  // Background glow animation
  useEffect(() => {
    if (synchroBeat.isActive) {
      backgroundGlow.value = withRepeat(
        withTiming(1, { duration: 3000 }),
        -1,
        true
      );
    } else {
      backgroundGlow.value = withTiming(0);
    }
  }, [synchroBeat.isActive]);

  // Pulse animation for sync indicator
  useEffect(() => {
    if (synchroBeat.partnerConnected) {
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      pulseAnimation.value = withTiming(0);
    }
  }, [synchroBeat.partnerConnected]);

  const countdownAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countdownScale.value }],
  }));

  const breathingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backgroundGlow.value, [0, 1], [0.1, 0.3]),
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseAnimation.value,
    transform: [{ scale: 1 + pulseAnimation.value * 0.1 }],
  }));

  const handleStartRitual = async () => {
    try {
      HapticFeedback.trigger('impactMedium');
      
      if (synchroBeat.stage === 'idle') {
        await startSynchroBeat();
      } else if (synchroBeat.stage === 'preparing') {
        await joinSynchroBeat();
      } else {
        // Reset ritual
        store.setSynchroBeatStage('idle');
      }
    } catch (error) {
      console.error('SynchroBeat error:', error);
    }
  };

  const getStageText = () => {
    switch (synchroBeat.stage) {
      case 'idle':
        return isPartnerOnline ? 'Start 15s Ritual' : 'Partner Offline';
      case 'preparing':
        return synchroBeat.partnerConnected ? 'Both Ready - Tap to Begin' : 'Waiting for Partner...';
      case 'counting':
        return 'Get Ready';
      case 'breathing':
        return 'Breathe Together';
      case 'complete':
        return 'Beautiful Connection ✨';
      default:
        return 'SynchroBeat Ritual';
    }
  };

  const getStageDescription = () => {
    switch (synchroBeat.stage) {
      case 'idle':
        return 'Sync your breathing with your partner for 15 seconds';
      case 'preparing':
        return 'Find a comfortable position and get ready to breathe together';
      case 'counting':
        return `Starting in ${synchroBeat.countdown}...`;
      case 'breathing':
        return 'Inhale... Exhale... Feel the connection';
      case 'complete':
        return 'You shared a moment of perfect synchrony';
      default:
        return '';
    }
  };

  const getMainColor = () => {
    switch (synchroBeat.stage) {
      case 'counting': return '#ffd93d';
      case 'breathing': return '#6bcf7f';
      case 'complete': return '#a78bfa';
      default: return '#3b82f6';
    }
  };

  return (
    <View style={[{
      padding: 16,
      backgroundColor: '#f9fafb',
      borderRadius: 16,
      gap: 16,
      position: 'relative'
    }, style]}>
      {/* Background glow */}
      <Animated.View 
        style={[
          backgroundAnimatedStyle,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: getMainColor(),
            borderRadius: 16,
          }
        ]} 
      />

      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Heart size={20} color="#3b82f6" />
          <Text style={{ fontWeight: '600', color: '#111827' }}>SynchroBeat</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Animated.View style={pulseAnimatedStyle}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: synchroBeat.partnerConnected ? '#22c55e' : '#6b7280'
            }} />
          </Animated.View>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>
            {synchroBeat.partnerConnected ? 'Partner synced' : isPartnerOnline ? 'Partner online' : 'Partner offline'}
          </Text>
        </View>
      </View>

      {/* Main ritual display */}
      <View style={{ alignItems: 'center', gap: 16, zIndex: 1 }}>
        {/* Central animation area */}
        <View style={{ height: 120, alignItems: 'center', justifyContent: 'center' }}>
          {synchroBeat.stage === 'counting' && (
            <Animated.View style={countdownAnimatedStyle}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255, 217, 61, 0.2)',
                borderColor: '#ffd93d',
                borderWidth: 3,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#d97706' }}>
                  {synchroBeat.countdown}
                </Text>
              </View>
            </Animated.View>
          )}
          
          {synchroBeat.stage === 'breathing' && (
            <Animated.View style={breathingAnimatedStyle}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(107, 207, 127, 0.2)',
                borderColor: '#6bcf7f',
                borderWidth: 3,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Heart size={40} color="#6bcf7f" fill="#6bcf7f" />
              </View>
            </Animated.View>
          )}
          
          {synchroBeat.stage === 'complete' && (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <LottieView
                ref={lottieRef}
                source={require('../../assets/animations/celebration.json')}
                autoPlay
                loop={false}
                style={{ width: 100, height: 100 }}
              />
            </View>
          )}
          
          {(synchroBeat.stage === 'idle' || synchroBeat.stage === 'preparing') && (
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderColor: '#3b82f6',
              borderWidth: 3,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={40} color="#3b82f6" />
            </View>
          )}
        </View>

        {/* Stage text */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', textAlign: 'center' }}>
            {getStageText()}
          </Text>
          <Text style={{ fontSize: 14, color: '#4b5563', textAlign: 'center', maxWidth: 256 }}>
            {getStageDescription()}
          </Text>
        </View>

        {/* Timer display during breathing */}
        {synchroBeat.stage === 'breathing' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#22c55e'
            }} />
            <Text style={{ fontSize: 14, color: '#15803d', fontWeight: '500' }}>
              Breathing in sync...
            </Text>
          </View>
        )}
      </View>

      {/* Action button */}
      <Pressable 
        onPress={handleStartRitual}
        disabled={!isPartnerOnline && synchroBeat.stage === 'idle'}
        style={{
          backgroundColor: !isPartnerOnline && synchroBeat.stage === 'idle' ? '#f3f4f6' : getMainColor(),
          padding: 16,
          borderRadius: 12,
          opacity: !isPartnerOnline && synchroBeat.stage === 'idle' ? 0.5 : 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {synchroBeat.stage === 'idle' ? (
            <Play size={20} color="white" />
          ) : synchroBeat.stage === 'complete' ? (
            <RotateCcw size={20} color="white" />
          ) : (
            <Pause size={20} color="white" />
          )}
          <Text style={{ textAlign: 'center', fontWeight: '600', color: 'white' }}>
            {synchroBeat.stage === 'idle' 
              ? 'Begin Ritual' 
              : synchroBeat.stage === 'complete' 
              ? 'Restart' 
              : 'In Progress...'}
          </Text>
        </View>
      </Pressable>

      {/* Instructions for first time */}
      {synchroBeat.stage === 'idle' && (
        <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
          A 15-second breathing ritual to synchronize with your partner
        </Text>
      )}
    </View>
  );
}