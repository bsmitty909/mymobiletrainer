/**
 * ProtocolWorkoutEngine Tests
 * 
 * Tests for P1/P2/P3 protocol workout generation.
 * Validates earned progression logic, adaptive warmups, and down sets.
 */

import ProtocolWorkoutEngine from '../../src/services/ProtocolWorkoutEngine';
import { Protocol, FourRepMax } from '../../src/types';

describe('ProtocolWorkoutEngine', () => {
  const mockFourRepMax: FourRepMax = {
    id: 'test-4rm-1',
    userId: 'user-1',
    exerciseId: 'bench-press',
    weight: 200,
    dateAchieved: Date.now(),
    verified: true,
  };

  describe('generateP1Warmups', () => {
    it('should generate 2 warmup sets for light loads (<75% 4RM)', () => {
      const warmups = ProtocolWorkoutEngine.generateP1Warmups(140, 200, false); // 70% of 4RM
      expect(warmups.length).toBe(2);
    });

    it('should generate 3 warmup sets for heavy loads (≥75% 4RM)', () => {
      const warmups = ProtocolWorkoutEngine.generateP1Warmups(160, 200, false); // 80% of 4RM
      expect(warmups.length).toBe(3);
    });

    it('should use minimum 10 reps for lower body warmups', () => {
      const warmups = ProtocolWorkoutEngine.generateP1Warmups(200, 200, true); // Lower body
      expect(warmups[0].reps).toBeGreaterThanOrEqual(10);
    });

    it('should progress warmup weights correctly', () => {
      const warmups = ProtocolWorkoutEngine.generateP1Warmups(180, 200, false);
      for (let i = 1; i < warmups.length; i++) {
        expect(warmups[i].weight).toBeGreaterThan(warmups[i - 1].weight);
      }
    });
  });

  describe('generateProtocolExercise - P1', () => {
    it('should generate P1 exercise with warmups and working set', () => {
      const exercise = ProtocolWorkoutEngine.generateProtocolExercise(
        'bench-press',
        'Bench Press',
        'P1',
        mockFourRepMax,
        false
      );

      expect(exercise.protocol).toBe('P1');
      expect(exercise.sets.length).toBeGreaterThanOrEqual(3); // At least 2 warmups + 1 working
      
      const workingSet = exercise.sets.find(s => s.instruction === 'max-attempt');
      expect(workingSet).toBeDefined();
      expect(workingSet?.weight).toBe(200); // 100% of 4RM
    });

    it('should set correct rest periods for P1', () => {
      const exercise = ProtocolWorkoutEngine.generateProtocolExercise(
        'bench-press',
        'Bench Press',
        'P1',
        mockFourRepMax,
        false
      );

      const workingSet = exercise.sets.find(s => s.instruction === 'max-attempt');
      expect(workingSet?.restSeconds).toBe(120); // 2 minutes
    });
  });

  describe('generateProtocolExercise - P2', () => {
    it('should generate P2 exercise with 3 rep-out sets', () => {
      const exercise = ProtocolWorkoutEngine.generateProtocolExercise(
        'incline-press',
        'Incline Press',
        'P2',
        mockFourRepMax,
        false
      );

      expect(exercise.protocol).toBe('P2');
      expect(exercise.sets.length).toBe(3);
      
      exercise.sets.forEach(set => {
        expect(set.instruction).toBe('rep-out');
        expect(set.weight).toBeGreaterThanOrEqual(150); // 75% of 4RM
        expect(set.weight).toBeLessThanOrEqual(160); // 80% of 4RM
        expect(set.restSeconds).toBe(90);
      });
    });

    it('should not include warmup sets for P2', () => {
      const exercise = ProtocolWorkoutEngine.generateProtocolExercise(
        'incline-press',
        'Incline Press',
        'P2',
        mockFourRepMax,
        false
      );

      const warmupSets = exercise.sets.filter(s => s.instruction === 'controlled');
      expect(warmupSets.length).toBe(0);
    });
  });

  describe('generateProtocolExercise - P3', () => {
    it('should generate P3 exercise with 2 rep-out sets', () => {
      const exercise = ProtocolWorkoutEngine.generateProtocolExercise(
        'chest-fly',
        'Chest Fly',
        'P3',
        mockFourRepMax,
        false
      );

      expect(exercise.protocol).toBe('P3');
      expect(exercise.sets.length).toBe(2);
      
      exercise.sets.forEach(set => {
        expect(set.instruction).toBe('rep-out');
        expect(set.weight).toBeGreaterThanOrEqual(130); // 65% of 4RM
        expect(set.weight).toBeLessThanOrEqual(150); // 75% of 4RM
        expect(set.restSeconds).toBe(60);
      });
    });
  });

  describe('processP1Attempt', () => {
    it('should retry with increased weight on success', () => {
      const result = ProtocolWorkoutEngine.processP1Attempt(
        200,
        4,
        true,
        mockFourRepMax,
        false
      );

      expect(result.action).toBe('retry');
      expect(result.newAttemptWeight).toBeGreaterThan(200);
      expect(result.newAttemptWeight).toBeLessThanOrEqual(210); // Max 5% increase
    });

    it('should redirect to down sets on failure', () => {
      const result = ProtocolWorkoutEngine.processP1Attempt(
        200,
        3,
        false,
        mockFourRepMax,
        false
      );

      expect(result.action).toBe('down_sets');
      expect(result.downSets).toBeDefined();
      expect(result.downSets?.length).toBe(2);
    });

    it('should cap increase at 20% of original 4RM', () => {
      let currentWeight = 200;
      const maxAllowed = 240; // 20% of 200

      for (let i = 0; i < 10; i++) {
        const result = ProtocolWorkoutEngine.processP1Attempt(
          currentWeight,
          4,
          true,
          mockFourRepMax,
          false
        );

        if (result.action === 'retry') {
          expect(result.newAttemptWeight).toBeLessThanOrEqual(maxAllowed);
          currentWeight = result.newAttemptWeight!;
        }
      }
    });
  });

  describe('generateProtocolWorkout', () => {
    it('should order exercises P1 → P2 → P3', () => {
      const exercises = [
        { exerciseId: 'chest-fly', protocol: 'P3' as Protocol },
        { exerciseId: 'bench-press', protocol: 'P1' as Protocol },
        { exerciseId: 'incline-press', protocol: 'P2' as Protocol },
      ];

      const fourRepMaxes = exercises.map(e => ({
        ...mockFourRepMax,
        exerciseId: e.exerciseId,
      }));

      const workout = ProtocolWorkoutEngine.generateProtocolWorkout(
        exercises,
        fourRepMaxes
      );

      expect(workout.exercises[0].protocol).toBe('P1');
      expect(workout.exercises[1].protocol).toBe('P2');
      expect(workout.exercises[2].protocol).toBe('P3');
    });

    it('should calculate total protocol volume', () => {
      const exercises = [
        { exerciseId: 'bench-press', protocol: 'P1' as Protocol },
      ];

      const workout = ProtocolWorkoutEngine.generateProtocolWorkout(
        exercises,
        [mockFourRepMax]
      );

      expect(workout.estimatedVolume).toBeGreaterThan(0);
    });

    it('should validate all 4RMs exist', () => {
      const exercises = [
        { exerciseId: 'bench-press', protocol: 'P1' as Protocol },
        { exerciseId: 'missing-exercise', protocol: 'P2' as Protocol },
      ];

      const validation = ProtocolWorkoutEngine.validateProtocolWorkout(
        exercises,
        [mockFourRepMax]
      );

      expect(validation.valid).toBe(false);
      expect(validation.missingFourRepMaxes).toContain('missing-exercise');
    });
  });

  describe('Protocol percentages', () => {
    it('P1 should use 100% of 4RM', () => {
      const exercise = ProtocolWorkoutEngine.generateProtocolExercise(
        'bench-press',
        'Bench Press',
        'P1',
        mockFourRepMax,
        false
      );

      const workingSet = exercise.sets.find(s => s.instruction === 'max-attempt');
      expect(workingSet?.weight).toBe(200);
    });

    it('P2 should use 75-80% of 4RM', () => {
      const exercise = ProtocolWorkoutEngine.generateProtocolExercise(
        'bench-press',
        'Bench Press',
        'P2',
        mockFourRepMax,
        false
      );

      exercise.sets.forEach(set => {
        expect(set.weight).toBeGreaterThanOrEqual(150); // 75%
        expect(set.weight).toBeLessThanOrEqual(160); // 80%
      });
    });

    it('P3 should use 65-75% of 4RM', () => {
      const exercise = ProtocolWorkoutEngine.generateProtocolExercise(
        'bench-press',
        'Bench Press',
        'P3',
        mockFourRepMax,
        false
      );

      exercise.sets.forEach(set => {
        expect(set.weight).toBeGreaterThanOrEqual(130); // 65%
        expect(set.weight).toBeLessThanOrEqual(150); // 75%
      });
    });
  });
});
