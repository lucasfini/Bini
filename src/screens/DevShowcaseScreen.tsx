import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeartbeatSyncWidget from '../components/partner/HeartbeatSyncWidget';
import SynchroBeatRitual from '../components/partner/SynchroBeatRitual';
import SerendipityBurstFeed from '../components/partner/SerendipityBurstFeed';
import CooperativeQuestWidget from '../components/partner/CooperativeQuestWidget';
import { useFeatureFlags } from '../providers/FeatureFlagsProvider';

export default function DevShowcaseScreen() {
  const { isFeatureEnabled } = useFeatureFlags();

  if (!isFeatureEnabled('devShowcase')) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text className="text-gray-500">DevShowcase is disabled in production</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Partner Interaction Features
            </Text>
            <Text style={styles.subtitle}>
              Showcase of all implemented partner interaction components
            </Text>
          </View>

          {/* Feature 1: Heartbeat Sync */}
          <View style={styles.featureSection}>
            <Text style={styles.featureTitle}>
              1. Heartbeat Sync & Charge Status
            </Text>
            <Text style={styles.featureDescription}>
              Psychology: Variable ratio reinforcement through unpredictable sync quality rewards
            </Text>
            
            {/* Full widget */}
            <HeartbeatSyncWidget />
            
            {/* Compact version */}
            <Text style={styles.versionLabel}>Compact Version:</Text>
            <View style={styles.compactContainer}>
              <HeartbeatSyncWidget compact />
            </View>
          </View>

          {/* Feature 2: SynchroBeat */}
          <View style={styles.featureSection}>
            <Text style={styles.featureTitle}>
              2. SynchroBeat 15s Ritual
            </Text>
            <Text style={styles.featureDescription}>
              Psychology: Reciprocity and shared vulnerability through synchronized breathing
            </Text>
            <SynchroBeatRitual />
          </View>

          {/* Feature 3: Serendipity Bursts */}
          <View style={styles.featureSection}>
            <Text style={styles.featureTitle}>
              3. Serendipity Bursts
            </Text>
            <Text style={styles.featureDescription}>
              Psychology: Loss aversion and social proof through unexpected partner content
            </Text>
            <SerendipityBurstFeed maxItems={3} />
            
            <Text style={styles.versionLabel}>Note:</Text>
            <Text style={styles.note}>
              Feed shows empty state - bursts are created through real partner interaction
            </Text>
          </View>

          {/* Feature 4: Cooperative Quest Chains */}
          <View style={styles.featureSection}>
            <Text style={styles.featureTitle}>
              4. Cooperative Quest Chains
            </Text>
            <Text style={styles.featureDescription}>
              Psychology: Achievement systems and interdependence for relationship commitment
            </Text>
            <CooperativeQuestWidget />
            
            <Text style={styles.versionLabel}>Compact Version:</Text>
            <View style={styles.compactContainer}>
              <CooperativeQuestWidget compact />
            </View>
          </View>

          {/* Feature flags status */}
          <View style={styles.flagsSection}>
            <Text style={styles.flagsTitle}>Feature Flags Status:</Text>
            <View style={styles.flagsContainer}>
              {Object.entries({
                heartbeatSync: isFeatureEnabled('heartbeatSync'),
                synchroBeat: isFeatureEnabled('synchroBeat'),
                serendipityBursts: isFeatureEnabled('serendipityBursts'),
                cooperativeQuests: isFeatureEnabled('cooperativeQuests'),
                devShowcase: isFeatureEnabled('devShowcase'),
              }).map(([feature, enabled]) => (
                <View 
                  key={feature}
                  style={[
                    styles.flagBadge,
                    { backgroundColor: enabled ? '#dcfce7' : '#fee2e2' }
                  ]}
                >
                  <Text style={[
                    styles.flagText,
                    { color: enabled ? '#15803d' : '#dc2626' }
                  ]}>
                    {feature}: {enabled ? 'ON' : 'OFF'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Spacer for bottom */}
          <View style={{ height: 50 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    gap: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  featureSection: {
    gap: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  versionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 16,
  },
  compactContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
  },
  note: {
    fontSize: 12,
    color: '#6b7280',
  },
  flagsSection: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  flagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  flagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  flagText: {
    fontSize: 12,
    fontWeight: '500',
  },
});