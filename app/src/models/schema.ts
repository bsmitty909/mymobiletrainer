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
  // ========== EXISTING TABLES ==========
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
    training_mode: 'string', // 'percentage' or 'protocol'
  },
  user_profiles: {
    id: 'string',
    user_id: 'string',
    training_mode: 'string', // 'percentage' or 'protocol'
    preferred_p1_frequency: 'number',
    auto_suggest_p1: 'boolean',
    show_readiness_signals: 'boolean',
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
  
  // ========== PROTOCOL SYSTEM TABLES ==========
  four_rep_maxes: {
    id: 'string',
    user_id: 'string',
    exercise_id: 'string',
    weight: 'number',
    date_achieved: 'number',
    verified: 'boolean', // True only if earned via P1
    testing_session_id: 'string',
  },
  max_testing_attempts: {
    id: 'string',
    user_id: 'string',
    exercise_id: 'string',
    four_rep_max: 'number',
    attempted_weight: 'number',
    reps_completed: 'number',
    successful: 'boolean',
    timestamp: 'number',
    session_id: 'string',
  },
  
  // ========== INJURY & RECOVERY TABLES ==========
  injury_reports: {
    id: 'string',
    user_id: 'string',
    muscle_group: 'string',
    severity: 'string', // 'mild' | 'moderate' | 'severe'
    description: 'string',
    reported_at: 'number',
  },
  injury_holds: {
    id: 'string',
    user_id: 'string',
    muscle_groups: 'string', // JSON array
    movement_patterns: 'string', // JSON array
    start_date: 'number',
    end_date: 'number',
    active: 'boolean',
    reason: 'string',
  },
  rehab_sessions: {
    id: 'string',
    user_id: 'string',
    exercise_id: 'string',
    pre_injury_max: 'number',
    current_weight: 'number',
    load_reduction: 'number',
    pain_level: 'number',
    session_id: 'string',
    timestamp: 'number',
  },
  missed_workouts: {
    id: 'string',
    user_id: 'string',
    scheduled_date: 'number',
    reason: 'string', // 'injury' | 'no_gym_access' | 'time_constraints' | 'other'
    notes: 'string',
    timestamp: 'number',
  },
  
  // ========== TRAINER FEATURE TABLES ==========
  trainer_overrides: {
    id: 'string',
    trainer_id: 'string',
    user_id: 'string',
    exercise_id: 'string',
    override_type: 'string',
    details: 'string', // JSON
    reason: 'string',
    timestamp: 'number',
  },
  workout_flags: {
    id: 'string',
    user_id: 'string',
    flag_type: 'string', // 'plateau' | 'risk' | 'fatigue' | 'injury_concern'
    severity: 'string', // 'low' | 'medium' | 'high'
    message: 'string',
    generated_at: 'number',
    acknowledged: 'boolean',
  },
  
  // ========== REP-OUT & READINESS TABLES ==========
  rep_band_analyses: {
    id: 'string',
    user_id: 'string',
    exercise_id: 'string',
    session_id: 'string',
    reps: 'number',
    band: 'string', // 'too_heavy' | 'overloaded' | 'ideal' | 'reserve' | 'light'
    timestamp: 'number',
  },
  readiness_signals: {
    id: 'string',
    user_id: 'string',
    exercise_id: 'string',
    ready_for_p1: 'boolean',
    confidence: 'number',
    reasoning: 'string', // JSON array
    recommended_p1_date: 'number',
    generated_at: 'number',
  },
  safety_guards: {
    id: 'string',
    user_id: 'string',
    session_id: 'string',
    exercise_id: 'string',
    type: 'string', // 'rep_drop' | 'multiple_failures' | 'form_concern' | 'overtraining'
    severity: 'string', // 'warning' | 'critical'
    message: 'string',
    action_taken: 'string',
    timestamp: 'number',
  },
};

export default dbStructure;
