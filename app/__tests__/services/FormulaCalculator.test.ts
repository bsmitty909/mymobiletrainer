/**
 * FormulaCalculator Tests
 * 
 * CRITICAL: These tests validate that our formulas match the Excel spreadsheet exactly.
 * All calculations must be 100% accurate to the original Excel formulas.
 */

import FormulaCalculator from '../../src/services/FormulaCalculator';
import { ExerciseLog, FormulaContext, WeightFormula } from '../../src/types';

describe('FormulaCalculator', () => {
  describe('calculateWeekWeight - Excel Formula Validation', () => {
    test('Week 1 warmup set (40% of 245 lbs max)', () => {
      const result = FormulaCalculator.calculateWeekWeight(245, 'intensity', 1, 4);
      expect(result).toBe(100); // 245 * 0.40 = 98 → rounds to 100
    });

    test('Week 1 working set 2 (85% of 245 lbs max)', () => {
      const result = FormulaCalculator.calculateWeekWeight(245, 'intensity', 2, 4);
      expect(result).toBe(210); // 245 * 0.85 = 208.25 → rounds to 210
    });

    test('Week 3 percentage set (75% of 245 lbs max)', () => {
      const result = FormulaCalculator.calculateWeekWeight(245, 'percentage', 2, 4);
      expect(result).toBe(185); // 245 * 0.75 = 183.75 → rounds to 185
    });

    test('Week 4 mixed protocol (90% of 245 lbs max)', () => {
      const result = FormulaCalculator.calculateWeekWeight(245, 'mixed', 2, 4);
      expect(result).toBe(220); // 245 * 0.90 = 220.5 → rounds to 220
    });

    test('Max week (100% of 245 lbs max)', () => {
      const result = FormulaCalculator.calculateWeekWeight(245, 'max', 2, 4);
      expect(result).toBeGreaterThanOrEqual(205); // Progressive from 85% up
    });
  });

  describe('roundToAvailableWeight - Gym Increment Rounding', () => {
    test('rounds 208.25 to nearest 5 lbs', () => {
      const result = FormulaCalculator.roundToAvailableWeight(208.25, 5);
      expect(result).toBe(210);
    });

    test('rounds 18.75 to nearest 2.5 lbs', () => {
      const result = FormulaCalculator.roundToAvailableWeight(18.75, 2.5);
      expect(result).toBe(20);
    });

    test('rounds 183.75 to nearest 5 lbs', () => {
      const result = FormulaCalculator.roundToAvailableWeight(183.75, 5);
      expect(result).toBe(185);
    });

    test('rounds 47.3 to nearest 2.5 lbs', () => {
      const result = FormulaCalculator.roundToAvailableWeight(47.3, 2.5);
      expect(result).toBe(47.5);
    });
  });

  describe('analyzeProgression - Progressive Overload Logic', () => {
    test('suggests weight increase when reps exceeded (barbell)', () => {
      const mockLog: ExerciseLog = {
        id: 'test',
        sessionId: 'test',
        exerciseId: 'bench-press',
        order: 1,
        suggestedWeight: 215,
        sets: [
          {
            id: '1',
            exerciseLogId: 'test',
            setNumber: 1,
            weight: 215,
            reps: 6,
            targetReps: { min: 6, max: 6 },
            restSeconds: 30,
            completedAt: Date.now(),
          },
          {
            id: '2',
            exerciseLogId: 'test',
            setNumber: 2,
            weight: 215,
            reps: 8, // Exceeded target of 1-6
            targetReps: { min: 1, max: 6 },
            restSeconds: 90,
            completedAt: Date.now(),
          },
        ],
      };

      const result = FormulaCalculator.analyzeProgression(mockLog, 'barbell');
      
      expect(result.shouldIncrease).toBe(true);
      expect(result.recommendedChange).toBe(5); // Barbell increment
    });

    test('suggests weight decrease when reps failed (dumbbell)', () => {
      const mockLog: ExerciseLog = {
        id: 'test',
        sessionId: 'test',
        exerciseId: 'dumbbell-press',
        order: 1,
        suggestedWeight: 75,
        sets: [
          {
            id: '1',
            exerciseLogId: 'test',
            setNumber: 1,
            weight: 75,
            reps: 4,
            targetReps: { min: 10, max: 12 },
            restSeconds: 90,
            completedAt: Date.now(),
          },
        ],
      };

      const result = FormulaCalculator.analyzeProgression(mockLog, 'dumbbell');
      
      expect(result.shouldDecrease).toBe(true);
      expect(result.recommendedChange).toBe(-5); // Standard decrease
    });

    test('maintains weight when target hit', () => {
      const mockLog: ExerciseLog = {
        id: 'test',
        sessionId: 'test',
        exerciseId: 'bench-press',
        order: 1,
        suggestedWeight: 215,
        sets: [
          {
            id: '1',
            exerciseLogId: 'test',
            setNumber: 1,
            weight: 215,
            reps: 11,
            targetReps: { min: 10, max: 12 },
            restSeconds: 90,
            completedAt: Date.now(),
          },
        ],
      };

      const result = FormulaCalculator.analyzeProgression(mockLog, 'barbell');
      
      expect(result.shouldMaintain).toBe(true);
      expect(result.recommendedChange).toBe(0);
    });

    test('handles rep-out sets (20+ reps = increase)', () => {
      const mockLog: ExerciseLog = {
        id: 'test',
        sessionId: 'test',
        exerciseId: 'lat-pulldown',
        order: 1,
        suggestedWeight: 160,
        sets: [
          {
            id: '1',
            exerciseLogId: 'test',
            setNumber: 1,
            weight: 160,
            reps: 22,
            targetReps: 'REP_OUT',
            restSeconds: 60,
            completedAt: Date.now(),
          },
        ],
      };

      const result = FormulaCalculator.analyzeProgression(mockLog, 'cable');
      
      expect(result.shouldIncrease).toBe(true);
      expect(result.recommendedChange).toBe(5); // Cable increment
    });
  });

  describe('calculateAccessoryWeight - Excel Accessory Formulas', () => {
    test('chest fly is 25% of incline press max', () => {
      const inclineMax = 75; // From Excel example
      const result = FormulaCalculator.calculateAccessoryWeight(inclineMax, 0.25);
      
      expect(result).toBe(18.75); // Will be rounded to 20 in practice
    });

    test('lateral raise is 30% of shoulder press max', () => {
      const shoulderMax = 70; // From Excel example
      const result = FormulaCalculator.calculateAccessoryWeight(shoulderMax, 0.30);
      
      expect(result).toBe(21);
    });

    test('cable row is 50% of shoulder press max', () => {
      const shoulderMax = 70;
      const result = FormulaCalculator.calculateAccessoryWeight(shoulderMax, 0.50);
      
      expect(result).toBe(35);
    });
  });

  describe('generateMaxTestingProgression - Max Week Protocol', () => {
    test('generates 11 sets from 35% to estimated max', () => {
      const estimatedMax = 245;
      const progression = FormulaCalculator.generateMaxTestingProgression(estimatedMax, 11);
      
      expect(progression).toHaveLength(11);
      expect(progression[0]).toBeLessThan(100); // Starts at 35% ≈ 85 lbs
      expect(progression[progression.length - 1]).toBeGreaterThan(estimatedMax); // Goes above estimated max
      
      // Check progression increases
      for (let i = 1; i < progression.length; i++) {
        expect(progression[i]).toBeGreaterThan(progression[i - 1]);
      }
    });

    test('all weights are rounded to 5 lb increments', () => {
      const progression = FormulaCalculator.generateMaxTestingProgression(245, 11);
      
      progression.forEach(weight => {
        expect(weight % 5).toBe(0);
      });
    });
  });

  describe('calculateVolume - Total Workout Volume', () => {
    test('calculates total weight lifted across exercises', () => {
      const mockExercises: ExerciseLog[] = [
        {
          id: '1',
          sessionId: 'test',
          exerciseId: 'bench-press',
          order: 1,
          suggestedWeight: 215,
          sets: [
            { id: '1', exerciseLogId: '1', setNumber: 1, weight: 215, reps: 6, targetReps: { min: 6, max: 6 }, restSeconds: 30, completedAt: Date.now() },
            { id: '2', exerciseLogId: '1', setNumber: 2, weight: 215, reps: 1, targetReps: { min: 1, max: 1 }, restSeconds: 90, completedAt: Date.now() },
          ],
        },
        {
          id: '2',
          sessionId: 'test',
          exerciseId: 'lat-pulldown',
          order: 2,
          suggestedWeight: 250,
          sets: [
            { id: '3', exerciseLogId: '2', setNumber: 1, weight: 250, reps: 6, targetReps: { min: 6, max: 6 }, restSeconds: 30, completedAt: Date.now() },
            { id: '4', exerciseLogId: '2', setNumber: 2, weight: 250, reps: 3, targetReps: { min: 3, max: 3 }, restSeconds: 90, completedAt: Date.now() },
          ],
        },
      ];

      const volume = FormulaCalculator.calculateVolume(mockExercises);
      
      // (215*6 + 215*1) + (250*6 + 250*3) = 1290 + 215 + 1500 + 750 = 3755
      expect(volume).toBe((215 * 6) + (215 * 1) + (250 * 6) + (250 * 3));
    });
  });

  describe('checkForPR - Personal Record Detection', () => {
    test('detects new PR when weight exceeds current max', () => {
      const mockLog: ExerciseLog = {
        id: 'test',
        sessionId: 'test',
        exerciseId: 'bench-press',
        order: 1,
        suggestedWeight: 255,
        sets: [
          {
            id: '1',
            exerciseLogId: 'test',
            setNumber: 1,
            weight: 255,
            reps: 1,
            targetReps: { min: 1, max: 1 },
            restSeconds: 120,
            completedAt: Date.now(),
          },
        ],
      };

      const currentMax = 245;
      const result = FormulaCalculator.checkForPR(mockLog, currentMax);
      
      expect(result.isNewPR).toBe(true);
      expect(result.newMax).toBe(255);
      expect(result.improvement).toBe(10);
    });

    test('does not detect PR when weight is below current max', () => {
      const mockLog: ExerciseLog = {
        id: 'test',
        sessionId: 'test',
        exerciseId: 'bench-press',
        order: 1,
        suggestedWeight: 215,
        sets: [
          {
            id: '1',
            exerciseLogId: 'test',
            setNumber: 1,
            weight: 215,
            reps: 6,
            targetReps: { min: 6, max: 6 },
            restSeconds: 30,
            completedAt: Date.now(),
          },
        ],
      };

      const currentMax = 245;
      const result = FormulaCalculator.checkForPR(mockLog, currentMax);
      
      expect(result.isNewPR).toBe(false);
    });
  });

  describe('calculateDownSetWeight - Down Set Formula', () => {
    test('calculates 65% of max for down sets', () => {
      const result = FormulaCalculator.calculateDownSetWeight(250);
      expect(result).toBe(165); // 250 * 0.65 = 162.5 → rounds to 165
    });

    test('rounds to 5 lb increments', () => {
      const result = FormulaCalculator.calculateDownSetWeight(245);
      expect(result % 5).toBe(0);
    });
  });

  describe('validateWeight - Sanity Checking', () => {
    test('accepts weight within reasonable range', () => {
      const result = FormulaCalculator.validateWeight(210, 245, 'intensity');
      expect(result.isValid).toBe(true);
    });

    test('warns when weight exceeds max significantly', () => {
      const result = FormulaCalculator.validateWeight(300, 245, 'intensity');
      expect(result.isValid).toBe(false);
      expect(result.warning).toContain('exceeds your max');
    });

    test('warns when weight is too light', () => {
      const result = FormulaCalculator.validateWeight(50, 245, 'intensity');
      expect(result.isValid).toBe(false);
      expect(result.warning).toContain('very light');
    });
  });

  describe('calculatePercentageOfMax', () => {
    test('calculates 85% correctly', () => {
      const result = FormulaCalculator.calculatePercentageOfMax(210, 245);
      expect(result).toBe(86); // Rounds to 86%
    });

    test('calculates 100%+ for new PRs', () => {
      const result = FormulaCalculator.calculatePercentageOfMax(255, 245);
      expect(result).toBe(104);
    });
  });

  describe('calculateSuggestedWeight - Full Formula Integration', () => {
    test('calculates weight with percentage formula', () => {
      const formula: WeightFormula = {
        baseType: 'userMax',
        percentage: 85,
        roundTo: 5,
      };

      const context: FormulaContext = {
        userMaxes: {
          'bench-press': {
            id: 'test',
            userId: 'user1',
            exerciseId: 'bench-press',
            weight: 245,
            reps: 1,
            dateAchieved: Date.now(),
            verified: true,
          },
        },
        weekType: 'intensity',
        exerciseType: 'barbell',
      };

      const result = FormulaCalculator.calculateSuggestedWeight(formula, context);
      
      expect(result.suggestedWeight).toBe(210); // 245 * 0.85 = 208.25 → 210
      expect(result.appliedPercentage).toBe(85);
    });

    test('applies progressive overload adjustment', () => {
      const formula: WeightFormula = {
        baseType: 'userMax',
        percentage: 85,
        roundTo: 5,
      };

      const previousWorkout: ExerciseLog = {
        id: 'prev',
        sessionId: 'prev-session',
        exerciseId: 'bench-press',
        order: 1,
        suggestedWeight: 210,
        actualWeight: 210,
        sets: [
          {
            id: '1',
            exerciseLogId: 'prev',
            setNumber: 1,
            weight: 210,
            reps: 3, // Exceeded target of 1
            targetReps: { min: 1, max: 1 },
            restSeconds: 90,
            completedAt: Date.now(),
          },
        ],
      };

      const context: FormulaContext = {
        userMaxes: {
          'bench-press': {
            id: 'test',
            userId: 'user1',
            exerciseId: 'bench-press',
            weight: 245,
            reps: 1,
            dateAchieved: Date.now(),
            verified: true,
          },
        },
        weekType: 'intensity',
        exerciseType: 'barbell',
        previousWorkout,
      };

      const result = FormulaCalculator.calculateSuggestedWeight(formula, context);
      
      // Should be base weight (210) + progressive overload (+5) = 215
      expect(result.suggestedWeight).toBe(215);
    });

    test('calculates accessory exercise from related exercise max', () => {
      const formula: WeightFormula = {
        baseType: 'relatedExercise',
        exerciseReference: 'dumbbell-incline-press',
        percentage: 25,
        roundTo: 2.5,
      };

      const context: FormulaContext = {
        userMaxes: {
          'dumbbell-incline-press': {
            id: 'test',
            userId: 'user1',
            exerciseId: 'dumbbell-incline-press',
            weight: 75,
            reps: 1,
            dateAchieved: Date.now(),
            verified: true,
          },
        },
        weekType: 'intensity',
        exerciseType: 'dumbbell',
      };

      const result = FormulaCalculator.calculateSuggestedWeight(formula, context);
      
      // 75 * 0.25 = 18.75 → rounds to 20 (nearest 2.5)
      expect(result.suggestedWeight).toBe(20);
    });
  });

  describe('convertWeight - Unit Conversion', () => {
    test('converts lbs to kg', () => {
      const result = FormulaCalculator.convertWeight(245, 'lbs', 'kg');
      expect(result).toBeCloseTo(111.13, 1); // 245 * 0.453592
    });

    test('converts kg to lbs', () => {
      const result = FormulaCalculator.convertWeight(111.13, 'kg', 'lbs');
      expect(result).toBeCloseTo(245, 0);
    });

    test('returns same weight when units match', () => {
      const result = FormulaCalculator.convertWeight(245, 'lbs', 'lbs');
      expect(result).toBe(245);
    });
  });
});
