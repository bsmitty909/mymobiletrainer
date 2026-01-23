/**
 * FourRepMaxService Tests
 * 
 * Tests for 4RM tracking, P1 testing cooldown, and earned progression logic.
 * Critical for validating safety and progression rules.
 */

import FourRepMaxService from '../../src/services/FourRepMaxService';
import { FourRepMax, MaxTestingAttempt } from '../../src/types';

describe('FourRepMaxService', () => {
  const mockFourRepMax: FourRepMax = {
    id: 'test-4rm-1',
    userId: 'user-1',
    exerciseId: 'bench-press',
    weight: 200,
    dateAchieved: Date.now(),
    verified: true,
  };

  describe('getCurrentFourRepMax', () => {
    it('should return most recent 4RM for exercise', () => {
      const fourRepMaxes: FourRepMax[] = [
        { ...mockFourRepMax, weight: 190, dateAchieved: Date.now() - 7 * 24 * 60 * 60 * 1000 },
        { ...mockFourRepMax, weight: 200, dateAchieved: Date.now() },
        { ...mockFourRepMax, weight: 185, dateAchieved: Date.now() - 14 * 24 * 60 * 60 * 1000 },
      ];

      const current = FourRepMaxService.getCurrentFourRepMax('bench-press', fourRepMaxes);
      expect(current?.weight).toBe(200);
    });

    it('should return null if no 4RM exists', () => {
      const current = FourRepMaxService.getCurrentFourRepMax('squat', [mockFourRepMax]);
      expect(current).toBeNull();
    });

    it('should prioritize verified 4RMs', () => {
      const fourRepMaxes: FourRepMax[] = [
        { ...mockFourRepMax, weight: 210, verified: false, dateAchieved: Date.now() },
        { ...mockFourRepMax, weight: 200, verified: true, dateAchieved: Date.now() - 1000 },
      ];

      const current = FourRepMaxService.getCurrentFourRepMax('bench-press', fourRepMaxes);
      expect(current?.weight).toBe(200);
      expect(current?.verified).toBe(true);
    });
  });

  describe('canAttemptP1Testing - 2 week cooldown (PRD)', () => {
    it('should allow testing after 2 weeks', () => {
      const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
      const oldMax = { ...mockFourRepMax, dateAchieved: twoWeeksAgo };

      const can = FourRepMaxService.canAttemptP1Testing('bench-press', [oldMax]);
      expect(can).toBe(true);
    });

    it('should prevent testing within 2 weeks', () => {
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const recentMax = { ...mockFourRepMax, dateAchieved: oneDayAgo };

      const can = FourRepMaxService.canAttemptP1Testing('bench-press', [recentMax]);
      expect(can).toBe(false);
    });

    it('should allow first-time testing', () => {
      const can = FourRepMaxService.canAttemptP1Testing('new-exercise', []);
      expect(can).toBe(true);
    });
  });

  describe('calculateP1AttemptWeight', () => {
    it('should start at 100% of 4RM', () => {
      const weight = FourRepMaxService.calculateP1AttemptWeight(200, 0, false);
      expect(weight).toBe(200);
    });

    it('should increase by 2.5 lbs for upper body on success', () => {
      const weight = FourRepMaxService.calculateP1AttemptWeight(200, 1, false);
      expect(weight).toBe(202.5);
    });

    it('should increase by 5 lbs for lower body on success', () => {
      const weight = FourRepMaxService.calculateP1AttemptWeight(300, 1, true);
      expect(weight).toBe(305);
    });

    it('should cap at 20% above starting 4RM', () => {
      const starting4RM = 200;
      const maxAllowed = 240; // 20% increase

      const weight = FourRepMaxService.calculateP1AttemptWeight(starting4RM, 20, false);
      expect(weight).toBeLessThanOrEqual(maxAllowed);
    });
  });

  describe('recordMaxAttempt', () => {
    it('should create attempt record with all required fields', () => {
      const attempt = FourRepMaxService.recordMaxAttempt(
        'user-1',
        'bench-press',
        200,
        205,
        4,
        true,
        'session-1'
      );

      expect(attempt.userId).toBe('user-1');
      expect(attempt.exerciseId).toBe('bench-press');
      expect(attempt.fourRepMax).toBe(200);
      expect(attempt.attemptedWeight).toBe(205);
      expect(attempt.repsCompleted).toBe(4);
      expect(attempt.successful).toBe(true);
      expect(attempt.sessionId).toBe('session-1');
      expect(attempt.timestamp).toBeDefined();
    });

    it('should mark unsuccessful attempts correctly', () => {
      const attempt = FourRepMaxService.recordMaxAttempt(
        'user-1',
        'bench-press',
        200,
        205,
        3,
        false,
        'session-1'
      );

      expect(attempt.successful).toBe(false);
      expect(attempt.repsCompleted).toBe(3);
    });
  });

  describe('updateFourRepMax', () => {
    it('should create new verified 4RM', () => {
      const newMax = FourRepMaxService.updateFourRepMax(
        'user-1',
        'bench-press',
        205,
        'session-1'
      );

      expect(newMax.weight).toBe(205);
      expect(newMax.verified).toBe(true);
      expect(newMax.testingSessionId).toBe('session-1');
    });

    it('should only increase 4RM through P1 testing (earned progression)', () => {
      // This is a design principle - 4RM can ONLY be updated via updateFourRepMax
      // which should ONLY be called after successful P1 testing
      // Rep-outs in P2/P3 signal readiness but don't auto-increase
      
      const newMax = FourRepMaxService.updateFourRepMax('user-1', 'bench-press', 205, 'session-1');
      expect(newMax.verified).toBe(true); // Only P1 testing creates verified maxes
    });
  });

  describe('getTestingHistory', () => {
    it('should return chronological testing history', () => {
      const attempts: MaxTestingAttempt[] = [
        {
          id: '1',
          userId: 'user-1',
          exerciseId: 'bench-press',
          fourRepMax: 200,
          attemptedWeight: 200,
          repsCompleted: 4,
          successful: true,
          timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
          sessionId: 'session-1',
        },
        {
          id: '2',
          userId: 'user-1',
          exerciseId: 'bench-press',
          fourRepMax: 200,
          attemptedWeight: 205,
          repsCompleted: 4,
          successful: true,
          timestamp: Date.now(),
          sessionId: 'session-2',
        },
      ];

      const history = FourRepMaxService.getTestingHistory('bench-press', attempts);
      expect(history.length).toBe(2);
      expect(history[0].timestamp).toBeLessThan(history[1].timestamp);
    });
  });

  describe('calculateSuccessRate', () => {
    it('should calculate P1 success rate correctly', () => {
      const attempts: MaxTestingAttempt[] = [
        { ...mockAttempt(), successful: true },
        { ...mockAttempt(), successful: true },
        { ...mockAttempt(), successful: false },
        { ...mockAttempt(), successful: true },
      ];

      const rate = FourRepMaxService.calculateSuccessRate(attempts);
      expect(rate).toBe(75); // 3 successful out of 4
    });

    it('should return 0% for no attempts', () => {
      const rate = FourRepMaxService.calculateSuccessRate([]);
      expect(rate).toBe(0);
    });

    it('should return 100% for all successful', () => {
      const attempts: MaxTestingAttempt[] = [
        { ...mockAttempt(), successful: true },
        { ...mockAttempt(), successful: true },
      ];

      const rate = FourRepMaxService.calculateSuccessRate(attempts);
      expect(rate).toBe(100);
    });
  });

  describe('checkReadinessForP1', () => {
    it('should signal ready when P2/P3 reps are consistently high', () => {
      const recentRepOuts = [
        { reps: 11, protocol: 'P2' },
        { reps: 12, protocol: 'P2' },
        { reps: 10, protocol: 'P3' },
      ];

      const signal = FourRepMaxService.checkReadinessForP1(
        'bench-press',
        recentRepOuts as any,
        []
      );

      expect(signal.readyForP1).toBe(true);
      expect(signal.confidence).toBeGreaterThan(0.6);
    });

    it('should not signal ready if cooldown active', () => {
      const recentRepOuts = [
        { reps: 12, protocol: 'P2' },
        { reps: 12, protocol: 'P2' },
      ];

      const recentMax = { ...mockFourRepMax, dateAchieved: Date.now() - 7 * 24 * 60 * 60 * 1000 };

      const signal = FourRepMaxService.checkReadinessForP1(
        'bench-press',
        recentRepOuts as any,
        [recentMax]
      );

      expect(signal.readyForP1).toBe(false);
      expect(signal.reasoning).toContain('2-week cooldown');
    });
  });
});

function mockAttempt(): MaxTestingAttempt {
  return {
    id: `attempt-${Math.random()}`,
    userId: 'user-1',
    exerciseId: 'bench-press',
    fourRepMax: 200,
    attemptedWeight: 200,
    repsCompleted: 4,
    successful: true,
    timestamp: Date.now(),
    sessionId: 'session-1',
  };
}
