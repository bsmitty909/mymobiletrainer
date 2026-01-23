/**
 * RepOutInterpreterService
 * 
 * Analyzes rep-out performance from P2/P3 protocols and generates readiness signals.
 * 
 * Rep Band Classification per PRD:
 * - 1-4 reps: Too heavy
 * - 5-6 reps: Overloaded/fatigued
 * - 7-9 reps: Ideal range
 * - 10-12 reps: Strength reserve
 * - 13-15 reps: Load light but acceptable
 * 
 * Key Rule: Rep-outs do NOT auto-increase 4RM
 * They only signal readiness for future P1 testing
 */

import {
  RepBandAnalysis,
  RepBand,
  ReadinessSignal,
  SafetyGuard,
  SetLog,
  FourRepMax,
} from '../types';
import { REP_BANDS } from './ProtocolDefinitions';
import FourRepMaxService from './FourRepMaxService';

export class RepOutInterpreterService {
  /**
   * Analyze rep-out performance and classify into rep band
   */
  static analyzeRepBand(reps: number): RepBandAnalysis {
    if (reps >= REP_BANDS.tooHeavy.min && reps <= REP_BANDS.tooHeavy.max) {
      return {
        reps,
        band: 'too_heavy',
        meaning: 'Weight is too heavy - you are in strength territory, not hypertrophy',
        actionRequired: true,
      };
    }

    if (reps >= REP_BANDS.overloaded.min && reps <= REP_BANDS.overloaded.max) {
      return {
        reps,
        band: 'overloaded',
        meaning: 'Fatigued or overloaded - monitor recovery closely',
        actionRequired: false,
      };
    }

    if (reps >= REP_BANDS.ideal.min && reps <= REP_BANDS.ideal.max) {
      return {
        reps,
        band: 'ideal',
        meaning: 'Perfect hypertrophy range - keep this up!',
        actionRequired: false,
      };
    }

    if (reps >= REP_BANDS.reserve.min && reps <= REP_BANDS.reserve.max) {
      return {
        reps,
        band: 'reserve',
        meaning: 'You have strength reserve - may be ready for P1 testing soon',
        actionRequired: false,
      };
    }

    // 13-15 reps (or more)
    return {
      reps,
      band: 'light',
      meaning: 'Load is light but acceptable - consider P1 testing to establish new max',
      actionRequired: false,
    };
  }

  /**
   * Generate readiness signal for P1 testing
   * Based on recent P2/P3 rep-out performance
   */
  static generateReadinessSignal(
    exerciseId: string,
    recentRepOuts: Array<{ reps: number; weight: number; date: number }>,
    currentFourRepMax: FourRepMax,
    minSessions: number = 3
  ): ReadinessSignal {
    if (recentRepOuts.length < minSessions) {
      return {
        exerciseId,
        readyForP1: false,
        confidence: 0,
        reasoning: [`Need at least ${minSessions} P2/P3 sessions to assess readiness`],
      };
    }

    const reasoning: string[] = [];
    let readinessScore = 0;

    // Factor 1: Average reps in recent sessions
    const avgReps = recentRepOuts.reduce((sum, r) => sum + r.reps, 0) / recentRepOuts.length;
    const repAnalysis = this.analyzeRepBand(Math.round(avgReps));

    if (repAnalysis.band === 'reserve' || repAnalysis.band === 'light') {
      readinessScore += 0.5;
      reasoning.push(`Average ${Math.round(avgReps)} reps indicates strength reserve`);
    } else if (repAnalysis.band === 'ideal') {
      readinessScore += 0.2;
      reasoning.push(`Average ${Math.round(avgReps)} reps in ideal range - continue building`);
    } else if (repAnalysis.band === 'overloaded' || repAnalysis.band === 'too_heavy') {
      readinessScore -= 0.2;
      reasoning.push(`Average ${Math.round(avgReps)} reps suggests overload - not ready yet`);
    }

    // Factor 2: Consistency of performance
    const repVariance = this.calculateStandardDeviation(recentRepOuts.map(r => r.reps));
    if (repVariance < 2) {
      readinessScore += 0.3;
      reasoning.push('Highly consistent performance across sessions');
    } else if (repVariance < 3) {
      readinessScore += 0.15;
      reasoning.push('Good consistency in rep performance');
    }

    // Factor 3: Trend (improving or declining)
    const trend = this.analyzeTrend(recentRepOuts.map(r => r.reps));
    if (trend === 'improving') {
      readinessScore += 0.2;
      reasoning.push('Rep performance trending upward');
    } else if (trend === 'declining') {
      readinessScore -= 0.3;
      reasoning.push('Performance declining - focus on recovery');
    }

    // Factor 4: Any session hitting 13+ reps
    const hasHighReps = recentRepOuts.some(r => r.reps >= 13);
    if (hasHighReps) {
      readinessScore += 0.2;
      reasoning.push('Multiple sets reaching 13+ reps - load is likely too light');
    }

    // Final determination
    const isReady = readinessScore >= 0.6;
    const confidence = Math.max(0, Math.min(1, readinessScore));

    if (isReady) {
      reasoning.push('✅ Ready to schedule P1 testing');
      
      // Suggest date (1 week from now to allow for scheduling)
      const recommendedP1Date = Date.now() + (7 * 24 * 60 * 60 * 1000);
      
      return {
        exerciseId,
        readyForP1: true,
        confidence: Math.round(confidence * 100) / 100,
        reasoning,
        recommendedP1Date,
      };
    } else {
      reasoning.push('Continue P2/P3 work until consistently hitting 10+ reps');
      
      return {
        exerciseId,
        readyForP1: false,
        confidence: Math.round(confidence * 100) / 100,
        reasoning,
      };
    }
  }

