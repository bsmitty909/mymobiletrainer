/**
 * WorkoutEngineRouter
 *
 * Routes workout generation to the protocol system (P1/P2/P3).
 * All users now use the protocol-based system exclusively.
 *
 * The protocol system uses formula-based weight calculations within
 * the P1/P2/P3 structure for main lifts and accessory work.
 */

import {
  UserProfile,
  WorkoutSession,
  Day,
  MaxLift,
  FourRepMax,
  ProtocolExerciseTemplate,
  WeightCalculationResult,
  WeekType,
} from '../types';
import FormulaCalculator from './FormulaCalculator';
import ProtocolWorkoutEngine, { 
  ProtocolWorkoutContext,
  GeneratedProtocolExercise 
} from './ProtocolWorkoutEngine';
import FourRepMaxService from './FourRepMaxService';

export interface RouterContext {
  userId: string;
  userProfile: UserProfile;
  weekNumber: number;
  dayNumber: number;
  bodyWeight?: number;
}

export interface RoutedWorkoutResult {
  session: WorkoutSession | null;
  exercises: any[]; // Protocol exercises
  calculatedWeights?: Record<string, WeightCalculationResult>;
  errors: string[];
  warnings: string[];
}

export class WorkoutEngineRouter {
  /**
   * Main routing function - generates workout using protocol system
   */
  static async generateWorkout(
    day: Day,
    context: RouterContext
  ): Promise<RoutedWorkoutResult> {
    return this.generateProtocolWorkout(day, context);
  }

  /**
   * Generate workout using protocol-based system (P1/P2/P3)
   */
  private static async generateProtocolWorkout(
    day: Day,
    context: RouterContext
  ): Promise<RoutedWorkoutResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Convert Day exercises to ProtocolExerciseTemplates
      // This assumes exercises have been assigned protocols
      const protocolExercises: ProtocolExerciseTemplate[] = day.exercises.map((ex, index) => ({
        exerciseId: ex.exerciseId,
        protocol: this.inferProtocol(ex.exerciseId, index, day.exercises.length),
        protocolOrder: index + 1,
        alternatives: ex.alternates,
        notes: ex.notes,
      }));

      // Get 4RMs from user profile
      const fourRepMaxes = this.convertMaxLiftsTo4RM(context.userProfile.maxLifts);

      // Validate all exercises have 4RMs
      const validation = ProtocolWorkoutEngine.validateProtocolWorkout(
        protocolExercises,
        fourRepMaxes
      );

      if (!validation.valid) {
        errors.push(...validation.errors);
        warnings.push('Some exercises missing 4RM - P1 testing required');
      }

      // Create protocol workout context
      const protocolContext: ProtocolWorkoutContext = {
        userId: context.userId,
        sessionId: this.generateId(),
        fourRepMaxes,
        muscleGroup: day.muscleGroups[0], // Primary muscle group
        equipmentType: 'barbell', // Would come from exercise metadata
      };

      // Generate protocol exercises
      const generatedExercises = ProtocolWorkoutEngine.generateProtocolWorkout(
        protocolExercises,
        protocolContext
      );

      return {
        session: null, // Would create full session
        exercises: generatedExercises,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(`Protocol workout generation failed: ${error}`);
      
      return {
        session: null,
        exercises: [],
        errors,
        warnings,
      };
    }
  }

  /**
   * Convert MaxLifts (1RM) to FourRepMax for protocol system
   */
  private static convertMaxLiftsTo4RM(
    maxLifts: Record<string, MaxLift>
  ): Record<string, FourRepMax> {
    const fourRepMaxes: Record<string, FourRepMax> = {};

    Object.entries(maxLifts).forEach(([exerciseId, maxLift]) => {
      fourRepMaxes[exerciseId] = {
        id: this.generateId(),
        userId: maxLift.userId,
        exerciseId,
        weight: FourRepMaxService.convertFrom1RMto4RM(maxLift.weight),
        dateAchieved: maxLift.dateAchieved,
        verified: false, // Not verified until P1 testing
        testingSessionId: maxLift.workoutSessionId,
      };
    });

    return fourRepMaxes;
  }

  /**
   * Infer protocol for exercise (temporary)
   * In real implementation, exercises would have protocol assigned
   */
  private static inferProtocol(
    exerciseId: string,
    index: number,
    totalExercises: number
  ): 'P1' | 'P2' | 'P3' {
    // Main lifts get P1
    const mainLifts = ['bench-press', 'squat', 'deadlift', 'overhead-press', 'barbell-row'];
    if (mainLifts.some(lift => exerciseId.includes(lift))) {
      return 'P1';
    }

    // Last exercises get P3 (accessories)
    if (index >= totalExercises - 2) {
      return 'P3';
    }

    // Everything else gets P2 (volume)
    return 'P2';
  }

  /**
   * Utility: Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default WorkoutEngineRouter;
