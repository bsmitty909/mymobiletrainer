/**
 * Exercise Library
 *
 * Core exercises extracted from the Excel workout program.
 * Each exercise includes metadata and video demonstrations from @30minutebody80.
 */

import { Exercise, ExerciseVariant } from '../types';

export const exercises: Exercise[] = [
  // ========================================================================
  // CHEST EXERCISES
  // ========================================================================
  {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    primaryMuscle: 'chest',
    equipmentType: 'barbell',
    incrementSize: 5,
    videoUrl: 'https://www.youtube.com/watch?v=VKpW25ffj7Y',
    instructions: '1. Lie on bench with feet flat\n2. Grip bar slightly wider than shoulder width\n3. Lower bar to mid-chest\n4. Press bar up to lockout\n5. Control the descent',
    formTips: [
      'Keep shoulders retracted and pinned to bench',
      'Maintain natural arch in lower back',
      'Drive through heels',
      'Full lockout at top',
      'Control the negative (descent)',
    ],
  },
  {
    id: 'dumbbell-incline-press',
    name: 'Dumbbell Incline Press',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    primaryMuscle: 'chest',
    equipmentType: 'dumbbell',
    incrementSize: 2.5,
    videoUrl: 'https://www.youtube.com/watch?v=WgviBZvfoFo',
    instructions: '1. Set bench to 30-45 degree incline\n2. Hold dumbbells at shoulder level\n3. Press straight up\n4. Touch dumbbells at top\n5. Lower under control',
    formTips: [
      'Keep elbows at 45-degree angle',
      'Don\'t let dumbbells drift forward',
      'Full extension at top',
      'Controlled descent',
      'Maintain core tension',
    ],
  },
  {
    id: 'machine-press',
    name: 'Machine Chest Press',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    primaryMuscle: 'chest',
    equipmentType: 'machine',
    incrementSize: 5,
    videoUrl: 'https://www.youtube.com/watch?v=NozX8gJICPs',
    instructions: '1. Adjust seat height\n2. Grip handles at chest level\n3. Press forward to extension\n4. Return slowly to start\n5. Don\'t let plates crash',
    formTips: [
      'Keep back against pad',
      'Chest out, shoulders back',
      'Full range of motion',
      'Smooth, controlled movement',
    ],
  },
  {
    id: 'dumbbell-chest-fly',
    name: 'Dumbbell Chest Fly',
    muscleGroups: ['chest'],
    primaryMuscle: 'chest',
    equipmentType: 'dumbbell',
    videoUrl: 'https://www.youtube.com/watch?v=8mC6rd_j5Lc',
    instructions: '1. Lie on bench with dumbbells above chest\n2. Slight bend in elbows\n3. Lower dumbbells out to sides\n4. Bring back to center\n5. Squeeze chest at top',
    formTips: [
      'Maintain elbow bend throughout',
      'Don\'t go below shoulder level',
      'Feel the stretch in chest',
      'Controlled movement',
    ],
  },

  // ========================================================================
  // BACK EXERCISES
  // ========================================================================
  {
    id: 'lat-pulldown',
    name: 'Lat Pull Down',
    muscleGroups: ['back', 'biceps'],
    primaryMuscle: 'back',
    equipmentType: 'cable',
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    instructions: '1. Sit at lat pulldown machine\n2. Grip bar slightly wider than shoulders\n3. Pull bar down to upper chest\n4. Squeeze shoulder blades together\n5. Control the weight up',
    formTips: [
      'Don\'t lean back excessively',
      'Keep core engaged',
      'Pull elbows down and back',
      'Full range of motion',
      'Control the negative',
    ],
  },
  {
    id: 'machine-low-row',
    name: 'Machine Low Row',
    muscleGroups: ['back', 'biceps'],
    primaryMuscle: 'back',
    equipmentType: 'machine',
    videoUrl: 'https://www.youtube.com/watch?v=UCXxvVItLoM',
    instructions: '1. Sit with chest against pad\n2. Grip handles\n3. Pull handles to sides\n4. Squeeze shoulder blades\n5. Return slowly',
    formTips: [
      'Keep chest against pad',
      'Pull elbows back, not just hands',
      'Squeeze at the end position',
      'Don\'t use momentum',
    ],
  },
  {
    id: 'machine-high-row',
    name: 'Machine High Row',
    muscleGroups: ['back', 'biceps'],
    primaryMuscle: 'back',
    equipmentType: 'machine',
    videoUrl: 'https://www.youtube.com/watch?v=UCXxvVItLoM',
    instructions: '1. Sit with chest against pad\n2. Grip high handles\n3. Pull to upper chest\n4. Squeeze shoulder blades\n5. Control return',
    formTips: [
      'Target upper back',
      'Keep shoulders down',
      'Pull elbows high',
      'Full contraction',
    ],
  },

  // ========================================================================
  // LEG EXERCISES
  // ========================================================================
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroups: ['legs'],
    primaryMuscle: 'legs',
    equipmentType: 'machine',
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    instructions: '1. Sit in leg press machine\n2. Feet shoulder-width on platform\n3. Release safety handles\n4. Lower platform under control\n5. Press through heels to extend',
    formTips: [
      'Keep lower back against pad',
      'Don\'t let knees cave in',
      'Full extension without locking',
      'Control the descent',
      'Breathe throughout movement',
    ],
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    muscleGroups: ['legs'],
    primaryMuscle: 'legs',
    equipmentType: 'machine',
    videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
    instructions: '1. Sit with back against pad\n2. Ankles behind lower pad\n3. Extend legs to full extension\n4. Squeeze quads at top\n5. Lower under control',
    formTips: [
      'Adjust pad to fit your legs',
      'Full extension and contraction',
      'Don\'t swing the weight',
      'Grip handles for stability',
    ],
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    muscleGroups: ['legs'],
    primaryMuscle: 'legs',
    equipmentType: 'machine',
    videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
    instructions: '1. Sit with back against pad\n2. Ankles above upper pad\n3. Curl pad down toward butt\n4. Squeeze hamstrings\n5. Return under control',
    formTips: [
      'Keep thighs stable',
      'Full curl at bottom',
      'Don\'t let weight slam',
      'Focus on hamstrings',
    ],
  },

  // ========================================================================
  // SHOULDER EXERCISES
  // ========================================================================
  {
    id: 'shoulder-press',
    name: 'Dumbbell Shoulder Press',
    muscleGroups: ['shoulders', 'triceps'],
    primaryMuscle: 'shoulders',
    equipmentType: 'dumbbell',
    videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
    instructions: '1. Sit with back support\n2. Dumbbells at shoulder height\n3. Press straight up overhead\n4. Touch dumbbells at top\n5. Lower to shoulders',
    formTips: [
      'Keep core tight',
      'Don\'t arch back excessively',
      'Full extension overhead',
      'Control the descent',
      'Keep wrists straight',
    ],
  },
  {
    id: 'dumbbell-lateral-raise',
    name: 'Dumbbell Side Lateral Raise',
    muscleGroups: ['shoulders'],
    primaryMuscle: 'shoulders',
    equipmentType: 'dumbbell',
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    instructions: '1. Stand with dumbbells at sides\n2. Slight bend in elbows\n3. Raise out to sides to shoulder height\n4. Pause at top\n5. Lower slowly',
    formTips: [
      'Lead with elbows, not hands',
      'Don\'t go above shoulder height',
      'Slight forward tilt of dumbbells',
      'No swinging or momentum',
    ],
  },
  {
    id: 'rear-delt-fly',
    name: 'Dumbbell Rear Delt Fly',
    muscleGroups: ['shoulders', 'back'],
    primaryMuscle: 'shoulders',
    equipmentType: 'dumbbell',
    videoUrl: 'https://www.youtube.com/watch?v=EA7u4Q_8HQ0',
    instructions: '1. Bend forward at hips\n2. Dumbbells hanging down\n3. Raise out to sides\n4. Squeeze shoulder blades\n5. Lower slowly',
    formTips: [
      'Keep back flat',
      'Target rear delts',
      'Don\'t swing',
      'Controlled movement',
    ],
  },

  // ========================================================================
  // ARM EXERCISES
  // ========================================================================
  {
    id: 'bicep-cable-curl',
    name: 'Bicep Cable Curl',
    muscleGroups: ['biceps'],
    primaryMuscle: 'biceps',
    equipmentType: 'cable',
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    instructions: '1. Stand facing cable machine\n2. Grip bar with underhand grip\n3. Curl up to shoulders\n4. Squeeze biceps at top\n5. Lower under control',
    formTips: [
      'Keep elbows stationary',
      'Don\'t swing body',
      'Full extension at bottom',
      'Squeeze at contraction',
    ],
  },
  {
    id: 'alternating-dumbbell-curl',
    name: 'Alternating Dumbbell Curls',
    muscleGroups: ['biceps'],
    primaryMuscle: 'biceps',
    equipmentType: 'dumbbell',
    videoUrl: 'https://www.youtube.com/watch?v=sAq_ocpRh_I',
    instructions: '1. Stand with dumbbells at sides\n2. Curl one arm up\n3. Rotate palm up during curl\n4. Lower and repeat other side\n5. Alternate arms',
    formTips: [
      'Keep core stable',
      'No body English',
      'Full supination at top',
      'Control both directions',
    ],
  },
  {
    id: 'tricep-pushdown',
    name: 'Triceps Pushdown - Straight Bar',
    muscleGroups: ['triceps'],
    primaryMuscle: 'triceps',
    equipmentType: 'cable',
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
    instructions: '1. Stand facing cable\n2. Grip bar with overhand grip\n3. Keep elbows at sides\n4. Push down to full extension\n5. Return to start',
    formTips: [
      'Keep elbows tucked',
      'Don\'t lean forward',
      'Full extension at bottom',
      'Squeeze triceps',
    ],
  },
  {
    id: 'tricep-overhead-extension',
    name: 'Tricep Overhead Rope Extension',
    muscleGroups: ['triceps'],
    primaryMuscle: 'triceps',
    equipmentType: 'cable',
    videoUrl: 'https://www.youtube.com/watch?v=bO5JRJEaJqk',
    instructions: '1. Face away from cable\n2. Hold rope overhead\n3. Extend arms forward\n4. Keep elbows high\n5. Return behind head',
    formTips: [
      'Keep elbows stationary',
      'Full extension',
      'Don\'t let elbows flare',
      'Stretch position safe',
    ],
  },
];

