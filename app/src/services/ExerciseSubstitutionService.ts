// @ts-nocheck
/**
 * Exercise Substitution Service
 * 
 * Manages exercise substitutions and conversions between exercise variants.
 * Handles weight adjustments based on equipment type and equivalence ratios.
 * 
 * Features:
 * - Find suitable exercise substitutes
 * - Calculate adjusted weights based on equivalence ratios
 * - Track substitution history
 * - Support permanent substitutions
 */

import { Exercise, ExerciseVariant, ExerciseSubstitution, MaxLift } from '../types';
import { exercises, exerciseVariants, getExerciseById, getExerciseVariants } from '../constants/exercises';

export interface SubstituteOption {
  exercise: Exercise | ExerciseVariant;
  isVariant: boolean;
  variantId?: string;
  primaryExerciseId?: string;
  equivalenceRatio: number;
  adjustedWeight: number;
  adjustedMax: number;
  reason: string;
}

export interface SubstitutionResult {
  originalExercise: Exercise;
  substitute: Exercise | ExerciseVariant;
  originalWeight: number;
  adjustedWeight: number;
  originalMax: number;
  adjustedMax: number;
  equivalenceRatio: number;
  incrementSize: number;
}

export class ExerciseSubstitutionService {
  /**
   * Get all available substitutes for an exercise
   */
  static getAvailableSubstitutes(
    exerciseId: string,
    currentMax: number
  ): SubstituteOption[] {
    const exercise = getExerciseById(exerciseId);
    if (!exercise) return [];

    const substitutes: SubstituteOption[] = [];
    const primaryMuscle = exercise.primaryMuscle;

    // 1. Get defined variants for this exercise
    const variants = getExerciseVariants(exerciseId);
    variants.forEach(variant => {
      const adjustedMax = Math.round((currentMax * variant.equivalenceRatio) / 5) * 5;
      substitutes.push({
        exercise: variant,
        isVariant: true,
        variantId: variant.id,
        primaryExerciseId: variant.primaryExerciseId,
        equivalenceRatio: variant.equivalenceRatio,
        adjustedWeight: adjustedMax,
        adjustedMax,
        reason: `Pre-defined alternative with ${Math.round(variant.equivalenceRatio * 100)}% equivalence`,
      });
    });

    // 2. Find similar exercises (same primary muscle, different equipment)
    const similarExercises = exercises.filter(ex => 
      ex.id !== exerciseId &&
      ex.primaryMuscle === primaryMuscle &&
      ex.equipmentType !== exercise.equipmentType
    );

    similarExercises.forEach(similarEx => {
      // Estimate equivalence ratio based on equipment type
      const ratio = this.estimateEquivalenceRatio(
        exercise.equipmentType,
        similarEx.equipmentType
      );
      
      const adjustedMax = Math.round((currentMax * ratio) / 5) * 5;
      
      substitutes.push({
        exercise: similarEx,
        isVariant: false,
        equivalenceRatio: ratio,
        adjustedWeight: adjustedMax,
        adjustedMax,
        reason: `Similar ${primaryMuscle} exercise with ${Math.round(ratio * 100)}% estimated equivalence`,
      });
    });

    // Sort by equivalence ratio (closest to 1.0 first)
    return substitutes.sort((a, b) => {
      const diffA = Math.abs(1.0 - a.equivalenceRatio);
      const diffB = Math.abs(1.0 - b.equivalenceRatio);
      return diffA - diffB;
    });
  }

  /**
   * Estimate equivalence ratio between equipment types
   * These are conservative estimates for safety
   */
  private static estimateEquivalenceRatio(
    fromEquipment: string,
    toEquipment: string
  ): number {
    // Barbell -> other equipment
    if (fromEquipment === 'barbell') {
      if (toEquipment === 'machine') return 0.85;
      if (toEquipment === 'dumbbell') return 0.60; // Total of both dumbbells
      if (toEquipment === 'cable') return 0.75;
    }

    // Machine -> other equipment
    if (fromEquipment === 'machine') {
      if (toEquipment === 'barbell') return 1.15;
      if (toEquipment === 'dumbbell') return 0.70;
      if (toEquipment === 'cable') return 0.90;
    }

    // Dumbbell -> other equipment
    if (fromEquipment === 'dumbbell') {
      if (toEquipment === 'barbell') return 1.65; // Both dumbbells combined
      if (toEquipment === 'machine') return 1.40;
      if (toEquipment === 'cable') return 1.25;
    }

    // Cable -> other equipment
    if (fromEquipment === 'cable') {
      if (toEquipment === 'barbell') return 1.30;
      if (toEquipment === 'machine') return 1.10;
      if (toEquipment === 'dumbbell') return 0.80;
    }

    // Default: assume similar
    return 1.0;
  }

  /**
   * Calculate adjusted weight for a substitute exercise
   */
  static calculateAdjustedWeight(
    originalWeight: number,
    originalExerciseId: string,
    substituteExerciseId: string,
    variantId?: string
  ): SubstitutionResult | null {
    const originalExercise = getExerciseById(originalExerciseId);
    if (!originalExercise) return null;

    let substitute: Exercise | ExerciseVariant | undefined;
    let equivalenceRatio: number;

    // Check if it's a defined variant
    if (variantId) {
      substitute = exerciseVariants.find(v => v.id === variantId);
      if (substitute && 'equivalenceRatio' in substitute) {
        equivalenceRatio = substitute.equivalenceRatio;
      } else {
        return null;
      }
    } else {
      // It's a similar exercise
      substitute = getExerciseById(substituteExerciseId);
      if (!substitute) return null;

      equivalenceRatio = this.estimateEquivalenceRatio(
        originalExercise.equipmentType,
        substitute.equipmentType
      );
    }

    const adjustedWeight = originalWeight * equivalenceRatio;
    const incrementSize = substitute.incrementSize || 5;
    const roundedWeight = Math.round(adjustedWeight / incrementSize) * incrementSize;

    // Calculate adjusted max (assuming the original weight was at some percentage of max)
    const originalMax = originalWeight; // This would ideally come from user maxes
    const adjustedMax = Math.round((originalMax * equivalenceRatio) / incrementSize) * incrementSize;

    return {
      originalExercise,
      substitute,
      originalWeight,
      adjustedWeight: roundedWeight,
      originalMax,
      adjustedMax,
      equivalenceRatio,
      incrementSize,
    };
  }

