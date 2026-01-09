/**
 * WorkoutEngineEnhanced Service
 *
 * Enhanced workout orchestration using extracted Asa B 2020 formulas.
 * Implements:
 * - Pyramid set generation with conditional progression
 * - Progressive max attempts (+5 lb on success)
 * - Automatic down set generation on max attempt failures
 * - Intensity percentage tracking
 * - Week-to-week 4RM progression
 * - Real-time conditional set evaluation via SetConditionChecker
 *
 * Based on: formulas/FORMULA_IMPLEMENTATION_GUIDE.md
 */

import FormulaCalculator, {
  INTENSITY_PERCENTAGES,
  MaxAttemptResult as FormulaMaxAttemptResult,
  ConditionalSet as FormulaConditionalSet
} from './FormulaCalculatorEnhanced';

import SetConditionChecker from './SetConditionChecker';

import {
  WorkoutSession,
  ExerciseLog,
  SetLog,
  MaxLift,
  WeekType,
  Day,
  ExerciseTemplate,
} from '../types';

import {
  ConditionalSet,
  MaxAttemptResult,
  EnhancedSetLog,
  EnhancedWorkoutState,
  WeeklyMax,
  MaxAttemptHistory,
  INTENSITY_LEVELS,
  REST_BY_INTENSITY
} from '../types/enhanced';

export class WorkoutEngineEnhanced {
  /**
   * Generate complete workout sets for an exercise using pyramid structure
   * Implements the extracted formula pattern:
   * Set 1: 35% × 6 reps (warmup)
   * Set 2: 80% × 1 rep (primer) 
   * Set 3: 90% × 1 rep (build-up)
   * Set 4: 100% × 1 rep (max attempt)
   * Sets 5-6: Conditional progressive max attempts OR down sets
   */
  static generateWorkoutSets(
    exerciseId: string,
    fourRepMax: number,
    completedSets: SetLog[] = [],
    options: {
      includeProgressiveMaxAttempts?: boolean;
      includeDownSets?: boolean;
      numberOfDownSets?: number;
    } = {}
  ): ConditionalSet[] {
    const {
      includeProgressiveMaxAttempts = true,
      includeDownSets = true,
      numberOfDownSets = 3
    } = options;

    const sets: ConditionalSet[] = [];

    // Set 1: Warmup (35%)
    sets.push({
      setNumber: 1,
      weight: FormulaCalculator.calculateWeightByPercentage(
        fourRepMax, 
        INTENSITY_LEVELS.WARMUP_STANDARD
      ),
      targetReps: 6,
      restPeriod: '30s',
      intensityPercentage: INTENSITY_LEVELS.WARMUP_STANDARD,
      isConditional: false,
      shouldDisplay: true
    });

    // Set 2: Primer (80%)
    sets.push({
      setNumber: 2,
      weight: FormulaCalculator.calculateWeightByPercentage(
        fourRepMax, 
        INTENSITY_LEVELS.WORKING_HEAVY_2
      ),
      targetReps: 1,
      restPeriod: '1-2 MIN',
      intensityPercentage: INTENSITY_LEVELS.WORKING_HEAVY_2,
      isConditional: false,
      shouldDisplay: true
    });

    // Set 3: Build-up (90%)
    sets.push({
      setNumber: 3,
      weight: FormulaCalculator.calculateWeightByPercentage(
        fourRepMax, 
        INTENSITY_LEVELS.NEAR_MAX
      ),
      targetReps: 1,
      restPeriod: '1-2 MIN',
      intensityPercentage: INTENSITY_LEVELS.NEAR_MAX,
      isConditional: false,
      shouldDisplay: true
    });

    // Set 4: Max Attempt (100%)
    sets.push({
      setNumber: 4,
      weight: fourRepMax,
      targetReps: 1,
      restPeriod: '1-5 MIN',
      intensityPercentage: INTENSITY_LEVELS.MAX,
      isConditional: false,
      shouldDisplay: true
    });

    // Conditional Sets - Either Progressive Max Attempts OR Down Sets
    if (includeProgressiveMaxAttempts) {
      const maxAttempts = this.generateProgressiveMaxAttempts(
        fourRepMax,
        completedSets
      );
      sets.push(...maxAttempts);
    }

    // Down sets only added if explicitly requested or max attempt failed
    // (Will be dynamically added based on set 4 result)

    return sets;
  }