// Exercise variants (alternatives)
export const exerciseVariants: ExerciseVariant[] = [
  {
    id: 'machine-press-variant',
    primaryExerciseId: 'bench-press',
    name: 'Machine Chest Press',
    equipmentType: 'machine',
    videoUrl: 'https://www.youtube.com/watch?v=xUm0BiZCWlQ',
    instructions: 'Alternative to bench press using chest press machine',
    equivalenceRatio: 0.85, // Machine press ≈ 85% of barbell bench
  },
  {
    id: 'dumbbell-incline-variant',
    primaryExerciseId: 'bench-press',
    name: 'Dumbbell Incline Press',
    equipmentType: 'dumbbell',
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
    instructions: 'Alternative to bench press using incline dumbbells',
    equivalenceRatio: 0.60, // Each dumbbell ≈ 30% of barbell total
  },
  {
    id: 'prone-leg-curl-variant',
    primaryExerciseId: 'leg-curl',
    name: 'Prone Leg Curl',
    equipmentType: 'machine',
    videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
    instructions: 'Alternative leg curl lying face down',
    equivalenceRatio: 1.0, // Same equivalence
  },
  {
    id: 'ez-bar-curl-variant',
    primaryExerciseId: 'bicep-cable-curl',
    name: 'EZ Bar Bicep Curl',
    equipmentType: 'barbell',
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    instructions: 'Alternative using EZ curl bar',
    equivalenceRatio: 0.90, // Slightly less than straight bar
  },
];

