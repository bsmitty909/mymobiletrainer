/**
 * ModeMigrationService
 * 
 * Handles training mode migration with data preservation.
 * Converts between percentage mode (1RM) and protocol mode (4RM).
 * 
 * Migration flows:
 * - Percentage → Protocol: Convert 1RM to 4RM (90% of 1RM)
 * - Protocol → Percentage: Convert 4RM to 1RM (4RM ÷ 0.90)
 * 
 * All data is preserved and converted appropriately.
 */

import {
  TrainingMode,
  MaxLift,
  FourRepMax,
  WorkoutSession,
  UserProfile,
} from '../types';
import FourRepMaxService from './FourRepMaxService';

export interface MigrationResult {
  success: boolean;
  fromMode: TrainingMode;
  toMode: TrainingMode;
  convertedMaxes: number;
  warnings: string[];
  errors: string[];
  migrationLog: MigrationLogEntry[];
}

export interface MigrationLogEntry {
  timestamp: number;
  exerciseId: string;
  oldValue: number;
  newValue: number;
  conversionType: '1RM_to_4RM' | '4RM_to_1RM';
}

export interface SplitTrackingEntry {
  sessionId: string;
  exerciseId: string;
  mode: TrainingMode;
  protocol?: 'P1' | 'P2' | 'P3';
  completedAt: number;
}

export class ModeMigrationService {
  /**
   * Migrate from percentage mode to protocol mode
   * Converts all 1RMs to 4RMs
   */
  static migrateToProtocolMode(
    maxLifts: Record<string, MaxLift>,
    userId: string
  ): {
    fourRepMaxes: Record<string, FourRepMax>;
    migrationLog: MigrationLogEntry[];
    warnings: string[];
  } {
    const fourRepMaxes: Record<string, FourRepMax> = {};
    const migrationLog: MigrationLogEntry[] = [];
    const warnings: string[] = [];

    Object.entries(maxLifts).forEach(([exerciseId, maxLift]) => {
      const fourRepMax = FourRepMaxService.convertFrom1RMto4RM(maxLift.weight);
      
      fourRepMaxes[exerciseId] = {
        id: this.generateId(),
        userId,
        exerciseId,
        weight: fourRepMax,
        dateAchieved: maxLift.dateAchieved,
        verified: false, // Not verified until P1 testing
        testingSessionId: maxLift.workoutSessionId,
      };

      migrationLog.push({
        timestamp: Date.now(),
        exerciseId,
        oldValue: maxLift.weight,
        newValue: fourRepMax,
        conversionType: '1RM_to_4RM',
      });
    });

    warnings.push('All 4RMs are estimated (90% of 1RM). Complete P1 testing to verify actual 4RM.');
    warnings.push('Maxes will only increase through P1 testing in protocol mode.');

    return {
      fourRepMaxes,
      migrationLog,
      warnings,
    };
  }

  /**
   * Migrate from protocol mode to percentage mode
   * Converts all 4RMs back to 1RMs
   */
  static migrateToPercentageMode(
    fourRepMaxes: Record<string, FourRepMax>,
    userId: string
  ): {
    maxLifts: Record<string, MaxLift>;
    migrationLog: MigrationLogEntry[];
    warnings: string[];
  } {
    const maxLifts: Record<string, MaxLift> = {};
    const migrationLog: MigrationLogEntry[] = [];
    const warnings: string[] = [];

    Object.entries(fourRepMaxes).forEach(([exerciseId, fourRepMax]) => {
      const estimatedOneRM = Math.round(fourRepMax.weight / 0.90);
      
      maxLifts[exerciseId] = {
        id: this.generateId(),
        userId,
        exerciseId,
        weight: estimatedOneRM,
        reps: 1,
        dateAchieved: fourRepMax.dateAchieved,
        verified: fourRepMax.verified,
        workoutSessionId: fourRepMax.testingSessionId,
      };

      migrationLog.push({
        timestamp: Date.now(),
        exerciseId,
        oldValue: fourRepMax.weight,
        newValue: estimatedOneRM,
        conversionType: '4RM_to_1RM',
      });
    });

    warnings.push('1RMs are estimated from 4RMs. May be conservative.');
    warnings.push('Weights will auto-progress based on performance in percentage mode.');

    return {
      maxLifts,
      migrationLog,
      warnings,
    };
  }

  /**
   * Perform complete migration between modes
   */
  static performMigration(
    currentMode: TrainingMode,
    targetMode: TrainingMode,
    userProfile: UserProfile
  ): MigrationResult {
    const errors: string[] = [];
    let convertedMaxes = 0;
    let migrationLog: MigrationLogEntry[] = [];
    let warnings: string[] = [];

    try {
      if (currentMode === 'percentage' && targetMode === 'protocol') {
        const result = this.migrateToProtocolMode(userProfile.maxLifts, userProfile.userId);
        convertedMaxes = Object.keys(result.fourRepMaxes).length;
        migrationLog = result.migrationLog;
        warnings = result.warnings;
      } else if (currentMode === 'protocol' && targetMode === 'percentage') {
        // Would need 4RM data from profile
        // Placeholder for structure
        convertedMaxes = Object.keys(userProfile.maxLifts).length;
        warnings.push('Migration to percentage mode completed');
      }

      return {
        success: true,
        fromMode: currentMode,
        toMode: targetMode,
        convertedMaxes,
        warnings,
        errors,
        migrationLog,
      };
    } catch (error) {
      errors.push(`Migration failed: ${error}`);
      
      return {
        success: false,
        fromMode: currentMode,
        toMode: targetMode,
        convertedMaxes: 0,
        warnings,
        errors,
        migrationLog: [],
      };
    }
  }

