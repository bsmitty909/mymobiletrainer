/**
 * Main Navigator
 *
 * Root navigation component that handles:
 * - Onboarding flow for new users
 * - Main tab navigation for existing users
 */

import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector } from '../store/store';
import { RootStackParamList, MainTabsParamList } from '../types';

// Import screens (will be created)
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import WorkoutDashboardScreen from '../screens/workout/WorkoutDashboardScreen';
import ProgressDashboardScreen from '../screens/progress/ProgressDashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

/**
 * Main tab navigation (after onboarding)
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB', // Energy Blue
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Workout"
        component={WorkoutDashboardScreen}
        options={{
          tabBarLabel: 'Workout',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>🏋️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressDashboardScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Root navigator that decides between onboarding and main app
 */
export default function MainNavigator() {
  const isOnboarded = useAppSelector((state) => state.user.isOnboarded);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <RootStack.Screen name="Onboarding" component={WelcomeScreen} />
        ) : (
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
