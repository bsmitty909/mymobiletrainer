// @ts-nocheck
/**
 * WorkoutEngine Service
 *
 * Orchestrates workout sessions by:
 * - Loading workout programs and templates
 * - Calculating all weights for a session using ProtocolWorkoutEngine
 * - Managing workout state and progression
 * - Tracking performance and updating maxes
 *
 * All workouts now use the protocol system (P1/P2/P3) exclusively.
 * Formula calculations are used within the protocol system for weight determinations.
 */

import {
  WorkoutProgram,
  Week,
  Day,
  ExerciseTemplate,
  WorkoutSession,
  ExerciseLog,
  SetLog,
  MaxLift,
  WeekType,
  FormulaContext,
  WeightCalculationResult,
  UserProfile,
} from '../types';
import FormulaCalculator from './FormulaCalculator';
import WorkoutEngineRouter from './WorkoutEngineRouter';

export class WorkoutEngine {
  /**
   * Create a new workout session with calculated weights
   */
  static async createWorkoutSession(
    userId: string,
    weekNumber: number,
    dayNumber: number,
    day: Day,
    userMaxes: Record<string, MaxLift>,
    bodyWeight?: number
  ): Promise<WorkoutSession> {
    const sessionId = this.generateId();
    const exercises: ExerciseLog[] = [];

    // Calculate weights for each exercise
    for (const exerciseTemplate of day.exercises) {
      const exerciseLog = await this.prepareExerciseLog(
        sessionId,
        exerciseTemplate,
        userMaxes,
        bodyWeight,
        "intensity" as WeekType
      );
      exercises.push(exerciseLog);
    }

    const session: WorkoutSession = {
      id: sessionId,
      userId,
      weekNumber,
      dayNumber,
      startedAt: Date.now(),
      status: 'not_started',
      exercises,
      bodyWeight,
    };

    return session;
  }

  /**
   * Prepare an exercise log with calculated weights for all sets
   */
  private static async prepareExerciseLog(
    sessionId: string,
    template: ExerciseTemplate,
    userMaxes: Record<string, MaxLift>,
    bodyWeight: number | undefined,
    weekType: WeekType
  ): Promise<ExerciseLog> {
    const exerciseLog: ExerciseLog = {
      id: this.generateId(),
      sessionId,
      exerciseId: template.exerciseId,
      order: template.order,
      suggestedWeight: 0, // Will be calculated
      sets: [],
    };

    // Get or estimate user's max for this exercise
    const userMax = userMaxes[template.exerciseId];
    const maxWeight = userMax?.weight || this.estimateMaxFromBodyWeight(bodyWeight);

    // Calculate weight for each set using the template formulas
    for (const setTemplate of template.sets) {
      const context: FormulaContext = {
        userMaxes,
        bodyWeight,
        weekType,
        exerciseType: 'barbell', // TODO: Get from exercise metadata
        // previousWorkout will be fetched from DB in real implementation
      };

      const weightCalc = FormulaCalculator.calculateSuggestedWeight(
        setTemplate.weightFormula,
        context
      );

      // Set suggested weight (first set's weight becomes the suggested)
      if (setTemplate.setNumber === 1) {
        exerciseLog.suggestedWeight = weightCalc.suggestedWeight;
      }

      // Note: Sets aren't logged yet - this just prepares the template
      // Actual logging happens during workout when user inputs data
    }

    return exerciseLog;
  }

  /**
   * Log a completed set during an active workout
   */
  static logSet(
    exerciseLog: ExerciseLog,
    setNumber: number,
    weight: number,
    reps: number,
    restSeconds: number,
    perceivedEffort?: number
  ): SetLog {
    const setLog: SetLog = {
      id: this.generateId(),
      exerciseLogId: exerciseLog.id,
      setNumber,
      weight,
      reps,
      targetReps: { min: 10, max: 12 }, // TODO: Get from template
      restSeconds,
      completedAt: Date.now(),
      perceivedEffort,
    };

    // Add to exercise log
    exerciseLog.sets.push(setLog);

    // Update actual weight if not set
    if (!exerciseLog.actualWeight) {
      exerciseLog.actualWeight = weight;
    }

    return setLog;
  }

  /**
   * Complete a workout session and calculate stats
   */
  static completeWorkout(session: WorkoutSession): {
    session: WorkoutSession;
    newPRs: MaxLift[];
    stats: {
      totalVolume: number;
      duration: number;
      exercisesCompleted: number;
      setsCompleted: number;
      totalReps: number;
    };
  } {
    const now = Date.now();
    session.completedAt = now;
    session.status = 'completed';

    // Calculate workout stats
    const totalVolume = FormulaCalculator.calculateVolume(session.exercises);
    const duration = session.completedAt - session.startedAt;
    
    let setsCompleted = 0;
    let totalReps = 0;
    const newPRs: MaxLift[] = [];

    for (const exercise of session.exercises) {
      setsCompleted += exercise.sets.length;
      totalReps += exercise.sets.reduce((sum, set) => sum + set.reps, 0);

      // Check for PRs
      // TODO: Get current max from database
      const currentMax = 100; // Placeholder
      const prCheck = FormulaCalculator.checkForPR(exercise, currentMax);
      
      if (prCheck.isNewPR && prCheck.newMax) {
        newPRs.push({
          id: this.generateId(),
          userId: session.userId,
          exerciseId: exercise.exerciseId,
          weight: prCheck.newMax,
          reps: 1,
          dateAchieved: now,
          verified: false,
          workoutSessionId: session.id,
        });
      }
    }

    return {
      session,
      newPRs,
      stats: {
        totalVolume,
        duration: Math.floor(duration / 1000), // Convert to seconds
        exercisesCompleted: session.exercises.length,
        setsCompleted,
        totalReps,
      },
    };
  }

