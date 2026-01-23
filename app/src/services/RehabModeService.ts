/**
 * RehabModeService
 * 
 * Manages rehab mode for injury recovery per PRD specifications.
 * 
 * Key Principles:
 * - Load reduced first (−10% to −30%), reps remain 10-15
 * - Max testing disabled during rehab
 * - Minimal pain check-ins (after first 1-2 sets)
 * - Pre-injury marker stored for recovery milestones
 * - Legal disclaimer required before entering rehab mode
 * 
 * IMPORTANT: App does not provide medical advice. Users train at their own discretion.
 */

import {
  RehabSession,
  MuscleGroup,
  FourRepMax,
  InjuryHold,
  InjurySeverity,
} from '../types';

export interface RehabModeConfig {
  loadReductionPercentage: number; // 10-30%
  targetReps: { min: number; max: number }; // 10-15
  painCheckFrequency: 'first_set' | 'first_two_sets' | 'every_set';
  maxTestingDisabled: boolean;
}

export interface RehabModeResult {
  active: boolean;
  config: RehabModeConfig;
  preInjuryMarkers: Record<string, number>; // exerciseId -> max weight
  affectedExercises: string[];
}

export interface PainCheckIn {
  exerciseId: string;
  setNumber: number;
  painLevel: number; // 0-10 scale
  timestamp: number;
  shouldContinue: boolean;
}

export class RehabModeService {
  /**
   * Initiate rehab mode for a user
   * Returns configuration and pre-injury markers
   */
  static initiateRehabMode(
    affectedMuscleGroups: MuscleGroup[],
    severity: InjurySeverity,
    currentMaxes: Record<string, FourRepMax>
  ): RehabModeResult {
    // Determine load reduction based on severity
    const loadReduction = this.calculateLoadReduction(severity);
    
    // Store pre-injury markers for all affected exercises
    const preInjuryMarkers: Record<string, number> = {};
    const affectedExercises: string[] = [];

    Object.entries(currentMaxes).forEach(([exerciseId, max]) => {
      // Check if exercise uses affected muscle group
      // In real implementation, would check exercise metadata
      preInjuryMarkers[exerciseId] = max.weight;
      affectedExercises.push(exerciseId);
    });

    const config: RehabModeConfig = {
      loadReductionPercentage: loadReduction,
      targetReps: { min: 10, max: 15 },
      painCheckFrequency: this.determinePainCheckFrequency(severity),
      maxTestingDisabled: true,
    };

    return {
      active: true,
      config,
      preInjuryMarkers,
      affectedExercises,
    };
  }

  /**
   * Calculate appropriate load reduction based on injury severity
   * Per PRD: −10% to −30%
   */
  private static calculateLoadReduction(severity: InjurySeverity): number {
    const reductions: Record<InjurySeverity, number> = {
      mild: 10,      // -10% for mild issues
      moderate: 20,  // -20% for moderate
      severe: 30,    // -30% for severe
    };

    return reductions[severity];
  }

  /**
   * Determine how often to check for pain
   */
  private static determinePainCheckFrequency(
    severity: InjurySeverity
  ): 'first_set' | 'first_two_sets' | 'every_set' {
    if (severity === 'severe') {
      return 'every_set'; // Check after each set for severe injuries
    } else if (severity === 'moderate') {
      return 'first_two_sets'; // Check first two sets
    } else {
      return 'first_set'; // Minimal check for mild
    }
  }

  /**
   * Apply rehab mode adjustments to exercise weight
   */
  static applyRehabAdjustment(
    originalWeight: number,
    rehabConfig: RehabModeConfig
  ): number {
    const reducedWeight = originalWeight * (1 - rehabConfig.loadReductionPercentage / 100);
    return Math.round(reducedWeight / 5) * 5; // Round to 5 lbs
  }

  /**
   * Process pain check-in response
   * Returns whether user should continue or stop
   */
  static processPainCheckIn(
    painLevel: number,
    previousPainLevel: number | null
  ): {
    shouldContinue: boolean;
    recommendation: string;
    severity: 'none' | 'mild' | 'moderate' | 'severe';
  } {
    if (painLevel === 0) {
      return {
        shouldContinue: true,
        recommendation: 'No pain reported. Continue with current weight.',
        severity: 'none',
      };
    }

    if (painLevel <= 3) {
      return {
        shouldContinue: true,
        recommendation: 'Mild discomfort is normal. Monitor closely and stop if pain increases.',
        severity: 'mild',
      };
    }

    if (painLevel <= 5) {
      // Check if pain is increasing
      if (previousPainLevel && painLevel > previousPainLevel) {
        return {
          shouldContinue: false,
          recommendation: 'Pain is increasing. Stop exercise and consult medical professional.',
          severity: 'moderate',
        };
      }

      return {
        shouldContinue: true,
        recommendation: 'Moderate pain detected. Reduce weight by additional 10% or consider stopping.',
        severity: 'moderate',
      };
    }

    // Pain > 5
    return {
      shouldContinue: false,
      recommendation: 'Significant pain detected. STOP immediately and consult medical professional.',
      severity: 'severe',
    };
  }

