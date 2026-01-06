/**
 * Redux Store Configuration
 * 
 * Central state management for My Mobile Trainer app.
 * Manages user, workout, progress, and UI state.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices (to be created)
import userReducer from './slices/userSlice';
import workoutReducer from './slices/workoutSlice';
import progressReducer from './slices/progressSlice';
import uiReducer from './slices/uiSlice';

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  workout: workoutReducer,
  progress: progressReducer,
  ui: uiReducer,
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Date objects
        ignoredActions: ['workout/startSession', 'workout/logSet'],
        // Ignore these paths in the state
        ignoredActionPaths: ['payload.date', 'payload.timestamp'],
        ignoredPaths: ['workout.activeSession.startedAt', 'workout.activeSession.completedAt'],
      },
    }),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
