/**
 * ProgressionService
 *
 * Manages program progression and phase transitions:
 * - Determines when user advances to next week/phase
 * - Handles pre-workout → max week → regular weeks flow
 * - Tracks completion and readiness for progression
 * - Tracks weekly maxes and progression history
 * - Calculates strength gains and milestone achievements
 */

import { ExperienceLevel, WorkoutSession, WorkoutPhase, MaxLift, PersonalRecord } from '../types';
import { WeeklyMax, MaxAttemptHistory } from '../types/enhanced';

export class ProgressionService {
  /**
   * Determine the starting phase based on user experience level
   */
  static getStartingPhase(experienceLevel: ExperienceLevel): {
    phaseId: string;
    weekNumber: number;
    dayNumber: number;
  } {
    if (experienceLevel === 'beginner') {
      return {
        phaseId: 'pre-workout-1',
        weekNumber: 0,
        dayNumber: 1,
      };
    } else {
      // Moderate users skip pre-workouts, go straight to max determination
      return {
        phaseId: 'max-determination',
        weekNumber: 0,
        dayNumber: 1,
      };
    }
  }

  /**
   * Determine the next phase after completing current phase
   */
  static getNextPhase(
    currentPhaseId: string,
    experienceLevel: ExperienceLevel
  ): {
    phaseId: string;
    weekNumber: number;
    dayNumber: number;
  } | null {
    const phaseProgression: Record<string, string> = {
      'pre-workout-1': 'pre-workout-2',
      'pre-workout-2': 'max-determination',
      'max-determination': 'progressive-weeks',
      'progressive-weeks': 'progressive-weeks', // Loops within phase
    };

    const nextPhaseId = phaseProgression[currentPhaseId];
    
    if (!nextPhaseId) {
      return null; // Unknown phase
    }

    return {
      phaseId: nextPhaseId,
      weekNumber: 0,
      dayNumber: 1,
    };
  }

  /**
   * Check if user is ready to progress to next week
   * Requires completing all days in current week
   */
  static isReadyForNextWeek(
    weekSessions: WorkoutSession[],
    requiredDays: number = 3
  ): boolean {
    const completedDays = weekSessions.filter(
      s => s.status === 'completed'
    ).length;

    return completedDays >= requiredDays;
  }

  /**
   * Check if user is ready to progress to next phase
   * Different phases have different completion requirements
   */
  static isReadyForNextPhase(
    currentPhaseId: string,
    phaseSessions: WorkoutSession[]
  ): boolean {
    const completedSessions = phaseSessions.filter(
      s => s.status === 'completed'
    );

    switch (currentPhaseId) {
      case 'pre-workout-1':
      case 'pre-workout-2':
        // Complete all 3 days
        return completedSessions.length >= 3;

      case 'max-determination':
        // Complete all 3 max determination days
        return completedSessions.length >= 3;

      case 'progressive-weeks':
        // Never leaves this phase - just advances weeks
        return false;

      default:
        return false;
    }
  }

  /**
   * Calculate next workout day
   * Days cycle 1 → 2 → 3 → 1 (new week)
   */
  static calculateNextWorkoutDay(
    currentWeek: number,
    currentDay: number,
    weekCompleted: boolean
  ): { week: number; day: number } {
    if (weekCompleted) {
      return {
        week: currentWeek + 1,
        day: 1,
      };
    }

    const nextDay = currentDay + 1;
    if (nextDay > 3) {
      // Completed all 3 days - move to next week
      return {
        week: currentWeek + 1,
        day: 1,
      };
    }

    return {
      week: currentWeek,
      day: nextDay,
    };
  }

  /**
   * Get week type for a given week number in progressive phase
   * Pattern: Week 1 = intensity, Week 2 = intensity, Week 3 = percentage, Week 4 = mixed
   * Then repeats with progressive overload
   */
  static getWeekType(weekNumber: number): 'intensity' | 'percentage' | 'mixed' {
    const weekInCycle = ((weekNumber - 1) % 4) + 1;

    switch (weekInCycle) {
      case 1:
      case 2:
        return 'intensity'; // Weeks 1-2: High intensity
      case 3:
        return 'percentage'; // Week 3: Volume/percentage work
      case 4:
        return 'mixed'; // Week 4: Mixed protocol
      default:
        return 'intensity';
    }
  }

  /**
   * Calculate completion percentage for a phase
   */
  static calculatePhaseCompletion(
    phaseSessions: WorkoutSession[],
    totalRequiredSessions: number
  ): number {
    const completedSessions = phaseSessions.filter(
      s => s.status === 'completed'
    ).length;

    return Math.round((completedSessions / totalRequiredSessions) * 100);
  }