  /**
   * Create a substitution record
   */
  static createSubstitution(
    userId: string,
    originalExerciseId: string,
    substituteExerciseId: string,
    variantId: string | undefined,
    weekNumber: number,
    dayNumber: number,
    reason: string,
    permanent: boolean
  ): ExerciseSubstitution {
    return {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      originalExerciseId,
      substituteExerciseId,
      variantId,
      weekNumber,
      dayNumber,
      reason,
      substitutedAt: Date.now(),
      permanent,
    };
  }

  /**
   * Get the effective exercise ID considering permanent substitutions
   */
  static getEffectiveExerciseId(
    exerciseId: string,
    permanentSubstitutions: Record<string, string>
  ): string {
    return permanentSubstitutions[exerciseId] || exerciseId;
  }

  /**
   * Check if an exercise has a permanent substitution
   */
  static hasPermanentSubstitution(
    exerciseId: string,
    permanentSubstitutions: Record<string, string>
  ): boolean {
    return exerciseId in permanentSubstitutions;
  }

  /**
   * Get substitution history for an exercise
   */
  static getSubstitutionHistory(
    exerciseId: string,
    substitutions: ExerciseSubstitution[]
  ): ExerciseSubstitution[] {
    return substitutions
      .filter(sub => sub.originalExerciseId === exerciseId)
      .sort((a, b) => b.substitutedAt - a.substitutedAt);
  }

  /**
   * Get most commonly used substitute for an exercise
   */
  static getMostCommonSubstitute(
    exerciseId: string,
    substitutions: ExerciseSubstitution[]
  ): string | null {
    const history = this.getSubstitutionHistory(exerciseId, substitutions);
    if (history.length === 0) return null;

    const counts: Record<string, number> = {};
    history.forEach(sub => {
      const key = sub.variantId || sub.substituteExerciseId;
      counts[key] = (counts[key] || 0) + 1;
    });

    let maxCount = 0;
    let mostCommon: string | null = null;

    Object.entries(counts).forEach(([key, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = key;
      }
    });

    return mostCommon;
  }

  /**
   * Convert a user's max between exercises
   */
  static convertMaxBetweenExercises(
    max: MaxLift,
    targetExerciseId: string,
    variantId?: string
  ): number | null {
    const result = this.calculateAdjustedWeight(
      max.weight,
      max.exerciseId,
      targetExerciseId,
      variantId
    );

    return result ? result.adjustedMax : null;
  }

  /**
   * Get equipment-specific increment size
   */
  static getIncrementSize(exerciseId: string, variantId?: string): number {
    if (variantId) {
      const variant = exerciseVariants.find(v => v.id === variantId);
      if (variant?.incrementSize) return variant.incrementSize;
    }

    const exercise = getExerciseById(exerciseId);
    return exercise?.incrementSize || 5;
  }

  /**
   * Suggest substitute when equipment is unavailable
   */
  static suggestEmergencySubstitute(
    exerciseId: string,
    unavailableEquipment: string[],
    currentMax: number
  ): SubstituteOption | null {
    const exercise = getExerciseById(exerciseId);
    if (!exercise) return null;

    const substitutes = this.getAvailableSubstitutes(exerciseId, currentMax);
    
    // Filter out unavailable equipment
    const availableSubstitutes = substitutes.filter(sub => {
      const equipment = 'equipmentType' in sub.exercise 
        ? sub.exercise.equipmentType 
        : sub.exercise.equipmentType;
      return !unavailableEquipment.includes(equipment);
    });

    return availableSubstitutes[0] || null;
  }

  /**
   * Generate a reason string for the substitution
   */
  static generateSubstitutionReason(
    originalExercise: Exercise,
    substitute: Exercise | ExerciseVariant,
    reason?: string
  ): string {
    if (reason) return reason;

    const equipmentChange = `${originalExercise.equipmentType} → ${'equipmentType' in substitute ? substitute.equipmentType : substitute.equipmentType}`;
    return `Equipment substitution: ${equipmentChange}`;
  }

  /**
   * Validate that a substitution makes sense
   */
  static validateSubstitution(
    originalExerciseId: string,
    substituteExerciseId: string
  ): { valid: boolean; warnings: string[] } {
    const original = getExerciseById(originalExerciseId);
    const substitute = getExerciseById(substituteExerciseId);

    const warnings: string[] = [];

    if (!original || !substitute) {
      return { valid: false, warnings: ['Exercise not found'] };
    }

    // Check if primary muscles match
    if (original.primaryMuscle !== substitute.primaryMuscle) {
      warnings.push(
        `Different primary muscles: ${original.primaryMuscle} vs ${substitute.primaryMuscle}`
      );
    }

    // Check if any muscle groups overlap
    const commonMuscles = original.muscleGroups.filter(m => 
      substitute.muscleGroups.includes(m)
    );
    
    if (commonMuscles.length === 0) {
      warnings.push('No overlapping muscle groups - may not be a good substitute');
    }

    return {
      valid: warnings.length === 0 || commonMuscles.length > 0,
      warnings,
    };
  }
}

export default ExerciseSubstitutionService;