  /**
   * Detect safety concerns from rep-out performance
   * Returns safety guards that need to be triggered
   */
  static detectSafetyGuards(
    currentReps: number,
    previousReps: number | null,
    exerciseId: string
  ): SafetyGuard | null {
    // 30% rep drop detection
    if (previousReps && currentReps < previousReps * 0.7) {
      const dropPercentage = Math.round(((previousReps - currentReps) / previousReps) * 100);
      
      return {
        type: 'rep_drop',
        severity: 'warning',
        message: `${dropPercentage}% rep drop detected (${previousReps} → ${currentReps} reps)`,
        actionTaken: 'Auto-reducing load by 10% for next session',
      };
    }

    // Too heavy - form concern
    if (currentReps <= 4) {
      return {
        type: 'form_concern',
        severity: 'warning',
        message: 'Only 1-4 reps completed - weight may be too heavy for rep-out protocol',
        actionTaken: 'Consider reducing weight by 5-10% to hit optimal rep range (7-9)',
      };
    }

    return null;
  }

  /**
   * Detect multiple failures pattern
   * Suppresses progression if user consistently underperforms
   */
  static detectMultipleFailures(
    recentSets: SetLog[],
    failureThreshold: number = 3
  ): SafetyGuard | null {
    // Define failure as hitting less than 7 reps on rep-out
    const failures = recentSets.filter(set => set.reps < 7);

    if (failures.length >= failureThreshold) {
      return {
        type: 'multiple_failures',
        severity: 'critical',
        message: `${failures.length} consecutive sets below optimal range`,
        actionTaken: 'Suppressing progression. Reduce loads by 10% and focus on recovery.',
      };
    }

    return null;
  }

  /**
   * Detect overtraining from P2/P3 performance decline
   */
  static detectOvertraining(
    recentSessions: Array<{ avgReps: number; date: number }>,
    minSessions: number = 4
  ): SafetyGuard | null {
    if (recentSessions.length < minSessions) {
      return null;
    }

    // Check if performance is consistently declining
    const trend = this.analyzeTrend(recentSessions.map(s => s.avgReps));
    
    if (trend === 'declining') {
      const firstAvg = recentSessions[0].avgReps;
      const lastAvg = recentSessions[recentSessions.length - 1].avgReps;
      const decline = ((firstAvg - lastAvg) / firstAvg) * 100;

      if (decline > 15) {
        return {
          type: 'overtraining',
          severity: 'critical',
          message: `${Math.round(decline)}% performance decline over ${recentSessions.length} sessions`,
          actionTaken: 'Deload week recommended. Reduce volume and/or intensity by 30-40%.',
        };
      }
    }

    return null;
  }

