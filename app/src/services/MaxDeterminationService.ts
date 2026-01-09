/**
 * Max Determination Service
 * 
 * Handles the logic for the Max Determination Week where users establish their 4RM
 * (one-rep max) for each primary exercise before starting the 48-week training program.
 */

import { MaxLift } from '../types';

export interface MaxAttempt {
  weight: number;
  reps: number;
  timestamp: number;
  success: boolean;
}

export interface MaxTestingProgress {
  exerciseId: string;
  exerciseName: string;
  attempts: MaxAttempt[];
  determined4RM?: number;
  completed: boolean;
}

export interface StrengthScore {
  total: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  percentile: number;
  breakdown: {
    exerciseId: string;
    score: number;
  }[];
}

export class MaxDeterminationService {
  /**
   * Primary exercises that require max determination
   */
  static readonly PRIMARY_EXERCISES = [
    { id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', isPrimary: true },
    { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', isPrimary: true },
    { id: 'leg-press', name: 'Leg Press', muscleGroup: 'legs', isPrimary: true },
    { id: 'shoulder-press', name: 'Shoulder Press', muscleGroup: 'shoulders', isPrimary: true },
    { id: 'bicep-cable-curl', name: 'Bicep Cable Curl', muscleGroup: 'biceps', isPrimary: true },
  ];

  /**
   * Optional/secondary exercises for comprehensive testing
   */
  static readonly OPTIONAL_EXERCISES = [
    { id: 'dumbbell-incline-press', name: 'Dumbbell Incline Press', muscleGroup: 'chest', isPrimary: false },
    { id: 'machine-low-row', name: 'Machine Low Row', muscleGroup: 'back', isPrimary: false },
    { id: 'leg-extension', name: 'Leg Extension', muscleGroup: 'legs', isPrimary: false },
    { id: 'leg-curl', name: 'Leg Curl', muscleGroup: 'legs', isPrimary: false },
    { id: 'triceps-pushdown', name: 'Triceps Pushdown', muscleGroup: 'triceps', isPrimary: false },
  ];

  /**
   * All exercises available for testing
   */
  static readonly ALL_EXERCISES = [
    ...MaxDeterminationService.PRIMARY_EXERCISES,
    ...MaxDeterminationService.OPTIONAL_EXERCISES,
  ];

  /**
   * Generate a progressive weight sequence starting from a given weight
   * Each increment is intelligent based on the starting weight
   */
  static generateWeightSequence(startWeight: number = 45, count: number = 20): number[] {
    const sequence: number[] = [startWeight];
    let currentWeight = startWeight;

    for (let i = 1; i < count; i++) {
      // Progressive increment: smaller increments as weight gets heavier
      let increment: number;
      if (currentWeight < 100) {
        increment = 10;
      } else if (currentWeight < 200) {
        increment = 15;
      } else if (currentWeight < 300) {
        increment = 20;
      } else {
        increment = 25;
      }

      currentWeight += increment;
      sequence.push(currentWeight);
    }

    return sequence;
  }

  /**
   * Calculate 4RM from a successful lift using Brzycki formula
   * Formula: 4RM = weight × (36 / (37 - reps))
   */
  static calculate4RM(weight: number, reps: number): number {
    if (reps === 1) {
      return weight;
    }

    // Brzycki formula is most accurate for 1-10 reps
    if (reps > 10) {
      reps = 10;
    }

    const calculated4RM = weight * (36 / (37 - reps));
    
    // Round to nearest 5 lbs for practical gym use
    return Math.round(calculated4RM / 5) * 5;
  }

  /**
   * Determine next suggested weight based on last attempt
   */
  static suggestNextWeight(lastAttempt: MaxAttempt): number {
    const { weight, reps, success } = lastAttempt;

    if (!success) {
      // If failed, return same weight (this shouldn't happen in normal flow)
      return weight;
    }

    // Intelligent progression based on reps achieved
    let increment: number;
    if (reps >= 5) {
      // Very easy, big jump
      increment = 25;
    } else if (reps >= 3) {
      // Moderate, standard increase
      increment = 15;
    } else if (reps === 2) {
      // Getting harder, smaller increase
      increment = 10;
    } else {
      // Single rep, very small increase
      increment = 5;
    }

    return weight + increment;
  }

  /**
   * Determine the 4RM from a series of attempts
   * Takes the highest successful attempt and calculates 4RM
   */
  static determine4RMFromAttempts(attempts: MaxAttempt[]): number | null {
    const successfulAttempts = attempts.filter(a => a.success);
    
    if (successfulAttempts.length === 0) {
      return null;
    }

    // Find the highest weight achieved
    const bestAttempt = successfulAttempts.reduce((best, current) => {
      const currentEstimated4RM = this.calculate4RM(current.weight, current.reps);
      const bestEstimated4RM = this.calculate4RM(best.weight, best.reps);
      return currentEstimated4RM > bestEstimated4RM ? current : best;
    });

    return this.calculate4RM(bestAttempt.weight, bestAttempt.reps);
  }

  /**
   * Calculate user's strength score based on their max lifts
   * Uses relative strength standards (weight lifted / body weight)
   */
  static calculateStrengthScore(
    maxLifts: Record<string, number>,
    bodyWeight: number = 180
  ): StrengthScore {
    const weights = {
      'bench-press': 100,
      'lat-pulldown': 80,
      'leg-press': 200,
      'shoulder-press': 60,
      'bicep-cable-curl': 40,
    };

    const breakdown = Object.entries(maxLifts).map(([exerciseId, weight]) => {
      const relativeStrength = (weight / bodyWeight) * 100;
      const weightFactor = weights[exerciseId as keyof typeof weights] || 100;
      const score = (relativeStrength * weightFactor) / 100;
      
      return { exerciseId, score };
    });

    const total = breakdown.reduce((sum, item) => sum + item.score, 0);

    // Determine strength level based on total score
    let level: 'beginner' | 'intermediate' | 'advanced';
    let percentile: number;

    if (total < 200) {
      level = 'beginner';
      percentile = 25 + (total / 200) * 30; // 25-55%
    } else if (total < 350) {
      level = 'intermediate';
      percentile = 55 + ((total - 200) / 150) * 30; // 55-85%
    } else {
      level = 'advanced';
      percentile = Math.min(99, 85 + ((total - 350) / 150) * 14); // 85-99%
    }

    return {
      total: Math.round(total),
      level,
      percentile: Math.round(percentile),
      breakdown,
    };
  }

  /**
   * Get default max lifts for users who skip max determination
   * Based on beginner-friendly starting weights
   */
  static getDefaultMaxLifts(bodyWeight: number = 180): Record<string, number> {
    const bodyWeightRatio = bodyWeight / 180;
    
    return {
      'bench-press': Math.round((135 * bodyWeightRatio) / 5) * 5,
      'lat-pulldown': Math.round((120 * bodyWeightRatio) / 5) * 5,
      'leg-press': Math.round((270 * bodyWeightRatio) / 5) * 5,
      'shoulder-press': Math.round((95 * bodyWeightRatio) / 5) * 5,
      'bicep-cable-curl': Math.round((70 * bodyWeightRatio) / 5) * 5,
    };
  }

  /**
   * Convert max testing progress to MaxLift objects for storage
   */
  static convertToMaxLifts(
    userId: string,
    progress: MaxTestingProgress[]
  ): MaxLift[] {
    return progress
      .filter(p => p.completed && p.determined4RM)
      .map(p => ({
        id: `${userId}-${p.exerciseId}-${Date.now()}`,
        userId,
        exerciseId: p.exerciseId,
        weight: p.determined4RM!,
        reps: 1,
        dateAchieved: Date.now(),
        verified: true, // Max determination week lifts are verified
        workoutSessionId: undefined,
      }));
  }

  /**
   * Validate if a max lift is reasonable to prevent data entry errors
   */
  static validateMaxLift(exerciseId: string, weight: number, bodyWeight: number): {
    valid: boolean;
    warning?: string;
  } {
    const bodyWeightRatio = weight / bodyWeight;
    
    const limits: Record<string, { min: number; max: number; optimal: number }> = {
      'bench-press': { min: 0.3, max: 3.0, optimal: 1.5 },
      'lat-pulldown': { min: 0.3, max: 2.5, optimal: 1.2 },
      'leg-press': { min: 0.5, max: 5.0, optimal: 2.5 },
      'shoulder-press': { min: 0.2, max: 2.0, optimal: 0.8 },
      'bicep-cable-curl': { min: 0.1, max: 1.5, optimal: 0.5 },
    };

    const limit = limits[exerciseId];
    if (!limit) {
      return { valid: true };
    }

    if (bodyWeightRatio < limit.min) {
      return {
        valid: true,
        warning: 'This weight seems quite light. Consider testing with more weight.',
      };
    }

    if (bodyWeightRatio > limit.max) {
      return {
        valid: false,
        warning: 'This weight seems unusually high. Please verify your entry.',
      };
    }

    return { valid: true };
  }

  /**
   * Get encouragement message based on progress
   */
  static getEncouragementMessage(completedCount: number, totalCount: number): string {
    const percentage = (completedCount / totalCount) * 100;

    if (percentage === 0) {
      return "Let's establish your baseline strength! Take your time and focus on form.";
    } else if (percentage < 50) {
      return "Great start! Keep going, you're building your foundation.";
    } else if (percentage < 100) {
      return "You're more than halfway there! Finish strong!";
    } else {
      return "Amazing work! You've completed your max determination week!";
    }
  }

  /**
   * Get exercise-specific tips for max testing
   */
  static getExerciseTips(exerciseId: string): string[] {
    const tips: Record<string, string[]> = {
      'bench-press': [
        'Keep your feet flat on the floor',
        'Maintain a slight arch in your lower back',
        'Lower the bar to mid-chest, then press up',
        'Use a spotter for safety',
      ],
      'lat-pulldown': [
        'Grip slightly wider than shoulder width',
        'Pull the bar to upper chest',
        'Keep your torso upright',
        'Control the weight on the way up',
      ],
      'leg-press': [
        'Place feet shoulder-width apart',
        'Lower until knees are at 90 degrees',
        'Push through your heels',
        'Don\'t lock out your knees at the top',
      ],
      'shoulder-press': [
        'Keep core tight and back supported',
        'Press straight overhead',
        'Don\'t arch your back excessively',
        'Lower to chin level',
      ],
      'bicep-cable-curl': [
        'Keep elbows stationary at your sides',
        'Curl up to shoulder level',
        'Control the weight down slowly',
        'Don\'t swing or use momentum',
      ],
      'dumbbell-incline-press': [
        'Set bench to 30-45 degree incline',
        'Keep back flat against bench',
        'Lower dumbbells to chest level',
        'Press up and slightly together at the top',
      ],
      'machine-low-row': [
        'Keep chest against pad',
        'Pull handles to your lower chest',
        'Squeeze shoulder blades together',
        'Don\'t use momentum from your torso',
      ],
      'leg-extension': [
        'Adjust seat so knees align with pivot point',
        'Full extension without locking knees',
        'Control the weight down slowly',
        'Keep your back against the seat',
      ],
      'leg-curl': [
        'Lie flat with knees just off the edge',
        'Curl heels to glutes',
        'Keep hips pressed down',
        'Control the negative portion',
      ],
      'triceps-pushdown': [
        'Keep elbows tight to your sides',
        'Press down until arms fully extended',
        'Don\'t lean forward',
        'Control the weight back up',
      ],
    };

    return tips[exerciseId] || ['Focus on proper form', 'Control the weight', 'Breathe steadily'];
  }
}
