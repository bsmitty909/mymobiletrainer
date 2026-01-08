/**
 * Settings Screen
 * 
 * User preferences and app configuration
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Switch, Divider } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setTheme, resetUI } from '../../store/slices/uiSlice';
import { resetUser } from '../../store/slices/userSlice';
import { clearProgress } from '../../store/slices/progressSlice';
import { clearActiveSession } from '../../store/slices/workoutSlice';
import StorageService from '../../services/StorageService';
import useThemeColors from '../../utils/useThemeColors';

export default function SettingsScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const theme = useAppSelector((state) => state.ui.theme);
  
  // Local state for settings
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [restTimerSound, setRestTimerSound] = useState(true);
  const [restTimerVibration, setRestTimerVibration] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(false);
  const [achievementNotifications, setAchievementNotifications] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await StorageService.getSettings();
      setWeightUnit(settings.weightUnit);
      setRestTimerSound(settings.restTimerSound);
      setRestTimerVibration(settings.restTimerVibration);
      setWorkoutReminders(settings.workoutReminders);
      setAchievementNotifications(settings.achievementNotifications);
      dispatch(setTheme(settings.theme));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (updates: Partial<any>) => {
    try {
      await StorageService.saveSettings(updates);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
    saveSettings({ theme: newTheme });
  };

  const handleWeightUnitChange = (isKg: boolean) => {
    const unit = isKg ? 'kg' : 'lbs';
    setWeightUnit(unit);
    saveSettings({ weightUnit: unit });
  };

  const handleRestTimerSoundChange = (value: boolean) => {
    setRestTimerSound(value);
    saveSettings({ restTimerSound: value });
  };

  const handleRestTimerVibrationChange = (value: boolean) => {
    setRestTimerVibration(value);
    saveSettings({ restTimerVibration: value });
  };

  const handleWorkoutRemindersChange = (value: boolean) => {
    setWorkoutReminders(value);
    saveSettings({ workoutReminders: value });
  };

  const handleAchievementNotificationsChange = (value: boolean) => {
    setAchievementNotifications(value);
    saveSettings({ achievementNotifications: value });
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure? This will delete all your workout history, max lifts, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAll();
              dispatch(resetUser());
              dispatch(clearProgress());
              dispatch(clearActiveSession());
              dispatch(resetUI());
              Alert.alert('Success', 'All data has been cleared. Please restart the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    section: {
      backgroundColor: colors.surface,
      marginTop: 16,
      paddingVertical: 8,
    },
    sectionTitle: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: colors.primary,
      fontWeight: 'bold',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    bottomSpacing: {
      height: 32,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Units & Display
        </Text>
        
        <List.Item
          title="Weight Unit"
          description={weightUnit === 'lbs' ? 'Pounds (lbs)' : 'Kilograms (kg)'}
          left={props => <List.Icon {...props} icon="weight" />}
          right={() => (
            <Switch
              value={weightUnit === 'kg'}
              onValueChange={handleWeightUnitChange}
            />
          )}
        />
        
        <List.Item
          title="Dark Mode"
          description="Use dark theme"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={theme === 'dark'}
              onValueChange={handleThemeToggle}
            />
          )}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Rest Timer
        </Text>
        
        <List.Item
          title="Sound Alerts"
          description="Play sound when rest timer completes"
          left={props => <List.Icon {...props} icon="volume-high" />}
          right={() => (
            <Switch
              value={restTimerSound}
              onValueChange={setRestTimerSound}
            />
          )}
        />
        
        <List.Item
          title="Vibration"
          description="Vibrate when rest timer completes"
          left={props => <List.Icon {...props} icon="vibrate" />}
          right={() => (
            <Switch
              value={restTimerVibration}
              onValueChange={setRestTimerVibration}
            />
          )}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Notifications
        </Text>
        
        <List.Item
          title="Workout Reminders"
          description="Get reminded to workout"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={workoutReminders}
              onValueChange={handleWorkoutRemindersChange}
            />
          )}
        />
        
        <List.Item
          title="Achievement Notifications"
          description="Get notified of personal records"
          left={props => <List.Icon {...props} icon="trophy" />}
          right={() => (
            <Switch
              value={achievementNotifications}
              onValueChange={handleAchievementNotificationsChange}
            />
          )}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Data & Privacy
        </Text>
        
        <List.Item
          title="Export Workout Data"
          description="Download your workout history"
          left={props => <List.Icon {...props} icon="download" />}
          onPress={() => {
            // TODO: Implement export functionality
            console.log('Export data');
          }}
        />
        
        <List.Item
          title="Clear All Data"
          description="Reset app to initial state"
          left={props => <List.Icon {...props} icon="delete-forever" color={colors.error} />}
          titleStyle={{ color: colors.error }}
          onPress={handleClearData}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          About
        </Text>
        
        <List.Item
          title="App Version"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />
        
        <List.Item
          title="Privacy Policy"
          left={props => <List.Icon {...props} icon="shield-lock" />}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />
        
        <List.Item
          title="Terms of Service"
          left={props => <List.Icon {...props} icon="file-document" />}
          onPress={() => navigation.navigate('TermsOfService')}
        />
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}
