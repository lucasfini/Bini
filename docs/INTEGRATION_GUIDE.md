# 🚀 Partner Interaction Features - Usage Guide

## 📱 **How to Access & Use the Features**

### **1. Quick Demo via DevShowcase**

**Access the DevShowcase:**
1. Run your app in development mode (`npm run ios` or `npm run android`)
2. Tap the "More" button (⋯) in the bottom navigation
3. Select "Partner Features" (only visible in development)
4. Explore all 4 implemented features with example data

### **2. Individual Feature Usage**

#### **🫀 Heartbeat Sync & Charge Status**
```tsx
import HeartbeatSyncWidget from '../components/partner/HeartbeatSyncWidget';

// Full widget version
<HeartbeatSyncWidget />

// Compact version for timeline integration
<HeartbeatSyncWidget compact />
```

**How to use:**
- Tap "Start Heartbeat Sync" to begin monitoring
- Watch the charge level build based on sync quality
- Partner connection shows real-time status
- Stop sync when finished

#### **🌬️ SynchroBeat 15s Ritual**
```tsx
import SynchroBeatRitual from '../components/partner/SynchroBeatRitual';

<SynchroBeatRitual />
```

**How to use:**
- Ensure partner is online (shown in header)
- Tap "Begin Ritual" to start
- Follow the 5-stage process:
  1. **Preparing** - Get ready
  2. **Counting** - 15s countdown
  3. **Breathing** - Synchronized breathing
  4. **Complete** - Celebration
- Partner can join when in "preparing" stage

#### **✨ Serendipity Bursts**
```tsx
import SerendipityBurstFeed from '../components/partner/SerendipityBurstFeed';

<SerendipityBurstFeed maxItems={5} />
```

**How to use:**
- Tap "+" to create spontaneous content
- Choose content type:
  - **Photo**: Share moments instantly
  - **Message**: Send quick thoughts
  - **Location**: Share where you are
  - **Achievement**: Celebrate wins
- Long-press bursts to react with emojis
- New bursts appear with animations

#### **🎯 Cooperative Quest Chains**
```tsx
import CooperativeQuestWidget from '../components/partner/CooperativeQuestWidget';

// Full widget
<CooperativeQuestWidget />

// Compact version
<CooperativeQuestWidget compact />
```

**How to use:**
- Tap "+" to create new quests
- Add steps and assign to:
  - **User**: Your tasks
  - **Partner**: Their tasks  
  - **Both**: Shared activities
- Tap expand to see quest details
- Complete assigned steps to progress
- Celebrate quest completion together

## 🏗️ **Integration into Your Timeline**

### **Step 1: Add to Timeline Header**
```tsx
// In TimelineScreen.tsx
import HeartbeatSyncWidget from '../components/partner/HeartbeatSyncWidget';

// Add to header area
<HeartbeatSyncWidget compact style={{ marginBottom: 16 }} />
```

### **Step 2: Add to Task Cards**
```tsx
// In TaskCard.tsx - add partner features section
<YStack gap="$2">
  <SynchroBeatRitual />
  <CooperativeQuestWidget compact />
</YStack>
```

### **Step 3: Create Partner Tab**
```tsx
// Create new PartnerScreen.tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';
import HeartbeatSyncWidget from '../components/partner/HeartbeatSyncWidget';
import SynchroBeatRitual from '../components/partner/SynchroBeatRitual';
import SerendipityBurstFeed from '../components/partner/SerendipityBurstFeed';
import CooperativeQuestWidget from '../components/partner/CooperativeQuestWidget';

export default function PartnerScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <YStack gap="$4" padding="$4">
        <HeartbeatSyncWidget />
        <SynchroBeatRitual />
        <SerendipityBurstFeed maxItems={10} />
        <CooperativeQuestWidget />
      </YStack>
    </ScrollView>
  );
}
```

## 🔧 **Configuration & Setup**

### **Database Setup**
1. Run the SQL schema in your Supabase dashboard:
```bash
# Copy contents of supabase-schema.sql to Supabase SQL editor
```

2. Enable Row Level Security (RLS) policies (already included in schema)

### **Feature Flags**
Control features via `FeatureFlagsProvider`:
```tsx
// Override flags for testing
<FeatureFlagsProvider overrideFlags={{
  heartbeatSync: true,
  synchroBeat: true,
  serendipityBursts: false,  // Disable this feature
  cooperativeQuests: true,
  devShowcase: __DEV__
}}>
  {children}
</FeatureFlagsProvider>
```

### **Partner Connection Setup**
Ensure your user profile has a `partnerId`:
```tsx
// In your auth context, add partner linking
const user = {
  id: 'user-123',
  partnerId: 'partner-456',  // Required for features to work
  // ... other fields
};
```

## 📊 **Real-time Features**

### **Automatic Synchronization**
- Partner status updates every 30 seconds
- Real-time notifications for new serendipity bursts
- Live quest progress updates
- SynchroBeat session coordination

### **Background Updates**
- Features work with app backgrounding
- Push notifications ready for implementation
- Offline state handling included

## 🎮 **Psychology in Action**

### **Variable Ratio Reinforcement (Heartbeat Sync)**
- Unpredictable sync quality creates engagement
- Charge building provides tangible progress
- Partner presence amplifies rewards

### **Reciprocity Mechanisms (SynchroBeat)**
- Mutual participation required
- Shared vulnerability through breathing
- Synchronized completion celebration

### **Loss Aversion (Serendipity Bursts)**
- Time-sensitive nature ("just now")
- Fear of missing partner's moments
- New burst indicators create urgency

### **Achievement Systems (Quests)**
- Clear progress visualization
- Partner interdependence
- Meaningful rewards for completion

## 🐛 **Troubleshooting**

### **Features Not Showing**
1. Check feature flags are enabled
2. Verify user has `partnerId` set
3. Ensure Supabase connection is working

### **Real-time Not Working**
1. Check Supabase real-time subscriptions
2. Verify RLS policies allow access
3. Test network connectivity

### **Animations Lagging**
1. Check Reanimated 3 setup
2. Verify Haptic feedback permissions
3. Test on physical device (not simulator)

## 🔮 **Next Steps**

### **Production Deployment**
1. Create production Supabase database
2. Set up push notifications
3. Add analytics tracking
4. Configure feature flags remotely

### **Enhanced Features**
1. Photo/video capture for serendipity bursts
2. Voice messages and audio notes
3. Calendar integration for quest deadlines
4. Advanced haptic patterns
5. Machine learning for better sync detection

---

**🎉 Your partner interaction features are ready to transform relationship connections through technology!**