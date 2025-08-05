// src/components/TrayStack.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import EmojiTray from './EmojiTray';
import DateTray from './DateTray';
import AlertsTray from './AlertsTray';

export type TrayType = 'emoji' | 'date' | 'alerts';

interface TrayStackState {
  stack: TrayType[];
  data: {
    emoji: string;
    date: string;
    alerts: string[];
  };
}

interface TrayStackProps {
  visible: boolean;
  onClose: () => void;
  initialData?: Partial<TrayStackState['data']>;
  onDataChange?: (data: TrayStackState['data']) => void;
  isDarkMode?: boolean;
}

const TrayStack: React.FC<TrayStackProps> = ({
  visible,
  onClose,
  initialData = {},
  onDataChange,
  isDarkMode = false,
}) => {
  const [state, setState] = useState<TrayStackState>({
    stack: [],
    data: {
      emoji: initialData.emoji || '🍽️',
      date: initialData.date || new Date().toISOString().split('T')[0],
      alerts: initialData.alerts || [],
    },
  });

  // Open a specific tray
  const openTray = useCallback((trayType: TrayType) => {
    setState(prev => ({
      ...prev,
      stack: [...prev.stack, trayType],
    }));
  }, []);

  // Close the current tray (pop from stack)
  const closeTray = useCallback(() => {
    setState(prev => {
      const newStack = [...prev.stack];
      newStack.pop();

      // If stack is empty, close the entire tray system
      if (newStack.length === 0) {
        onClose();
      }

      return {
        ...prev,
        stack: newStack,
      };
    });
  }, [onClose]);

  // Go back to previous tray
  const goBack = useCallback(() => {
    setState(prev => {
      const newStack = [...prev.stack];
      newStack.pop();

      return {
        ...prev,
        stack: newStack,
      };
    });
  }, []);

  // Update data and notify parent
  const updateData = useCallback(
    (key: keyof TrayStackState['data'], value: any) => {
      setState(prev => {
        const newData = {
          ...prev.data,
          [key]: value,
        };

        // Notify parent of data changes
        onDataChange?.(newData);

        return {
          ...prev,
          data: newData,
        };
      });
    },
    [onDataChange],
  );

  // Get the currently active tray
  const currentTray = state.stack[state.stack.length - 1];
  const hasBackButton = state.stack.length > 1;

  // Expose methods for parent component to use
  const stackMethods = {
    openEmojiTray: () => openTray('emoji'),
    openDateTray: () => openTray('date'),
    openAlertsTray: () => openTray('alerts'),
    closeAll: onClose,
    getCurrentData: () => state.data,
  };

  // Store methods in a ref or context for parent access
  React.useImperativeHandle(
    React.forwardRef((props, ref) => ref),
    () => stackMethods,
  );

  if (!visible || state.stack.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Emoji Tray */}
      <EmojiTray
        visible={currentTray === 'emoji'}
        onClose={closeTray}
        onBack={hasBackButton ? goBack : undefined}
        selectedEmoji={state.data.emoji}
        onEmojiSelect={emoji => updateData('emoji', emoji)}
        isDarkMode={isDarkMode}
      />

      {/* Date Tray */}
      <DateTray
        visible={currentTray === 'date'}
        onClose={closeTray}
        onBack={hasBackButton ? goBack : undefined}
        selectedDate={state.data.date}
        onDateSelect={date => updateData('date', date)}
        isDarkMode={isDarkMode}
      />

      {/* Alerts Tray */}
      <AlertsTray
        visible={currentTray === 'alerts'}
        onClose={closeTray}
        onBack={hasBackButton ? goBack : undefined}
        selectedAlerts={state.data.alerts}
        onAlertsChange={alerts => updateData('alerts', alerts)}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

// Hook for easier usage in parent components
export const useTrayStack = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({
    emoji: '🍽️',
    date: new Date().toISOString().split('T')[0],
    alerts: [] as string[],
  });

  const openEmojiTray = useCallback(() => {
    setVisible(true);
    // The TrayStack will handle opening the specific tray
  }, []);

  const openDateTray = useCallback(() => {
    setVisible(true);
  }, []);

  const openAlertsTray = useCallback(() => {
    setVisible(true);
  }, []);

  const closeTray = useCallback(() => {
    setVisible(false);
  }, []);

  const handleDataChange = useCallback((newData: typeof data) => {
    setData(newData);
  }, []);

  return {
    visible,
    data,
    openEmojiTray,
    openDateTray,
    openAlertsTray,
    closeTray,
    setData,
    handleDataChange,
  };
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});

export default TrayStack;
