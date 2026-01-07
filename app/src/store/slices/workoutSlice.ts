/**
 * Workout Slice
 * 
 * Manages active workout sessions, calculated weights, and workout flow.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutState, WorkoutSession, ExerciseLog, SetLog, WeightCalculationResult } from '../../types';

const initialState: WorkoutState = {
  currentProgram: null,
  currentWeek: null,
  currentDay: null,
  activeSession: null,
  calculatedWeights: {},
  loading: false,
  error: null,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    // Start a new workout session
    startSession: (state, action: PayloadAction<WorkoutSession>) => {
      state.activeSession = action.payload;
      state.activeSession.status = 'in_progress';
      state.activeSession.startedAt = new Date();
      state.error = null;
    },

    // Log a set during active workout
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
          
          // Update actual weight if first set
          if (!exercise.actualWeight) {
            exercise.actualWeight = setLog.weight;
          }
        }
      }
    },

    // Complete current exercise
    completeExercise: (state, action: PayloadAction<number>) => {
      if (state.activeSession) {
        const exercise = state.activeSession.exercises[action.payload];
        if (exercise) {
          exercise.completedAt = Date.now();
        }
      }
    },

    // Pause active workout
    pauseWorkout: (state) => {
      if (state.activeSession) {
        state.activeSession.status = 'paused';
        state.activeSession.pausedAt = Date.now();
      }
    },

    // Resume paused workout
    resumeWorkout: (state) => {
      if (state.activeSession) {
        state.activeSession.status = 'in_progress';
        state.activeSession.pausedAt = undefined;
      }
    },

    // Complete workout session
    completeWorkout: (state) => {
      if (state.activeSession) {
        state.activeSession.status = 'completed';
        state.activeSession.completedAt = new Date();
      }
    },

    // Abandon workout
    abandonWorkout: (state) => {
      if (state.activeSession) {
        state.activeSession.status = 'abandoned';
        state.activeSession.completedAt = new Date();
      }
    },

    // Clear active session
    clearActiveSession: (state) => {
      state.activeSession = null;
    },

    // Set calculated weights for exercises
    setCalculatedWeights: (
      state,
      action: PayloadAction<Record<string, WeightCalculationResult>>
    ) => {
      state.calculatedWeights = action.payload;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
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
} = workoutSlice.actions;

export default workoutSlice.reducer;
