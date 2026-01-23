/**
 * ProtocolWorkoutEngine
 * 
 * Core engine for protocol-based training system.
 * Generates workouts using P1 (Max Testing), P2 (Volume), and P3 (Accessory) protocols.
 * 
 * Key Principles:
 * - Earned progression: 4RM only increases through P1 testing
 * - Rep-outs in P2/P3 signal readiness, don't auto-increase
 * - Adaptive warmups: More sets for heavier loads
 * - Down sets always: P1 failures redirect to volume work
 */

import {
  Protocol,
  ProtocolExerciseTemplate,
  ProtocolDefinition,
  ProtocolSet,
  FourRepMax,
  ExerciseLog,
  SetLog,
  MuscleGroup,
  EquipmentType,
} from '../types';
import {
  PROTOCOL_REGISTRY,
  P1_WARMUP_UPPER_BODY,
  P1_WARMUP_LOWER_BODY,
  P1_DOWN_SETS,
  shouldUseHeavyWarmup,
  calculateP1Increase,
} from './ProtocolDefinitions';
import FourRepMaxService from './FourRepMaxService';

export interface ProtocolWorkoutContext {
  userId: string;
  sessionId: string;
  fourRepMaxes: Record<string, FourRepMax>; // exerciseId -> 4RM
  muscleGroup: MuscleGroup;
  equipmentType: EquipmentType;
  inRehabMode?: boolean;
  rehabLoadReduction?: number; // Percentage
}

export interface GeneratedProtocolExercise {
  exerciseId: string;
  protocol: Protocol;
  sets: GeneratedProtocolSet[];
  fourRepMax: number;
  notes?: string;
}

export interface GeneratedProtocolSet {
  setNumber: number;
  setType: 'warmup' | 'working' | 'downset' | 'max-attempt';
  targetWeight: number;
  instruction: 'rep-out' | 'max-attempt' | 'controlled';
  targetReps?: { min: number; max: number };
  restSeconds: number;
}

export class ProtocolWorkoutEngine {
  /**
   * Generate a full protocol-based exercise with warmups and working sets
   */
  static generateProtocolExercise(
    template: ProtocolExerciseTemplate,
    context: ProtocolWorkoutContext
  ): GeneratedProtocolExercise {
    const protocol = PROTOCOL_REGISTRY[template.protocol];
    const fourRepMax = context.fourRepMaxes[template.exerciseId];
    
    if (!fourRepMax) {
      throw new Error(`No 4RM found for exercise ${template.exerciseId}. P1 testing required.`);
    }

    let sets: GeneratedProtocolSet[] = [];
    let effectiveFourRepMax = fourRepMax.weight;

    // Apply rehab mode load reduction if active
    if (context.inRehabMode && context.rehabLoadReduction) {
      effectiveFourRepMax = fourRepMax.weight * (1 - context.rehabLoadReduction / 100);
      effectiveFourRepMax = this.roundToNearestIncrement(effectiveFourRepMax, 5);
    }

    // Generate warmup sets for P1 only
    if (template.protocol === 'P1') {
      const warmupSets = this.generateP1Warmups(
        effectiveFourRepMax,
        context.muscleGroup,
        context.equipmentType
      );
      sets.push(...warmupSets);
    }

    // Generate working sets based on protocol
    const workingSets = this.generateWorkingSets(
      template.protocol,
      protocol,
      effectiveFourRepMax
    );
    sets.push(...workingSets);

    return {
      exerciseId: template.exerciseId,
      protocol: template.protocol,
      sets,
      fourRepMax: fourRepMax.weight,
      notes: template.notes,
    };
  }

