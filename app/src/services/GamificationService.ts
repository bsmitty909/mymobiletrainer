/**
 * Gamification Service
 * 
 * Manages user levels, badges, and achievements.
 * Calculates XP, checks badge requirements, and manages progression.
 */

import { Badge, BadgeCategory, BadgeRarity, UserLevel, WorkoutStreak } from '../types';

const LEVEL_TITLES = [
  'Beginner',
  'Novice',
  'Trainee',
  'Apprentice',
  'Intermediate',
  'Advanced',
  'Expert',
  'Master',
  'Champion',
  'Legend',
];

const BASE_XP_FOR_LEVEL = 100;
const XP_MULTIPLIER = 1.5;

export const AVAILABLE_BADGES: Badge[] = [
  // Workout Count Badges
  {
    id: 'first_workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    icon: '🎯',
    category: 'workout_count',
    rarity: 'common',
    requirement: 1,
  },
  {
    id: 'workout_10',
    name: 'Getting Started',
    description: 'Complete 10 workouts',
    icon: '💪',
    category: 'workout_count',
    rarity: 'common',
    requirement: 10,
  },
  {
    id: 'workout_25',
    name: 'Dedicated',
    description: 'Complete 25 workouts',
    icon: '🔥',
    category: 'workout_count',
    rarity: 'rare',
    requirement: 25,
  },
  {
    id: 'workout_50',
    name: 'Committed',
    description: 'Complete 50 workouts',
    icon: '⭐',
    category: 'workout_count',
    rarity: 'rare',
    requirement: 50,
  },
  {
    id: 'workout_100',
    name: 'Century Club',
    description: 'Complete 100 workouts',
    icon: '💯',
    category: 'workout_count',
    rarity: 'epic',
    requirement: 100,
  },
  {
    id: 'workout_250',
    name: 'Unstoppable',
    description: 'Complete 250 workouts',
    icon: '🚀',
    category: 'workout_count',
    rarity: 'legendary',
    requirement: 250,
  },

  // Streak Badges
  {
    id: 'streak_3',
    name: 'On a Roll',
    description: 'Complete 3 workouts in a row',
    icon: '🎲',
    category: 'streak',
    rarity: 'common',
    requirement: 3,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Complete 7 workouts in a row',
    icon: '📅',
    category: 'streak',
    rarity: 'rare',
    requirement: 7,
  },
  {
    id: 'streak_14',
    name: 'Two Week Titan',
    description: 'Complete 14 workouts in a row',
    icon: '⚡',
    category: 'streak',
    rarity: 'epic',
    requirement: 14,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Complete 30 workouts in a row',
    icon: '👑',
    category: 'streak',
    rarity: 'legendary',
    requirement: 30,
  },

  // Volume Badges
  {
    id: 'volume_10k',
    name: 'Heavy Lifter',
    description: 'Lift 10,000 lbs total',
    icon: '🏋️',
    category: 'volume',
    rarity: 'common',
    requirement: 10000,
  },
  {
    id: 'volume_50k',
    name: 'Iron Mover',
    description: 'Lift 50,000 lbs total',
    icon: '💪',
    category: 'volume',
    rarity: 'rare',
    requirement: 50000,
  },
  {
    id: 'volume_100k',
    name: 'Tonnage King',
    description: 'Lift 100,000 lbs total',
    icon: '🦾',
    category: 'volume',
    rarity: 'epic',
    requirement: 100000,
  },
  {
    id: 'volume_250k',
    name: 'Volume Legend',
    description: 'Lift 250,000 lbs total',
    icon: '💎',
    category: 'volume',
    rarity: 'legendary',
    requirement: 250000,
  },

  // PR Badges
  {
    id: 'pr_1',
    name: 'Personal Best',
    description: 'Set your first PR',
    icon: '🌟',
    category: 'pr',
    rarity: 'common',
    requirement: 1,
  },
  {
    id: 'pr_5',
    name: 'Record Breaker',
    description: 'Set 5 PRs',
    icon: '📈',
    category: 'pr',
    rarity: 'rare',
    requirement: 5,
  },
  {
    id: 'pr_10',
    name: 'PR Machine',
    description: 'Set 10 PRs',
    icon: '⚡',
    category: 'pr',
    rarity: 'epic',
    requirement: 10,
  },
  {
    id: 'pr_25',
    name: 'PR Champion',
    description: 'Set 25 PRs',
    icon: '🏆',
    category: 'pr',
    rarity: 'legendary',
    requirement: 25,
  },

  // Milestone Badges
  {
    id: 'first_pr',
    name: 'Breaking Barriers',
    description: 'Set your first personal record',
    icon: '🎊',
    category: 'milestone',
    rarity: 'rare',
    requirement: 1,
  },
  {
    id: 'complete_week',
    name: 'Week Completer',
    description: 'Complete all workouts in a week',
    icon: '✅',
    category: 'milestone',
    rarity: 'rare',
    requirement: 1,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a workout before 8 AM',
    icon: '🌅',
    category: 'milestone',
    rarity: 'rare',
    requirement: 1,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a workout after 8 PM',
    icon: '🌙',
    category: 'milestone',
    rarity: 'rare',
    requirement: 1,
  },
];

