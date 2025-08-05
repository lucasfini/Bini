// src/components/TaskDetailsTrayExample.tsx
// Example demonstrating how to use TaskDetailsTray with mock data

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import TaskDetailsTray from './TaskDetailsTray';
import { UnifiedTask } from '../types/tasks';

// Mock task data demonstrating all the dynamic properties
const mockTask: UnifiedTask = {
  id: '1',
  title: 'Evening Workout Session',
  date: '2024-01-15',
  isShared: false,
  isCompleted: false,
  createdBy: 'user123',
  emoji: '💪',
  startTime: '19:00',
  endTime: '20:30',
  duration: 90,
  details: 'Full body workout including cardio and strength training. Focus on upper body today.',
  category: 'Health & Fitness',
  steps: [
    { id: '1', title: 'Warm up for 10 minutes', completed: true },
    { id: '2', title: 'Strength training - 45 minutes', completed: false },
    { id: '3', title: 'Cardio session - 25 minutes', completed: false },
    { id: '4', title: 'Cool down and stretching', completed: false },
  ],
  recurrence: {
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
  },
  alerts: ['30 minutes before', '10 minutes before'],
  priority: 'high',
};

const TaskDetailsTrayExample: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleEdit = (task: UnifiedTask) => {
    console.log('Edit task:', task.title);
    setIsVisible(false);
  };

  const handleDuplicate = (task: UnifiedTask) => {
    console.log('Duplicate task:', task.title);
    setIsVisible(false);
  };

  const handleDelete = (task: UnifiedTask) => {
    console.log('Delete task:', task.title);
    setIsVisible(false);
  };

  const handleComplete = (task: UnifiedTask) => {
    console.log('Complete task:', task.title);
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.showButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.showButtonText}>Show Task Details Tray</Text>
      </TouchableOpacity>

      <TaskDetailsTray
        visible={isVisible}
        task={mockTask}
        onClose={() => setIsVisible(false)}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onComplete={handleComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  showButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  showButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaskDetailsTrayExample;