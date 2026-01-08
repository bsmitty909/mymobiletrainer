# Asa B 2020 Workout Plan - Formula and Logic Extraction

## Overview
This document details the formulas and logic extracted from the Asa B 2020.xlsx workout program. The program is a year-long (48 weeks) structured training plan with progressive overload principles.

## Workbook Structure

### Sheet Organization
- **Total Sheets**: 107
- **Week Sheets**: 48 weeks (WEEK 1 through WEEK 48)
- **Master Sheets**: Corresponding MSW (Master Sheet Week) sheets for most weeks
- **Special Sheets**:
  - `DETERMINING MAX WEEK`: Initial assessment for 1RM (one-rep max) calculations
  - `WORK ANALYTICS`: Tracking and progress analytics
  - `Weight Log`: User weight tracking
  - `Pre Workout 1` & `Pre Workout 2`: Pre-program preparation workouts
  - `90 DAY PROGRESS`: Quarterly progress review

### Program Structure
- **Duration**: 48 weeks (full year)
- **Days Per Week**: 3 training days
- **Workout Types**:
  - Day 1: Chest & Back
  - Day 2: Legs
  - Day 3: Shoulders & Arms

## Key Formula Types Identified

### 1. Weight Calculation Formulas
Weight calculations use percentage-based loading relative to 1RM:

```excel
=MROUND([1RM] * [percentage], 5)
```

**Common Percentages Used**:
- **35%**: Warm-up sets
- **65%**: Light working sets
- **80%**: Heavy working sets
- **85%**: Near-max sets
- **90%**: High-intensity sets
- **93%**: Peak intensity sets
- **100%**: Max attempt sets

**Special Logic**:
```excel
=IF([1RM] < 125, 45, MROUND([1RM] * 0.35, 5))
```
- For users with 1RM below 125 lbs, uses fixed 45 lbs (empty barbell)
- Rounds to nearest 5 lbs for practical loading

### 2. Progression Logic
Progressive overload is achieved through:

**A. Weight Progression**:
```excel
=IF([rep_log] >= 1, [current_weight] + 5, "")
```
- If user successfully completes max attempt, add 5 lbs
- This creates new 1RM for subsequent weeks

**B. Set Progression**:
```excel
=IF([rep_log] < 1, "PROCEED TO DOWN SETS", "NEW 1 REP MAX ATTEMPT")
```
- Success → Attempt new max (+5 lbs)
- Failure → Move to down sets (back-off sets for volume)

**C. Rep-Based Progression**:
```excel
=IF([rep_log] >= 6, [current_weight] + 5, "")
```
- For rep-out sets (e.g., 4-rep max attempts)
- If ≥6 reps achieved, increase weight

### 3. Set Scheme Formulas

**Standard Pyramid Structure**:
```
Set 1: 35% × 6 reps (warm-up)
Set 2: 80% × 1 rep (primer)
Set 3: 90% × 1 rep (build-up)
Set 4: 100% × 1 rep (max attempt)
Set 5 (conditional): 100% + 5 lbs × 1 rep (new max attempt)
Set 6 (conditional): 100% + 10 lbs × 1 rep (second new max)
```

**Down Sets (if max attempt fails)**:
```excel
=IF(OR(ISBLANK([set4_reps]), ISBLANK([set3_reps]), ISBLANK([set2_reps])), 
    [set_number], "")
```
- Only shown if previous working sets are completed
- Typically 80-90% for higher rep work (6-8 reps)

### 4. Conditional Display Logic

**Progressive Disclosure**:
```excel
=IF([previous_set_complete] < 1, "", [next_set_value])
```
- Sets only appear after previous set is logged
- Prevents user from jumping ahead

**Alternate Workout Logic**:
Multiple exercise options provided for same muscle group with similar loading schemes.

### 5. Rest Period Prescriptions

**Standard Rest Intervals**:
- **30 seconds**: Light warm-up sets
- **1-2 minutes**: Moderate intensity sets (65-80%)
- **1-5 minutes**: Heavy sets and max attempts (90-100%+)
- **REP OUT**: Continue until technical failure for final down sets

## Max Determination Week Logic

### Purpose
Establish baseline 1RM for each major lift at program start.

### Progression Pattern
```excel
Set 1: [Base Weight]
Set 2: =[Previous] + 5
Set 3: =[Previous] + 5
... continues with +5 lb increments
```

### Exercises Tested
1. Dumbbell Incline Chest Press
2. Lat Pull Down
3. Machine Low Row
4. Machine High Row
5. Leg Press
6. Leg Extension
7. Leg Curl
8. Dumbbell Shoulder Press
9. Alternating Dumbbell Curls