// Helper to get exercise by ID
export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find(e => e.id === id);
};

// Helper to get variants for an exercise
export const getExerciseVariants = (exerciseId: string): ExerciseVariant[] => {
  return exerciseVariants.filter(v => v.primaryExerciseId === exerciseId);
};

// Exercise IDs organized by muscle group
export const exercisesByMuscleGroup = {
  chest: ['bench-press', 'dumbbell-incline-press', 'machine-press', 'dumbbell-chest-fly'],
  back: ['lat-pulldown', 'machine-low-row', 'machine-high-row'],
  legs: ['leg-press', 'leg-extension', 'leg-curl'],
  shoulders: ['shoulder-press', 'dumbbell-lateral-raise', 'rear-delt-fly'],
  biceps: ['bicep-cable-curl', 'alternating-dumbbell-curl'],
  triceps: ['tricep-pushdown', 'tricep-overhead-extension'],
};

// Helper to get formatted instructions for ExerciseInstructionCard
export const getExerciseInstructions = (exerciseId: string) => {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return null;

  // Parse instructions into setup steps
  const setupSteps = exercise.instructions
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^\d+\.\s*/, ''));

  return {
    exerciseName: exercise.name,
    targetMuscles: exercise.muscleGroups,
    setupSteps,
    executionCues: exercise.formTips || [],
  };
};

export default exercises;
