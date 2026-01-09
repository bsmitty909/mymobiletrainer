/**
 * Redux Store Configuration
 * 
 * Central state management for My Mobile Trainer app.
 * Manages user, workout, progress, and UI state.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices
import userReducer from './slices/userSlice';
import workoutReducer from './slices/workoutSliceEnhanced'; // Enhanced for formula integration
import progressReducer from './slices/progressSlice';
import uiReducer from './slices/uiSlice';
import gamificationReducer from './slices/gamificationSlice';

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  workout: workoutReducer,
  progress: progressReducer,
  ui: uiReducer,
  gamification: gamificationReducer,
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // All state should now be serializable with number timestamps and arrays
        // If any serialization errors occur, check for Date objects or Sets
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
