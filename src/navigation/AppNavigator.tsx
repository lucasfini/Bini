// src/navigation/AppNavigator.tsx - FINAL VERSION WITH UNIFIED SERVICE
import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Alert,
} from 'react-native';
import { Clock, Calendar, Plus, BookOpen, User } from '@tamagui/lucide-icons';

import TimelineScreen from '../screens/timeline/TimelineScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import CreateTaskScreen from '../screens/create/CreateTaskScreen';
import KnowledgeScreen from '../screens/knowledge/KnowledgeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { TaskFormData } from '../types/tasks';
import UnifiedTaskService from '../services/tasks/unifiedTaskService';

const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#F0F0F0',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  accentPrimary: '#FF6B9D',
  accentSecondary: '#6B73FF',
  white: '#FFFFFF',
  black: '#000000',
};

const CreateScreen = () => null;

const TimelineWrapper: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  return <TimelineScreen key={refreshKey} />;
};

const Tab = createBottomTabNavigator();

const AppNavigator: React.FC = () => {
  const [showCreateTray, setShowCreateTray] = useState(false);
  const [timelineKey, setTimelineKey] = useState(0);

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

  const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const getIcon = (routeName: string, isFocused: boolean) => {
      const iconColor = isFocused ? colors.accentPrimary : colors.textTertiary;
      const iconSize = 22;

      switch (routeName) {
        case 'Timeline':
          return <Clock size={iconSize} color={iconColor} />;
        case 'Calendar':
          return <Calendar size={iconSize} color={iconColor} />;
        case 'Create':
          return <Plus size={24} color={colors.white} />;
        case 'Knowledge':
          return <BookOpen size={iconSize} color={iconColor} />;
        case 'Profile':
          return <User size={iconSize} color={iconColor} />;
        default:
          return <Clock size={iconSize} color={iconColor} />;
      }
    };

    return (
      <SafeAreaView style={styles.tabBarSafeArea}>
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const isCreate = route.name === 'Create';

            const onPress = () => {
              if (isCreate) {
                setShowCreateTray(true);
                return;
              }

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[
                  styles.tabItem,
                  isCreate && styles.createTabItem,
                  isFocused && !isCreate && styles.tabItemActive,
                ]}
                activeOpacity={0.7}
              >
                {getIcon(route.name, isFocused)}
                {!isCreate && (
                  <Text
                    style={[
                      styles.tabLabel,
                      isFocused && styles.tabLabelActive,
                    ]}
                  >
                    {route.name}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    );
  };

  return (
    <>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Timeline">
          {() => <TimelineWrapper refreshKey={timelineKey} />}
        </Tab.Screen>
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Create" component={CreateScreen} />
        <Tab.Screen name="Knowledge" component={KnowledgeScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      {/* Create Task Tray using unified service */}
      <CreateTaskScreen
        visible={showCreateTray}
        onClose={() => setShowCreateTray(false)}
        onCreateTask={handleCreateTask}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tabBarSafeArea: {
    backgroundColor: colors.surface,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    minHeight: 50,
  },
  tabItemActive: {
    backgroundColor: colors.accentPrimary + '08',
  },
  createTabItem: {
    backgroundColor: colors.accentPrimary,
    width: 56,
    height: 56,
    borderRadius: 28,
    marginHorizontal: 16,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
    marginTop: 4,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
});

export default AppNavigator;
