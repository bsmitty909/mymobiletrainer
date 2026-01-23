/**
 * ProtocolMilestoneService
 * 
 * Tracks protocol-specific achievements separate from formula mode achievements.
 * Manages P1 testing milestones, rep-out performance, and recovery milestones.
 */

import {
  FourRepMax,
  MaxTestingAttempt,
  RehabSession,
} from '../types';

export interface ProtocolMilestone {
  id: string;
  userId: string;
  type: 'p1_success' | 'rehab_complete' | 'strength_recovered' | 'rep_out_master' | 'protocol_consistent';
  exerciseId?: string;
  value: number;
  achievedAt: number;
  metadata?: any;
}

export class ProtocolMilestoneService {
  /**
   * Check for P1 testing milestones
   */
  static checkP1Milestones(
    userId: string,
    attempts: MaxTestingAttempt[],
    newFourRepMax: FourRepMax
  ): ProtocolMilestone[] {
    const milestones: ProtocolMilestone[] = [];

    // First P1 success
    const successfulAttempts = attempts.filter(a => a.successful && a.userId === userId);
    if (successfulAttempts.length === 1) {
      milestones.push({
        id: this.generateId(),
        userId,
        type: 'p1_success',
        exerciseId: newFourRepMax.exerciseId,
        value: 1,
        achievedAt: Date.now(),
        metadata: { firstP1: true },
      });
    }

    // 5 P1 PRs
    if (successfulAttempts.length === 5) {
      milestones.push({
        id: this.generateId(),
        userId,
        type: 'p1_success',
        value: 5,
        achievedAt: Date.now(),
        metadata: { milestone: '5_prs' },
      });
    }

    // 10 P1 PRs
    if (successfulAttempts.length === 10) {
      milestones.push({
        id: this.generateId(),
        userId,
        type: 'p1_success',
        value: 10,
        achievedAt: Date.now(),
        metadata: { milestone: '10_prs' },
      });
    }

    return milestones;
  }

  /**
   * Check for rehab completion milestones
   */
  static checkRehabMilestones(
    userId: string,
    rehabSessions: RehabSession[],
    exerciseId: string,
    currentWeight: number,
    preInjuryMax: number
  ): ProtocolMilestone[] {
    const milestones: ProtocolMilestone[] = [];

    const recoveryPercentage = (currentWeight / preInjuryMax) * 100;

    // Rehab completed (reached 95%+)
    if (recoveryPercentage >= 95) {
      const exerciseSessions = rehabSessions.filter(s => s.exerciseId === exerciseId);
      if (exerciseSessions.length >= 6) {
        milestones.push({
          id: this.generateId(),
          userId,
          type: 'rehab_complete',
          exerciseId,
          value: exerciseSessions.length,
          achievedAt: Date.now(),
          metadata: {
            recoveryPercentage,
            sessionsCompleted: exerciseSessions.length,
          },
        });
      }
    }

    // Full strength recovered (100%+)
    if (recoveryPercentage >= 100) {
      milestones.push({
        id: this.generateId(),
        userId,
        type: 'strength_recovered',
        exerciseId,
        value: Math.round(recoveryPercentage),
        achievedAt: Date.now(),
        metadata: {
          preInjuryMax,
          recoveredTo: currentWeight,
        },
      });
    }

    return milestones;
  }

  /**
   * Check for rep-out performance milestones
   */
  static checkRepOutMilestones(
    userId: string,
    idealRangeCount: number
  ): ProtocolMilestone[] {
    const milestones: ProtocolMilestone[] = [];

    // 25 sets in ideal range (7-9 reps)
    if (idealRangeCount === 25) {
      milestones.push({
        id: this.generateId(),
        userId,
        type: 'rep_out_master',
        value: 25,
        achievedAt: Date.now(),
        metadata: { idealRangeSets: 25 },
      });
    }

    // 50 sets in ideal range
    if (idealRangeCount === 50) {
      milestones.push({
        id: this.generateId(),
        userId,
        type: 'rep_out_master',
        value: 50,
        achievedAt: Date.now(),
        metadata: { idealRangeSets: 50 },
      });
    }

    return milestones;
  }

  /**
   * Check for protocol consistency milestones
   */
  static checkProtocolConsistency(
    userId: string,
    protocolWorkoutCount: number
  ): ProtocolMilestone[] {
    const milestones: ProtocolMilestone[] = [];

    // 10 protocol workouts
    if (protocolWorkoutCount === 10) {
      milestones.push({
        id: this.generateId(),
        userId,
        type: 'protocol_consistent',
        value: 10,
        achievedAt: Date.now(),
        metadata: { protocolWorkouts: 10 },
      });
    }

    // 25 protocol workouts
    if (protocolWorkoutCount === 25) {
      milestones.push({
        id: this.generateId(),
        userId,
        type: 'protocol_consistent',
        value: 25,
        achievedAt: Date.now(),
        metadata: { protocolWorkouts: 25 },
      });
    }

    // 50 protocol workouts
    if (protocolWorkoutCount === 50) {
      milestones.push({
        id: this.generateId(),
        userId,
        type: 'protocol_consistent',
        value: 50,
        achievedAt: Date.now(),
        metadata: { protocolWorkouts: 50 },
      });
    }

    return milestones;
  }

  /**
   * Get milestone summary for user profile
   */
  static getMilestoneSummary(
    milestones: ProtocolMilestone[]
  ): {
    totalMilestones: number;
    byType: Record<string, number>;
    recentMilestones: ProtocolMilestone[];
  } {
    const byType: Record<string, number> = {};
    
    milestones.forEach(m => {
      byType[m.type] = (byType[m.type] || 0) + 1;
    });

    const recentMilestones = milestones
      .sort((a, b) => b.achievedAt - a.achievedAt)
      .slice(0, 5);

    return {
      totalMilestones: milestones.length,
      byType,
      recentMilestones,
    };
  }

  /**
   * Utility: Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default ProtocolMilestoneService;