  /**
   * Generate progressive max attempt sets (conditional)
   * Set 5: currentMax + 5 lbs (if set 4 successful)
   * Set 6: currentMax + 10 lbs (if set 5 successful)
   */
  private static generateProgressiveMaxAttempts(
    baseMax: number,
    completedSets: SetLog[] = []
  ): ConditionalSet[] {
    const attempts: ConditionalSet[] = [];

    // Set 5: First progression attempt (+5 lbs)
    const set4Complete = completedSets.find(s => s.setNumber === 4);
    const set5ShouldDisplay = set4Complete ? set4Complete.reps >= 1 : false;

    attempts.push({
      setNumber: 5,
      weight: baseMax + 5,
      targetReps: 1,
      restPeriod: '1-5 MIN',
      intensityPercentage: INTENSITY_LEVELS.OVER_MAX,
      isConditional: true,
      condition: {
        type: 'reps_achieved',
        requiredSets: 4,
        requiredReps: 1
      },
      shouldDisplay: set5ShouldDisplay
    });

    // Set 6: Second progression attempt (+10 lbs)
    const set5Complete = completedSets.find(s => s.setNumber === 5);
    const set6ShouldDisplay = set5Complete ? set5Complete.reps >= 1 : false;

    attempts.push({
      setNumber: 6,
      weight: baseMax + 10,
      targetReps: 1,
      restPeriod: '1-5 MIN',
      intensityPercentage: INTENSITY_LEVELS.OVER_MAX,
      isConditional: true,
      condition: {
        type: 'reps_achieved',
        requiredSets: 5,
        requiredReps: 1
      },
      shouldDisplay: set6ShouldDisplay
    });

    return attempts;
  }

  /**
   * Generate down sets for volume work after failed max attempts
   * Excel: IF(working_sets_complete AND max_failed, show_down_sets)
   * Weight: 80% of 4RM
   * Reps: 6-8, 6-8, REP OUT
   */
  static generateDownSets(
    fourRepMax: number,
    startingSetNumber: number = 5,
    numberOfDownSets: number = 3
  ): ConditionalSet[] {
    const downSets: ConditionalSet[] = [];
    const downSetWeight = FormulaCalculator.calculateWeightByPercentage(
      fourRepMax,
      INTENSITY_LEVELS.WORKING_HEAVY_2 // 80%
    );

    for (let i = 0; i < numberOfDownSets; i++) {
      const setNumber = startingSetNumber + i;
      const isLastSet = i === numberOfDownSets - 1;

      downSets.push({
        setNumber,
        weight: downSetWeight,
        targetReps: isLastSet ? 'REP_OUT' : 8,
        restPeriod: isLastSet ? '1 MIN' : '1-2 MIN',
        intensityPercentage: INTENSITY_LEVELS.WORKING_HEAVY_2,
        isConditional: true,
        condition: {
          type: 'previous_sets_complete',
          requiredSets: 4  // All working sets must be done
        },
        shouldDisplay: true // Will be evaluated by shouldDisplaySet()
      });
    }

    return downSets;
  }

