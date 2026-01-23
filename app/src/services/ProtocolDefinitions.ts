/**
 * Protocol Definitions
 * 
 * Defines the three core training protocols per PRD:
 * - P1: Max Attempt Protocol (4RM testing with earned progression)
 * - P2: Volume Protocol (3 sets, rep-out, hypertrophy focus)
 * - P3: Accessory Protocol (2 sets, rep-out, fatigue managed)
 * 
 * These protocols replace formula-based calculations in "protocol mode"
 */

import { ProtocolDefinition, Protocol } from '../types';

// ============================================================================
// P1: MAX ATTEMPT PROTOCOL
// ============================================================================

export const P1_MAX_ATTEMPT: ProtocolDefinition = {
  protocol: 'P1',
  name: 'Max Attempt Protocol',
  description: 'Test and establish verified 4RM through progressive attempts. Earned progression only.',
  warmupStrategy: 'adaptive', // Light loads = 2 sets, Heavy loads = 3 sets
  downSetsOnFailure: true,
  sets: [
    // Warmup sets will be generated dynamically by adaptive warmup logic
    // Working sets defined here
    {
      setNumber: 1,
      percentageOf4RM: 100, // Start at current 4RM
      instruction: 'max-attempt',
      minReps: 4,
      maxReps: 4,
      restSeconds: 180, // 3 minutes before max attempt
    },
    // If successful, weight increases 2.5-5% and retry
    // If failed, redirect to down sets (defined separately)
  ],
};

// P1 Warmup Templates (Adaptive)
export const P1_WARMUP_UPPER_BODY = {
  light: [
    { percentage: 0.30, reps: 6, rest: 30 },
    { percentage: 0.45, reps: 4, rest: 60 },
  ],
  heavy: [
    { percentage: 0.30, reps: 6, rest: 30 },
    { percentage: 0.45, reps: 4, rest: 60 },
    { percentage: 0.70, reps: 2, rest: 90 },
  ],
};

export const P1_WARMUP_LOWER_BODY = {
  light: [
    { percentage: 0.30, reps: 10, rest: 30 }, // Minimum 10 reps for lower body
    { percentage: 0.45, reps: 10, rest: 60 },
  ],
  heavy: [
    { percentage: 0.30, reps: 10, rest: 30 },
    { percentage: 0.45, reps: 10, rest: 60 },
    { percentage: 0.70, reps: 10, rest: 90 },
  ],
};

// P1 Down Sets (always performed after max testing)
export const P1_DOWN_SETS: ProtocolDefinition['sets'] = [
  {
    setNumber: 1,
    percentageOf4RM: 87.5, // 85-90% average
    instruction: 'controlled',
    minReps: 4,
    maxReps: 6,
    restSeconds: 90,
  },
  {
    setNumber: 2,
    percentageOf4RM: 82.5, // 80-85% average
    instruction: 'rep-out',
    minReps: 6,
    maxReps: 12,
    restSeconds: 90,
  },
];

// ============================================================================
// P2: VOLUME PROTOCOL
// ============================================================================

export const P2_VOLUME: ProtocolDefinition = {
  protocol: 'P2',
  name: '3-Set Volume Protocol',
  description: 'Volume and hypertrophy work. Rep out each set. Signals readiness but does not auto-increase max.',
  warmupStrategy: 'fixed', // No warmups for P2
  downSetsOnFailure: false,
  sets: [
    {
      setNumber: 1,
      percentageOf4RM: 77.5, // 75-80% average
      instruction: 'rep-out',
      minReps: 7,
      maxReps: 15,
      restSeconds: 90,
    },
    {
      setNumber: 2,
      percentageOf4RM: 77.5, // 75-80% average
      instruction: 'rep-out',
      minReps: 7,
      maxReps: 15,
      restSeconds: 90,
    },
    {
      setNumber: 3,
      percentageOf4RM: 72.5, // 70-75% average
      instruction: 'rep-out',
      minReps: 7,
      maxReps: 15,
      restSeconds: 90,
    },
  ],
};

