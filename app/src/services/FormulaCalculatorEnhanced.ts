/**
 * FormulaCalculator Service - Enhanced with Asa B 2020 Excel Formulas
 *
 * Core service implementing formulas extracted from Asa B 2020.xlsx workout program.
 * This 48-week progressive overload program uses percentage-based weight calculations,
 * conditional set display, and automatic progression logic.
 *
 * Extracted Formula Logic:
 * - Percentage-based loading: 17 intensity levels from 10% to 200%
 * - Progressive overload: +5 lbs on successful max attempts
 * - Conditional sets: Display sets only after previous sets completed
 * - Auto-regulation: Failed max attempts redirect to down sets (volume work)
 * - Rest periods: 30s (warmup), 1-2 MIN (working), 1-5 MIN (max attempts)
 * - All weights rounded to nearest 5 lbs
 * - Periodization: Deload weeks, intensity waves, training max adjustment
 *
 * Source: formulas/FORMULA_IMPLEMENTATION_GUIDE.md
 */

import {
  WeightFormula,
  FormulaContext,
  WeightCalculationResult,
  ProgressionAnalysis,
  RepTarget,
  WeekType,
  EquipmentType,
  ExerciseLog,
  SetLog,
  WEEK_PERCENTAGES,
  WEIGHT_INCREMENTS,
} from '../types';
import { PeriodizationService, PeriodizationSettings, PeriodizationPlan } from './PeriodizationService';

/**
 * Extracted intensity percentages from Asa B 2020 Excel formulas
 * These 17 percentages are used throughout the 48-week program
 */
export const INTENSITY_PERCENTAGES = {
  WARMUP_VERY_LIGHT: 0.10,
  WARMUP_LIGHT_1: 0.15,
  WARMUP_LIGHT_2: 0.20,
  WARMUP_SPECIFIC: 0.29,
  WARMUP_STANDARD: 0.35,    // Most common warmup
  MODERATE: 0.50,
  WORKING_LIGHT: 0.65,
  WORKING_MODERATE_1: 0.70,
  WORKING_MODERATE_2: 0.75,
  WORKING_HEAVY_1: 0.78,
  WORKING_HEAVY_2: 0.80,    // Most common working weight
  WORKING_VERY_HEAVY: 0.85,
  NEAR_MAX: 0.90,           // High intensity
  PEAK: 0.95,
  MAX: 1.0,                 // 100% of 4RM
  OVER_MAX: 1.05,           // Attempting new PR
  BODYWEIGHT_2X: 2.0        // Special: 2× bodyweight for leg exercises
} as const;

export interface SetCondition {
  type: 'previous_sets_complete' | 'reps_achieved' | 'weight_achieved' | 'always';
  requiredSets?: number;
  requiredReps?: number;
  requiredWeight?: number;
}

export interface MaxAttemptResult {
  success: boolean;
  newMax?: number;
  instruction: 'PROCEED_TO_DOWN_SETS' | 'NEW_MAX_ATTEMPT' | 'COMPLETE';
  nextWeight?: number;
}

export interface ConditionalSet {
  setNumber: number;
  weight: number;
  targetReps: number | 'REP_OUT';
  restPeriod: string;
  isConditional: boolean;
  condition?: SetCondition;
  shouldDisplay: boolean;
}

export class FormulaCalculator {
  /**
   * Calculate weight using extracted percentage formulas
   * Formula: MROUND(4RM × percentage, 5)
   * Special case: If 4RM < 125 and percentage ≤ 35%, use 45 lbs (empty barbell)
   */
  static calculateWeightByPercentage(
    fourRepMax: number,
    percentage: number,
    roundTo: number = 5
  ): number {
    // Beginner special case from Excel: IF(4RM < 125, 45, MROUND(4RM * 0.35, 5))
    if (fourRepMax < 125 && percentage <= 0.35) {
      return 45;
    }
    
    const weight = fourRepMax * percentage;
    return this.roundToNearest5(weight, roundTo);
  }

  /**
   * Round to nearest 5 lbs (Excel: MROUND(value, 5))
   */
  static roundToNearest5(weight: number, increment: number = 5): number {
    return Math.round(weight / increment) * increment;
  }

