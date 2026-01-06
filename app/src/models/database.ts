/**
 * Database Service (Simplified for MVP)
 * 
 * Using AsyncStorage for MVP. WatermelonDB will be added when React 19 support is available.
 * This provides simple key-value storage for user data, workouts, and progress.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export class DatabaseService {
  // Storage keys
  private static readonly KEYS = {
    USER: '@mmt_user',
    USER_PROFILE: '@mmt_user_profile',
    MAX_LIFTS: '@mmt_max_lifts',
    WORKOUT_SESSIONS: '@mmt_workout_sessions',
    BODY_WEIGHTS: '@mmt_body_weights',
    PERSONAL_RECORDS: '@mmt_personal_records',
    PREFERENCES: '@mmt_preferences',
  };

  // Generic get/set methods
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  }

  static async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting data:', error);
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  }

  // Specific data access methods
  static getUser() {
    return this.get(this.KEYS.USER);
  }

  static setUser(user: any) {
    return this.set(this.KEYS.USER, user);
  }

  static getMaxLifts() {
    return this.get(this.KEYS.MAX_LIFTS);
  }

  static setMaxLifts(maxLifts: any) {
    return this.set(this.KEYS.MAX_LIFTS, maxLifts);
  }

  static async getWorkoutSessions() {
    return this.get(this.KEYS.WORKOUT_SESSIONS) || [];
  }

  static async addWorkoutSession(session: any) {
    const sessions = await this.getWorkoutSessions() || [];
    sessions.push(session);
    return this.set(this.KEYS.WORKOUT_SESSIONS, sessions);
  }

  static clearAllData() {
    return AsyncStorage.clear();
  }
}

export default DatabaseService;
