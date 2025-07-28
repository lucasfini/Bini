// IMPORTANT: This must be the very first import!
import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
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

  // Test Supabase connection when app starts
  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        console.log('🚀 App started, testing Supabase connection...');
        
        // Import the config module
        const supabaseModule = await import('./src/config/supabase');
        console.log('📦 Supabase module imported successfully');
        
        // Check what we got
        if (supabaseModule.testConnection) {
          console.log('🧪 Found testConnection, running test...');
          await supabaseModule.testConnection();
        } else if (supabaseModule.default && supabaseModule.default.testConnection) {
          console.log('🧪 Found testConnection in default export, running test...');
          await supabaseModule.default.testConnection();
        } else {
          console.log('⚠️ testConnection not found, testing client directly...');
          
          const client = supabaseModule.supabase || supabaseModule.default?.supabase;
          if (client) {
            const { data, error } = await client
              .from('profiles')
              .select('count')
              .limit(1);
            
            console.log('📊 Direct test result:', { data, error });
            
            if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
              console.log('✅ Direct test successful! (Table not found is expected)');
            } else if (!error) {
              console.log('✅ Direct test successful with data!');
            }
          }
        }
        
      } catch (error) {
        console.error('❌ Connection test failed:', error);
      }
    };

    testSupabaseConnection();
  }, []);

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