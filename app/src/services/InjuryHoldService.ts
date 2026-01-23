/**
 * InjuryHoldService
 * 
 * Manages injury holds - pausing muscle groups or movement patterns for recovery.
 * 
 * Key Features per PRD:
 * - Pause muscle groups or movement patterns for set duration
 * - Workouts auto-adjust to unaffected areas
 * - After hold ends, resume in Rehab Mode at 50-60% pre-injury loads
 * - User prompted to re-evaluate intensity goals
 * 
 * Example: Frozen shoulder → pause all push/pull patterns
 */

import {
  InjuryHold,
  MuscleGroup,
  ProtocolExerciseTemplate,
  FourRepMax,
} from '../types';
import RehabModeService from './RehabModeService';

export interface CreateHoldParams {
  userId: string;
  muscleGroups: MuscleGroup[];
  movementPatterns: string[]; // 'push', 'pull', 'squat', 'hinge'
  durationWeeks: number;
  reason: string;
}

export interface HoldImpactAnalysis {
  totalExercisesAffected: number;
  affectedExercises: string[];
  remainingExercises: string[];
  canStillTrain: boolean;
}

export class InjuryHoldService {
  /**
   * Create a new injury hold
   */
  static createHold(params: CreateHoldParams): InjuryHold {
    const startDate = Date.now();
    const durationMs = params.durationWeeks * 7 * 24 * 60 * 60 * 1000;
    const endDate = startDate + durationMs;

    return {
      id: this.generateId(),
      userId: params.userId,
      muscleGroups: params.muscleGroups,
      movementPatterns: params.movementPatterns,
      startDate,
      endDate,
      active: true,
      reason: params.reason,
    };
  }

  /**
   * Check if an exercise is affected by active holds
   */
  static isExerciseAffected(
    exerciseId: string,
    exerciseMuscleGroups: MuscleGroup[],
    exerciseMovementPattern: string,
    activeHolds: InjuryHold[]
  ): {
    isAffected: boolean;
    affectedBy: InjuryHold[];
    reason: string[];
  } {
    const affectingHolds = activeHolds.filter(hold => {
      // Check if exercise uses any held muscle groups
      const muscleGroupAffected = hold.muscleGroups.some(mg =>
        exerciseMuscleGroups.includes(mg)
      );

      // Check if exercise uses any held movement patterns
      const movementAffected = hold.movementPatterns.includes(exerciseMovementPattern);

      return muscleGroupAffected || movementAffected;
    });

    if (affectingHolds.length === 0) {
      return {
        isAffected: false,
        affectedBy: [],
        reason: [],
      };
    }

    const reasons = affectingHolds.map(hold => {
      const affectedMGs = hold.muscleGroups.filter(mg => exerciseMuscleGroups.includes(mg));
      const affectedMPs = hold.movementPatterns.filter(mp => mp === exerciseMovementPattern);
      
      const parts: string[] = [];
      if (affectedMGs.length > 0) {
        parts.push(`uses ${affectedMGs.join(', ')}`);
      }
      if (affectedMPs.length > 0) {
        parts.push(`requires ${affectedMPs.join(', ')} pattern`);
      }
      
      return `Hold: ${hold.reason} (${parts.join(', ')})`;
    });

    return {
      isAffected: true,
      affectedBy: affectingHolds,
      reason: reasons,
    };
  }

  /**
   * Filter workout to remove held exercises
   * Returns adjusted workout with only unaffected exercises
   */
  static adjustWorkoutForHolds(
    exercises: Array<{
      exerciseId: string;
      muscleGroups: MuscleGroup[];
      movementPattern: string;
    }>,
    activeHolds: InjuryHold[]
  ): {
    allowedExercises: string[];
    removedExercises: Array<{ exerciseId: string; reason: string }>;
  } {
    const allowedExercises: string[] = [];
    const removedExercises: Array<{ exerciseId: string; reason: string }> = [];

    exercises.forEach(exercise => {
      const affected = this.isExerciseAffected(
        exercise.exerciseId,
        exercise.muscleGroups,
        exercise.movementPattern,
        activeHolds
      );

      if (affected.isAffected) {
        removedExercises.push({
          exerciseId: exercise.exerciseId,
          reason: affected.reason.join('; '),
        });
      } else {
        allowedExercises.push(exercise.exerciseId);
      }
    });

    return {
      allowedExercises,
      removedExercises,
    };
  }

  /**
   * Analyze impact of creating a hold
   * Shows user what will be affected before confirming
   */
  static analyzeHoldImpact(
    params: CreateHoldParams,
    plannedExercises: Array<{
      exerciseId: string;
      muscleGroups: MuscleGroup[];
      movementPattern: string;
    }>
  ): HoldImpactAnalysis {
    const tempHold = this.createHold(params);
    const adjustment = this.adjustWorkoutForHolds(plannedExercises, [tempHold]);

    return {
      totalExercisesAffected: adjustment.removedExercises.length,
      affectedExercises: adjustment.removedExercises.map(e => e.exerciseId),
      remainingExercises: adjustment.allowedExercises,
      canStillTrain: adjustment.allowedExercises.length > 0,
    };
  }

  /**
   * Check if hold has expired
   */
  static isHoldExpired(hold: InjuryHold): boolean {
    return Date.now() >= hold.endDate;
  }

  /**
   * Deactivate expired holds
   */
  static deactivateExpiredHolds(holds: InjuryHold[]): InjuryHold[] {
    return holds.map(hold => ({
      ...hold,
      active: !this.isHoldExpired(hold),
    }));
  }

