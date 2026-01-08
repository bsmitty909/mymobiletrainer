/**
 * Main Navigator
 *
 * Root navigation component that handles:
 * - Onboarding flow for new users
 * - Main tab navigation for existing users
 */

import React from 'react';
import { Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/store';
import { RootStackParamList, MainTabsParamList } from '../types';

// Import screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import WorkoutDashboardScreen from '../screens/workout/WorkoutDashboardScreen';
import WarmupScreen from '../screens/workout/WarmupScreen';
import WorkoutDetailScreen from '../screens/workout/WorkoutDetailScreen';
import ActiveWorkoutScreen from '../screens/workout/ActiveWorkoutScreen';
import WorkoutSummaryScreen from '../screens/workout/WorkoutSummaryScreen';
import ProgressDashboardScreen from '../screens/progress/ProgressDashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import MaxLiftsScreen from '../screens/profile/MaxLiftsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AboutScreen from '../screens/profile/AboutScreen';
import PrivacyPolicyScreen from '../screens/settings/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/settings/TermsOfServiceScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();
const WorkoutStack = createStackNavigator();
const ProfileStack = createStackNavigator();

/**
 * Workout tab stack navigator
 * Allows navigation within workout tab: Dashboard → Active → Summary
 */
function WorkoutStackNavigator() {
  return (
    <WorkoutStack.Navigator screenOptions={{ headerShown: false }}>
      <WorkoutStack.Screen name="WorkoutDashboard" component={WorkoutDashboardScreen} />
      <WorkoutStack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <WorkoutStack.Screen name="Warmup" component={WarmupScreen} />
      <WorkoutStack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
      <WorkoutStack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} />
    </WorkoutStack.Navigator>
  );
}

/**
 * Profile tab stack navigator
 * Allows navigation within profile tab: Profile → Settings → Max Lifts
 */
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="MaxLifts" component={MaxLiftsScreen} />
      <ProfileStack.Screen name="About" component={AboutScreen} />
      <ProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <ProfileStack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
    </ProfileStack.Navigator>
  );
}

/**
 * Main tab navigation (after onboarding)
 */
function MainTabs() {
  const insets = useSafeAreaInsets();
  const themeMode = useAppSelector((state) => state.ui.theme);
  const isDark = themeMode === 'dark';
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Workout"
        component={WorkoutStackNavigator}
        options={{
          tabBarLabel: 'Workout',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="dumbbell" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressDashboardScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-line" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
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
