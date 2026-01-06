/**
 * Database Initialization
 * 
 * Sets up WatermelonDB with SQLite adapter for local-first storage.
 * Provides reactive, performant data access for the app.
 */

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';

// Import models (will be created)
import User from './User';
import BodyWeight from './BodyWeight';
import Exercise from './Exercise';
import ExerciseVariant from './ExerciseVariant';
import MaxLift from './MaxLift';
import PersonalRecord from './PersonalRecord';
import WorkoutSession from './WorkoutSession';
import ExerciseLog from './ExerciseLog';
import SetLog from './SetLog';
import UserPreferences from './UserPreferences';

// SQLite adapter configuration
const adapter = new SQLiteAdapter({
  schema,
  // Optional: migrations for schema updates
  // migrations,
  jsi: true, // Use JSI for better performance (requires Expo 48+)
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

// Initialize database with all models
export const database = new Database({
  adapter,
  modelClasses: [
    User,
    BodyWeight,
    Exercise,
    ExerciseVariant,
    MaxLift,
    PersonalRecord,
    WorkoutSession,
    ExerciseLog,
    SetLog,
    UserPreferences,
  ],
});

export default database;
