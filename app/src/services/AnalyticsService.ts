/**
 * Analytics Service
 * 
 * Provides comprehensive workout analytics including:
 * - Volume tracking (total weight × reps)
 * - Intensity distribution analysis
 * - Time under tension calculations
 * - Body part balance tracking
 * 
 * Part of Phase 4.5: Analytics & Insights
 */

import { WorkoutSession, ExerciseLog, SetLog, MuscleGroup } from '../types';
import { EnhancedSetLog, INTENSITY_LEVELS } from '../types/enhanced';
import { getExerciseById } from '../constants/exercises';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface VolumeData {
  totalVolume: number;
  exerciseVolumes: {
    exerciseId: string;
    exerciseName: string;
    volume: number;
  }[];
  volumePerMuscleGroup: Record<MuscleGroup, number>;
}

export interface IntensityDistribution {
  intensityBuckets: {
    range: string;
    percentage: number;
    setCount: number;
    label: string;
  }[];
  averageIntensity: number;
  heavySetsCount: number; // ≥85%
  workingSetsCount: number; // 65-85%
  warmupSetsCount: number; // <65%
}

export interface TimeUnderTension {
  totalWorkoutTime: number; // seconds
  totalRestTime: number; // seconds
  totalWorkTime: number; // seconds (excludes rest)
  qualityMinutes: number; // working set time only
  estimatedTUT: number; // time under tension (reps × tempo)
  efficiency: number; // 0-100, higher = less rest per volume
}

export interface BodyPartBalance {
  muscleGroupVolumes: {
    muscleGroup: MuscleGroup;
    volume: number;
    setCount: number;
    percentage: number;
  }[];
  mostWorked: MuscleGroup;
  leastWorked: MuscleGroup;
  imbalances: {
    muscleGroup: MuscleGroup;
    severity: 'low' | 'moderate' | 'high';
    message: string;
  }[];
  recommendations: string[];
}

export interface WorkoutAnalytics {
  sessionId: string;
  volume: VolumeData;
  intensity: IntensityDistribution;
  timeUnderTension: TimeUnderTension;
  bodyPartBalance: BodyPartBalance;
  generatedAt: number;
}

