/**
 * Progress Slice
 * 
 * Manages user progress tracking, personal records, and body weight history.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProgressState, MaxLift, PersonalRecord, BodyWeightEntry, WorkoutSession } from '../../types';

const initialState: ProgressState = {
  maxLifts: [],
  recentWorkouts: [],
  bodyWeights: [],
  personalRecords: [],
  loading: false,
  error: null,
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
} = progressSlice.actions;

export default progressSlice.reducer;