  /**
   * Get phase title and description
   */
  static getPhaseInfo(phaseId: string): {
    title: string;
    description: string;
    totalWeeks: number;
  } {
    const phaseInfo: Record<string, any> = {
      'pre-workout-1': {
        title: 'Pre-Workout 1',
        description: 'Laying the Foundation - Very light weights to ease back into training',
        totalWeeks: 1,
      },
      'pre-workout-2': {
        title: 'Pre-Workout 2',
        description: 'Building Momentum - Light weights with new exercises',
        totalWeeks: 1,
      },
      'max-determination': {
        title: 'Max Determination Week',
        description: 'Establish your baseline strength for personalized programming',
        totalWeeks: 1,
      },
      'progressive-weeks': {
        title: 'Progressive Training',
        description: 'Structured strength building with adaptive programming',
        totalWeeks: Infinity, // Ongoing
      },
    };

    return phaseInfo[phaseId] || {
      title: 'Unknown Phase',
      description: '',
      totalWeeks: 0,
    };
  }

  /**
   * Check if user needs max determination week
   * True if they have no verified maxes
   */
  static needsMaxDetermination(
    userMaxes: Record<string, any>
  ): boolean {
    const coreExercises = [
      'bench-press',
      'lat-pulldown',
      'leg-press',
      'shoulder-press',
    ];

    const hasAllMaxes = coreExercises.every(
      exerciseId => userMaxes[exerciseId]?.verified
    );

    return !hasAllMaxes;
  }

  /**
   * Get recommended rest days before next workout
   */
  static getRecommendedRestDays(lastWorkoutDate: number): number {
    const daysSinceLastWorkout = Math.floor(
      (Date.now() - lastWorkoutDate) / (1000 * 60 * 60 * 24)
    );

    // Recommend at least 1 rest day, max 2
    if (daysSinceLastWorkout === 0) {
      return 1; // Just worked out today - rest tomorrow
    }

    return 0; // Ready to workout
  }

  /**
   * Calculate workout frequency and consistency
   */
  static calculateConsistency(
    sessions: WorkoutSession[],
    periodDays: number = 30
  ): {
    workoutsPerWeek: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
  } {
    const cutoffDate = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.filter(
      s => s.startedAt > cutoffDate
    );

    const completedSessions = recentSessions.filter(
      s => s.status === 'completed'
    );

    const workoutsPerWeek = (completedSessions.length / periodDays) * 7;
    const completionRate = recentSessions.length > 0
      ? (completedSessions.length / recentSessions.length) * 100
      : 0;

    // Calculate streaks
    const { current, longest } = this.calculateStreaks(sessions);

    return {
      workoutsPerWeek: Math.round(workoutsPerWeek * 10) / 10,
      completionRate: Math.round(completionRate),
      currentStreak: current,
      longestStreak: longest,
    };
  }

  /**
   * Calculate current and longest workout streaks
   */
  private static calculateStreaks(sessions: WorkoutSession[]): {
    current: number;
    longest: number;
  } {
    const completed = sessions
      .filter(s => s.status === 'completed')
      .sort((a, b) => b.startedAt - a.startedAt);

    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    let lastDate: number | null = null;

    for (const session of completed) {
      if (!lastDate) {
        tempStreak = 1;
        lastDate = session.startedAt;
        continue;
      }

      const daysDiff = Math.floor(
        (lastDate - session.startedAt) / (1000 * 60 * 60 * 24)
      );

      // Within 2 days = continuous streak
      if (daysDiff <= 2) {
        tempStreak++;
      } else {
        // Streak broken
        longest = Math.max(longest, tempStreak);
        tempStreak = 1;
      }

      lastDate = session.startedAt;
    }

    current = tempStreak;
    longest = Math.max(longest, tempStreak);

    return { current, longest };
  }

  /**
   * Get motivational message based on progress
   */
  static getMotivationalMessage(
    weekNumber: number,
    streak: number,
    prsThisWeek: number
  ): string {
    if (prsThisWeek > 0) {
      return `🎉 ${prsThisWeek} new PR${prsThisWeek > 1 ? 's' : ''} this week! Keep crushing it!`;
    }

    if (streak >= 5) {
      return `${streak}-day streak! You're unstoppable!`;
    }

    if (weekNumber >= 4) {
      return `Week ${weekNumber}! You're building serious strength!`;
    }

    if (weekNumber === 1) {
      return `Welcome to Week 1! Let's build something great!`;
    }

    return `Keep pushing! Every rep counts!`;
  }

