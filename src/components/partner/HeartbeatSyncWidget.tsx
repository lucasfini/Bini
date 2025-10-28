import React, { useEffect, useRef } from 'react';
import { View, Pressable, Text } from 'react-native';
// Removed Tamagui components due to token parsing issues
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { Heart, Zap, Users } from 'lucide-react-native';
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
import { usePartnerInteraction } from '../../providers/PartnerInteractionProvider';
import { useFeatureFlags } from '../../providers/FeatureFlagsProvider';

interface HeartbeatSyncWidgetProps {
  style?: any;
  compact?: boolean;
}

export default function HeartbeatSyncWidget({ style, compact = false }: HeartbeatSyncWidgetProps) {
  const { isFeatureEnabled } = useFeatureFlags();
  const { 
    heartbeatSync, 
    startHeartbeatSync, 
    stopHeartbeatSync, 
    updateChargeLevel,
    isPartnerOnline 
  } = usePartnerInteraction();
  
  const heartScale = useSharedValue(1);
  const chargeGlow = useSharedValue(0);
  const syncPulse = useSharedValue(0);
  
  // Don't render if feature is disabled
  if (!isFeatureEnabled('heartbeatSync')) {
    return null;
  }

  // Heart animation based on heart rate
  useEffect(() => {
    if (heartbeatSync.isActive && heartbeatSync.userHeartRate) {
      const bpm = heartbeatSync.userHeartRate;
      const duration = (60 / bpm) * 1000; // Convert BPM to milliseconds
      
      heartScale.value = withRepeat(
        withTiming(1.2, { duration: duration / 3 }),
        -1,
        true
      );
    } else {
      heartScale.value = withTiming(1);
    }
  }, [heartbeatSync.isActive, heartbeatSync.userHeartRate]);

  // Charge level glow animation
  useEffect(() => {
    chargeGlow.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  // Sync quality pulse
  useEffect(() => {
    if (heartbeatSync.syncQuality === 'excellent' && heartbeatSync.partnerHeartRate) {
      syncPulse.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      syncPulse.value = withTiming(0);
    }
  }, [heartbeatSync.syncQuality, heartbeatSync.partnerHeartRate]);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const chargeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(chargeGlow.value, [0, 1], [0.6, 1]),
  }));

  const syncAnimatedStyle = useAnimatedStyle(() => ({
    opacity: syncPulse.value,
    transform: [{ scale: 1 + syncPulse.value * 0.1 }],
  }));

  const progressGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(chargeGlow.value, [0, 1], [0.8, 1]),
  }));

  const handleToggleSync = async () => {
    try {
      HapticFeedback.trigger('impactMedium');
      
      if (heartbeatSync.isActive) {
        stopHeartbeatSync();
      } else {
        await startHeartbeatSync();
        // Simulate heart rate detection (in real app, use actual sensor)
        simulateHeartRateDetection();
      }
    } catch (error) {
      console.error('Heartbeat sync error:', error);
    }
  };

  const simulateHeartRateDetection = () => {
    // Simulate realistic heart rate values (60-100 BPM)
    const userBPM = 70 + Math.random() * 20; // 70-90 BPM
    const partnerBPM = isPartnerOnline ? userBPM + (Math.random() - 0.5) * 10 : undefined;
    
    // Update heart rates every 2 seconds
    const interval = setInterval(() => {
      if (!heartbeatSync.isActive) {
        clearInterval(interval);
        return;
      }
      
      const newUserBPM = userBPM + (Math.random() - 0.5) * 5;
      const newPartnerBPM = partnerBPM ? partnerBPM + (Math.random() - 0.5) * 5 : undefined;
      
      // Calculate charge based on sync quality
      let chargeIncrease = 0;
      if (newPartnerBPM) {
        const diff = Math.abs(newUserBPM - newPartnerBPM);
        if (diff < 5) chargeIncrease = 3; // Excellent sync
        else if (diff < 10) chargeIncrease = 2; // Good sync
        else chargeIncrease = 1; // Poor sync
      } else {
        chargeIncrease = 0.5; // Solo mode
      }
      
      updateChargeLevel(Math.min(100, heartbeatSync.chargeLevel + chargeIncrease));
    }, 2000);
  };

  const getChargeColor = () => {
    if (heartbeatSync.chargeLevel < 30) return '#ff6b6b';
    if (heartbeatSync.chargeLevel < 70) return '#ffd93d';
    return '#6bcf7f';
  };

  const getSyncQualityColor = () => {
    switch (heartbeatSync.syncQuality) {
      case 'excellent': return '#6bcf7f';
      case 'good': return '#ffd93d';
      case 'poor': return '#ff6b6b';
      default: return '#999';
    }
  };

  if (compact) {
    return (
      <Pressable onPress={handleToggleSync} style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>
        <Animated.View style={heartAnimatedStyle}>
          <Heart 
            size={24} 
            color={heartbeatSync.isActive ? '#ff6b6b' : '#999'} 
            fill={heartbeatSync.isActive ? '#ff6b6b' : 'transparent'}
          />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <View style={{
            height: 4,
            backgroundColor: '#6b7280',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <View style={{
              height: '100%',
              width: `${heartbeatSync.chargeLevel}%`,
              backgroundColor: getChargeColor(),
              borderRadius: 2,
            }} />
          </View>
          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            {heartbeatSync.chargeLevel}% charged
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[{
      padding: 16,
      backgroundColor: '#f9fafb',
      borderRadius: 16,
      gap: 16,
    }, style]}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Heart size={20} color="#dc2626" />
          <Text style={{ fontWeight: '600', color: '#111827' }}>Heartbeat Sync</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: isPartnerOnline ? '#22c55e' : '#6b7280'
          }} />
          <Text style={{ fontSize: 12, color: '#6b7280' }}>
            {isPartnerOnline ? 'Partner online' : 'Partner offline'}
          </Text>
        </View>
      </View>

      {/* Main sync display */}
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Pressable onPress={handleToggleSync} style={{ position: 'relative' }}>
          <Animated.View style={[heartAnimatedStyle, { alignItems: 'center' }]}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#fef2f2',
              borderColor: '#dc2626',
              borderWidth: 2,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Heart 
                size={32} 
                color="#dc2626" 
                fill={heartbeatSync.isActive ? '#dc2626' : 'transparent'} 
              />
            </View>
          </Animated.View>
          
          {/* Sync quality indicator */}
          {heartbeatSync.partnerHeartRate && (
            <Animated.View 
              style={[
                syncAnimatedStyle, 
                {
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: getSyncQualityColor(),
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              ]}
            >
              <Users size={12} color="white" />
            </Animated.View>
          )}
        </Pressable>

        {/* Heart rate display */}
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
              {heartbeatSync.userHeartRate ? Math.round(heartbeatSync.userHeartRate) : '--'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>You</Text>
          </View>
          
          {heartbeatSync.partnerHeartRate && (
            <>
              <View style={{ width: 1, height: 30, backgroundColor: '#d1d5db' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
                  {Math.round(heartbeatSync.partnerHeartRate)}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>Partner</Text>
              </View>
            </>
          )}
        </View>

        {/* Sync quality */}
        {heartbeatSync.partnerHeartRate && (
          <Text style={{ fontSize: 14, textAlign: 'center', color: getSyncQualityColor() }}>
            {heartbeatSync.syncQuality.charAt(0).toUpperCase() + heartbeatSync.syncQuality.slice(1)} sync
          </Text>
        )}
      </View>

      {/* Charge level */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Animated.View style={chargeAnimatedStyle}>
              <Zap size={16} color={getChargeColor()} fill={getChargeColor()} />
            </Animated.View>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Connection Energy</Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: getChargeColor() }}>
            {heartbeatSync.chargeLevel}%
          </Text>
        </View>
        
        <View style={{
          height: 6,
          backgroundColor: '#6b7280',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <Animated.View style={[
            progressGlowStyle,
            {
              height: '100%',
              width: `${heartbeatSync.chargeLevel}%`,
              backgroundColor: getChargeColor(),
              borderRadius: 3,
            }
          ]} />
        </View>
        
        <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
          {heartbeatSync.chargeLevel < 30 
            ? "Sync hearts to build energy together" 
            : heartbeatSync.chargeLevel < 70 
            ? "Good connection building..." 
            : "Strong connection! Keep syncing ✨"}
        </Text>
      </View>

      {/* Action button */}
      <Pressable 
        onPress={handleToggleSync}
        style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: heartbeatSync.isActive ? '#fee2e2' : '#f3f4f6'
        }}
      >
        <Text style={{
          textAlign: 'center',
          fontWeight: '600',
          color: heartbeatSync.isActive ? '#b91c1c' : '#374151'
        }}>
          {heartbeatSync.isActive ? 'Stop Sync' : 'Start Heartbeat Sync'}
        </Text>
      </Pressable>
    </View>
  );
}