/**
 * Quick Start Service
 * 
 * Handles quick workout start features including resume capability,
 * one-tap start, and pre-filled warmup weights for improved UX.
 */

import { WorkoutSession, ExerciseLog, MaxLift } from '../types';
import { FormulaCalculator } from './FormulaCalculatorEnhanced';
import StorageService from './StorageService';

export interface QuickStartOptions {
  userId: string;
  weekNumber: number;
  dayNumber: number;
  userMaxes: Record<string, MaxLift>;
  prefillWarmups?: boolean;
}

export interface ResumeWorkoutInfo {
  canResume: boolean;
  session: WorkoutSession | null;
  timeElapsed: number; // milliseconds since workout started
  progress: {
    exercisesCompleted: number;
    totalExercises: number;
    setsCompleted: number;
    estimatedTimeRemaining: number; // minutes
  };
}

export class QuickStartService {
  private static readonly RESUME_TIMEOUT_HOURS = 4;
  private static readonly STORAGE_KEY_PAUSED = '@mmt_paused_workout';
  private static readonly STORAGE_KEY_LAST_SESSION = '@mmt_last_session';

  /**
   * Check if there's a workout that can be resumed
   */
  static async canResumeWorkout(userId: string): Promise<ResumeWorkoutInfo> {
    try {
      const pausedWorkout = await this.getPausedWorkout();
      
      if (!pausedWorkout || pausedWorkout.userId !== userId) {
        return {
          canResume: false,
          session: null,
          timeElapsed: 0,
          progress: {
            exercisesCompleted: 0,
            totalExercises: 0,
            setsCompleted: 0,
            estimatedTimeRemaining: 0,
          },
        };
      }

      const timeElapsed = Date.now() - pausedWorkout.startedAt;
      const hoursElapsed = timeElapsed / (1000 * 60 * 60);

      if (hoursElapsed > this.RESUME_TIMEOUT_HOURS) {
        await this.clearPausedWorkout();
        return {
          canResume: false,
          session: null,
          timeElapsed: 0,
          progress: {
            exercisesCompleted: 0,
            totalExercises: 0,
            setsCompleted: 0,
            estimatedTimeRemaining: 0,
          },
        };
      }

      const progress = this.calculateProgress(pausedWorkout);

      return {
        canResume: true,
        session: pausedWorkout,
        timeElapsed,
        progress,
      };
    } catch (error) {
      console.error('Error checking resume capability:', error);
      return {
        canResume: false,
        session: null,
        timeElapsed: 0,
        progress: {
          exercisesCompleted: 0,
          totalExercises: 0,
          setsCompleted: 0,
          estimatedTimeRemaining: 0,
        },
      };
    }
  }

  /**
   * Save a workout session for later resume
   */
  static async saveForResume(session: WorkoutSession): Promise<void> {
    try {
      await StorageService.saveItem(this.STORAGE_KEY_PAUSED, session);
    } catch (error) {
      console.error('Error saving workout for resume:', error);
      throw error;
    }
  }

  /**
   * Clear paused workout data
   */
  static async clearPausedWorkout(): Promise<void> {
    try {
      await StorageService.removeItem(this.STORAGE_KEY_PAUSED);
    } catch (error) {
      console.error('Error clearing paused workout:', error);
    }
  }

  /**
   * Get paused workout from storage
   */
  private static async getPausedWorkout(): Promise<WorkoutSession | null> {
    try {
      return await StorageService.getItem<WorkoutSession>(this.STORAGE_KEY_PAUSED);
    } catch (error) {
      console.error('Error getting paused workout:', error);
      return null;
    }
  }

  /**
   * Create a quick-start workout session with pre-filled warmups
   */
  static createQuickStartSession(options: QuickStartOptions): WorkoutSession {
    const { userId, weekNumber, dayNumber, userMaxes, prefillWarmups = true } = options;

    const exerciseIds = this.getExercisesForDay(dayNumber);
    const exercises: ExerciseLog[] = exerciseIds.map((exerciseId, index) => {
      const userMax = userMaxes[exerciseId];
      const fourRepMax = userMax?.weight || 135;

      const sets = prefillWarmups
        ? this.generatePrefilledSets(exerciseId, fourRepMax)
        : [];

      return {
        id: `ex-${Date.now()}-${index}`,
        sessionId: `session-${Date.now()}`,
        exerciseId,
        suggestedWeight: fourRepMax,
        order: index + 1,
        sets,
      };
    });

    return {
      id: `session-${Date.now()}`,
      userId,
      weekNumber,
      dayNumber,
      startedAt: Date.now(),
      status: 'not_started',
      exercises,
    };
  }

