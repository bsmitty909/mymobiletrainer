/**
 * ProtocolAnalyticsService
 *
 * Tracks protocol usage patterns, success rates, and performance metrics.
 * Provides comprehensive analytics for the protocol system (P1/P2/P3).
 */

import {
  FourRepMax,
  MaxTestingAttempt,
  WorkoutSession,
  Protocol,
} from '../types';

// Protocol tracking entry
export interface ProtocolTrackingEntry {
  exerciseId: string;
  protocol: Protocol;
  completedAt: number;
  reps?: number;
  weight?: number;
}

export interface ProtocolUsageReport {
  userId: string;
  period: {
    start: number;
    end: number;
    days: number;
  };
  protocolDistribution: {
    p1Sessions: number;
    p2Sessions: number;
    p3Sessions: number;
    totalProtocolSessions: number;
  };
  p1TestingStats: {
    totalTests: number;
    successRate: number;
    avgGainPerTest: number;
    testsPerMonth: number;
  };
  repOutPerformance: {
    avgRepsP2: number;
    avgRepsP3: number;
    idealRangePercentage: number;
  };
}

export class ProtocolAnalyticsService {
  /**
   * Generate comprehensive protocol usage report
   */
  static generateUsageReport(
    userId: string,
    protocolTracking: ProtocolTrackingEntry[],
    maxAttempts: MaxTestingAttempt[],
    fourRepMaxes: FourRepMax[],
    periodDays: number = 90
  ): ProtocolUsageReport {
    const periodStart = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
    const periodEnd = Date.now();

    // Protocol distribution
    const periodTracking = protocolTracking.filter(e => e.completedAt >= periodStart);
    const p1Sessions = periodTracking.filter(e => e.protocol === 'P1').length;
    const p2Sessions = periodTracking.filter(e => e.protocol === 'P2').length;
    const p3Sessions = periodTracking.filter(e => e.protocol === 'P3').length;

    // P1 testing stats
    const periodAttempts = maxAttempts.filter(a => a.timestamp >= periodStart);
    const successfulAttempts = periodAttempts.filter(a => a.successful);
    const successRate = periodAttempts.length > 0 
      ? (successfulAttempts.length / periodAttempts.length) * 100 
      : 0;

    // Calculate average gain per test
    const periodMaxes = fourRepMaxes
      .filter(m => m.dateAchieved >= periodStart)
      .sort((a, b) => a.dateAchieved - b.dateAchieved);
    
    let totalGain = 0;
    const exerciseGains = new Map<string, number>();
    
    periodMaxes.forEach(max => {
      const older = fourRepMaxes
        .filter(m => m.exerciseId === max.exerciseId && m.dateAchieved < max.dateAchieved)
        .sort((a, b) => b.dateAchieved - a.dateAchieved)[0];
      
      if (older) {
        const gain = max.weight - older.weight;
        exerciseGains.set(max.exerciseId, gain);
        totalGain += gain;
      }
    });

    const avgGainPerTest = exerciseGains.size > 0 ? totalGain / exerciseGains.size : 0;
    const testsPerMonth = (periodAttempts.length / periodDays) * 30;

    return {
      userId,
      period: {
        start: periodStart,
        end: periodEnd,
        days: periodDays,
      },
      protocolDistribution: {
        p1Sessions,
        p2Sessions,
        p3Sessions,
        totalProtocolSessions: p1Sessions + p2Sessions + p3Sessions,
      },
      p1TestingStats: {
        totalTests: periodAttempts.length,
        successRate: Math.round(successRate),
        avgGainPerTest: Math.round(avgGainPerTest * 10) / 10,
        testsPerMonth: Math.round(testsPerMonth * 10) / 10,
      },
      repOutPerformance: {
        avgRepsP2: 0, // Would calculate from actual rep-out data
        avgRepsP3: 0,
        idealRangePercentage: 0,
      },
    };
  }

  /**
   * Generate trainer monthly report
   */
  static generateTrainerMonthlyReport(
    userId: string,
    month: number,
    year: number,
    sessions: WorkoutSession[],
    fourRepMaxes: FourRepMax[],
    maxAttempts: MaxTestingAttempt[]
  ): {
    month: string;
    summary: {
      totalSessions: number;
      adherenceRate: number;
    };
    progress: {
      newPRs: number;
      totalStrengthGain: number;
      p1SuccessRate: number;
    };
    concerns: string[];
    recommendations: string[];
  } {
    const monthStart = new Date(year, month, 1).getTime();
    const monthEnd = new Date(year, month + 1, 0).getTime();

    const monthSessions = sessions.filter(
      s => s.startedAt >= monthStart && s.startedAt <= monthEnd
    );

    const monthAttempts = maxAttempts.filter(
      a => a.timestamp >= monthStart && a.timestamp <= monthEnd
    );

    const monthMaxes = fourRepMaxes.filter(
      m => m.dateAchieved >= monthStart && m.dateAchieved <= monthEnd
    );

    const concerns: string[] = [];
    const recommendations: string[] = [];

    // Calculate success rate
    const successfulAttempts = monthAttempts.filter(a => a.successful).length;
    const p1SuccessRate = monthAttempts.length > 0 
      ? (successfulAttempts / monthAttempts.length) * 100 
      : 0;

    // Flag low success rate
    if (p1SuccessRate < 50 && monthAttempts.length >= 3) {
      concerns.push('Low P1 success rate - may need deload or reduced testing frequency');
    }

    // Flag low adherence
    const expectedSessions = 12; // ~3 per week
    const adherenceRate = (monthSessions.length / expectedSessions) * 100;
    
    if (adherenceRate < 70) {
      concerns.push('Low adherence rate - address barriers to consistency');
      recommendations.push('Review schedule and identify obstacles');
    }

    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      month: monthName,
      summary: {
        totalSessions: monthSessions.length,
        adherenceRate: Math.round(adherenceRate),
      },
      progress: {
        newPRs: monthMaxes.length,
        totalStrengthGain: 0, // Would calculate from maxes
        p1SuccessRate: Math.round(p1SuccessRate),
      },
      concerns,
      recommendations,
    };
  }

  /**
   * Export protocol data for analysis
   */
  static exportProtocolData(
    userId: string,
    fourRepMaxes: FourRepMax[],
    maxAttempts: MaxTestingAttempt[],
    protocolTracking: ProtocolTrackingEntry[]
  ): {
    exportDate: number;
    userId: string;
    data: {
      fourRepMaxHistory: FourRepMax[];
      p1TestingHistory: MaxTestingAttempt[];
      protocolUsageHistory: ProtocolTrackingEntry[];
    };
    summary: {
      totalP1Tests: number;
      total4RMs: number;
      protocolSessionCount: number;
    };
  } {
    return {
      exportDate: Date.now(),
      userId,
      data: {
        fourRepMaxHistory: fourRepMaxes,
        p1TestingHistory: maxAttempts,
        protocolUsageHistory: protocolTracking,
      },
      summary: {
        totalP1Tests: maxAttempts.length,
        total4RMs: fourRepMaxes.length,
        protocolSessionCount: protocolTracking.length,
      },
    };
  }
}

export default ProtocolAnalyticsService;
