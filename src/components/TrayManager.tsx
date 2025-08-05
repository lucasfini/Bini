// src/components/TrayManager.tsx
import React from 'react';
import { View } from 'react-native';

interface TrayManagerProps {
  children: React.ReactNode;
}

const TrayManager: React.FC<TrayManagerProps> = ({ children }) => {
  return <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }} pointerEvents="box-none">{children}</View>;
};

export default TrayManager;