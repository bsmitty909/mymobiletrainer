/**
 * Enhanced Types for Formula Integration
 * 
 * Extended types to support:
 * - Conditional sets with progressive disclosure
 * - Intensity percentage tracking
 * - Max attempt results and progression
 * - Down set generation
 */

import { SetLog, RepTarget } from './index';

// ============================================================================
// CONDITIONAL SET TYPES
// ============================================================================

export type ConditionType = 
  | 'previous_sets_complete' 
  | 'reps_achieved' 
  | 'weight_achieved' 
  | 'always';

export interface SetCondition {
  type: ConditionType;
  requiredSets?: number;
  requiredReps?: number;
  requiredWeight?: number;
}

export interface ConditionalSet {
  setNumber: number;
  weight: number;
  targetReps: number | 'REP_OUT';
  restPeriod: string;
  intensityPercentage: number; // 0.35, 0.80, 0.90, 1.0, etc.
  isConditional: boolean;
  condition?: SetCondition;
  shouldDisplay: boolean;

  setType?: string;}

// ============================================================================
// MAX ATTEMPT RESULT TYPES
// ============================================================================

export type MaxAttemptInstruction = 
  | 'PROCEED_TO_DOWN_SETS' 
  | 'NEW_MAX_ATTEMPT' 
  | 'COMPLETE';

export interface MaxAttemptResult {
  success: boolean;
  newMax?: number;
  instruction: MaxAttemptInstruction;
  nextWeight?: number;
  message?: string;
}

// ============================================================================
// ENHANCED SET LOG
// ============================================================================

export interface EnhancedSetLog extends SetLog {
  intensityPercentage?: number;
  isConditional?: boolean;
  conditionMet?: boolean;
  isDownSet?: boolean;
  isMaxAttempt?: boolean;
}

// ============================================================================
// DOWN SET CONFIGURATION
// ============================================================================

export interface DownSetConfig {
  numberOfSets: number;
  intensityPercentage: number; // Typically 0.80 (80%)
  repScheme: number | 'REP_OUT';
  restPeriod: string;
}

// ============================================================================
// PROGRESSION TRACKING
// ============================================================================

export interface WeeklyMax {
  id: string;
  userId: string;
  exerciseId: string;
  weekNumber: number;
  weight: number;
  achievedAt: number; // timestamp
  progressionFromPreviousWeek: number; // +5, 0, -5, etc.
}

export interface MaxAttemptHistory {
  id: string;
  userId: string;
  exerciseId: string;
  sessionId: string;
  attemptedWeight: number;
  repsCompleted: number;
  successful: boolean;
  attemptedAt: number; // timestamp
}

// ============================================================================
// WORKOUT SESSION ENHANCEMENT
// ============================================================================

export interface EnhancedWorkoutState {
  currentSets: ConditionalSet[];
  displayedSets: ConditionalSet[];
  pendingDownSets: ConditionalSet[];
  maxAttemptInProgress: boolean;
  lastMaxAttemptResult?: MaxAttemptResult;
}

// ============================================================================
// INTENSITY PERCENTAGE CONSTANTS (from extracted formulas)
// ============================================================================

export const INTENSITY_LEVELS = {
  WARMUP_VERY_LIGHT: 0.10,
  WARMUP_LIGHT_1: 0.15,
  WARMUP_LIGHT_2: 0.20,
  WARMUP_SPECIFIC: 0.29,
  WARMUP_STANDARD: 0.35,
  MODERATE: 0.50,
  WORKING_LIGHT: 0.65,
  WORKING_MODERATE_1: 0.70,
  WORKING_MODERATE_2: 0.75,
  WORKING_HEAVY_1: 0.78,
  WORKING_HEAVY_2: 0.80,
  WORKING_VERY_HEAVY: 0.85,
  NEAR_MAX: 0.90,
  PEAK: 0.95,
  MAX: 1.0,
  OVER_MAX: 1.05,
  BODYWEIGHT_2X: 2.0
} as const;

export type IntensityLevel = typeof INTENSITY_LEVELS[keyof typeof INTENSITY_LEVELS];

// ============================================================================
// REST PERIOD MAPPINGS (from extracted formulas)
// ============================================================================

export const REST_BY_INTENSITY: Record<string, string> = {
  'warmup': '30s',          // ≤35%
  'light': '1 MIN',         // 50-65%
  'working': '1-2 MIN',     // 65-80%
  'heavy': '1-2 MIN',       // 80-90%
  'max': '1-5 MIN',         // ≥90%
  'downset': '1-2 MIN',     // Down sets
  'repout': '1 MIN'         // Final rep-out set
};

// ============================================================================
// PYRAMID SET TEMPLATE
// ============================================================================

export interface PyramidSetTemplate {
  exerciseId: string;
  fourRepMax: number;
  sets: ConditionalSet[];
  includeProgressiveMaxAttempts: boolean;
  includeDownSets: boolean;
}

export default {};
