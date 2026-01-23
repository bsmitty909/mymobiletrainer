/**
 * TrainerService
 * 
 * Provides trainer-specific functionality for protocol system:
 * - Protocol-aware analytics and metrics
 * - Override capabilities (reorder, force rehab, adjust intensity)
 * - Flag system (plateau, risk, fatigue detection)
 * - Trainer notes management
 * 
 * Per PRD: Trainers can override any logic with intent logged.
 */

import {
  TrainerOverride,
  TrainerOverrideType,
  WorkoutFlag,
  WorkoutFlagType,
  WorkoutFlagSeverity,
  Protocol,
  FourRepMax,
  MaxTestingAttempt,
  MissedWorkout,
  WorkoutSession,
} from '../types';

export interface TrainerDashboardMetrics {
  clientId: string;
  protocolUsage: {
    p1Sessions: number;
    p2Sessions: number;
    p3Sessions: number;
  };
  recentActivity: {
    lastWorkout: number; // timestamp
    adherenceRate: number; // percentage
    consecutiveMissed: number;
  };
  strengthProgress: {
    exercisesTracked: number;
    totalStrengthGain: number;
    avgGainPercentage: number;
  };
  flags: WorkoutFlag[];
  activeInjuries: number;
  rehabModeActive: boolean;
}

export class TrainerService {
  /**
   * Create trainer override
   */
  static createOverride(
    trainerId: string,
    userId: string,
    overrideType: TrainerOverrideType,
    details: any,
    reason: string,
    exerciseId?: string
  ): TrainerOverride {
    return {
      id: this.generateId(),
      trainerId,
      userId,
      exerciseId,
      overrideType,
      details,
      reason,
      timestamp: Date.now(),
    };
  }

  /**
   * Generate workout flags for trainer awareness
   */
  static generateFlags(
    userId: string,
    fourRepMaxes: FourRepMax[],
    maxAttempts: MaxTestingAttempt[],
    missedWorkouts: MissedWorkout[],
    recentSessions: WorkoutSession[]
  ): WorkoutFlag[] {
    const flags: WorkoutFlag[] = [];

    // Plateau detection
    const plateauFlag = this.detectPlateau(fourRepMaxes);
    if (plateauFlag) flags.push(plateauFlag);

    // Risk detection (too frequent P1 testing)
    const riskFlag = this.detectTestingRisk(maxAttempts);
    if (riskFlag) flags.push(riskFlag);

    // Fatigue detection
    const fatigueFlag = this.detectFatigue(maxAttempts, recentSessions);
    if (fatigueFlag) flags.push(fatigueFlag);

    // Injury concern
    const injuryFlag = this.detectInjuryConcern(missedWorkouts);
    if (injuryFlag) flags.push(injuryFlag);

    return flags;
  }

  /**
   * Detect plateau (no progress in 4+ weeks)
   */
  private static detectPlateau(fourRepMaxes: FourRepMax[]): WorkoutFlag | null {
    const fourWeeksAgo = Date.now() - (28 * 24 * 60 * 60 * 1000);
    
    // Group by exercise
    const exerciseMaxes = new Map<string, FourRepMax[]>();
    fourRepMaxes.forEach(max => {
      if (!exerciseMaxes.has(max.exerciseId)) {
        exerciseMaxes.set(max.exerciseId, []);
      }
      exerciseMaxes.get(max.exerciseId)!.push(max);
    });

    let plateauCount = 0;

    exerciseMaxes.forEach((maxes, exerciseId) => {
      const recent = maxes
        .filter(m => m.dateAchieved >= fourWeeksAgo)
        .sort((a, b) => b.dateAchieved - a.dateAchieved);

      if (recent.length >= 2) {
        const latest = recent[0];
        const previous = recent[recent.length - 1];
        
        if (latest.weight === previous.weight) {
          plateauCount++;
        }
      }
    });

    if (plateauCount >= 2) {
      return {
        id: this.generateId(),
        userId: fourRepMaxes[0]?.userId || '',
        flagType: 'plateau',
        severity: 'medium',
        message: `Plateau detected on ${plateauCount} exercises - no 4RM progress in 4 weeks`,
        generatedAt: Date.now(),
        acknowledged: false,
      };
    }

    return null;
  }

