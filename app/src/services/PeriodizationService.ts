/**
 * PeriodizationService - Advanced Training Periodization
 * 
 * Implements Phase 4.2 features from the Formula Integration Plan:
 * - Deload week detection and scheduling (every 4-6 weeks)
 * - Intensity waves (3-week cycles: 85%, 90%, 95%)
 * - Training max adjustment (conservative mode at 90% of true max)
 * - Auto-regulation based on training history
 * 
 * Periodization improves long-term strength gains by managing fatigue
 * and preventing overtraining through strategic intensity variation.
 */

import { WeeklyMax } from '../types/enhanced';

export type PeriodizationMode = 'aggressive' | 'moderate' | 'conservative';
export type WeekPhase = 'normal' | 'deload' | 'wave_light' | 'wave_medium' | 'wave_heavy';

export interface PeriodizationSettings {
  mode: PeriodizationMode;
  trainingMaxPercentage: number; // 0.90 for conservative, 1.0 for aggressive
  deloadFrequency: number; // weeks between deloads (4-6)
  enableIntensityWaves: boolean;
  autoDeloadDetection: boolean;
}

export interface DeloadRecommendation {
  shouldDeload: boolean;
  reason: string;
  weeksSinceLastDeload: number;
  fatigueIndicators: string[];
  recommendedIntensity: number; // 0.70 for deload
}

export interface IntensityWave {
  weekNumber: number;
  phase: 'light' | 'medium' | 'heavy';
  intensityMultiplier: number; // 0.85, 0.90, 0.95
  description: string;
}

export interface PeriodizationPlan {
  currentWeek: number;
  weekPhase: WeekPhase;
  intensityMultiplier: number;
  isDeloadWeek: boolean;
  currentWave?: IntensityWave;
  nextDeloadWeek: number;
  message: string;
}

export class PeriodizationService {
  /**
   * Default periodization settings for moderate training
   */
  static readonly DEFAULT_SETTINGS: PeriodizationSettings = {
    mode: 'moderate',
    trainingMaxPercentage: 0.95, // Use 95% of true max
    deloadFrequency: 5, // Deload every 5 weeks
    enableIntensityWaves: true,
    autoDeloadDetection: true,
  };

  /**
   * Get periodization settings based on training mode
   */
  static getSettingsForMode(mode: PeriodizationMode): PeriodizationSettings {
    switch (mode) {
      case 'aggressive':
        return {
          mode: 'aggressive',
          trainingMaxPercentage: 1.0, // Use true max
          deloadFrequency: 6, // Less frequent deloads
          enableIntensityWaves: true,
          autoDeloadDetection: false,
        };
      
      case 'conservative':
        return {
          mode: 'conservative',
          trainingMaxPercentage: 0.90, // Use 90% of true max
          deloadFrequency: 4, // More frequent deloads
          enableIntensityWaves: true,
          autoDeloadDetection: true,
        };
      
      case 'moderate':
      default:
        return this.DEFAULT_SETTINGS;
    }
  }

  /**
   * Calculate training max from true max
   * Conservative mode uses 90% to prevent overreaching
   */
  static calculateTrainingMax(
    trueMax: number,
    settings: PeriodizationSettings = this.DEFAULT_SETTINGS
  ): number {
    const trainingMax = trueMax * settings.trainingMaxPercentage;
    return Math.round(trainingMax / 5) * 5; // Round to nearest 5 lbs
  }

