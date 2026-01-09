/**
 * Workout Slice Enhanced
 * 
 * Enhanced version supporting Asa B 2020 formula integration:
 * - Conditional sets with progressive disclosure
 * - Max attempt result tracking
 * - Down set generation
 * - Intensity percentage tracking
 * - Week-to-week progression
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  WorkoutSession, 
  ExerciseLog, 
  SetLog,
  WorkoutProgram,
  Week,
  Day,
  WeightCalculationResult,
  MaxLift
} from '../../types';
import {
  ConditionalSet,
  MaxAttemptResult,
  EnhancedSetLog,
  EnhancedWorkoutState,
  WeeklyMax
} from '../../types/enhanced';

interface EnhancedWorkoutSliceState {
  // Original state
  currentProgram: WorkoutProgram | null;
  currentWeek: Week | null;
  currentDay: Day | null;
  activeSession: WorkoutSession | null;
  calculatedWeights: Record<string, WeightCalculationResult>;
  loading: boolean;
  error: string | null;
  
  // Enhanced state for formula integration
  enhancedState: EnhancedWorkoutState | null;
  currentConditionalSets: Record<string, ConditionalSet[]>; // exerciseId -> sets
  visibleSets: Record<string, ConditionalSet[]>; // exerciseId -> visible sets
  completedSetNumbers: Record<string, number[]>; // exerciseId -> completed set numbers (using array for Redux serialization)
  lastMaxAttemptResult: MaxAttemptResult | null;
  pendingDownSets: Record<string, ConditionalSet[]>; // exerciseId -> down sets
  weeklyMaxes: WeeklyMax[];
  currentExerciseMaxes: Record<string, number>; // exerciseId -> current 4RM
}

const initialState: EnhancedWorkoutSliceState = {
  currentProgram: null,
  currentWeek: null,
  currentDay: null,
  activeSession: null,
  calculatedWeights: {},
  loading: false,
  error: null,
  
  // Enhanced state
  enhancedState: null,
  currentConditionalSets: {},
  visibleSets: {},
  completedSetNumbers: {},
  lastMaxAttemptResult: null,
  pendingDownSets: {},
  weeklyMaxes: [],
  currentExerciseMaxes: {},
};

const workoutSliceEnhanced = createSlice({
  name: 'workoutEnhanced',
  initialState,
  reducers: {
    // =====================================================================
    // ORIGINAL REDUCERS (Maintained for compatibility)
    // =====================================================================
    
    startSession: (state, action: PayloadAction<WorkoutSession>) => {
      state.activeSession = action.payload;
      state.activeSession.status = 'in_progress';
      state.activeSession.startedAt = Date.now();
      state.error = null;
      
      // Initialize enhanced state
      state.currentConditionalSets = {};
      state.visibleSets = {};
      state.completedSetNumbers = {};
      state.pendingDownSets = {};
    },

    logSet: (
      state,
      action: PayloadAction<{
        exerciseIndex: number;
        setLog: SetLog;
      }>
    ) => {
      if (state.activeSession) {
        const { exerciseIndex, setLog } = action.payload;
        const exercise = state.activeSession.exercises[exerciseIndex];
        
        if (exercise) {
          exercise.sets.push(setLog);
          
          if (!exercise.actualWeight) {
            exercise.actualWeight = setLog.weight;
          }
          
          // Track completed set number
          if (!state.completedSetNumbers[exercise.exerciseId]) {
            state.completedSetNumbers[exercise.exerciseId] = [];
          }
          if (!state.completedSetNumbers[exercise.exerciseId].includes(setLog.setNumber)) {
            state.completedSetNumbers[exercise.exerciseId].push(setLog.setNumber);
          }
        }
      }
    },

    completeExercise: (state, action: PayloadAction<number>) => {
      if (state.activeSession) {
        const exercise = state.activeSession.exercises[action.payload];
        if (exercise) {
          exercise.completedAt = Date.now();
        }
      }
    },

    pauseWorkout: (state) => {
      if (state.activeSession) {
        state.activeSession.status = 'paused';
        state.activeSession.pausedAt = Date.now();
      }
    },

    resumeWorkout: (state) => {
      if (state.activeSession) {
        state.activeSession.status = 'in_progress';
        state.activeSession.pausedAt = undefined;
      }
    },

    completeWorkout: (state) => {
      if (state.activeSession) {
        state.activeSession.status = 'completed';
        state.activeSession.completedAt = Date.now();
      }
    },

    abandonWorkout: (state) => {
      if (state.activeSession) {
        state.activeSession.status = 'abandoned';
        state.activeSession.completedAt = Date.now();
      }
    },

    clearActiveSession: (state) => {
      state.activeSession = null;
      state.currentConditionalSets = {};
      state.visibleSets = {};
      state.completedSetNumbers = {};
      state.lastMaxAttemptResult = null;
      state.pendingDownSets = {};
    },

    setCalculatedWeights: (
      state,
      action: PayloadAction<Record<string, WeightCalculationResult>>
    ) => {
      state.calculatedWeights = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // =====================================================================
    // NEW ENHANCED REDUCERS for Formula Integration
    // =====================================================================

    /**
     * Initialize conditional sets for an exercise
     * Generates pyramid sets using WorkoutEngineEnhanced
     */
    initializeConditionalSets: (
      state,
      action: PayloadAction<{
        exerciseId: string;
        sets: ConditionalSet[];
      }>
    ) => {
      const { exerciseId, sets } = action.payload;
      state.currentConditionalSets[exerciseId] = sets;
      state.visibleSets[exerciseId] = sets.filter(s => !s.isConditional || s.shouldDisplay);
      state.completedSetNumbers[exerciseId] = [];
    },

    /**
     * Log enhanced set with progression tracking
     * Handles max attempt evaluation and conditional set unlocking
     */
    logEnhancedSet: (
      state,
      action: PayloadAction<{
        exerciseIndex: number;
        setLog: EnhancedSetLog;
        maxAttemptResult?: MaxAttemptResult;
        unlockedSets?: ConditionalSet[];
        downSetsGenerated?: ConditionalSet[];
      }>
    ) => {
      if (!state.activeSession) return;

      const { 
        exerciseIndex, 
        setLog, 
        maxAttemptResult, 
        unlockedSets, 
        downSetsGenerated 
      } = action.payload;
      
      const exercise = state.activeSession.exercises[exerciseIndex];
      if (!exercise) return;

      // Add set to exercise
      exercise.sets.push(setLog);
      
      if (!exercise.actualWeight) {
        exercise.actualWeight = setLog.weight;
      }

      // Track completed set
      if (!state.completedSetNumbers[exercise.exerciseId]) {
        state.completedSetNumbers[exercise.exerciseId] = [];
      }
      if (!state.completedSetNumbers[exercise.exerciseId].includes(setLog.setNumber)) {
        state.completedSetNumbers[exercise.exerciseId].push(setLog.setNumber);
      }

      // Store max attempt result
      if (maxAttemptResult) {
        state.lastMaxAttemptResult = maxAttemptResult;
      }

      // Handle unlocked sets (progressive max attempts)
      if (unlockedSets && unlockedSets.length > 0) {
        const currentSets = state.currentConditionalSets[exercise.exerciseId] || [];
        state.currentConditionalSets[exercise.exerciseId] = [
          ...currentSets,
          ...unlockedSets
        ];
        
        // Update visible sets
        state.visibleSets[exercise.exerciseId] = [
          ...(state.visibleSets[exercise.exerciseId] || []),
          ...unlockedSets
        ];
      }

      // Handle down sets
      if (downSetsGenerated && downSetsGenerated.length > 0) {
        state.pendingDownSets[exercise.exerciseId] = downSetsGenerated;
      }
    },

    /**
     * Update visible sets after set completion
     * Re-evaluates all conditional sets to see if they should display
     */
    updateVisibleSets: (
      state,
      action: PayloadAction<{
        exerciseId: string;
        completedSets: SetLog[];
      }>
    ) => {
      const { exerciseId, completedSets } = action.payload;
      const allSets = state.currentConditionalSets[exerciseId] || [];
      
      // Update shouldDisplay for each set based on completed sets
      const updated = allSets.map(set => ({
        ...set,
        shouldDisplay: !set.isConditional || 
          completedSets.some(cs => cs.setNumber >= (set.setNumber - 1) && cs.reps >= 1)
      }));
      
      state.visibleSets[exerciseId] = updated.filter(s => s.shouldDisplay);
    },

    /**
     * Clear max attempt result (after modal dismissed)
     */
    clearMaxAttemptResult: (state) => {
      state.lastMaxAttemptResult = null;
    },

    /**
     * Activate down sets (add to current workout)
     */
    activateDownSets: (
      state,
      action: PayloadAction<{ exerciseId: string }>
    ) => {
      const { exerciseId } = action.payload;
      const downSets = state.pendingDownSets[exerciseId] || [];
      
      if (downSets.length > 0) {
        const currentSets = state.currentConditionalSets[exerciseId] || [];
        state.currentConditionalSets[exerciseId] = [...currentSets, ...downSets];
        state.visibleSets[exerciseId] = [...(state.visibleSets[exerciseId] || []), ...downSets];
        state.pendingDownSets[exerciseId] = [];
      }
    },

    /**
     * Set exercise max (for weight calculations)
     */
    setExerciseMax: (
      state,
      action: PayloadAction<{ exerciseId: string; weight: number }>
    ) => {
      const { exerciseId, weight } = action.payload;
      state.currentExerciseMaxes[exerciseId] = weight;
    },

    /**
     * Update weekly max after workout completion
     */
    addWeeklyMax: (state, action: PayloadAction<WeeklyMax>) => {
      state.weeklyMaxes.push(action.payload);
      
      // Update current max for this exercise
      state.currentExerciseMaxes[action.payload.exerciseId] = action.payload.weight;
    },

    /**
     * Batch update multiple weekly maxes
     */
    setWeeklyMaxes: (state, action: PayloadAction<WeeklyMax[]>) => {
      state.weeklyMaxes = action.payload;
      
      // Update current maxes
      action.payload.forEach(max => {
        state.currentExerciseMaxes[max.exerciseId] = max.weight;
      });
    },

    /**
     * Reset enhanced state for new exercise
     */
    resetEnhancedStateForExercise: (
      state,
      action: PayloadAction<{ exerciseId: string }>
    ) => {
      const { exerciseId } = action.payload;
      delete state.currentConditionalSets[exerciseId];
      delete state.visibleSets[exerciseId];
      delete state.completedSetNumbers[exerciseId];
      delete state.pendingDownSets[exerciseId];
      state.lastMaxAttemptResult = null;
    },
  },
});

export const {
  // Original actions
  startSession,
  logSet,
  completeExercise,
  pauseWorkout,
  resumeWorkout,
  completeWorkout,
  abandonWorkout,
  clearActiveSession,
  setCalculatedWeights,
  setLoading,
  setError,
  clearError,
  
  // Enhanced actions
  initializeConditionalSets,
  logEnhancedSet,
  updateVisibleSets,
  clearMaxAttemptResult,
  activateDownSets,
  setExerciseMax,
  addWeeklyMax,
  setWeeklyMaxes,
  resetEnhancedStateForExercise,
} = workoutSliceEnhanced.actions;

export default workoutSliceEnhanced.reducer;
