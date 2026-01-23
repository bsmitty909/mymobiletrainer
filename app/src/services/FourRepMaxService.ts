/**
 * FourRepMaxService
 * 
 * Manages 4-rep max (4RM) tracking for protocol-based training.
 * 
 * Key Principles per PRD:
 * - 4RM can ONLY be updated through successful P1 testing
 * - Rep-outs in P2/P3 signal readiness but DO NOT auto-increase max
 * - P1 testing has cooldown period (minimum weeks between tests)
 * - All max attempts are logged for analytics and safety
 */

import {
  FourRepMax,
  MaxTestingAttempt,
  EquipmentType,
} from '../types';
import { P1_COOLDOWN_WEEKS, P1_INCREASE_INCREMENTS } from './ProtocolDefinitions';

export class FourRepMaxService {
  /**
   * Get current verified 4RM for an exercise
   */
  static getCurrentFourRepMax(
    fourRepMaxes: FourRepMax[],
    exerciseId: string
  ): FourRepMax | null {
    const exerciseMaxes = fourRepMaxes
      .filter(m => m.exerciseId === exerciseId)
      .sort((a, b) => b.dateAchieved - a.dateAchieved);
    
    return exerciseMaxes[0] || null;
  }

  /**
   * Check if user can attempt P1 testing for an exercise
   * Enforces cooldown period between tests
   */
  static canAttemptP1Testing(
    exerciseId: string,
    fourRepMaxes: FourRepMax[],
    cooldownWeeks: number = P1_COOLDOWN_WEEKS
  ): { canTest: boolean; reason?: string; nextAvailableDate?: number } {
    const currentMax = this.getCurrentFourRepMax(fourRepMaxes, exerciseId);
    
    if (!currentMax) {
      // No max exists, testing required
      return { canTest: true };
    }

    const daysSinceLastTest = (Date.now() - currentMax.dateAchieved) / (1000 * 60 * 60 * 24);
    const cooldownDays = cooldownWeeks * 7;
    
    if (daysSinceLastTest < cooldownDays) {
      const daysRemaining = Math.ceil(cooldownDays - daysSinceLastTest);
      const nextAvailableDate = currentMax.dateAchieved + (cooldownDays * 24 * 60 * 60 * 1000);
      
      return {
        canTest: false,
        reason: `You can test again in ${daysRemaining} days. Give your body time to adapt to the current load.`,
        nextAvailableDate,
      };
    }

    return { canTest: true };
  }

  /**
   * Calculate weight for P1 max attempt
   * Initial attempt: 100% of current 4RM
   * Subsequent attempts: +2.5-5% based on equipment
   */
  static calculateP1AttemptWeight(
    currentFourRepMax: number,
    attemptNumber: number,
    equipmentType: EquipmentType
  ): number {
    if (attemptNumber === 1) {
      return currentFourRepMax; // Start at current max
    }

    // Calculate increment based on equipment
    let increment: number;
    if (equipmentType === 'dumbbell') {
      increment = P1_INCREASE_INCREMENTS.small;
    } else if (equipmentType === 'barbell') {
      increment = P1_INCREASE_INCREMENTS.medium;
    } else {
      increment = P1_INCREASE_INCREMENTS.medium;
    }

    // Each successful attempt adds the increment
    const totalIncrease = increment * (attemptNumber - 1);
    return currentFourRepMax + totalIncrease;
  }

  /**
   * Record a P1 max testing attempt
   */
  static recordMaxAttempt(
    userId: string,
    exerciseId: string,
    fourRepMax: number,
    attemptedWeight: number,
    repsCompleted: number,
    sessionId: string
  ): MaxTestingAttempt {
    const successful = repsCompleted >= 4;
    
    return {
      id: this.generateId(),
      userId,
      exerciseId,
      fourRepMax,
      attemptedWeight,
      repsCompleted,
      successful,
      timestamp: Date.now(),
      sessionId,
    };
  }

