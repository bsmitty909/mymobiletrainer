/**
 * WatermelonDB Schema Definition
 * 
 * Defines the local database structure for My Mobile Trainer.
 * This schema supports offline-first functionality with reactive updates.
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // ========================================================================
    // USER TABLES
    // ========================================================================
    tableSchema({
      name: 'users',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'experience_level', type: 'string' }, // 'beginner' | 'moderate'
        { name: 'current_week', type: 'number' },
        { name: 'current_day', type: 'number' },
        { name: 'current_phase', type: 'string' },
        { name: 'is_onboarded', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'last_active', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'body_weights',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'weight', type: 'number' },
        { name: 'week_number', type: 'number' },
        { name: 'recorded_at', type: 'number' },
      ],
    }),

    // ========================================================================
    // EXERCISE LIBRARY TABLES
    // ========================================================================
    tableSchema({
      name: 'exercises',
      columns: [
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'muscle_groups', type: 'string' }, // JSON array
        { name: 'primary_muscle', type: 'string' },
        { name: 'equipment_type', type: 'string' },
        { name: 'video_url', type: 'string' },
        { name: 'thumbnail_url', type: 'string', isOptional: true },
        { name: 'instructions', type: 'string' },
        { name: 'form_tips', type: 'string' }, // JSON array
      ],
    }),

    tableSchema({
      name: 'exercise_variants',
      columns: [
        { name: 'primary_exercise_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'equipment_type', type: 'string' },
        { name: 'video_url', type: 'string' },
        { name: 'instructions', type: 'string' },
        { name: 'equivalence_ratio', type: 'number' }, // For max conversion
      ],
    }),

    // ========================================================================
    // MAX LIFTS & RECORDS
    // ========================================================================
    tableSchema({
      name: 'max_lifts',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'exercise_id', type: 'string', isIndexed: true },
        { name: 'weight', type: 'number' },
        { name: 'reps', type: 'number' },
        { name: 'verified', type: 'boolean' }, // True if from max determination week
        { name: 'achieved_at', type: 'number' },
        { name: 'workout_session_id', type: 'string', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'personal_records',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'exercise_id', type: 'string', isIndexed: true },
        { name: 'record_type', type: 'string' }, // 'max_weight' | 'max_reps' | 'volume'
        { name: 'value', type: 'number' },
        { name: 'previous_value', type: 'number', isOptional: true },
        { name: 'achieved_at', type: 'number' },
        { name: 'workout_session_id', type: 'string' },
      ],
    }),

    // ========================================================================
    // WORKOUT SESSION TABLES
    // ========================================================================
    tableSchema({
      name: 'workout_sessions',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'week_number', type: 'number', isIndexed: true },
        { name: 'day_number', type: 'number', isIndexed: true },
        { name: 'phase_id', type: 'string' },
        { name: 'started_at', type: 'number' },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'paused_at', type: 'number', isOptional: true },
        { name: 'status', type: 'string' }, // 'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned'
        { name: 'body_weight', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'total_volume', type: 'number', isOptional: true },
        { name: 'duration_seconds', type: 'number', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'exercise_logs',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'exercise_id', type: 'string', isIndexed: true },
        { name: 'exercise_variant_id', type: 'string', isOptional: true },
        { name: 'order', type: 'number' },
        { name: 'suggested_weight', type: 'number' },
        { name: 'actual_weight', type: 'number', isOptional: true },
        { name: 'started_at', type: 'number', isOptional: true },
        { name: 'completed_at', type: 'number', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'set_logs',
      columns: [
        { name: 'exercise_log_id', type: 'string', isIndexed: true },
        { name: 'set_number', type: 'number' },
        { name: 'weight', type: 'number' },
        { name: 'reps', type: 'number' },
        { name: 'target_reps_min', type: 'number', isOptional: true },
        { name: 'target_reps_max', type: 'number', isOptional: true },
        { name: 'is_rep_out', type: 'boolean' },
        { name: 'rest_seconds', type: 'number' },
        { name: 'perceived_effort', type: 'number', isOptional: true }, // RPE 1-10
        { name: 'completed_at', type: 'number' },
        { name: 'notes', type: 'string', isOptional: true },
      ],
    }),

    // ========================================================================
    // USER PREFERENCES
    // ========================================================================
    tableSchema({
      name: 'user_preferences',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'weight_unit', type: 'string' }, // 'lbs' | 'kg'
        { name: 'auto_start_rest_timer', type: 'boolean' },
        { name: 'rest_timer_sound', type: 'boolean' },
        { name: 'rest_timer_vibration', type: 'boolean' },
        { name: 'workout_reminders', type: 'boolean' },
        { name: 'achievement_notifications', type: 'boolean' },
        { name: 'theme', type: 'string' }, // 'light' | 'dark' | 'auto'
        { name: 'weight_increments', type: 'string' }, // JSON array [2.5, 5, 10]
      ],
    }),
  ],
});

export default schema;