  /**
   * Generate pre-filled warmup sets based on user's 4RM
   */
  private static generatePrefilledSets(
    exerciseId: string,
    fourRepMax: number
  ): Array<any> {
    const warmupPercentages = [35, 50];
    const warmupSets = warmupPercentages.map((percentage, index) => {
      const weight = FormulaCalculator.calculateWeightByPercentage(
        fourRepMax,
        percentage
      );

      return {
        id: `set-warmup-${Date.now()}-${index}`,
        exerciseLogId: '',
        setNumber: index + 1,
        weight,
        reps: 6,
        targetReps: { min: 5, max: 8 },
        restSeconds: 30,
        completedAt: 0,
        isWarmup: true,
      };
    });

    return warmupSets;
  }

  /**
   * Get exercises for a specific day
   */
  private static getExercisesForDay(dayNumber: number): string[] {
    const dayExercises: Record<number, string[]> = {
      1: ['bench-press', 'lat-pulldown', 'dumbbell-incline-press', 'machine-low-row', 'dumbbell-chest-fly'],
      2: ['barbell-squat', 'leg-press', 'leg-curl', 'leg-extension', 'calf-raise'],
      3: ['overhead-press', 'barbell-row', 'dumbbell-lateral-raise', 'dumbbell-curl', 'tricep-extension'],
    };

    return dayExercises[dayNumber] || dayExercises[1];
  }

  /**
   * Calculate workout progress
   */
  private static calculateProgress(session: WorkoutSession): {
    exercisesCompleted: number;
    totalExercises: number;
    setsCompleted: number;
    estimatedTimeRemaining: number;
  } {
    const totalExercises = session.exercises.length;
    const exercisesCompleted = session.exercises.filter(
      (ex) => ex.completedAt && ex.completedAt > 0
    ).length;

    const setsCompleted = session.exercises.reduce(
      (total, ex) => total + ex.sets.length,
      0
    );

    const avgSetsPerExercise = setsCompleted / Math.max(exercisesCompleted, 1);
    const remainingExercises = totalExercises - exercisesCompleted;
    const estimatedRemainingRestTime = remainingExercises * avgSetsPerExercise * 1.5;
    const estimatedTimeRemaining = Math.ceil(estimatedRemainingRestTime);

    return {
      exercisesCompleted,
      totalExercises,
      setsCompleted,
      estimatedTimeRemaining,
    };
  }

  /**
   * Save last completed session for analytics
   */
  static async saveLastSession(session: WorkoutSession): Promise<void> {
    try {
      await StorageService.saveItem(this.STORAGE_KEY_LAST_SESSION, {
        id: session.id,
        weekNumber: session.weekNumber,
        dayNumber: session.dayNumber,
        completedAt: session.completedAt,
        duration: session.completedAt
          ? session.completedAt - session.startedAt
          : 0,
      });
    } catch (error) {
      console.error('Error saving last session:', error);
    }
  }

  /**
   * Get last completed session info
   */
  static async getLastSession(): Promise<{
    weekNumber: number;
    dayNumber: number;
    completedAt: number;
    duration: number;
  } | null> {
    try {
      return await StorageService.getItem(this.STORAGE_KEY_LAST_SESSION);
    } catch (error) {
      console.error('Error getting last session:', error);
      return null;
    }
  }

  /**
   * Get suggested next workout based on last session
   */
  static async getSuggestedNextWorkout(userId: string): Promise<{
    weekNumber: number;
    dayNumber: number;
    reasoning: string;
  } | null> {
    try {
      const lastSession = await this.getLastSession();
      
      if (!lastSession) {
        return {
          weekNumber: 1,
          dayNumber: 1,
          reasoning: 'Start with Week 1, Day 1',
        };
      }

      const daysSinceLastWorkout = Math.floor(
        (Date.now() - lastSession.completedAt) / (1000 * 60 * 60 * 24)
      );

      let nextDay = lastSession.dayNumber + 1;
      let nextWeek = lastSession.weekNumber;

      if (nextDay > 3) {
        nextDay = 1;
        nextWeek += 1;
      }

      const reasoning =
        daysSinceLastWorkout > 7
          ? 'It\'s been a while - let\'s get back on track!'
          : daysSinceLastWorkout > 2
          ? 'Perfect time to continue your journey'
          : 'Keep the momentum going!';

      return {
        weekNumber: nextWeek,
        dayNumber: nextDay,
        reasoning,
      };
    } catch (error) {
      console.error('Error getting suggested next workout:', error);
      return null;
    }
  }
}

export default QuickStartService;
