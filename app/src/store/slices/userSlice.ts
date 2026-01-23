/**
 * User Slice
 *
 * Manages user profile state, onboarding status, and preferences.
 * All users now use the protocol system (P1/P2/P3).
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserProfile, ExperienceLevel, UserState, ExerciseSubstitution } from '../../types';

const initialState: UserState = {
  currentUser: null,
  profile: null,
  isOnboarded: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Create new user
    createUser: (
      state,
      action: PayloadAction<{ name: string; experienceLevel: ExperienceLevel }>
    ) => {
      const { name, experienceLevel } = action.payload;
      const now = Date.now();
      state.currentUser = {
        id: `user-${now}`,
        name,
        experienceLevel,
        currentWeek: 0,
        currentDay: 1,
        createdAt: now,
        lastActive: now,
      };
      state.loading = false;
      state.error = null;
    },

    // Initialize user profile
    initializeProfile: (state, action: PayloadAction<{ userId: string; currentPhase: string }>) => {
      const { userId, currentPhase } = action.payload;
      state.profile = {
        userId,
        currentPhase,
        currentWeek: 0,
        currentDay: 1,
        maxLifts: {},
        preferredExercises: {},
        exerciseSubstitutions: [],
        permanentSubstitutions: {},
        protocolPreferences: {
          preferredP1Frequency: 2, // 2 weeks between P1 tests
          autoSuggestP1: true,
          showReadinessSignals: true,
        },
      };
    },

    // Update user profile
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    // Set onboarding complete
    completeOnboarding: (state) => {
      state.isOnboarded = true;
    },

    // Update current workout position
    updateWorkoutPosition: (
      state,
      action: PayloadAction<{ week: number; day: number }>
    ) => {
      if (state.currentUser) {
        state.currentUser.currentWeek = action.payload.week;
        state.currentUser.currentDay = action.payload.day;
        state.currentUser.lastActive = Date.now();
      }
    },

    // Update user's max lifts in profile
    updateMaxLifts: (
      state,
      action: PayloadAction<{ exerciseId: string; weight: number; reps: number }>
    ) => {
      if (state.profile) {
        const { exerciseId, weight, reps } = action.payload;
        state.profile.maxLifts[exerciseId] = {
          id: `max-${Date.now()}`,
          userId: state.currentUser?.id || '',
          exerciseId,
          weight,
          reps,
          dateAchieved: Date.now(),
          verified: true,
        };
      }
    },

    updateProfileImage: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.profileImage = action.payload;
      }
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

    // Reset user state (logout)
    resetUser: (state) => {
      return initialState;
    },
  },
});

export const {
  createUser,
  initializeProfile,
  updateProfile,
  completeOnboarding,
  updateWorkoutPosition,
  updateMaxLifts,
  updateProfileImage,
  setLoading,
  setError,
  clearError,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;