  /**
   * Evaluate if a conditional set should be displayed
   * Implements: IF(OR(ISBLANK(prev1), ISBLANK(prev2)), "", set_value)
   */
  static shouldDisplaySet(
    set: ConditionalSet,
    completedSets: SetLog[]
  ): boolean {
    if (!set.isConditional || !set.condition) {
      return true;
    }

    const { type, requiredSets, requiredReps, requiredWeight } = set.condition;

    switch (type) {
      case 'always':
        return true;

      case 'previous_sets_complete': {
        const requiredCount = requiredSets || (set.setNumber - 1);
        const completedWithReps = completedSets.filter(s => s.reps > 0).length;
        return completedWithReps >= requiredCount;
      }

      case 'reps_achieved': {
        const previousSetNumber = set.setNumber - 1;
        const previousSet = completedSets.find(s => s.setNumber === previousSetNumber);
        if (!previousSet) return false;

        const needed = requiredReps || 1;
        return previousSet.reps >= needed;
      }

      case 'weight_achieved': {
        const previousSetNumber = set.setNumber - 1;
        const previousSet = completedSets.find(s => s.setNumber === previousSetNumber);
        if (!previousSet) return false;

        const needed = requiredWeight || 0;
        return previousSet.weight >= needed;
      }

      default:
        return true;
    }
  }

  /**
   * Evaluate max attempt result and determine next action
   * Formula: IF(reps < 1, "PROCEED TO DOWN SETS", "NEW 1 REP MAX ATTEMPT")
   */
  static evaluateMaxAttemptResult(
    currentMax: number,
    repsCompleted: number,
    targetReps: number = 1,
    setNumber: number = 4
  ): MaxAttemptResult {
    if (repsCompleted < targetReps) {
      return {
        success: false,
        instruction: 'PROCEED_TO_DOWN_SETS',
        message: 'Max attempt not completed. Switching to volume work (down sets) to build strength.'
      };
    }

    // Success! Calculate new max
    const newMax = currentMax + 5;

    return {
      success: true,
      newMax,
      instruction: 'NEW_MAX_ATTEMPT',
      nextWeight: newMax,
      message: `🎉 Success! New max: ${newMax} lbs (+5 lbs). Ready for next attempt?`
    };
  }

  /**
   * Evaluate rep-based progression (4-rep max attempts)
   * Formula: IF(reps >= 6, currentMax + 5, no_progression)
   */
  static evaluateRepBasedProgression(
    currentMax: number,
    targetReps: number,
    achievedReps: number
  ): MaxAttemptResult {
    const progressionThreshold = targetReps + 2;

    if (achievedReps >= progressionThreshold) {
      return {
        success: true,
        newMax: currentMax + 5,
        instruction: 'NEW_MAX_ATTEMPT',
        nextWeight: currentMax + 5,
        message: `💪 Exceeded target! New ${targetReps}RM: ${currentMax + 5} lbs`
      };
    }

    return {
      success: false,
      instruction: 'PROCEED_TO_DOWN_SETS',
      message: `Good work! Complete down sets for volume.`
    };
  }

