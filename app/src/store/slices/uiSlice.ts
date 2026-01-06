/**
 * UI Slice
 * 
 * Manages UI state like rest timer, modals, and loading states.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActiveWorkoutState } from '../../types';

interface UIState {
  activeWorkout: ActiveWorkoutState;
  restTimer: {
    isActive: boolean;
    remaining: number;
    target: number;
  };
  modals: {
    videoPlayer: { visible: boolean; videoUrl: string | null };
    exerciseAlternates: { visible: boolean; exerciseId: string | null };
  };
  theme: 'light' | 'dark' | 'auto';
}

const initialState: UIState = {
  activeWorkout: {
    session: null,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    restTimerActive: false,
    restTimeRemaining: 0,
    restTimerTargetDuration: 0,
  },
  restTimer: {
    isActive: false,
    remaining: 0,
    target: 90,
  },
  modals: {
    videoPlayer: { visible: false, videoUrl: null },
    exerciseAlternates: { visible: false, exerciseId: null },
  },
  theme: 'auto',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Rest timer controls
    startRestTimer: (state, action: PayloadAction<number>) => {
      state.restTimer.isActive = true;
      state.restTimer.target = action.payload;
      state.restTimer.remaining = action.payload;
    },

    tickRestTimer: (state) => {
      if (state.restTimer.isActive && state.restTimer.remaining > 0) {
        state.restTimer.remaining -= 1;
      }
      if (state.restTimer.remaining <= 0) {
        state.restTimer.isActive = false;
      }
    },

    stopRestTimer: (state) => {
      state.restTimer.isActive = false;
      state.restTimer.remaining = 0;
    },

    addRestTime: (state, action: PayloadAction<number>) => {
      state.restTimer.remaining += action.payload;
      state.restTimer.target += action.payload;
    },

    // Active workout position tracking
    setExerciseIndex: (state, action: PayloadAction<number>) => {
      state.activeWorkout.currentExerciseIndex = action.payload;
      state.activeWorkout.currentSetIndex = 0; // Reset set index for new exercise
    },

    setSetIndex: (state, action: PayloadAction<number>) => {
      state.activeWorkout.currentSetIndex = action.payload;
    },

    nextExercise: (state) => {
      state.activeWorkout.currentExerciseIndex += 1;
      state.activeWorkout.currentSetIndex = 0;
    },

    nextSet: (state) => {
      state.activeWorkout.currentSetIndex += 1;
    },

    // Modal controls
    showVideoPlayer: (state, action: PayloadAction<string>) => {
      state.modals.videoPlayer.visible = true;
      state.modals.videoPlayer.videoUrl = action.payload;
    },

    hideVideoPlayer: (state) => {
      state.modals.videoPlayer.visible = false;
      state.modals.videoPlayer.videoUrl = null;
    },

    showExerciseAlternates: (state, action: PayloadAction<string>) => {
      state.modals.exerciseAlternates.visible = true;
      state.modals.exerciseAlternates.exerciseId = action.payload;
    },

    hideExerciseAlternates: (state) => {
      state.modals.exerciseAlternates.visible = false;
      state.modals.exerciseAlternates.exerciseId = null;
    },

    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },

    // Reset UI state
    resetUI: (state) => {
      return initialState;
    },
  },
});

export const {
  startRestTimer,
  tickRestTimer,
  stopRestTimer,
  addRestTime,
  setExerciseIndex,
  setSetIndex,
  nextExercise,
  nextSet,
  showVideoPlayer,
  hideVideoPlayer,
  showExerciseAlternates,
  hideExerciseAlternates,
  setTheme,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
