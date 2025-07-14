import React from 'react';
import { createTamagui, TamaguiProvider } from 'tamagui';
import { defaultConfig } from '@tamagui/config/v4';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthScreen from './src/screens/auth/AuthScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from './src/styles';

const config = createTamagui(defaultConfig);

// Main app content that can access auth context
const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (user) {
    // User is authenticated - show main app with navigation
    return <AppNavigator />;
  }

  // User is not authenticated - show auth screen
  return <AuthScreen />;
};

const App: React.FC = () => {
  return (
    <TamaguiProvider config={config}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TamaguiProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },
});

export default App;