  /**
   * Log a set and automatically evaluate progression
   * Enhanced with:
   * - Intensity percentage tracking
   * - Automatic max attempt evaluation
   * - Conditional set unlocking
   * - Down set generation on failure
   */
  static logSetWithProgression(
    exerciseLog: ExerciseLog,
    setNumber: number,
    weight: number,
    reps: number,
    restSeconds: number,
    fourRepMax: number,
    perceivedEffort?: number
  ): {
    setLog: EnhancedSetLog;
    maxAttemptResult?: MaxAttemptResult;
    unlockedSets: ConditionalSet[];
    downSetsGenerated: ConditionalSet[];
  } {
    // Calculate intensity percentage
    const intensityPercentage = weight / fourRepMax;

    // Determine if this is a max attempt (set 4+)
    const isMaxAttempt = setNumber >= 4 && intensityPercentage >= 0.90;

    // Create enhanced set log
    const setLog: EnhancedSetLog = {
      id: this.generateId(),
      exerciseLogId: exerciseLog.id,
      setNumber,
      weight,
      reps,
      targetReps: { min: 1, max: 1 }, // Will be updated based on set type
      restSeconds,
      completedAt: Date.now(),
      perceivedEffort,
      intensityPercentage,
      isConditional: setNumber > 4,
      isMaxAttempt
    };

    // Add to exercise log
    exerciseLog.sets.push(setLog);

    // Evaluate max attempt if applicable
    let maxAttemptResult: MaxAttemptResult | undefined;
    let unlockedSets: ConditionalSet[] = [];
    let downSetsGenerated: ConditionalSet[] = [];

    if (isMaxAttempt) {
      maxAttemptResult = this.evaluateMaxAttemptResult(
        fourRepMax,
        reps,
        1,
        setNumber
      );

      // If successful, unlock next max attempt
      if (maxAttemptResult.success && maxAttemptResult.newMax) {
        unlockedSets = [{
          setNumber: setNumber + 1,
          weight: maxAttemptResult.newMax,
          targetReps: 1,
          restPeriod: '1-5 MIN',
          intensityPercentage: INTENSITY_LEVELS.OVER_MAX,
          isConditional: true,
          condition: {
            type: 'reps_achieved',
            requiredSets: setNumber,
            requiredReps: 1
          },
          shouldDisplay: true
        }];
      }

      // If failed on set 4 (initial max attempt), generate down sets
      if (!maxAttemptResult.success && setNumber === 4) {
        downSetsGenerated = this.generateDownSets(fourRepMax, 5, 3);
      }
    }

    return {
      setLog,
      maxAttemptResult,
      unlockedSets,
      downSetsGenerated
    };
  }

  /**
   * Create workout session with pyramid set structure
   * Enhanced to pre-generate all potential sets (including conditional ones)
   */
  static async createEnhancedWorkoutSession(
    userId: string,
    weekNumber: number,
    dayNumber: number,
    day: Day,
    userMaxes: Record<string, MaxLift>,
    bodyWeight?: number
  ): Promise<{
    session: WorkoutSession;
    enhancedState: EnhancedWorkoutState;
  }> {
    const sessionId = this.generateId();
    const exercises: ExerciseLog[] = [];

    // Pre-generate all potential sets for planning
    const allConditionalSets: ConditionalSet[] = [];

    for (const exerciseTemplate of day.exercises) {
      const userMax = userMaxes[exerciseTemplate.exerciseId];
      const fourRepMax = userMax?.weight || this.estimateMaxFromBodyWeight(bodyWeight);

      // Generate pyramid sets
      const exerciseSets = this.generateWorkoutSets(
        exerciseTemplate.exerciseId,
        fourRepMax,
        [], // No completed sets yet
        {
          includeProgressiveMaxAttempts: true,
          includeDownSets: false // Don't pre-generate, will be dynamic
        }
      );

      allConditionalSets.push(...exerciseSets);

      // Create exercise log
      const exerciseLog: ExerciseLog = {
        id: this.generateId(),
        sessionId,
        exerciseId: exerciseTemplate.exerciseId,
        order: exerciseTemplate.order,
        suggestedWeight: exerciseSets[0]?.weight || 0,
        sets: []
      };

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
      bodyWeight
    };

    const enhancedState: EnhancedWorkoutState = {
      currentSets: allConditionalSets,
      displayedSets: allConditionalSets.filter(s => !s.isConditional),
      pendingDownSets: [],
      maxAttemptInProgress: false
    };

    return {
      session,
      enhancedState
    };
  }

  /**
   * Update which sets should be displayed after set completion
   * Implements progressive disclosure logic
   */
  static updateDisplayedSets(
    allSets: ConditionalSet[],
    completedSets: SetLog[]
  ): ConditionalSet[] {
    return allSets.map(set => ({
      ...set,
      shouldDisplay: this.shouldDisplaySet(set, completedSets)
    })).filter(set => set.shouldDisplay);
  }

  /**
   * Determine if down sets should be generated based on max attempt result
   */
  static shouldGenerateDownSets(
    setNumber: number,
    repsCompleted: number,
    isMaxAttempt: boolean
  ): boolean {
    // Generate down sets if:
    // 1. This was a max attempt (set 4)
    // 2. User failed to complete target rep
    return setNumber === 4 && isMaxAttempt && repsCompleted < 1;
  }