  /**
   * Get comprehensive rep-out feedback for user
   */
  static getRepOutFeedback(
    reps: number,
    previousReps: number | null
  ): {
    band: RepBand;
    emoji: string;
    color: string;
    message: string;
    recommendation: string;
  } {
    const analysis = this.analyzeRepBand(reps);
    
    const feedback = {
      too_heavy: {
        emoji: '🔴',
        color: '#f44336',
        message: `${reps} reps - Too Heavy`,
        recommendation: 'Reduce weight by 5-10% next time. Aim for 7-9 reps for optimal muscle growth.',
      },
      overloaded: {
        emoji: '🟠',
        color: '#FF9800',
        message: `${reps} reps - Overloaded`,
        recommendation: 'You may be fatigued. Ensure adequate rest and nutrition.',
      },
      ideal: {
        emoji: '🟢',
        color: '#4CAF50',
        message: `${reps} reps - Ideal Range!`,
        recommendation: 'Perfect! This is the sweet spot for muscle growth. Maintain this weight.',
      },
      reserve: {
        emoji: '🔵',
        color: '#2196F3',
        message: `${reps} reps - Strength Reserve`,
        recommendation: 'You have strength to spare. Consider P1 testing to establish a new max.',
      },
      light: {
        emoji: '🟣',
        color: '#9C27B0',
        message: `${reps} reps - Load is Light`,
        recommendation: 'Time to test! Schedule P1 max testing to increase your working weights.',
      },
    };

    return {
      band: analysis.band,
      ...feedback[analysis.band],
    };
  }

