# Formula Implementation Guide for Asa B 2020 Workout Program

## Introduction
This guide provides specific formula examples extracted from the Excel workbook and their practical implementation in code.

## 1. Max Determination Week

### Purpose
Establish baseline 1-rep max (1RM) for each exercise at program start.

### Exercises to Test
1. Dumbbell Incline Chest Press
2. Lat Pull Down
3. Machine Low Row
4. Machine High Row
5. Leg Press
6. Leg Extension
7. Leg Curl
8. Dumbbell Shoulder Press
9. Alternating Dumbbell Curls

### Formula Pattern
```excel
Row 1: Base Weight (user input)
Row 2: =B1+5
Row 3: =B2+5
Row 4: =B3+5
... continues
```

### Implementation
```typescript
function generateMaxDeterminationSets(startingWeight: number, numberOfSets: number = 10): number[] {
  const weights: number[] = [startingWeight];
  
  for (let i = 1; i < numberOfSets; i++) {
    weights.push(weights[i - 1] + 5);
  }
  
  return weights;
}

// Example usage:
const sets = generateMaxDeterminationSets(45, 10);
// Result: [45, 50, 55, 60, 65, 70, 75, 80, 85, 90]
```

### Max Determination Logic
User continues adding weight until they fail a 1-rep attempt. The last successful weight becomes their 1RM for that exercise.

---

## 2. Weight Calculation Formulas

### Percentage-Based Loading
All workout weights are calculated as percentages of 1RM, rounded to nearest 5 lbs.

### Formula Structure
```excel
=MROUND([1RM_CELL] * [PERCENTAGE], 5)
```

### Percentage Hierarchy

#### Warm-up Phase (10-35%)
```excel
Cell B22: =IF('WEEK 1 '!B20<125, 45, MROUND('WEEK 1 '!B20*0.35, 5))
```
**Logic**: 
- If 1RM < 125 lbs, use 45 lbs (empty barbell)
- Otherwise, use 35% of 1RM
- Round to nearest 5 lbs

**Implementation**:
```typescript
function calculateWarmupWeight(oneRepMax: number): number {
  if (oneRepMax < 125) {
    return 45;
  }
  return roundToNearest5(oneRepMax * 0.35);
}

function roundToNearest5(weight: number): number {
  return Math.round(weight / 5) * 5;
}
```

#### Working Sets (65-90%)
```excel
Set 2: =MROUND('WEEK 1 '!B20*0.80, 5)  // 80% - Medium intensity
Set 3: =MROUND('WEEK 1 '!B20*0.90, 5)  // 90% - High intensity
```

**All Percentages Found**:
- 10% - Very light warm-up
- 15% - Light warm-up
- 20% - Light warm-up
- 29% - Specific warm-up
- 35% - Standard warm-up
- 50% - Moderate
- 65% - Working weight (alternate exercises)
- 70% - Working weight
- 75% - Heavy working weight
- 78% - Heavy working weight
- 80% - Heavy working weight (primary)
- 85% - Very heavy
- 90% - Peak intensity
- 95% - Near-max
- 100% - Max attempt
- 105% - Over-max attempt
- 200% - Special leg exercises (2× bodyweight target)

**Implementation**:
```typescript
const INTENSITY_PERCENTAGES = {
  WARMUP_LIGHT: 0.35,
  WARMUP_MODERATE: 0.50,
  WORKING_LIGHT: 0.65,
  WORKING_MEDIUM: 0.80,
  WORKING_HEAVY: 0.90,
  NEAR_MAX: 0.95,
  MAX: 1.0,
  OVER_MAX: 1.05
};

function calculateSetWeight(oneRepMax: number, intensityPercentage: number): number {
  if (intensityPercentage <= 0.35 && oneRepMax < 125) {
    return 45;
  }
  return roundToNearest5(oneRepMax * intensityPercentage);
}
```

---

## 3. Progression Logic

### Type 1: 1RM Progression (Max Attempts)

#### Excel Formula
```excel
Cell B25: ='WEEK 1 '!B20              // Attempt current max
Cell A26: =IF('WEEK 1 '!F25<1, "PROCEED TO DOWN SETS", "NEW 1 REP MAX ATTEMPT")
Cell B27: =IF('WEEK 1 '!F25<1, "", B25+5)  // Add 5 lbs if successful
```

