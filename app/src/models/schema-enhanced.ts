/**
 * Enhanced Database Schema for Formula Integration
 * 
 * Extends existing schema to support:
 * - Conditional sets with intensity tracking
 * - Weekly max progression
 * - Max attempt history
 * - Down set tracking
 */

import { TableSchema } from '@nozbe/watermelondb';

// ============================================================================
// ENHANCED SET LOG TABLE
// ============================================================================

export const enhancedSetLogSchema: TableSchema = {
  name: 'set_logs',
  columns: [
    { name: 'exercise_log_id', type: 'string', isIndexed: true },
    { name: 'set_number', type: 'number' },
    { name: 'weight', type: 'number' },
    { name: 'reps', type: 'number' },
    { name: 'target_reps_min', type: 'number', isOptional: true },
    { name: 'target_reps_max', type: 'number', isOptional: true },
    { name: 'target_reps_type', type: 'string', isOptional: true }, // 'range' or 'REP_OUT'
    { name: 'rest_seconds', type: 'number' },
    { name: 'completed_at', type: 'number' },
    { name: 'perceived_effort', type: 'number', isOptional: true },
    { name: 'notes', type: 'string', isOptional: true },
    
    // NEW FIELDS from formula extraction
    { name: 'intensity_percentage', type: 'number', isOptional: true },
    { name: 'is_conditional', type: 'boolean', isOptional: true },
    { name: 'condition_met', type: 'boolean', isOptional: true },
    { name: 'is_down_set', type: 'boolean', isOptional: true },
    { name: 'is_max_attempt', type: 'boolean', isOptional: true },
    { name: 'rest_period_text', type: 'string', isOptional: true }, // '30s', '1-2 MIN', etc.
    
    // Timestamps
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' }
  ]
};

// ============================================================================
// WEEKLY MAXES TABLE (NEW)
// ============================================================================

export const weeklyMaxesSchema: TableSchema = {
  name: 'weekly_maxes',
  columns: [
    { name: 'user_id', type: 'string', isIndexed: true },
    { name: 'exercise_id', type: 'string', isIndexed: true },
    { name: 'week_number', type: 'number', isIndexed: true },
    { name: 'weight', type: 'number' },
    { name: 'achieved_at', type: 'number' },
    { name: 'progression_from_previous_week', type: 'number' }, // +5, 0, -5, etc.
    { name: 'session_id', type: 'string', isOptional: true },
    
    // Timestamps
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' }
  ]
};

// ============================================================================
// MAX ATTEMPT HISTORY TABLE (NEW)
// ============================================================================

export const maxAttemptHistorySchema: TableSchema = {
  name: 'max_attempt_history',
  columns: [
    { name: 'user_id', type: 'string', isIndexed: true },
    { name: 'exercise_id', type: 'string', isIndexed: true },
    { name: 'session_id', type: 'string', isIndexed: true },
    { name: 'attempted_weight', type: 'number' },
    { name: 'reps_completed', type: 'number' },
    { name: 'successful', type: 'boolean' },
    { name: 'set_number', type: 'number' },
    { name: 'attempted_at', type: 'number' },
    { name: 'instruction_given', type: 'string' }, // 'PROCEED_TO_DOWN_SETS', 'NEW_MAX_ATTEMPT'
    
    // Timestamps
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' }
  ]
};

// ============================================================================
// CONDITIONAL SETS TABLE (NEW)
// ============================================================================

export const conditionalSetsSchema: TableSchema = {
  name: 'conditional_sets',
  columns: [
    { name: 'exercise_log_id', type: 'string', isIndexed: true },
    { name: 'set_number', type: 'number' },
    { name: 'weight', type: 'number' },
    { name: 'target_reps', type: 'number', isOptional: true },
    { name: 'target_reps_type', type: 'string', isOptional: true }, // 'fixed', 'REP_OUT'
    { name: 'rest_period', type: 'string' },
    { name: 'intensity_percentage', type: 'number' },
    { name: 'is_conditional', type: 'boolean' },
    { name: 'condition_type', type: 'string', isOptional: true },
    { name: 'required_sets', type: 'number', isOptional: true },
    { name: 'required_reps', type: 'number', isOptional: true },
    { name: 'required_weight', type: 'number', isOptional: true },
    { name: 'should_display', type: 'boolean' },
    { name: 'was_displayed', type: 'boolean' },
    { name: 'was_completed', type: 'boolean' },
    
    // Timestamps
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' }
  ]
};

// ============================================================================
// MIGRATION SCHEMA
// ============================================================================

export interface MigrationStep {
  version: number;
  description: string;
  sql?: string;
  changes: {
    table: string;
    action: 'create' | 'alter' | 'add_column';
    columns?: Array<{ name: string; type: string; isOptional?: boolean }>;
  }[];
}

