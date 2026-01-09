/**
 * Analytics Service Tests
 * 
 * Tests for Phase 4.5: Analytics & Insights
 */

import AnalyticsService from '../../src/services/AnalyticsService';
import { WorkoutSession, ExerciseLog, SetLog } from '../../src/types';

describe('AnalyticsService', () => {
  const mockSession: WorkoutSession = {
    id: 'session-1',
    userId: 'user-1',
    weekNumber: 1,
    dayNumber: 1,
    startedAt: Date.now() - 3600000, // 1 hour ago
    completedAt: Date.now(),
    status: 'completed',
    exercises: [
      {
        id: 'exercise-log-1',
        sessionId: 'session-1',
        exerciseId: 'bench-press',
        suggestedWeight: 200,
        order: 1,
        sets: [
          {
            id: 'set-1',
            exerciseLogId: 'exercise-log-1',
            setNumber: 1,
            weight: 70,
            reps: 6,
            targetReps: { min: 6, max: 8 },
            restSeconds: 30,
            completedAt: Date.now() - 3300000,
          },
          {
            id: 'set-2',
            exerciseLogId: 'exercise-log-1',
            setNumber: 2,
            weight: 160,
            reps: 1,
            targetReps: { min: 1, max: 1 },
            restSeconds: 120,
            completedAt: Date.now() - 3000000,
          },
          {
            id: 'set-3',
            exerciseLogId: 'exercise-log-1',
            setNumber: 3,
            weight: 180,
            reps: 1,
            targetReps: { min: 1, max: 1 },
            restSeconds: 180,
            completedAt: Date.now() - 2700000,
          },
          {
            id: 'set-4',
            exerciseLogId: 'exercise-log-1',
            setNumber: 4,
            weight: 200,
            reps: 1,
            targetReps: { min: 1, max: 1 },
            restSeconds: 300,
            completedAt: Date.now() - 2400000,
          },
        ],
      },
      {
        id: 'exercise-log-2',
        sessionId: 'session-1',
        exerciseId: 'lat-pulldown',
        suggestedWeight: 150,
        order: 2,
        sets: [
          {
            id: 'set-5',
            exerciseLogId: 'exercise-log-2',
            setNumber: 1,
            weight: 100,
            reps: 8,
            targetReps: { min: 6, max: 10 },
            restSeconds: 90,
            completedAt: Date.now() - 2100000,
          },
          {
            id: 'set-6',
            exerciseLogId: 'exercise-log-2',
            setNumber: 2,
            weight: 120,
            reps: 6,
            targetReps: { min: 6, max: 10 },
            restSeconds: 90,
            completedAt: Date.now() - 1800000,
          },
        ],
      },
    ],
  };

  describe('calculateVolume', () => {
    it('should calculate total volume correctly', () => {
      const volumeData = AnalyticsService.calculateVolume(mockSession);
      
      // Bench press: 70*6 + 160*1 + 180*1 + 200*1 = 420 + 160 + 180 + 200 = 960
      // Lat pulldown: 100*8 + 120*6 = 800 + 720 = 1520
      // Total: 960 + 1520 = 2480
      expect(volumeData.totalVolume).toBe(2480);
    });

    it('should calculate volume per exercise', () => {
      const volumeData = AnalyticsService.calculateVolume(mockSession);
      
      expect(volumeData.exerciseVolumes).toHaveLength(2);
      expect(volumeData.exerciseVolumes[0].exerciseId).toBe('lat-pulldown');
      expect(volumeData.exerciseVolumes[0].volume).toBe(1520);
      expect(volumeData.exerciseVolumes[1].exerciseId).toBe('bench-press');
      expect(volumeData.exerciseVolumes[1].volume).toBe(960);
    });

    it('should calculate volume per muscle group', () => {
      const volumeData = AnalyticsService.calculateVolume(mockSession);
      
      expect(volumeData.volumePerMuscleGroup.chest).toBeDefined();
      expect(volumeData.volumePerMuscleGroup.back).toBeDefined();
    });

    it('should handle empty session', () => {
      const emptySession: WorkoutSession = {
        ...mockSession,
        exercises: [],
      };
      
      const volumeData = AnalyticsService.calculateVolume(emptySession);
      expect(volumeData.totalVolume).toBe(0);
      expect(volumeData.exerciseVolumes).toHaveLength(0);
    });
  });

  describe('analyzeIntensityDistribution', () => {
    it('should categorize sets by intensity', () => {
      const intensityData = AnalyticsService.analyzeIntensityDistribution(mockSession);
      
      expect(intensityData.warmupSetsCount).toBeGreaterThan(0);
      expect(intensityData.workingSetsCount).toBeGreaterThan(0);
      expect(intensityData.intensityBuckets).toHaveLength(4);
    });

    it('should calculate average intensity', () => {
      const intensityData = AnalyticsService.analyzeIntensityDistribution(mockSession);
      
      expect(intensityData.averageIntensity).toBeGreaterThan(0);
      expect(intensityData.averageIntensity).toBeLessThanOrEqual(100);
    });

    it('should have correct bucket percentages summing to 100', () => {
      const intensityData = AnalyticsService.analyzeIntensityDistribution(mockSession);
      
      const totalPercentage = intensityData.intensityBuckets.reduce(
        (sum, bucket) => sum + bucket.percentage,
        0
      );
      
      expect(totalPercentage).toBeCloseTo(100, 0);
    });
  });

  describe('calculateTimeUnderTension', () => {
    it('should calculate workout duration correctly', () => {
      const tutData = AnalyticsService.calculateTimeUnderTension(mockSession);
      
      expect(tutData.totalWorkoutTime).toBe(3600);
      expect(tutData.totalWorkoutTime).toBeGreaterThan(0);
    });

    it('should calculate rest time', () => {
      const tutData = AnalyticsService.calculateTimeUnderTension(mockSession);
      
      // Total rest: 30 + 120 + 180 + 300 + 90 + 90 = 810 seconds
      expect(tutData.totalRestTime).toBe(810);
    });

    it('should calculate estimated time under tension', () => {
      const tutData = AnalyticsService.calculateTimeUnderTension(mockSession);
      
      // Total reps: 6 + 1 + 1 + 1 + 8 + 6 = 23 reps
      // TUT: 23 * 3 = 69 seconds
      expect(tutData.estimatedTUT).toBe(69);
    });

    it('should calculate efficiency score', () => {
      const tutData = AnalyticsService.calculateTimeUnderTension(mockSession);
      
      expect(tutData.efficiency).toBeGreaterThan(0);
      expect(tutData.efficiency).toBeLessThanOrEqual(100);
    });

    it('should handle incomplete session', () => {
      const incompleteSession: WorkoutSession = {
        ...mockSession,
        completedAt: undefined,
      };
      
      const tutData = AnalyticsService.calculateTimeUnderTension(incompleteSession);
      
      expect(tutData.totalWorkoutTime).toBe(0);
      expect(tutData.efficiency).toBe(0);
    });
  });

  describe('analyzeBodyPartBalance', () => {
    it('should identify muscle groups worked', () => {
      const balanceData = AnalyticsService.analyzeBodyPartBalance(mockSession);
      
      expect(balanceData.muscleGroupVolumes.length).toBeGreaterThan(0);
      expect(balanceData.mostWorked).toBeDefined();
      expect(balanceData.leastWorked).toBeDefined();
    });

    it('should detect imbalances', () => {
      const balanceData = AnalyticsService.analyzeBodyPartBalance(mockSession);
      
      expect(Array.isArray(balanceData.imbalances)).toBe(true);
      expect(Array.isArray(balanceData.recommendations)).toBe(true);
    });

    it('should provide recommendations', () => {
      const balanceData = AnalyticsService.analyzeBodyPartBalance(mockSession);
      
      expect(balanceData.recommendations.length).toBeGreaterThan(0);
      expect(typeof balanceData.recommendations[0]).toBe('string');
    });

    it('should calculate percentages correctly', () => {
      const balanceData = AnalyticsService.analyzeBodyPartBalance(mockSession);
      
      const totalPercentage = balanceData.muscleGroupVolumes.reduce(
        (sum, mg) => sum + mg.percentage,
        0
      );
      
      expect(totalPercentage).toBeGreaterThan(0);
    });
  });

  describe('analyzeWorkout', () => {
    it('should generate complete analytics', () => {
      const analytics = AnalyticsService.analyzeWorkout(mockSession);
      
      expect(analytics.sessionId).toBe(mockSession.id);
      expect(analytics.volume).toBeDefined();
      expect(analytics.intensity).toBeDefined();
      expect(analytics.timeUnderTension).toBeDefined();
      expect(analytics.bodyPartBalance).toBeDefined();
      expect(analytics.generatedAt).toBeGreaterThan(0);
    });

    it('should have consistent volume data', () => {
      const analytics = AnalyticsService.analyzeWorkout(mockSession);
      
      expect(analytics.volume.totalVolume).toBe(2480);
      expect(analytics.volume.exerciseVolumes.length).toBe(2);
    });
  });

  describe('calculateVolumeTrends', () => {
    it('should calculate trends from multiple workouts', () => {
      const workouts = [mockSession, { ...mockSession, id: 'session-2', weekNumber: 2 }];
      const trends = AnalyticsService.calculateVolumeTrends(workouts);
      
      expect(trends).toHaveLength(2);
      expect(trends[0].weekNumber).toBeDefined();
      expect(trends[0].totalVolume).toBeDefined();
    });

    it('should calculate change from previous', () => {
      const session2 = {
        ...mockSession,
        id: 'session-2',
        weekNumber: 2,
        exercises: mockSession.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(s => ({ ...s, weight: s.weight * 1.1 })),
        })),
      };
      
      const trends = AnalyticsService.calculateVolumeTrends([mockSession, session2]);
      
      expect(trends[1].changeFromPrevious).toBeGreaterThan(0);
      expect(trends[1].changePercentage).toBeGreaterThan(0);
    });

    it('should handle empty workout list', () => {
      const trends = AnalyticsService.calculateVolumeTrends([]);
      expect(trends).toHaveLength(0);
    });
  });

  describe('compareToLastWorkout', () => {
    it('should compare two workouts', () => {
      const session2 = {
        ...mockSession,
        id: 'session-2',
        weekNumber: 2,
      };
      
      const comparison = AnalyticsService.compareToLastWorkout(session2, mockSession);
      
      expect(comparison.volumeChange).toBeDefined();
      expect(comparison.volumeChangePercent).toBeDefined();
      expect(comparison.trend).toMatch(/improving|declining|stable/);
      expect(comparison.message).toBeDefined();
    });

    it('should detect improvement', () => {
      const session2 = {
        ...mockSession,
        id: 'session-2',
        exercises: mockSession.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(s => ({ ...s, weight: s.weight * 1.2 })),
        })),
      };
      
      const comparison = AnalyticsService.compareToLastWorkout(session2, mockSession);
      
      expect(comparison.volumeChange).toBeGreaterThan(0);
      expect(comparison.trend).toBe('improving');
    });

    it('should detect decline', () => {
      const session2 = {
        ...mockSession,
        id: 'session-2',
        exercises: mockSession.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(s => ({ ...s, weight: s.weight * 0.7 })),
        })),
      };
      
      const comparison = AnalyticsService.compareToLastWorkout(session2, mockSession);
      
      expect(comparison.volumeChange).toBeLessThan(0);
      expect(comparison.trend).toBe('declining');
    });
  });
});
