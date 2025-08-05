// src/navigation/AppNavigator.tsx
import React, { useState } from 'react';
import { View, Alert } from 'react-native';

import TimelineScreen from '../screens/timeline/TimelineScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';  
import CreateTaskScreen from '../screens/create/CreateTaskScreen';
import KnowledgeScreen from '../screens/knowledge/KnowledgeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import FloatingNavigation from '../components/navigation/FloatingNavigation';
import { TaskFormData } from '../types/tasks';
import UnifiedTaskService from '../services/tasks/unifiedTaskService';

const TimelineWrapper: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  return <TimelineScreen key={refreshKey} />;
};

const AppNavigator: React.FC = () => {
  const [timelineKey, setTimelineKey] = useState(0);
  const [activeRoute, setActiveRoute] = useState('Timeline');
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  // Handle task creation with unified service
  const handleCreateTask = async (taskData: TaskFormData) => {
    console.log(
      '🚀 Creating task with unified service:',
      JSON.stringify(taskData, null, 2),
    );

    try {
      // Use the unified task service directly (no dynamic import needed) 
      const newTask = await UnifiedTaskService.createTaskFromForm(taskData);

      // Show success message
      const dateObj = new Date(taskData.when.date);
      const dateStr = dateObj.toLocaleDateString();

      Alert.alert(
        'Task Created! 🎉',
        `"${taskData.title}" has been added for ${dateStr} at ${taskData.when.time}`,
        [{ text: 'Great!' }],
      );

      console.log('✅ Unified task created successfully:', newTask.id);
      console.log('📊 Created task data:', JSON.stringify(newTask, null, 2));

      // Refresh the timeline to show the new task
      setTimelineKey(prev => prev + 1);
    } catch (error) {
      console.error('❌ Failed to create task:', error);
      Alert.alert(
        'Error',
        `Failed to create task: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        [{ text: 'OK' }],
      );
    }
  };

  // Handle navigation between screens
  const handleNavigate = (route: string) => {
    setActiveRoute(route);
  };

  // Handle create button press (now just navigation)
  const handleCreatePress = () => {
    // Navigation is handled by onNavigate in FloatingNavigation
  };

  // Render the current active screen
  const renderActiveScreen = () => {
    switch (activeRoute) {
      case 'Timeline':
        return <TimelineWrapper refreshKey={timelineKey} />;
      case 'Calendar':
        return <CalendarScreen />;
      case 'Create':
        return (
          <CreateTaskScreen
            onCreateTask={handleCreateTask}
            onBack={() => setActiveRoute('Timeline')} // Navigate back to Timeline when done
          />
        );
      case 'Knowledge':
        return <KnowledgeScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <TimelineWrapper refreshKey={timelineKey} />;
    }
  };

  return (
    <>
      {/* Main Screen Container */}
      <View style={{ flex: 1 }}>{renderActiveScreen()}</View>

      {/* Floating Navigation - Always show for regular screens */}
      <FloatingNavigation
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onCreatePress={handleCreatePress}
      />
    </>
  );
};

export default AppNavigator;
