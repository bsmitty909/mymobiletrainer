/**
 * My Mobile Trainer - TypeScript Type Definitions
 * Core data models and interfaces for the application
 */

// ============================================================================
// USER TYPES
// ============================================================================

export type ExperienceLevel = 'beginner' | 'moderate' | 'advanced';

export interface User {
  id: string;
  name: string;
  experienceLevel: ExperienceLevel;
  currentWeek: number;
  currentDay: number;
  profileImage?: string; // URI to profile image
  createdAt: number; // timestamp
  lastActive: number; // timestamp
}

export interface UserProfile {
  userId: string;
  currentPhase: string;
  currentWeek: number;
  currentDay: number;
  maxLifts: Record<string, MaxLift>;
  preferredExercises: Record<string, string>; // exerciseId -> variantId
  exerciseSubstitutions: ExerciseSubstitution[]; // History of substitutions
  permanentSubstitutions: Record<string, string>; // originalId -> substituteId
  protocolPreferences: {
    preferredP1Frequency: number; // weeks between P1 tests
    autoSuggestP1: boolean;
    showReadinessSignals: boolean;
  };
}

export interface BodyWeightEntry {
  id: string;
  userId: string;
  weight: number;
  weekNumber: number;
  recordedAt: number; // timestamp
}

// ============================================================================
// EXERCISE TYPES
// ============================================================================

export type EquipmentType = 'dumbbell' | 'barbell' | 'machine' | 'cable' | 'bodyweight';
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'biceps' | 'triceps' | 'core';

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  equipmentType: EquipmentType;
  videoUrl: string;
  thumbnailUrl?: string;
  instructions: string;
  formTips: string[];
  primaryMuscle: MuscleGroup;
  incrementSize?: number; // Weight increment in lbs (2.5, 5, 10)
}

export interface ExerciseVariant {
  id: string;
  primaryExerciseId: string;
  name: string;
  equipmentType: EquipmentType;
  videoUrl: string;
  instructions: string;
  equivalenceRatio: number; // Conversion ratio to primary exercise max
  incrementSize?: number; // Weight increment in lbs (2.5, 5, 10)
}

// Exercise substitution tracking
export interface ExerciseSubstitution {
  id: string;
  userId: string;
  originalExerciseId: string;
  substituteExerciseId: string;
  variantId?: string;
  weekNumber: number;
  dayNumber: number;
  reason?: string;
  substitutedAt: number; // timestamp
  permanent: boolean; // If true, always use this substitution
}

// ============================================================================
// WORKOUT PROGRAM TYPES
// ============================================================================

export type WeekType = 'max' | 'intensity' | 'percentage' | 'mixed';
export type SetType = 'warmup' | 'working' | 'downset' | 'max';
export type RepTarget = { min: number; max: number } | 'REP_OUT';

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  phases: WorkoutPhase[];
}

export interface WorkoutPhase {
  id: string;
  name: string;
  description: string;
  targetExperience: ExperienceLevel | 'all';
  weeks: Week[];
}

export interface Week {
  weekNumber: number;
  title: string;
  goals: string;
  weekType: WeekType;
  days: Day[];
}

export interface Day {
  dayNumber: number;
  name: string;
  muscleGroups: MuscleGroup[];
  warmup?: ExerciseTemplate[];
  exercises: ExerciseTemplate[];
  cooldown?: ExerciseTemplate[];
}

export interface ExerciseTemplate {
  exerciseId: string;
  order: number;
  sets: SetTemplate[];
  alternates?: string[]; // Exercise variant IDs
  notes?: string;
}

export interface SetTemplate {
  setNumber: number;
  repRange: RepTarget;
  restSeconds: number;
  weightFormula: WeightFormula;
  setType: SetType;
}

export interface WeightFormula {
  baseType: 'userMax' | 'previousMax' | 'bodyWeight' | 'fixed' | 'relatedExercise';
  exerciseReference?: string; // For relatedExercise type
  percentage?: number; // 0-100
  adjustment?: number; // Fixed weight to add/subtract
  roundTo?: number; // 2.5, 5, 10
}

