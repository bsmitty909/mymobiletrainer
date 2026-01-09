/**
 * Unit Tests for FormulaCalculatorEnhanced
 * 
 * Tests all formula logic extracted from Asa B 2020 spreadsheet:
 * - Weight calculations by percentage
 * - Max attempt evaluation
 * - Progressive overload logic
 * - Conditional set display logic
 * - Down set generation
 * - Rest period calculations
 */

import FormulaCalculator from '../../src/services/FormulaCalculatorEnhanced';
import { ConditionalSet, SetLog } from '../../src/types/enhanced';

describe('FormulaCalculatorEnhanced', () => {
  describe('calculateWeightByPercentage', () => {
    test('standard weight calculation - 80% of 225', () => {
      const result = FormulaCalculator.calculateWeightByPercentage(225, 0.80);
      expect(result).toBe(180); // 225 * 0.80 = 180
    });

    test('beginner special case - 4RM < 125, 35% intensity', () => {
      const result = FormulaCalculator.calculateWeightByPercentage(100, 0.35);
      expect(result).toBe(45); // Special case: use 45 lbs bar
    });

    test('beginner special case - 4RM = 120, 35% intensity', () => {
      const result = FormulaCalculator.calculateWeightByPercentage(120, 0.35);
      expect(result).toBe(45); // Still uses 45 lbs bar
    });

    test('normal user - 4RM > 125, 35% intensity', () => {
      const result = FormulaCalculator.calculateWeightByPercentage(200, 0.35);
      expect(result).toBe(70); // 200 * 0.35 = 70
    });

    test('rounds to nearest 5 lbs - 203 * 0.80', () => {
      const result = FormulaCalculator.calculateWeightByPercentage(203, 0.80);
      expect(result).toBe(160); // 162.4 rounds to 160
    });

    test('rounds to nearest 5 lbs - 227 * 0.80', () => {
      const result = FormulaCalculator.calculateWeightByPercentage(227, 0.80);
      expect(result).toBe(180); // 181.6 rounds to 180
    });

    test('max effort - 100% of 4RM', () => {
      const result = FormulaCalculator.calculateWeightByPercentage(225, 1.00);
      expect(result).toBe(225);
    });

    test('progressive max - 105% of 4RM', () => {
      const result = FormulaCalculator.calculateWeightByPercentage(225, 1.05);
      expect(result).toBe(235); // 236.25 rounds to 235
    });
  });

  describe('evaluateMaxAttempt', () => {
    test('success - 1 rep completed adds 5 lbs', () => {
      const result = FormulaCalculator.evaluateMaxAttempt(225, 1);
      expect(result.success).toBe(true);
      expect(result.newMax).toBe(230);
      expect(result.progressionAmount).toBe(5);
      expect(result.instruction).toBe('NEW_MAX_ATTEMPT');
    });

    test('success - 2+ reps completed adds 5 lbs', () => {
      const result = FormulaCalculator.evaluateMaxAttempt(225, 3);
      expect(result.success).toBe(true);
      expect(result.newMax).toBe(230);
      expect(result.progressionAmount).toBe(5);
    });

    test('failure - 0 reps redirects to down sets', () => {
      const result = FormulaCalculator.evaluateMaxAttempt(225, 0);
      expect(result.success).toBe(false);
      expect(result.newMax).toBe(225);
      expect(result.instruction).toBe('PROCEED_TO_DOWN_SETS');
      expect(result.feedback).toContain('volume work');
    });

    test('feedback message on success', () => {
      const result = FormulaCalculator.evaluateMaxAttempt(225, 1);
      expect(result.feedback).toContain('New personal record');
    });

    test('feedback message on failure', () => {
      const result = FormulaCalculator.evaluateMaxAttempt(225, 0);
      expect(result.feedback).toContain("couldn't quite hit");
    });
  });

  describe('shouldDisplaySet', () => {
    test('non-conditional set always displays', () => {
      const set: ConditionalSet = {
        setNumber: 1,
        weight: 70,
        targetReps: 6,
        restPeriod: '30s',
        intensityPercentage: 0.35,
        isConditional: false,
        shouldDisplay: true,
        category: 'warmup',
        setType: 'standard'
      };
      expect(FormulaCalculator.shouldDisplaySet(set, [])).toBe(true);
    });

    test('conditional set - condition met (1 rep achieved)', () => {
      const set: ConditionalSet = {
        setNumber: 5,
        weight: 230,
        targetReps: 1,
        restPeriod: '1-5 MIN',
        intensityPercentage: 1.05,
        isConditional: true,
        shouldDisplay: false,
        category: 'max',
        setType: 'progressive_max',
        condition: {
          type: 'reps_achieved',
          requiredReps: 1,
          previousSetNumber: 4
        }
      };
      const completedSets: SetLog[] = [{
        id: '1',
        sessionId: 'test',
        exerciseLogId: 'test',
        setNumber: 4,
        weight: 225,
        reps: 1,
        completedAt: Date.now(),
        restPeriod: 180,
        perceivedEffort: 9
      }];
      expect(FormulaCalculator.shouldDisplaySet(set, completedSets)).toBe(true);
    });

    test('conditional set - condition not met (0 reps)', () => {
      const set: ConditionalSet = {
        setNumber: 5,
        weight: 230,
        targetReps: 1,
        restPeriod: '1-5 MIN',
        intensityPercentage: 1.05,
        isConditional: true,
        shouldDisplay: false,
        category: 'max',
        setType: 'progressive_max',
        condition: {
          type: 'reps_achieved',
          requiredReps: 1,
          previousSetNumber: 4
        }
      };
      const completedSets: SetLog[] = [{
        id: '1',
        sessionId: 'test',
        exerciseLogId: 'test',
        setNumber: 4,
        weight: 225,
        reps: 0,
        completedAt: Date.now(),
        restPeriod: 180,
        perceivedEffort: 10
      }];
      expect(FormulaCalculator.shouldDisplaySet(set, completedSets)).toBe(false);
    });

    test('conditional set - previous set not completed yet', () => {
      const set: ConditionalSet = {
        setNumber: 5,
        weight: 230,
        targetReps: 1,
        restPeriod: '1-5 MIN',
        intensityPercentage: 1.05,
        isConditional: true,
        shouldDisplay: false,
        category: 'max',
        setType: 'progressive_max',
        condition: {
          type: 'reps_achieved',
          requiredReps: 1,
          previousSetNumber: 4
        }
      };
      const completedSets: SetLog[] = [];
      expect(FormulaCalculator.shouldDisplaySet(set, completedSets)).toBe(false);
    });
  });

  describe('generateDownSets', () => {
    test('generates 3 down sets at 80% of max', () => {
      const sets = FormulaCalculator.generateDownSets(225);
      expect(sets).toHaveLength(3);
      expect(sets[0].weight).toBe(180); // 80% of 225
      expect(sets[1].weight).toBe(180);
      expect(sets[2].weight).toBe(180);
    });

    test('down set rep scheme: 8, 8, REP_OUT', () => {
      const sets = FormulaCalculator.generateDownSets(225);
      expect(sets[0].targetReps).toBe(8);
      expect(sets[1].targetReps).toBe(8);
      expect(sets[2].targetReps).toBe('REP_OUT');
    });

    test('down sets are marked as down type', () => {
      const sets = FormulaCalculator.generateDownSets(225);
      expect(sets[0].setType).toBe('down');
      expect(sets[1].setType).toBe('down');
      expect(sets[2].setType).toBe('down');
    });

    test('down sets start after previous set', () => {
      const sets = FormulaCalculator.generateDownSets(225, 4);
      expect(sets[0].setNumber).toBe(5);
      expect(sets[1].setNumber).toBe(6);
      expect(sets[2].setNumber).toBe(7);
    });

    test('custom number of down sets', () => {
      const sets = FormulaCalculator.generateDownSets(225, 4, 5);
      expect(sets).toHaveLength(5);
    });

    test('down sets rest period is 1-2 MIN', () => {
      const sets = FormulaCalculator.generateDownSets(225);
      expect(sets[0].restPeriod).toBe('1-2 MIN');
      expect(sets[1].restPeriod).toBe('1-2 MIN');
      expect(sets[2].restPeriod).toBe('1-2 MIN');
    });
  });

  describe('generateProgressiveMaxAttempts', () => {
    test('generates 3 progressive max attempts', () => {
      const sets = FormulaCalculator.generateProgressiveMaxAttempts(225, 4);
      expect(sets).toHaveLength(3);
    });

    test('progressive max weights: +5, +10, +15 lbs', () => {
      const sets = FormulaCalculator.generateProgressiveMaxAttempts(225, 4);
      expect(sets[0].weight).toBe(230); // +5
      expect(sets[1].weight).toBe(235); // +10
      expect(sets[2].weight).toBe(240); // +15
    });

    test('all sets are conditional', () => {
      const sets = FormulaCalculator.generateProgressiveMaxAttempts(225, 4);
      expect(sets[0].isConditional).toBe(true);
      expect(sets[1].isConditional).toBe(true);
      expect(sets[2].isConditional).toBe(true);
    });

    test('set 5 unlocks if set 4 had 1+ reps', () => {
      const sets = FormulaCalculator.generateProgressiveMaxAttempts(225, 4);
      expect(sets[0].condition?.type).toBe('reps_achieved');
      expect(sets[0].condition?.requiredReps).toBe(1);
      expect(sets[0].condition?.previousSetNumber).toBe(4);
    });

    test('set 6 unlocks if set 5 had 1+ reps', () => {
      const sets = FormulaCalculator.generateProgressiveMaxAttempts(225, 4);
      expect(sets[1].condition?.previousSetNumber).toBe(5);
    });

    test('all progressive max sets have 1 rep target', () => {
      const sets = FormulaCalculator.generateProgressiveMaxAttempts(225, 4);
      expect(sets[0].targetReps).toBe(1);
      expect(sets[1].targetReps).toBe(1);
      expect(sets[2].targetReps).toBe(1);
    });

    test('all progressive max sets have 1-5 MIN rest', () => {
      const sets = FormulaCalculator.generateProgressiveMaxAttempts(225, 4);
      expect(sets[0].restPeriod).toBe('1-5 MIN');
      expect(sets[1].restPeriod).toBe('1-5 MIN');
      expect(sets[2].restPeriod).toBe('1-5 MIN');
    });
  });

  describe('generatePyramidSets', () => {
    test('generates complete pyramid structure', () => {
      const sets = FormulaCalculator.generatePyramidSets('bench-press', 225);
      expect(sets.length).toBeGreaterThanOrEqual(4);
    });

    test('pyramid starts with warmup (35%)', () => {
      const sets = FormulaCalculator.generatePyramidSets('bench-press', 225);
      expect(sets[0].intensityPercentage).toBe(0.35);
      expect(sets[0].weight).toBe(80); // 35% of 225, rounded
    });

    test('pyramid includes working sets (80%, 90%)', () => {
      const sets = FormulaCalculator.generatePyramidSets('bench-press', 225);
      const workingSets = sets.filter(s => 
        s.intensityPercentage >= 0.80 && s.intensityPercentage < 1.00
      );
      expect(workingSets.length).toBeGreaterThanOrEqual(2);
    });

    test('pyramid includes max attempt (100%)', () => {
      const sets = FormulaCalculator.generatePyramidSets('bench-press', 225);
      const maxSet = sets.find(s => s.intensityPercentage === 1.00);
      expect(maxSet).toBeDefined();
      expect(maxSet?.weight).toBe(225);
    });

    test('includes progressive max attempts if enabled', () => {
      const sets = FormulaCalculator.generatePyramidSets('bench-press', 225, {
        includeProgressiveMaxAttempts: true
      });
      const progressiveSets = sets.filter(s => s.setType === 'progressive_max');
      expect(progressiveSets.length).toBeGreaterThanOrEqual(1);
    });

    test('beginner gets 45 lb bar for warmup', () => {
      const sets = FormulaCalculator.generatePyramidSets('bench-press', 100);
      expect(sets[0].weight).toBe(45);
    });
  });

  describe('calculateRestPeriodFromIntensity', () => {
    test('warmup intensity (≤35%) gets 30s rest', () => {
      const result = FormulaCalculator.calculateRestPeriodFromIntensity(0.35);
      expect(result).toBe('30s');
    });

    test('light working set (50-65%) gets 1-2 MIN rest', () => {
      const result = FormulaCalculator.calculateRestPeriodFromIntensity(0.60);
      expect(result).toBe('1-2 MIN');
    });

    test('heavy working set (70-85%) gets 1-2 MIN rest', () => {
      const result = FormulaCalculator.calculateRestPeriodFromIntensity(0.80);
      expect(result).toBe('1-2 MIN');
    });

    test('max effort (≥90%) gets 1-5 MIN rest', () => {
      const result = FormulaCalculator.calculateRestPeriodFromIntensity(0.90);
      expect(result).toBe('1-5 MIN');
    });

    test('progressive max (>100%) gets 1-5 MIN rest', () => {
      const result = FormulaCalculator.calculateRestPeriodFromIntensity(1.05);
      expect(result).toBe('1-5 MIN');
    });
  });

  describe('calculateNewMax', () => {
    test('successful max attempt increases by 5 lbs', () => {
      const result = FormulaCalculator.calculateNewMax(225, true);
      expect(result).toBe(230);
    });

    test('failed max attempt keeps same max', () => {
      const result = FormulaCalculator.calculateNewMax(225, false);
      expect(result).toBe(225);
    });

    test('handles fractional maxes by rounding', () => {
      const result = FormulaCalculator.calculateNewMax(227.5, true);
      expect(result).toBe(235); // 227.5 + 5 = 232.5, rounds to 235
    });
  });

  describe('Edge Cases and Integration', () => {
    test('handles very low 4RM (45 lbs)', () => {
      const result = FormulaCalculator.calculateWeightByPercentage(45, 0.35);
      expect(result).toBe(45); // Minimum is bar weight
    });

    test('handles very high 4RM (500 lbs)', () => {
      const result = FormulaCalculator.calculateWeightByPercentage(500, 0.80);
      expect(result).toBe(400);
    });

    test('pyramid generation is deterministic', () => {
      const sets1 = FormulaCalculator.generatePyramidSets('bench-press', 225);
      const sets2 = FormulaCalculator.generatePyramidSets('bench-press', 225);
      expect(sets1.length).toBe(sets2.length);
      expect(sets1[0].weight).toBe(sets2[0].weight);
    });

    test('conditional sets unlock in correct order', () => {
      const sets = FormulaCalculator.generateProgressiveMaxAttempts(225, 4);
      
      // Set 5 should unlock first
      expect(sets[0].setNumber).toBe(5);
      expect(sets[0].condition?.previousSetNumber).toBe(4);
      
      // Set 6 should unlock after set 5
      expect(sets[1].setNumber).toBe(6);
      expect(sets[1].condition?.previousSetNumber).toBe(5);
    });
  });
});