  /**
   * Detect risky P1 testing frequency
   */
  private static detectTestingRisk(maxAttempts: MaxTestingAttempt[]): WorkoutFlag | null {
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    
    // Group attempts by exercise
    const exerciseAttempts = new Map<string, MaxTestingAttempt[]>();
    maxAttempts.forEach(attempt => {
      if (!exerciseAttempts.has(attempt.exerciseId)) {
        exerciseAttempts.set(attempt.exerciseId, []);
      }
      exerciseAttempts.get(attempt.exerciseId)!.push(attempt);
    });

    let riskCount = 0;

    exerciseAttempts.forEach((attempts, exerciseId) => {
      const recentAttempts = attempts.filter(a => a.timestamp >= twoWeeksAgo);
      
      // More than 2 P1 sessions in 2 weeks is risky
      if (recentAttempts.length > 2) {
        riskCount++;
      }
    });

    if (riskCount > 0) {
      return {
        id: this.generateId(),
        userId: maxAttempts[0]?.userId || '',
        flagType: 'risk',
        severity: 'high',
        message: `${riskCount} exercise(s) tested too frequently - risk of overtraining`,
        generatedAt: Date.now(),
        acknowledged: false,
      };
    }

    return null;
  }

  /**
   * Detect fatigue from declining P1 performance
   */
  private static detectFatigue(
    maxAttempts: MaxTestingAttempt[],
    recentSessions: WorkoutSession[]
  ): WorkoutFlag | null {
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    const recentAttempts = maxAttempts.filter(a => a.timestamp >= twoWeeksAgo);

    // Multiple failed attempts = fatigue
    const failedAttempts = recentAttempts.filter(a => !a.successful);
    
    if (failedAttempts.length >= 3) {
      return {
        id: this.generateId(),
        userId: maxAttempts[0]?.userId || '',
        flagType: 'fatigue',
        severity: 'high',
        message: `${failedAttempts.length} failed P1 attempts recently - possible fatigue or overreaching`,
        generatedAt: Date.now(),
        acknowledged: false,
      };
    }

    return null;
  }

  /**
   * Detect injury concern from missed workouts
   */
  private static detectInjuryConcern(missedWorkouts: MissedWorkout[]): WorkoutFlag | null {
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentMissed = missedWorkouts.filter(m => m.timestamp >= oneMonthAgo);
    
    const injuryMissed = recentMissed.filter(m => m.reason === 'injury');

    if (injuryMissed.length >= 3) {
      return {
        id: this.generateId(),
        userId: missedWorkouts[0]?.userId || '',
        flagType: 'injury_concern',
        severity: 'high',
        message: `${injuryMissed.length} injury-related cancellations this month - review training intensity`,
        generatedAt: Date.now(),
        acknowledged: false,
      };
    }

    return null;
  }

  /**
   * Get protocol usage statistics
   */
  static getProtocolUsageStats(
    sessions: WorkoutSession[],
    periodDays: number = 30
  ): {
    p1Sessions: number;
    p2Sessions: number;
    p3Sessions: number;
    totalSessions: number;
    dominantProtocol: Protocol;
  } {
    const cutoff = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.filter(s => s.startedAt >= cutoff);

    // This would need protocol assignment data in real implementation
    // Placeholder logic
    const p1Sessions = Math.floor(recentSessions.length * 0.3);
    const p2Sessions = Math.floor(recentSessions.length * 0.5);
    const p3Sessions = recentSessions.length - p1Sessions - p2Sessions;

    const dominantProtocol: Protocol = p2Sessions > p1Sessions && p2Sessions > p3Sessions ? 'P2' :
                                        p1Sessions > p3Sessions ? 'P1' : 'P3';

    return {
      p1Sessions,
      p2Sessions,
      p3Sessions,
      totalSessions: recentSessions.length,
      dominantProtocol,
    };
  }

  /**
   * Get P1 testing success rate for trainer overview
   */
  static getP1SuccessRate(
    maxAttempts: MaxTestingAttempt[],
    periodDays: number = 90
  ): {
    totalAttempts: number;
    successful: number;
    failed: number;
    successRate: number;
    trend: 'improving' | 'declining' | 'stable';
  } {
    const cutoff = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
    const recentAttempts = maxAttempts
      .filter(a => a.timestamp >= cutoff)
      .sort((a, b) => a.timestamp - b.timestamp);

    const totalAttempts = recentAttempts.length;
    const successful = recentAttempts.filter(a => a.successful).length;
    const failed = totalAttempts - successful;
    const successRate = totalAttempts > 0 ? (successful / totalAttempts) * 100 : 0;

    // Determine trend from first half vs second half
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAttempts.length >= 6) {
      const midpoint = Math.floor(recentAttempts.length / 2);
      const firstHalf = recentAttempts.slice(0, midpoint);
      const secondHalf = recentAttempts.slice(midpoint);
      
      const firstRate = firstHalf.filter(a => a.successful).length / firstHalf.length;
      const secondRate = secondHalf.filter(a => a.successful).length / secondHalf.length;
      
      if (secondRate > firstRate + 0.15) trend = 'improving';
      else if (secondRate < firstRate - 0.15) trend = 'declining';
    }

