import React, { useEffect } from 'react';
import { View, Pressable, Text } from 'react-native';
// Removed Tamagui components due to token parsing issues
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { 
  Target, 
  Users, 
  Trophy, 
  CheckCircle, 
  Clock,
  Star,
  Zap
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
import { usePartnerInteraction } from '../../providers/PartnerInteractionProvider';
import { useFeatureFlags } from '../../providers/FeatureFlagsProvider';
import { CooperativeQuest, QuestStep } from '../../types/partnerInteraction';

interface CooperativeQuestWidgetProps {
  style?: any;
  compact?: boolean;
}

interface QuestCardProps {
  quest: CooperativeQuest;
  onStepComplete: (questId: string, stepId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function QuestStepItem({ step, onComplete, questId, canComplete }: {
  step: QuestStep;
  onComplete: (questId: string, stepId: string) => void;
  questId: string;
  canComplete: boolean;
}) {
  const checkScale = useSharedValue(step.isCompleted ? 1 : 0);
  const glowPulse = useSharedValue(0);

  useEffect(() => {
    if (step.isCompleted) {
      checkScale.value = withSpring(1);
    }
    
    if (canComplete && !step.isCompleted) {
      glowPulse.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    } else {
      glowPulse.value = withTiming(0);
    }
  }, [step.isCompleted, canComplete]);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.5, 1]),
  }));

  const getAssignmentColor = () => {
    switch (step.assignedTo) {
      case 'user': return '#3b82f6';
      case 'partner': return '#8b5cf6';
      case 'both': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getAssignmentText = () => {
    switch (step.assignedTo) {
      case 'user': return 'Your task';
      case 'partner': return 'Partner\'s task';
      case 'both': return 'Together';
      default: return 'Unassigned';
    }
  };

  return (
    <Pressable
      onPress={() => {
        if (canComplete && !step.isCompleted) {
          onComplete(questId, step.id);
          HapticFeedback.trigger('impactMedium');
        }
      }}
      disabled={!canComplete || step.isCompleted}
    >
      <Animated.View 
        style={[
          glowAnimatedStyle,
          {
            backgroundColor: step.isCompleted ? '#f0fdf4' : canComplete ? '#fefce8' : '#f9fafb',
            borderColor: step.isCompleted ? '#22c55e' : canComplete ? '#eab308' : '#e5e7eb',
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
          }
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Completion indicator */}
          <View style={{ position: 'relative', width: 24, height: 24 }}>
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: step.isCompleted ? '#22c55e' : '#e5e7eb',
              borderColor: step.isCompleted ? '#22c55e' : '#9ca3af',
              borderWidth: 1
            }} />
            <Animated.View 
              style={[
                checkAnimatedStyle,
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              ]}
            >
              <CheckCircle size={16} color="white" />
            </Animated.View>
          </View>

          {/* Step content */}
          <View style={{ flex: 1, gap: 4 }}>
            <Text 
              style={{ 
                fontWeight: '500', 
                color: step.isCompleted ? '#15803d' : '#111827',
                textDecorationLine: step.isCompleted ? 'line-through' : 'none' 
              }}
            >
              {step.title}
            </Text>
            <Text style={{ fontSize: 14, color: '#4b5563' }}>
              {step.description}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <View 
                style={{
                  backgroundColor: getAssignmentColor(),
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 12, color: 'white', fontWeight: '500' }}>
                  {getAssignmentText()}
                </Text>
              </View>
              {step.requiresBoth && (
                <View style={{ backgroundColor: '#f3e8ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                  <Text style={{ fontSize: 12, color: '#7c3aed', fontWeight: '500' }}>
                    Both needed
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function QuestCard({ quest, onStepComplete, isExpanded, onToggleExpand }: QuestCardProps) {
  const progressGlow = useSharedValue(0);
  const rewardShine = useSharedValue(0);

  useEffect(() => {
    // Progress glow animation
    progressGlow.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );

    // Reward shine when quest is complete
    if (quest.progress >= 100) {
      rewardShine.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [quest.progress]);

  const progressGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progressGlow.value, [0, 1], [0.8, 1]),
  }));

  const rewardShineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rewardShine.value, [0, 1], [0.6, 1]),
    transform: [{ scale: interpolate(rewardShine.value, [0, 1], [1, 1.05]) }],
  }));

  const completedSteps = quest.steps.filter(step => step.isCompleted).length;
  const userCanComplete = (stepId: string) => {
    const step = quest.steps.find(s => s.id === stepId);
    return step && (step.assignedTo === 'user' || step.assignedTo === 'both') && !step.isCompleted;
  };

  const getDeadlineText = () => {
    if (!quest.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(quest.deadline);
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days left`;
  };

  const getProgressColor = () => {
    if (quest.progress >= 100) return '#22c55e';
    if (quest.progress >= 70) return '#eab308';
    if (quest.progress >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <View style={{
      backgroundColor: '#f9fafb',
      borderRadius: 16,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: quest.progress >= 100 ? '#22c55e' : '#d1d5db'
    }}>
      {/* Quest header */}
      <Pressable onPress={onToggleExpand}>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Target size={20} color="#6b7280" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: '#111827' }} numberOfLines={1}>
                  {quest.title}
                </Text>
                <Text style={{ fontSize: 14, color: '#4b5563' }} numberOfLines={2}>
                  {quest.description}
                </Text>
              </View>
            </View>
            {quest.progress >= 100 && (
              <Animated.View style={rewardShineStyle}>
                <Trophy size={24} color="#f59e0b" />
              </Animated.View>
            )}
          </View>

          {/* Progress bar */}
          <Animated.View style={progressGlowStyle}>
            <View style={{
              height: 6,
              backgroundColor: '#6b7280',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <View style={{
                height: '100%',
                width: `${quest.progress}%`,
                backgroundColor: getProgressColor(),
                borderRadius: 3,
              }} />
            </View>
          </Animated.View>

          {/* Quest info */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={14} color="#6b7280" />
                <Text style={{ fontSize: 14, color: '#4b5563' }}>
                  {completedSteps}/{quest.steps.length} steps
                </Text>
              </View>
              
              {quest.deadline && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} color="#6b7280" />
                  <Text style={{ fontSize: 14, color: '#4b5563' }}>
                    {getDeadlineText()}
                  </Text>
                </View>
              )}
            </View>

            <Text style={{ fontSize: 14, fontWeight: '500', color: getProgressColor() }}>
              {Math.round(quest.progress)}%
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Expanded content */}
      {isExpanded && (
        <View style={{ gap: 12 }}>
          {/* Steps */}
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Quest Steps:</Text>
            {quest.steps.map((step) => (
              <QuestStepItem
                key={step.id}
                step={step}
                onComplete={onStepComplete}
                questId={quest.id}
                canComplete={userCanComplete(step.id)}
              />
            ))}
          </View>

          {/* Reward */}
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Reward:</Text>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 8, 
              padding: 8, 
              backgroundColor: '#fef3c7', 
              borderRadius: 8 
            }}>
              <Star size={16} color="#f59e0b" />
              <Text style={{ color: '#92400e', fontWeight: '500' }}>
                {quest.reward}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default function CooperativeQuestWidget({ style, compact = false }: CooperativeQuestWidgetProps) {
  const { isFeatureEnabled } = useFeatureFlags();
  const { cooperativeQuests, completeQuestStep, createQuest } = usePartnerInteraction();
  const [expandedQuest, setExpandedQuest] = React.useState<string | null>(null);
  
  // Don't render if feature is disabled
  if (!isFeatureEnabled('cooperativeQuests')) {
    return null;
  }

  const activeQuests = cooperativeQuests.filter(q => q.isActive);
  const completedQuests = cooperativeQuests.filter(q => q.progress >= 100);

  const handleStepComplete = async (questId: string, stepId: string) => {
    try {
      await completeQuestStep(questId, stepId);
      HapticFeedback.trigger('impactMedium');
    } catch (error) {
      console.error('Failed to complete quest step:', error);
    }
  };

  const handleCreateQuest = () => {
    // This would open a quest creation modal
    console.log('Create new cooperative quest');
  };

  const toggleExpanded = (questId: string) => {
    setExpandedQuest(expandedQuest === questId ? null : questId);
  };

  if (compact) {
    const activeCount = activeQuests.length;
    const completedCount = completedQuests.length;
    
    return (
      <Pressable onPress={handleCreateQuest} style={style}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: 8, 
          padding: 12, 
          backgroundColor: '#f3e8ff', 
          borderRadius: 12 
        }}>
          <Target size={20} color="#8b5cf6" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '500', color: '#581c87' }}>
              Cooperative Quests
            </Text>
            <Text style={{ fontSize: 14, color: '#7c3aed' }}>
              {activeCount} active • {completedCount} completed
            </Text>
          </View>
          <Zap size={16} color="#8b5cf6" />
        </View>
      </Pressable>
    );
  }

  if (activeQuests.length === 0) {
    return (
      <View style={[{
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        gap: 12
      }, style]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Target size={20} color="#8b5cf6" />
            <Text style={{ fontWeight: '600', color: '#111827' }}>Cooperative Quests</Text>
          </View>
          <Pressable onPress={handleCreateQuest}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#8b5cf6',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
            </View>
          </Pressable>
        </View>
        
        <View style={{ alignItems: 'center', gap: 8, padding: 24 }}>
          <Target size={40} color="#d1d5db" />
          <Text style={{ textAlign: 'center', color: '#6b7280' }}>
            No active quests
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>
            Create cooperative challenges with your partner
          </Text>
        </View>

        {completedQuests.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
              Recently Completed ({completedQuests.length})
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {completedQuests.slice(0, 3).map((quest) => (
                <View key={quest.id} style={{ backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                  <Text style={{ fontSize: 12, color: '#15803d', fontWeight: '500' }}>
                    {quest.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
          <Target size={20} color="#8b5cf6" />
          <Text style={{ fontWeight: '600', color: '#111827' }}>Cooperative Quests</Text>
          {activeQuests.length > 0 && (
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#8b5cf6',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                {activeQuests.length}
              </Text>
            </View>
          )}
        </View>
        <Pressable onPress={handleCreateQuest}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#8b5cf6',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
          </View>
        </Pressable>
      </View>

      {/* Active quests */}
      <View style={{ gap: 12 }}>
        {activeQuests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onStepComplete={handleStepComplete}
            isExpanded={expandedQuest === quest.id}
            onToggleExpand={() => toggleExpanded(quest.id)}
          />
        ))}
      </View>

      {/* Completed quests summary */}
      {completedQuests.length > 0 && (
        <View style={{ 
          gap: 8, 
          padding: 12, 
          backgroundColor: '#dcfce7', 
          borderRadius: 12 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Trophy size={16} color="#22c55e" />
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#166534' }}>
              Completed Quests ({completedQuests.length})
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#15803d' }}>
            Great teamwork! Keep building your connection together.
          </Text>
        </View>
      )}
    </View>
  );
}