  /**
   * Complete workout and calculate new 4RMs
   * Formula: newMax = highest_successful_weight_where_reps_>=_1
   */
  static completeWorkoutWithProgression(
    session: WorkoutSession,
    currentMaxes: Record<string, MaxLift>
  ): {
    session: WorkoutSession;
    newPRs: MaxLift[];
    updatedMaxes: WeeklyMax[];
    stats: {
      totalVolume: number;
      duration: number;
      exercisesCompleted: number;
      setsCompleted: number;
      totalReps: number;
      progressionCount: number;
    };
  } {
    const now = Date.now();
    session.completedAt = now;
    session.status = 'completed';

    const newPRs: MaxLift[] = [];
    const updatedMaxes: WeeklyMax[] = [];
    let totalVolume = 0;
    let setsCompleted = 0;
    let totalReps = 0;
    let progressionCount = 0;

    for (const exercise of session.exercises) {
      setsCompleted += exercise.sets.length;
      
      // Calculate volume for this exercise
      const exerciseVolume = exercise.sets.reduce(
        (sum, set) => sum + (set.weight * set.reps), 
        0
      );
      totalVolume += exerciseVolume;
      
      const exerciseTotalReps = exercise.sets.reduce(
        (sum, set) => sum + set.reps, 
        0
      );
      totalReps += exerciseTotalReps;

      // Calculate new max using formula
      const currentMax = currentMaxes[exercise.exerciseId];
      if (currentMax) {
        const newMax = FormulaCalculator.calculateNewMax(
          currentMax.weight,
          exercise.sets
        );

        // Check for progression
        if (newMax > currentMax.weight) {
          progressionCount++;

          // Create new PR record
          newPRs.push({
            id: this.generateId(),
            userId: session.userId,
            exerciseId: exercise.exerciseId,
            weight: newMax,
            reps: 1,
            dateAchieved: now,
            verified: false,
            workoutSessionId: session.id
          });

          // Track weekly max
          updatedMaxes.push({
            id: this.generateId(),
            userId: session.userId,
            exerciseId: exercise.exerciseId,
            weekNumber: session.weekNumber,
            weight: newMax,
            achievedAt: now,
            progressionFromPreviousWeek: newMax - currentMax.weight
          });
        }
      }
    }

    const duration = session.completedAt - session.startedAt;

    return {
      session,
      newPRs,
      updatedMaxes,
      stats: {
        totalVolume,
        duration: Math.floor(duration / 1000),
        exercisesCompleted: session.exercises.length,
        setsCompleted,
        totalReps,
        progressionCount
      }
    };
  }

  /**
   * Calculate intensity-based rest period
   * Formula mapping from extracted formulas
   */
  static calculateRestPeriod(
    weight: number,
    fourRepMax: number,
    setType?: 'warmup' | 'working' | 'max' | 'downset'
  ): string {
    if (setType) {
      const restMap: Record<string, string> = {
        'warmup': '30s',
        'working': '1-2 MIN',
        'max': '1-5 MIN',
        'downset': '1-2 MIN'
      };
      return restMap[setType] || '1 MIN';
    }

    // Calculate based on intensity percentage
    const intensity = weight / fourRepMax;

    if (intensity <= 0.35) return '30s';
    if (intensity >= 0.90) return '1-5 MIN';
    if (intensity >= 0.65) return '1-2 MIN';

    return '1 MIN';
  }

