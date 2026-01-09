/**
 * QuickStartService Tests
 * 
 * Tests for workout resume, quick start, and pre-filled warmup features.
 */

import QuickStartService, { ResumeWorkoutInfo } from '../../src/services/QuickStartService';
import StorageService from '../../src/services/StorageService';
import { WorkoutSession } from '../../src/types';

jest.mock('../../src/services/StorageService');

describe('QuickStartService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canResumeWorkout', () => {
    it('should detect resumable workout within timeout', async () => {
      const mockSession: WorkoutSession = {
        id: 'session-123',
        userId: 'user-1',
        weekNumber: 2,
        dayNumber: 1,
        startedAt: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
        status: 'paused',
        exercises: [
          {
            id: 'ex-1',
            sessionId: 'session-123',
            exerciseId: 'bench-press',
            suggestedWeight: 225,
            order: 1,
            sets: [
              {
                id: 'set-1',
                exerciseLogId: 'ex-1',
                setNumber: 1,
                weight: 80,
                reps: 6,
                targetReps: { min: 5, max: 8 },
                restSeconds: 30,
                completedAt: Date.now() - (2 * 60 * 60 * 1000),
              },
            ],
          },
          {
            id: 'ex-2',
            sessionId: 'session-123',
            exerciseId: 'lat-pulldown',
            suggestedWeight: 250,
            order: 2,
            sets: [],
          },
        ],
      };

      (StorageService.getItem as jest.Mock).mockResolvedValue(mockSession);

      const result = await QuickStartService.canResumeWorkout('user-1');

      expect(result.canResume).toBe(true);
      expect(result.session).toEqual(mockSession);
      expect(result.progress.exercisesCompleted).toBe(0);
      expect(result.progress.totalExercises).toBe(2);
      expect(result.progress.setsCompleted).toBe(1);
    });

    it('should not resume workout after timeout (>4 hours)', async () => {
      const mockSession: WorkoutSession = {
        id: 'session-123',
        userId: 'user-1',
        weekNumber: 2,
        dayNumber: 1,
        startedAt: Date.now() - (5 * 60 * 60 * 1000), // 5 hours ago
        status: 'paused',
        exercises: [],
      };

      (StorageService.getItem as jest.Mock).mockResolvedValue(mockSession);

      const result = await QuickStartService.canResumeWorkout('user-1');

      expect(result.canResume).toBe(false);
      expect(result.session).toBeNull();
      expect(StorageService.removeItem).toHaveBeenCalled();
    });

    it('should not resume workout for different user', async () => {
      const mockSession: WorkoutSession = {
        id: 'session-123',
        userId: 'user-2',
        weekNumber: 2,
        dayNumber: 1,
        startedAt: Date.now() - (1 * 60 * 60 * 1000),
        status: 'paused',
        exercises: [],
      };

      (StorageService.getItem as jest.Mock).mockResolvedValue(mockSession);

      const result = await QuickStartService.canResumeWorkout('user-1');

      expect(result.canResume).toBe(false);
      expect(result.session).toBeNull();
    });

    it('should handle no paused workout', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue(null);

      const result = await QuickStartService.canResumeWorkout('user-1');

      expect(result.canResume).toBe(false);
      expect(result.session).toBeNull();
      expect(result.progress.exercisesCompleted).toBe(0);
    });
  });

  describe('saveForResume', () => {
    it('should save workout session for resume', async () => {
      const mockSession: WorkoutSession = {
        id: 'session-123',
        userId: 'user-1',
        weekNumber: 2,
        dayNumber: 1,
        startedAt: Date.now(),
        status: 'paused',
        exercises: [],
      };

      await QuickStartService.saveForResume(mockSession);

      expect(StorageService.saveItem).toHaveBeenCalledWith(
        '@mmt_paused_workout',
        mockSession
      );
    });

    it('should handle save errors gracefully', async () => {
      const mockSession: WorkoutSession = {
        id: 'session-123',
        userId: 'user-1',
        weekNumber: 2,
        dayNumber: 1,
        startedAt: Date.now(),
        status: 'paused',
        exercises: [],
      };

      (StorageService.saveItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(
        QuickStartService.saveForResume(mockSession)
      ).rejects.toThrow('Storage error');
    });
  });

  describe('clearPausedWorkout', () => {
    it('should clear paused workout data', async () => {
      await QuickStartService.clearPausedWorkout();

      expect(StorageService.removeItem).toHaveBeenCalledWith(
        '@mmt_paused_workout'
      );
    });
  });

  describe('createQuickStartSession', () => {
    it('should create session with pre-filled warmups', () => {
      const options = {
        userId: 'user-1',
        weekNumber: 1,
        dayNumber: 1,
        userMaxes: {
          'bench-press': {
            id: 'max-1',
            userId: 'user-1',
            exerciseId: 'bench-press',
            weight: 225,
            reps: 1,
            dateAchieved: Date.now(),
            verified: true,
          },
        },
        prefillWarmups: true,
      };

      const session = QuickStartService.createQuickStartSession(options);

      expect(session.userId).toBe('user-1');
      expect(session.weekNumber).toBe(1);
      expect(session.dayNumber).toBe(1);
      expect(session.status).toBe('not_started');
      expect(session.exercises.length).toBeGreaterThan(0);
      
      // Check first exercise has pre-filled warmup sets (2 warmups at 35% and 50%)
      const firstExercise = session.exercises[0];
      expect(firstExercise.sets.length).toBe(2);
      expect(firstExercise.sets[0].reps).toBe(6);
      expect(firstExercise.sets[0].restSeconds).toBe(30);
    });

    it('should create session without pre-filled warmups', () => {
      const options = {
        userId: 'user-1',
        weekNumber: 1,
        dayNumber: 1,
        userMaxes: {
          'bench-press': {
            id: 'max-1',
            userId: 'user-1',
            exerciseId: 'bench-press',
            weight: 225,
            reps: 1,
            dateAchieved: Date.now(),
            verified: true,
          },
        },
        prefillWarmups: false,
      };

      const session = QuickStartService.createQuickStartSession(options);

      expect(session.exercises.length).toBeGreaterThan(0);
      
      // Should have no pre-filled sets
      session.exercises.forEach(exercise => {
        expect(exercise.sets.length).toBe(0);
      });
    });

    it('should use default 4RM when user max not available', () => {
      const options = {
        userId: 'user-1',
        weekNumber: 1,
        dayNumber: 1,
        userMaxes: {},
        prefillWarmups: true,
      };

      const session = QuickStartService.createQuickStartSession(options);

      expect(session.exercises.length).toBeGreaterThan(0);
      expect(session.exercises[0].suggestedWeight).toBe(135); // Default 4RM
    });

    it('should load correct exercises for day 2', () => {
      const options = {
        userId: 'user-1',
        weekNumber: 1,
        dayNumber: 2,
        userMaxes: {},
        prefillWarmups: false,
      };

      const session = QuickStartService.createQuickStartSession(options);

      // Day 2 should be legs
      expect(session.exercises[0].exerciseId).toContain('squat');
    });
  });

  describe('getSuggestedNextWorkout', () => {
    it('should suggest week 1 day 1 for new user', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue(null);

      const result = await QuickStartService.getSuggestedNextWorkout('user-1');

      expect(result).not.toBeNull();
      expect(result?.weekNumber).toBe(1);
      expect(result?.dayNumber).toBe(1);
      expect(result?.reasoning).toContain('Start with Week 1');
    });

    it('should suggest next day in same week', async () => {
      const lastSession = {
        weekNumber: 2,
        dayNumber: 1,
        completedAt: Date.now() - (1000 * 60 * 60 * 24), // 1 day ago
        duration: 1800000,
      };

      (StorageService.getItem as jest.Mock).mockResolvedValue(lastSession);

      const result = await QuickStartService.getSuggestedNextWorkout('user-1');

      expect(result).not.toBeNull();
      expect(result?.weekNumber).toBe(2);
      expect(result?.dayNumber).toBe(2);
      expect(result?.reasoning).toContain('momentum');
    });

    it('should suggest next week after day 3', async () => {
      const lastSession = {
        weekNumber: 2,
        dayNumber: 3,
        completedAt: Date.now() - (1000 * 60 * 60 * 24),
        duration: 1800000,
      };

      (StorageService.getItem as jest.Mock).mockResolvedValue(lastSession);

      const result = await QuickStartService.getSuggestedNextWorkout('user-1');

      expect(result).not.toBeNull();
      expect(result?.weekNumber).toBe(3);
      expect(result?.dayNumber).toBe(1);
    });

    it('should show encouraging message after long break', async () => {
      const lastSession = {
        weekNumber: 2,
        dayNumber: 1,
        completedAt: Date.now() - (1000 * 60 * 60 * 24 * 8), // 8 days ago
        duration: 1800000,
      };

      (StorageService.getItem as jest.Mock).mockResolvedValue(lastSession);

      const result = await QuickStartService.getSuggestedNextWorkout('user-1');

      expect(result).not.toBeNull();
      expect(result?.reasoning).toContain('been a while');
    });
  });

  describe('saveLastSession', () => {
    it('should save last completed session info', async () => {
      const session: WorkoutSession = {
        id: 'session-123',
        userId: 'user-1',
        weekNumber: 2,
        dayNumber: 1,
        startedAt: Date.now() - 3600000,
        completedAt: Date.now(),
        status: 'completed',
        exercises: [],
      };

      await QuickStartService.saveLastSession(session);

      expect(StorageService.saveItem).toHaveBeenCalledWith(
        '@mmt_last_session',
        expect.objectContaining({
          id: 'session-123',
          weekNumber: 2,
          dayNumber: 1,
          duration: 3600000,
        })
      );
    });
  });
});
