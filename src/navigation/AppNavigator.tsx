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

const TimelineWrapper: React.FC<{ 
  refreshKey: number; 
  onEditTask?: (task: any) => void;
  onDuplicateTask?: (task: any) => void;
  onNavigateToCreate?: () => void;
  onRefreshTimeline?: () => void;
}> = ({ refreshKey, onEditTask, onDuplicateTask, onNavigateToCreate, onRefreshTimeline }) => {
  return <TimelineScreen key={refreshKey} refreshKey={refreshKey} onEditTask={onEditTask} onDuplicateTask={onDuplicateTask} onNavigateToCreate={onNavigateToCreate} onRefreshTimeline={onRefreshTimeline} />;
};

const AppNavigator: React.FC = () => {
  const [timelineKey, setTimelineKey] = useState(0);
  const [activeRoute, setActiveRoute] = useState('Timeline');
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  
  // State for edit/duplicate functionality
  const [editingTask, setEditingTask] = useState(null);
  const [duplicatingTask, setDuplicatingTask] = useState(null);
  const [createMode, setCreateMode] = useState<'create' | 'edit' | 'duplicate'>('create');

  // Handle task creation with unified service
  const handleCreateTask = async (taskData: TaskFormData, mode: 'create' | 'edit' | 'duplicate' = 'create', taskId?: string) => {
    console.log(
      `🚀 ${mode === 'edit' ? 'Updating' : 'Creating'} task with unified service:`,
      JSON.stringify(taskData, null, 2),
    );

    try {
      let result;
      let successMessage;
      
      if (mode === 'edit' && taskId) {
        // TODO: Implement task update functionality
        // For now, we'll create a new task (this needs to be implemented in UnifiedTaskService)
        console.log('⚠️ Edit mode not fully implemented yet, creating new task');
        result = await UnifiedTaskService.createTaskFromForm(taskData);
        successMessage = 'Task Updated! ✏️';
      } else {
        // Create new task (for both 'create' and 'duplicate' modes)
        result = await UnifiedTaskService.createTaskFromForm(taskData);
        successMessage = mode === 'duplicate' ? 'Task Duplicated! 📋' : 'Task Created! 🎉';
      }

      // Show success message
      const dateObj = new Date(taskData.when.date);
      const dateStr = dateObj.toLocaleDateString();

      Alert.alert(
        successMessage,
        `"${taskData.title}" has been ${mode === 'edit' ? 'updated' : 'added'} for ${dateStr} at ${taskData.when.time}`,
        [{ text: 'Great!' }],
      );

      console.log(`✅ Task ${mode} successful:`, result.id);
      console.log('📊 Task data:', JSON.stringify(result, null, 2));

      // Refresh the timeline to show the updated task list
      setTimelineKey(prev => prev + 1);
      
      // Reset edit/duplicate state
      setEditingTask(null);
      setDuplicatingTask(null);
      setCreateMode('create');
      
    } catch (error) {
      console.error(`❌ Failed to ${mode} task:`, error);
      Alert.alert(
        'Error',
        `Failed to ${mode} task: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        [{ text: 'OK' }],
      );
    }
  };

  // Handle navigation between screens
  const handleNavigate = (route: string) => {
    setActiveRoute(route);
    
    // Reset edit/duplicate state when navigating to Create screen for fresh start
    if (route === 'Create') {
      setEditingTask(null);
      setDuplicatingTask(null);
      setCreateMode('create');
    }
  };

  // Handle edit task navigation
  const handleEditTask = (task: any) => {
    console.log('🎯 AppNavigator: handleEditTask called with:', JSON.stringify(task, null, 2));
    setEditingTask(task);
    setDuplicatingTask(null);
    setCreateMode('edit');
    setActiveRoute('Create');
  };

  // Handle duplicate task navigation
  const handleDuplicateTask = (task: any) => {
    console.log('🎯 AppNavigator: handleDuplicateTask called with:', JSON.stringify(task, null, 2));
    setDuplicatingTask(task);
    setEditingTask(null);
    setCreateMode('duplicate');
    setActiveRoute('Create');
  };

  // Handle create button press - navigate to create screen with reset
  const handleCreatePress = () => {
    setEditingTask(null);
    setDuplicatingTask(null);
    setCreateMode('create');
    setActiveRoute('Create');
  };

  // Handle navigation to create from timeline
  const handleNavigateToCreate = () => {
    handleCreatePress();
  };

  // Handle timeline refresh (increment refresh key to trigger re-render)
  const handleRefreshTimeline = () => {
    setTimelineKey(prev => prev + 1);
  };

  // Render the current active screen
  const renderActiveScreen = () => {
    switch (activeRoute) {
      case 'Timeline':
        return <TimelineWrapper refreshKey={timelineKey} onEditTask={handleEditTask} onDuplicateTask={handleDuplicateTask} onNavigateToCreate={handleNavigateToCreate} onRefreshTimeline={handleRefreshTimeline} />;
      case 'Calendar':
        return <CalendarScreen />;
      case 'Create':
        return (
          <CreateTaskScreen
            onCreateTask={handleCreateTask}
            onBack={() => setActiveRoute('Timeline')} // Navigate back to Timeline when done
            editingTask={editingTask}
            duplicatingTask={duplicatingTask}
            mode={createMode}
          />
        );
      case 'Knowledge':
        return <KnowledgeScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <TimelineWrapper refreshKey={timelineKey} onEditTask={handleEditTask} onDuplicateTask={handleDuplicateTask} onNavigateToCreate={handleNavigateToCreate} onRefreshTimeline={handleRefreshTimeline} />;
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