  /**
   * Convert rest period string to seconds
   */
  static parseRestPeriodToSeconds(restPeriod: string): number {
    if (restPeriod === '30s') return 30;
    if (restPeriod === '1 MIN') return 60;
    if (restPeriod === '1-2 MIN') return 90; // Use midpoint
    if (restPeriod === '1-5 MIN') return 180; // Use 3 minutes
    if (restPeriod === 'REP OUT') return 60;

    // Parse custom formats
    const match = restPeriod.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]) * 60;
    }

    return 60; // Default 1 minute
  }

  /**
   * Get exercise display info for current set
   */
  static getExerciseDisplayInfo(
    set: ConditionalSet,
    fourRepMax: number
  ): {
    intensityLabel: string;
    intensityColor: string;
    restLabel: string;
    guidance: string;
  } {
    const pct = set.intensityPercentage;
    let intensityLabel: string;
    let intensityColor: string;
    let guidance: string;

    if (pct <= 0.35) {
      intensityLabel = '35% - Warmup';
      intensityColor = '#4CAF50'; // Green
      guidance = 'Light weight, focus on form and activation';
    } else if (pct <= 0.65) {
      intensityLabel = `${Math.round(pct * 100)}% - Moderate`;
      intensityColor = '#2196F3'; // Blue
      guidance = 'Working weight, maintain good form';
    } else if (pct <= 0.85) {
      intensityLabel = `${Math.round(pct * 100)}% - Heavy`;
      intensityColor = '#FF9800'; // Orange
      guidance = 'Challenging weight, focus on technique';
    } else {
      intensityLabel = `${Math.round(pct * 100)}% - Max Effort`;
      intensityColor = '#F44336'; // Red
      guidance = 'Maximum intensity, give it everything!';
    }

    return {
      intensityLabel,
      intensityColor,
      restLabel: set.restPeriod,
      guidance
    };
  }

  /**
   * Create max determination week session
   * Progressive loading: 45, 50, 55, 60, ... until failure
   */
  static createMaxDeterminationSession(
    userId: string,
    exerciseId: string,
    estimatedMax: number = 100
  ): {
    sessionId: string;
    sets: ConditionalSet[];
    instructions: string;
  } {
    const sessionId = this.generateId();
    const weights = FormulaCalculator.generateMaxDeterminationSets(45, 15);

    const sets: ConditionalSet[] = weights.map((weight, index) => ({
      setNumber: index + 1,
      weight,
      targetReps: 1,
      restPeriod: '1-5 MIN',
      intensityPercentage: weight / (estimatedMax || 100),
      isConditional: index > 0,
      condition: index > 0 ? {
        type: 'reps_achieved',
        requiredSets: index,
        requiredReps: 1
      } : undefined,
      shouldDisplay: index === 0 // Only first set visible initially
    }));

    return {
      sessionId,
      sets,
      instructions: 'Start at 45 lbs. Complete 1 rep, then increase by 5 lbs. Continue until you cannot complete 1 rep. Your max is the last successful weight.'
    };
  }

  /**
   * Get visible sets for current exercise state
   */
  static getVisibleSets(
    allSets: ConditionalSet[],
    completedSets: SetLog[]
  ): ConditionalSet[] {
    return allSets.filter(set => this.shouldDisplaySet(set, completedSets));
  }

  /**
   * Get next set to perform
   */
  static getNextSet(
    allSets: ConditionalSet[],
    completedSets: SetLog[]
  ): ConditionalSet | null {
    const completedSetNumbers = new Set(completedSets.map(s => s.setNumber));
    
    for (const set of allSets) {
      if (!completedSetNumbers.has(set.setNumber) && this.shouldDisplaySet(set, completedSets)) {
        return set;
      }
    }

    return null;
  }

  /**
   * Estimate max from body weight for new users
   */
  private static estimateMaxFromBodyWeight(bodyWeight: number | undefined): number {
    if (!bodyWeight) return 45;
    return Math.round((bodyWeight * 0.75) / 5) * 5;
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format progression message for user
   */
  static formatProgressionMessage(result: MaxAttemptResult): string {
    if (result.success && result.newMax) {
      return `🎉 New Max Unlocked: ${result.newMax} lbs! (+5 lbs progression)`;
    }

    if (result.instruction === 'PROCEED_TO_DOWN_SETS') {
      return '💪 Switching to down sets for volume work';
    }

    return 'Great work! Keep it up!';
  }

  /**
   * Calculate statistics for completed exercise
   */
  static calculateExerciseStats(exerciseSets: SetLog[]): {
    totalVolume: number;
    averageReps: number;
    heaviestWeight: number;
    totalReps: number;
    maxAttempted: boolean;
    maxSuccessful: boolean;
  } {
    const totalVolume = exerciseSets.reduce(
      (sum, set) => sum + (set.weight * set.reps),
      0
    );

    const totalReps = exerciseSets.reduce(
      (sum, set) => sum + set.reps,
      0
    );

    const averageReps = exerciseSets.length > 0 
      ? totalReps / exerciseSets.length 
      : 0;

    const heaviestWeight = Math.max(...exerciseSets.map(s => s.weight), 0);

    // Check if max was attempted (set 4+)
    const maxAttempted = exerciseSets.some(s => s.setNumber >= 4);
    
    // Check if max was successful
    const maxSets = exerciseSets.filter(s => s.setNumber >= 4);
    const maxSuccessful = maxSets.some(s => s.reps >= 1);

    return {
      totalVolume,
      averageReps: Math.round(averageReps * 10) / 10,
      heaviestWeight,
      totalReps,
      maxAttempted,
      maxSuccessful
    };
  }

  /**
   * Validate workout progression is following plan
   */
  static validateWorkoutProgression(
    weekNumber: number,
    expectedMaxes: Record<string, number>,
    actualMaxes: Record<string, number>
  ): {
    isOnTrack: boolean;
    exercises: {
      exerciseId: string;
      expected: number;
      actual: number;
      variance: number;
      status: 'on_track' | 'ahead' | 'behind';
    }[];
  } {
    const exercises = Object.keys(expectedMaxes).map(exerciseId => {
      const expected = expectedMaxes[exerciseId];
      const actual = actualMaxes[exerciseId] || 0;
      const variance = actual - expected;

      let status: 'on_track' | 'ahead' | 'behind';
      if (variance >= 10) {
        status = 'ahead';
      } else if (variance <= -10) {
        status = 'behind';
      } else {
        status = 'on_track';
      }

      return {
        exerciseId,
        expected,
        actual,
        variance,
        status
      };
    });

    const isOnTrack = exercises.every(e => e.status !== 'behind');

    return {
      isOnTrack,
      exercises
    };
  }

  /**
   * Generate workout preview for planning
   */
  static generateWorkoutPreview(
    exerciseId: string,
    exerciseName: string,
    fourRepMax: number
  ): {
    exerciseName: string;
    estimatedDuration: string;
    sets: {
      setNumber: number;
      weight: number;
      reps: string;
      intensity: string;
      rest: string;
    }[];
  } {
    const sets = this.generateWorkoutSets(exerciseId, fourRepMax, [], {
      includeProgressiveMaxAttempts: false // Don't show conditional in preview
    });

    const baseSets = sets.filter(s => !s.isConditional).slice(0, 4);

    const estimatedTimeMinutes = baseSets.reduce((total, set) => {
      const restSeconds = this.parseRestPeriodToSeconds(set.restPeriod);
      const setTimeSeconds = 30; // Estimate 30s per set
      return total + ((setTimeSeconds + restSeconds) / 60);
    }, 0);

    return {
      exerciseName,
      estimatedDuration: `${Math.ceil(estimatedTimeMinutes)} min`,
      sets: baseSets.map(set => ({
        setNumber: set.setNumber,
        weight: set.weight,
        reps: typeof set.targetReps === 'string' ? set.targetReps : `${set.targetReps}`,
        intensity: `${Math.round(set.intensityPercentage * 100)}%`,
        rest: set.restPeriod
      }))
    };
  }
}

export default WorkoutEngineEnhanced;
