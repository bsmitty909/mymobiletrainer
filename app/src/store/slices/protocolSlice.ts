/**
 * Protocol Slice
 * 
 * Manages protocol-specific state including:
 * - Current protocol assignments
 * - P1 testing status and history
 * - 4RM tracking
 * - Readiness signals for P1 testing
 * - Rep-out performance history
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Protocol,
  FourRepMax,
  MaxTestingAttempt,
  ReadinessSignal,
  ProtocolWorkoutState,
} from '../../types';

const initialState: ProtocolWorkoutState = {
  currentProtocol: null,
  p1TestingStatus: 'idle',
  fourRepMaxHistory: [],
  lastP1TestDate: {},
  readinessSignals: [],
};

const protocolSlice = createSlice({
  name: 'protocol',
  initialState,
  reducers: {
    // Set current protocol being performed
    setCurrentProtocol: (state, action: PayloadAction<Protocol | null>) => {
      state.currentProtocol = action.payload;
    },

    // Update P1 testing status
    setP1TestingStatus: (
      state,
      action: PayloadAction<'idle' | 'in_progress' | 'completed' | 'failed'>
    ) => {
      state.p1TestingStatus = action.payload;
    },

    // Start P1 testing session
    startP1Testing: (state, action: PayloadAction<{ exerciseId: string }>) => {
      state.p1TestingStatus = 'in_progress';
      state.currentProtocol = 'P1';
    },

    // Complete P1 testing and update 4RM
    completeP1Testing: (
      state,
      action: PayloadAction<{
        fourRepMax: FourRepMax;
        attempts: MaxTestingAttempt[];
      }>
    ) => {
      state.p1TestingStatus = 'completed';
      state.fourRepMaxHistory.push(action.payload.fourRepMax);
      state.lastP1TestDate[action.payload.fourRepMax.exerciseId] = Date.now();
      
      // Update readiness signals - this exercise no longer ready
      state.readinessSignals = state.readinessSignals.filter(
        signal => signal.exerciseId !== action.payload.fourRepMax.exerciseId
      );
    },

    // Fail P1 testing (no increase)
    failP1Testing: (state, action: PayloadAction<{ exerciseId: string }>) => {
      state.p1TestingStatus = 'failed';
      state.lastP1TestDate[action.payload.exerciseId] = Date.now();
    },

    // Reset P1 testing status
    resetP1Testing: (state) => {
      state.p1TestingStatus = 'idle';
      state.currentProtocol = null;
    },

    // Add 4RM to history
    addFourRepMax: (state, action: PayloadAction<FourRepMax>) => {
      state.fourRepMaxHistory.push(action.payload);
    },

    // Update 4RM for an exercise
    updateFourRepMax: (
      state,
      action: PayloadAction<{
        exerciseId: string;
        fourRepMax: FourRepMax;
      }>
    ) => {
      // Remove old maxes for this exercise
      state.fourRepMaxHistory = state.fourRepMaxHistory.filter(
        max => max.exerciseId !== action.payload.exerciseId || max.id === action.payload.fourRepMax.id
      );
      
      // Add new max
      state.fourRepMaxHistory.push(action.payload.fourRepMax);
    },

    // Set readiness signals
    setReadinessSignals: (state, action: PayloadAction<ReadinessSignal[]>) => {
      state.readinessSignals = action.payload;
    },

    // Add readiness signal for an exercise
    addReadinessSignal: (state, action: PayloadAction<ReadinessSignal>) => {
      // Remove existing signal for this exercise
      state.readinessSignals = state.readinessSignals.filter(
        signal => signal.exerciseId !== action.payload.exerciseId
      );
      
      // Add new signal
      state.readinessSignals.push(action.payload);
    },

    // Remove readiness signal
    removeReadinessSignal: (state, action: PayloadAction<string>) => {
      state.readinessSignals = state.readinessSignals.filter(
        signal => signal.exerciseId !== action.payload
      );
    },

    // Load protocol data from storage
    loadProtocolData: (
      state,
      action: PayloadAction<{
        fourRepMaxHistory: FourRepMax[];
        lastP1TestDate: Record<string, number>;
        readinessSignals: ReadinessSignal[];
      }>
    ) => {
      state.fourRepMaxHistory = action.payload.fourRepMaxHistory;
      state.lastP1TestDate = action.payload.lastP1TestDate;
      state.readinessSignals = action.payload.readinessSignals;
    },

    // Reset protocol state
    resetProtocolState: () => {
      return initialState;
    },
  },
});

export const {
  setCurrentProtocol,
  setP1TestingStatus,
  startP1Testing,
  completeP1Testing,
  failP1Testing,
  resetP1Testing,
  addFourRepMax,
  updateFourRepMax,
  setReadinessSignals,
  addReadinessSignal,
  removeReadinessSignal,
  loadProtocolData,
  resetProtocolState,
} = protocolSlice.actions;

export default protocolSlice.reducer;
