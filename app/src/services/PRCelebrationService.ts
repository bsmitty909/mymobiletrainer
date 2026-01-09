/**
 * PR Celebration Service
 * 
 * Detects personal records (PRs), calculates percentiles, and manages celebration data.
 * Provides statistics and social sharing preparation.
 */

import { Exercise } from '../types';

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: number;
  previousRecord?: {
    weight: number;
    reps: number;
    date: number;
  };
  improvement: {
    weightGain: number;
    percentageGain: number;
  };
  userPercentile?: number;
}

export interface PRStats {
  totalPRs: number;
  prsThisWeek: number;
  prsThisMonth: number;
  averageImprovement: number;
  bestPR: PersonalRecord | null;
  recentPRs: PersonalRecord[];
}

export interface ShareableData {
  exerciseName: string;
  weight: number;
  reps: number;
  improvement: string;
  percentile?: number;
  message: string;
}

const STRENGTH_STANDARDS = {
  'bench-press': { beginner: 135, intermediate: 185, advanced: 225, elite: 315 },
  'squat': { beginner: 135, intermediate: 225, advanced: 315, elite: 405 },
  'deadlift': { beginner: 135, intermediate: 225, advanced: 315, elite: 495 },
  'overhead-press': { beginner: 65, intermediate: 95, advanced: 135, elite: 185 },
  'barbell-row': { beginner: 95, intermediate: 135, advanced: 185, elite: 225 },
};

class PRCelebrationService {
  /**
   * Check if a completed set is a new PR
   */
  isPR(
    exerciseId: string,
    weight: number,
    reps: number,
    previousRecords: PersonalRecord[]
  ): boolean {
    const exerciseRecords = previousRecords.filter(pr => pr.exerciseId === exerciseId);
    
    if (exerciseRecords.length === 0) {
      return true;
    }

    const currentOneRM = this.calculateOneRM(weight, reps);
    
    for (const record of exerciseRecords) {
      const recordOneRM = this.calculateOneRM(record.weight, record.reps);
      if (currentOneRM > recordOneRM) {
        return true;
      }
    }

    return false;
  }