// ============================================================================
// WORKOUT SESSION TYPES
// ============================================================================

export type WorkoutStatus = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned';

export interface WorkoutSession {
  id: string;
  userId: string;
  weekNumber: number;
  dayNumber: number;
  startedAt: number; // timestamp
  completedAt?: number; // timestamp
  pausedAt?: number; // timestamp
  status: WorkoutStatus;
  exercises: ExerciseLog[];
  notes?: string;
  bodyWeight?: number;
}

export interface ExerciseLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseVariantId?: string;
  suggestedWeight: number;
  actualWeight?: number;
  order: number;
  sets: SetLog[];
  startedAt?: number; // timestamp
  completedAt?: number; // timestamp
}

export interface SetLog {
  id: string;
  exerciseLogId: string;
  setNumber: number;
  weight: number;
  reps: number;
  targetReps: RepTarget;
  restSeconds: number;
  completedAt: number; // timestamp
  perceivedEffort?: number; // RPE scale 1-10
  notes?: string;
}

// ============================================================================
// PROGRESS TRACKING TYPES
// ============================================================================

export interface MaxLift {
  id: string;
  userId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  dateAchieved: number; // timestamp
  verified: boolean; // True if from max determination week
  workoutSessionId?: string;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  recordType: 'max_weight' | 'max_reps' | 'volume';
  value: number;
  previousValue?: number;
  achievedAt: number; // timestamp
  workoutSessionId: string;
}

export interface WorkoutStats {
  totalVolume: number; // Total weight lifted (weight × reps)
  exercisesCompleted: number;
  setsCompleted: number;
  totalReps: number;
  duration: number; // in seconds
  personalRecords: PersonalRecord[];
}

// ============================================================================
// FORMULA CALCULATION TYPES
// ============================================================================

export interface FormulaContext {
  userMaxes: Record<string, MaxLift>;
  bodyWeight?: number;
  previousWorkout?: ExerciseLog;
  weekType: WeekType;
  exerciseType: EquipmentType;
}

export interface WeightCalculationResult {
  suggestedWeight: number;
  baseWeight: number;
  appliedPercentage: number;
  adjustment: number;
  reasoning: string; // Explanation for the suggestion
}

