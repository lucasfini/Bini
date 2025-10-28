import React, { useEffect, useState } from 'react';
import { View, Pressable, Text, Image } from 'react-native';
// Removed Tamagui components due to token parsing issues
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withDelay,
  interpolate
} from 'react-native-reanimated';
import { 
  Camera, 
  MapPin, 
  MessageCircle, 
  Award, 
  Heart,
  Sparkles,
  Clock
} from 'lucide-react-native';
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
import FastImage from 'react-native-fast-image';
import { usePartnerInteraction } from '../../providers/PartnerInteractionProvider';
import { useFeatureFlags } from '../../providers/FeatureFlagsProvider';
import { SerendipityBurst } from '../../types/partnerInteraction';

interface SerendipityBurstFeedProps {
  style?: any;
  maxItems?: number;
}

interface BurstItemProps {
  burst: SerendipityBurst;
  onReact: (burstId: string, emotion: string) => void;
  onPress: (burst: SerendipityBurst) => void;
}

function BurstItem({ burst, onReact, onPress }: BurstItemProps) {
  const [showReactions, setShowReactions] = useState(false);
  const scale = useSharedValue(burst.isNew ? 0 : 1);
  const glow = useSharedValue(burst.isNew ? 1 : 0);
  const sparkle = useSharedValue(0);

  useEffect(() => {
    if (burst.isNew) {
      // New burst entrance animation
      scale.value = withSequence(
        withDelay(100, withSpring(1.1)),
        withSpring(1)
      );
      
      // Glow effect for new items
      glow.value = withSequence(
        withSpring(1),
        withDelay(2000, withSpring(0))
      );
      
      // Sparkle animation
      sparkle.value = withSequence(
        withDelay(200, withSpring(1)),
        withDelay(1000, withSpring(0))
      );
      
      // Haptic feedback for new burst
      HapticFeedback.trigger('impactLight');
    }
  }, [burst.isNew]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    shadowOpacity: interpolate(glow.value, [0, 1], [0, 0.3]),
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkle.value,
    transform: [{ scale: sparkle.value }],
  }));

  const getTypeIcon = () => {
    switch (burst.type) {
      case 'photo': return <Camera size={16} color="#6b7280" />;
      case 'message': return <MessageCircle size={16} color="#6b7280" />;
      case 'location': return <MapPin size={16} color="#6b7280" />;
      case 'achievement': return <Award size={16} color="#6b7280" />;
      default: return <Sparkles size={16} color="#6b7280" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const reactions = ['❤️', '😍', '🤗', '🥰', '✨'];

  return (
    <Animated.View style={[animatedStyle, glowStyle]}>
      <Pressable 
        onPress={() => onPress(burst)}
        onLongPress={() => setShowReactions(!showReactions)}
        className="bg-white rounded-xl p-3 mb-3"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ gap: 8 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {getTypeIcon()}
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
                {burst.fromPartner ? 'From Partner' : 'From You'}
              </Text>
              {burst.isNew && (
                <Animated.View style={sparkleStyle}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#f59e0b',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={4} color="white" />
                  </View>
                </Animated.View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Clock size={12} color="#9ca3af" />
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {formatTimestamp(burst.timestamp)}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View>
            {burst.type === 'photo' && burst.content?.uri && (
              <FastImage
                source={{ uri: burst.content.uri }}
                style={{ 
                  width: '100%', 
                  height: 200, 
                  borderRadius: 8,
                  backgroundColor: '#f3f4f6'
                }}
                resizeMode="cover"
              />
            )}
            
            {burst.type === 'message' && (
              <Text style={{ color: '#1f2937', fontSize: 16, lineHeight: 24 }}>
                {burst.content?.text || 'Sent you a message'}
              </Text>
            )}
            
            {burst.type === 'location' && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 8, 
                padding: 12, 
                backgroundColor: '#dbeafe', 
                borderRadius: 8 
              }}>
                <MapPin size={20} color="#3b82f6" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '500', color: '#1e3a8a' }}>
                    {burst.content?.name || 'Shared Location'}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#1d4ed8' }}>
                    {burst.content?.address || 'Tap to view on map'}
                  </Text>
                </View>
              </View>
            )}
            
            {burst.type === 'achievement' && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 8, 
                padding: 12, 
                backgroundColor: '#fef3c7', 
                borderRadius: 8 
              }}>
                <Award size={20} color="#f59e0b" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '500', color: '#78350f' }}>
                    {burst.content?.title || 'New Achievement'}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#92400e' }}>
                    {burst.content?.description || 'Unlocked something special!'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Emotion indicator */}
          {burst.emotion && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 18 }}>{burst.emotion}</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Feeling</Text>
            </View>
          )}

          {/* Quick reactions */}
          {showReactions && (
            <View style={{ 
              flexDirection: 'row', 
              gap: 8, 
              justifyContent: 'center', 
              padding: 8 
            }}>
              {reactions.map((emoji, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    onReact(burst.id, emoji);
                    setShowReactions(false);
                    HapticFeedback.trigger('impactLight');
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#f3f4f6',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function SerendipityBurstFeed({ style, maxItems = 10 }: SerendipityBurstFeedProps) {
  const { isFeatureEnabled } = useFeatureFlags();
  const { serendipityBursts, sendSerendipityBurst, markSerendipityAsRead } = usePartnerInteraction();
  
  // Don't render if feature is disabled
  if (!isFeatureEnabled('serendipityBursts')) {
    return null;
  }

  const displayBursts = serendipityBursts.slice(0, maxItems);

  const handleReact = async (burstId: string, emotion: string) => {
    try {
      // Send reaction as a new serendipity burst
      await sendSerendipityBurst('message', {
        text: `Reacted ${emotion} to your burst`,
        referenceBurstId: burstId,
        type: 'reaction'
      });
    } catch (error) {
      console.error('Failed to send reaction:', error);
    }
  };

  const handleBurstPress = (burst: SerendipityBurst) => {
    // Mark as read
    markSerendipityAsRead(burst.id);
    
    // Handle different burst types
    switch (burst.type) {
      case 'photo':
        // Open photo viewer
        break;
      case 'location':
        // Open maps
        break;
      case 'achievement':
        // Show achievement details
        break;
      default:
        // Default action
        break;
    }
  };

  const handleCreateBurst = () => {
    // This would open a creation modal
    console.log('Create new serendipity burst');
  };

  if (displayBursts.length === 0) {
    return (
      <View style={[{
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        gap: 12
      }, style]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} color="#a855f7" />
            <Text style={{ fontWeight: '600', color: '#111827' }}>Serendipity Bursts</Text>
          </View>
          <Pressable onPress={handleCreateBurst}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#a855f7',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
            </View>
          </Pressable>
        </View>
        
        <View style={{ alignItems: 'center', gap: 8, padding: 24 }}>
          <Sparkles size={40} color="#d1d5db" />
          <Text style={{ textAlign: 'center', color: '#6b7280' }}>
            No serendipity bursts yet
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>
            Share a spontaneous moment with your partner
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[{ gap: 12 }, style]}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 4 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Sparkles size={20} color="#a855f7" />
          <Text style={{ fontWeight: '600', color: '#111827' }}>Serendipity Bursts</Text>
          {serendipityBursts.filter(b => b.isNew).length > 0 && (
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#dc2626',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                {serendipityBursts.filter(b => b.isNew).length}
              </Text>
            </View>
          )}
        </View>
        <Pressable onPress={handleCreateBurst}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#a855f7',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
          </View>
        </Pressable>
      </View>

      {/* Burst feed */}
      <View>
        {displayBursts.map((burst) => (
          <BurstItem
            key={burst.id}
            burst={burst}
            onReact={handleReact}
            onPress={handleBurstPress}
          />
        ))}
      </View>

      {/* Load more indicator */}
      {serendipityBursts.length > maxItems && (
        <Pressable style={{ padding: 12, alignItems: 'center' }}>
          <Text style={{ color: '#9333ea', fontWeight: '500' }}>
            View {serendipityBursts.length - maxItems} more bursts
          </Text>
        </Pressable>
      )}
    </View>
  );
}