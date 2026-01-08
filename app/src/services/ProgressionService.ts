/**
 * ProgressionService
 * 
 * Manages program progression and phase transitions:
 * - Determines when user advances to next week/phase
 * - Handles pre-workout → max week → regular weeks flow
 * - Tracks completion and readiness for progression
 */

import { ExperienceLevel, WorkoutSession, WorkoutPhase } from '../types';

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
  static getRecommendedRestDays(lastWorkoutDate: Date): number {
    const daysSinceLastWorkout = Math.floor(
      (Date.now() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)
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
      s => s.startedAt.getTime() > cutoffDate
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
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const session of completed) {
      if (!lastDate) {
        tempStreak = 1;
        lastDate = session.startedAt;
        continue;
      }

      const daysDiff = Math.floor(
        (lastDate.getTime() - session.startedAt.getTime()) / (1000 * 60 * 60 * 24)
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
}

export default ProgressionService;
