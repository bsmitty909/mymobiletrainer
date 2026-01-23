/**
 * Form Check Service
 *
 * Tracks workout performance to determine when form check prompts should be shown.
 * Monitors consecutive failures and significant weight increases to prevent injury
 * and ensure proper technique.
 *
 * Phase 4.4 - Form & Technique Integration
 */

export interface FormCheckTrigger {
  shouldPrompt: boolean;
  reason: 'consecutive_failures' | 'large_weight_increase' | 'none';
  details: string;
  severity: 'warning' | 'critical' | 'none';
}

export interface ExercisePerformanceHistory {
  exerciseId: string;
  recentSets: {
    weight: number;
    targetReps: number;
    completedReps: number;
    timestamp: number;
    success: boolean;
  }[];
  consecutiveFailures: number;
  lastSuccessfulWeight: number;
  lastAttemptedWeight: number;
}

class FormCheckService {
  private performanceHistory: Map<string, ExercisePerformanceHistory> = new Map();

  /**
   * Track a completed set for form check analysis
   */
  trackSetCompletion(
    exerciseId: string,
    weight: number,
    targetReps: number,
    completedReps: number,
    timestamp: number = Date.now()
  ): void {
    const history = this.getOrCreateHistory(exerciseId);
    const success = completedReps >= targetReps;

    history.recentSets.push({
      weight,
      targetReps,
      completedReps,
      timestamp,
      success,
    });

    // Keep only last 10 sets
    if (history.recentSets.length > 10) {
      history.recentSets.shift();
    }

    // Update consecutive failures counter
    if (success) {
      history.consecutiveFailures = 0;
      history.lastSuccessfulWeight = weight;
    } else {
      history.consecutiveFailures++;
    }

    history.lastAttemptedWeight = weight;
  }

  /**
   * Check if a form check prompt should be shown based on performance
   */
  checkFormPrompt(
    exerciseId: string,
    currentWeight: number,
    previousWeight?: number
  ): FormCheckTrigger {
    const history = this.getOrCreateHistory(exerciseId);

    // Check for consecutive failures (3+ failures)
    if (history.consecutiveFailures >= 3) {
      return {
        shouldPrompt: true,
        reason: 'consecutive_failures',
        details: `You've failed ${history.consecutiveFailures} sets in a row. Let's review your form to ensure proper technique.`,
        severity: 'critical',
      };
    }

    // Check for large weight increase (>15% from last successful weight)
    if (history.lastSuccessfulWeight > 0) {
      const weightIncrease = currentWeight - history.lastSuccessfulWeight;
      const percentIncrease = (weightIncrease / history.lastSuccessfulWeight) * 100;

      if (percentIncrease > 15) {
        return {
          shouldPrompt: true,
          reason: 'large_weight_increase',
          details: `You're attempting ${percentIncrease.toFixed(0)}% more weight than your last successful set. Focus on maintaining proper form throughout the movement.`,
          severity: 'warning',
        };
      }
    }

    // Also check immediate weight jump if previousWeight is provided
    if (previousWeight && currentWeight > previousWeight) {
      const immediateIncrease = ((currentWeight - previousWeight) / previousWeight) * 100;
      
      if (immediateIncrease > 15) {
        return {
          shouldPrompt: true,
          reason: 'large_weight_increase',
          details: `You're increasing weight by ${immediateIncrease.toFixed(0)}%. Remember to prioritize form over weight.`,
          severity: 'warning',
        };
      }
    }

    return {
      shouldPrompt: false,
      reason: 'none',
      details: '',
      severity: 'none',
    };
  }

  /**
   * Get performance statistics for an exercise
   */
  getPerformanceStats(exerciseId: string): {
    totalSets: number;
    successRate: number;
    consecutiveFailures: number;
    averageWeight: number;
    trend: 'improving' | 'declining' | 'stable';
  } {
    const history = this.getOrCreateHistory(exerciseId);

    if (history.recentSets.length === 0) {
      return {
        totalSets: 0,
        successRate: 0,
        consecutiveFailures: 0,
        averageWeight: 0,
        trend: 'stable',
      };
    }

    const successfulSets = history.recentSets.filter(s => s.success).length;
    const successRate = (successfulSets / history.recentSets.length) * 100;
    const averageWeight = 
      history.recentSets.reduce((sum, s) => sum + s.weight, 0) / history.recentSets.length;

    // Determine trend by comparing first half vs second half of recent sets
    const midpoint = Math.floor(history.recentSets.length / 2);
    const firstHalf = history.recentSets.slice(0, midpoint);
    const secondHalf = history.recentSets.slice(midpoint);

    const firstHalfAvgWeight = firstHalf.length > 0
      ? firstHalf.reduce((sum, s) => sum + s.weight, 0) / firstHalf.length
      : 0;
    const secondHalfAvgWeight = secondHalf.length > 0
      ? secondHalf.reduce((sum, s) => sum + s.weight, 0) / secondHalf.length
      : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondHalfAvgWeight > firstHalfAvgWeight * 1.05) {
      trend = 'improving';
    } else if (secondHalfAvgWeight < firstHalfAvgWeight * 0.95) {
      trend = 'declining';
    }