export const schemaMigrations: MigrationStep[] = [
  {
    version: 1,
    description: 'Add intensity percentage and conditional set fields to set_logs',
    changes: [
      {
        table: 'set_logs',
        action: 'add_column',
        columns: [
          { name: 'intensity_percentage', type: 'number', isOptional: true },
          { name: 'is_conditional', type: 'boolean', isOptional: true },
          { name: 'condition_met', type: 'boolean', isOptional: true },
          { name: 'is_down_set', type: 'boolean', isOptional: true },
          { name: 'is_max_attempt', type: 'boolean', isOptional: true },
          { name: 'rest_period_text', type: 'string', isOptional: true }
        ]
      }
    ]
  },
  {
    version: 2,
    description: 'Create weekly_maxes table for week-to-week progression tracking',
    changes: [
      {
        table: 'weekly_maxes',
        action: 'create',
        columns: [
          { name: 'user_id', type: 'string' },
          { name: 'exercise_id', type: 'string' },
          { name: 'week_number', type: 'number' },
          { name: 'weight', type: 'number' },
          { name: 'achieved_at', type: 'number' },
          { name: 'progression_from_previous_week', type: 'number' },
          { name: 'session_id', type: 'string', isOptional: true },
          { name: 'created_at', type: 'number' },
          { name: 'updated_at', type: 'number' }
        ]
      }
    ]
  },
  {
    version: 3,
    description: 'Create max_attempt_history table for tracking all max attempts',
    changes: [
      {
        table: 'max_attempt_history',
        action: 'create',
        columns: [
          { name: 'user_id', type: 'string' },
          { name: 'exercise_id', type: 'string' },
          { name: 'session_id', type: 'string' },
          { name: 'attempted_weight', type: 'number' },
          { name: 'reps_completed', type: 'number' },
          { name: 'successful', type: 'boolean' },
          { name: 'set_number', type: 'number' },
          { name: 'attempted_at', type: 'number' },
          { name: 'instruction_given', type: 'string' },
          { name: 'created_at', type: 'number' },
          { name: 'updated_at', type: 'number' }
        ]
      }
    ]
  },
  {
    version: 4,
    description: 'Create conditional_sets table for pre-planned conditional sets',
    changes: [
      {
        table: 'conditional_sets',
        action: 'create',
        columns: [
          { name: 'exercise_log_id', type: 'string' },
          { name: 'set_number', type: 'number' },
          { name: 'weight', type: 'number' },
          { name: 'target_reps', type: 'number', isOptional: true },
          { name: 'target_reps_type', type: 'string', isOptional: true },
          { name: 'rest_period', type: 'string' },
          { name: 'intensity_percentage', type: 'number' },
          { name: 'is_conditional', type: 'boolean' },
          { name: 'condition_type', type: 'string', isOptional: true },
          { name: 'required_sets', type: 'number', isOptional: true },
          { name: 'required_reps', type: 'number', isOptional: true },
          { name: 'required_weight', type: 'number', isOptional: true },
          { name: 'should_display', type: 'boolean' },
          { name: 'was_displayed', type: 'boolean' },
          { name: 'was_completed', type: 'boolean' },
          { name: 'created_at', type: 'number' },
          { name: 'updated_at', type: 'number' }
        ]
      }
    ]
  }
];

// ============================================================================
// QUERY HELPERS
// ============================================================================

export class EnhancedQueries {
  /**
   * Get weekly max for an exercise
   */
  static getWeeklyMax(
    userId: string,
    exerciseId: string,
    weekNumber: number
  ): string {
    return `SELECT * FROM weekly_maxes 
            WHERE user_id = '${userId}' 
            AND exercise_id = '${exerciseId}' 
            AND week_number = ${weekNumber}
            ORDER BY achieved_at DESC 
            LIMIT 1`;
  }

  /**
   * Get max attempt history for analysis
   */
  static getMaxAttemptHistory(
    userId: string,
    exerciseId: string,
    limit: number = 10
  ): string {
    return `SELECT * FROM max_attempt_history 
            WHERE user_id = '${userId}' 
            AND exercise_id = '${exerciseId}'
            ORDER BY attempted_at DESC 
            LIMIT ${limit}`;
  }

  /**
   * Get progression over time
   */
  static getProgressionTrend(
    userId: string,
    exerciseId: string,
    numberOfWeeks: number = 12
  ): string {
    return `SELECT week_number, weight, progression_from_previous_week
            FROM weekly_maxes 
            WHERE user_id = '${userId}' 
            AND exercise_id = '${exerciseId}'
            ORDER BY week_number DESC 
            LIMIT ${numberOfWeeks}`;
  }

  /**
   * Calculate success rate for max attempts
   */
  static getMaxAttemptSuccessRate(
    userId: string,
    exerciseId: string
  ): string {
    return `SELECT 
              COUNT(*) as total_attempts,
              SUM(CASE WHEN successful = 1 THEN 1 ELSE 0 END) as successful_attempts,
              (SUM(CASE WHEN successful = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
            FROM max_attempt_history 
            WHERE user_id = '${userId}' 
            AND exercise_id = '${exerciseId}'`;
  }
}

export default {
  enhancedSetLogSchema,
  weeklyMaxesSchema,
  maxAttemptHistorySchema,
  conditionalSetsSchema,
  schemaMigrations,
  EnhancedQueries
};