  /**
   * Get active holds for a user
   */
  static getActiveHolds(holds: InjuryHold[]): InjuryHold[] {
    return holds.filter(h => h.active && !this.isHoldExpired(h));
  }

  /**
   * Calculate reintegration plan after hold ends
   * Per PRD: Resume in Rehab Mode, start at 50-60% of pre-injury loads
   */
  static createReintegrationPlan(
    hold: InjuryHold,
    preInjuryMaxes: Record<string, number>,
    affectedExercises: string[]
  ): {
    startingWeights: Record<string, number>;
    rehabDurationWeeks: number;
    phaseDescription: string[];
  } {
    const holdDurationDays = Math.ceil((hold.endDate - hold.startDate) / (1000 * 60 * 60 * 24));
    
    const startingWeights: Record<string, number> = {};
    
    affectedExercises.forEach(exerciseId => {
      const preInjuryMax = preInjuryMaxes[exerciseId];
      if (preInjuryMax) {
        const resumeData = RehabModeService.resumeAfterHold(preInjuryMax, holdDurationDays);
        startingWeights[exerciseId] = resumeData.startingWeight;
      }
    });

    // Rehab duration roughly equals hold duration (minimum 4 weeks)
    const rehabDurationWeeks = Math.max(4, Math.ceil(holdDurationDays / 7));

    const phaseDescription = [
      `Week 1-2: Start at 50-60% pre-injury strength`,
      `Week 3-4: Gradually increase to 70-80% if pain-free`,
      `Week 5+: Progress to 90%+ and consider normal training`,
      `Monitor pain closely throughout reintegration`,
    ];

    return {
      startingWeights,
      rehabDurationWeeks,
      phaseDescription,
    };
  }

  /**
   * Suggest alternative exercises for held muscle groups
   * Helps maintain training when certain areas are paused
   */
  static suggestAlternatives(
    heldMuscleGroups: MuscleGroup[],
    allMuscleGroups: MuscleGroup[]
  ): {
    canTrain: MuscleGroup[];
    suggestions: string[];
  } {
    const canTrain = allMuscleGroups.filter(mg => !heldMuscleGroups.includes(mg));

    const suggestions: string[] = [];
    
    if (canTrain.length === 0) {
      suggestions.push('All major muscle groups on hold. Focus on active recovery, mobility, and rest.');
    } else {
      suggestions.push(`Focus on unaffected areas: ${canTrain.join(', ')}`);
      
      if (heldMuscleGroups.includes('chest') && !heldMuscleGroups.includes('legs')) {
        suggestions.push('Increase leg training frequency during upper body hold');
      }
      
      if (heldMuscleGroups.includes('legs') && !heldMuscleGroups.includes('chest')) {
        suggestions.push('Opportunity to emphasize upper body development');
      }
    }

    return {
      canTrain,
      suggestions,
    };
  }

  /**
   * Get hold status summary for user dashboard
   */
  static getHoldSummary(activeHolds: InjuryHold[]): {
    totalActiveHolds: number;
    affectedMuscleGroups: MuscleGroup[];
    affectedPatterns: string[];
    earliestEndDate: number | null;
    daysUntilResume: number | null;
  } {
    if (activeHolds.length === 0) {
      return {
        totalActiveHolds: 0,
        affectedMuscleGroups: [],
        affectedPatterns: [],
        earliestEndDate: null,
        daysUntilResume: null,
      };
    }

    const affectedMuscleGroups = Array.from(
      new Set(activeHolds.flatMap(h => h.muscleGroups))
    );

    const affectedPatterns = Array.from(
      new Set(activeHolds.flatMap(h => h.movementPatterns))
    );

    const earliestEndDate = Math.min(...activeHolds.map(h => h.endDate));
    const daysUntilResume = Math.ceil((earliestEndDate - Date.now()) / (1000 * 60 * 60 * 24));

    return {
      totalActiveHolds: activeHolds.length,
      affectedMuscleGroups,
      affectedPatterns,
      earliestEndDate,
      daysUntilResume,
    };
  }

  /**
   * Extend or shorten hold duration
   * Trainer or user can modify based on recovery
   */
  static modifyHoldDuration(
    hold: InjuryHold,
    newDurationWeeks: number
  ): InjuryHold {
    const durationMs = newDurationWeeks * 7 * 24 * 60 * 60 * 1000;
    
    return {
      ...hold,
      endDate: hold.startDate + durationMs,
    };
  }

  /**
   * End hold early (e.g., recovery faster than expected)
   */
  static endHoldEarly(hold: InjuryHold): InjuryHold {
    return {
      ...hold,
      endDate: Date.now(),
      active: false,
    };
  }

  /**
   * Get timeline of injury holds for visualization
   */
  static getHoldTimeline(
    holds: InjuryHold[]
  ): Array<{
    startDate: number;
    endDate: number;
    durationWeeks: number;
    muscleGroups: MuscleGroup[];
    active: boolean;
    reason: string;
  }> {
    return holds.map(hold => {
      const durationMs = hold.endDate - hold.startDate;
      const durationWeeks = durationMs / (7 * 24 * 60 * 60 * 1000);

      return {
        startDate: hold.startDate,
        endDate: hold.endDate,
        durationWeeks: Math.round(durationWeeks * 10) / 10,
        muscleGroups: hold.muscleGroups,
        active: hold.active && !this.isHoldExpired(hold),
        reason: hold.reason,
      };
    });
  }

  /**
   * Utility: Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default InjuryHoldService;
