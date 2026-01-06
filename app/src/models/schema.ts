/**
 * Database Schema Documentation
 * 
 * This file documents the data structure. Currently using AsyncStorage for MVP.
 * WatermelonDB integration will be added when React 19 support is available.
 * 
 * Schema kept for reference and future migration.
 */

/*
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // User tables, workout sessions, etc.
    // See database.ts for current AsyncStorage implementation
  ],
});
*/

// Database structure documentation
export const dbStructure = {
  users: {
    id: 'string',
    name: 'string',
    experience_level: 'string',
    current_week: 'number',
    current_day: 'number',
    current_phase: 'string',
    is_onboarded: 'boolean',
    created_at: 'number',
    last_active: 'number',
  },
  body_weights: {
    id: 'string',
    user_id: 'string',
    weight: 'number',
    week_number: 'number',
    recorded_at: 'number',
  },
  max_lifts: {
    id: 'string',
    user_id: 'string',
    exercise_id: 'string',
    weight: 'number',
    reps: 'number',
    verified: 'boolean',
    achieved_at: 'number',
  },
  workout_sessions: {
    id: 'string',
    user_id: 'string',
    week_number: 'number',
    day_number: 'number',
    started_at: 'number',
    completed_at: 'number',
    status: 'string',
  },
};

export default dbStructure;