  /**
   * Create a PR record with improvement data
   */
  createPR(
    exerciseId: string,
    exerciseName: string,
    weight: number,
    reps: number,
    previousRecords: PersonalRecord[]
  ): PersonalRecord {
    const exerciseRecords = previousRecords
      .filter(pr => pr.exerciseId === exerciseId)
      .sort((a, b) => {
        const aOneRM = this.calculateOneRM(a.weight, a.reps);
        const bOneRM = this.calculateOneRM(b.weight, b.reps);
        return bOneRM - aOneRM;
      });

    const previousBest = exerciseRecords[0];
    
    let improvement = {
      weightGain: 0,
      percentageGain: 0,
    };

    if (previousBest) {
      const currentOneRM = this.calculateOneRM(weight, reps);
      const previousOneRM = this.calculateOneRM(previousBest.weight, previousBest.reps);
      improvement = {
        weightGain: currentOneRM - previousOneRM,
        percentageGain: ((currentOneRM - previousOneRM) / previousOneRM) * 100,
      };
    } else {
      improvement = {
        weightGain: weight,
        percentageGain: 100,
      };
    }

    const pr: PersonalRecord = {
      id: `pr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      exerciseId,
      exerciseName,
      weight,
      reps,
      date: Date.now(),
      improvement,
    };

    if (previousBest) {
      pr.previousRecord = {
        weight: previousBest.weight,
        reps: previousBest.reps,
        date: previousBest.date,
      };
    }

    pr.userPercentile = this.calculatePercentile(exerciseId, weight);

    return pr;
  }

  /**
   * Calculate one-rep max using Epley formula
   */
  calculateOneRM(weight: number, reps: number): number {
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
  }

  /**
   * Calculate user's percentile based on strength standards
   */
  calculatePercentile(exerciseId: string, weight: number): number {
    const standards = STRENGTH_STANDARDS[exerciseId as keyof typeof STRENGTH_STANDARDS];
    
    if (!standards) {
      return 50;
    }

    if (weight < standards.beginner) {
      return Math.min(20, (weight / standards.beginner) * 20);
    } else if (weight < standards.intermediate) {
      return 20 + ((weight - standards.beginner) / (standards.intermediate - standards.beginner)) * 30;
    } else if (weight < standards.advanced) {
      return 50 + ((weight - standards.intermediate) / (standards.advanced - standards.intermediate)) * 30;
    } else if (weight < standards.elite) {
      return 80 + ((weight - standards.advanced) / (standards.elite - standards.advanced)) * 15;
    } else {
      return Math.min(99, 95 + (weight / standards.elite - 1) * 4);
    }
  }

  /**
   * Get strength level description
   */
  getStrengthLevel(exerciseId: string, weight: number): string {
    const standards = STRENGTH_STANDARDS[exerciseId as keyof typeof STRENGTH_STANDARDS];
    
    if (!standards) {
      return 'Intermediate';
    }

    if (weight < standards.beginner) return 'Novice';
    if (weight < standards.intermediate) return 'Beginner';
    if (weight < standards.advanced) return 'Intermediate';
    if (weight < standards.elite) return 'Advanced';
    return 'Elite';
  }

  /**
   * Calculate PR statistics
   */
  calculatePRStats(personalRecords: PersonalRecord[]): PRStats {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const prsThisWeek = personalRecords.filter(pr => pr.date >= oneWeekAgo).length;
    const prsThisMonth = personalRecords.filter(pr => pr.date >= oneMonthAgo).length;

    let totalImprovement = 0;
    let improvementCount = 0;
    let bestPR: PersonalRecord | null = null;
    let bestImprovementPercent = 0;

    for (const pr of personalRecords) {
      if (pr.improvement.percentageGain > 0) {
        totalImprovement += pr.improvement.percentageGain;
        improvementCount++;

        if (pr.improvement.percentageGain > bestImprovementPercent) {
          bestImprovementPercent = pr.improvement.percentageGain;
          bestPR = pr;
        }
      }
    }

    const averageImprovement = improvementCount > 0 ? totalImprovement / improvementCount : 0;

    const recentPRs = [...personalRecords]
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);

    return {
      totalPRs: personalRecords.length,
      prsThisWeek,
      prsThisMonth,
      averageImprovement,
      bestPR,
      recentPRs,
    };
  }

  /**
   * Generate shareable message for social media
   */
  generateShareableMessage(pr: PersonalRecord): ShareableData {
    const oneRM = this.calculateOneRM(pr.weight, pr.reps);
    const strengthLevel = this.getStrengthLevel(pr.exerciseId, pr.weight);

    let message = `🎉 New PR on ${pr.exerciseName}!\n\n`;
    message += `${pr.weight} lbs × ${pr.reps} rep${pr.reps > 1 ? 's' : ''}\n`;
    message += `Estimated 4RM: ${Math.round(oneRM)} lbs\n`;
    
    if (pr.improvement.weightGain > 0) {
      message += `\n📈 Improved by ${Math.round(pr.improvement.weightGain)} lbs (${pr.improvement.percentageGain.toFixed(1)}%)\n`;
    }

    if (pr.userPercentile) {
      message += `\n💪 Strength Level: ${strengthLevel}\n`;
      message += `📊 Stronger than ${Math.round(pr.userPercentile)}% of lifters\n`;
    }

    message += `\n#PRDay #StrongerEveryDay #MyMobileTrainer`;

    return {
      exerciseName: pr.exerciseName,
      weight: pr.weight,
      reps: pr.reps,
      improvement: pr.improvement.weightGain > 0 
        ? `+${Math.round(pr.improvement.weightGain)} lbs (${pr.improvement.percentageGain.toFixed(1)}%)`
        : 'First PR!',
      percentile: pr.userPercentile,
      message,
    };
  }

  /**
   * Generate motivational message based on PR achievement
   */
  generateMotivationalMessage(pr: PersonalRecord): string {
    const messages = {
      first: [
        "🎉 First PR! This is just the beginning!",
        "🌟 Your journey to strength starts here!",
        "💪 Welcome to the PR club!",
      ],
      small: [
        "📈 Progress is progress! Keep pushing!",
        "🔥 Another step forward! You're doing great!",
        "💯 Small wins add up to big victories!",
      ],
      medium: [
        "🚀 Crushing it! That's a solid improvement!",
        "⚡ You're getting stronger every day!",
        "🏆 That's what dedication looks like!",
      ],
      large: [
        "🔥🔥🔥 HUGE PR! You're unstoppable!",
        "💎 Elite performance! Keep dominating!",
        "👑 Beast mode activated! Incredible work!",
      ],
    };

    let category: 'first' | 'small' | 'medium' | 'large';
    
    if (!pr.previousRecord) {
      category = 'first';
    } else if (pr.improvement.percentageGain < 5) {
      category = 'small';
    } else if (pr.improvement.percentageGain < 10) {
      category = 'medium';
    } else {
      category = 'large';
    }

    const categoryMessages = messages[category];
    return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
  }

  /**
   * Check if user should be prompted to share
   */
  shouldPromptShare(pr: PersonalRecord): boolean {
    if (!pr.previousRecord) {
      return true;
    }

    if (pr.improvement.percentageGain >= 10) {
      return true;
    }

    if (pr.userPercentile && pr.userPercentile >= 90) {
      return true;
    }

    const strengthLevel = this.getStrengthLevel(pr.exerciseId, pr.weight);
    if (strengthLevel === 'Elite' || strengthLevel === 'Advanced') {
      return true;
    }

    return false;
  }

  /**
   * Get next milestone for an exercise
   */
  getNextMilestone(exerciseId: string, currentWeight: number): { weight: number; level: string } | null {
    const standards = STRENGTH_STANDARDS[exerciseId as keyof typeof STRENGTH_STANDARDS];
    
    if (!standards) {
      return null;
    }

    const milestones = [
      { weight: standards.beginner, level: 'Beginner' },
      { weight: standards.intermediate, level: 'Intermediate' },
      { weight: standards.advanced, level: 'Advanced' },
      { weight: standards.elite, level: 'Elite' },
    ];

    for (const milestone of milestones) {
      if (currentWeight < milestone.weight) {
        return milestone;
      }
    }

    return null;
  }

  /**
   * Calculate progress towards next milestone
   */
  getMilestoneProgress(exerciseId: string, currentWeight: number): number {
    const nextMilestone = this.getNextMilestone(exerciseId, currentWeight);
    
    if (!nextMilestone) {
      return 100;
    }

    const standards = STRENGTH_STANDARDS[exerciseId as keyof typeof STRENGTH_STANDARDS];
    if (!standards) {
      return 0;
    }

    let previousMilestone = 0;
    if (currentWeight >= standards.advanced) {
      previousMilestone = standards.advanced;
    } else if (currentWeight >= standards.intermediate) {
      previousMilestone = standards.intermediate;
    } else if (currentWeight >= standards.beginner) {
      previousMilestone = standards.beginner;
    }

    const progress = ((currentWeight - previousMilestone) / (nextMilestone.weight - previousMilestone)) * 100;
    return Math.min(100, Math.max(0, progress));
  }
}

export default new PRCelebrationService();
