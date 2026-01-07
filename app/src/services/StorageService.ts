/**
 * Storage Service
 * 
 * Handles all AsyncStorage operations for persisting app data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_SETTINGS: '@mmt_user_settings',
  USER_MAXES: '@mmt_user_maxes',
  WORKOUT_HISTORY: '@mmt_workout_history',
  USER_PROFILE: '@mmt_user_profile',
} as const;

export interface UserSettings {
  weightUnit: 'lbs' | 'kg';
  theme: 'light' | 'dark' | 'auto';
  restTimerSound: boolean;
  restTimerVibration: boolean;
  workoutReminders: boolean;
  achievementNotifications: boolean;
}

export class StorageService {
  /**
   * Save user settings
   */
  static async saveSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      const existing = await this.getSettings();
      const updated = { ...existing, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Get user settings
   */
  static async getSettings(): Promise<UserSettings> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      if (value) {
        return JSON.parse(value);
      }
      // Return defaults if no settings exist
      return {
        weightUnit: 'lbs',
        theme: 'auto',
        restTimerSound: true,
        restTimerVibration: true,
        workoutReminders: false,
        achievementNotifications: true,
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  }

  /**
   * Save user maxes
   */
  static async saveMaxes(maxes: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_MAXES, JSON.stringify(maxes));
    } catch (error) {
      console.error('Error saving maxes:', error);
      throw error;
    }
  }

  /**
   * Get user maxes
   */
  static async getMaxes(): Promise<any> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.USER_MAXES);
      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.error('Error getting maxes:', error);
      throw error;
    }
  }

  /**
   * Save workout history
   */
  static async saveWorkoutHistory(history: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving workout history:', error);
      throw error;
    }
  }

  /**
   * Get workout history
   */
  static async getWorkoutHistory(): Promise<any[]> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting workout history:', error);
      throw error;
    }
  }

  /**
   * Save user profile
   */
  static async saveUserProfile(profile: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(): Promise<any | null> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Clear all app data
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Check if onboarding is complete
   */
  static async isOnboarded(): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      return !!profile;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }
}

export default StorageService;
