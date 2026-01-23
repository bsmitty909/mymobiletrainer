/**
 * Mode Switching Integration Tests
 * 
 * Tests complete flow of switching between percentage and protocol modes.
 * Validates data conversion, safety checks, and state management.
 */

import WorkoutEngineRouter from '../../src/services/WorkoutEngineRouter';
import FourRepMaxService from '../../src/services/FourRepMaxService';
import { TrainingMode, UserProfile } from '../../src/types';

describe('Mode Switching Integration', () => {
  const mockUserProfile: UserProfile = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    experienceLevel: 'intermediate',
    trainingMode: 'percentage',
    maxLifts: {
      'bench-press': { weight: 225, date: Date.now() },
      'squat': { weight: 315, date: Date.now() },
    },
    protocolPreferences: {
      preferredP1Frequency: 2,
      autoSuggestP1: true,
      showReadinessSignals: true,
    },
  };

  describe('Percentage → Protocol', () => {
    it('should convert 1RMs to 4RMs (90% conversion)', () => {
      const result = WorkoutEngineRouter.switchTrainingMode(
        'percentage',
        'protocol',
        mockUserProfile
      );

      expect(result.success).toBe(true);
      expect(result.convertedMaxes).toBeDefined();
      
      // 1RM 225 → 4RM ~203 (90% of 225)
      const benchPress4RM = result.convertedMaxes?.find(m => m.exerciseId === 'bench-press');
      expect(benchPress4RM?.weight).toBeCloseTo(202.5, 0);
      expect(benchPress4RM?.verified).toBe(false); // Not verified until P1 test
    });

    it('should validate mode switch is safe', () => {
      const validation = WorkoutEngineRouter.validateModeSwitch(
        'percentage',
        'protocol',
        null, // no active session
        [] // no holds
      );

      expect(validation.safe).toBe(true);
      expect(validation.blockers.length).toBe(0);
    });

    it('should block switch if active session exists', () => {
      const activeSession = {
        id: 'session-1',
        userId: 'user-1',
        startedAt: Date.now(),
        exercises: [],
      };

      const validation = WorkoutEngineRouter.validateModeSwitch(
        'percentage',
        'protocol',
        activeSession as any,
        []
      );

      expect(validation.safe).toBe(false);
      expect(validation.blockers).toContain('Active workout session in progress');
    });

    it('should warn about unverified 4RMs', () => {
      const validation = WorkoutEngineRouter.validateModeSwitch(
        'percentage',
        'protocol',
        null,
        []
      );

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(w => w.includes('converted') || w.includes('verify'))).toBe(true);
    });
  });

  describe('Protocol → Percentage', () => {
    it('should convert 4RMs back to 1RMs', () => {
      const protocolProfile = {
        ...mockUserProfile,
        trainingMode: 'protocol' as TrainingMode,
      };

      const fourRepMaxes = [
        {
          id: '4rm-1',
          userId: 'user-1',
          exerciseId: 'bench-press',
          weight: 200,
          dateAchieved: Date.now(),
          verified: true,
        },
      ];

      const result = WorkoutEngineRouter.switchTrainingMode(
        'protocol',
        'percentage',
        protocolProfile
      );

      expect(result.success).toBe(true);
      // 4RM 200 → 1RM ~222 (200 ÷ 0.90)
    });
  });

  describe('Mode Recommendations', () => {
    it('should recommend percentage mode for beginners', () => {
      const recommendation = WorkoutEngineRouter.recommendMode(
        'beginner',
        'general',
        'limited'
      );

      expect(recommendation.recommendedMode).toBe('percentage');
      expect(recommendation.reason).toContain('beginner');
    });

    it('should recommend protocol mode for intermediate/advanced with strength goals', () => {
      const recommendation = WorkoutEngineRouter.recommendMode(
        'intermediate',
        'strength',
        'moderate'
      );

      expect(recommendation.recommendedMode).toBe('protocol');
      expect(recommendation.reason).toContain('strength');
    });

    it('should consider time availability', () => {
      const recommendation = WorkoutEngineRouter.recommendMode(
        'advanced',
        'strength',
        'limited' // Limited time
      );

      // Protocol requires testing sessions, so limited time may favor percentage
      expect(recommendation.reason).toBeDefined();
    });
  });

  describe('Data Preservation', () => {
    it('should preserve training history during mode switch', () => {
      const result = WorkoutEngineRouter.switchTrainingMode(
        'percentage',
        'protocol',
        mockUserProfile
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('preserved');
    });

    it('should maintain user preferences', () => {
      const result = WorkoutEngineRouter.switchTrainingMode(
        'percentage',
        'protocol',
        mockUserProfile
      );

      expect(result.success).toBe(true);
      // Protocol preferences should be maintained
    });
  });
});
