// src/components/PartnerShareCheckboxExample.tsx
// Example demonstrating PartnerShareCheckbox with different configurations

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import PartnerShareCheckbox from './PartnerShareCheckbox';

const PartnerShareCheckboxExample: React.FC = () => {
  const [isSharedWithSarah, setIsSharedWithSarah] = useState(false);
  const [isSharedWithJohn, setIsSharedWithJohn] = useState(true);
  const [isSharedWithMaria, setIsSharedWithMaria] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Partner Share Checkbox Examples</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Design Option: Profile Picture with Initials
        </Text>

        {/* Example 1: With initials (no avatar URL) */}
        <PartnerShareCheckbox
          partnerName="Sarah"
          partnerAvatarUrl={undefined}
          isChecked={isSharedWithSarah}
          onPress={() => setIsSharedWithSarah(!isSharedWithSarah)}
        />

        {/* Example 2: With actual profile picture */}
        <PartnerShareCheckbox
          partnerName="John"
          partnerAvatarUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
          isChecked={isSharedWithJohn}
          onPress={() => setIsSharedWithJohn(!isSharedWithJohn)}
        />

        {/* Example 3: Different name with initials */}
        <PartnerShareCheckbox
          partnerName="Maria Garcia"
          partnerAvatarUrl={undefined}
          isChecked={isSharedWithMaria}
          onPress={() => setIsSharedWithMaria(!isSharedWithMaria)}
        />
      </View>

      <View style={styles.stateSection}>
        <Text style={styles.stateTitle}>Current States:</Text>
        <Text style={styles.stateText}>
          Sarah: {isSharedWithSarah ? '✓ Shared' : '✗ Not shared'}
        </Text>
        <Text style={styles.stateText}>
          John: {isSharedWithJohn ? '✓ Shared' : '✗ Not shared'}
        </Text>
        <Text style={styles.stateText}>
          Maria: {isSharedWithMaria ? '✓ Shared' : '✗ Not shared'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E26',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E26',
    marginBottom: 15,
  },
  stateSection: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E26',
    marginBottom: 8,
  },
  stateText: {
    fontSize: 14,
    color: '#5A6B54',
    marginBottom: 4,
  },
});

export default PartnerShareCheckboxExample;
