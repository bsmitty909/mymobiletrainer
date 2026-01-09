/**
 * SetConditionChecker Service
 * 
 * Handles real-time evaluation of conditional set requirements.
 * Determines when sets should be unlocked based on previous performance.
 * 
 * Implements condition types:
 * - previous_sets_complete: All previous sets must be done
 * - reps_achieved: Specific rep target must be hit in previous set
 * - weight_achieved: Specific weight must be lifted in previous set
 * - always: No conditions (always available)
 */

import { ConditionalSet, SetCondition, ConditionType } from '../types/enhanced';
import { SetLog } from '../types';

export type SetStatus = 'locked' | 'unlocked' | 'pending' | 'completed';

export interface ConditionEvaluationResult {
  status: SetStatus;
  shouldDisplay: boolean;
  conditionMet: boolean;
  reason?: string;
  progressText?: string;
  icon: '🔒' | '🔓' | '⏳' | '✅';
}

export class SetConditionChecker {
  /**
   * Main entry point: Check if a conditional set should be displayed
   * and determine its current status
   */
  static evaluateSet(
    set: ConditionalSet,
    completedSets: SetLog[]
  ): ConditionEvaluationResult {
    // If set is already completed
    const isCompleted = completedSets.some(s => s.setNumber === set.setNumber);
    if (isCompleted) {
      return {
        status: 'completed',
        shouldDisplay: true,
        conditionMet: true,
        icon: '✅',
        reason: 'Set completed'
      };
    }

    // If not conditional, it's always available
    if (!set.isConditional || !set.condition) {
      return {
        status: 'unlocked',
        shouldDisplay: true,
        conditionMet: true,
        icon: '🔓',
        reason: 'Always available'
      };
    }

    // Evaluate condition
    const conditionResult = this.checkCondition(
      set.condition,
      set.setNumber,
      completedSets
    );

    if (conditionResult.met) {
      return {
        status: 'unlocked',
        shouldDisplay: true,
        conditionMet: true,
        icon: '🔓',
        reason: conditionResult.reason,
        progressText: conditionResult.progressText
      };
    }

    // Check if close to unlocking (pending state)
    const isPending = this.isPendingUnlock(set, completedSets);

    return {
      status: isPending ? 'pending' : 'locked',
      shouldDisplay: false,
      conditionMet: false,
      icon: isPending ? '⏳' : '🔒',
      reason: conditionResult.reason,
      progressText: conditionResult.progressText
    };
  }

  /**
   * Check specific condition type
   */
  static checkCondition(
    condition: SetCondition,
    currentSetNumber: number,
    completedSets: SetLog[]
  ): {
    met: boolean;
    reason: string;
    progressText?: string;
  } {
    switch (condition.type) {
      case 'always':
        return this.checkAlways();

      case 'previous_sets_complete':
        return this.checkPreviousSetsComplete(
          condition,
          currentSetNumber,
          completedSets
        );

      case 'reps_achieved':
        return this.checkRepsAchieved(
          condition,
          currentSetNumber,
          completedSets
        );

      case 'weight_achieved':
        return this.checkWeightAchieved(
          condition,
          currentSetNumber,
          completedSets
        );

      default:
        return {
          met: false,
          reason: 'Unknown condition type'
        };
    }
  }

  /**
   * Always condition - no requirements
   */
  private static checkAlways(): {
    met: boolean;
    reason: string;
  } {
    return {
      met: true,
      reason: 'No conditions required'
    };
  }

  /**
   * Previous sets complete condition
   * Requires X previous sets to be completed with at least 1 rep
   */
  private static checkPreviousSetsComplete(
    condition: SetCondition,
    currentSetNumber: number,
    completedSets: SetLog[]
  ): {
    met: boolean;
    reason: string;
    progressText?: string;
  } {
    const requiredCount = condition.requiredSets || (currentSetNumber - 1);
    const completedWithReps = completedSets.filter(s => s.reps > 0);
    const completedCount = completedWithReps.length;

    const met = completedCount >= requiredCount;

    return {
      met,
      reason: met
        ? `All ${requiredCount} previous sets completed`
        : `Complete ${requiredCount - completedCount} more set${
            requiredCount - completedCount !== 1 ? 's' : ''
          }`,
      progressText: `${completedCount}/${requiredCount} sets`
    };
  }