class GamificationService {
  calculateXPForLevel(level: number): number {
    return Math.floor(BASE_XP_FOR_LEVEL * Math.pow(XP_MULTIPLIER, level - 1));
  }

  getLevelTitle(level: number): string {
    if (level < LEVEL_TITLES.length) {
      return LEVEL_TITLES[level];
    }
    return `Level ${level} Legend`;
  }

  calculateLevel(totalXP: number): UserLevel {
    let level = 1;
    let xpForCurrentLevel = 0;
    let xpForNextLevel = this.calculateXPForLevel(1);

    while (totalXP >= xpForNextLevel) {
      xpForCurrentLevel = xpForNextLevel;
      level++;
      xpForNextLevel += this.calculateXPForLevel(level);
    }

    return {
      level,
      xp: totalXP - xpForCurrentLevel,
      xpForNextLevel: xpForNextLevel - xpForCurrentLevel,
      title: this.getLevelTitle(level),
    };
  }

  calculateXPFromWorkout(stats: {
    setsCompleted: number;
    exercisesCompleted: number;
    totalVolume: number;
    duration: number;
    personalRecords: number;
  }): number {
    let xp = 0;

    xp += stats.setsCompleted * 5;
    xp += stats.exercisesCompleted * 10;
    xp += Math.floor(stats.totalVolume / 100) * 2;
    xp += Math.floor(stats.duration / 60) * 3;
    xp += stats.personalRecords * 50;

    return xp;
  }

  checkBadges(
    category: BadgeCategory,
    currentValue: number,
    unlockedBadges: string[]
  ): Badge[] {
    const newlyUnlocked: Badge[] = [];
    
    const relevantBadges = AVAILABLE_BADGES.filter(
      badge => badge.category === category && !unlockedBadges.includes(badge.id)
    );

    for (const badge of relevantBadges) {
      if (currentValue >= badge.requirement) {
        newlyUnlocked.push({
          ...badge,
          unlockedAt: Date.now(),
        });
      }
    }

    return newlyUnlocked;
  }

  updateStreak(lastWorkoutDate: number, currentStreak: number): WorkoutStreak {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const daysSinceLastWorkout = Math.floor((now - lastWorkoutDate) / oneDayMs);

    if (daysSinceLastWorkout === 0) {
      return {
        currentStreak,
        longestStreak: currentStreak,
        lastWorkoutDate,
        streakDates: [],
      };
    } else if (daysSinceLastWorkout === 1) {
      const newStreak = currentStreak + 1;
      return {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, currentStreak),
        lastWorkoutDate: now,
        streakDates: [],
      };
    } else {
      return {
        currentStreak: 1,
        longestStreak: currentStreak,
        lastWorkoutDate: now,
        streakDates: [],
      };
    }
  }

  getBadgesByRarity(badges: Badge[]): Record<BadgeRarity, Badge[]> {
    return {
      common: badges.filter(b => b.rarity === 'common'),
      rare: badges.filter(b => b.rarity === 'rare'),
      epic: badges.filter(b => b.rarity === 'epic'),
      legendary: badges.filter(b => b.rarity === 'legendary'),
    };
  }

  getBadgesByCategory(badges: Badge[]): Record<BadgeCategory, Badge[]> {
    return {
      workout_count: badges.filter(b => b.category === 'workout_count'),
      streak: badges.filter(b => b.category === 'streak'),
      volume: badges.filter(b => b.category === 'volume'),
      pr: badges.filter(b => b.category === 'pr'),
      consistency: badges.filter(b => b.category === 'consistency'),
      milestone: badges.filter(b => b.category === 'milestone'),
    };
  }

  getNextBadgeInCategory(category: BadgeCategory, currentValue: number, unlockedBadges: string[]): Badge | null {
    const availableBadges = AVAILABLE_BADGES
      .filter(badge => badge.category === category && !unlockedBadges.includes(badge.id))
      .sort((a, b) => a.requirement - b.requirement);

    for (const badge of availableBadges) {
      if (badge.requirement > currentValue) {
        return badge;
      }
    }

    return null;
  }

  getProgressToNextBadge(category: BadgeCategory, currentValue: number, unlockedBadges: string[]): number {
    const nextBadge = this.getNextBadgeInCategory(category, currentValue, unlockedBadges);
    if (!nextBadge) return 100;
    
    return Math.min(100, (currentValue / nextBadge.requirement) * 100);
  }
}

export default new GamificationService();
