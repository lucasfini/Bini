import React, { createContext, useContext, ReactNode } from 'react';
import { FeatureFlags } from '../types/partnerInteraction';

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

// Feature flags configuration - can be moved to remote config later
const DEFAULT_FLAGS: FeatureFlags = {
  heartbeatSync: true,
  synchroBeat: true,
  serendipityBursts: true,
  cooperativeQuests: true,
  devShowcase: __DEV__, // Only in development
};

interface FeatureFlagsProviderProps {
  children: ReactNode;
  overrideFlags?: Partial<FeatureFlags>;
}

export function FeatureFlagsProvider({ 
  children, 
  overrideFlags = {} 
}: FeatureFlagsProviderProps) {
  const flags: FeatureFlags = {
    ...DEFAULT_FLAGS,
    ...overrideFlags,
  };

  const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
    return flags[feature];
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, isFeatureEnabled }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagsContextType {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}