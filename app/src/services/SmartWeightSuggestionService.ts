/**
 * Smart Weight Suggestion Service
 * 
 * Provides contextual weight recommendations based on:
 * - Recent workout performance trends
 * - Rest days between sessions
 * - Fatigue detection from consecutive failures
 * - Weight progression patterns
 * - Form safety checks
 */

import { EnhancedSetLog } from '../types/enhanced';
import { MaxAttemptHistory } from '../types/enhanced';

// Re-export for convenience
export { MaxAttemptHistory };

export interface WorkoutHistoryEntry {
  sessionId: string;
  exerciseId: string;
  completedAt: number;
  sets: EnhancedSetLog[];
  fourRepMax: number;
}

export interface WeightSuggestion {
  suggestedWeight: number;
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
  adjustmentFromBase: number;
  showFormCheckPrompt: boolean;
  formCheckMessage?: string;
  trendIndicator: 'increasing' | 'stable' | 'decreasing' | 'unknown';
}

export interface FatigueIndicators {
  consecutiveFailures: number;
  recentSuccessRate: number;
  isFatigued: boolean;
  recommendation: string;
}

export class SmartWeightSuggestionService {
  
  /**
   * Generate smart weight suggestion based on workout history and context
   */
  static generateSuggestion(
    exerciseId: string,
    baseWeight: number,
    currentOneRepMax: number,
    intensityPercentage: number,
    recentHistory: WorkoutHistoryEntry[],
    maxAttemptHistory: MaxAttemptHistory[]
  ): WeightSuggestion {
    
    const exerciseHistory = this.filterHistoryForExercise(recentHistory, exerciseId);
    const daysSinceLastWorkout = this.calculateDaysSinceLastWorkout(exerciseHistory);
    const performanceTrend = this.analyzePerformanceTrend(exerciseHistory, intensityPercentage);
    const fatigueIndicators = this.detectFatigue(maxAttemptHistory);
    const weightChangePercentage = this.calculateWeightChange(exerciseHistory, baseWeight);
    
    let adjustment = 0;
    let reasoning = '';
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    let showFormCheckPrompt = false;
    let formCheckMessage = undefined;
    
    // Priority 1: Check for fatigue (most important for safety)
    if (fatigueIndicators.isFatigued) {
      adjustment = -5;
      reasoning = `Fatigue detected: ${fatigueIndicators.consecutiveFailures} recent failures. Reducing weight for recovery.`;
      confidence = 'high';
    }
    // Priority 2: Adjust for rest days (recovery benefit)
    else if (daysSinceLastWorkout >= 7) {
      adjustment = +5;
      reasoning = `${daysSinceLastWorkout} days since last workout. Well-rested, suggesting +5 lbs.`;
      confidence = 'medium';
    }
    else if (daysSinceLastWorkout >= 4) {
      adjustment = +5;
      reasoning = `Good recovery period (${daysSinceLastWorkout} days). Ready for slight increase.`;
      confidence = 'medium';
    }
    // Priority 3: Performance trend analysis
    else if (performanceTrend.trend === 'improving' && performanceTrend.confidence > 0.7) {
      adjustment = +5;
      reasoning = `Strong recent performance. ${performanceTrend.detail}`;
      confidence = 'high';
    }
    else if (performanceTrend.trend === 'declining' && performanceTrend.confidence > 0.6) {
      adjustment = -5;
      reasoning = `Performance declining. ${performanceTrend.detail}`;
      confidence = 'medium';
    }
    else if (performanceTrend.trend === 'stable') {
      adjustment = 0;
      reasoning = 'Consistent performance. Maintaining current weight.';
      confidence = 'high';
    }
    else {
      adjustment = 0;
      reasoning = 'Insufficient data for adjustment. Using base calculation.';
      confidence = 'low';
    }
    
    const suggestedWeight = this.roundToNearestFive(baseWeight + adjustment);
    
    // Form check prompt if weight increases >10%
    if (weightChangePercentage > 10) {
      showFormCheckPrompt = true;
      formCheckMessage = `Weight increased ${weightChangePercentage.toFixed(0)}% from last session. Focus on maintaining proper form.`;
    }
    
    // Additional form check for large jumps from current suggestion
    if (Math.abs(adjustment) >= 10) {
      showFormCheckPrompt = true;
      formCheckMessage = `Significant weight change (${adjustment > 0 ? '+' : ''}${adjustment} lbs). Review form video before starting.`;
    }
    
    return {
      suggestedWeight,
      reasoning,
      confidence,
      adjustmentFromBase: adjustment,
      showFormCheckPrompt,
      formCheckMessage,
      trendIndicator: this.mapTrendToIndicator(performanceTrend.trend)
    };
  }
  
