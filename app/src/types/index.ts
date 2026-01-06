/**
 * My Mobile Trainer - TypeScript Type Definitions
 * Core data models and interfaces for the application
 */

// ============================================================================
// USER TYPES
// ============================================================================

export type ExperienceLevel = 'beginner' | 'moderate';

export interface User {
  id: string;
  name: string;
  experienceLevel: ExperienceLevel;
  currentWeek: number;
  currentDay: number;
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
}

export interface BodyWeightEntry {
  id: string;
  userId: string;
  weight: number;
  weekNumber: number;
  recordedAt: Date;
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
}

export interface ExerciseVariant {
  id: string;
  primaryExerciseId: string;
  name: string;
  equipmentType: EquipmentType;
  videoUrl: string;
  instructions: string;
  equivalenceRatio: number; // Conversion ratio to primary exercise max
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
  startedAt: Date;
  completedAt?: Date;
  pausedAt?: Date;
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
  startedAt?: Date;
  completedAt?: Date;
}

export interface SetLog {
  id: string;
  exerciseLogId: string;
  setNumber: number;
  weight: number;
  reps: number;
  targetReps: RepTarget;
  restSeconds: number;
  completedAt: Date;
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
  dateAchieved: Date;
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
  achievedAt: Date;
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
  MainTabs: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  ProfileSetup: undefined;
  ExperienceLevel: undefined;
  BodyWeightInput: undefined;
  PreWorkoutIntro: { phase: string };
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

export type MainTabsParamList = {
  Workout: undefined;
  Progress: undefined;
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
