/**
 * Feature Flags Configuration
 * 
 * Controls protocol system feature availability for gradual rollout.
 * Allows safe A/B testing and rollback capabilities.
 * 
 * Usage:
 * - Enable features for beta users first
 * - Roll out gradually to all users
 * - Disable if issues detected
 * - A/B test effectiveness
 */

export interface FeatureFlags {
  // Protocol System Features
  protocolModeEnabled: boolean;
  protocolModeOnboardingEnabled: boolean;
  modeSwitchingEnabled: boolean;
  
  // P1 Testing Features
  p1MaxTestingEnabled: boolean;
  p1CooldownEnforced: boolean;
  p1SafetyCapEnabled: boolean;
  
  // P2/P3 Features
  repOutInterpretationEnabled: boolean;
  readinessSignalsEnabled: boolean;
  safetyGuardsEnabled: boolean;
  
  // Rehab & Injury Features
  rehabModeEnabled: boolean;
  injuryHoldsEnabled: boolean;
  detrainingLogicEnabled: boolean;
  
  // Trainer Features
  trainerDashboardEnabled: boolean;
  trainerOverridesEnabled: boolean;
  trainerNotesEnabled: boolean;
  trainerFlagsEnabled: boolean;
  
  // Gamification Features
  protocolBadgesEnabled: boolean;
  protocolXPEnabled: boolean;
  p1CelebrationsEnabled: boolean;
  
  // Analytics Features
  protocolAnalyticsEnabled: boolean;
  modeComparisonEnabled: boolean;
  dataExportEnabled: boolean;
  
  // Experimental Features
  aiCoachingEnabled: boolean;
  voiceLoggingEnabled: boolean;
  wearableIntegrationEnabled: boolean;
}

/**
 * Default feature flags (production safe)
 */
const DEFAULT_FLAGS: FeatureFlags = {
  // Protocol System (READY FOR PRODUCTION)
  protocolModeEnabled: true,
  protocolModeOnboardingEnabled: true,
  modeSwitchingEnabled: true,
  
  // P1 Testing (READY FOR PRODUCTION)
  p1MaxTestingEnabled: true,
  p1CooldownEnforced: true,
  p1SafetyCapEnabled: true,
  
  // P2/P3 (READY FOR PRODUCTION)
  repOutInterpretationEnabled: true,
  readinessSignalsEnabled: true,
  safetyGuardsEnabled: true,
  
  // Rehab & Injury (READY FOR PRODUCTION)
  rehabModeEnabled: true,
  injuryHoldsEnabled: true,
  detrainingLogicEnabled: true,
  
  // Trainer Features (READY FOR PRODUCTION)
  trainerDashboardEnabled: true,
  trainerOverridesEnabled: true,
  trainerNotesEnabled: true,
  trainerFlagsEnabled: true,
  
  // Gamification (READY FOR PRODUCTION)
  protocolBadgesEnabled: true,
  protocolXPEnabled: true,
  p1CelebrationsEnabled: true,
  
  // Analytics (READY FOR PRODUCTION)
  protocolAnalyticsEnabled: true,
  modeComparisonEnabled: true,
  dataExportEnabled: true,
  
  // Experimental (NOT READY)
  aiCoachingEnabled: false,
  voiceLoggingEnabled: false,
  wearableIntegrationEnabled: false,
};

/**
 * Beta feature flags (progressive rollout)
 */
const BETA_FLAGS: FeatureFlags = {
  ...DEFAULT_FLAGS,
  // All protocol features enabled for beta users
  protocolModeEnabled: true,
  p1MaxTestingEnabled: true,
  rehabModeEnabled: true,
  trainerDashboardEnabled: true,
  protocolAnalyticsEnabled: true,
};

/**
 * Development feature flags (all features)
 */
const DEV_FLAGS: FeatureFlags = {
  ...BETA_FLAGS,
  // Enable experimental features in development
  aiCoachingEnabled: true,
  voiceLoggingEnabled: true,
  wearableIntegrationEnabled: true,
};

/**
 * Feature Flag Service
 */
class FeatureFlagService {
  private flags: FeatureFlags = DEFAULT_FLAGS;
  private userGroup: 'production' | 'beta' | 'dev' = 'production';

  /**
   * Initialize feature flags based on environment and user
   */
  initialize(environment: 'production' | 'staging' | 'development', userId?: string): void {
    if (environment === 'development') {
      this.flags = DEV_FLAGS;
      this.userGroup = 'dev';
    } else if (this.isBetaUser(userId)) {
      this.flags = BETA_FLAGS;
      this.userGroup = 'beta';
    } else {
      this.flags = DEFAULT_FLAGS;
      this.userGroup = 'production';
    }
  }

  /**
   * Check if user is in beta program
   */
  private isBetaUser(userId?: string): boolean {
    if (!userId) return false;
    
    // Beta user determination logic
    // Could be based on:
    // - User ID in beta list
    // - Email domain
    // - Opt-in flag
    // - Random percentage (A/B testing)
    
    // For now, return false (will implement based on rollout strategy)
    return false;
  }

  /**
   * Check if feature is enabled
   */
  isEnabled(feature: keyof FeatureFlags): boolean {
    return this.flags[feature];
  }

  /**
   * Enable feature dynamically (for testing/debugging)
   */
  enable(feature: keyof FeatureFlags): void {
    this.flags[feature] = true;
  }

  /**
   * Disable feature dynamically (for emergency rollback)
   */
  disable(feature: keyof FeatureFlags): void {
    this.flags[feature] = false;
  }

  /**
   * Get all current flags
   */
  getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  /**
   * Get user group
   */
  getUserGroup(): 'production' | 'beta' | 'dev' {
    return this.userGroup;
  }

  /**
   * Override all flags (for testing)
   */
  setFlags(flags: Partial<FeatureFlags>): void {
    this.flags = { ...this.flags, ...flags };
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.flags = DEFAULT_FLAGS;
    this.userGroup = 'production';
  }
}

export const featureFlagService = new FeatureFlagService();
export default featureFlagService;