  /**
   * Evaluate max attempt and determine next action
   * Formula: IF(reps < 1, "PROCEED TO DOWN SETS", "NEW 1 REP MAX ATTEMPT")
   * If successful: newMax = currentMax + 5
   */
  static evaluateMaxAttempt(
    currentMax: number,
    repsCompleted: number,
    targetReps: number = 1
  ): MaxAttemptResult {
    if (repsCompleted < targetReps) {
      return {
        success: false,
        instruction: 'PROCEED_TO_DOWN_SETS'
      };
    }
    
    // Success - add 5 lbs
    const newMax = currentMax + 5;
    
    return {
      success: true,
      newMax,
      instruction: 'NEW_MAX_ATTEMPT',
      nextWeight: newMax
    };
  }

  /**
   * Evaluate rep-based progression (for 4-rep max attempts)
   * Formula: IF(reps >= 6, currentMax + 5, "PROCEED TO DOWNSETS")
   */
  static evaluateRepBasedProgression(
    currentMax: number,
    targetReps: number,
    achievedReps: number,
    previousSetsComplete: boolean
  ): MaxAttemptResult {
    if (!previousSetsComplete) {
      return {
        success: false,
        instruction: 'COMPLETE'
      };
    }
    
    // For 4-rep max attempts, 6+ reps indicates ready for progression
    const progressionThreshold = targetReps + 2;
    
    if (achievedReps >= progressionThreshold) {
      return {
        success: true,
        newMax: currentMax + 5,
        instruction: 'NEW_MAX_ATTEMPT',
        nextWeight: currentMax + 5
      };
    }
    
    return {
      success: false,
      instruction: 'PROCEED_TO_DOWN_SETS'
    };
  }

  /**
   * Generate progressive max attempts (conditional sets)
   * Excel: Each set only displays if previous set achieved target reps
   * Set 1: 100% × 1 rep
   * Set 2 (if set 1 success): 100% + 5 × 1 rep
   * Set 3 (if set 2 success): 100% + 10 × 1 rep
   */
  static generateProgressiveMaxAttempts(
    baseMax: number,
    maxAttempts: number = 3,
    completedSets: SetLog[] = []
  ): ConditionalSet[] {
    const sets: ConditionalSet[] = [];
    
    for (let i = 0; i < maxAttempts; i++) {
      const setNumber = i + 4; // Assuming sets 4, 5, 6 are max attempts
      const weight = baseMax + (i * 5);
      const isConditional = i > 0;
      
      let shouldDisplay = true;
      if (isConditional && i > 0) {
        // Check if previous max attempt was successful
        const previousSetNumber = setNumber - 1;
        const previousSet = completedSets.find(s => s.setNumber === previousSetNumber);
        shouldDisplay = previousSet ? previousSet.reps >= 1 : false;
      }
      
      sets.push({
        setNumber,
        weight,
        targetReps: 1,
        restPeriod: '1-5 MIN',
        isConditional,
        condition: isConditional ? {
          type: 'reps_achieved',
          requiredSets: setNumber - 1,
          requiredReps: 1
        } : undefined,
        shouldDisplay
      });
    }
    
    return sets;
  }

  /**
   * Generate down sets (back-off sets for volume)
   * Formula: IF(all_working_sets_complete, MROUND(4RM * 0.80, 5), "")
   * Only shown after completing all working sets
   */
  static generateDownSets(
    fourRepMax: number,
    workingSetsCompleted: boolean,
    numberOfDownSets: number = 3
  ): ConditionalSet[] {
    if (!workingSetsCompleted) {
      return [];
    }
    
    const downSetWeight = this.calculateWeightByPercentage(fourRepMax, 0.80);
    const sets: ConditionalSet[] = [];
    
    for (let i = 0; i < numberOfDownSets; i++) {
      const setNumber = i + 5; // Assuming down sets start at set 5
      const isLastSet = i === numberOfDownSets - 1;
      
      sets.push({
        setNumber,
        weight: downSetWeight,
        targetReps: isLastSet ? 'REP_OUT' : 8,
        restPeriod: isLastSet ? '1 MIN' : '1-2 MIN',
        isConditional: true,
        condition: {
          type: 'previous_sets_complete',
          requiredSets: 4
        },
        shouldDisplay: workingSetsCompleted
      });
    }
    
    return sets;
  }