    return {
      totalSets: history.recentSets.length,
      successRate,
      consecutiveFailures: history.consecutiveFailures,
      averageWeight,
      trend,
    };
  }

  /**
   * Check if user should review form video before attempting a set
   */
  shouldReviewFormBeforeSet(
    exerciseId: string,
    plannedWeight: number
  ): { shouldReview: boolean; reason: string } {
    const history = this.getOrCreateHistory(exerciseId);

    // Recommend review after 2 consecutive failures
    if (history.consecutiveFailures >= 2) {
      return {
        shouldReview: true,
        reason: 'You\'ve missed the last 2 sets. A quick form review might help!',
      };
    }

    // Recommend review for significant weight increase
    if (history.lastSuccessfulWeight > 0) {
      const increase = ((plannedWeight - history.lastSuccessfulWeight) / history.lastSuccessfulWeight) * 100;
      if (increase > 10) {
        return {
          shouldReview: true,
          reason: `This is ${increase.toFixed(0)}% more weight than your last success. Check your form!`,
        };
      }
    }

    return {
      shouldReview: false,
      reason: '',
    };
  }

  /**
   * Get form tips based on recent performance
   */
  getContextualFormTips(exerciseId: string): string[] {
    const history = this.getOrCreateHistory(exerciseId);
    const tips: string[] = [];

    if (history.consecutiveFailures >= 2) {
      tips.push('Focus on full range of motion');
      tips.push('Control the negative (lowering) phase');
      tips.push('Don\'t rush through reps');
    }

    const stats = this.getPerformanceStats(exerciseId);
    if (stats.trend === 'declining') {
      tips.push('Consider reducing weight to perfect your form');
      tips.push('Quality over quantity - each rep should be clean');
    }

    if (history.recentSets.length > 0) {
      const lastSet = history.recentSets[history.recentSets.length - 1];
      if (!lastSet.success && lastSet.completedReps < lastSet.targetReps) {
        const missedReps = lastSet.targetReps - lastSet.completedReps;
        if (missedReps >= 3) {
          tips.push('Weight might be too heavy - focus on achievable loads');
        }
      }
    }

    return tips;
  }

  /**
   * Reset performance history for an exercise (useful for new training cycles)
   */
  resetHistory(exerciseId: string): void {
    this.performanceHistory.delete(exerciseId);
  }

  /**
   * Clear all performance history
   */
  clearAllHistory(): void {
    this.performanceHistory.clear();
  }

  /**
   * Get or create performance history for an exercise
   */
  private getOrCreateHistory(exerciseId: string): ExercisePerformanceHistory {
    if (!this.performanceHistory.has(exerciseId)) {
      this.performanceHistory.set(exerciseId, {
        exerciseId,
        recentSets: [],
        consecutiveFailures: 0,
        lastSuccessfulWeight: 0,
        lastAttemptedWeight: 0,
      });
    }
    return this.performanceHistory.get(exerciseId)!;
  }

  /**
   * Export history for persistence
   */
  exportHistory(): Record<string, ExercisePerformanceHistory> {
    const exported: Record<string, ExercisePerformanceHistory> = {};
    this.performanceHistory.forEach((value, key) => {
      exported[key] = value;
    });
    return exported;
  }

  /**
   * Import history from persistence
   */
  importHistory(data: Record<string, ExercisePerformanceHistory>): void {
    this.performanceHistory.clear();
    Object.entries(data).forEach(([key, value]) => {
      this.performanceHistory.set(key, value);
    });
  }
}

// Singleton instance
const formCheckService = new FormCheckService();
export default formCheckService;