  /**
   * Check if user should prompt pain check-in for this set
   */
  static shouldPromptPainCheck(
    setNumber: number,
    painCheckFrequency: 'first_set' | 'first_two_sets' | 'every_set'
  ): boolean {
    switch (painCheckFrequency) {
      case 'first_set':
        return setNumber === 1;
      case 'first_two_sets':
        return setNumber <= 2;
      case 'every_set':
        return true;
      default:
        return false;
    }
  }

  /**
   * Track recovery progress
   * Returns percentage of pre-injury strength recovered
   */
  static calculateRecoveryProgress(
    currentWeight: number,
    preInjuryMax: number
  ): {
    percentRecovered: number;
    milestone: string | null;
    readyForNormalTraining: boolean;
  } {
    const percentRecovered = (currentWeight / preInjuryMax) * 100;

    let milestone: string | null = null;
    if (percentRecovered >= 100) {
      milestone = '🎉 Full strength recovered!';
    } else if (percentRecovered >= 90) {
      milestone = '💪 90% recovered - almost there!';
    } else if (percentRecovered >= 75) {
      milestone = '🔥 75% recovered - great progress!';
    } else if (percentRecovered >= 50) {
      milestone = '✨ Halfway to full recovery!';
    }

    const readyForNormalTraining = percentRecovered >= 95 && currentWeight >= preInjuryMax * 0.95;

    return {
      percentRecovered: Math.round(percentRecovered),
      milestone,
      readyForNormalTraining,
    };
  }

  /**
   * Get recommended progression for rehab
   * Conservative: increase by 5-10% when hitting 15+ reps consistently
   */
  static getRehabProgression(
    rehabSessions: RehabSession[],
    exerciseId: string
  ): {
    shouldIncrease: boolean;
    recommendedIncrease: number;
    reasoning: string;
  } {
    const exerciseSessions = rehabSessions
      .filter(s => s.exerciseId === exerciseId)
      .slice(-3); // Last 3 sessions

    if (exerciseSessions.length < 3) {
      return {
        shouldIncrease: false,
        recommendedIncrease: 0,
        reasoning: 'Need at least 3 rehab sessions before progressing',
      };
    }

    // Check if consistently hitting upper rep range with no pain increase
    const allLowPain = exerciseSessions.every(s => !s.painLevel || s.painLevel <= 2);
    
    if (!allLowPain) {
      return {
        shouldIncrease: false,
        recommendedIncrease: 0,
        reasoning: 'Pain levels still present. Continue at current weight.',
      };
    }

    // Check if ready to progress (would need rep data in real implementation)
    // Placeholder logic
    return {
      shouldIncrease: true,
      recommendedIncrease: 5, // Conservative 5 lb increase
      reasoning: 'Consistent performance with minimal pain. Ready for small increase.',
    };
  }

  /**
   * Exit rehab mode and return to normal training
   */
  static exitRehabMode(
    currentWeights: Record<string, number>,
    preInjuryMarkers: Record<string, number>
  ): {
    canExit: boolean;
    exercisesNotReady: string[];
    recommendation: string;
  } {
    const exercisesNotReady: string[] = [];

    Object.entries(preInjuryMarkers).forEach(([exerciseId, preInjuryMax]) => {
      const currentWeight = currentWeights[exerciseId];
      if (!currentWeight || currentWeight < preInjuryMax * 0.90) {
        exercisesNotReady.push(exerciseId);
      }
    });

    if (exercisesNotReady.length > 0) {
      return {
        canExit: false,
        exercisesNotReady,
        recommendation: `${exercisesNotReady.length} exercise(s) not yet at 90% recovery. Continue rehab mode.`,
      };
    }

    return {
      canExit: true,
      exercisesNotReady: [],
      recommendation: 'Recovery complete! You can return to normal training.',
    };
  }

