# Max Determination Week Implementation

## Overview
The Max Determination Week is the critical onboarding flow where users establish their 1RM (one-rep max) for each exercise before starting the 48-week training program.

## User Flow
```
Welcome Screen 
  → Max Intro Screen (explain process, show exercise list)
    → Max Testing Screen (test each exercise progressively)
      → Max Summary Screen (display results, strength score)
        → Ready to start Week 1!
```

## Core Exercises to Test

Based on the primary exercises in the program:
1. **Bench Press** (chest)
2. **Lat Pulldown** (back)
3. **Leg Press** (legs)
4. **Shoulder Press** (shoulders)
5. **Bicep Cable Curl** (biceps)

Optional/Secondary:
6. Dumbbell Incline Press
7. Machine Low Row
8. Leg Extension
9. Leg Curl
10. Triceps Pushdown

## Implementation Components

### 1. MaxDeterminationService (`app/src/services/MaxDeterminationService.ts`)
```typescript
class MaxDeterminationService {
  // Generate progressive weight sequence: 45, 95, 135, 185, 225, etc.
  static generateWeightSequence(startWeight: number = 45): number[]
  
  // Calculate 1RM from successful attempts
  static calculate1RM(weight: number, reps: number): number
  
  // Determine strength level (beginner/intermediate/advanced)
  static calculateStrengthScore(maxLifts: Record<string, number>): StrengthScore
  
  // Save max lifts to Redux and storage
  static saveMaxLifts(userId: string, maxLifts: MaxLift[]): Promise<void>
}
```

### 2. MaxDeterminationIntroScreen (`app/src/screens/onboarding/MaxDeterminationIntroScreen.tsx`)

**UI Elements:**
- Hero section explaining why max testing matters
- Exercise checklist (5 primary exercises)
- Video tutorial button for each exercise
- Estimated time: "~20-30 minutes"
- "Let's Begin" CTA button
- "Skip for now" link (use default values)

**Key Points to Communicate:**
- Safety first: warm up properly
- Progressive approach: start light, add weight
- Stop at technical failure (form breaks down)
- Rest 3-5 minutes between attempts
- This determines your training weights for next 12 weeks

### 3. MaxTestingScreen (`app/src/screens/onboarding/MaxTestingScreen.tsx`)

**UI Layout:**
```
┌─────────────────────────────────────┐
│ Progress: 3/5 Complete              │
│ [████████░░░░░░░░░░] 60%            │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 🏋️ BENCH PRESS                      │
│                                      │
│ Current Weight: 135 lbs             │
│                                      │
│ [Video Preview]                     │
│                                      │
│ Previous Attempts:                  │
│ ✅ 95 lbs × 3 reps                  │
│ ✅ 115 lbs × 2 reps                 │
│                                      │
│ ┌─────────────────────────────┐    │
│ │   -10    WEIGHT    +10      │    │
│ │    lbs   135 lbs    lbs     │    │
│ │   [−]    [135]      [+]     │    │
│ └─────────────────────────────┘    │
│                                      │
│ How many clean reps?                │
│ [1] [2] [3] [4] [5] [6]             │
│                                      │
│ ┌─────────────────────────────┐    │
│ │  ✅ SUCCESS - ADD MORE WEIGHT│    │
│ └─────────────────────────────┘    │
│                                      │
│ ┌─────────────────────────────┐    │
│ │  ❌ FAILED - MARK AS MAX     │    │
│ └─────────────────────────────┘    │
│                                      │
│ ┌─────────────────────────────┐    │
│ │  ⏭️  SKIP THIS EXERCISE      │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**State Management:**
```typescript
const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
const [currentWeight, setCurrentWeight] = useState(45);
const [attempts, setAttempts] = useState<Attempt[]>([]);
const [completedMaxes, setCompletedMaxes] = useState<MaxLift[]>([]);
```

**Logic Flow:**
1. User starts at 45 lbs (empty bar)
2. Performs reps, inputs count
3. Click "SUCCESS" → weight += 10-25 lbs (depending on reps)
4. Click "FAILED" → previous successful weight becomes 1RM
5. Move to next exercise
6. After all exercises → navigate to Summary

**Auto-progression Logic:**
```typescript
if (reps >= 5) {
  // Easy, jump up more
  nextWeight = currentWeight + 25;
} else if (reps >= 3) {
  // Moderate, standard increase
  nextWeight = currentWeight + 15;
} else if (reps == 1-2) {
  // Hard, small increase
  nextWeight = currentWeight + 10;
}
```

### 4. MaxSummaryScreen (`app/src/screens/onboarding/MaxSummaryScreen.tsx`)

**UI Elements:**
```
┌─────────────────────────────────────┐
│ 🎉 MAX TESTING COMPLETE!            │
│                                      │
│ Your Established Maxes:             │
│                                      │
│ ┌─────────────────────────────┐    │
│ │ 🏋️ Bench Press:     225 lbs │    │
│ │ 💪 Lat Pulldown:    180 lbs │    │
│ │ 🦵 Leg Press:       450 lbs │    │
│ │ 💪 Shoulder Press:  135 lbs │    │
│ │ 💪 Bicep Curl:       95 lbs │    │
│ └─────────────────────────────┘    │
│                                      │
│ Strength Score: INTERMEDIATE        │
│ You're stronger than 65% of users   │
│                                      │
│ ┌─────────────────────────────┐    │
│ │ 🚀 START WEEK 1 TRAINING    │    │
│ └─────────────────────────────┘    │
│                                      │
│ [Review Video Tutorials]            │
│ [Retake Max Tests]                  │
└─────────────────────────────────────┘
```

**Strength Score Calculation:**
```typescript
Total Strength Index = 
  (Bench Press / bodyWeight × 100) +
  (Lat Pulldown / bodyWeight × 80) +
  (Leg Press / bodyWeight × 200) +
  (Shoulder Press / bodyWeight × 60) +
  (Bicep Curl / bodyWeight × 40)