  /**
   * Analyze last 3 workouts for performance trends
   */
  private static analyzePerformanceTrend(
    history: WorkoutHistoryEntry[],
    targetIntensity: number
  ): { trend: 'improving' | 'declining' | 'stable' | 'unknown'; confidence: number; detail: string } {
    
    if (history.length < 2) {
      return { trend: 'unknown', confidence: 0, detail: 'Need more workout data' };
    }
    
    const recentThree = history.slice(0, 3);
    const relevantSets = this.extractRelevantSets(recentThree, targetIntensity);
    
    if (relevantSets.length < 3) {
      return { trend: 'unknown', confidence: 0.3, detail: 'Limited data at this intensity' };
    }
    
    // Calculate performance scores (higher is better)
    // Sets are in reverse chronological order (most recent first)
    const scores = relevantSets.map(set => {
      const targetRepsMin = typeof set.targetReps === 'object' && 'min' in set.targetReps
        ? set.targetReps.min
        : 1;
      const repsAboveTarget = set.reps - targetRepsMin;
      return repsAboveTarget;
    });
    
    // Reverse to get chronological order (oldest to newest) for trend analysis
    const chronologicalScores = [...scores].reverse();
    
    // Check for trend (comparing oldest to newest progression)
    let improvingCount = 0;
    let decliningCount = 0;
    
    for (let i = 1; i < chronologicalScores.length; i++) {
      if (chronologicalScores[i] > chronologicalScores[i - 1]) improvingCount++;
      if (chronologicalScores[i] < chronologicalScores[i - 1]) decliningCount++;
    }
    
    const totalComparisons = chronologicalScores.length - 1;
    
    if (improvingCount >= totalComparisons * 0.66) {
      return {
        trend: 'improving',
        confidence: improvingCount / totalComparisons,
        detail: `Exceeded target reps in ${improvingCount}/${totalComparisons} recent sessions`
      };
    }
    
    if (decliningCount >= totalComparisons * 0.66) {
      return {
        trend: 'declining',
        confidence: decliningCount / totalComparisons,
        detail: `Below target reps in ${decliningCount}/${totalComparisons} recent sessions`
      };
    }
    
    return {
      trend: 'stable',
      confidence: 0.8,
      detail: 'Consistent performance across recent sessions'
    };
  }
  
  /**
   * Detect fatigue from consecutive failures
   */
  static detectFatigue(maxAttemptHistory: MaxAttemptHistory[]): FatigueIndicators {
    if (maxAttemptHistory.length === 0) {
      return {
        consecutiveFailures: 0,
        recentSuccessRate: 1.0,
        isFatigued: false,
        recommendation: 'No fatigue detected'
      };
    }
    
    // Sort by most recent first
    const sortedHistory = [...maxAttemptHistory].sort((a, b) => b.attemptedAt - a.attemptedAt);
    const recentFive = sortedHistory.slice(0, 5);
    
    // Count consecutive failures from most recent
    let consecutiveFailures = 0;
    for (const attempt of recentFive) {
      if (!attempt.successful) {
        consecutiveFailures++;
      } else {
        break;
      }
    }
    
    // Calculate recent success rate
    const successfulAttempts = recentFive.filter(a => a.successful).length;
    const recentSuccessRate = successfulAttempts / recentFive.length;
    
    // Determine if fatigued
    const isFatigued = consecutiveFailures >= 2 || recentSuccessRate < 0.4;
    
    let recommendation = 'Continue as planned';
    if (consecutiveFailures >= 3) {
      recommendation = 'Consider a deload week or reduce intensity by 10%';
    } else if (consecutiveFailures >= 2) {
      recommendation = 'Reduce weight by 5-10 lbs and focus on form';
    } else if (recentSuccessRate < 0.4) {
      recommendation = 'Low success rate detected. Review training plan and recovery';
    }
    
    return {
      consecutiveFailures,
      recentSuccessRate,
      isFatigued,
      recommendation
    };
  }
  
