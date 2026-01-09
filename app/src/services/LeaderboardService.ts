/**
 * Leaderboard Service
 * 
 * Manages user rankings, comparisons with friends, and anonymous global leaderboards.
 * Currently uses local mock data, designed for future backend integration.
 */

export interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  score: number;
  category: LeaderboardCategory;
  additionalData?: {
    totalWorkouts?: number;
    totalVolume?: number;
    currentStreak?: number;
    averageIntensity?: number;
    prCount?: number;
  };
  isCurrentUser?: boolean;
}

export type LeaderboardCategory = 
  | 'total_strength'
  | 'strength_gain'
  | 'volume'
  | 'consistency'
  | 'streak'
  | 'pr_count';

export type LeaderboardTimeframe = 'week' | 'month' | 'all_time';

export interface LeaderboardFilter {
  category: LeaderboardCategory;
  timeframe: LeaderboardTimeframe;
  weightClass?: 'light' | 'middle' | 'heavy';
  ageGroup?: 'under_25' | '25_35' | '35_45' | 'over_45';
}

export interface UserComparison {
  currentUser: LeaderboardEntry;
  nearbyUsers: LeaderboardEntry[];
  percentile: number;
  message: string;
}

const MOCK_USERNAMES = [
  'IronMike', 'BeastMode', 'LiftMaster', 'PowerHouse', 'GymWarrior',
  'StrengthKing', 'FitFlex', 'MuscleBuilder', 'ProLifter', 'GymShark',
  'ThunderLift', 'AlphaGains', 'SwoleMate', 'RippedRon', 'BulkBoss',
  'LeanMachine', 'GainsTrain', 'IronWill', 'MaxPower', 'FitnessFanatic',
];