  /**
   * Generate adaptive warmup sets for P1 (Max Attempt Protocol)
   * Light loads = 2 warmup sets
   * Heavy loads = 3 warmup sets
   */
  private static generateP1Warmups(
    fourRepMax: number,
    muscleGroup: MuscleGroup,
    equipmentType: EquipmentType
  ): GeneratedProtocolSet[] {
    const isLowerBody = ['legs'].includes(muscleGroup);
    const useHeavyWarmup = shouldUseHeavyWarmup(fourRepMax, fourRepMax);
    
    const warmupTemplate = isLowerBody 
      ? (useHeavyWarmup ? P1_WARMUP_LOWER_BODY.heavy : P1_WARMUP_LOWER_BODY.light)
      : (useHeavyWarmup ? P1_WARMUP_UPPER_BODY.heavy : P1_WARMUP_UPPER_BODY.light);

    return warmupTemplate.map((warmup, index) => ({
      setNumber: index + 1,
      setType: 'warmup' as const,
      targetWeight: this.roundToNearestIncrement(fourRepMax * warmup.percentage, 5),
      instruction: 'controlled' as const,
      targetReps: { min: warmup.reps, max: warmup.reps },
      restSeconds: warmup.rest,
    }));
  }

  /**
   * Generate working sets based on protocol type
   */
  private static generateWorkingSets(
    protocol: Protocol,
    protocolDef: ProtocolDefinition,
    fourRepMax: number
  ): GeneratedProtocolSet[] {
    const warmupSetCount = protocol === 'P1' ? 2 : 0; // Adjust set numbers

    return protocolDef.sets.map((set, index) => ({
      setNumber: warmupSetCount + index + 1,
      setType: this.determineSetType(set, protocol),
      targetWeight: this.roundToNearestIncrement(fourRepMax * (set.percentageOf4RM / 100), 5),
      instruction: set.instruction,
      targetReps: set.minReps && set.maxReps 
        ? { min: set.minReps, max: set.maxReps }
        : undefined,
      restSeconds: set.restSeconds,
    }));
  }

  /**
   * Generate P1 down sets (performed after max testing)
   */
  static generateP1DownSets(
    fourRepMax: number,
    warmupSetCount: number
  ): GeneratedProtocolSet[] {
    return P1_DOWN_SETS.map((set, index) => ({
      setNumber: warmupSetCount + index + 1,
      setType: 'downset' as const,
      targetWeight: this.roundToNearestIncrement(fourRepMax * (set.percentageOf4RM / 100), 5),
      instruction: set.instruction,
      targetReps: set.minReps && set.maxReps
        ? { min: set.minReps, max: set.maxReps }
        : undefined,
      restSeconds: set.restSeconds,
    }));
  }

  /**
   * Process P1 max attempt results
   * Returns next action: retry with higher weight, or finish with down sets
   */
  static processP1Attempt(
    attemptedWeight: number,
    repsCompleted: number,
    currentFourRepMax: number,
    attemptNumber: number,
    equipmentType: EquipmentType
  ): {
    action: 'retry' | 'down_sets' | 'complete';
    newAttemptWeight?: number;
    newFourRepMax?: number;
    message: string;
  } {
    const successful = repsCompleted >= 4;

    if (successful) {
      // Success! Increase weight and try again
      const increment = calculateP1Increase(attemptedWeight, attemptNumber, equipmentType);
      const newAttemptWeight = attemptedWeight + increment;

      // Safety check: Don't let them go too high
      if (newAttemptWeight > currentFourRepMax * 1.20) {
        // Hit 20% above starting max - that's enough
        return {
          action: 'complete',
          newFourRepMax: attemptedWeight,
          message: `Excellent work! New 4RM established at ${attemptedWeight} lbs. Now complete down sets.`,
        };
      }

      return {
        action: 'retry',
        newAttemptWeight,
        message: `Success! Rest 3 minutes, then attempt ${newAttemptWeight} lbs.`,
      };
    } else {
      // Failed - previous successful weight becomes new 4RM (if any increase achieved)
      const newFourRepMax = attemptNumber > 1 ? attemptedWeight - calculateP1Increase(attemptedWeight, attemptNumber, equipmentType) : currentFourRepMax;
      
      if (newFourRepMax > currentFourRepMax) {
        return {
          action: 'down_sets',
          newFourRepMax,
          message: `New 4RM established at ${newFourRepMax} lbs! Complete down sets to finish strong.`,
        };
      } else {
        return {
          action: 'down_sets',
          message: `No increase this week. Complete down sets for quality volume work.`,
        };
      }
    }
  }

