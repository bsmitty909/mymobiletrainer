/**
 * Rehab Slice
 * 
 * Manages rehab mode and injury-related state including:
 * - Active rehab mode status
 * - Injury holds (paused muscle groups)
 * - Rehab sessions and pain reports
 * - Legal disclaimer acceptance
 * - Missed workouts and detraining tracking
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  RehabModeState,
  InjuryHold,
  RehabSession,
  MissedWorkout,
  InjurySeverity,
  MuscleGroup,
} from '../../types';

const initialState: RehabModeState = {
  active: false,
  activeHolds: [],
  rehabSessions: [],
  painReports: {},
  disclaimerAccepted: false,
};

const rehabSlice = createSlice({
  name: 'rehab',
  initialState,
  reducers: {
    // Accept rehab mode disclaimer
    acceptDisclaimer: (state) => {
      state.disclaimerAccepted = true;
      state.acceptedAt = Date.now();
    },

    // Activate rehab mode
    activateRehabMode: (
      state,
      action: PayloadAction<{
        severity: InjurySeverity;
        affectedMuscleGroups: MuscleGroup[];
      }>
    ) => {
      state.active = true;
    },

    // Deactivate rehab mode
    deactivateRehabMode: (state) => {
      state.active = false;
    },

    // Add injury hold
    addInjuryHold: (state, action: PayloadAction<InjuryHold>) => {
      state.activeHolds.push(action.payload);
    },

    // Remove injury hold
    removeInjuryHold: (state, action: PayloadAction<string>) => {
      state.activeHolds = state.activeHolds.filter(
        hold => hold.id !== action.payload
      );
    },

    // Update injury hold
    updateInjuryHold: (state, action: PayloadAction<InjuryHold>) => {
      const index = state.activeHolds.findIndex(
        hold => hold.id === action.payload.id
      );
      
      if (index !== -1) {
        state.activeHolds[index] = action.payload;
      }
    },

    // Deactivate expired holds
    deactivateExpiredHolds: (state) => {
      const now = Date.now();
      state.activeHolds = state.activeHolds.map(hold => ({
        ...hold,
        active: hold.endDate > now,
      }));
    },

    // Add rehab session
    addRehabSession: (state, action: PayloadAction<RehabSession>) => {
      state.rehabSessions.push(action.payload);
    },

    // Record pain level for exercise
    recordPainLevel: (
      state,
      action: PayloadAction<{
        exerciseId: string;
        painLevel: number;
      }>
    ) => {
      state.painReports[action.payload.exerciseId] = action.payload.painLevel;
    },

    // Clear pain report for exercise
    clearPainReport: (state, action: PayloadAction<string>) => {
      delete state.painReports[action.payload];
    },

    // Load rehab data from storage
    loadRehabData: (
      state,
      action: PayloadAction<{
        active: boolean;
        activeHolds: InjuryHold[];
        rehabSessions: RehabSession[];
        disclaimerAccepted: boolean;
        acceptedAt?: number;
      }>
    ) => {
      state.active = action.payload.active;
      state.activeHolds = action.payload.activeHolds;
      state.rehabSessions = action.payload.rehabSessions;
      state.disclaimerAccepted = action.payload.disclaimerAccepted;
      state.acceptedAt = action.payload.acceptedAt;
    },

    // Reset rehab state
    resetRehabState: () => {
      return initialState;
    },
  },
});

export const {
  acceptDisclaimer,
  activateRehabMode,
  deactivateRehabMode,
  addInjuryHold,
  removeInjuryHold,
  updateInjuryHold,
  deactivateExpiredHolds,
  addRehabSession,
  recordPainLevel,
  clearPainReport,
  loadRehabData,
  resetRehabState,
} = rehabSlice.actions;

export default rehabSlice.reducer;
