/**
 * FormulaCalculator Service
 * 
 * Core service that implements the weight calculation formulas from the Excel spreadsheet.
 * This is the heart of the adaptive workout programming - it calculates suggested weights
 * based on user maxes, week type, and previous performance.
 * 
 * Formula Logic Extracted from Excel:
 * - Week Type determines base percentage (Max=100%, Intensity=85%, Percentage=75%, Mixed=90%)
 * - Previous performance adjusts weight (exceeded reps = increase, failed = decrease)
 * - Equipment type determines increment size (dumbbells=2.5lbs, machines=5lbs)
 * - All weights rounded to gym-available increments
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
  WEEK_PERCENTAGES,
  WEIGHT_INCREMENTS,
} from '../types';

export class FormulaCalculator {
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

    // Apply percentage if specified
    if (formula.percentage) {
      baseWeight = baseWeight * (formula.percentage / 100);
    }

    // Apply fixed adjustment if specified
    if (formula.adjustment) {
      adjustment = formula.adjustment;
      baseWeight += adjustment;
    }

    // Check previous performance and adjust accordingly
    if (context.previousWorkout) {
      const progression = this.analyzeProgression(
        context.previousWorkout,
        context.exerciseType
      );
      
      if (progression.shouldIncrease) {
        adjustment += progression.recommendedChange;
        baseWeight += progression.recommendedChange;
      } else if (progression.shouldDecrease) {
        adjustment += progression.recommendedChange; // Will be negative
        baseWeight += progression.recommendedChange;
      }
    }

    // Round to gym-available weights
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

  /**
   * Get the base weight before any adjustments
   */
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

  /**
   * Analyze previous workout performance to determine weight adjustment
   * This implements the progressive overload logic from the Excel formulas
   */
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

    const workingSets = previousLog.sets.filter(set => set.setNumber > 1);
    const avgReps = this.calculateAverageReps(workingSets.map(s => s.reps));
    const firstSet = previousLog.sets[0];
    const targetReps = firstSet.targetReps;

    if (targetReps === 'REP_OUT') {
      // For rep-out sets, increase if user did 20+ reps
      if (avgReps >= 20) {
        return {
          shouldIncrease: true,
          shouldDecrease: false,
          shouldMaintain: false,
          recommendedChange: WEIGHT_INCREMENTS[equipmentType],
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

    // For normal rep ranges
    const { min, max } = targetReps as { min: number; max: number };

    if (avgReps > max) {
      // User exceeded target - increase weight
      return {
        shouldIncrease: true,
        shouldDecrease: false,
        shouldMaintain: false,
        recommendedChange: WEIGHT_INCREMENTS[equipmentType],
        reason: `Exceeded target range (${avgReps} > ${max})`,
        averageReps: avgReps,
        targetReps: targetReps as { min: number; max: number },
      };
    } else if (avgReps < min) {
      // User failed target - decrease weight
      return {
        shouldIncrease: false,
        shouldDecrease: true,
        shouldMaintain: false,
        recommendedChange: -5, // Standard decrease
        reason: `Below target range (${avgReps} < ${min})`,
        averageReps: avgReps,
        targetReps: targetReps as { min: number; max: number },
      };
    }

    // Hit target exactly - maintain weight
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

  /**
   * Calculate working weight for a specific week type
   * Implements: Week 1 = 85%, Week 3 = 75%, etc.
   */
  static calculateWorkingWeight(
    userMax: number,
    weekType: WeekType,
    setType: 'warmup' | 'working' | 'downset' | 'max' = 'working'
  ): number {
    let percentage: number;

    if (setType === 'warmup') {
      // Warmup sets at 40% of max
      percentage = 0.40;
    } else if (setType === 'downset') {
      // Down sets at 60-70% of max
      percentage = 0.65;
    } else if (setType === 'max') {
      // Max attempts progress from 85% to 95%+
      percentage = WEEK_PERCENTAGES[weekType];
    } else {
      // Working sets use week percentage
      percentage = WEEK_PERCENTAGES[weekType];
    }

    return userMax * percentage;
  }

  /**
   * Calculate weight for accessory exercises based on primary lift max
   * Examples from Excel:
   * - Chest Fly = DB Incline Max * 0.25
   * - Lateral Raise = Shoulder Press Max * 0.30
   */
  static calculateAccessoryWeight(
    primaryExerciseMax: number,
    accessoryRatio: number
  ): number {
    return primaryExerciseMax * accessoryRatio;
  }

  /**
   * Round weight to gym-available increments
   * Standard increments: 2.5, 5, 10 lbs
   */
  static roundToAvailableWeight(weight: number, increment: number = 2.5): number {
    return Math.round(weight / increment) * increment;
  }

  /**
   * Calculate average reps from a set of completed sets
   */
  private static calculateAverageReps(reps: number[]): number {
    if (reps.length === 0) return 0;
    return reps.reduce((sum, r) => sum + r, 0) / reps.length;
  }

  /**
   * Estimate initial max from body weight for first-time users
   * Conservative estimates to ensure safety
   */
  private static estimateFromBodyWeight(bodyWeight: number | undefined): number {
    if (!bodyWeight) return 45; // Safe default (empty barbell)
    
    // Very conservative estimates for safety
    // These will be quickly replaced by actual maxes
    return Math.round(bodyWeight * 0.75 / 5) * 5; // Round to 5 lbs
  }

  /**
   * Generate explanation for why this weight was suggested
   */
  private static generateReasoning(
    formula: WeightFormula,
    context: FormulaContext,
    suggestedWeight: number,
    adjustment: number
  ): string {
    const parts: string[] = [];

    // Base weight source
    if (formula.baseType === 'userMax') {
      const exerciseId = formula.exerciseReference || 'current exercise';
      parts.push(`Based on your ${exerciseId} max`);
    } else if (formula.baseType === 'bodyWeight') {
      parts.push('Based on your body weight');
    } else if (formula.baseType === 'relatedExercise') {
      parts.push(`Based on related exercise max`);
    }

    // Percentage applied
    if (formula.percentage && formula.percentage !== 100) {
      parts.push(`at ${formula.percentage}%`);
    }

    // Adjustment from performance
    if (adjustment > 0) {
      parts.push(`+${adjustment} lbs (you exceeded target last time)`);
    } else if (adjustment < 0) {
      parts.push(`${adjustment} lbs (adjusting for form/recovery)`);
    }

    // Final weight
    parts.push(`= ${suggestedWeight} lbs`);

    return parts.join(' ');
  }

  /**
   * Validate if a weight is reasonable based on max
   * Returns warning if weight seems too far from expected
   */
  static validateWeight(
    weight: number,
    userMax: number,
    weekType: WeekType
  ): { isValid: boolean; warning?: string } {
    const expectedMin = userMax * 0.40; // Warmup minimum
    const expectedMax = userMax * 1.10; // Slight over max allowed

    if (weight < expectedMin) {
      return {
        isValid: false,
        warning: `Weight seems very light. Your max is ${userMax} lbs.`,
      };
    }

    if (weight > expectedMax) {
      return {
        isValid: false,
        warning: `Weight exceeds your max (${userMax} lbs). Please verify.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Calculate total workout volume (weight × reps summed)
   */
  static calculateVolume(exerciseLogs: ExerciseLog[]): number {
    let totalVolume = 0;

    for (const exercise of exerciseLogs) {
      for (const set of exercise.sets) {
        totalVolume += set.weight * set.reps;
      }
    }

    return totalVolume;
  }

  /**
   * Determine if a new PR was achieved
   */
  static checkForPR(
    exerciseLog: ExerciseLog,
    currentMax: number
  ): { isNewPR: boolean; newMax?: number; improvement?: number } {
    const bestSet = exerciseLog.sets.reduce((best, current) => {
      // For max determination, 1 rep is the standard
      if (current.reps >= 1 && current.weight > (best?.weight || 0)) {
        return current;
      }
      // For volume, check for high rep PRs
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

  /**
   * Calculate down set weight (60-70% of max for volume work)
   */
  static calculateDownSetWeight(userMax: number): number {
    const percentage = 0.65; // 65% for down sets
    return this.roundToAvailableWeight(userMax * percentage, 5);
  }

  /**
   * Progressive loading for max determination week
   * Returns array of suggested weights building to max
   */
  static generateMaxTestingProgression(
    estimatedMax: number,
    numberOfSets: number = 11
  ): number[] {
    const progression: number[] = [];
    const startWeight = estimatedMax * 0.35; // Start at 35%
    const increment = (estimatedMax - startWeight) / (numberOfSets - 1);

    for (let i = 0; i < numberOfSets; i++) {
      const weight = startWeight + (increment * i);
      progression.push(this.roundToAvailableWeight(weight, 5));
    }

    return progression;
  }

  /**
   * Calculate target reps for a specific week and set type
   */
  static getTargetReps(weekType: WeekType, setType: 'warmup' | 'working' | 'downset' | 'max'): RepTarget {
    if (setType === 'warmup') {
      return { min: 6, max: 6 };
    }

    if (setType === 'downset') {
      return 'REP_OUT';
    }

    if (setType === 'max' || weekType === 'max') {
      return { min: 1, max: 4 }; // Max determination: 1-4 reps
    }

    // Regular working sets based on week type
    switch (weekType) {
      case 'intensity':
        return { min: 1, max: 6 }; // Low reps, high weight
      case 'percentage':
        return { min: 10, max: 15 }; // Higher reps, moderate weight
      case 'mixed':
        return { min: 6, max: 12 }; // Mixed protocol
      default:
        return { min: 10, max: 12 };
    }
  }

  /**
   * Convert weight between units (lbs <-> kg)
   */
  static convertWeight(weight: number, fromUnit: 'lbs' | 'kg', toUnit: 'lbs' | 'kg'): number {
    if (fromUnit === toUnit) return weight;
    
    if (fromUnit === 'lbs' && toUnit === 'kg') {
      return weight * 0.453592;
    } else {
      return weight * 2.20462;
    }
  }

  /**
   * Calculate recommended rest period based on set type and intensity
   */
  static calculateRestPeriod(
    setType: 'warmup' | 'working' | 'downset' | 'max',
    weightUsed: number,
    userMax: number
  ): number {
    const intensity = weightUsed / userMax;

    if (setType === 'warmup') return 30;
    if (setType === 'max') return 120;
    if (setType === 'downset') return 60;

    // Working sets: scale rest based on intensity
    if (intensity >= 0.90) return 120; // 2 minutes for 90%+ max
    if (intensity >= 0.80) return 90;  // 1.5 minutes for 80%+
    return 60; // 1 minute for lighter weights
  }

  /**
   * Determine if user should attempt a new max this week
   */
  static shouldAttemptNewMax(weekType: WeekType, previousBestReps: number): boolean {
    if (weekType === 'max') return true;
    if (weekType === 'mixed') return true;
    
    // If user consistently exceeds targets, suggest max attempt
    if (weekType === 'intensity' && previousBestReps >= 3) {
      return true;
    }

    return false;
  }

  /**
   * Calculate percentage of max being used
   */
  static calculatePercentageOfMax(weight: number, userMax: number): number {
    if (userMax === 0) return 0;
    return Math.round((weight / userMax) * 100);
  }

  /**
   * Generate week-appropriate weight for progressive overload
   * This is the core formula from Excel
   */
  static calculateWeekWeight(
    userMax: number,
    weekType: WeekType,
    setNumber: number,
    totalSets: number
  ): number {
    // Set 1 is always warmup (40%)
    if (setNumber === 1) {
      return this.roundToAvailableWeight(userMax * 0.40, 5);
    }

    // Last sets are often down sets (65%)
    if (setNumber > totalSets - 2 && weekType !== 'max') {
      return this.roundToAvailableWeight(userMax * 0.65, 5);
    }

    // Working sets use week percentage
    const basePercentage = WEEK_PERCENTAGES[weekType];
    
    // For max weeks, progressively increase each set
    if (weekType === 'max') {
      const progressionStep = (1.0 - 0.85) / (totalSets - 2);
      const setPercentage = 0.85 + (progressionStep * (setNumber - 2));
      return this.roundToAvailableWeight(userMax * setPercentage, 5);
    }

    return this.roundToAvailableWeight(userMax * basePercentage, 5);
  }
}

// Helper functions for calculations
export const formulaHelpers = {
  /**
   * Check if reps are within target range
   */
  isWithinTarget(reps: number, target: RepTarget): boolean {
    if (target === 'REP_OUT') return reps >= 10; // At least 10 for rep-out
    return reps >= target.min && reps <= target.max;
  },

  /**
   * Format weight for display
   */
  formatWeight(weight: number, unit: 'lbs' | 'kg' = 'lbs'): string {
    return `${weight} ${unit}`;
  },

  /**
   * Format rep range for display
   */
  formatRepRange(target: RepTarget): string {
    if (target === 'REP_OUT') return 'Rep Out';
    return `${target.min}-${target.max}`;
  },

  /**
   * Parse rep range from string (for data import)
   */
  parseRepRange(rangeStr: string): RepTarget {
    if (rangeStr.toUpperCase().includes('REP OUT') || rangeStr.toUpperCase().includes('REPOUT')) {
      return 'REP_OUT';
    }

    const match = rangeStr.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      return {
        min: parseInt(match[1], 10),
        max: parseInt(match[2], 10),
      };
    }

    // Single number - use as both min and max
    const num = parseInt(rangeStr, 10);
    if (!isNaN(num)) {
      return { min: num, max: num };
    }

    // Default fallback
    return { min: 10, max: 12 };
  },
};

export default FormulaCalculator;
