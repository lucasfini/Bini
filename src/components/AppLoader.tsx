// src/components/AppLoader.tsx
import React, { useState } from 'react';
import StartupAnimation from './StartupAnimation';

interface AppLoaderProps {
  children: React.ReactNode;
}

const AppLoader: React.FC<AppLoaderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleAnimationComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <StartupAnimation onAnimationComplete={handleAnimationComplete} />;
  }

  return <>{children}</>;
};

export default AppLoader;