**Logic Flow**:
1. Attempt current 1RM (Cell B25)
2. User logs reps in F25
3. If reps < 1 (failed): Show "PROCEED TO DOWN SETS"
4. If reps >= 1 (success): Show "NEW 1 REP MAX ATTEMPT" and add 5 lbs

**Implementation**:
```typescript
interface MaxAttemptResult {
  success: boolean;
  newMax?: number;
  instruction: string;
}

function evaluateMaxAttempt(
  currentMax: number,
  repsCompleted: number
): MaxAttemptResult {
  if (repsCompleted < 1) {
    return {
      success: false,
      instruction: "PROCEED TO DOWN SETS"
    };
  }
  
  return {
    success: true,
    newMax: currentMax + 5,
    instruction: "NEW 1 REP MAX ATTEMPT"
  };
}
```

### Type 2: Rep-Based Progression (4RM Attempts)

#### Excel Formula
```excel
Cell O26: =IF(OR(ISBLANK('WEEK 1 '!T25), ISBLANK('WEEK 1 '!T24), ISBLANK('WEEK 1 '!T23)), 
              "PROCEED TO DOWNSETS",
              IF('WEEK 1 '!T25>=6, "NEW 4 REP MAX ATTEMPT", "PROCEED TO DOWNSETS"))
              
Cell P27: =IF(OR(ISBLANK('WEEK 1 '!T25), ISBLANK('WEEK 1 '!T24), ISBLANK('WEEK 1 '!T23)), 
              "",
              IF('WEEK 1 '!T25>=6, 'WEEK 1 '!P20+5, ""))
```

**Logic Flow**:
1. Verify all previous sets are completed (not blank)
2. Check if user achieved ≥6 reps on target set
3. If yes: New max = old max + 5 lbs
4. If no: Proceed to down sets

**Implementation**:
```typescript
function evaluateRepBasedProgression(
  currentMax: number,
  targetReps: number,
  achievedReps: number,
  previousSetsComplete: boolean
): MaxAttemptResult {
  if (!previousSetsComplete) {
    return {
      success: false,
      instruction: "COMPLETE PREVIOUS SETS FIRST"
    };
  }
  
  // For 4-rep max attempts, 6+ reps indicates ready for progression
  const progressionThreshold = targetReps + 2;
  
  if (achievedReps >= progressionThreshold) {
    return {
      success: true,
      newMax: currentMax + 5,
      instruction: "NEW REP MAX ATTEMPT"
    };
  }
  
  return {
    success: false,
    instruction: "PROCEED TO DOWN SETS"
  };
}
```

### Type 3: Multiple Max Attempts

#### Excel Formula
```excel
Cell B28: =IF('WEEK 1 '!F27<1, "", B27+5)  // Second attempt if first succeeds
```

**Logic**: If user successfully completes first new max attempt, offer second attempt at +5 lbs more.

**Implementation**:
```typescript
function generateProgressivMaxAttempts(
  baseMax: number,
  maxAttempts: number = 3
): WorkoutSet[] {
  const sets: WorkoutSet[] = [];
  
  for (let i = 0; i < maxAttempts; i++) {
    sets.push({
      setNumber: i + 5,  // Sets 5, 6, 7
      weight: baseMax + (i * 5),
      targetReps: 1,
      restPeriod: "1-5 MIN",
      isConditional: i > 0,  // Sets 6 and 7 only show if previous successful
      condition: (completedSets) => {
        const previousSet = completedSets[completedSets.length - 1];
        return previousSet && previousSet.reps >= 1;
      }
    });
  }
  
  return sets;
}
```

---

## 4. Down Sets (Back-off Sets)

### Purpose
Volume work after max attempts, for hypertrophy and work capacity.

### Formula Pattern
```excel
Cell A30: =IF(OR(ISBLANK('WEEK 1 '!F25), ISBLANK('WEEK 1 '!F24), ISBLANK('WEEK 1 '!F23)),
              "", "5")  // Set number
              
Cell B30: =IF(OR(ISBLANK('WEEK 1 '!F25), ISBLANK('WEEK 1 '!F24), ISBLANK('WEEK 1 '!F23)),
              "", MROUND('WEEK 1 '!B20*0.80, 5))  // 80% weight
              
Cell C30: =IF(OR(ISBLANK('WEEK 1 '!F25), ISBLANK('WEEK 1 '!F24), ISBLANK('WEEK 1 '!F23)),
              "", "6-8")  // Rep range
```

