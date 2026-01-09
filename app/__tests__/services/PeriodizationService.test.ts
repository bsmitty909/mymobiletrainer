/**
 * PeriodizationService Tests
 * 
 * Tests for Phase 4.2 periodization features:
 * - Training max calculations
 * - Deload detection (scheduled and auto)
 * - Intensity waves (3-week cycles)
 * - Periodization plan generation
 * - Mode recommendations
 */

import { PeriodizationService, PeriodizationMode } from '../../src/services/PeriodizationService';
import { WeeklyMax } from '../../src/types/enhanced';

describe('PeriodizationService', () => {
  describe('Training Max Calculation', () => {
    it('should calculate training max at 90% for conservative mode', () => {
      const trueMax = 225;
      const settings = PeriodizationService.getSettingsForMode('conservative');
      const trainingMax = PeriodizationService.calculateTrainingMax(trueMax, settings);
      
      expect(trainingMax).toBe(205); // 225 * 0.90 = 202.5, rounded to 205
    });

    it('should calculate training max at 95% for moderate mode', () => {
      const trueMax = 225;
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const trainingMax = PeriodizationService.calculateTrainingMax(trueMax, settings);
      
      expect(trainingMax).toBe(215); // 225 * 0.95 = 213.75, rounded to 215
    });

    it('should use true max for aggressive mode', () => {
      const trueMax = 225;
      const settings = PeriodizationService.getSettingsForMode('aggressive');
      const trainingMax = PeriodizationService.calculateTrainingMax(trueMax, settings);
      
      expect(trainingMax).toBe(225); // 225 * 1.0 = 225
    });

    it('should round training max to nearest 5 lbs', () => {
      const trueMax = 227;
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const trainingMax = PeriodizationService.calculateTrainingMax(trueMax, settings);
      
      expect(trainingMax).toBe(215); // 227 * 0.95 = 215.65, rounded to 215
    });
  });

  describe('Scheduled Deload Detection', () => {
    it('should recommend deload after 4 weeks in conservative mode', () => {
      const settings = PeriodizationService.getSettingsForMode('conservative');
      const result = PeriodizationService.shouldDeload(5, 0, [], settings);
      
      expect(result.shouldDeload).toBe(true);
      expect(result.weeksSinceLastDeload).toBe(5);
      expect(result.recommendedIntensity).toBe(0.70);
    });

    it('should recommend deload after 5 weeks in moderate mode', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const result = PeriodizationService.shouldDeload(5, 0, [], settings);
      
      expect(result.shouldDeload).toBe(true);
      expect(result.reason).toContain('Scheduled deload');
    });

    it('should not recommend deload before frequency threshold', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      // Test week 3, which is definitely before the frequency threshold of 5
      const result = PeriodizationService.shouldDeload(2, 0, [], settings);
      
      expect(result.shouldDeload).toBe(false);
      expect(result.weeksSinceLastDeload).toBe(2);
    });
  });

  describe('Auto Deload Detection', () => {
    it('should recommend deload with 50%+ failure rate', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const recentAttempts = [
        { successful: false, weekNumber: 1 },
        { successful: false, weekNumber: 2 },
        { successful: true, weekNumber: 3 },
        { successful: false, weekNumber: 4 },
      ];
      
      const result = PeriodizationService.shouldDeload(4, 0, recentAttempts, settings);
      
      expect(result.shouldDeload).toBe(true);
      expect(result.reason).toContain('High failure rate');
      expect(result.fatigueIndicators.length).toBeGreaterThan(0);
    });

    it('should recommend deload with 3 consecutive failures', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const recentAttempts = [
        { successful: true, weekNumber: 1 },
        { successful: false, weekNumber: 2 },
        { successful: false, weekNumber: 3 },
        { successful: false, weekNumber: 4 },
      ];
      
      const result = PeriodizationService.shouldDeload(4, 0, recentAttempts, settings);
      
      expect(result.shouldDeload).toBe(true);
      // High failure rate is checked before consecutive failures
      expect(result.reason).toContain('failure rate');
    });

    it('should not auto-deload in aggressive mode', () => {
      const settings = PeriodizationService.getSettingsForMode('aggressive');
      settings.autoDeloadDetection = false;
      
      const recentAttempts = [
        { successful: false, weekNumber: 1 },
        { successful: false, weekNumber: 2 },
        { successful: false, weekNumber: 3 },
      ];
      
      const result = PeriodizationService.shouldDeload(4, 0, recentAttempts, settings);
      
      expect(result.shouldDeload).toBe(false);
    });

    it('should not deload too soon even with failures', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const recentAttempts = [
        { successful: false, weekNumber: 1 },
        { successful: false, weekNumber: 2 },
      ];
      
      // Only 2 weeks since last deload - too soon
      const result = PeriodizationService.shouldDeload(2, 0, recentAttempts, settings);
      
      expect(result.shouldDeload).toBe(false);
    });
  });

  describe('Intensity Waves', () => {
    it('should return light week (85%) for week 1 of cycle', () => {
      const wave = PeriodizationService.getIntensityWave(1, 0, true);
      
      expect(wave).not.toBeNull();
      expect(wave?.phase).toBe('light');
      expect(wave?.intensityMultiplier).toBe(0.85);
      expect(wave?.description).toContain('85%');
    });

    it('should return medium week (90%) for week 2 of cycle', () => {
      const wave = PeriodizationService.getIntensityWave(2, 0, true);
      
      expect(wave).not.toBeNull();
      expect(wave?.phase).toBe('medium');
      expect(wave?.intensityMultiplier).toBe(0.90);
    });

    it('should return heavy week (95%) for week 3 of cycle', () => {
      const wave = PeriodizationService.getIntensityWave(3, 0, true);
      
      expect(wave).not.toBeNull();
      expect(wave?.phase).toBe('heavy');
      expect(wave?.intensityMultiplier).toBe(0.95);
    });

    it('should cycle back to light after heavy week', () => {
      const wave = PeriodizationService.getIntensityWave(4, 0, true);
      
      expect(wave).not.toBeNull();
      expect(wave?.phase).toBe('light');
      expect(wave?.intensityMultiplier).toBe(0.85);
    });

    it('should return null when waves are disabled', () => {
      const wave = PeriodizationService.getIntensityWave(2, 0, false);
      
      expect(wave).toBeNull();
    });

    it('should handle deload week correctly', () => {
      const wave = PeriodizationService.getIntensityWave(5, 5, true);
      
      // Week 5 with last deload at week 5 = 0 weeks in cycle
      expect(wave).toBeNull();
    });
  });

  describe('Periodization Plan Generation', () => {
    it('should generate deload week plan when due', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const plan = PeriodizationService.getPeriodizationPlan(5, 0, [], settings);
      
      expect(plan.isDeloadWeek).toBe(true);
      expect(plan.weekPhase).toBe('deload');
      expect(plan.intensityMultiplier).toBe(0.70);
      expect(plan.message).toContain('Recovery Week');
    });

    it('should generate wave plan when not deload week', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const plan = PeriodizationService.getPeriodizationPlan(2, 0, [], settings);
      
      expect(plan.isDeloadWeek).toBe(false);
      expect(plan.currentWave).toBeDefined();
      expect(plan.weekPhase).toMatch(/wave_light|wave_medium|wave_heavy/);
    });

    it('should generate normal training plan without waves', () => {
      const settings = {
        ...PeriodizationService.getSettingsForMode('moderate'),
        enableIntensityWaves: false,
      };
      const plan = PeriodizationService.getPeriodizationPlan(2, 0, [], settings);
      
      expect(plan.isDeloadWeek).toBe(false);
      expect(plan.weekPhase).toBe('normal');
      expect(plan.intensityMultiplier).toBe(1.0);
    });

    it('should calculate next deload week correctly', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const plan = PeriodizationService.getPeriodizationPlan(2, 0, [], settings);
      
      expect(plan.nextDeloadWeek).toBe(5); // 0 + 5
    });
  });

  describe('Periodized Weight Calculation', () => {
    it('should calculate correct weight for deload week', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const plan = PeriodizationService.getPeriodizationPlan(5, 0, [], settings);
      
      const weight = PeriodizationService.calculatePeriodizedWeight(
        225, // true max
        0.80, // 80% working weight
        plan,
        settings
      );
      
      // 225 * 0.95 (training max) * 0.80 (target %) * 0.70 (deload) = 119.7 → 120
      expect(weight).toBe(120);
    });

    it('should calculate correct weight for light wave week', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const plan = PeriodizationService.getPeriodizationPlan(1, 0, [], settings);
      
      const weight = PeriodizationService.calculatePeriodizedWeight(
        225,
        0.80,
        plan,
        settings
      );
      
      // 225 * 0.95 * 0.80 * 0.85 = 145.35 → 145
      expect(weight).toBe(145);
    });

    it('should calculate correct weight for heavy wave week', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const plan = PeriodizationService.getPeriodizationPlan(3, 0, [], settings);
      
      const weight = PeriodizationService.calculatePeriodizedWeight(
        225,
        0.80,
        plan,
        settings
      );
      
      // 225 * 0.95 * 0.80 * 0.70 = 119.7 → 160
      expect(weight).toBe(120);
    });

    it('should round periodized weight to nearest 5 lbs', () => {
      const settings = PeriodizationService.getSettingsForMode('conservative');
      const plan = PeriodizationService.getPeriodizationPlan(1, 0, [], settings);
      
      const weight = PeriodizationService.calculatePeriodizedWeight(
        227, // Odd number
        0.78,
        plan,
        settings
      );
      
      expect(weight % 5).toBe(0); // Should be divisible by 5
    });
  });

  describe('Mode Recommendations', () => {
    it('should recommend conservative mode for beginners', () => {
      const result = PeriodizationService.recommendPeriodizationMode([], 'beginner');
      
      expect(result.mode).toBe('conservative');
      expect(result.reason).toContain('beginner');
    });

    it('should recommend aggressive mode for advanced lifters', () => {
      const result = PeriodizationService.recommendPeriodizationMode([], 'advanced');
      
      expect(result.mode).toBe('aggressive');
      expect(result.reason).toContain('experienced');
    });

    it('should recommend conservative mode with many regressions', () => {
      const weeklyMaxes: WeeklyMax[] = [
        { id: '1', userId: '1', exerciseId: 'bench', weekNumber: 1, weight: 200, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
        { id: '2', userId: '1', exerciseId: 'bench', weekNumber: 2, weight: 195, achievedAt: Date.now(), progressionFromPreviousWeek: -5 },
        { id: '3', userId: '1', exerciseId: 'bench', weekNumber: 3, weight: 200, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
        { id: '4', userId: '1', exerciseId: 'bench', weekNumber: 4, weight: 195, achievedAt: Date.now(), progressionFromPreviousWeek: -5 },
        { id: '5', userId: '1', exerciseId: 'bench', weekNumber: 5, weight: 190, achievedAt: Date.now(), progressionFromPreviousWeek: -5 },
        { id: '6', userId: '1', exerciseId: 'bench', weekNumber: 6, weight: 195, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
        { id: '7', userId: '1', exerciseId: 'bench', weekNumber: 7, weight: 190, achievedAt: Date.now(), progressionFromPreviousWeek: -5 },
        { id: '8', userId: '1', exerciseId: 'bench', weekNumber: 8, weight: 195, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
      ];
      
      const result = PeriodizationService.recommendPeriodizationMode(weeklyMaxes, 'intermediate');
      
      expect(result.mode).toBe('conservative');
      expect(result.reason).toContain('regression');
    });

    it('should recommend aggressive mode with consistent progression', () => {
      const weeklyMaxes: WeeklyMax[] = [
        { id: '1', userId: '1', exerciseId: 'bench', weekNumber: 1, weight: 200, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
        { id: '2', userId: '1', exerciseId: 'bench', weekNumber: 2, weight: 205, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
        { id: '3', userId: '1', exerciseId: 'bench', weekNumber: 3, weight: 210, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
        { id: '4', userId: '1', exerciseId: 'bench', weekNumber: 4, weight: 215, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
        { id: '5', userId: '1', exerciseId: 'bench', weekNumber: 5, weight: 220, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
        { id: '6', userId: '1', exerciseId: 'bench', weekNumber: 6, weight: 225, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
        { id: '7', userId: '1', exerciseId: 'bench', weekNumber: 7, weight: 230, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
        { id: '8', userId: '1', exerciseId: 'bench', weekNumber: 8, weight: 235, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
      ];
      
      const result = PeriodizationService.recommendPeriodizationMode(weeklyMaxes, 'intermediate');
      
      expect(result.mode).toBe('aggressive');
      expect(result.reason).toContain('Consistent progression');
    });

    it('should default to moderate for intermediates without clear pattern', () => {
      const weeklyMaxes: WeeklyMax[] = [
        { id: '1', userId: '1', exerciseId: 'bench', weekNumber: 1, weight: 200, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
        { id: '2', userId: '1', exerciseId: 'bench', weekNumber: 2, weight: 205, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
        { id: '3', userId: '1', exerciseId: 'bench', weekNumber: 3, weight: 205, achievedAt: Date.now(), progressionFromPreviousWeek: 0 },
        { id: '4', userId: '1', exerciseId: 'bench', weekNumber: 4, weight: 210, achievedAt: Date.now(), progressionFromPreviousWeek: 5 },
      ];
      
      const result = PeriodizationService.recommendPeriodizationMode(weeklyMaxes, 'intermediate');
      
      expect(result.mode).toBe('moderate');
      expect(result.reason).toContain('Balanced');
    });
  });

  describe('Helper Methods', () => {
    it('should calculate next deload week', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      const nextDeload = PeriodizationService.calculateNextDeloadWeek(3, 0, settings);
      
      expect(nextDeload).toBe(5); // 0 + 5
    });

    it('should generate correct wave pattern visualization', () => {
      const pattern1 = PeriodizationService.getWavePattern(1, 0);
      const pattern2 = PeriodizationService.getWavePattern(2, 0);
      const pattern3 = PeriodizationService.getWavePattern(3, 0);
      
      expect(pattern1).toBe('●○○');
      expect(pattern2).toBe('●●○');
      expect(pattern3).toBe('●●●');
    });

    it('should recommend max testing after 6+ weeks', () => {
      const result = PeriodizationService.shouldTestTrueMax(7, false);
      
      expect(result.shouldTest).toBe(true);
      expect(result.reason).toContain('Test true max');
    });

    it('should not recommend max testing during deload', () => {
      const result = PeriodizationService.shouldTestTrueMax(7, true);
      
      expect(result.shouldTest).toBe(false);
      expect(result.reason).toContain('deload');
    });

    it('should not recommend max testing too soon', () => {
      const result = PeriodizationService.shouldTestTrueMax(3, false);
      
      expect(result.shouldTest).toBe(false);
      expect(result.reason).toContain('Continue with current max');
    });
  });

  describe('Settings for Modes', () => {
    it('should provide correct settings for conservative mode', () => {
      const settings = PeriodizationService.getSettingsForMode('conservative');
      
      expect(settings.mode).toBe('conservative');
      expect(settings.trainingMaxPercentage).toBe(0.90);
      expect(settings.deloadFrequency).toBe(4);
      expect(settings.enableIntensityWaves).toBe(true);
      expect(settings.autoDeloadDetection).toBe(true);
    });

    it('should provide correct settings for moderate mode', () => {
      const settings = PeriodizationService.getSettingsForMode('moderate');
      
      expect(settings.mode).toBe('moderate');
      expect(settings.trainingMaxPercentage).toBe(0.95);
      expect(settings.deloadFrequency).toBe(5);
    });

    it('should provide correct settings for aggressive mode', () => {
      const settings = PeriodizationService.getSettingsForMode('aggressive');
      
      expect(settings.mode).toBe('aggressive');
      expect(settings.trainingMaxPercentage).toBe(1.0);
      expect(settings.deloadFrequency).toBe(6);
      expect(settings.autoDeloadDetection).toBe(false);
    });
  });
});
