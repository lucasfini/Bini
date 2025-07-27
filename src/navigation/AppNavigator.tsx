import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
import CreateTaskScreen from '../screens/create/CreateTaskScreen'; // Import your CreateTaskScreen
import KnowledgeScreen from '../screens/knowledge/KnowledgeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Clean minimal color palette
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

// Task form interface (matching your CreateTaskScreen)
interface TaskFormData {
  title: string;
  description?: string;
  emoji?: string;
  dueDate?: Date;
  dueTime?: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  tags: string[];
  isShared: boolean;
  isGroupTask: boolean;
  groupId?: string;
  reward?: string;
}

// Simple Settings screen component
const SettingsScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Settings</Text>
    <Text style={styles.screenSubtitle}>App Preferences</Text>
  </View>
);

// Dummy Create screen (won't be used since we're using the tray)
const CreateScreen = () => null;

const Tab = createBottomTabNavigator();

const AppNavigator: React.FC = () => {
  // State for the Create Task tray
  const [showCreateTray, setShowCreateTray] = useState(false);

  // Handle task creation - Convert from your TaskFormData to a simpler format for the alert
  const handleCreateTask = async (taskData: TaskFormData) => {
    console.log('New task created:', taskData);
    
    try {
      // Here you would typically integrate with your task service:
      // const { default: SupabaseTaskService } = await import('../services/tasks/supabaseTaskService');
      // 
      // Convert TaskFormData to the format expected by your service:
      // const taskForService = {
      //   title: taskData.title,
      //   description: taskData.description,
      //   emoji: taskData.emoji || '✨',
      //   when: taskData.dueDate ? taskData.dueDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      //   time: taskData.dueTime,
      //   category: 'Personal', // You might want to add this to TaskFormData
      //   priority: 'medium' as const, // You might want to add this to TaskFormData
      //   isShared: taskData.isShared,
      //   frequency: taskData.repeat,
      //   alerts: [], // You might want to add this to TaskFormData
      // };
      // 
      // await SupabaseTaskService.createTaskFromForm(taskForService);
      
      // For now, just show a success message
      const dateStr = taskData.dueDate ? taskData.dueDate.toLocaleDateString() : 'today';
      Alert.alert(
        'Task Created! 🎉',
        `"${taskData.title}" has been added for ${dateStr}`,
        [{ text: 'Great!' }]
      );
      
    } catch (error) {
      console.error('Failed to create task:', error);
      Alert.alert(
        'Error',
        'Failed to create task. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Minimal Custom Tab Bar
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
                // Open the create tray instead of navigating
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
                  <Text style={[
                    styles.tabLabel,
                    isFocused && styles.tabLabelActive
                  ]}>
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
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Timeline" component={TimelineScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Create" component={CreateScreen} />
        <Tab.Screen name="Knowledge" component={KnowledgeScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      {/* Floating Create Task Tray - This overlays everything */}
      <CreateTaskScreen
        visible={showCreateTray}
        onClose={() => setShowCreateTray(false)}
        onCreateTask={handleCreateTask}
      />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
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