  /**
   * Calculate trend from series of values
   */
  private static analyzeTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 3) return 'stable';

    // Simple linear regression slope
    const n = values.length;
    const xMean = (n - 1) / 2; // 0, 1, 2, ... n-1
    const yMean = values.reduce((sum, v) => sum + v, 0) / n;

    let numerator = 0;
    let denominator = 0;

    values.forEach((y, x) => {
      numerator += (x - xMean) * (y - yMean);
      denominator += Math.pow(x - xMean, 2);
    });

    const slope = denominator !== 0 ? numerator / denominator : 0;

    // Positive slope = improving, negative = declining
    if (slope > 0.5) return 'improving';
    if (slope < -0.5) return 'declining';
    return 'stable';
  }

  /**
   * Calculate standard deviation for consistency analysis
   */
  private static calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;

    return Math.sqrt(variance);
  }

  /**
   * Get all active safety guards for a session
   * Aggregates multiple safety concerns
   */
  static getSessionSafetyGuards(
    currentSets: SetLog[],
    previousSets: SetLog[],
    exerciseId: string
  ): SafetyGuard[] {
    const guards: SafetyGuard[] = [];

    // Check for rep drop
    if (currentSets.length > 0 && previousSets.length > 0) {
      const currentAvg = currentSets.reduce((sum, s) => sum + s.reps, 0) / currentSets.length;
      const previousAvg = previousSets.reduce((sum, s) => sum + s.reps, 0) / previousSets.length;
      
      const dropGuard = this.detectSafetyGuards(currentAvg, previousAvg, exerciseId);
      if (dropGuard) {
        guards.push(dropGuard);
      }
    }

    // Check for multiple failures
    const failureGuard = this.detectMultipleFailures(currentSets);
    if (failureGuard) {
      guards.push(failureGuard);
    }

    // Check for overtraining pattern
    // Would need more historical data in real implementation

    return guards;
  }

  /**
   * Generate readiness summary for all exercises
   */
  static generateReadinessSummary(
    exerciseRepOuts: Record<string, Array<{ reps: number; weight: number; date: number }>>,
    fourRepMaxes: Record<string, FourRepMax>
  ): ReadinessSignal[] {
    const signals: ReadinessSignal[] = [];

    Object.entries(exerciseRepOuts).forEach(([exerciseId, repOuts]) => {
      const fourRepMax = fourRepMaxes[exerciseId];
      if (!fourRepMax) return; // Skip if no max established

      const signal = this.generateReadinessSignal(
        exerciseId,
        repOuts,
        fourRepMax
      );
      signals.push(signal);
    });

    return signals;
  }

  /**
   * Check if P1 testing should be recommended to user
   * Returns exercises that are ready for testing
   */
  static getP1TestingRecommendations(
    readinessSignals: ReadinessSignal[],
    confidenceThreshold: number = 0.6
  ): Array<{
    exerciseId: string;
    confidence: number;
    reasoning: string[];
    priority: 'high' | 'medium' | 'low';
  }> {
    return readinessSignals
      .filter(signal => signal.readyForP1 && signal.confidence >= confidenceThreshold)
      .map(signal => {
        let priority: 'high' | 'medium' | 'low' = 'medium';
        
        if (signal.confidence >= 0.8) {
          priority = 'high';
        } else if (signal.confidence < 0.7) {
          priority = 'low';
        }

        return {
          exerciseId: signal.exerciseId,
          confidence: signal.confidence,
          reasoning: signal.reasoning,
          priority,
        };
      })
      .sort((a, b) => b.confidence - a.confidence); // Highest confidence first
  }

  /**
   * Validate rep-out cap enforcement
   * Typical cap: 10-15 reps (exercise-dependent)
   */
  static validateRepOutCap(
    reps: number,
    exerciseType: 'compound' | 'isolation'
  ): {
    valid: boolean;
    warning?: string;
  } {
    const cap = exerciseType === 'compound' ? 15 : 20;

    if (reps > cap) {
      return {
        valid: false,
        warning: `Rep count (${reps}) exceeds typical cap (${cap}). Verify form wasn't compromised.`,
      };
    }

    return { valid: true };
  }

  /**
   * Get performance summary for P2/P3 workout
   */
  static getP2P3Summary(
    sets: SetLog[]
  ): {
    totalSets: number;
    avgReps: number;
    repRange: { min: number; max: number };
    dominantBand: RepBand;
    overallFeedback: string;
  } {
    const totalSets = sets.length;
    const allReps = sets.map(s => s.reps);
    const avgReps = allReps.reduce((sum, r) => sum + r, 0) / allReps.length;
    const minReps = Math.min(...allReps);
    const maxReps = Math.max(...allReps);

    // Determine dominant rep band
    const bandCounts: Record<RepBand, number> = {
      too_heavy: 0,
      overloaded: 0,
      ideal: 0,
      reserve: 0,
      light: 0,
    };

    allReps.forEach(reps => {
      const analysis = this.analyzeRepBand(reps);
      bandCounts[analysis.band]++;
    });

    const dominantBand = (Object.entries(bandCounts).reduce((max, [band, count]) =>
      count > max.count ? { band: band as RepBand, count } : max
    , { band: 'ideal' as RepBand, count: 0 })).band;

    let overallFeedback = '';
    if (dominantBand === 'ideal') {
      overallFeedback = '🟢 Excellent session - all sets in ideal range!';
    } else if (dominantBand === 'reserve' || dominantBand === 'light') {
      overallFeedback = '🔵 Strong session - consider P1 testing soon';
    } else if (dominantBand === 'overloaded') {
      overallFeedback = '🟠 Challenging session - ensure adequate recovery';
    } else {
      overallFeedback = '🔴 Weight may be too heavy - reduce for next session';
    }

    return {
      totalSets,
      avgReps: Math.round(avgReps * 10) / 10,
      repRange: { min: minReps, max: maxReps },
      dominantBand,
      overallFeedback,
    };
  }

  /**
   * Generate insights for user from rep-out history
   */
  static generateInsights(
    exerciseId: string,
    repHistory: Array<{ reps: number; date: number }>,
    exerciseName: string
  ): string[] {
    const insights: string[] = [];

    if (repHistory.length < 3) {
      insights.push(`Build more history with ${exerciseName} to get personalized insights`);
      return insights;
    }

    const recentReps = repHistory.slice(-5).map(r => r.reps);
    const avgReps = recentReps.reduce((sum, r) => sum + r, 0) / recentReps.length;
    const trend = this.analyzeTrend(recentReps);

    // Trend insights
    if (trend === 'improving') {
      insights.push(`📈 Your ${exerciseName} rep performance is improving - strength gains detected`);
    } else if (trend === 'declining') {
      insights.push(`📉 Your ${exerciseName} reps are declining - check recovery and consider deload`);
    }

    // Readiness insights
    if (avgReps >= 12) {
      insights.push(`💪 Averaging ${Math.round(avgReps)} reps - you're ready for P1 testing on ${exerciseName}`);
    } else if (avgReps >= 9) {
      insights.push(`✅ Solid ${Math.round(avgReps)} rep average - continue building strength`);
    } else if (avgReps <= 6) {
      insights.push(`⚠️ Only averaging ${Math.round(avgReps)} reps - weight may be too heavy`);
    }

    // Consistency insights
    const consistency = this.calculateStandardDeviation(recentReps);
    if (consistency < 1.5) {
      insights.push(`🎯 Highly consistent performance - ${exerciseName} technique is locked in`);
    } else if (consistency > 3) {
      insights.push(`⚡ Variable performance - focus on consistent technique and recovery`);
    }

    return insights;
  }

  /**
   * Utility: Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default RepOutInterpreterService;
