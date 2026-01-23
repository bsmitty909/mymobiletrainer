/**
 * MissedTrainingService Tests
 * 
 * Tests for detraining response logic based on days missed.
 * Critical for safe return to training after time off.
 * 
 * PRD Spec:
 * - 1-3 sessions: Resume normally
 * - 4-7 days: -5 to -10% load
 * - 8-21 days: -10 to -20%, no max testing
 * - 22+ days: Rehab Mode restart
 */

import MissedTrainingService from '../../src/services/MissedTrainingService';
import { MissedWorkout } from '../../src/types';

describe('MissedTrainingService', () => {
  describe('calculateDetrainingResponse - PRD spec', () => {
    it('should resume normally for 1-3 sessions missed', () => {
      const response = MissedTrainingService.calculateDetrainingResponse(2);
      
      expect(response.daysMissed).toBe(2);
      expect(response.loadReductionPercentage).toBe(0);
      expect(response.disableMaxTesting).toBe(false);
      expect(response.recommendation).toContain('normal');
    });

    it('should reduce 5-10% for 4-7 days missed', () => {
      const response = MissedTrainingService.calculateDetrainingResponse(5);
      
      expect(response.daysMissed).toBe(5);
      expect(response.loadReductionPercentage).toBeGreaterThanOrEqual(5);
      expect(response.loadReductionPercentage).toBeLessThanOrEqual(10);
      expect(response.disableMaxTesting).toBe(false);
    });

    it('should reduce 10-20% for 8-21 days missed and disable max testing', () => {
      const response = MissedTrainingService.calculateDetrainingResponse(14);
      
      expect(response.daysMissed).toBe(14);
      expect(response.loadReductionPercentage).toBeGreaterThanOrEqual(10);
      expect(response.loadReductionPercentage).toBeLessThanOrEqual(20);
      expect(response.disableMaxTesting).toBe(true); // No max testing after 8+ days
    });

    it('should restart in rehab mode for 22+ days missed', () => {
      const response = MissedTrainingService.calculateDetrainingResponse(30);
      
      expect(response.daysMissed).toBe(30);
      expect(response.loadReductionPercentage).toBeGreaterThanOrEqual(20);
      expect(response.disableMaxTesting).toBe(true);
      expect(response.recommendation).toContain('Rehab Mode');
    });
  });

  describe('recordMissedWorkout', () => {
    it('should record missed workout with reason', () => {
      const missed = MissedTrainingService.recordMissedWorkout(
        'user-1',
        Date.now(),
        'injury',
        'Shoulder pain'
      );

      expect(missed.userId).toBe('user-1');
      expect(missed.reason).toBe('injury');
      expect(missed.notes).toBe('Shoulder pain');
      expect(missed.timestamp).toBeDefined();
    });

    it('should support all reason categories', () => {
      const reasons = ['injury', 'no_gym_access', 'time_constraints', 'other'] as const;
      
      reasons.forEach(reason => {
        const missed = MissedTrainingService.recordMissedWorkout(
          'user-1',
          Date.now(),
          reason
        );
        expect(missed.reason).toBe(reason);
      });
    });
  });

  describe('getConsecutiveMissedSessions', () => {
    it('should count consecutive missed sessions', () => {
      const missedWorkouts: MissedWorkout[] = [
        {
          id: '1',
          userId: 'user-1',
          scheduledDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
          reason: 'time_constraints',
          timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        },
        {
          id: '2',
          userId: 'user-1',
          scheduledDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
          reason: 'no_gym_access',
          timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        },
        {
          id: '3',
          userId: 'user-1',
          scheduledDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
          reason: 'injury',
          timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
        },
      ];

      const count = MissedTrainingService.getConsecutiveMissedSessions(
        missedWorkouts,
        []
      );

      expect(count).toBe(3);
    });

    it('should reset count after completed workout', () => {
      const missedWorkouts: MissedWorkout[] = [
        {
          id: '1',
          userId: 'user-1',
          scheduledDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
          reason: 'injury',
          timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        },
      ];

      const completedWorkouts = [
        {
          id: 'workout-1',
          userId: 'user-1',
          startedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        },
      ];

      const count = MissedTrainingService.getConsecutiveMissedSessions(
        missedWorkouts,
        completedWorkouts as any
      );

      expect(count).toBe(0);
    });
  });

  describe('analyzeMissedWorkoutImpact', () => {
    it('should explain plateau context from missed sessions', () => {
      const missedWorkouts: MissedWorkout[] = [
        {
          id: '1',
          userId: 'user-1',
          scheduledDate: Date.now() - 14 * 24 * 60 * 60 * 1000,
          reason: 'injury',
          timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
        },
        {
          id: '2',
          userId: 'user-1',
          scheduledDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
          reason: 'injury',
          timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
        },
      ];

      const impact = MissedTrainingService.analyzeMissedWorkoutImpact(
        missedWorkouts,
        30 // last 30 days
      );

      expect(impact.totalMissed).toBe(2);
      expect(impact.primaryReason).toBe('injury');
      expect(impact.plateauContext).toBeDefined();
    });
  });

  describe('detectAdherenceIssues', () => {
    it('should detect injury patterns', () => {
      const missedWorkouts: MissedWorkout[] = [
        { id: '1', userId: 'user-1', scheduledDate: Date.now(), reason: 'injury', timestamp: Date.now() },
        { id: '2', userId: 'user-1', scheduledDate: Date.now(), reason: 'injury', timestamp: Date.now() },
        { id: '3', userId: 'user-1', scheduledDate: Date.now(), reason: 'injury', timestamp: Date.now() },
      ];

      const issues = MissedTrainingService.detectAdherenceIssues(missedWorkouts);
      
      expect(issues.pattern).toBe('injury');
      expect(issues.severity).toBe('high');
      expect(issues.recommendation).toContain('review');
    });

    it('should detect time constraint patterns', () => {
      const missedWorkouts: MissedWorkout[] = Array(5).fill(null).map((_, i) => ({
        id: `${i}`,
        userId: 'user-1',
        scheduledDate: Date.now(),
        reason: 'time_constraints' as const,
        timestamp: Date.now(),
      }));

      const issues = MissedTrainingService.detectAdherenceIssues(missedWorkouts);
      
      expect(issues.pattern).toBe('time');
      expect(issues.recommendation).toContain('schedule');
    });
  });

  describe('getReEntryPlan', () => {
    it('should create structured return plan for 14 days missed', () => {
      const plan = MissedTrainingService.getReEntryPlan(14);
      
      expect(plan.daysMissed).toBe(14);
      expect(plan.week1Reduction).toBeDefined();
      expect(plan.week2Reduction).toBeDefined();
      expect(plan.week3Target).toBe(100);
      expect(plan.guidelines).toBeDefined();
      expect(plan.guidelines.length).toBeGreaterThan(0);
    });

    it('should be more conservative for longer time off', () => {
      const plan30 = MissedTrainingService.getReEntryPlan(30);
      const plan7 = MissedTrainingService.getReEntryPlan(7);
      
      expect(plan30.week1Reduction).toBeGreaterThan(plan7.week1Reduction);
    });
  });

  describe('generateMonthlySummary', () => {
    it('should generate monthly adherence summary', () => {
      const month = 0; // January
      const year = 2026;
      
      const missedWorkouts: MissedWorkout[] = [
        {
          id: '1',
          userId: 'user-1',
          scheduledDate: new Date(2026, 0, 15).getTime(),
          reason: 'time_constraints',
          timestamp: new Date(2026, 0, 15).getTime(),
        },
      ];

      const completedWorkouts = Array(10).fill(null).map((_, i) => ({
        id: `workout-${i}`,
        userId: 'user-1',
        startedAt: new Date(2026, 0, i + 1).getTime(),
      }));

      const summary = MissedTrainingService.generateMonthlySummary(
        'user-1',
        month,
        year,
        completedWorkouts as any,
        missedWorkouts
      );

      expect(summary.month).toContain('January');
      expect(summary.completedSessions).toBe(10);
      expect(summary.missedSessions).toBe(1);
      expect(summary.adherenceRate).toBeGreaterThan(0);
    });
  });
});