  /**
   * Determine if deload week is needed
   * Checks: 
   * - Scheduled deload (every N weeks)
   * - Fatigue indicators (consecutive failures, volume drop)
   * - Performance decline
   */
  static shouldDeload(
    currentWeek: number,
    lastDeloadWeek: number,
    recentMaxAttempts: Array<{ successful: boolean; weekNumber: number }>,
    settings: PeriodizationSettings = this.DEFAULT_SETTINGS
  ): DeloadRecommendation {
    const weeksSinceLastDeload = currentWeek - lastDeloadWeek;
    const fatigueIndicators: string[] = [];
    
    // Check scheduled deload
    if (weeksSinceLastDeload >= settings.deloadFrequency) {
      fatigueIndicators.push(`${weeksSinceLastDeload} weeks since last deload`);
      return {
        shouldDeload: true,
        reason: `Scheduled deload (every ${settings.deloadFrequency} weeks)`,
        weeksSinceLastDeload,
        fatigueIndicators,
        recommendedIntensity: 0.70,
      };
    }

    // Auto-detection of fatigue (if enabled)
    if (settings.autoDeloadDetection) {
      const recentWeeks = recentMaxAttempts.slice(-4); // Last 4 weeks
      const failureRate = recentWeeks.filter(a => !a.successful).length / recentWeeks.length;
      
      if (failureRate >= 0.5 && weeksSinceLastDeload >= 3) {
        fatigueIndicators.push(`${Math.round(failureRate * 100)}% failure rate in recent weeks`);
        return {
          shouldDeload: true,
          reason: 'High failure rate indicates accumulated fatigue',
          weeksSinceLastDeload,
          fatigueIndicators,
          recommendedIntensity: 0.70,
        };
      }

      // Check for consecutive failures
      const lastThree = recentMaxAttempts.slice(-3);
      const consecutiveFailures = lastThree.every(a => !a.successful);
      
      if (consecutiveFailures && weeksSinceLastDeload >= 3) {
        fatigueIndicators.push('3 consecutive failed max attempts');
        return {
          shouldDeload: true,
          reason: 'Consecutive failures suggest overreaching',
          weeksSinceLastDeload,
          fatigueIndicators,
          recommendedIntensity: 0.70,
        };
      }
    }

    return {
      shouldDeload: false,
      reason: 'Continue normal training',
      weeksSinceLastDeload,
      fatigueIndicators,
      recommendedIntensity: 1.0,
    };
  }

  /**
   * Calculate intensity wave position
   * 3-week wave pattern: 85% (light) → 90% (medium) → 95% (heavy)
   * Then reset to 85% for next wave
   */
  static getIntensityWave(
    weekNumber: number,
    lastDeloadWeek: number,
    enableWaves: boolean = true
  ): IntensityWave | null {
    if (!enableWaves) {
      return null;
    }

    // Waves start after deload week
    const weeksInCycle = weekNumber - lastDeloadWeek;
    if (weeksInCycle <= 0) {
      return null;
    }

    // 3-week wave cycle
    const position = ((weeksInCycle - 1) % 3) + 1;
    
    switch (position) {
      case 1:
        return {
          weekNumber,
          phase: 'light',
          intensityMultiplier: 0.85,
          description: 'Light Week - Build foundation at 85% intensity',
        };
      
      case 2:
        return {
          weekNumber,
          phase: 'medium',
          intensityMultiplier: 0.90,
          description: 'Medium Week - Moderate intensity at 90%',
        };
      
      case 3:
        return {
          weekNumber,
          phase: 'heavy',
          intensityMultiplier: 0.95,
          description: 'Heavy Week - Peak intensity at 95%',
        };
      
      default:
        return null;
    }
  }

  /**
   * Generate complete periodization plan for current week
   */
  static getPeriodizationPlan(
    currentWeek: number,
    lastDeloadWeek: number,
    recentMaxAttempts: Array<{ successful: boolean; weekNumber: number }>,
    settings: PeriodizationSettings = this.DEFAULT_SETTINGS
  ): PeriodizationPlan {
    // Check if deload is needed
    const deloadCheck = this.shouldDeload(
      currentWeek,
      lastDeloadWeek,
      recentMaxAttempts,
      settings
    );

    // If deload week, return deload plan
    if (deloadCheck.shouldDeload) {
      return {
        currentWeek,
        weekPhase: 'deload',
        intensityMultiplier: 0.70,
        isDeloadWeek: true,
        nextDeloadWeek: currentWeek + settings.deloadFrequency,
        message: `🛡️ Recovery Week - Training at 70% intensity. ${deloadCheck.reason}`,
      };
    }

    // Get intensity wave if enabled
    const wave = this.getIntensityWave(
      currentWeek,
      lastDeloadWeek,
      settings.enableIntensityWaves
    );

    if (wave) {
      const phaseMap: Record<string, WeekPhase> = {
        light: 'wave_light',
        medium: 'wave_medium',
        heavy: 'wave_heavy',
      };

      return {
        currentWeek,
        weekPhase: phaseMap[wave.phase],
        intensityMultiplier: wave.intensityMultiplier,
        isDeloadWeek: false,
        currentWave: wave,
        nextDeloadWeek: lastDeloadWeek + settings.deloadFrequency,
        message: `📊 ${wave.description}`,
      };
    }

    // Normal training week
    return {
      currentWeek,
      weekPhase: 'normal',
      intensityMultiplier: 1.0,
      isDeloadWeek: false,
      nextDeloadWeek: lastDeloadWeek + settings.deloadFrequency,
      message: '💪 Normal Training Week - Full intensity',
    };
  }