  /**
   * Get legal disclaimer text for rehab mode
   * Required per PRD before entering rehab mode
   */
  static getRehabDisclaimer(): {
    title: string;
    text: string;
    acknowledgment: string;
  } {
    return {
      title: 'Important: Medical Disclaimer',
      text: `This app does not provide medical advice, diagnosis, or treatment.

The Rehab Mode feature is designed to help you gradually return to training after an injury, but it is NOT a substitute for professional medical care.

By using Rehab Mode, you acknowledge that:

• You train at your own discretion and risk
• You will stop immediately if pain worsens
• You are encouraged to consult with a qualified healthcare provider before beginning any rehabilitation program
• The app's recommendations are general in nature and not tailored medical advice

If you experience severe or persistent pain, stop immediately and seek medical attention.`,
      acknowledgment: 'I understand and accept the risks. I will consult a medical professional as needed.',
    };
  }

  /**
   * Validate if rehab mode is appropriate
   * Some injuries should not be self-managed
   */
  static validateRehabAppropriateness(
    severity: InjurySeverity,
    description: string
  ): {
    appropriate: boolean;
    warning?: string;
  } {
    // Check for keywords that suggest medical attention needed
    const dangerKeywords = [
      'sharp', 'severe', 'unbearable', 'radiating', 'numbness',
      'tingling', 'joint instability', 'swelling', 'bruising'
    ];

    const containsDangerKeyword = dangerKeywords.some(keyword =>
      description.toLowerCase().includes(keyword)
    );

    if (severity === 'severe' || containsDangerKeyword) {
      return {
        appropriate: false,
        warning: 'Your injury description suggests you should seek medical evaluation before using Rehab Mode. Please consult a healthcare provider.',
      };
    }

    return { appropriate: true };
  }

  /**
   * Create rehab session record
   */
  static createRehabSession(
    userId: string,
    exerciseId: string,
    preInjuryMax: number,
    currentWeight: number,
    loadReduction: number,
    painLevel: number | undefined,
    sessionId: string
  ): RehabSession {
    return {
      id: this.generateId(),
      userId,
      exerciseId,
      preInjuryMax,
      currentWeight,
      loadReduction,
      painLevel,
      sessionId,
      timestamp: Date.now(),
    };
  }

  /**
   * Get rehab mode summary for display
   */
  static getRehabSummary(
    rehabSessions: RehabSession[],
    preInjuryMarkers: Record<string, number>
  ): {
    totalSessions: number;
    averagePainLevel: number;
    recoveryPercentages: Record<string, number>;
    overallRecovery: number;
  } {
    const totalSessions = rehabSessions.length;
    
    // Calculate average pain level
    const painLevels = rehabSessions
      .filter(s => s.painLevel !== undefined)
      .map(s => s.painLevel!);
    const averagePainLevel = painLevels.length > 0
      ? painLevels.reduce((sum, p) => sum + p, 0) / painLevels.length
      : 0;

    // Calculate recovery percentage per exercise
    const recoveryPercentages: Record<string, number> = {};
    const latestWeights: Record<string, number> = {};

    rehabSessions.forEach(session => {
      latestWeights[session.exerciseId] = session.currentWeight;
    });

    Object.entries(preInjuryMarkers).forEach(([exerciseId, preInjuryMax]) => {
      const currentWeight = latestWeights[exerciseId] || 0;
      recoveryPercentages[exerciseId] = (currentWeight / preInjuryMax) * 100;
    });

    // Calculate overall recovery
    const percentages = Object.values(recoveryPercentages);
    const overallRecovery = percentages.length > 0
      ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length
      : 0;

    return {
      totalSessions,
      averagePainLevel: Math.round(averagePainLevel * 10) / 10,
      recoveryPercentages,
      overallRecovery: Math.round(overallRecovery),
    };
  }

  /**
   * Recommend when to re-evaluate intensity goals
   * After hold ends, user should review their training intensity preference
   */
  static shouldReEvaluateIntensity(
    recoveryPercentage: number,
    sessionsCompleted: number
  ): boolean {
    // Re-evaluate when:
    // 1. Recovered to 90%+ strength
    // 2. Completed at least 6 rehab sessions
    return recoveryPercentage >= 90 && sessionsCompleted >= 6;
  }

  /**
   * Generate recovery milestone achievements
   */
  static getRecoveryMilestones(
    currentWeight: number,
    preInjuryMax: number
  ): Array<{
    percentage: number;
    achieved: boolean;
    title: string;
    emoji: string;
  }> {
    const currentPercentage = (currentWeight / preInjuryMax) * 100;

    const milestones = [
      { percentage: 50, title: 'Halfway Back', emoji: '✨' },
      { percentage: 75, title: 'Three Quarters Strong', emoji: '🔥' },
      { percentage: 90, title: 'Nearly Recovered', emoji: '💪' },
      { percentage: 100, title: 'Full Strength Restored', emoji: '🎉' },
      { percentage: 105, title: 'Stronger Than Before', emoji: '🏆' },
    ];

    return milestones.map(m => ({
      ...m,
      achieved: currentPercentage >= m.percentage,
    }));
  }