  /**
   * Check if a set should be displayed based on conditions
   * Excel: IF(OR(ISBLANK(prev1), ISBLANK(prev2), ISBLANK(prev3)), "", set_value)
   */
  static shouldDisplaySet(
    set: ConditionalSet,
    completedSets: SetLog[]
  ): boolean {
    if (!set.isConditional || !set.condition) {
      return true;
    }
    
    switch (set.condition.type) {
      case 'always':
        return true;
        
      case 'previous_sets_complete': {
        const requiredSets = set.condition.requiredSets || (set.setNumber - 1);
        const completedCount = completedSets.filter(s => s.reps > 0).length;
        return completedCount >= requiredSets;
      }
      
      case 'reps_achieved': {
        const previousSetNumber = set.setNumber - 1;
        const previousSet = completedSets.find(s => s.setNumber === previousSetNumber);
        if (!previousSet) return false;
        
        const requiredReps = set.condition.requiredReps || 1;
        return previousSet.reps >= requiredReps;
      }
      
      case 'weight_achieved': {
        const previousSetNumber = set.setNumber - 1;
        const previousSet = completedSets.find(s => s.setNumber === previousSetNumber);
        if (!previousSet) return false;
        
        const requiredWeight = set.condition.requiredWeight || 0;
        return previousSet.weight >= requiredWeight;
      }
      
      default:
        return true;
    }
  }

  /**
   * Calculate rest period based on extracted formula logic
   * 30s: warm-up (≤35%)
   * 1-2 MIN: working sets (65-80%)
   * 1-5 MIN: heavy/max attempts (≥90%)
   */
  static calculateRestPeriodFromIntensity(
    weightUsed: number,
    fourRepMax: number
  ): string {
    const intensity = weightUsed / fourRepMax;
    
    if (intensity <= 0.35) return '30s';
    if (intensity >= 0.90) return '1-5 MIN';
    if (intensity >= 0.65) return '1-2 MIN';
    
    return '1 MIN';
  }

  /**
   * Generate complete exercise with pyramid set structure
   * Set 1: 35% × 6 reps (warmup)
   * Set 2: 80% × 1 rep (primer)
   * Set 3: 90% × 1 rep (build-up)
   * Set 4: 100% × 1 rep (max attempt)
   * Set 5+ (conditional): Progressive max attempts or down sets
   */
  static generatePyramidSets(
    exerciseId: string,
    fourRepMax: number,
    completedSets: SetLog[] = []
  ): ConditionalSet[] {
    const sets: ConditionalSet[] = [];
    
    // Warmup set
    sets.push({
      setNumber: 1,
      weight: this.calculateWeightByPercentage(fourRepMax, INTENSITY_PERCENTAGES.WARMUP_STANDARD),
      targetReps: 6,
      restPeriod: '30s',
      isConditional: false,
      shouldDisplay: true
    });
    
    // Build-up sets
    sets.push({
      setNumber: 2,
      weight: this.calculateWeightByPercentage(fourRepMax, INTENSITY_PERCENTAGES.WORKING_HEAVY_2),
      targetReps: 1,
      restPeriod: '1-2 MIN',
      isConditional: false,
      shouldDisplay: true
    });
    
    sets.push({
      setNumber: 3,
      weight: this.calculateWeightByPercentage(fourRepMax, INTENSITY_PERCENTAGES.NEAR_MAX),
      targetReps: 1,
      restPeriod: '1-2 MIN',
      isConditional: false,
      shouldDisplay: true
    });
    
    // Max attempt
    sets.push({
      setNumber: 4,
      weight: fourRepMax,
      targetReps: 1,
      restPeriod: '1-5 MIN',
      isConditional: false,
      shouldDisplay: true
    });
    
    // Progressive max attempts (conditional)
    const maxAttempts = this.generateProgressiveMaxAttempts(fourRepMax, 2, completedSets);
    sets.push(...maxAttempts);
    
    return sets;
  }

  /**
   * Generate max determination week progression
   * Formula: startWeight, startWeight + 5, startWeight + 10, ...
   * Continue until failure
   */
  static generateMaxDeterminationSets(
    startingWeight: number = 45,
    numberOfSets: number = 10
  ): number[] {
    const weights: number[] = [];
    
    for (let i = 0; i < numberOfSets; i++) {
      weights.push(startingWeight + (i * 5));
    }
    
    return weights;
  }