  /**
   * Calculate adjusted weight based on periodization
   * Applies both training max percentage and intensity wave multiplier
   */
  static calculatePeriodizedWeight(
    trueMax: number,
    targetPercentage: number, // e.g., 0.80 for 80% working weight
    periodizationPlan: PeriodizationPlan,
    settings: PeriodizationSettings = this.DEFAULT_SETTINGS
  ): number {
    // First, apply training max percentage
    const trainingMax = this.calculateTrainingMax(trueMax, settings);
    
    // Then apply target percentage (e.g., 80% for working sets)
    let weight = trainingMax * targetPercentage;
    
    // Finally, apply periodization multiplier (deload or wave)
    weight = weight * periodizationPlan.intensityMultiplier;
    
    // Round to nearest 5 lbs
    return Math.round(weight / 5) * 5;
  }

  /**
   * Analyze training history to recommend periodization mode
   */
  static recommendPeriodizationMode(
    weeklyMaxes: WeeklyMax[],
    userExperience: 'beginner' | 'intermediate' | 'advanced'
  ): {
    mode: PeriodizationMode;
    reason: string;
  } {
    // Beginners should use conservative mode
    if (userExperience === 'beginner') {
      return {
        mode: 'conservative',
        reason: 'Conservative mode recommended for beginners to build solid foundation and prevent injury',
      };
    }

    // Advanced lifters can handle aggressive mode
    if (userExperience === 'advanced') {
      return {
        mode: 'aggressive',
        reason: 'Aggressive mode suitable for experienced lifters with good recovery',
      };
    }

    // Analyze recent progression for intermediates
    if (weeklyMaxes.length >= 8) {
      const recentWeeks = weeklyMaxes.slice(-8);
      const progressionCount = recentWeeks.filter(w => w.progressionFromPreviousWeek > 0).length;
      const regressionCount = recentWeeks.filter(w => w.progressionFromPreviousWeek < 0).length;
      
      // If lots of regressions, use conservative
      if (regressionCount >= 3) {
        return {
          mode: 'conservative',
          reason: 'Multiple strength regressions detected - conservative mode will help manage fatigue',
        };
      }
      
      // If consistent progress, can use aggressive
      if (progressionCount >= 6) {
        return {
          mode: 'aggressive',
          reason: 'Consistent progression indicates good recovery - aggressive mode appropriate',
        };
      }
    }

    // Default to moderate for intermediates
    return {
      mode: 'moderate',
      reason: 'Balanced approach with 95% training max and regular deloads',
    };
  }

  /**
   * Calculate next deload week
   */
  static calculateNextDeloadWeek(
    currentWeek: number,
    lastDeloadWeek: number,
    settings: PeriodizationSettings = this.DEFAULT_SETTINGS
  ): number {
    return lastDeloadWeek + settings.deloadFrequency;
  }

  /**
   * Get visual representation of wave pattern
   */
  static getWavePattern(currentWeek: number, lastDeloadWeek: number): string {
    const weeksInCycle = currentWeek - lastDeloadWeek;
    if (weeksInCycle <= 0) return '●○○';
    
    const position = ((weeksInCycle - 1) % 3) + 1;
    
    switch (position) {
      case 1: return '●○○'; // Light week
      case 2: return '●●○'; // Medium week
      case 3: return '●●●'; // Heavy week
      default: return '○○○';
    }
  }

  /**
   * Estimate when user should test true max
   * Recommended after every deload week for accurate training max calculation
   */
  static shouldTestTrueMax(
    weeksSinceLastMaxTest: number,
    isDeloadWeek: boolean
  ): { shouldTest: boolean; reason: string } {
    // Test after deload week
    if (isDeloadWeek) {
      return {
        shouldTest: false,
        reason: 'Complete deload week first, then test max next week',
      };
    }

    // Test if it's been 6+ weeks since last test
    if (weeksSinceLastMaxTest >= 6) {
      return {
        shouldTest: true,
        reason: 'Test true max to ensure training percentages remain accurate',
      };
    }

    return {
      shouldTest: false,
      reason: `Continue with current max (tested ${weeksSinceLastMaxTest} weeks ago)`,
    };
  }
}

export default PeriodizationService;