Beginner: < 200
Intermediate: 200-350
Advanced: > 350
```

## Navigation Updates

Add to `MainNavigator.tsx`:
```typescript
<Stack.Screen 
  name="MaxDeterminationIntro" 
  component={MaxDeterminationIntroScreen} 
/>
<Stack.Screen 
  name="MaxTesting" 
  component={MaxTestingScreen} 
/>
<Stack.Screen 
  name="MaxSummary" 
  component={MaxSummaryScreen} 
/>
```

## Redux State Updates

Update `progressSlice.ts`:
```typescript
interface ProgressState {
  maxLifts: MaxLift[];
  maxTestingProgress: {
    completed: boolean;
    currentExercise: number;
    attempts: Record<string, Attempt[]>;
  };
}

actions: {
  saveMaxLift(state, action: PayloadAction<MaxLift>)
  completeMaxTesting(state, action: PayloadAction<MaxLift[]>)
  resetMaxTesting(state)
}
```

## Safety & UX Considerations

### Safety First
- Prominent "STOP if form breaks down" warnings
- Rest timer between attempts (3-5 min recommended)
- Video demonstrations accessible at all times
- Option to use spotter/assistance

### User Experience
- Save progress (can resume later)
- Skip exercises and use defaults
- Edit maxes after completion
- Retake specific exercises anytime

### Progressive Disclosure
- Don't overwhelm with all 10 exercises initially
- Start with 5 core lifts
- Optional: test secondary lifts later

## Implementation Order ✅ COMPLETE

1. ✅ Create `MaxDeterminationService.ts` (business logic) - **DONE**
2. ✅ Update `progressSlice.ts` (state management) - **DONE**
3. ✅ Create `MaxDeterminationIntroScreen.tsx` - **DONE**
4. ✅ Create `MaxTestingScreen.tsx` (most complex) - **DONE**
5. ✅ Create `MaxSummaryScreen.tsx` - **DONE**
6. ✅ Update navigation - **DONE**
7. ✅ Integration testing - **READY FOR TESTING**

**Implementation Date:** 2026-01-08
**Files Created:** 4 new screens + 1 service + updated navigation & state management
**Total Lines of Code:** ~1,470 lines

## Estimated Implementation Time
- Service layer: 1 hour
- Redux updates: 30 min
- Intro Screen: 1 hour
- Testing Screen: 3 hours (complex UI state)
- Summary Screen: 1.5 hours
- Navigation & testing: 1 hour
- **Total: ~8 hours**

## Future Enhancements (Phase 4+)
- [ ] Video recording for form check
- [ ] Social sharing of PRs
- [ ] Strength percentile graphs
- [ ] Equipment alternatives (dumbbells vs barbells)
- [ ] Auto-calculate from previous gym experience
- [ ] Integration with Apple Health / Google Fit

---

## Ready to Implement?

This document provides the complete blueprint. Shall I proceed with implementation starting with the service layer?