  /**
   * Generate a complete workout day with multiple exercises
   * Exercises ordered by protocol: P1 first, then P2, then P3
   */
  static generateProtocolWorkout(
    exercises: ProtocolExerciseTemplate[],
    context: ProtocolWorkoutContext
  ): GeneratedProtocolExercise[] {
    // Sort exercises by protocol order (P1 → P2 → P3)
    const sortedExercises = [...exercises].sort((a, b) => {
      const protocolOrder = { P1: 1, P2: 2, P3: 3 };
      return (protocolOrder[a.protocol] - protocolOrder[b.protocol]) || (a.protocolOrder - b.protocolOrder);
    });

    return sortedExercises.map(exerciseTemplate => 
      this.generateProtocolExercise(exerciseTemplate, context)
    );
  }

  /**
   * Calculate volume for a protocol-based workout
   */
  static calculateProtocolVolume(exercises: GeneratedProtocolExercise[]): number {
    let totalVolume = 0;

    for (const exercise of exercises) {
      for (const set of exercise.sets) {
        if (set.setType !== 'warmup') {
          // For working sets, estimate volume
          // For rep-out, estimate average reps (10)
          // For max-attempt, use 4 reps
          const estimatedReps = set.instruction === 'max-attempt' ? 4 : 10;
          totalVolume += set.targetWeight * estimatedReps;
        }
      }
    }

    return totalVolume;
  }

  /**
   * Validate that workout is ready for protocol mode
   * Checks that all exercises have 4RMs established
   */
  static validateProtocolWorkout(
    exercises: ProtocolExerciseTemplate[],
    fourRepMaxes: Record<string, FourRepMax>
  ): { valid: boolean; missingMaxes: string[]; errors: string[] } {
    const missingMaxes: string[] = [];
    const errors: string[] = [];

    for (const exercise of exercises) {
      if (!fourRepMaxes[exercise.exerciseId]) {
        missingMaxes.push(exercise.exerciseId);
        errors.push(`Exercise ${exercise.exerciseId} requires P1 testing to establish 4RM`);
      }
    }

    return {
      valid: missingMaxes.length === 0,
      missingMaxes,
      errors,
    };
  }

  /**
   * Suggest protocol assignment for an exercise
   * Helper for trainers/users setting up protocol workouts
   */
  static suggestProtocol(
    exerciseName: string,
    muscleGroup: MuscleGroup,
    isCompound: boolean
  ): Protocol {
    // Main compound lifts → P1 (test strength)
    const mainCompounds = [
      'bench press', 'squat', 'deadlift', 'overhead press',
      'barbell row', 'pull up', 'dip'
    ];
    
    if (mainCompounds.some(name => exerciseName.toLowerCase().includes(name))) {
      return 'P1';
    }

    // Secondary compounds → P2 (volume work)
    if (isCompound) {
      return 'P2';
    }

    // Isolations → P3 (accessory)
    return 'P3';
  }

  /**
   * Get protocol display information for UI
   */
  static getProtocolDisplayInfo(protocol: Protocol): {
    name: string;
    color: string;
    emoji: string;
    description: string;
  } {
    const info = {
      P1: {
        name: 'Max Testing',
        color: '#FF5722',
        emoji: '🎯',
        description: 'Test your 4RM and earn strength increases',
      },
      P2: {
        name: 'Volume Work',
        color: '#2196F3',
        emoji: '💪',
        description: 'Build muscle with rep-out sets',
      },
      P3: {
        name: 'Accessory',
        color: '#9C27B0',
        emoji: '⚡',
        description: 'Fatigue-managed isolation work',
      },
    };

    return info[protocol];
  }