// ============================================================================
// P3: ACCESSORY PROTOCOL
// ============================================================================

export const P3_ACCESSORY: ProtocolDefinition = {
  protocol: 'P3',
  name: '2-Set Accessory Protocol',
  description: 'Fatigue-managed accessory work. Rep out each set.',
  warmupStrategy: 'fixed', // No warmups for P3
  downSetsOnFailure: false,
  sets: [
    {
      setNumber: 1,
      percentageOf4RM: 72.5, // 70-75% average
      instruction: 'rep-out',
      minReps: 7,
      maxReps: 15,
      restSeconds: 60,
    },
    {
      setNumber: 2,
      percentageOf4RM: 67.5, // 65-70% average
      instruction: 'rep-out',
      minReps: 7,
      maxReps: 15,
      restSeconds: 60,
    },
  ],
};

// ============================================================================
// PROTOCOL REGISTRY
// ============================================================================

export const PROTOCOL_REGISTRY: Record<Protocol, ProtocolDefinition> = {
  P1: P1_MAX_ATTEMPT,
  P2: P2_VOLUME,
  P3: P3_ACCESSORY,
};

// ============================================================================
// PROTOCOL CONSTANTS
// ============================================================================

// Weight increase increments for successful P1 attempts
export const P1_INCREASE_INCREMENTS = {
  small: 2.5,  // Conservative increase
  medium: 5,   // Standard increase
  large: 10,   // Aggressive increase
};

// Threshold to determine light vs heavy loads (for warmup adaptation)
export const WARMUP_THRESHOLD = 0.75; // Below 75% 4RM = light, above = heavy

// Rep band thresholds for P2/P3 interpretation
export const REP_BANDS = {
  tooHeavy: { min: 1, max: 4 },
  overloaded: { min: 5, max: 6 },
  ideal: { min: 7, max: 9 },
  reserve: { min: 10, max: 12 },
  light: { min: 13, max: 15 },
};

// Minimum weeks between P1 tests for same exercise
export const P1_COOLDOWN_WEEKS = 2;

// Maximum consecutive P1 failures before forcing volume work
export const MAX_P1_FAILURES = 2;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get protocol definition by protocol type
 */
export function getProtocolDefinition(protocol: Protocol): ProtocolDefinition {
  return PROTOCOL_REGISTRY[protocol];
}

/**
 * Determine if warmup should be light or heavy based on working weight
 */
export function shouldUseHeavyWarmup(workingWeight: number, fourRepMax: number): boolean {
  const percentage = workingWeight / fourRepMax;
  return percentage >= WARMUP_THRESHOLD;
}

/**
 * Calculate P1 weight increase based on success
 */
export function calculateP1Increase(
  currentWeight: number,
  consecutiveSuccesses: number,
  equipmentType: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight'
): number {
  // Conservative approach: always use standard increment
  // Could be made smarter based on consecutive successes
  
  if (equipmentType === 'dumbbell') {
    return P1_INCREASE_INCREMENTS.small; // 2.5 lbs for dumbbells
  }
  
  return P1_INCREASE_INCREMENTS.medium; // 5 lbs for barbells/machines
}

/**
 * Get protocol display color for UI
 */
export function getProtocolColor(protocol: Protocol): string {
  const colors: Record<Protocol, string> = {
    P1: '#FF5722', // Red/Orange - Testing
    P2: '#2196F3', // Blue - Volume
    P3: '#9C27B0', // Purple - Accessory
  };
  
  return colors[protocol];
}

/**
 * Get protocol emoji for visual identification
 */
export function getProtocolEmoji(protocol: Protocol): string {
  const emojis: Record<Protocol, string> = {
    P1: '🎯', // Max testing
    P2: '💪', // Volume work
    P3: '⚡', // Accessory
  };
  
  return emojis[protocol];
}

export default PROTOCOL_REGISTRY;