**Logic**:
- Only show after completing all working sets (sets 2, 3, 4)
- Use 80-90% of 1RM
- Higher rep ranges (6-8 or "REP OUT")

**Implementation**:
```typescript
interface DownSet {
  setNumber: number;
  weight: number;
  repRange: string;
  restPeriod: string;
}

function generateDownSets(
  oneRepMax: number,
  workingSetsCompleted: boolean
): DownSet[] {
  if (!workingSetsCompleted) {
    return [];
  }
  
  return [
    {
      setNumber: 5,
      weight: roundToNearest5(oneRepMax * 0.80),
      repRange: "6-8",
      restPeriod: "1-2 MIN"
    },
    {
      setNumber: 6,
      weight: roundToNearest5(oneRepMax * 0.80),
      repRange: "6-8",
      restPeriod: "1-2 MIN"
    },
    {
      setNumber: 7,
      weight: roundToNearest5(oneRepMax * 0.80),
      repRange: "REP OUT",  // To technical failure
      restPeriod: "COMPLETE"
    }
  ];
}
```

---

## 5. Rest Period Logic

### Standard Assignments
- **30 seconds**: Light warm-up sets (35% or less)
- **1-2 minutes**: Moderate working sets (65-80%)
- **1-5 minutes**: Heavy sets and max attempts (90-100%+)
- **REP OUT**: Final set to failure

### Implementation
```typescript
function determineRestPeriod(intensity: number, isMaxAttempt: boolean): string {
  if (intensity <= 0.35) {
    return "30s";
  }
  
  if (isMaxAttempt || intensity >= 0.90) {
    return "1-5 MIN";
  }
  
  if (intensity >= 0.65) {
    return "1-2 MIN";
  }
  
  return "1 MIN";
}
```

---

## 6. Conditional Set Display

### Purpose
Progressive disclosure - only show next set after completing previous sets.

### Formula Pattern
```excel
=IF([PREVIOUS_SET_REPS] < [THRESHOLD], "", [SET_VALUE])
```

### Implementation
```typescript
interface WorkoutSet {
  setNumber: number;
  weight: number;
  targetReps: number | string;
  restPeriod: string;
  isConditional: boolean;
  condition?: (completedSets: CompletedSet[]) => boolean;
}

function shouldDisplaySet(
  set: WorkoutSet,
  completedSets: CompletedSet[]
): boolean {
  if (!set.isConditional) {
    return true;
  }
  
  if (set.condition) {
    return set.condition(completedSets);
  }
  
  // Default: show if all previous sets are completed
  const requiredCompletedSets = set.setNumber - 1;
  return completedSets.length >= requiredCompletedSets;
}
```

---

## 7. Complete Exercise Structure

### Typical Pyramid Scheme (1RM Focus)

```typescript
function generateExerciseSets(
  exercise: Exercise,
  userMax: number
): WorkoutSet[] {
  return [
    // Warm-up
    {
      setNumber: 1,
      weight: calculateWarmupWeight(userMax),
      targetReps: 6,
      restPeriod: "30s",
      isConditional: false
    },
    // Build-up sets
    {
      setNumber: 2,
      weight: roundToNearest5(userMax * 0.80),
      targetReps: 1,
      restPeriod: "1-2 MIN",
      isConditional: false
    },
    {
      setNumber: 3,
      weight: roundToNearest5(userMax * 0.90),
      targetReps: 1,
      restPeriod: "1-2 MIN",
      isConditional: false
    },
    // Max attempt
    {
      setNumber: 4,
      weight: userMax,
      targetReps: 1,
      restPeriod: "1-5 MIN",
      isConditional: false
    },
    // Progressive max attempts (conditional)
    {
      setNumber: 5,
      weight: userMax + 5,
      targetReps: 1,
      restPeriod: "1-5 MIN",
      isConditional: true,
      condition: (completed) => {
        const set4 = completed.find(s => s.setNumber === 4);
        return set4 && set4.reps >= 1;
      }
    },
    {
      setNumber: 6,
      weight: userMax + 10,
      targetReps: 1,
      restPeriod: "1-5 MIN",
      isConditional: true,
      condition: (completed) => {
        const set5 = completed.find(s => s.setNumber === 5);
        return set5 && set5.reps >= 1;
      }
    }
    // Down sets would be added based on max attempt results
  ];
}
```

---

