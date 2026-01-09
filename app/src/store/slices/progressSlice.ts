/**
 * Progress Slice
 *
 * Manages user progress tracking, personal records, body weight history,
 * max determination week progress, and weekly progression tracking.
 * Phase 4.5: Added analytics state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProgressState, MaxLift, PersonalRecord, BodyWeightEntry, WorkoutSession } from '../../types';
import { MaxTestingProgress, MaxAttempt } from '../../services/MaxDeterminationService';
import { WeeklyMax, MaxAttemptHistory } from '../../types/enhanced';
import { WorkoutAnalytics } from '../../services/AnalyticsService';

interface ExtendedProgressState extends ProgressState {
  maxTestingProgress: {
    completed: boolean;
    currentExerciseIndex: number;
    exercises: MaxTestingProgress[];
    startedAt?: number;
  };
  weeklyMaxes: WeeklyMax[];
  maxAttemptHistory: MaxAttemptHistory[];
  workoutAnalytics: WorkoutAnalytics[]; // Phase 4.5
}

const initialState: ExtendedProgressState = {
  maxLifts: [],
  recentWorkouts: [],
  bodyWeights: [],
  personalRecords: [],
  loading: false,
  error: null,
  maxTestingProgress: {
    completed: false,
    currentExerciseIndex: 0,
    exercises: [],
    startedAt: undefined,
  },
  weeklyMaxes: [],
  maxAttemptHistory: [],
  workoutAnalytics: [], // Phase 4.5
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    // Add new max lift
    addMaxLift: (state, action: PayloadAction<MaxLift>) => {
      const existing = state.maxLifts.findIndex(
        m => m.exerciseId === action.payload.exerciseId && m.userId === action.payload.userId
      );
      
      if (existing >= 0) {
        // Update existing max if new weight is higher
        if (action.payload.weight > state.maxLifts[existing].weight) {
          state.maxLifts[existing] = action.payload;
        }
      } else {
        state.maxLifts.push(action.payload);
      }
    },

    // Add personal record
    addPersonalRecord: (state, action: PayloadAction<PersonalRecord>) => {
      state.personalRecords.unshift(action.payload); // Add to front (most recent first)
    },

    // Add body weight entry
    addBodyWeight: (state, action: PayloadAction<BodyWeightEntry>) => {
      state.bodyWeights.push(action.payload);
    },

    // Add completed workout to recent history
    addRecentWorkout: (state, action: PayloadAction<WorkoutSession>) => {
      state.recentWorkouts.unshift(action.payload);
      // Keep only last 30 workouts in memory
      if (state.recentWorkouts.length > 30) {
        state.recentWorkouts = state.recentWorkouts.slice(0, 30);
      }
    },

    // Load progress data from database
    loadProgressData: (
      state,
      action: PayloadAction<{
        maxLifts: MaxLift[];
        personalRecords: PersonalRecord[];
        bodyWeights: BodyWeightEntry[];
        recentWorkouts: WorkoutSession[];
      }>
    ) => {
      state.maxLifts = action.payload.maxLifts;
      state.personalRecords = action.payload.personalRecords;
      state.bodyWeights = action.payload.bodyWeights;
      state.recentWorkouts = action.payload.recentWorkouts;
      state.loading = false;
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

    // Clear all progress data
    clearProgress: (state) => {
      return initialState;
    },

    // Max Testing Progress Actions
    startMaxTesting: (state, action: PayloadAction<MaxTestingProgress[]>) => {
      state.maxTestingProgress = {
        completed: false,
        currentExerciseIndex: 0,
        exercises: action.payload,
        startedAt: Date.now(),
      };
    },

    addMaxAttempt: (
      state,
      action: PayloadAction<{ exerciseId: string; attempt: MaxAttempt }>
    ) => {
      const exercise = state.maxTestingProgress.exercises.find(
        e => e.exerciseId === action.payload.exerciseId
      );
      if (exercise) {
        exercise.attempts.push(action.payload.attempt);
      }
    },

    completeExerciseMaxTest: (
      state,
      action: PayloadAction<{ exerciseId: string; determined4RM: number }>
    ) => {
      const exercise = state.maxTestingProgress.exercises.find(
        e => e.exerciseId === action.payload.exerciseId
      );
      if (exercise) {
        exercise.completed = true;
        exercise.determined4RM = action.payload.determined4RM;
      }
    },

    moveToNextExercise: (state) => {
      if (state.maxTestingProgress.currentExerciseIndex < state.maxTestingProgress.exercises.length - 1) {
        state.maxTestingProgress.currentExerciseIndex += 1;
      }
    },

    moveToPreviousExercise: (state) => {
      if (state.maxTestingProgress.currentExerciseIndex > 0) {
        state.maxTestingProgress.currentExerciseIndex -= 1;
      }
    },

    completeMaxTesting: (state, action: PayloadAction<MaxLift[]>) => {
      state.maxTestingProgress.completed = true;
      // Add all determined max lifts
      action.payload.forEach(maxLift => {
        const existing = state.maxLifts.findIndex(
          m => m.exerciseId === maxLift.exerciseId && m.userId === maxLift.userId
        );
        if (existing >= 0) {
          state.maxLifts[existing] = maxLift;
        } else {
          state.maxLifts.push(maxLift);
        }
      });
    },

    resetMaxTesting: (state) => {
      state.maxTestingProgress = {
        completed: false,
        currentExerciseIndex: 0,
        exercises: [],
        startedAt: undefined,
      };
    },

    // Weekly Progression Actions
    addWeeklyMax: (state, action: PayloadAction<WeeklyMax>) => {
      state.weeklyMaxes.push(action.payload);
    },

    updateWeeklyMax: (state, action: PayloadAction<WeeklyMax>) => {
      const index = state.weeklyMaxes.findIndex(
        m => m.id === action.payload.id
      );
      if (index >= 0) {
        state.weeklyMaxes[index] = action.payload;
      }
    },

    loadWeeklyMaxes: (state, action: PayloadAction<WeeklyMax[]>) => {
      state.weeklyMaxes = action.payload;
    },

    // Max Attempt History Actions
    addMaxAttemptToHistory: (state, action: PayloadAction<MaxAttemptHistory>) => {
      state.maxAttemptHistory.push(action.payload);
    },

    loadMaxAttemptHistory: (state, action: PayloadAction<MaxAttemptHistory[]>) => {
      state.maxAttemptHistory = action.payload;
    },

    clearProgressionHistory: (state) => {
      state.weeklyMaxes = [];
      state.maxAttemptHistory = [];
    },

    // Phase 4.5: Analytics Actions
    addWorkoutAnalytics: (state, action: PayloadAction<WorkoutAnalytics>) => {
      state.workoutAnalytics.unshift(action.payload);
      // Keep only last 30 analytics entries
      if (state.workoutAnalytics.length > 30) {
        state.workoutAnalytics = state.workoutAnalytics.slice(0, 30);
      }
    },

    loadWorkoutAnalytics: (state, action: PayloadAction<WorkoutAnalytics[]>) => {
      state.workoutAnalytics = action.payload;
    },

    clearWorkoutAnalytics: (state) => {
      state.workoutAnalytics = [];
    },
  },
});

export const {
  addMaxLift,
  addPersonalRecord,
  addBodyWeight,
  addRecentWorkout,
  loadProgressData,
  setLoading,
  setError,
  clearProgress,
  startMaxTesting,
  addMaxAttempt,
  completeExerciseMaxTest,
  moveToNextExercise,
  moveToPreviousExercise,
  completeMaxTesting,
  resetMaxTesting,
  addWeeklyMax,
  updateWeeklyMax,
  loadWeeklyMaxes,
  addMaxAttemptToHistory,
  loadMaxAttemptHistory,
  clearProgressionHistory,
  addWorkoutAnalytics,
  loadWorkoutAnalytics,
  clearWorkoutAnalytics,
} = progressSlice.actions;

export default progressSlice.reducer;