class LeaderboardService {
  /**
   * Generate mock leaderboard data
   * In production, this would fetch from a backend API
   */
  private generateMockLeaderboard(
    filter: LeaderboardFilter,
    userScore: number
  ): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];
    const entryCount = 100;

    for (let i = 0; i < entryCount; i++) {
      const baseScore = this.getBaseScoreForCategory(filter.category, filter.timeframe);
      const variance = Math.random() * baseScore * 0.5;
      const score = Math.max(0, baseScore - variance);

      entries.push({
        userId: `user_${i}`,
        username: MOCK_USERNAMES[i % MOCK_USERNAMES.length] + (i > MOCK_USERNAMES.length ? i : ''),
        rank: 0,
        score: Math.round(score),
        category: filter.category,
        additionalData: this.generateMockAdditionalData(filter.category),
      });
    }

    entries.push({
      userId: 'current_user',
      username: 'You',
      rank: 0,
      score: userScore,
      category: filter.category,
      isCurrentUser: true,
    });

    entries.sort((a, b) => b.score - a.score);

    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }

  /**
   * Get base score for category to generate realistic mock data
   */
  private getBaseScoreForCategory(
    category: LeaderboardCategory,
    timeframe: LeaderboardTimeframe
  ): number {
    const multiplier = timeframe === 'week' ? 0.25 : timeframe === 'month' ? 1 : 4;

    switch (category) {
      case 'total_strength':
        return 1000 * multiplier;
      case 'strength_gain':
        return 100 * multiplier;
      case 'volume':
        return 50000 * multiplier;
      case 'consistency':
        return 20 * multiplier;
      case 'streak':
        return 30 * multiplier;
      case 'pr_count':
        return 10 * multiplier;
      default:
        return 100 * multiplier;
    }
  }

  /**
   * Generate mock additional data for leaderboard entries
   */
  private generateMockAdditionalData(category: LeaderboardCategory) {
    return {
      totalWorkouts: Math.floor(Math.random() * 100) + 20,
      totalVolume: Math.floor(Math.random() * 100000) + 10000,
      currentStreak: Math.floor(Math.random() * 30),
      averageIntensity: Math.floor(Math.random() * 30) + 70,
      prCount: Math.floor(Math.random() * 20) + 1,
    };
  }

  /**
   * Get user's rank and nearby competitors
   */
  getUserRankingWithContext(
    filter: LeaderboardFilter,
    userScore: number
  ): UserComparison {
    const leaderboard = this.generateMockLeaderboard(filter, userScore);
    const userEntry = leaderboard.find(entry => entry.isCurrentUser);

    if (!userEntry) {
      throw new Error('User entry not found');
    }

    const userIndex = leaderboard.indexOf(userEntry);
    const nearbyUsers: LeaderboardEntry[] = [];

    const rangeStart = Math.max(0, userIndex - 2);
    const rangeEnd = Math.min(leaderboard.length, userIndex + 3);

    for (let i = rangeStart; i < rangeEnd; i++) {
      if (i !== userIndex) {
        nearbyUsers.push(leaderboard[i]);
      }
    }

    const percentile = ((leaderboard.length - userEntry.rank) / leaderboard.length) * 100;

    const message = this.generateComparisonMessage(percentile, filter.category);

    return {
      currentUser: userEntry,
      nearbyUsers,
      percentile,
      message,
    };
  }

  /**
   * Generate motivational comparison message
   */
  private generateComparisonMessage(
    percentile: number,
    category: LeaderboardCategory
  ): string {
    const categoryName = this.getCategoryDisplayName(category);

    if (percentile >= 95) {
      return `🏆 You're in the top 5% for ${categoryName}! Elite performance!`;
    } else if (percentile >= 90) {
      return `⭐ Top 10% for ${categoryName}! You're crushing it!`;
    } else if (percentile >= 75) {
      return `🔥 Top 25% for ${categoryName}! Keep pushing!`;
    } else if (percentile >= 50) {
      return `💪 Above average for ${categoryName}! Solid progress!`;
    } else if (percentile >= 25) {
      return `📈 You're getting stronger! Keep up the work!`;
    } else {
      return `🎯 Lots of room to grow! Stay consistent!`;
    }
  }

  /**
   * Get full leaderboard for a category
   */
  getLeaderboard(
    filter: LeaderboardFilter,
    userScore: number,
    limit: number = 50
  ): LeaderboardEntry[] {
    const fullLeaderboard = this.generateMockLeaderboard(filter, userScore);
    return fullLeaderboard.slice(0, limit);
  }

  /**
   * Calculate user's score for a specific category
   */
  calculateUserScore(
    category: LeaderboardCategory,
    userData: {
      totalStrength?: number;
      strengthGain?: number;
      totalVolume?: number;
      totalWorkouts?: number;
      currentStreak?: number;
      prCount?: number;
    }
  ): number {
    switch (category) {
      case 'total_strength':
        return userData.totalStrength || 0;
      case 'strength_gain':
        return userData.strengthGain || 0;
      case 'volume':
        return userData.totalVolume || 0;
      case 'consistency':
        return userData.totalWorkouts || 0;
      case 'streak':
        return userData.currentStreak || 0;
      case 'pr_count':
        return userData.prCount || 0;
      default:
        return 0;
    }
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category: LeaderboardCategory): string {
    const names: Record<LeaderboardCategory, string> = {
      total_strength: 'Total Strength',
      strength_gain: 'Strength Gains',
      volume: 'Total Volume',
      consistency: 'Consistency',
      streak: 'Current Streak',
      pr_count: 'Personal Records',
    };
    return names[category];
  }

  /**
   * Get category description
   */
  getCategoryDescription(category: LeaderboardCategory): string {
    const descriptions: Record<LeaderboardCategory, string> = {
      total_strength: 'Sum of all your max lifts across exercises',
      strength_gain: 'Total pounds gained since starting the program',
      volume: 'Total weight lifted across all workouts',
      consistency: 'Number of workouts completed',
      streak: 'Consecutive days with workouts',
      pr_count: 'Number of personal records set',
    };
    return descriptions[category];
  }

  /**
   * Get icon for category
   */
  getCategoryIcon(category: LeaderboardCategory): string {
    const icons: Record<LeaderboardCategory, string> = {
      total_strength: '💪',
      strength_gain: '📈',
      volume: '🏋️',
      consistency: '📅',
      streak: '🔥',
      pr_count: '🏆',
    };
    return icons[category];
  }

  /**
   * Check if user achieved a ranking milestone
   */
  checkRankingMilestone(currentRank: number, previousRank: number | null): {
    achieved: boolean;
    milestone: string | null;
    message: string | null;
  } {
    if (previousRank === null) {
      return { achieved: false, milestone: null, message: null };
    }

    const milestones = [
      { rank: 1, name: 'Champion', message: '🏆 #1 Rank! You are the champion!' },
      { rank: 10, name: 'Top 10', message: '⭐ Top 10! Elite performance!' },
      { rank: 25, name: 'Top 25', message: '🌟 Top 25! Excellent work!' },
      { rank: 50, name: 'Top 50', message: '💫 Top 50! Great progress!' },
      { rank: 100, name: 'Top 100', message: '✨ Top 100! Keep climbing!' },
    ];

    for (const milestone of milestones) {
      if (currentRank <= milestone.rank && previousRank > milestone.rank) {
        return {
          achieved: true,
          milestone: milestone.name,
          message: milestone.message,
        };
      }
    }

    if (previousRank - currentRank >= 10) {
      return {
        achieved: true,
        milestone: 'Big Jump',
        message: `🚀 Jumped ${previousRank - currentRank} places! Momentum!`,
      };
    }

    return { achieved: false, milestone: null, message: null };
  }

  /**
   * Get friends leaderboard (mock - would use real friend data in production)
   */
  getFriendsLeaderboard(
    filter: LeaderboardFilter,
    userScore: number,
    friendIds: string[]
  ): LeaderboardEntry[] {
    const mockFriends: LeaderboardEntry[] = friendIds.map((friendId, index) => {
      const baseScore = this.getBaseScoreForCategory(filter.category, filter.timeframe);
      const variance = Math.random() * baseScore * 0.3;
      const score = Math.max(0, baseScore - variance);

      return {
        userId: friendId,
        username: MOCK_USERNAMES[index % MOCK_USERNAMES.length],
        rank: 0,
        score: Math.round(score),
        category: filter.category,
        additionalData: this.generateMockAdditionalData(filter.category),
      };
    });

    mockFriends.push({
      userId: 'current_user',
      username: 'You',
      rank: 0,
      score: userScore,
      category: filter.category,
      isCurrentUser: true,
    });

    mockFriends.sort((a, b) => b.score - a.score);
    mockFriends.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return mockFriends;
  }

  /**
   * Get suggested goals based on leaderboard position
   */
  getSuggestedGoals(
    category: LeaderboardCategory,
    userScore: number,
    userRank: number,
    targetRank: number
  ): {
    currentScore: number;
    targetScore: number;
    difference: number;
    suggestion: string;
  } {
    const improvementNeeded = Math.max(1, Math.ceil((targetRank - userRank) * 0.1 * userScore));
    const targetScore = userScore + improvementNeeded;

    const suggestions: Record<LeaderboardCategory, string> = {
      total_strength: `Increase your total strength by ${improvementNeeded} lbs`,
      strength_gain: `Gain ${improvementNeeded} lbs more strength`,
      volume: `Lift ${improvementNeeded} more lbs total`,
      consistency: `Complete ${improvementNeeded} more workouts`,
      streak: `Build a ${improvementNeeded}-day longer streak`,
      pr_count: `Set ${improvementNeeded} more personal records`,
    };

    return {
      currentScore: userScore,
      targetScore,
      difference: improvementNeeded,
      suggestion: suggestions[category],
    };
  }
}

export default new LeaderboardService();