    return {
      totalAttempts,
      successful,
      failed,
      successRate: Math.round(successRate),
      trend,
    };
  }

  /**
   * Get trainer notes for a user
   */
  static addTrainerNote(
    trainerId: string,
    userId: string,
    note: string,
    category: 'general' | 'form' | 'progression' | 'injury' | 'motivation'
  ): {
    id: string;
    trainerId: string;
    userId: string;
    note: string;
    category: string;
    timestamp: number;
  } {
    return {
      id: this.generateId(),
      trainerId,
      userId,
      note,
      category,
      timestamp: Date.now(),
    };
  }

  /**
   * Generate comprehensive trainer dashboard metrics
   */
  static generateDashboardMetrics(
    userId: string,
    sessions: WorkoutSession[],
    fourRepMaxes: FourRepMax[],
    maxAttempts: MaxTestingAttempt[],
    missedWorkouts: MissedWorkout[]
  ): TrainerDashboardMetrics {
    const protocolUsage = this.getProtocolUsageStats(sessions, 30);
    const flags = this.generateFlags(userId, fourRepMaxes, maxAttempts, missedWorkouts, sessions);

    // Recent activity
    const sortedSessions = sessions.sort((a, b) => b.startedAt - a.startedAt);
    const lastWorkout = sortedSessions[0]?.startedAt || 0;
    
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const monthSessions = sessions.filter(s => s.startedAt >= oneMonthAgo);
    const expectedSessions = 12; // ~3 per week
    const adherenceRate = (monthSessions.length / expectedSessions) * 100;

    // Consecutive missed
    const recent = [...sessions, ...missedWorkouts].sort((a, b) => {
      const aDate = 'startedAt' in a ? a.startedAt : a.timestamp;
      const bDate = 'startedAt' in b ? b.startedAt : b.timestamp;
      return bDate - aDate;
    });
    
    let consecutiveMissed = 0;
    for (const item of recent) {
      if ('reason' in item) consecutiveMissed++;
      else break;
    }

    // Strength progress
    const exerciseMaxes = new Map<string, FourRepMax[]>();
    fourRepMaxes.forEach(max => {
      if (!exerciseMaxes.has(max.exerciseId)) {
        exerciseMaxes.set(max.exerciseId, []);
      }
      exerciseMaxes.get(max.exerciseId)!.push(max);
    });

    let totalGain = 0;
    exerciseMaxes.forEach(maxes => {
      const sorted = maxes.sort((a, b) => a.dateAchieved - b.dateAchieved);
      if (sorted.length >= 2) {
        totalGain += sorted[sorted.length - 1].weight - sorted[0].weight;
      }
    });

    return {
      clientId: userId,
      protocolUsage,
      recentActivity: {
        lastWorkout,
        adherenceRate: Math.round(adherenceRate),
        consecutiveMissed,
      },
      strengthProgress: {
        exercisesTracked: exerciseMaxes.size,
        totalStrengthGain: totalGain,
        avgGainPercentage: totalGain > 0 ? Math.round((totalGain / exerciseMaxes.size) * 100) / 100 : 0,
      },
      flags,
      activeInjuries: 0, // Would come from injury holds
      rehabModeActive: false, // Would come from rehab state
    };
  }

  /**
   * Get protocol assignment recommendations
   */
  static recommendProtocolAssignment(
    exerciseName: string,
    isCompound: boolean,
    currentProtocol?: Protocol
  ): {
    recommended: Protocol;
    reasoning: string;
    alternatives: Protocol[];
  } {
    // Main compounds → P1
    const mainCompounds = ['bench press', 'squat', 'deadlift', 'overhead press'];
    if (mainCompounds.some(name => exerciseName.toLowerCase().includes(name))) {
      return {
        recommended: 'P1',
        reasoning: 'Main compound lift - ideal for max testing and strength development',
        alternatives: ['P2'],
      };
    }

    // Secondary compounds → P2
    if (isCompound) {
      return {
        recommended: 'P2',
        reasoning: 'Secondary compound - benefits from volume work',
        alternatives: ['P1', 'P3'],
      };
    }

    // Isolations → P3
    return {
      recommended: 'P3',
      reasoning: 'Isolation exercise - best with lighter, fatigue-managed approach',
      alternatives: ['P2'],
    };
  }

  /**
   * Utility: Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default TrainerService;