### Usage in Program
```excel
='DETERMINING MAX WEEK'!E31
```
- Max values referenced throughout all week sheets
- Serves as anchor for percentage calculations

## Week-to-Week Progression

### Master Sheet Function
Each "Master Sheet" contains:
- Exercise selection for the week
- Formula templates
- Reference links to video demonstrations

### Actual Week Sheets
- User logs their completed reps in green-highlighted cells
- Formulas auto-calculate next week's weights based on performance
- Progression happens automatically

### Typical Weekly Flow
1. **Week Start**: Load prescribed weights (calculated from previous week's performance)
2. **During Workout**: Log reps completed
3. **Week End**: Formulas calculate if progression occurred
4. **Next Week**: New weights auto-populated based on logged performance

## Analytics and Tracking

### Work Analytics Sheet
Tracks cumulative metrics:
- Total volume (sets × reps × weight)
- Progressive overload trends
- Workout completion rates
- Performance by muscle group

### Formulas Used
Complex aggregation formulas pulling data from all 48 week sheets:
```excel
=SUM([all_weekly_volume_for_exercise])
```

## Key Principles Identified

### 1. Progressive Overload
- Primary mechanism: Adding 5 lbs when target reps achieved
- Secondary: Increasing reps at same weight
- Tertiary: Reducing rest periods

### 2. Auto-Regulation
- If max attempt fails, program pivots to volume work (down sets)
- User decides when to attempt new max based on readiness
- Flexible alternate exercises provided

### 3. Periodization
- 48-week structure allows for multiple training blocks
- Intensity waves through percentage manipulation
- Deload weeks likely programmed at intervals (not fully analyzed)

### 4. Evidence-Based Loading
- Percentage-based training well-established in literature
- 80-90% range for strength development
- Volume work (down sets) for hypertrophy
- Strategic use of RPE (Rate of Perceived Exertion) through rep-out sets

## Implementation Considerations for App

### Data Structure Needs
```typescript
interface Exercise {
  id: string;
  name: string;
  videoUrl: string;
  current1RM: number;
  alternateExercises?: Exercise[];
}

interface WorkoutSet {
  setNumber: number;
  weightPercentage: number;
  targetReps: number;
  restPeriod: string; // "30s", "1-2 MIN", "1-5 MIN", "REP OUT"
  isConditional: boolean;
  condition?: (previousSets: CompletedSet[]) => boolean;
}

interface WeekPlan {
  weekNumber: number;
  days: DayPlan[];
}

interface DayPlan {
  dayNumber: number;
  exercises: ExercisePlan[];
}

interface ExercisePlan {
  exercise: Exercise;
  sets: WorkoutSet[];
  progressionRule: (completedSets: CompletedSet[]) => number; // Returns new 1RM
}
```

### Formula Implementation Examples

**Weight Calculation**:
```typescript
function calculateWeight(oneRepMax: number, percentage: number): number {
  // Handle beginners
  if (oneRepMax < 125 && percentage < 0.5) {
    return 45; // Empty barbell
  }
  
  // Round to nearest 5 lbs
  return Math.round((oneRepMax * percentage) / 5) * 5;
}
```

**Progression Logic**:
```typescript
function calculateNewMax(
  currentMax: number, 
  targetReps: number, 
  achievedReps: number
): number {
  // Standard 1RM progression
  if (targetReps === 1 && achievedReps >= 1) {
    return currentMax + 5;
  }
  
  // Rep-based progression (e.g., 4-rep max)
  if (targetReps <= 4 && achievedReps >= 6) {
    return currentMax + 5;
  }
  
  // No progression
  return currentMax;
}
```

**Conditional Set Display**:
```typescript
function shouldShowSet(
  setConfig: WorkoutSet, 
  completedSets: CompletedSet[]
): boolean {
  if (!setConfig.isConditional) {
    return true;
  }
  
  // Check if all previous working sets are completed
  const requiredSets = setConfig.setNumber - 1;
  const completedCount = completedSets.filter(s => s.reps > 0).length;
  
  return completedCount >= requiredSets;
}
```

## Summary

The Asa B 2020 program is a sophisticated, formula-driven training system that:
- Uses percentage-based loading for precision
- Implements progressive overload through weight and rep progression
- Auto-regulates based on user performance
- Tracks long-term progress through analytics
- Provides structured progression over 48 weeks

The formulas are designed to be reproducible in a mobile app context, with clear logic for weight calculation, set progression, and adaptive programming based on user performance.