  /**
   * Calculate week-over-week progression for an exercise
   * Returns +5, 0, -5, etc. based on weight changes
   */
  static calculateWeeklyProgression(
    weeklyMaxes: WeeklyMax[],
    exerciseId: string
  ): {
    currentWeek: number;
    currentMax: number;
    previousMax: number;
    progression: number;
    progressionPercentage: number;
  } | null {
    const exerciseMaxes = weeklyMaxes
      .filter(m => m.exerciseId === exerciseId)
      .sort((a, b) => b.weekNumber - a.weekNumber);

    if (exerciseMaxes.length < 2) {
      return null;
    }

    const current = exerciseMaxes[0];
    const previous = exerciseMaxes[1];
    const progression = current.weight - previous.weight;
    const progressionPercentage = (progression / previous.weight) * 100;

    return {
      currentWeek: current.weekNumber,
      currentMax: current.weight,
      previousMax: previous.weight,
      progression,
      progressionPercentage: Math.round(progressionPercentage * 10) / 10,
    };
  }

  /**
   * Get total strength gained since program start
   */
  static calculateTotalStrengthGain(
    weeklyMaxes: WeeklyMax[],
    exerciseId: string
  ): {
    startingMax: number;
    currentMax: number;
    totalGain: number;
    totalGainPercentage: number;
    weeksTracked: number;
  } | null {
    const exerciseMaxes = weeklyMaxes
      .filter(m => m.exerciseId === exerciseId)
      .sort((a, b) => a.weekNumber - b.weekNumber);

    if (exerciseMaxes.length === 0) {
      return null;
    }

    const starting = exerciseMaxes[0];
    const current = exerciseMaxes[exerciseMaxes.length - 1];
    const totalGain = current.weight - starting.weight;
    const totalGainPercentage = (totalGain / starting.weight) * 100;

    return {
      startingMax: starting.weight,
      currentMax: current.weight,
      totalGain,
      totalGainPercentage: Math.round(totalGainPercentage * 10) / 10,
      weeksTracked: current.weekNumber - starting.weekNumber + 1,
    };
  }

  /**
   * Get progression history for charting (last N weeks)
   */
  static getProgressionHistory(
    weeklyMaxes: WeeklyMax[],
    exerciseId: string,
    lastNWeeks: number = 12
  ): Array<{ week: number; weight: number; date: Date }> {
    const exerciseMaxes = weeklyMaxes
      .filter(m => m.exerciseId === exerciseId)
      .sort((a, b) => a.weekNumber - b.weekNumber)
      .slice(-lastNWeeks);

    return exerciseMaxes.map(m => ({
      week: m.weekNumber,
      weight: m.weight,
      date: new Date(m.achievedAt),
    }));
  }