  /**
   * Update 4RM after successful P1 testing
   * This is the ONLY way to increase max in protocol mode
   */
  static updateFourRepMax(
    userId: string,
    exerciseId: string,
    newWeight: number,
    testingSessionId: string
  ): FourRepMax {
    return {
      id: this.generateId(),
      userId,
      exerciseId,
      weight: newWeight,
      dateAchieved: Date.now(),
      verified: true, // Always verified if from P1
      testingSessionId,
    };
  }

  /**
   * Get max testing history for an exercise
   */
  static getTestingHistory(
    attempts: MaxTestingAttempt[],
    exerciseId: string,
    limit: number = 10
  ): MaxTestingAttempt[] {
    return attempts
      .filter(a => a.exerciseId === exerciseId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Calculate P1 success rate for an exercise
   */
  static calculateSuccessRate(
    attempts: MaxTestingAttempt[],
    exerciseId: string
  ): {
    totalAttempts: number;
    successful: number;
    failed: number;
    successRate: number;
  } {
    const exerciseAttempts = attempts.filter(a => a.exerciseId === exerciseId);
    const totalAttempts = exerciseAttempts.length;
    const successful = exerciseAttempts.filter(a => a.successful).length;
    const failed = totalAttempts - successful;
    const successRate = totalAttempts > 0 ? (successful / totalAttempts) * 100 : 0;

    return {
      totalAttempts,
      successful,
      failed,
      successRate: Math.round(successRate),
    };
  }

  /**
   * Get progression from P1 testing over time
   */
  static getP1Progression(
    fourRepMaxes: FourRepMax[],
    exerciseId: string
  ): Array<{
    weight: number;
    date: number;
    gain: number;
    gainPercentage: number;
  }> {
    const exerciseMaxes = fourRepMaxes
      .filter(m => m.exerciseId === exerciseId && m.verified)
      .sort((a, b) => a.dateAchieved - b.dateAchieved);

    if (exerciseMaxes.length === 0) return [];

    const progression: Array<{
      weight: number;
      date: number;
      gain: number;
      gainPercentage: number;
    }> = [];

    for (let i = 0; i < exerciseMaxes.length; i++) {
      const current = exerciseMaxes[i];
      const previous = i > 0 ? exerciseMaxes[i - 1] : null;
      
      const gain = previous ? current.weight - previous.weight : 0;
      const gainPercentage = previous ? (gain / previous.weight) * 100 : 0;

      progression.push({
        weight: current.weight,
        date: current.dateAchieved,
        gain: Math.round(gain * 10) / 10,
        gainPercentage: Math.round(gainPercentage * 10) / 10,
      });
    }

    return progression;
  }

  /**
   * Check if recent P2/P3 performance suggests readiness for P1
   * This provides the "signal" that user might be ready to test
   * Note: This is advisory only, does not auto-schedule P1
   */
  static checkReadinessForP1(
    recentRepOuts: Array<{ reps: number; weight: number }>,
    currentFourRepMax: number
  ): {
    isReady: boolean;
    confidence: number; // 0-1
    reasoning: string[];
  } {
    if (recentRepOuts.length < 3) {
      return {
        isReady: false,
        confidence: 0,
        reasoning: ['Need more P2/P3 data to assess readiness'],
      };
    }

    const reasoning: string[] = [];
    let readinessScore = 0;

    // Check 1: Are rep-outs consistently in the "reserve" or "light" bands (10-15 reps)?
    const avgReps = recentRepOuts.reduce((sum, r) => sum + r.reps, 0) / recentRepOuts.length;
    if (avgReps >= 10) {
      readinessScore += 0.4;
      reasoning.push(`Average ${Math.round(avgReps)} reps indicates strength reserve`);
    } else if (avgReps >= 7) {
      readinessScore += 0.2;
      reasoning.push(`Average ${Math.round(avgReps)} reps in ideal range`);
    }

    // Check 2: Is performance consistent across recent sessions?
    const repVariance = this.calculateVariance(recentRepOuts.map(r => r.reps));
    if (repVariance < 4) { // Low variance
      readinessScore += 0.3;
      reasoning.push('Consistent rep performance across sessions');
    }

    // Check 3: Are any sessions hitting 13-15 reps (light band)?
    const hasLightSets = recentRepOuts.some(r => r.reps >= 13);
    if (hasLightSets) {
      readinessScore += 0.3;
      reasoning.push('Multiple sets reaching 13+ reps suggests load is light');
    }

    const isReady = readinessScore >= 0.6;
    const confidence = Math.min(readinessScore, 1.0);

    if (!isReady) {
      reasoning.push('Continue P2/P3 work until consistently hitting 10+ reps');
    } else {
      reasoning.push('Ready to schedule P1 testing to establish new max');
    }

    return {
      isReady,
      confidence: Math.round(confidence * 100) / 100,
      reasoning,
    };
  }

  /**
   * Initialize 4RM from existing 1RM
   * Conservative conversion: 4RM ≈ 90% of 1RM
   */
  static convertFrom1RMto4RM(oneRepMax: number): number {
    const fourRepMax = oneRepMax * 0.90;
    return Math.round(fourRepMax / 5) * 5; // Round to 5 lbs
  }

  /**
   * Estimate 4RM from body weight for new users
   */
  static estimateFourRepMax(
    bodyWeight: number,
    exerciseType: 'bench' | 'squat' | 'deadlift' | 'overhead_press',
    sex: 'male' | 'female'
  ): number {
    // Conservative multipliers based on typical strength standards
    const multipliers: Record<string, Record<string, number>> = {
      male: {
        bench: 0.75,
        squat: 1.0,
        deadlift: 1.25,
        overhead_press: 0.50,
      },
      female: {
        bench: 0.45,
        squat: 0.75,
        deadlift: 0.90,
        overhead_press: 0.30,
      },
    };

    const multiplier = multipliers[sex][exerciseType];
    const estimated4RM = bodyWeight * multiplier;
    
    return Math.round(estimated4RM / 5) * 5; // Round to 5 lbs
  }

  /**
   * Get statistics for all 4RMs
   */
  static getAllMaxStatistics(
    fourRepMaxes: FourRepMax[]
  ): {
    totalExercises: number;
    totalStrength: number;
    averageGain: number;
    strongestLift: FourRepMax | null;
  } {
    if (fourRepMaxes.length === 0) {
      return {
        totalExercises: 0,
        totalStrength: 0,
        averageGain: 0,
        strongestLift: null,
      };
    }

    // Get latest max for each exercise
    const latestMaxes = new Map<string, FourRepMax>();
    fourRepMaxes.forEach(max => {
      const existing = latestMaxes.get(max.exerciseId);
      if (!existing || max.dateAchieved > existing.dateAchieved) {
        latestMaxes.set(max.exerciseId, max);
      }
    });

    const latestMaxArray = Array.from(latestMaxes.values());
    const totalStrength = latestMaxArray.reduce((sum, m) => sum + m.weight, 0);
    const totalExercises = latestMaxArray.length;

    // Find strongest lift
    const strongestLift = latestMaxArray.reduce((strongest, current) => {
      return current.weight > strongest.weight ? current : strongest;
    }, latestMaxArray[0]);

    // Calculate average gain (rough estimate)
    // This would ideally compare to initial maxes
    const averageGain = 0; // Placeholder - would need initial baseline

    return {
      totalExercises,
      totalStrength,
      averageGain,
      strongestLift,
    };
  }

  /**
   * Detect if 4RM is stale (hasn't been tested in a while)
   */
  static isFourRepMaxStale(
    fourRepMax: FourRepMax,
    staleThresholdWeeks: number = 8
  ): boolean {
    const daysSinceTest = (Date.now() - fourRepMax.dateAchieved) / (1000 * 60 * 60 * 24);
    const staleDays = staleThresholdWeeks * 7;
    
    return daysSinceTest > staleDays;
  }

  /**
   * Get recommended next P1 test date for an exercise
   */
  static getRecommendedP1Date(
    fourRepMax: FourRepMax | null,
    cooldownWeeks: number = P1_COOLDOWN_WEEKS
  ): {
    recommended: boolean;
    earliestDate: number;
    reasoning: string;
  } {
    if (!fourRepMax) {
      return {
        recommended: true,
        earliestDate: Date.now(),
        reasoning: 'No 4RM established - P1 testing required to begin training',
      };
    }

    const cooldownMs = cooldownWeeks * 7 * 24 * 60 * 60 * 1000;
    const earliestDate = fourRepMax.dateAchieved + cooldownMs;
    const recommended = Date.now() >= earliestDate;

    if (recommended) {
      return {
        recommended: true,
        earliestDate,
        reasoning: `Cooldown period complete - ready to test for new 4RM`,
      };
    }

    const daysRemaining = Math.ceil((earliestDate - Date.now()) / (1000 * 60 * 60 * 24));
    return {
      recommended: false,
      earliestDate,
      reasoning: `Cooldown in progress - ${daysRemaining} days until eligible for P1 testing`,
    };
  }

  /**
   * Validate P1 attempt result
   * Ensures attempt was legitimate and follows protocol rules
   */
  static validateP1Attempt(
    attemptedWeight: number,
    repsCompleted: number,
    currentFourRepMax: number
  ): { valid: boolean; error?: string } {
    // Must attempt at least current max or higher
    if (attemptedWeight < currentFourRepMax) {
      return {
        valid: false,
        error: 'P1 attempts must be at current 4RM or higher',
      };
    }

    // Must be reasonable increase (max 20% above current)
    if (attemptedWeight > currentFourRepMax * 1.20) {
      return {
        valid: false,
        error: 'Attempted weight is too high (>20% above current max). Reduce weight for safety.',
      };
    }

    // Reps must be between 0 and 10 (sanity check)
    if (repsCompleted < 0 || repsCompleted > 10) {
      return {
        valid: false,
        error: 'Invalid rep count for P1 testing',
      };
    }

    return { valid: true };
  }

  /**
   * Determine if P1 attempt was successful
   * Success = 4 or more reps at attempted weight
   */
  static isP1AttemptSuccessful(repsCompleted: number): boolean {
    return repsCompleted >= 4;
  }

  /**
   * Calculate new 4RM after successful P1 session
   * Returns the highest weight at which user completed 4 reps
   */
  static calculateNewFourRepMax(
    attempts: MaxTestingAttempt[],
    sessionId: string
  ): number | null {
    const sessionAttempts = attempts
      .filter(a => a.sessionId === sessionId && a.successful)
      .sort((a, b) => b.attemptedWeight - a.attemptedWeight);

    if (sessionAttempts.length === 0) {
      return null; // No successful attempts
    }

    return sessionAttempts[0].attemptedWeight;
  }

  /**
   * Get P1 testing summary for analytics
   */
  static getP1SessionSummary(
    attempts: MaxTestingAttempt[],
    sessionId: string,
    previousFourRepMax: number
  ): {
    totalAttempts: number;
    successfulAttempts: number;
    newFourRepMax: number | null;
    gain: number;
    gainPercentage: number;
    attemptDetails: MaxTestingAttempt[];
  } {
    const sessionAttempts = attempts.filter(a => a.sessionId === sessionId);
    const successfulAttempts = sessionAttempts.filter(a => a.successful);
    const newFourRepMax = this.calculateNewFourRepMax(attempts, sessionId);
    
    const gain = newFourRepMax ? newFourRepMax - previousFourRepMax : 0;
    const gainPercentage = previousFourRepMax > 0 ? (gain / previousFourRepMax) * 100 : 0;

    return {
      totalAttempts: sessionAttempts.length,
      successfulAttempts: successfulAttempts.length,
      newFourRepMax,
      gain: Math.round(gain * 10) / 10,
      gainPercentage: Math.round(gainPercentage * 10) / 10,
      attemptDetails: sessionAttempts,
    };
  }

  /**
   * Compare 4RM to population averages (for percentile ranking)
   * This would integrate with backend leaderboard data
   */
  static calculatePercentile(
    fourRepMax: number,
    exerciseId: string,
    bodyWeight: number
  ): number {
    // Placeholder - would query backend for population data
    // For now, return neutral percentile
    return 50;
  }

  /**
   * Utility: Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility: Calculate variance for readiness analysis
   */
  private static calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length;
    
    return Math.sqrt(variance); // Return standard deviation
  }
}

export default FourRepMaxService;