export interface VolumeTrend {
  weekNumber: number;
  totalVolume: number;
  date: number;
  changeFromPrevious: number;
  changePercentage: number;
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class AnalyticsService {
  /**
   * Generate complete analytics for a workout session
   */
  static analyzeWorkout(session: WorkoutSession): WorkoutAnalytics {
    return {
      sessionId: session.id,
      volume: this.calculateVolume(session),
      intensity: this.analyzeIntensityDistribution(session),
      timeUnderTension: this.calculateTimeUnderTension(session),
      bodyPartBalance: this.analyzeBodyPartBalance(session),
      generatedAt: Date.now(),
    };
  }

  /**
   * Calculate total volume and breakdown by exercise/muscle group
   */
  static calculateVolume(session: WorkoutSession): VolumeData {
    let totalVolume = 0;
    const exerciseVolumes: VolumeData['exerciseVolumes'] = [];
    const volumePerMuscleGroup: Partial<Record<MuscleGroup, number>> = {};

    if (!session.exercises || !Array.isArray(session.exercises)) {
      return {
        totalVolume: 0,
        exerciseVolumes: [],
        volumePerMuscleGroup: {} as Record<MuscleGroup, number>,
      };
    }

    session.exercises.forEach(exerciseLog => {
      const exercise = getExerciseById(exerciseLog.exerciseId);
      if (!exercise) return;

      let exerciseVolume = 0;

      exerciseLog.sets.forEach(set => {
        const setVolume = set.weight * set.reps;
        exerciseVolume += setVolume;
        totalVolume += setVolume;

        exercise.muscleGroups.forEach(muscle => {
          volumePerMuscleGroup[muscle] = (volumePerMuscleGroup[muscle] || 0) + setVolume;
        });
      });

      exerciseVolumes.push({
        exerciseId: exerciseLog.exerciseId,
        exerciseName: exercise.name,
        volume: exerciseVolume,
      });
    });

    return {
      totalVolume,
      exerciseVolumes: exerciseVolumes.sort((a, b) => b.volume - a.volume),
      volumePerMuscleGroup: volumePerMuscleGroup as Record<MuscleGroup, number>,
    };
  }

  /**
   * Analyze intensity distribution across all sets
   */
  static analyzeIntensityDistribution(session: WorkoutSession): IntensityDistribution {
    const intensityCounts: Record<string, number> = {
      warmup: 0, // <65%
      working: 0, // 65-85%
      heavy: 0, // 85-95%
      max: 0, // ≥95%
    };

    let totalSets = 0;
    let totalIntensity = 0;

    if (!session.exercises || !Array.isArray(session.exercises)) {
      return {
        intensityBuckets: [
          { range: '<65%', percentage: 0, setCount: 0, label: 'Warmup' },
          { range: '65-85%', percentage: 0, setCount: 0, label: 'Working' },
          { range: '85-95%', percentage: 0, setCount: 0, label: 'Heavy' },
          { range: '≥95%', percentage: 0, setCount: 0, label: 'Max' },
        ],
        averageIntensity: 0,
        heavySetsCount: 0,
        workingSetsCount: 0,
        warmupSetsCount: 0,
      };
    }

    session.exercises.forEach(exerciseLog => {
      if (!exerciseLog.sets || !Array.isArray(exerciseLog.sets)) return;
      exerciseLog.sets.forEach(set => {
        const enhancedSet = set as EnhancedSetLog;
        const intensity = enhancedSet.intensityPercentage || this.estimateIntensity(set, exerciseLog);

        totalSets++;
        totalIntensity += intensity;

        if (intensity < 0.65) {
          intensityCounts.warmup++;
        } else if (intensity < 0.85) {
          intensityCounts.working++;
        } else if (intensity < 0.95) {
          intensityCounts.heavy++;
        } else {
          intensityCounts.max++;
        }
      });
    });

    const averageIntensity = totalSets > 0 ? totalIntensity / totalSets : 0;

    return {
      intensityBuckets: [
        {
          range: '<65%',
          percentage: totalSets > 0 ? (intensityCounts.warmup / totalSets) * 100 : 0,
          setCount: intensityCounts.warmup,
          label: 'Warmup',
        },
        {
          range: '65-85%',
          percentage: totalSets > 0 ? (intensityCounts.working / totalSets) * 100 : 0,
          setCount: intensityCounts.working,
          label: 'Working',
        },
        {
          range: '85-95%',
          percentage: totalSets > 0 ? (intensityCounts.heavy / totalSets) * 100 : 0,
          setCount: intensityCounts.heavy,
          label: 'Heavy',
        },
        {
          range: '≥95%',
          percentage: totalSets > 0 ? (intensityCounts.max / totalSets) * 100 : 0,
          setCount: intensityCounts.max,
          label: 'Max',
        },
      ],
      averageIntensity: Math.round(averageIntensity * 100),
      heavySetsCount: intensityCounts.heavy + intensityCounts.max,
      workingSetsCount: intensityCounts.working,
      warmupSetsCount: intensityCounts.warmup,
    };
  }

  /**
   * Estimate intensity if not provided
   */
  private static estimateIntensity(set: SetLog, exerciseLog: ExerciseLog): number {
    const weight = set.weight;
    const suggestedWeight = exerciseLog.suggestedWeight || weight;
    
    if (suggestedWeight > 0) {
      return weight / suggestedWeight;
    }
    
    return 0.75; // Default to working intensity
  }

  /**
   * Calculate time under tension and workout efficiency
   */
  static calculateTimeUnderTension(session: WorkoutSession): TimeUnderTension {
    if (!session.startedAt || !session.completedAt) {
      return {
        totalWorkoutTime: 0,
        totalRestTime: 0,
        totalWorkTime: 0,
        qualityMinutes: 0,
        estimatedTUT: 0,
        efficiency: 0,
      };
    }

    const totalWorkoutTime = Math.floor((session.completedAt - session.startedAt) / 1000);
    let totalRestTime = 0;
    let estimatedTUT = 0;
    let workingSetsTime = 0;

    session.exercises.forEach(exerciseLog => {
      exerciseLog.sets.forEach(set => {
        totalRestTime += set.restSeconds || 0;
        
        const repTempo = 3; // Average 3 seconds per rep (1s up, 2s down)
        const setTUT = set.reps * repTempo;
        estimatedTUT += setTUT;

        const enhancedSet = set as EnhancedSetLog;
        const intensity = enhancedSet.intensityPercentage || 0.75;
        
        if (intensity >= 0.65) {
          workingSetsTime += setTUT;
        }
      });
    });

    const totalWorkTime = totalWorkoutTime - totalRestTime;
    const qualityMinutes = Math.round(workingSetsTime / 60);

    const volume = this.calculateVolume(session).totalVolume;
    const efficiency = totalWorkoutTime > 0 ? Math.min(100, (volume / totalWorkoutTime) * 10) : 0;

    return {
      totalWorkoutTime,
      totalRestTime,
      totalWorkTime,
      qualityMinutes,
      estimatedTUT,
      efficiency: Math.round(efficiency),
    };
  }

  /**
   * Analyze body part balance and detect imbalances
   */
  static analyzeBodyPartBalance(session: WorkoutSession): BodyPartBalance {
    const muscleGroupData: Map<MuscleGroup, { volume: number; setCount: number }> = new Map();

    if (!session.exercises || !Array.isArray(session.exercises)) {
      return {
        muscleGroupVolumes: [],
        mostWorked: 'chest',
        leastWorked: 'chest',
        imbalances: [],
        recommendations: ['Complete workouts to see muscle balance analysis'],
      };
    }

    session.exercises.forEach(exerciseLog => {
      if (!exerciseLog.sets || !Array.isArray(exerciseLog.sets)) return;
      const exercise = getExerciseById(exerciseLog.exerciseId);
      if (!exercise) return;

      let exerciseVolume = 0;
      let exerciseSetCount = 0;

      exerciseLog.sets.forEach(set => {
        exerciseVolume += set.weight * set.reps;
        exerciseSetCount++;
      });

      exercise.muscleGroups.forEach(muscle => {
        const current = muscleGroupData.get(muscle) || { volume: 0, setCount: 0 };
        muscleGroupData.set(muscle, {
          volume: current.volume + exerciseVolume,
          setCount: current.setCount + exerciseSetCount,
        });
      });
    });

    const totalVolume = Array.from(muscleGroupData.values()).reduce(
      (sum, data) => sum + data.volume,
      0
    );

    const muscleGroupVolumes = Array.from(muscleGroupData.entries())
      .map(([muscleGroup, data]) => ({
        muscleGroup,
        volume: data.volume,
        setCount: data.setCount,
        percentage: totalVolume > 0 ? (data.volume / totalVolume) * 100 : 0,
      }))
      .sort((a, b) => b.volume - a.volume);

    const mostWorked = muscleGroupVolumes[0]?.muscleGroup || 'chest';
    const leastWorked = muscleGroupVolumes[muscleGroupVolumes.length - 1]?.muscleGroup || 'chest';

    const imbalances = this.detectImbalances(muscleGroupVolumes);
    const recommendations = this.generateRecommendations(muscleGroupVolumes, imbalances);

    return {
      muscleGroupVolumes,
      mostWorked,
      leastWorked,
      imbalances,
      recommendations,
    };
  }

  /**
   * Detect muscle group imbalances
   */
  private static detectImbalances(
    muscleGroupVolumes: BodyPartBalance['muscleGroupVolumes']
  ): BodyPartBalance['imbalances'] {
    const imbalances: BodyPartBalance['imbalances'] = [];

    if (muscleGroupVolumes.length < 2) return imbalances;

    const avgVolume =
      muscleGroupVolumes.reduce((sum, mg) => sum + mg.volume, 0) / muscleGroupVolumes.length;

    muscleGroupVolumes.forEach(mg => {
      const deviation = ((mg.volume - avgVolume) / avgVolume) * 100;

      if (deviation < -40) {
        imbalances.push({
          muscleGroup: mg.muscleGroup,
          severity: 'high',
          message: `${mg.muscleGroup} significantly underworked (${Math.abs(Math.round(deviation))}% below average)`,
        });
      } else if (deviation < -25) {
        imbalances.push({
          muscleGroup: mg.muscleGroup,
          severity: 'moderate',
          message: `${mg.muscleGroup} somewhat underworked (${Math.abs(Math.round(deviation))}% below average)`,
        });
      }
    });

    return imbalances;
  }

  /**
   * Generate recommendations based on balance analysis
   */
  private static generateRecommendations(
    muscleGroupVolumes: BodyPartBalance['muscleGroupVolumes'],
    imbalances: BodyPartBalance['imbalances']
  ): string[] {
    const recommendations: string[] = [];

    if (imbalances.length === 0) {
      recommendations.push('Great balance across all muscle groups!');
      return recommendations;
    }

    const highSeverityImbalances = imbalances.filter(i => i.severity === 'high');
    if (highSeverityImbalances.length > 0) {
      const muscles = highSeverityImbalances.map(i => i.muscleGroup).join(', ');
      recommendations.push(`Consider adding more volume for: ${muscles}`);
    }

    const underworkedGroups = imbalances.filter(i => i.severity === 'moderate' || i.severity === 'high');
    if (underworkedGroups.length > 0) {
      recommendations.push('Balance improves injury prevention and overall development');
    }

    const pushPullRatio = this.calculatePushPullRatio(muscleGroupVolumes);
    if (Math.abs(pushPullRatio - 1) > 0.3) {
      if (pushPullRatio > 1.3) {
        recommendations.push('Increase pulling exercises (back, biceps) relative to pushing');
      } else if (pushPullRatio < 0.7) {
        recommendations.push('Increase pushing exercises (chest, shoulders, triceps) relative to pulling');
      }
    }

    return recommendations;
  }

  /**
   * Calculate push to pull ratio
   */
  private static calculatePushPullRatio(
    muscleGroupVolumes: BodyPartBalance['muscleGroupVolumes']
  ): number {
    const pushMuscles: MuscleGroup[] = ['chest', 'shoulders', 'triceps'];
    const pullMuscles: MuscleGroup[] = ['back', 'biceps'];

    const pushVolume = muscleGroupVolumes
      .filter(mg => pushMuscles.includes(mg.muscleGroup))
      .reduce((sum, mg) => sum + mg.volume, 0);

    const pullVolume = muscleGroupVolumes
      .filter(mg => pullMuscles.includes(mg.muscleGroup))
      .reduce((sum, mg) => sum + mg.volume, 0);

    return pullVolume > 0 ? pushVolume / pullVolume : 1;
  }

  /**
   * Calculate volume trends over time
   */
  static calculateVolumeTrends(workouts: WorkoutSession[]): VolumeTrend[] {
    const sortedWorkouts = [...workouts].sort((a, b) => a.completedAt! - b.completedAt!);

    const trends: VolumeTrend[] = sortedWorkouts.map((workout, index) => {
      const volume = this.calculateVolume(workout).totalVolume;
      const previousVolume = index > 0 ? this.calculateVolume(sortedWorkouts[index - 1]).totalVolume : 0;

      const changeFromPrevious = index > 0 ? volume - previousVolume : 0;
      const changePercentage =
        previousVolume > 0 ? ((changeFromPrevious / previousVolume) * 100) : 0;

      return {
        weekNumber: workout.weekNumber,
        totalVolume: volume,
        date: workout.completedAt || workout.startedAt,
        changeFromPrevious,
        changePercentage: Math.round(changePercentage),
      };
    });

    return trends;
  }

  /**
   * Compare current workout to previous workout
   */
  static compareToLastWorkout(
    currentSession: WorkoutSession,
    previousSession: WorkoutSession
  ): {
    volumeChange: number;
    volumeChangePercent: number;
    intensityChange: number;
    tutChange: number;
    trend: 'improving' | 'declining' | 'stable';
    message: string;
  } {
    const currentVolume = this.calculateVolume(currentSession).totalVolume;
    const previousVolume = this.calculateVolume(previousSession).totalVolume;

    const volumeChange = currentVolume - previousVolume;
    const volumeChangePercent = previousVolume > 0 ? (volumeChange / previousVolume) * 100 : 0;

    const currentIntensity = this.analyzeIntensityDistribution(currentSession).averageIntensity;
    const previousIntensity = this.analyzeIntensityDistribution(previousSession).averageIntensity;
    const intensityChange = currentIntensity - previousIntensity;

    const currentTUT = this.calculateTimeUnderTension(currentSession).estimatedTUT;
    const previousTUT = this.calculateTimeUnderTension(previousSession).estimatedTUT;
    const tutChange = currentTUT - previousTUT;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    let message = '';

    if (volumeChangePercent > 5 && intensityChange >= 0) {
      trend = 'improving';
      message = `Great progress! Volume up ${Math.round(volumeChangePercent)}% while maintaining intensity.`;
    } else if (volumeChangePercent < -10 || intensityChange < -5) {
      trend = 'declining';
      message = `Volume or intensity decreased. Consider reviewing your recovery and nutrition.`;
    } else {
      trend = 'stable';
      message = `Consistent performance. Keep up the good work!`;
    }

    return {
      volumeChange,
      volumeChangePercent: Math.round(volumeChangePercent),
      intensityChange,
      tutChange,
      trend,
      message,
    };
  }
}

export default AnalyticsService;
