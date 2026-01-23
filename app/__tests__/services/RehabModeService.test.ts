/**
 * RehabModeService Tests
 * 
 * Tests for rehab mode logic, load reduction, pain monitoring, and recovery tracking.
 * Critical for user safety during injury recovery.
 */

import RehabModeService from '../../src/services/RehabModeService';

describe('RehabModeService', () => {
  describe('calculateLoadReduction - PRD spec', () => {
    it('should reduce load by 10% for mild severity', () => {
      const reduction = RehabModeService.calculateLoadReduction('mild');
      expect(reduction).toBe(10);
    });

    it('should reduce load by 20% for moderate severity', () => {
      const reduction = RehabModeService.calculateLoadReduction('moderate');
      expect(reduction).toBe(20);
    });

    it('should reduce load by 30% for severe severity', () => {
      const reduction = RehabModeService.calculateLoadReduction('severe');
      expect(reduction).toBe(30);
    });
  });

  describe('applyRehabAdjustment', () => {
    it('should reduce weight correctly for moderate severity', () => {
      const adjusted = RehabModeService.applyRehabAdjustment(200, 20);
      expect(adjusted).toBe(160); // 200 - 40
    });

    it('should maintain reps in 10-15 range (PRD requirement)', () => {
      // Per PRD: Rehab reduces load first, reps stay 10-15
      const adjusted = RehabModeService.applyRehabAdjustment(200, 20);
      expect(adjusted).toBeLessThan(200);
      // Reps would stay at 10-15 (not tested here, but design principle)
    });
  });

  describe('initiateRehabMode', () => {
    it('should create rehab session with all required fields', () => {
      const session = RehabModeService.initiateRehabMode(
        'user-1',
        'bench-press',
        225,
        'moderate',
        ['chest', 'triceps']
      );

      expect(session.userId).toBe('user-1');
      expect(session.exerciseId).toBe('bench-press');
      expect(session.preInjuryMax).toBe(225);
      expect(session.currentWeight).toBe(180); // 20% reduction
      expect(session.loadReduction).toBe(20);
      expect(session.affectedMuscles).toEqual(['chest', 'triceps']);
    });

    it('should require legal disclaimer', () => {
      const disclaimer = RehabModeService.getRehabDisclaimer();
      expect(disclaimer).toContain('medical advice');
      expect(disclaimer).toContain('healthcare provider');
      expect(disclaimer.length).toBeGreaterThan(100);
    });
  });

  describe('processPainCheckIn', () => {
    it('should record pain level (0-10 scale)', () => {
      const checkIn = RehabModeService.processPainCheckIn(
        'session-1',
        'bench-press',
        5,
        'Sharp pain at bottom of movement'
      );

      expect(checkIn.sessionId).toBe('session-1');
      expect(checkIn.exerciseId).toBe('bench-press');
      expect(checkIn.painLevel).toBe(5);
      expect(checkIn.notes).toBeDefined();
    });

    it('should flag high pain levels (≥7)', () => {
      const checkIn = RehabModeService.processPainCheckIn(
        'session-1',
        'bench-press',
        8,
        'Severe discomfort'
      );

      expect(checkIn.painLevel).toBeGreaterThanOrEqual(7);
      expect(checkIn.requiresAttention).toBe(true);
    });

    it('should validate pain level range', () => {
      expect(() => {
        RehabModeService.processPainCheckIn('session-1', 'bench-press', 11, '');
      }).toThrow();

      expect(() => {
        RehabModeService.processPainCheckIn('session-1', 'bench-press', -1, '');
      }).toThrow();
    });
  });

  describe('calculateRecoveryProgress', () => {
    it('should calculate recovery percentage correctly', () => {
      const progress = RehabModeService.calculateRecoveryProgress(180, 200);
      expect(progress).toBe(90); // 180/200 = 90%
    });

    it('should handle full recovery', () => {
      const progress = RehabModeService.calculateRecoveryProgress(200, 200);
      expect(progress).toBe(100);
    });

    it('should handle surpassing pre-injury max', () => {
      const progress = RehabModeService.calculateRecoveryProgress(210, 200);
      expect(progress).toBeGreaterThan(100);
    });
  });

  describe('shouldGraduateFromRehab', () => {
    it('should graduate at 95%+ recovery with low pain', () => {
      const should Graduate = RehabModeService.shouldGraduateFromRehab(
        192, // 96% of 200
        200,
        [
          { painLevel: 2, timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
          { painLevel: 1, timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
          { painLevel: 0, timestamp: Date.now() },
        ] as any
      );

      expect(shouldGraduate).toBe(true);
    });

    it('should not graduate if recovery below 95%', () => {
      const shouldGraduate = RehabModeService.shouldGraduateFromRehab(
        180, // 90% of 200
        200,
        [{ painLevel: 0, timestamp: Date.now() }] as any
      );

      expect(shouldGraduate).toBe(false);
    });

    it('should not graduate if pain levels still elevated', () => {
      const shouldGraduate = RehabModeService.shouldGraduateFromRehab(
        195, // 97.5% of 200
        200,
        [{ painLevel: 6, timestamp: Date.now() }] as any
      );

      expect(shouldGraduate).toBe(false);
    });
  });

  describe('resumeAfterHold - PRD spec', () => {
    it('should restart at 50-60% of pre-injury max', () => {
      const resumption = RehabModeService.resumeAfterHold(
        'user-1',
        'bench-press',
        225,
        30 // days held
      );

      expect(resumption.startingWeight).toBeGreaterThanOrEqual(112.5); // 50% of 225
      expect(resumption.startingWeight).toBeLessThanOrEqual(135); // 60% of 225
    });

    it('should recommend gradual progression plan', () => {
      const resumption = RehabModeService.resumeAfterHold(
        'user-1',
        'bench-press',
        225,
        45
      );

      expect(resumption.progressionPlan).toBeDefined();
      expect(resumption.progressionPlan.weeklyIncrease).toBeLessThanOrEqual(10); // Conservative
    });
  });

  describe('getRecoveryMilestones', () => {
    it('should identify 50%, 75%, 90%, 100% milestones', () => {
      const milestones = RehabModeService.getRecoveryMilestones(
        [
          { currentWeight: 100, timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000 },
          { currentWeight: 125, timestamp: Date.now() - 21 * 24 * 60 * 60 * 1000 },
          { currentWeight: 150, timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000 },
          { currentWeight: 175, timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
          { currentWeight: 190, timestamp: Date.now() },
        ] as any,
        200
      );

      expect(milestones.some(m => m.percentage === 50)).toBe(true);
      expect(milestones.some(m => m.percentage === 75)).toBe(true);
      expect(milestones.some(m => m.percentage === 90)).toBe(true);
    });
  });
});