  /**
   * Convert workout from percentage mode to protocol mode
   * Maps existing exercises to appropriate protocols
   */
  static convertToProtocolMode(
    exercises: { exerciseId: string; isCompound: boolean; muscleGroup: MuscleGroup }[],
    exerciseNames: Record<string, string>
  ): ProtocolExerciseTemplate[] {
    return exercises.map((exercise, index) => ({
      exerciseId: exercise.exerciseId,
      protocol: this.suggestProtocol(
        exerciseNames[exercise.exerciseId] || '',
        exercise.muscleGroup,
        exercise.isCompound
      ),
      protocolOrder: index + 1,
    }));
  }

  /**
   * Determine appropriate set type based on protocol and set definition
   */
  private static determineSetType(
    set: ProtocolSet,
    protocol: Protocol
  ): 'warmup' | 'working' | 'downset' | 'max-attempt' {
    if (protocol === 'P1' && set.instruction === 'max-attempt') {
      return 'max-attempt';
    }
    
    if (set.instruction === 'controlled' && set.percentageOf4RM >= 80) {
      return 'downset';
    }

    return 'working';
  }

  /**
   * Round weight to gym-available increments
   */
  private static roundToNearestIncrement(weight: number, increment: number = 5): number {
    return Math.round(weight / increment) * increment;
  }

  /**
   * Generate unique ID for entities
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * P1MaxProtocolHelper
 * 
 * Specialized helper for P1 max testing sessions
 * Handles the iterative max attempt flow
 */
export class P1MaxProtocolHelper {
  /**
   * Initialize P1 testing session
   * Returns first warmup weight
   */
  static initializeP1Session(
    exerciseId: string,
    fourRepMax: FourRepMax,
    muscleGroup: MuscleGroup,
    equipmentType: EquipmentType
  ): {
    warmupSets: GeneratedProtocolSet[];
    maxAttemptWeight: number;
    instructions: string;
  } {
    const isLowerBody = ['legs'].includes(muscleGroup);
    const warmupTemplate = isLowerBody 
      ? P1_WARMUP_LOWER_BODY.light 
      : P1_WARMUP_UPPER_BODY.light;

    const warmupSets = warmupTemplate.map((warmup, index) => ({
      setNumber: index + 1,
      setType: 'warmup' as const,
      targetWeight: Math.round(fourRepMax.weight * warmup.percentage / 5) * 5,
      instruction: 'controlled' as const,
      targetReps: { min: warmup.reps, max: warmup.reps },
      restSeconds: warmup.rest,
    }));

    return {
      warmupSets,
      maxAttemptWeight: fourRepMax.weight,
      instructions: `Complete warmups, then attempt ${fourRepMax.weight} lbs for 4 reps.`,
    };
  }

  /**
   * Process max attempt and determine next action
   */
  static processAttempt(
    attemptedWeight: number,
    repsCompleted: number,
    attemptNumber: number,
    fourRepMax: number,
    equipmentType: EquipmentType
  ): {
    result: 'success' | 'failure';
    action: 'retry' | 'down_sets';
    nextWeight?: number;
    newMax?: number;
    message: string;
  } {
    const successful = repsCompleted >= 4;

    if (successful) {
      const increment = calculateP1Increase(attemptedWeight, attemptNumber, equipmentType);
      const nextWeight = attemptedWeight + increment;

      // Check if we should continue or stop
      if (nextWeight > fourRepMax * 1.20 || attemptNumber >= 5) {
        // Stopping point - establish new max
        return {
          result: 'success',
          action: 'down_sets',
          newMax: attemptedWeight,
          message: `Outstanding! New 4RM: ${attemptedWeight} lbs (+${attemptedWeight - fourRepMax} lbs gain). Finish with down sets.`,
        };
      }

      return {
        result: 'success',
        action: 'retry',
        nextWeight,
        message: `Great job! Rest 3 minutes, then attempt ${nextWeight} lbs for 4 reps.`,
      };
    } else {
      // Failed - previous successful becomes new max
      const previousWeight = attemptNumber > 1 
        ? attemptedWeight - calculateP1Increase(attemptedWeight, attemptNumber, equipmentType)
        : fourRepMax;

      if (previousWeight > fourRepMax) {
        return {
          result: 'failure',
          action: 'down_sets',
          newMax: previousWeight,
          message: `New 4RM: ${previousWeight} lbs (+${previousWeight - fourRepMax} lbs). Excellent progress! Complete down sets.`,
        };
      } else {
        return {
          result: 'failure',
          action: 'down_sets',
          message: `Max maintained at ${fourRepMax} lbs. Complete down sets for quality volume.`,
        };
      }
    }
  }