## 8. Week-to-Week Progression

### How 1RM Updates

#### Excel Reference
```excel
Cell B20 (Week 2): ='Week 1 MASTER SHEET'!B25  // References last successful max from Week 1
```

**Logic**:
1. Week 1: User attempts maxes, logs reps
2. Week 1 Master formulas calculate if progression occurred
3. Week 2: References Week 1's final successful weight
4. Process repeats for 48 weeks

**Implementation**:
```typescript
function calculateNextWeekMax(
  currentWeekMax: number,
  maxAttemptResults: CompletedSet[]
): number {
  // Find highest successful weight (where reps >= 1)
  const successfulSets = maxAttemptResults
    .filter(set => set.reps >= 1)
    .sort((a, b) => b.weight - a.weight);
  
  if (successfulSets.length > 0) {
    // New max is highest successful weight
    return successfulSets[0].weight;
  }
  
  // No progression - maintain current max
  return currentWeekMax;
}
```

---

## 9. Sample Complete Implementation

```typescript
class WorkoutEngine {
  private userMaxes: Map<string, number> = new Map();
  
  generateWorkout(weekNumber: number, dayNumber: number): Workout {
    const exercises = this.getExercisesForDay(dayNumber);
    
    return {
      weekNumber,
      dayNumber,
      exercises: exercises.map(ex => ({
        exercise: ex,
        sets: this.generateSetsForExercise(ex),
        currentMax: this.userMaxes.get(ex.id) || 0
      }))
    };
  }
  
  generateSetsForExercise(exercise: Exercise): WorkoutSet[] {
    const userMax = this.userMaxes.get(exercise.id) || 0;
    
    // Generate standard pyramid
    const sets: WorkoutSet[] = [
      this.createSet(1, this.calculateWarmupWeight(userMax), 6, "30s", false),
      this.createSet(2, userMax * 0.80, 1, "1-2 MIN", false),
      this.createSet(3, userMax * 0.90, 1, "1-2 MIN", false),
      this.createSet(4, userMax, 1, "1-5 MIN", false),
      this.createSet(5, userMax + 5, 1, "1-5 MIN", true),
      this.createSet(6, userMax + 10, 1, "1-5 MIN", true)
    ];
    
    return sets;
  }
  
  processWorkoutCompletion(
    exerciseId: string,
    completedSets: CompletedSet[]
  ): void {
    const currentMax = this.userMaxes.get(exerciseId) || 0;
    const newMax = this.calculateNextWeekMax(currentMax, completedSets);
    
    if (newMax > currentMax) {
      this.userMaxes.set(exerciseId, newMax);
      console.log(`New ${exerciseId} max: ${newMax} lbs (+${newMax - currentMax})`);
    }
  }
  
  private createSet(
    setNumber: number,
    weight: number,
    reps: number,
    rest: string,
    conditional: boolean
  ): WorkoutSet {
    return {
      setNumber,
      weight: this.roundToNearest5(weight),
      targetReps: reps,
      restPeriod: rest,
      isConditional: conditional
    };
  }
  
  private calculateWarmupWeight(oneRepMax: number): number {
    return oneRepMax < 125 ? 45 : this.roundToNearest5(oneRepMax * 0.35);
  }
  
  private roundToNearest5(weight: number): number {
    return Math.round(weight / 5) * 5;
  }
  
  private calculateNextWeekMax(
    currentMax: number,
    completedSets: CompletedSet[]
  ): number {
    const successfulSets = completedSets
      .filter(set => set.reps >= 1)
      .sort((a, b) => b.weight - a.weight);
    
    return successfulSets.length > 0 ? successfulSets[0].weight : currentMax;
  }
}
```

---

## Summary

### Core Formulas
1. **Weight Calculation**: `MROUND(1RM × percentage, 5)`
2. **Progression**: `IF(reps >= target, current + 5, current)`
3. **Conditional Display**: `IF(previous_complete, show_value, "")`
4. **Down Sets**: `IF(all_working_complete, 80% × 6-8 reps, "")`

### Key Principles
- All weights round to nearest 5 lbs
- Progression is +5 lbs per successful attempt
- Sets display progressively based on completion
- Rest scales with intensity
- Failures redirect to volume work (down sets)

### Integration Points
- Pull 1RM from Max Determination Week
- Track completed sets to determine progression
- Update 1RM values for next week
- Store historical data for analytics
