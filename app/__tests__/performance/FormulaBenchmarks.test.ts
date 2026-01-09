/**
 * Performance Benchmark Tests
 * 
 * Validates performance requirements for:
 * - Formula calculation speed (<10ms target, <1ms actual)
 * - Set logging operations (<100ms)
 * - Workout generation (<50ms)
 * - Conditional set evaluation (<5ms)
 * 
 * Based on: plans/FORMULA_INTEGRATION_PLAN.md Section 5.4
 */

import FormulaCalculator from '../../src/services/FormulaCalculatorEnhanced';
import WorkoutEngineEnhanced from '../../src/services/WorkoutEngineEnhanced';
import { SetLog, ExerciseLog, WorkoutSession, MaxLift } from '../../src/types';
import { ConditionalSet } from '../../src/types/enhanced';

describe('Performance Benchmark Tests', () => {

  describe('Formula Calculation Speed', () => {
    test('single weight calculation completes in <1ms', () => {
      const startTime = performance.now();
      
      FormulaCalculator.calculateWeightByPercentage(225, 0.80);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1); // Target: <10ms, Actual: <1ms
    });

    test('100 weight calculations complete in <10ms', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        FormulaCalculator.calculateWeightByPercentage(225, 0.80);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10);
      console.log(`100 calculations: ${duration.toFixed(3)}ms (${(duration/100).toFixed(4)}ms per calc)`);
    });

    test('max attempt evaluation completes in <1ms', () => {
      const startTime = performance.now();
      
      FormulaCalculator.evaluateMaxAttempt(225, 1);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1);
    });

    test('new max calculation from 100 sets completes in <5ms', () => {
      const sets: SetLog[] = [];
      for (let i = 0; i < 100; i++) {
        sets.push({
          id: `set-${i}`,
          exerciseLogId: 'test',
          setNumber: i + 1,
          weight: 200 + (i % 10),
          reps: i % 5 === 0 ? 0 : 1,
          targetReps: { min: 1, max: 1 },
          restSeconds: 120,
          completedAt: Date.now()
        });
      }

      const startTime = performance.now();
      
      FormulaCalculator.calculateNewMax(225, sets);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5);
      console.log(`Calculate new max from 100 sets: ${duration.toFixed(3)}ms`);
    });
  });

  describe('Workout Generation Performance', () => {
    test('generate workout sets completes in <10ms', () => {
      const startTime = performance.now();
      
      WorkoutEngineEnhanced.generateWorkoutSets('bench-press', 225);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10);
      console.log(`Generate workout sets: ${duration.toFixed(3)}ms`);
    });

    test('generate 10 exercise workouts completes in <50ms', () => {
      const exercises = [
        'bench-press', 'squat', 'deadlift', 'overhead-press', 'barbell-row',
        'incline-bench', 'front-squat', 'romanian-deadlift', 'dumbbell-press', 'pull-up'
      ];
      const fourRepMax = 225;

      const startTime = performance.now();
      
      exercises.forEach(exercise => {
        WorkoutEngineEnhanced.generateWorkoutSets(exercise, fourRepMax);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50);
      console.log(`Generate 10 workouts: ${duration.toFixed(3)}ms (${(duration/10).toFixed(2)}ms per workout)`);
    });

    test('generate down sets completes in <5ms', () => {
      const startTime = performance.now();
      
      WorkoutEngineEnhanced.generateDownSets(225, 5, 3);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5);
    });

    test('max determination session generation completes in <10ms', () => {
      const startTime = performance.now();
      
      WorkoutEngineEnhanced.createMaxDeterminationSession('user-1', 'bench-press', 200);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10);
      console.log(`Max determination session: ${duration.toFixed(3)}ms`);
    });
  });

  describe('Set Logging Performance', () => {
    test('log single set with progression completes in <50ms', () => {
      const exerciseLog: ExerciseLog = {
        id: 'exercise-1',
        sessionId: 'session-1',
        exerciseId: 'bench-press',
        order: 1,
        suggestedWeight: 225,
        sets: []
      };

      const startTime = performance.now();
      
      WorkoutEngineEnhanced.logSetWithProgression(
        exerciseLog, 4, 225, 1, 180, 225
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50);
      console.log(`Log set with progression: ${duration.toFixed(3)}ms`);
    });

    test('log 100 sets completes in <1000ms', () => {
      const exerciseLog: ExerciseLog = {
        id: 'exercise-1',
        sessionId: 'session-1',
        exerciseId: 'bench-press',
        order: 1,
        suggestedWeight: 225,
        sets: []
      };

      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        WorkoutEngineEnhanced.logSetWithProgression(
          exerciseLog, i + 1, 200, 1, 120, 225
        );
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000);
      console.log(`Log 100 sets: ${duration.toFixed(2)}ms (${(duration/100).toFixed(3)}ms per set)`);
    });
  });

  describe('Conditional Set Evaluation Performance', () => {
    test('evaluate conditional set display completes in <1ms', () => {
      const set: ConditionalSet = {
        setNumber: 5,
        weight: 230,
        targetReps: 1,
        restPeriod: '1-5 MIN',
        intensityPercentage: 1.05,
        isConditional: true,
        condition: {
          type: 'reps_achieved',
          requiredSets: 4,
          requiredReps: 1
        },
        shouldDisplay: false
      };

      const completedSets: SetLog[] = [
        { id: '1', exerciseLogId: 'test', setNumber: 4, weight: 225, reps: 1, targetReps: { min: 1, max: 1 }, restSeconds: 180, completedAt: Date.now() }
      ];

      const startTime = performance.now();
      
      WorkoutEngineEnhanced.shouldDisplaySet(set, completedSets);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1);
    });

    test('evaluate 50 conditional sets completes in <10ms', () => {
      const sets: ConditionalSet[] = [];
      const completedSets: SetLog[] = [];

      for (let i = 0; i < 50; i++) {
        sets.push({
          setNumber: i + 1,
          weight: 200,
          targetReps: 1,
          restPeriod: '1 MIN',
          intensityPercentage: 0.90,
          isConditional: i > 3,
          condition: i > 3 ? {
            type: 'reps_achieved',
            requiredSets: i,
            requiredReps: 1
          } : undefined,
          shouldDisplay: false
        });

        if (i < 25) {
          completedSets.push({
            id: `${i}`,
            exerciseLogId: 'test',
            setNumber: i + 1,
            weight: 200,
            reps: 1,
            targetReps: { min: 1, max: 1 },
            restSeconds: 120,
            completedAt: Date.now()
          });
        }
      }

      const startTime = performance.now();
      
      sets.forEach(set => {
        WorkoutEngineEnhanced.shouldDisplaySet(set, completedSets);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10);
      console.log(`Evaluate 50 conditional sets: ${duration.toFixed(3)}ms`);
    });
  });

  describe('Workout Completion Performance', () => {
    test('complete workout with progression completes in <100ms', () => {
      const session: WorkoutSession = {
        id: 'session-1',
        userId: 'user-1',
        weekNumber: 1,
        dayNumber: 1,
        startedAt: Date.now() - 3600000,
        status: 'in_progress',
        exercises: [
          {
            id: 'ex-1',
            sessionId: 'session-1',
            exerciseId: 'bench-press',
            order: 1,
            suggestedWeight: 225,
            sets: [
              { id: '1', exerciseLogId: 'ex-1', setNumber: 1, weight: 80, reps: 6, targetReps: { min: 6, max: 6 }, restSeconds: 30, completedAt: Date.now() },
              { id: '2', exerciseLogId: 'ex-1', setNumber: 2, weight: 180, reps: 1, targetReps: { min: 1, max: 1 }, restSeconds: 90, completedAt: Date.now() },
              { id: '3', exerciseLogId: 'ex-1', setNumber: 3, weight: 205, reps: 1, targetReps: { min: 1, max: 1 }, restSeconds: 120, completedAt: Date.now() },
              { id: '4', exerciseLogId: 'ex-1', setNumber: 4, weight: 225, reps: 1, targetReps: { min: 1, max: 1 }, restSeconds: 180, completedAt: Date.now() },
              { id: '5', exerciseLogId: 'ex-1', setNumber: 5, weight: 230, reps: 1, targetReps: { min: 1, max: 1 }, restSeconds: 180, completedAt: Date.now() },
            ]
          }
        ]
      };

      const currentMaxes: Record<string, MaxLift> = {
        'bench-press': {
          id: 'max-1',
          userId: 'user-1',
          exerciseId: 'bench-press',
          weight: 225,
          reps: 1,
          dateAchieved: Date.now() - 86400000,
          verified: true
        }
      };

      const startTime = performance.now();
      
      WorkoutEngineEnhanced.completeWorkoutWithProgression(session, currentMaxes);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
      console.log(`Complete workout with progression: ${duration.toFixed(3)}ms`);
    });

    test('complete 5-exercise workout completes in <200ms', () => {
      const exercises: ExerciseLog[] = [];
      
      for (let i = 0; i < 5; i++) {
        exercises.push({
          id: `ex-${i}`,
          sessionId: 'session-1',
          exerciseId: `exercise-${i}`,
          order: i + 1,
          suggestedWeight: 200,
          sets: [
            { id: `${i}-1`, exerciseLogId: `ex-${i}`, setNumber: 1, weight: 70, reps: 6, targetReps: { min: 6, max: 6 }, restSeconds: 30, completedAt: Date.now() },
            { id: `${i}-2`, exerciseLogId: `ex-${i}`, setNumber: 2, weight: 160, reps: 1, targetReps: { min: 1, max: 1 }, restSeconds: 90, completedAt: Date.now() },
            { id: `${i}-3`, exerciseLogId: `ex-${i}`, setNumber: 3, weight: 180, reps: 1, targetReps: { min: 1, max: 1 }, restSeconds: 120, completedAt: Date.now() },
            { id: `${i}-4`, exerciseLogId: `ex-${i}`, setNumber: 4, weight: 200, reps: 1, targetReps: { min: 1, max: 1 }, restSeconds: 180, completedAt: Date.now() },
          ]
        });
      }

      const session: WorkoutSession = {
        id: 'session-1',
        userId: 'user-1',
        weekNumber: 1,
        dayNumber: 1,
        startedAt: Date.now() - 3600000,
        status: 'in_progress',
        exercises
      };

      const currentMaxes: Record<string, MaxLift> = {};
      exercises.forEach((ex, i) => {
        currentMaxes[`exercise-${i}`] = {
          id: `max-${i}`,
          userId: 'user-1',
          exerciseId: `exercise-${i}`,
          weight: 200,
          reps: 1,
          dateAchieved: Date.now() - 86400000,
          verified: true
        };
      });

      const startTime = performance.now();
      
      WorkoutEngineEnhanced.completeWorkoutWithProgression(session, currentMaxes);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200);
      console.log(`Complete 5-exercise workout: ${duration.toFixed(3)}ms (${(duration/5).toFixed(2)}ms per exercise)`);
    });
  });

  describe('Rest Period Calculation Performance', () => {
    test('1000 rest period calculations complete in <10ms', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        WorkoutEngineEnhanced.calculateRestPeriod(180, 200);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10);
      console.log(`1000 rest calculations: ${duration.toFixed(3)}ms`);
    });
  });

  describe('Workout Statistics Performance', () => {
    test('calculate exercise stats for 50-set workout completes in <10ms', () => {
      const sets: SetLog[] = [];
      for (let i = 0; i < 50; i++) {
        sets.push({
          id: `set-${i}`,
          exerciseLogId: 'test',
          setNumber: i + 1,
          weight: 200,
          reps: 5,
          targetReps: { min: 5, max: 5 },
          restSeconds: 90,
          completedAt: Date.now()
        });
      }

      const startTime = performance.now();
      
      WorkoutEngineEnhanced.calculateExerciseStats(sets);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10);
      console.log(`Calculate stats for 50 sets: ${duration.toFixed(3)}ms`);
    });
  });

  describe('Complex Scenario Performance', () => {
    test('complete 48-week simulation completes in <5000ms', () => {
      const startTime = performance.now();
      
      let currentMax = 185;
      
      // Simulate 48 weeks × 3 workouts = 144 workouts
      for (let week = 1; week <= 48; week++) {
        for (let day = 1; day <= 3; day++) {
          const exerciseLog: ExerciseLog = {
            id: `ex-${week}-${day}`,
            sessionId: `session-${week}-${day}`,
            exerciseId: 'bench-press',
            order: 1,
            suggestedWeight: 0,
            sets: []
          };

          // Complete 5 sets
          const sets = WorkoutEngineEnhanced.generateWorkoutSets('bench-press', currentMax);
          for (let i = 0; i < 5; i++) {
            WorkoutEngineEnhanced.logSetWithProgression(
              exerciseLog, i + 1, sets[i].weight, 1, 120, currentMax
            );
          }

          // Calculate new max
          const newMax = FormulaCalculator.calculateNewMax(currentMax, exerciseLog.sets);
          if (newMax > currentMax) {
            currentMax = newMax;
          }
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5000);
      console.log(`48-week simulation (144 workouts): ${duration.toFixed(2)}ms (${(duration/144).toFixed(2)}ms per workout)`);
    });
  });

  describe('Memory Efficiency', () => {
    test('generate 1000 workout sets does not cause memory issues', () => {
      const results: ConditionalSet[][] = [];
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const sets = WorkoutEngineEnhanced.generateWorkoutSets('bench-press', 200 + i);
        results.push(sets);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(results[0]).toHaveLength(6);
      expect(duration).toBeLessThan(500);
      console.log(`Generate 1000 workouts: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Rounding Performance', () => {
    test('10000 rounding operations complete in <10ms', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 10000; i++) {
        FormulaCalculator.roundToNearest5(i);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10);
      console.log(`10000 rounding operations: ${duration.toFixed(3)}ms`);
    });
  });

  describe('Overall System Performance', () => {
    test('performance summary - all operations under target', () => {
      const benchmarks = {
        'Single weight calc': { target: 10, actual: 0 },
        'Max attempt eval': { target: 1, actual: 0 },
        'Generate workout': { target: 10, actual: 0 },
        'Log set': { target: 50, actual: 0 },
        'Complete workout': { target: 100, actual: 0 },
        'Calculate stats': { target: 10, actual: 0 }
      };

      // Single weight calculation
      let start = performance.now();
      FormulaCalculator.calculateWeightByPercentage(225, 0.80);
      benchmarks['Single weight calc'].actual = performance.now() - start;

      // Max attempt evaluation
      start = performance.now();
      FormulaCalculator.evaluateMaxAttempt(225, 1);
      benchmarks['Max attempt eval'].actual = performance.now() - start;

      // Generate workout
      start = performance.now();
      WorkoutEngineEnhanced.generateWorkoutSets('bench-press', 225);
      benchmarks['Generate workout'].actual = performance.now() - start;

      // Log set
      const exerciseLog: ExerciseLog = {
        id: 'test',
        sessionId: 'test',
        exerciseId: 'bench-press',
        order: 1,
        suggestedWeight: 225,
        sets: []
      };
      start = performance.now();
      WorkoutEngineEnhanced.logSetWithProgression(exerciseLog, 1, 225, 1, 120, 225);
      benchmarks['Log set'].actual = performance.now() - start;

      // Complete workout
      const session: WorkoutSession = {
        id: 'session-1',
        userId: 'user-1',
        weekNumber: 1,
        dayNumber: 1,
        startedAt: Date.now() - 3600000,
        status: 'in_progress',
        exercises: [exerciseLog]
      };
      const maxes: Record<string, MaxLift> = {
        'bench-press': {
          id: 'max-1',
          userId: 'user-1',
          exerciseId: 'bench-press',
          weight: 225,
          reps: 1,
          dateAchieved: Date.now(),
          verified: true
        }
      };
      start = performance.now();
      WorkoutEngineEnhanced.completeWorkoutWithProgression(session, maxes);
      benchmarks['Complete workout'].actual = performance.now() - start;

      // Calculate stats
      start = performance.now();
      WorkoutEngineEnhanced.calculateExerciseStats(exerciseLog.sets);
      benchmarks['Calculate stats'].actual = performance.now() - start;

      // Verify all benchmarks
      console.log('\n📊 Performance Benchmark Summary:');
      console.log('================================');
      Object.entries(benchmarks).forEach(([name, { target, actual }]) => {
        const status = actual < target ? '✅' : '⚠️';
        console.log(`${status} ${name}: ${actual.toFixed(3)}ms (target: <${target}ms)`);
        expect(actual).toBeLessThan(target);
      });
      console.log('================================\n');
    });
  });
});