  /**
   * Calculate new 4RM based on completed max attempts
   * Returns highest successful weight where reps >= 1
   */
  static calculateNewMax(
    currentMax: number,
    completedSets: SetLog[]
  ): number {
    const successfulSets = completedSets
      .filter(set => set.reps >= 1)
      .sort((a, b) => b.weight - a.weight);
    
    if (successfulSets.length > 0) {
      return successfulSets[0].weight;
    }
    
    return currentMax;
  }

  // ====================================================================
  // Original FormulaCalculator methods (maintained for compatibility)
  // ====================================================================

  /**
   * Main entry point: Calculate suggested weight for an exercise
   */
  static calculateSuggestedWeight(
    formula: WeightFormula,
    context: FormulaContext
  ): WeightCalculationResult {
    let baseWeight = this.getBaseWeight(formula, context);
    let appliedPercentage = formula.percentage || 100;
    let adjustment = 0;

    if (formula.percentage) {
      baseWeight = baseWeight * (formula.percentage / 100);
    }

    if (formula.adjustment) {
      adjustment = formula.adjustment;
      baseWeight += adjustment;
    }

    if (context.previousWorkout) {
      const progression = this.analyzeProgression(
        context.previousWorkout,
        context.exerciseType
      );
      
      if (progression.shouldIncrease) {
        adjustment += progression.recommendedChange;
        baseWeight += progression.recommendedChange;
      } else if (progression.shouldDecrease) {
        adjustment += progression.recommendedChange;
        baseWeight += progression.recommendedChange;
      }
    }

    const suggestedWeight = this.roundToAvailableWeight(
      baseWeight,
      formula.roundTo || WEIGHT_INCREMENTS[context.exerciseType]
    );

    return {
      suggestedWeight,
      baseWeight: this.getBaseWeight(formula, context),
      appliedPercentage,
      adjustment,
      reasoning: this.generateReasoning(
        formula,
        context,
        suggestedWeight,
        adjustment
      ),
    };
  }

  private static getBaseWeight(
    formula: WeightFormula,
    context: FormulaContext
  ): number {
    switch (formula.baseType) {
      case 'userMax': {
        const exerciseId = formula.exerciseReference || Object.keys(context.userMaxes)[0];
        const maxLift = context.userMaxes[exerciseId];
        return maxLift?.weight || this.estimateFromBodyWeight(context.bodyWeight);
      }

      case 'previousMax': {
        return context.previousWorkout?.actualWeight || 0;
      }

      case 'bodyWeight': {
        return context.bodyWeight || 0;
      }

      case 'fixed': {
        return formula.adjustment || 0;
      }

      case 'relatedExercise': {
        if (!formula.exerciseReference) {
          throw new Error('relatedExercise requires exerciseReference');
        }
        const relatedMax = context.userMaxes[formula.exerciseReference];
        return relatedMax?.weight || 0;
      }

      default:
        return 0;
    }
  }

  static analyzeProgression(
    previousLog: ExerciseLog,
    equipmentType: EquipmentType
  ): ProgressionAnalysis {
    if (!previousLog.sets || previousLog.sets.length === 0) {
      return {
        shouldIncrease: false,
        shouldDecrease: false,
        shouldMaintain: true,
        recommendedChange: 0,
        reason: 'No previous data',
        averageReps: 0,
        targetReps: { min: 0, max: 0 },
      };
    }

    const workingSets = previousLog.sets.length === 1
      ? previousLog.sets
      : previousLog.sets.filter(set => set.setNumber > 1);
    const avgReps = this.calculateAverageReps(workingSets.map(s => s.reps));
    const firstSet = previousLog.sets[0];
    const targetReps = firstSet.targetReps;

    if (targetReps === 'REP_OUT') {
      if (avgReps >= 20) {
        return {
          shouldIncrease: true,
          shouldDecrease: false,
          shouldMaintain: false,
          recommendedChange: 5, // Always +5 lbs per extracted formulas
          reason: 'Exceeded 20 reps on rep-out sets',
          averageReps: avgReps,
          targetReps,
        };
      } else if (avgReps < 10) {
        return {
          shouldIncrease: false,
          shouldDecrease: true,
          shouldMaintain: false,
          recommendedChange: -5,
          reason: 'Below 10 reps on rep-out sets',
          averageReps: avgReps,
          targetReps,
        };
      }
      return {
        shouldIncrease: false,
        shouldDecrease: false,
        shouldMaintain: true,
        recommendedChange: 0,
        reason: 'In acceptable range for rep-out',
        averageReps: avgReps,
        targetReps,
      };
    }

    const { min, max } = targetReps as { min: number; max: number };

    if (avgReps > max) {
      return {
        shouldIncrease: true,
        shouldDecrease: false,
        shouldMaintain: false,
        recommendedChange: 5, // Always +5 lbs per extracted formulas
        reason: `Exceeded target range (${avgReps} > ${max})`,
        averageReps: avgReps,
        targetReps: targetReps as { min: number; max: number },
      };
    } else if (avgReps < min) {
      return {
        shouldIncrease: false,
        shouldDecrease: true,
        shouldMaintain: false,
        recommendedChange: -5,
        reason: `Below target range (${avgReps} < ${min})`,
        averageReps: avgReps,
        targetReps: targetReps as { min: number; max: number },
      };
    }

    return {
      shouldIncrease: false,
      shouldDecrease: false,
      shouldMaintain: true,
      recommendedChange: 0,
      reason: `Within target range (${min}-${max})`,
      averageReps: avgReps,
      targetReps: targetReps as { min: number; max: number },
    };
  }