  /**
   * Determine if exercise should remain in rehab mode
   * or can graduate to normal training
   */
  static shouldGraduateFromRehab(
    rehabSessions: RehabSession[],
    exerciseId: string,
    preInjuryMax: number,
    minimumSessions: number = 6
  ): {
    canGraduate: boolean;
    reason: string;
    nextSteps?: string;
  } {
    const exerciseSessions = rehabSessions.filter(s => s.exerciseId === exerciseId);
    
    if (exerciseSessions.length < minimumSessions) {
      return {
        canGraduate: false,
        reason: `Complete at least ${minimumSessions} rehab sessions (${minimumSessions - exerciseSessions.length} remaining)`,
      };
    }

    const latestSession = exerciseSessions[exerciseSessions.length - 1];
    const recovery = this.calculateRecoveryProgress(
      latestSession.currentWeight,
      preInjuryMax
    );

    if (!recovery.readyForNormalTraining) {
      return {
        canGraduate: false,
        reason: `At ${recovery.percentRecovered}% recovery. Reach 95% before graduating.`,
      };
    }

    // Check recent pain levels
    const recentSessions = exerciseSessions.slice(-3);
    const hasPain = recentSessions.some(s => s.painLevel && s.painLevel > 2);

    if (hasPain) {
      return {
        canGraduate: false,
        reason: 'Recent sessions show elevated pain. Continue rehab until pain-free.',
      };
    }

    return {
      canGraduate: true,
      reason: 'Recovery complete! Ready to return to normal training.',
      nextSteps: 'Start with moderate intensity and gradually increase over 2-3 weeks.',
    };
  }

  /**
   * Resume training after injury hold ends
   * Starts at 50-60% of pre-injury load in rehab mode
   */
  static resumeAfterHold(
    preInjuryMax: number,
    holdDuration: number // days
  ): {
    startingWeight: number;
    loadReduction: number;
    recommendation: string;
  } {
    // Longer holds require more conservative restart
    let reductionPercentage: number;
    
    if (holdDuration <= 14) {
      reductionPercentage = 40; // Start at 60% for short holds
    } else if (holdDuration <= 30) {
      reductionPercentage = 45; // Start at 55% for month-long holds
    } else {
      reductionPercentage = 50; // Start at 50% for long holds
    }

    const startingWeight = preInjuryMax * (1 - reductionPercentage / 100);

    return {
      startingWeight: Math.round(startingWeight / 5) * 5,
      loadReduction: reductionPercentage,
      recommendation: `Starting at ${100 - reductionPercentage}% of pre-injury strength. Gradually build back over 4-8 weeks.`,
    };
  }

  /**
   * Generate pain report summary for trainers
   */
  static generatePainReport(
    rehabSessions: RehabSession[],
    exerciseId: string
  ): {
    sessionCount: number;
    painTrend: 'improving' | 'worsening' | 'stable' | 'no_data';
    averagePain: number;
    latestPain: number | null;
    concerning: boolean;
  } {
    const exerciseSessions = rehabSessions
      .filter(s => s.exerciseId === exerciseId && s.painLevel !== undefined)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (exerciseSessions.length === 0) {
      return {
        sessionCount: 0,
        painTrend: 'no_data',
        averagePain: 0,
        latestPain: null,
        concerning: false,
      };
    }

    const painLevels = exerciseSessions.map(s => s.painLevel!);
    const averagePain = painLevels.reduce((sum, p) => sum + p, 0) / painLevels.length;
    const latestPain = painLevels[painLevels.length - 1];

    // Determine trend from last 3 sessions
    let painTrend: 'improving' | 'worsening' | 'stable' | 'no_data' = 'stable';
    if (exerciseSessions.length >= 3) {
      const recent = painLevels.slice(-3);
      const isImproving = recent[2] < recent[0];
      const isWorsening = recent[2] > recent[0];
      
      if (isImproving && recent[2] <= 2) {
        painTrend = 'improving';
      } else if (isWorsening) {
        painTrend = 'worsening';
      }
    }

    const concerning = latestPain > 4 || painTrend === 'worsening';

    return {
      sessionCount: exerciseSessions.length,
      painTrend,
      averagePain: Math.round(averagePain * 10) / 10,
      latestPain,
      concerning,
    };
  }

  /**
   * Utility: Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default RehabModeService;