  /**
   * Reps achieved condition
   * Requires specific rep count in a previous set
   */
  private static checkRepsAchieved(
    condition: SetCondition,
    currentSetNumber: number,
    completedSets: SetLog[]
  ): {
    met: boolean;
    reason: string;
    progressText?: string;
  } {
    const targetSetNumber = condition.requiredSets || (currentSetNumber - 1);
    const requiredReps = condition.requiredReps || 1;
    
    const targetSet = completedSets.find(s => s.setNumber === targetSetNumber);

    if (!targetSet) {
      return {
        met: false,
        reason: `Complete Set ${targetSetNumber} first`,
        progressText: `Waiting for Set ${targetSetNumber}`
      };
    }

    const met = targetSet.reps >= requiredReps;

    return {
      met,
      reason: met
        ? `Set ${targetSetNumber} completed with ${targetSet.reps} rep${
            targetSet.reps !== 1 ? 's' : ''
          }`
        : `Need ${requiredReps}+ rep${
            requiredReps !== 1 ? 's' : ''
          } in Set ${targetSetNumber} (got ${targetSet.reps})`,
      progressText: met
        ? `✓ ${targetSet.reps} reps`
        : `${targetSet.reps}/${requiredReps} reps`
    };
  }

  /**
   * Weight achieved condition
   * Requires specific weight to be lifted in a previous set
   */
  private static checkWeightAchieved(
    condition: SetCondition,
    currentSetNumber: number,
    completedSets: SetLog[]
  ): {
    met: boolean;
    reason: string;
    progressText?: string;
  } {
    const targetSetNumber = condition.requiredSets || (currentSetNumber - 1);
    const requiredWeight = condition.requiredWeight || 0;
    
    const targetSet = completedSets.find(s => s.setNumber === targetSetNumber);

    if (!targetSet) {
      return {
        met: false,
        reason: `Complete Set ${targetSetNumber} first`,
        progressText: `Waiting for Set ${targetSetNumber}`
      };
    }

    const met = targetSet.weight >= requiredWeight;

    return {
      met,
      reason: met
        ? `Set ${targetSetNumber} completed at ${targetSet.weight} lbs`
        : `Need ${requiredWeight}+ lbs in Set ${targetSetNumber} (got ${targetSet.weight})`,
      progressText: met
        ? `✓ ${targetSet.weight} lbs`
        : `${targetSet.weight}/${requiredWeight} lbs`
    };
  }

  /**
   * Determine if a set is pending unlock (next in line)
   * A set is pending if the immediately previous set exists
   */
  private static isPendingUnlock(
    set: ConditionalSet,
    completedSets: SetLog[]
  ): boolean {
    if (!set.isConditional) return false;

    const previousSetNumber = set.setNumber - 1;
    const previousSetExists = completedSets.some(
      s => s.setNumber === previousSetNumber
    );

    // Pending if previous set exists but this set's condition isn't met yet
    return previousSetExists;
  }

  /**
   * Get all visible sets (not locked)
   */
  static getVisibleSets(
    allSets: ConditionalSet[],
    completedSets: SetLog[]
  ): ConditionalSet[] {
    return allSets.filter(set => {
      const evaluation = this.evaluateSet(set, completedSets);
      return evaluation.shouldDisplay;
    });
  }

  /**
   * Get next set to perform (first unlocked, not completed)
   */
  static getNextSet(
    allSets: ConditionalSet[],
    completedSets: SetLog[]
  ): ConditionalSet | null {
    const completedSetNumbers = new Set(completedSets.map(s => s.setNumber));

    for (const set of allSets) {
      if (completedSetNumbers.has(set.setNumber)) {
        continue; // Skip completed sets
      }

      const evaluation = this.evaluateSet(set, completedSets);
      if (evaluation.status === 'unlocked' || evaluation.status === 'pending') {
        return set;
      }
    }

    return null;
  }