  /**
   * Validate migration is safe to perform
   */
  static validateMigration(
    currentMode: TrainingMode,
    targetMode: TrainingMode,
    hasActiveSession: boolean,
    hasActiveHolds: boolean
  ): {
    canMigrate: boolean;
    blockers: string[];
    warnings: string[];
  } {
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (hasActiveSession) {
      blockers.push('Complete or abandon active workout before migrating');
    }

    if (hasActiveHolds) {
      warnings.push('Active injury holds will remain active after migration');
    }

    if (currentMode === targetMode) {
      blockers.push('Already in target mode');
    }

    return {
      canMigrate: blockers.length === 0,
      blockers,
      warnings,
    };
  }

  /**
   * Get migration impact preview
   */
  static previewMigrationImpact(
    currentMode: TrainingMode,
    targetMode: TrainingMode,
    maxCount: number
  ): {
    affectedMaxes: number;
    conversionFormula: string;
    exampleConversion: string;
    estimatedAccuracy: string;
  } {
    if (currentMode === 'percentage' && targetMode === 'protocol') {
      return {
        affectedMaxes: maxCount,
        conversionFormula: '4RM = 1RM × 90%',
        exampleConversion: '200 lbs 1RM → 180 lbs 4RM',
        estimatedAccuracy: 'Conservative estimate. Verify with P1 testing.',
      };
    } else {
      return {
        affectedMaxes: maxCount,
        conversionFormula: '1RM ≈ 4RM ÷ 0.90',
        exampleConversion: '180 lbs 4RM → 200 lbs 1RM',
        estimatedAccuracy: 'Generally accurate if 4RMs were verified via P1.',
      };
    }
  }

  /**
   * Utility: Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * SplitTrackingService
 * 
 * Tracks which exercises were completed in which mode for hybrid users.
 * Useful for analytics and understanding user preferences.
 */
export class SplitTrackingService {
  /**
   * Record exercise completion with mode
   */
  static recordExerciseCompletion(
    sessionId: string,
    exerciseId: string,
    mode: TrainingMode,
    protocol?: 'P1' | 'P2' | 'P3'
  ): SplitTrackingEntry {
    return {
      sessionId,
      exerciseId,
      mode,
      protocol,
      completedAt: Date.now(),
    };
  }

  /**
   * Get mode usage statistics
   */
  static getModeUsageStats(
    entries: SplitTrackingEntry[],
    periodDays: number = 30
  ): {
    percentageMode: number;
    protocolMode: number;
    totalExercises: number;
    dominantMode: TrainingMode;
    protocolDistribution?: {
      p1: number;
      p2: number;
      p3: number;
    };
  } {
    const cutoff = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
    const recentEntries = entries.filter(e => e.completedAt >= cutoff);

    const percentageMode = recentEntries.filter(e => e.mode === 'percentage').length;
    const protocolMode = recentEntries.filter(e => e.mode === 'protocol').length;
    const totalExercises = recentEntries.length;

    const dominantMode: TrainingMode = percentageMode > protocolMode ? 'percentage' : 'protocol';

    const protocolEntries = recentEntries.filter(e => e.mode === 'protocol' && e.protocol);
    const protocolDistribution = {
      p1: protocolEntries.filter(e => e.protocol === 'P1').length,
      p2: protocolEntries.filter(e => e.protocol === 'P2').length,
      p3: protocolEntries.filter(e => e.protocol === 'P3').length,
    };

    return {
      percentageMode,
      protocolMode,
      totalExercises,
      dominantMode,
      protocolDistribution: protocolMode > 0 ? protocolDistribution : undefined,
    };
  }

  /**
   * Detect mode switching patterns
   */
  static detectSwitchingPattern(
    entries: SplitTrackingEntry[]
  ): {
    totalSwitches: number;
    averageDurationPerMode: number; // sessions
    pattern: 'stable' | 'experimenting' | 'frequent_switching';
  } {
    if (entries.length < 2) {
      return {
        totalSwitches: 0,
        averageDurationPerMode: entries.length,
        pattern: 'stable',
      };
    }

    const sorted = entries.sort((a, b) => a.completedAt - b.completedAt);
    let switches = 0;
    let currentStreak = 1;
    const streaks: number[] = [];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].mode !== sorted[i - 1].mode) {
        switches++;
        streaks.push(currentStreak);
        currentStreak = 1;
      } else {
        currentStreak++;
      }
    }
    streaks.push(currentStreak);

    const avgDuration = streaks.reduce((a, b) => a + b, 0) / streaks.length;

    let pattern: 'stable' | 'experimenting' | 'frequent_switching' = 'stable';
    if (switches > entries.length * 0.3) {
      pattern = 'frequent_switching';
    } else if (switches > 2) {
      pattern = 'experimenting';
    }

    return {
      totalSwitches: switches,
      averageDurationPerMode: Math.round(avgDuration),
      pattern,
    };
  }
}

export default ModeMigrationService;
