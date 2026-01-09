/**
 * PR Celebration Service Tests
 * 
 * Tests for personal record detection, percentile calculation, and celebration features.
 */

import PRCelebrationService, { PersonalRecord } from '../../src/services/PRCelebrationService';

describe('PRCelebrationService', () => {
  describe('calculateOneRM', () => {
    it('should return weight for 1 rep', () => {
      expect(PRCelebrationService.calculateOneRM(225, 1)).toBe(225);
    });

    it('should calculate 4RM using Epley formula', () => {
      const oneRM = PRCelebrationService.calculateOneRM(200, 5);
      expect(oneRM).toBeCloseTo(233.33, 1);
    });

    it('should handle multiple reps correctly', () => {
      const oneRM = PRCelebrationService.calculateOneRM(185, 10);
      expect(oneRM).toBeCloseTo(246.67, 1);
    });
  });

  describe('isPR', () => {
    it('should return true for first ever lift', () => {
      const isPR = PRCelebrationService.isPR('bench-press', 135, 5, []);
      expect(isPR).toBe(true);
    });

    it('should return true when 4RM is higher than previous', () => {
      const previousRecords: PersonalRecord[] = [{
        id: 'pr1',
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        weight: 200,
        reps: 1,
        date: Date.now() - 86400000,
        improvement: { weightGain: 0, percentageGain: 0 },
      }];

      const isPR = PRCelebrationService.isPR('bench-press', 205, 1, previousRecords);
      expect(isPR).toBe(true);
    });

    it('should return false when 4RM is not higher', () => {
      const previousRecords: PersonalRecord[] = [{
        id: 'pr1',
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        weight: 225, 
        reps: 1,
        date: Date.now() - 86400000,
        improvement: { weightGain: 0, percentageGain: 0 },
      }];

      const isPR = PRCelebrationService.isPR('bench-press', 185, 5, previousRecords);
      expect(isPR).toBe(false);
    });

    it('should compare across different rep ranges', () => {
      const previousRecords: PersonalRecord[] = [{
        id: 'pr1',
        exerciseId: 'squat',
        exerciseName: 'Squat',
        weight: 300,
        reps: 3,
        date: Date.now() - 86400000,
        improvement: { weightGain: 0, percentageGain: 0 },
      }];

      const isPR = PRCelebrationService.isPR('squat', 275, 5, previousRecords);
      expect(isPR).toBe(false);
    });
  });

  describe('createPR', () => {
    it('should create PR for first lift', () => {
      const pr = PRCelebrationService.createPR('deadlift', 'Deadlift', 315, 5, []);
      
      expect(pr.exerciseId).toBe('deadlift');
      expect(pr.weight).toBe(315);
      expect(pr.reps).toBe(5);
      expect(pr.improvement.weightGain).toBeGreaterThan(0);
      expect(pr.previousRecord).toBeUndefined();
      expect(pr.userPercentile).toBeDefined();
    });

    it('should calculate improvement from previous PR', () => {
      const previousRecords: PersonalRecord[] = [{
        id: 'pr1',
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        weight: 200,
        reps: 1,
        date: Date.now() - 86400000,
        improvement: { weightGain: 0, percentageGain: 0 },
      }];

      const pr = PRCelebrationService.createPR('bench-press', 'Bench Press', 225, 1, previousRecords);
      
      expect(pr.improvement.weightGain).toBe(25);
      expect(pr.improvement.percentageGain).toBeCloseTo(12.5, 1);
      expect(pr.previousRecord).toBeDefined();
      expect(pr.previousRecord?.weight).toBe(200);
    });

    it('should include percentile data', () => {
      const pr = PRCelebrationService.createPR('squat', 'Squat', 315, 1, []);
      
      expect(pr.userPercentile).toBeDefined();
      expect(pr.userPercentile).toBeGreaterThan(0);
      expect(pr.userPercentile).toBeLessThanOrEqual(99);
    });
  });

  describe('calculatePercentile', () => {
    it('should return low percentile for novice weights', () => {
      const percentile = PRCelebrationService.calculatePercentile('bench-press', 95);
      expect(percentile).toBeLessThan(20);
    });

    it('should return mid percentile for intermediate weights', () => {
      const percentile = PRCelebrationService.calculatePercentile('bench-press', 185);
      expect(percentile).toBeGreaterThan(20);
      expect(percentile).toBeLessThan(80);
    });

    it('should return high percentile for advanced weights', () => {
      const percentile = PRCelebrationService.calculatePercentile('bench-press', 315);
      expect(percentile).toBeGreaterThan(80);
    });

    it('should handle unknown exercises gracefully', () => {
      const percentile = PRCelebrationService.calculatePercentile('unknown-exercise', 200);
      expect(percentile).toBe(50);
    });
  });

  describe('getStrengthLevel', () => {
    it('should return Novice for very light weights', () => {
      const level = PRCelebrationService.getStrengthLevel('bench-press', 100);
      expect(level).toBe('Novice');
    });

    it('should return Beginner for light weights', () => {
      const level = PRCelebrationService.getStrengthLevel('bench-press', 155);
      expect(level).toBe('Beginner');
    });

    it('should return Intermediate for moderate weights', () => {
      const level = PRCelebrationService.getStrengthLevel('bench-press', 200);
      expect(level).toBe('Intermediate');
    });

    it('should return Advanced for heavy weights', () => {
      const level = PRCelebrationService.getStrengthLevel('bench-press', 275);
      expect(level).toBe('Advanced');
    });

    it('should return Elite for very heavy weights', () => {
      const level = PRCelebrationService.getStrengthLevel('bench-press', 350);
      expect(level).toBe('Elite');
    });
  });

  describe('calculatePRStats', () => {
    const mockPRs: PersonalRecord[] = [
      {
        id: 'pr1',
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        weight: 185,
        reps: 5,
        date: Date.now() - 86400000 * 30, // 30 days ago
        improvement: { weightGain: 10, percentageGain: 5.7 },
      },
      {
        id: 'pr2',
        exerciseId: 'squat',
        exerciseName: 'Squat',
        weight: 275,
        reps: 3,
        date: Date.now() - 86400000 * 10, // 10 days ago
        improvement: { weightGain: 15, percentageGain: 5.8 },
      },
      {
        id: 'pr3',
        exerciseId: 'deadlift',
        exerciseName: 'Deadlift',
        weight: 365,
        reps: 1,
        date: Date.now() - 86400000 * 2, // 2 days ago
        improvement: { weightGain: 25, percentageGain: 7.4 },
      },
    ];

    it('should calculate total PRs', () => {
      const stats = PRCelebrationService.calculatePRStats(mockPRs);
      expect(stats.totalPRs).toBe(3);
    });

    it('should calculate PRs this week', () => {
      const stats = PRCelebrationService.calculatePRStats(mockPRs);
      expect(stats.prsThisWeek).toBe(1); // Only the deadlift PR
    });

    it('should calculate PRs this month', () => {
      const stats = PRCelebrationService.calculatePRStats(mockPRs);
      expect(stats.prsThisMonth).toBe(2); // Squat and deadlift
    });

    it('should calculate average improvement', () => {
      const stats = PRCelebrationService.calculatePRStats(mockPRs);
      const expectedAvg = (5.7 + 5.8 + 7.4) / 3;
      expect(stats.averageImprovement).toBeCloseTo(expectedAvg, 1);
    });

    it('should identify best PR', () => {
      const stats = PRCelebrationService.calculatePRStats(mockPRs);
      expect(stats.bestPR).toBeDefined();
      expect(stats.bestPR?.exerciseId).toBe('deadlift'); // Highest percentage gain
    });

    it('should return recent PRs in order', () => {
      const stats = PRCelebrationService.calculatePRStats(mockPRs);
      expect(stats.recentPRs).toHaveLength(3);
      expect(stats.recentPRs[0].exerciseId).toBe('deadlift'); // Most recent
    });
  });

  describe('generateShareableMessage', () => {
    const mockPR: PersonalRecord = {
      id: 'pr1',
      exerciseId: 'bench-press',
      exerciseName: 'Bench Press',
      weight: 225,
      reps: 1,
      date: Date.now(),
      improvement: { weightGain: 25, percentageGain: 12.5 },
      userPercentile: 75,
    };

    it('should generate shareable message', () => {
      const shareData = PRCelebrationService.generateShareableMessage(mockPR);
      
      expect(shareData.exerciseName).toBe('Bench Press');
      expect(shareData.weight).toBe(225);
      expect(shareData.reps).toBe(1);
      expect(shareData.message).toContain('New PR');
      expect(shareData.message).toContain('225 lbs');
    });

    it('should include improvement data', () => {
      const shareData = PRCelebrationService.generateShareableMessage(mockPR);
      
      expect(shareData.improvement).toContain('25 lbs');
      expect(shareData.improvement).toContain('12.5%');
    });

    it('should include percentile when available', () => {
      const shareData = PRCelebrationService.generateShareableMessage(mockPR);
      
      expect(shareData.percentile).toBe(75);
      expect(shareData.message).toContain('75%');
    });
  });

  describe('shouldPromptShare', () => {
    it('should prompt for first PR', () => {
      const pr: PersonalRecord = {
        id: 'pr1',
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        weight: 135,
        reps: 5,
        date: Date.now(),
        improvement: { weightGain: 135, percentageGain: 100 },
      };

      expect(PRCelebrationService.shouldPromptShare(pr)).toBe(true);
    });

    it('should prompt for large improvements', () => {
      const pr: PersonalRecord = {
        id: 'pr1',
        exerciseId: 'squat',
        exerciseName: 'Squat',
        weight: 315,
        reps: 1,
        date: Date.now(),
        improvement: { weightGain: 35, percentageGain: 12.5 },
        previousRecord: { weight: 280, reps: 1, date: Date.now() - 86400000 },
      };

      expect(PRCelebrationService.shouldPromptShare(pr)).toBe(true);
    });

    it('should prompt for high percentile', () => {
      const pr: PersonalRecord = {
        id: 'pr1',
        exerciseId: 'deadlift',
        exerciseName: 'Deadlift',
        weight: 495,
        reps: 1,
        date: Date.now(),
        improvement: { weightGain: 5, percentageGain: 1.0 },
        previousRecord: { weight: 490, reps: 1, date: Date.now() - 86400000 },
        userPercentile: 95,
      };

      expect(PRCelebrationService.shouldPromptShare(pr)).toBe(true);
    });

    it('should not prompt for small improvements', () => {
      const pr: PersonalRecord = {
        id: 'pr1',
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        weight: 190,
        reps: 5,
        date: Date.now(),
        improvement: { weightGain: 5, percentageGain: 2.7 },
        previousRecord: { weight: 185, reps: 5, date: Date.now() - 86400000 },
        userPercentile: 50,
      };

      expect(PRCelebrationService.shouldPromptShare(pr)).toBe(false);
    });
  });

  describe('getNextMilestone', () => {
    it('should return beginner milestone for novice', () => {
      const milestone = PRCelebrationService.getNextMilestone('bench-press', 100);
      expect(milestone).toBeDefined();
      expect(milestone?.weight).toBe(135);
      expect(milestone?.level).toBe('Beginner');
    });

    it('should return intermediate milestone for beginner', () => {
      const milestone = PRCelebrationService.getNextMilestone('bench-press', 150);
      expect(milestone).toBeDefined();
      expect(milestone?.weight).toBe(185);
      expect(milestone?.level).toBe('Intermediate');
    });

    it('should return null when at elite level', () => {
      const milestone = PRCelebrationService.getNextMilestone('bench-press', 350);
      expect(milestone).toBeNull();
    });

    it('should return null for unknown exercise', () => {
      const milestone = PRCelebrationService.getNextMilestone('unknown', 200);
      expect(milestone).toBeNull();
    });
  });

  describe('getMilestoneProgress', () => {
    it('should calculate progress to next milestone', () => {
      const progress = PRCelebrationService.getMilestoneProgress('bench-press', 150);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });

    it('should return 100 when at elite level', () => {
      const progress = PRCelebrationService.getMilestoneProgress('bench-press', 350);
      expect(progress).toBe(100);
    });

    it('should handle intermediate ranges', () => {
      const progress = PRCelebrationService.getMilestoneProgress('squat', 270);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });

  describe('generateMotivationalMessage', () => {
    it('should generate message for first PR', () => {
      const pr: PersonalRecord = {
        id: 'pr1',
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        weight: 135,
        reps: 5,
        date: Date.now(),
        improvement: { weightGain: 135, percentageGain: 100 },
      };

      const message = PRCelebrationService.generateMotivationalMessage(pr);
      expect(message).toBeTruthy();
      expect(typeof message).toBe('string');
    });

    it('should generate different messages for different improvements', () => {
      const smallPR: PersonalRecord = {
        id: 'pr1',
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        weight: 190,
        reps: 1,
        date: Date.now(),
        improvement: { weightGain: 5, percentageGain: 2.7 },
        previousRecord: { weight: 185, reps: 1, date: Date.now() - 86400000 },
      };

      const largePR: PersonalRecord = {
        id: 'pr2',
        exerciseId: 'squat',
        exerciseName: 'Squat',
        weight: 365,
        reps: 1,
        date: Date.now(),
        improvement: { weightGain: 50, percentageGain: 15.9 },
        previousRecord: { weight: 315, reps: 1, date: Date.now() - 86400000 },
      };

      const smallMessage = PRCelebrationService.generateMotivationalMessage(smallPR);
      const largeMessage = PRCelebrationService.generateMotivationalMessage(largePR);

      expect(smallMessage).toBeTruthy();
      expect(largeMessage).toBeTruthy();
      // Both should be motivational but different categories
    });
  });
});