  /**
   * Calculate all weights for an upcoming workout
   */
  static async calculateWorkoutWeights(
    day: Day,
    userMaxes: Record<string, MaxLift>,
    bodyWeight: number | undefined,
    weekType: WeekType,
    previousWorkouts?: Record<string, ExerciseLog>
  ): Promise<Record<string, WeightCalculationResult>> {
    const calculations: Record<string, WeightCalculationResult> = {};

    for (const exerciseTemplate of day.exercises) {
      const context: FormulaContext = {
        userMaxes,
        bodyWeight,
        weekType,
        exerciseType: 'barbell', // TODO: Get from exercise metadata
        previousWorkout: previousWorkouts?.[exerciseTemplate.exerciseId],
      };

      // Calculate for the main working set (typically set 2)
      const workingSet = exerciseTemplate.sets.find(s => s.setType === 'working') || exerciseTemplate.sets[1];
      
      if (workingSet) {
        const result = FormulaCalculator.calculateSuggestedWeight(
          workingSet.weightFormula,
          context
        );
        calculations[exerciseTemplate.exerciseId] = result;
      }
    }

    return calculations;
  }

  /**
   * Determine if user should progress to next week
   */
  static shouldProgressToNextWeek(
    weekSessions: WorkoutSession[],
    requiredWorkouts: number = 3
  ): boolean {
    const completedWorkouts = weekSessions.filter(s => s.status === 'completed').length;
    return completedWorkouts >= requiredWorkouts;
  }

  /**
   * Get the next workout for the user
   */
  static getNextWorkout(
    currentWeek: number,
    currentDay: number,
    weekCompleted: boolean
  ): { week: number; day: number } {
    if (weekCompleted) {
      return { week: currentWeek + 1, day: 1 };
    }

    // Move to next day within the week (3 days per week)
    const nextDay = currentDay + 1;
    if (nextDay > 3) {
      return { week: currentWeek + 1, day: 1 };
    }

    return { week: currentWeek, day: nextDay };
  }

  /**
   * Validate if a workout session can be started
   */
  static validateWorkoutStart(
    userId: string,
    weekNumber: number,
    dayNumber: number
  ): { canStart: boolean; reason?: string } {
    // Check if previous week/days are completed
    // This will be implemented with actual database queries

    return { canStart: true };
  }

  /**
   * Pause an active workout session
   */
  static pauseWorkout(session: WorkoutSession): WorkoutSession {
    session.status = 'paused';
    session.pausedAt = Date.now();
    return session;
  }

  /**
   * Resume a paused workout session
   */
  static resumeWorkout(session: WorkoutSession): WorkoutSession {
    session.status = 'in_progress';
    session.pausedAt = undefined;
    return session;
  }

  /**
   * Abandon a workout session
   */
  static abandonWorkout(session: WorkoutSession): WorkoutSession {
    session.status = 'abandoned';
    session.completedAt = Date.now();
    return session;
  }

  /**
   * Calculate workout completion percentage
   */
  static calculateCompletionPercentage(session: WorkoutSession): number {
    const totalExercises = session.exercises.length;
    if (totalExercises === 0) return 0;

    const completedExercises = session.exercises.filter(
      e => e.completedAt !== undefined
    ).length;

    return Math.round((completedExercises / totalExercises) * 100);
  }

  /**
   * Get current exercise and set in an active workout
   */
  static getCurrentPosition(session: WorkoutSession): {
    exerciseIndex: number;
    setIndex: number;
    exercise: ExerciseLog | null;
    isComplete: boolean;
  } {
    for (let i = 0; i < session.exercises.length; i++) {
      const exercise = session.exercises[i];
      
      // Find first incomplete exercise
      if (!exercise.completedAt) {
        // Count logged sets
        const loggedSets = exercise.sets.length;
        
        return {
          exerciseIndex: i,
          setIndex: loggedSets,
          exercise,
          isComplete: false,
        };
      }
    }

    // All exercises complete
    return {
      exerciseIndex: session.exercises.length - 1,
      setIndex: 0,
      exercise: null,
      isComplete: true,
    };
  }

  /**
   * Estimate max from body weight for new users (conservative)
   */
  private static estimateMaxFromBodyWeight(bodyWeight: number | undefined): number {
    if (!bodyWeight) return 45; // Empty barbell
    return Math.round((bodyWeight * 0.75) / 5) * 5;
  }

  /**
   * Generate unique ID for entities
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default WorkoutEngine;