export interface ProgressionAnalysis {
  shouldIncrease: boolean;
  shouldDecrease: boolean;
  shouldMaintain: boolean;
  recommendedChange: number;
  reason: string;
  averageReps: number;
  targetReps: RepTarget;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface ActiveWorkoutState {
  session: WorkoutSession | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  restTimerActive: boolean;
  restTimeRemaining: number;
  restTimerTargetDuration: number;
}

export interface ProgressState {
  maxLifts: MaxLift[];
  recentWorkouts: WorkoutSession[];
  bodyWeights: BodyWeightEntry[];
  personalRecords: PersonalRecord[];
  loading: boolean;
  error: string | null;
}

export interface UserState {
  currentUser: User | null;
  profile: UserProfile | null;
  isOnboarded: boolean;
  loading: boolean;
  error: string | null;
}

export interface WorkoutState {
  currentProgram: WorkoutProgram | null;
  currentWeek: Week | null;
  currentDay: Day | null;
  activeSession: WorkoutSession | null;
  calculatedWeights: Record<string, WeightCalculationResult>;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export type WeightUnit = 'lbs' | 'kg';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface AppSettings {
  weightUnit: WeightUnit;
  weightIncrements: number[]; // Available increments [2.5, 5, 10]
  autoStartRestTimer: boolean;
  restTimerSound: boolean;
  restTimerVibration: boolean;
  workoutReminders: boolean;
  achievementNotifications: boolean;
  theme: ThemeMode;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type RootStackParamList = {
  Onboarding: undefined;
  MaxDeterminationIntro: undefined;
  MaxTesting: undefined;
  MaxSummary: undefined;
  MainTabs: undefined;
  ProtocolTrainerDashboard: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  ProfileSetup: undefined;
  ExperienceLevel: undefined;
  BodyWeightInput: undefined;
  PreWorkoutIntro: { phase: string };
  MaxDeterminationIntro: undefined;
  MaxTesting: undefined;
  MaxSummary: undefined;
};

export type WorkoutStackParamList = {
  WorkoutDashboard: undefined;
  WorkoutDetail: { weekNumber: number; dayNumber: number };
  ActiveWorkout: { sessionId: string };
  VideoPlayer: { exerciseId: string; videoUrl: string };
  WorkoutSummary: { sessionId: string };
  MaxDetermination: { weekNumber: number; dayNumber: number };
};

export type ProgressStackParamList = {
  ProgressDashboard: undefined;
  BodyWeightHistory: undefined;
  PersonalRecords: undefined;
  ExerciseDetail: { exerciseId: string };
  WorkoutHistory: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  MaxLifts: undefined;
  Settings: undefined;
  About: undefined;
};

export type ExercisesStackParamList = {
  ExerciseLibrary: undefined;
  ExerciseDetail: { exerciseId: string };
};

export type MainTabsParamList = {
  Workout: undefined;
  Progress: undefined;
  Exercises: undefined;
  Profile: undefined;
};

// ============================================================================
// API / DATA TRANSFER TYPES
// ============================================================================

export interface CreateWorkoutSessionDTO {
  userId: string;
  weekNumber: number;
  dayNumber: number;
  bodyWeight?: number;
}

export interface LogSetDTO {
  exerciseLogId: string;
  setNumber: number;
  weight: number;
  reps: number;
  restSeconds: number;
  perceivedEffort?: number;
}

export interface UpdateMaxLiftDTO {
  exerciseId: string;
  weight: number;
  reps: number;
  verified: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExportData {
  user: User;
  workoutSessions: WorkoutSession[];
  maxLifts: MaxLift[];
  bodyWeights: BodyWeightEntry[];
  exportedAt: Date;
  version: string;
}

// ============================================================================
// CONSTANTS FOR TYPE SAFETY
// ============================================================================

export const WEEK_PERCENTAGES: Record<WeekType, number> = {
  max: 1.0,
  intensity: 0.85,
  percentage: 0.75,
  mixed: 0.90,
};

export const WEIGHT_INCREMENTS: Record<EquipmentType, number> = {
  dumbbell: 2.5,
  barbell: 5,
  machine: 5,
  cable: 5,
  bodyweight: 0,
};

export const REST_PERIODS: Record<SetType, number> = {
  warmup: 30,
  working: 90,
  max: 120,
  downset: 60,
};

export const ACCESSORY_RATIOS: Record<string, number> = {
  chestFly: 0.25,
  lateralRaise: 0.30,
  cableRow: 0.50,
  rearDeltFly: 0.30,
};

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export type BadgeCategory = 'workout_count' | 'streak' | 'volume' | 'pr' | 'consistency' | 'milestone';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: number;
  unlockedAt?: number; // timestamp
}

export interface UserLevel {
  level: number;
  xp: number;
  xpForNextLevel: number;
  title: string;
}

export interface WorkoutStreak {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: number; // timestamp
  streakDates: number[]; // Array of timestamps for calendar visualization
}

export interface GamificationState {
  level: UserLevel;
  badges: Badge[];
  unlockedBadges: string[]; // Array of badge IDs
  streak: WorkoutStreak;
  totalWorkouts: number;
  totalVolume: number;
  totalPRs: number;
}

// ============================================================================
// PHASE 4.6: SOCIAL & MOTIVATION TYPES
// ============================================================================

// Enhanced Personal Record with celebration data
export interface PersonalRecordEnhanced {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: number;
  previousRecord?: {
    weight: number;
    reps: number;
    date: number;
  };
  improvement: {
    weightGain: number;
    percentageGain: number;
  };
  userPercentile?: number;
}

export interface PRStats {
  totalPRs: number;
  prsThisWeek: number;
  prsThisMonth: number;
  averageImprovement: number;
  bestPR: PersonalRecordEnhanced | null;
  recentPRs: PersonalRecordEnhanced[];
}

export interface ShareableData {
  exerciseName: string;
  weight: number;
  reps: number;
  improvement: string;
  percentile?: number;
  message: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  score: number;
  category: LeaderboardCategory;
  additionalData?: {
    totalWorkouts?: number;
    totalVolume?: number;
    currentStreak?: number;
    averageIntensity?: number;
    prCount?: number;
  };
  isCurrentUser?: boolean;
}

export type LeaderboardCategory =
  | 'total_strength'
  | 'strength_gain'
  | 'volume'
  | 'consistency'
  | 'streak'
  | 'pr_count';

export type LeaderboardTimeframe = 'week' | 'month' | 'all_time';

export interface LeaderboardFilter {
  category: LeaderboardCategory;
  timeframe: LeaderboardTimeframe;
  weightClass?: 'light' | 'middle' | 'heavy';
  ageGroup?: 'under_25' | '25_35' | '35_45' | 'over_45';
}

export interface UserComparison {
  currentUser: LeaderboardEntry;
  nearbyUsers: LeaderboardEntry[];
  percentile: number;
  message: string;
}

// Streak Milestone Types
export interface StreakMilestone {
  value: number;
  title: string;
  emoji: string;
  color: string;
}

// Reminder Types for Streak Notifications
export interface StreakReminder {
  id: string;
  userId: string;
  type: 'streak_risk' | 'milestone_approaching' | 'encouragement';
  message: string;
  scheduledFor: number; // timestamp
  sent: boolean;
  streakValue: number;
}

// ============================================================================
// PROTOCOL SYSTEM TYPES (PRD Implementation)
// ============================================================================

// Training mode selection
export type TrainingMode = 'percentage' | 'protocol';

// Protocol types
export type Protocol = 'P1' | 'P2' | 'P3';

// Protocol exercise template - assigns protocol to exercise
export interface ProtocolExerciseTemplate {
  exerciseId: string;
  protocol: Protocol;
  protocolOrder: number; // P1 first, then P2, then P3
  alternatives?: string[]; // Exercise variant IDs
  notes?: string;
}

// Protocol definition - defines how each protocol works
export interface ProtocolDefinition {
  protocol: Protocol;
  name: string;
  description: string;
  warmupStrategy: 'adaptive' | 'fixed';
  sets: ProtocolSet[];
  downSetsOnFailure: boolean; // P1 specific
}

// Protocol set specification
export interface ProtocolSet {
  setNumber: number;
  percentageOf4RM: number; // Percentage of 4-rep max
  instruction: 'rep-out' | 'max-attempt' | 'controlled';
  minReps?: number;
  maxReps?: number;
  restSeconds: number;
}

// ============================================================================
// 4RM TRACKING TYPES
// ============================================================================

// 4-Rep Max tracking (different from 1RM)
export interface FourRepMax {
  id: string;
  userId: string;
  exerciseId: string;
  weight: number;
  dateAchieved: number; // timestamp
  verified: boolean; // True only if earned via P1
  testingSessionId?: string;
}

// Max testing attempt history
export interface MaxTestingAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  fourRepMax: number; // Current 4RM at time of attempt
  attemptedWeight: number;
  repsCompleted: number;
  successful: boolean;
  timestamp: number;
  sessionId: string;
}

// ============================================================================
// INJURY & RECOVERY TYPES
// ============================================================================

// Injury severity levels
export type InjurySeverity = 'mild' | 'moderate' | 'severe';

// Missed workout reasons
export type MissedWorkoutReason = 'injury' | 'no_gym_access' | 'time_constraints' | 'other';

// Injury report
export interface InjuryReport {
  id: string;
  userId: string;
  muscleGroup: MuscleGroup;
  severity: InjurySeverity;
  description: string;
  reportedAt: number; // timestamp
}

// Injury hold - pauses muscle groups or movement patterns
export interface InjuryHold {
  id: string;
  userId: string;
  muscleGroups: MuscleGroup[];
  movementPatterns: string[]; // e.g., 'push', 'pull', 'squat'
  startDate: number; // timestamp
  endDate: number; // timestamp
  active: boolean;
  reason: string;
}

// Rehab session tracking
export interface RehabSession {
  id: string;
  userId: string;
  exerciseId: string;
  preInjuryMax: number; // Store last known strength
  currentWeight: number;
  loadReduction: number; // Percentage reduced
  painLevel?: number; // 0-10 scale
  sessionId: string;
  timestamp: number;
}

// Missed workout tracking
export interface MissedWorkout {
  id: string;
  userId: string;
  scheduledDate: number; // timestamp
  reason: MissedWorkoutReason;
  notes?: string;
  timestamp: number;
}

// Detraining response calculation
export interface DetrainingResponse {
  daysMissed: number;
  loadReductionPercentage: number;
  disableMaxTesting: boolean;
  recommendation: string;
}

// ============================================================================
// REP-OUT INTERPRETATION TYPES
// ============================================================================

// Rep band classifications
export type RepBand = 'too_heavy' | 'overloaded' | 'ideal' | 'reserve' | 'light';

// Rep band analysis for rep-out sets
export interface RepBandAnalysis {
  reps: number;
  band: RepBand;
  meaning: string;
  actionRequired: boolean;
}

// Readiness signal for P1 testing
export interface ReadinessSignal {
  exerciseId: string;
  readyForP1: boolean;
  confidence: number; // 0-1
  reasoning: string[];
  recommendedP1Date?: number; // timestamp
}

// Safety guard triggers
export type SafetyGuardType = 'rep_drop' | 'multiple_failures' | 'form_concern' | 'overtraining';
export type SafetyGuardSeverity = 'warning' | 'critical';

// Safety guard notification
export interface SafetyGuard {
  type: SafetyGuardType;
  severity: SafetyGuardSeverity;
  message: string;
  actionTaken: string;
}

// ============================================================================
// TRAINER FEATURE TYPES
// ============================================================================

// Trainer override types
export type TrainerOverrideType =
  | 'protocol_change'
  | 'force_rehab'
  | 'adjust_intensity'
  | 'exercise_swap'
  | 'reorder_exercises'
  | 'reorder_protocols';

// Trainer override tracking
export interface TrainerOverride {
  id: string;
  trainerId: string;
  userId: string;
  exerciseId?: string;
  overrideType: TrainerOverrideType;
  details: any; // Flexible for different override types
  reason: string;
  timestamp: number;
}

// Workout flag types
export type WorkoutFlagType = 'plateau' | 'risk' | 'fatigue' | 'injury_concern';
export type WorkoutFlagSeverity = 'low' | 'medium' | 'high';

// Workout flag for trainer awareness
export interface WorkoutFlag {
  id: string;
  userId: string;
  flagType: WorkoutFlagType;
  severity: WorkoutFlagSeverity;
  message: string;
  generatedAt: number; // timestamp
  acknowledged: boolean;
}

// Analytics metric for trainer dashboard
export interface AnalyticsMetric {
  metricType: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  periodStart: number; // timestamp
  periodEnd: number; // timestamp
}

// ============================================================================
// PROTOCOL STATE TYPES
// ============================================================================

// Protocol-specific workout state
export interface ProtocolWorkoutState {
  currentProtocol: Protocol | null;
  p1TestingStatus: 'idle' | 'in_progress' | 'completed' | 'failed';
  fourRepMaxHistory: FourRepMax[];
  lastP1TestDate: Record<string, number>; // exerciseId -> timestamp
  readinessSignals: ReadinessSignal[];
}

// Rehab mode state
export interface RehabModeState {
  active: boolean;
  activeHolds: InjuryHold[];
  rehabSessions: RehabSession[];
  painReports: Record<string, number>; // exerciseId -> pain level
  disclaimerAccepted: boolean;
  acceptedAt?: number; // timestamp
}

// Protocol preferences for user
export interface ProtocolPreferences {
  preferredP1Frequency: number; // weeks between P1 tests
  autoSuggestP1: boolean;
  showReadinessSignals: boolean;
}