  /**
   * Get progression statistics for UI feedback
   */
  static getProgressionStats(
    allSets: ConditionalSet[],
    completedSets: SetLog[]
  ): {
    totalSets: number;
    completedSets: number;
    unlockedSets: number;
    lockedSets: number;
    progressPercentage: number;
  } {
    let completedCount = 0;
    let unlockedCount = 0;
    let lockedCount = 0;

    for (const set of allSets) {
      const evaluation = this.evaluateSet(set, completedSets);
      
      switch (evaluation.status) {
        case 'completed':
          completedCount++;
          break;
        case 'unlocked':
        case 'pending':
          unlockedCount++;
          break;
        case 'locked':
          lockedCount++;
          break;
      }
    }

    const totalSets = allSets.length;
    const progressPercentage = totalSets > 0
      ? Math.round((completedCount / totalSets) * 100)
      : 0;

    return {
      totalSets,
      completedSets: completedCount,
      unlockedSets: unlockedCount,
      lockedSets: lockedCount,
      progressPercentage
    };
  }

  /**
   * Check if all sets are completed
   */
  static areAllSetsCompleted(
    allSets: ConditionalSet[],
    completedSets: SetLog[]
  ): boolean {
    const visibleSets = this.getVisibleSets(allSets, completedSets);
    const completedSetNumbers = new Set(completedSets.map(s => s.setNumber));
    
    return visibleSets.every(set => completedSetNumbers.has(set.setNumber));
  }

  /**
   * Get human-readable condition description
   */
  static getConditionDescription(condition: SetCondition): string {
    switch (condition.type) {
      case 'always':
        return 'Always available';

      case 'previous_sets_complete':
        return condition.requiredSets
          ? `Complete ${condition.requiredSets} previous sets`
          : 'Complete all previous sets';

      case 'reps_achieved':
        return `Achieve ${condition.requiredReps || 1} rep${
          (condition.requiredReps || 1) !== 1 ? 's' : ''
        } in previous set`;

      case 'weight_achieved':
        return `Lift ${condition.requiredWeight} lbs in previous set`;

      default:
        return 'Unknown condition';
    }
  }

  /**
   * Evaluate multiple sets and return their statuses
   */
  static evaluateMultipleSets(
    sets: ConditionalSet[],
    completedSets: SetLog[]
  ): Map<number, ConditionEvaluationResult> {
    const results = new Map<number, ConditionEvaluationResult>();

    for (const set of sets) {
      const evaluation = this.evaluateSet(set, completedSets);
      results.set(set.setNumber, evaluation);
    }

    return results;
  }

  /**
   * Get unlock preview (what will happen when current set completes)
   */
  static getUnlockPreview(
    allSets: ConditionalSet[],
    completedSets: SetLog[],
    hypotheticalNewSet: SetLog
  ): {
    willUnlock: ConditionalSet[];
    willRemainLocked: ConditionalSet[];
  } {
    const hypotheticalCompletedSets = [...completedSets, hypotheticalNewSet];
    
    const willUnlock: ConditionalSet[] = [];
    const willRemainLocked: ConditionalSet[] = [];

    for (const set of allSets) {
      // Skip already completed sets
      if (completedSets.some(s => s.setNumber === set.setNumber)) {
        continue;
      }

      const currentEval = this.evaluateSet(set, completedSets);
      const futureEval = this.evaluateSet(set, hypotheticalCompletedSets);

      if (!currentEval.conditionMet && futureEval.conditionMet) {
        willUnlock.push(set);
      } else if (!futureEval.conditionMet) {
        willRemainLocked.push(set);
      }
    }

    return {
      willUnlock,
      willRemainLocked
    };
  }
}

export default SetConditionChecker;