  /**
   * Calculate max attempt success rate
   */
  static calculateMaxAttemptSuccessRate(
    maxAttemptHistory: MaxAttemptHistory[],
    exerciseId?: string
  ): {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    successRate: number;
  } {
    const attempts = exerciseId
      ? maxAttemptHistory.filter(a => a.exerciseId === exerciseId)
      : maxAttemptHistory;

    const totalAttempts = attempts.length;
    const successfulAttempts = attempts.filter(a => a.successful).length;
    const failedAttempts = totalAttempts - successfulAttempts;
    const successRate = totalAttempts > 0
      ? (successfulAttempts / totalAttempts) * 100
      : 0;

    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      successRate: Math.round(successRate),
    };
  }

  /**
   * Get best lifts in last N days
   */
  static getBestLiftsInPeriod(
    maxAttemptHistory: MaxAttemptHistory[],
    periodDays: number = 30
  ): Array<{
    exerciseId: string;
    weight: number;
    reps: number;
    date: Date;
  }> {
    const cutoffDate = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
    const recentAttempts = maxAttemptHistory
      .filter(a => a.attemptedAt > cutoffDate && a.successful)
      .sort((a, b) => b.attemptedWeight - a.attemptedWeight);

    const bestByExercise = new Map<string, MaxAttemptHistory>();

    for (const attempt of recentAttempts) {
      const existing = bestByExercise.get(attempt.exerciseId);
      if (!existing || attempt.attemptedWeight > existing.attemptedWeight) {
        bestByExercise.set(attempt.exerciseId, attempt);
      }
    }

    return Array.from(bestByExercise.values()).map(a => ({
      exerciseId: a.exerciseId,
      weight: a.attemptedWeight,
      reps: a.repsCompleted,
      date: new Date(a.attemptedAt),
    }));
  }

  /**
   * Determine milestone achievements based on weight gains
   * Returns earned milestone badges
   */
  static getMilestoneAchievements(
    weeklyMaxes: WeeklyMax[],
    exerciseId: string
  ): Array<{
    type: 'gain_10' | 'gain_25' | 'gain_50' | 'gain_100';
    title: string;
    description: string;
    icon: string;
    earnedAt: Date;
  }> {
    const gains = this.calculateTotalStrengthGain(weeklyMaxes, exerciseId);
    if (!gains) return [];

    const milestones = [];
    const totalGain = gains.totalGain;

    if (totalGain >= 100) {
      milestones.push({
        type: 'gain_100' as const,
        title: '💯 Century Gain',
        description: `+${totalGain} lbs gained!`,
        icon: '🏆',
        earnedAt: new Date(),
      });
    } else if (totalGain >= 50) {
      milestones.push({
        type: 'gain_50' as const,
        title: '💪 Half Century',
        description: `+${totalGain} lbs gained!`,
        icon: '⭐',
        earnedAt: new Date(),
      });
    } else if (totalGain >= 25) {
      milestones.push({
        type: 'gain_25' as const,
        title: '🎯 Quarter Century',
        description: `+${totalGain} lbs gained!`,
        icon: '🔥',
        earnedAt: new Date(),
      });
    } else if (totalGain >= 10) {
      milestones.push({
        type: 'gain_10' as const,
        title: '🚀 Strong Start',
        description: `+${totalGain} lbs gained!`,
        icon: '💪',
        earnedAt: new Date(),
      });
    }

    return milestones;
  }

  /**
   * Compare current progress to program baseline
   */
  static compareToBaseline(
    weeklyMaxes: WeeklyMax[],
    exerciseIds: string[]
  ): {
    exerciseComparisons: Array<{
      exerciseId: string;
      baselineMax: number;
      currentMax: number;
      gain: number;
      gainPercentage: number;
    }>;
    totalBaselineStrength: number;
    totalCurrentStrength: number;
    overallGain: number;
    overallGainPercentage: number;
  } {
    const comparisons = exerciseIds.map(exerciseId => {
      const gains = this.calculateTotalStrengthGain(weeklyMaxes, exerciseId);
      return {
        exerciseId,
        baselineMax: gains?.startingMax || 0,
        currentMax: gains?.currentMax || 0,
        gain: gains?.totalGain || 0,
        gainPercentage: gains?.totalGainPercentage || 0,
      };
    });

    const totalBaselineStrength = comparisons.reduce((sum, c) => sum + c.baselineMax, 0);
    const totalCurrentStrength = comparisons.reduce((sum, c) => sum + c.currentMax, 0);
    const overallGain = totalCurrentStrength - totalBaselineStrength;
    const overallGainPercentage = totalBaselineStrength > 0
      ? (overallGain / totalBaselineStrength) * 100
      : 0;

    return {
      exerciseComparisons: comparisons,
      totalBaselineStrength,
      totalCurrentStrength,
      overallGain,
      overallGainPercentage: Math.round(overallGainPercentage * 10) / 10,
    };
  }

  /**
   * Get weekly progression summary for all exercises
   */
  static getWeeklyProgressSummary(
    weeklyMaxes: WeeklyMax[],
    exerciseIds: string[]
  ): Array<{
    exerciseId: string;
    exerciseName: string;
    currentMax: number;
    weeklyChange: number;
    totalGain: number;
    trendDirection: 'up' | 'down' | 'stable';
  }> {
    return exerciseIds.map(exerciseId => {
      const progression = this.calculateWeeklyProgression(weeklyMaxes, exerciseId);
      const gains = this.calculateTotalStrengthGain(weeklyMaxes, exerciseId);

      let trendDirection: 'up' | 'down' | 'stable' = 'stable';
      if (progression) {
        if (progression.progression > 0) trendDirection = 'up';
        else if (progression.progression < 0) trendDirection = 'down';
      }

      return {
        exerciseId,
        exerciseName: exerciseId.split('-').map(w =>
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' '),
        currentMax: progression?.currentMax || gains?.currentMax || 0,
        weeklyChange: progression?.progression || 0,
        totalGain: gains?.totalGain || 0,
        trendDirection,
      };
    });
  }
}

export default ProgressionService;
