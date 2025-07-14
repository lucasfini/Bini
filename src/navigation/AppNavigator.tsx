import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';

// Correct Tamagui imports from main package
import { XStack, YStack, Button, Text } from 'tamagui';
import { Clock, Calendar, Plus, Settings, User } from '@tamagui/lucide-icons';

import TimelineScreen from '../screens/timeline/TimelineScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import CreateScreen from '../screens/create/CreateScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Settings screen component
const SettingsScreen = () => (
  <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="#F5F5F7" padding="$4">
    <Text fontSize="$8" fontWeight="bold" color="#1D1D1F" marginBottom="$2">
      Settings
    </Text>
    <Text fontSize="$4" color="#8E8E93">
      App Preferences
    </Text>
  </YStack>
);

const Tab = createBottomTabNavigator();

// Custom Tab Bar Component using proper Tamagui
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const getIcon = (routeName: string, isFocused: boolean, isCreate: boolean = false) => {
    const iconProps = {
      size: isCreate ? 24 : 22,
      color: isCreate ? '#FFFFFF' : (isFocused ? '#5A4FFF' : '#8E8E93'),
    };

    switch (routeName) {
      case 'Timeline':
        return <Clock {...iconProps} />;
      case 'Calendar':
        return <Calendar {...iconProps} />;
      case 'Create':
        return <Plus {...iconProps} />;
      case 'Settings':
        return <Settings {...iconProps} />;
      case 'Profile':
        return <User {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: 'transparent' }}>
      <XStack
        backgroundColor="white"
        paddingTop="$3"
        paddingBottom="$2"
        paddingHorizontal="$5"
        alignItems="center"
        justifyContent="space-around"
        borderTopLeftRadius="$7"
        borderTopRightRadius="$7"
        shadowColor="black"
        shadowOffset={{ width: 0, height: -4 }}
        shadowOpacity={0.1}
        shadowRadius={20}
        elevation={20}
      >
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const isCreate = route.name === 'Create';

          const onPress = () => {
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
            <Button
              key={route.key}
              onPress={onPress}
              unstyled
              padding="$3"
              borderRadius="$4"
              backgroundColor={
                isCreate 
                  ? '#5A4FFF' 
                  : isFocused 
                    ? '#5A4FFF15' 
                    : 'transparent'
              }
              pressStyle={{
                scale: 0.95,
                backgroundColor: isCreate ? '#4A3FDD' : isFocused ? '#5A4FFF25' : '#F0F0F0'
              }}
              animation="quick"
              shadowColor={isCreate ? '#5A4FFF' : 'transparent'}
              shadowOffset={isCreate ? { width: 0, height: 4 } : { width: 0, height: 0 }}
              shadowOpacity={isCreate ? 0.3 : 0}
              shadowRadius={isCreate ? 8 : 0}
              elevation={isCreate ? 8 : 0}
              minWidth={44}
              minHeight={44}
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              {getIcon(route.name, isFocused, isCreate)}
            </Button>
          );
        })}
      </XStack>
    </SafeAreaView>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Timeline" component={TimelineScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Create" component={CreateScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  screenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '400',
  },
  tabBarContainer: {
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    flex: 1,
  },
  tabItemActive: {},
  createTabItem: {},
  iconContainer: {
    padding: 12,
    borderRadius: 16,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#5A4FFF15',
  },
  createIconContainer: {
    backgroundColor: '#5A4FFF',
    borderRadius: 16,
    shadowColor: '#5A4FFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default AppNavigator;