  /**
   * Calculate days since last workout for this exercise
   */
  private static calculateDaysSinceLastWorkout(history: WorkoutHistoryEntry[]): number {
    if (history.length === 0) return 0;
    
    const lastWorkout = history[0];
    const now = Date.now();
    const daysSince = Math.floor((now - lastWorkout.completedAt) / (1000 * 60 * 60 * 24));
    
    return daysSince;
  }
  
  /**
   * Calculate weight change percentage from last session
   */
  private static calculateWeightChange(
    history: WorkoutHistoryEntry[],
    currentWeight: number
  ): number {
    if (history.length === 0) return 0;
    
    const lastWorkout = history[0];
    const lastWeights = lastWorkout.sets.map(s => s.weight);
    
    if (lastWeights.length === 0) return 0;
    
    const avgLastWeight = lastWeights.reduce((sum, w) => sum + w, 0) / lastWeights.length;
    
    if (avgLastWeight === 0) return 0;
    
    return ((currentWeight - avgLastWeight) / avgLastWeight) * 100;
  }
  
  /**
   * Filter workout history for specific exercise
   */
  private static filterHistoryForExercise(
    history: WorkoutHistoryEntry[],
    exerciseId: string
  ): WorkoutHistoryEntry[] {
    return history
      .filter(entry => entry.exerciseId === exerciseId)
      .sort((a, b) => b.completedAt - a.completedAt);
  }
  
  /**
   * Extract sets at similar intensity levels
   */
  private static extractRelevantSets(
    history: WorkoutHistoryEntry[],
    targetIntensity: number
  ): EnhancedSetLog[] {
    const relevantSets: EnhancedSetLog[] = [];
    const intensityTolerance = 0.1; // ±10% intensity
    
    for (const workout of history) {
      for (const set of workout.sets) {
        if (
          set.intensityPercentage &&
          Math.abs(set.intensityPercentage - targetIntensity) <= intensityTolerance
        ) {
          relevantSets.push(set as EnhancedSetLog);
        }
      }
    }
    
    return relevantSets;
  }
  
  /**
   * Round weight to nearest 5 lbs
   */
  private static roundToNearestFive(weight: number): number {
    return Math.round(weight / 5) * 5;
  }
  
  /**
   * Map trend string to indicator
   */
  private static mapTrendToIndicator(
    trend: 'improving' | 'declining' | 'stable' | 'unknown'
  ): 'increasing' | 'stable' | 'decreasing' | 'unknown' {
    switch (trend) {
      case 'improving': return 'increasing';
      case 'declining': return 'decreasing';
      case 'stable': return 'stable';
      default: return 'unknown';
    }
  }
  
  /**
   * Generate suggestion summary for UI display
   */
  static generateSuggestionSummary(suggestion: WeightSuggestion): string {
    const confidenceEmoji = {
      high: '✓',
      medium: '~',
      low: '?'
    };
    
    const trendEmoji = {
      increasing: '📈',
      stable: '➡️',
      decreasing: '📉',
      unknown: '❓'
    };
    
    return `${confidenceEmoji[suggestion.confidence]} ${trendEmoji[suggestion.trendIndicator]} ${suggestion.reasoning}`;
  }
}

export default SmartWeightSuggestionService;