  /**
   * Generate down sets after P1 testing
   */
  static generateDownSets(
    newFourRepMax: number,
    warmupSetCount: number
  ): GeneratedProtocolSet[] {
    return P1_DOWN_SETS.map((set, index) => ({
      setNumber: warmupSetCount + index + 1,
      setType: 'downset' as const,
      targetWeight: Math.round(newFourRepMax * (set.percentageOf4RM / 100) / 5) * 5,
      instruction: set.instruction,
      targetReps: set.minReps && set.maxReps
        ? { min: set.minReps, max: set.maxReps }
        : undefined,
      restSeconds: set.restSeconds,
    }));
  }
}

/**
 * P2P3ProtocolHelper
 * 
 * Helper for P2 (Volume) and P3 (Accessory) protocols
 * Both use rep-out sets and similar logic
 */
export class P2P3ProtocolHelper {
  /**
   * Analyze rep-out performance
   * Returns feedback on whether weight is appropriate
   */
  static analyzeRepOutPerformance(
    repsCompleted: number
  ): {
    band: 'too_heavy' | 'overloaded' | 'ideal' | 'reserve' | 'light';
    feedback: string;
    actionNeeded: boolean;
  } {
    if (repsCompleted >= 1 && repsCompleted <= 4) {
      return {
        band: 'too_heavy',
        feedback: 'Weight is too heavy. Reduce by 5-10% for next session.',
        actionNeeded: true,
      };
    }

    if (repsCompleted >= 5 && repsCompleted <= 6) {
      return {
        band: 'overloaded',
        feedback: 'You may be fatigued. Monitor recovery before next session.',
        actionNeeded: false,
      };
    }

    if (repsCompleted >= 7 && repsCompleted <= 9) {
      return {
        band: 'ideal',
        feedback: 'Perfect! This weight is in the ideal range for muscle growth.',
        actionNeeded: false,
      };
    }

    if (repsCompleted >= 10 && repsCompleted <= 12) {
      return {
        band: 'reserve',
        feedback: 'Good work! You have strength reserve - may be ready for P1 testing soon.',
        actionNeeded: false,
      };
    }

    // 13-15 reps
    return {
      band: 'light',
      feedback: 'Weight is light but acceptable. Consider P1 testing to establish new max.',
      actionNeeded: false,
    };
  }

  /**
   * Generate P2 volume workout (3 sets, rep-out)
   */
  static generateP2Workout(fourRepMax: number): GeneratedProtocolSet[] {
    const p2Protocol = PROTOCOL_REGISTRY.P2;
    
    return p2Protocol.sets.map((set, index) => ({
      setNumber: index + 1,
      setType: 'working' as const,
      targetWeight: Math.round(fourRepMax * (set.percentageOf4RM / 100) / 5) * 5,
      instruction: set.instruction,
      targetReps: undefined, // Rep out - no fixed target
      restSeconds: set.restSeconds,
    }));
  }

  /**
   * Generate P3 accessory workout (2 sets, rep-out)
   */
  static generateP3Workout(fourRepMax: number): GeneratedProtocolSet[] {
    const p3Protocol = PROTOCOL_REGISTRY.P3;
    
    return p3Protocol.sets.map((set, index) => ({
      setNumber: index + 1,
      setType: 'working' as const,
      targetWeight: Math.round(fourRepMax * (set.percentageOf4RM / 100) / 5) * 5,
      instruction: set.instruction,
      targetReps: undefined, // Rep out - no fixed target
      restSeconds: set.restSeconds,
    }));
  }
}

export default ProtocolWorkoutEngine;
