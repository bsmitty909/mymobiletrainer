/**
 * Gamification Slice
 * 
 * Manages gamification state including levels, badges, streaks, and achievements.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Badge, GamificationState, UserLevel, WorkoutStreak } from '../../types';
import GamificationService from '../../services/GamificationService';

const initialState: GamificationState = {
  level: {
    level: 1,
    xp: 0,
    xpForNextLevel: 100,
    title: 'Beginner',
  },
  badges: [],
  unlockedBadges: [],
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: 0,
    streakDates: [],
  },
  totalWorkouts: 0,
  totalVolume: 0,
  totalPRs: 0,
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    addXP: (state, action: PayloadAction<number>) => {
      const totalXP = state.level.xp + action.payload;
      const newLevel = GamificationService.calculateLevel(totalXP);
      
      const leveledUp = newLevel.level > state.level.level;
      state.level = newLevel;
      
      return state;
    },

    unlockBadge: (state, action: PayloadAction<Badge>) => {
      if (!state.unlockedBadges.includes(action.payload.id)) {
        state.badges.push(action.payload);
        state.unlockedBadges.push(action.payload.id);
      }
    },

    unlockBadges: (state, action: PayloadAction<Badge[]>) => {
      action.payload.forEach(badge => {
        if (!state.unlockedBadges.includes(badge.id)) {
          state.badges.push(badge);
          state.unlockedBadges.push(badge.id);
        }
      });
    },

    updateStreak: (state, action: PayloadAction<{ lastWorkoutDate: number }>) => {
      const updatedStreak = GamificationService.updateStreak(
        action.payload.lastWorkoutDate,
        state.streak.currentStreak
      );
      state.streak = updatedStreak;
    },

    addWorkoutCompletion: (state, action: PayloadAction<{
      setsCompleted: number;
      exercisesCompleted: number;
      totalVolume: number;
      duration: number;
      personalRecords: number;
    }>) => {
      const xpGained = GamificationService.calculateXPFromWorkout(action.payload);
      const totalXP = state.level.xp + xpGained;
      state.level = GamificationService.calculateLevel(totalXP);
      
      state.totalWorkouts += 1;
      state.totalVolume += action.payload.totalVolume;
      state.totalPRs += action.payload.personalRecords;
      
      const now = Date.now();
      const updatedStreak = GamificationService.updateStreak(
        state.streak.lastWorkoutDate || now,
        state.streak.currentStreak
      );
      state.streak = {
        ...updatedStreak,
        lastWorkoutDate: now,
        streakDates: [...state.streak.streakDates, now],
      };

      const newBadges: Badge[] = [];
      
      newBadges.push(...GamificationService.checkBadges('workout_count', state.totalWorkouts, state.unlockedBadges));
      newBadges.push(...GamificationService.checkBadges('streak', state.streak.currentStreak, state.unlockedBadges));
      newBadges.push(...GamificationService.checkBadges('volume', state.totalVolume, state.unlockedBadges));
      newBadges.push(...GamificationService.checkBadges('pr', state.totalPRs, state.unlockedBadges));

      newBadges.forEach(badge => {
        if (!state.unlockedBadges.includes(badge.id)) {
          state.badges.push(badge);
          state.unlockedBadges.push(badge.id);
        }
      });
    },

    incrementTotalWorkouts: (state) => {
      state.totalWorkouts += 1;
    },

    addVolume: (state, action: PayloadAction<number>) => {
      state.totalVolume += action.payload;
    },

    incrementPRs: (state) => {
      state.totalPRs += 1;
    },

    loadGamificationData: (
      state,
      action: PayloadAction<{
        level: UserLevel;
        badges: Badge[];
        unlockedBadges: string[];
        streak: WorkoutStreak;
        totalWorkouts: number;
        totalVolume: number;
        totalPRs: number;
      }>
    ) => {
      return action.payload;
    },

    resetGamification: () => {
      return initialState;
    },
  },
});

export const {
  addXP,
  unlockBadge,
  unlockBadges,
  updateStreak,
  addWorkoutCompletion,
  incrementTotalWorkouts,
  addVolume,
  incrementPRs,
  loadGamificationData,
  resetGamification,
} = gamificationSlice.actions;

export default gamificationSlice.reducer;