  static calculateWorkingWeight(
    userMax: number,
    weekType: WeekType,
    setType: 'warmup' | 'working' | 'downset' | 'max' = 'working'
  ): number {
    let percentage: number;

    if (setType === 'warmup') {
      percentage = INTENSITY_PERCENTAGES.WARMUP_STANDARD;
    } else if (setType === 'downset') {
      percentage = INTENSITY_PERCENTAGES.WORKING_LIGHT;
    } else if (setType === 'max') {
      percentage = WEEK_PERCENTAGES[weekType];
    } else {
      percentage = WEEK_PERCENTAGES[weekType];
    }

    return this.calculateWeightByPercentage(userMax, percentage);
  }

  static roundToAvailableWeight(weight: number, increment: number = 2.5): number {
    return Math.round(weight / increment) * increment;
  }

  private static calculateAverageReps(reps: number[]): number {
    if (reps.length === 0) return 0;
    return reps.reduce((sum, r) => sum + r, 0) / reps.length;
  }

  private static estimateFromBodyWeight(bodyWeight: number | undefined): number {
    if (!bodyWeight) return 45;
    return Math.round(bodyWeight * 0.75 / 5) * 5;
  }

  private static generateReasoning(
    formula: WeightFormula,
    context: FormulaContext,
    suggestedWeight: number,
    adjustment: number
  ): string {
    const parts: string[] = [];

    if (formula.baseType === 'userMax') {
      const exerciseId = formula.exerciseReference || 'current exercise';
      parts.push(`Based on your ${exerciseId} max`);
    } else if (formula.baseType === 'bodyWeight') {
      parts.push('Based on your body weight');
    } else if (formula.baseType === 'relatedExercise') {
      parts.push(`Based on related exercise max`);
    }

    if (formula.percentage && formula.percentage !== 100) {
      parts.push(`at ${formula.percentage}%`);
    }

    if (adjustment > 0) {
      parts.push(`+${adjustment} lbs (you exceeded target last time)`);
    } else if (adjustment < 0) {
      parts.push(`${adjustment} lbs (adjusting for form/recovery)`);
    }

    parts.push(`= ${suggestedWeight} lbs`);

    return parts.join(' ');
  }

  static calculateVolume(exerciseLogs: ExerciseLog[]): number {
    let totalVolume = 0;

    for (const exercise of exerciseLogs) {
      for (const set of exercise.sets) {
        totalVolume += set.weight * set.reps;
      }
    }

    return totalVolume;
  }

  static checkForPR(
    exerciseLog: ExerciseLog,
    currentMax: number
  ): { isNewPR: boolean; newMax?: number; improvement?: number } {
    const bestSet = exerciseLog.sets.reduce((best, current) => {
      if (current.reps >= 1 && current.weight > (best?.weight || 0)) {
        return current;
      }
      if (current.reps >= 10 && current.weight >= currentMax * 0.80) {
        return current;
      }
      return best;
    }, exerciseLog.sets[0]);

    if (bestSet && bestSet.weight > currentMax) {
      return {
        isNewPR: true,
        newMax: bestSet.weight,
        improvement: bestSet.weight - currentMax,
      };
    }

    return { isNewPR: false };
  }
}

export default FormulaCalculator;
