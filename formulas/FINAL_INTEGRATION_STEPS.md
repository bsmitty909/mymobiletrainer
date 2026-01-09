# Final Integration Steps - Roadmap to Completion

## Current Status: 80% Complete

**✅ Completed:** 22 files created (2,400+ LOC)  
**⏳ Remaining:** 2 files to update + testing

---

## Remaining Work (6-8 hours)

### Task 1: Update ActiveWorkoutScreen (4-5 hours)

**File:** [`app/src/screens/workout/ActiveWorkoutScreen.tsx`](../app/src/screens/workout/ActiveWorkoutScreen.tsx)

#### Step 1.1: Add Imports (5 min)
```typescript
// Add these imports at the top
import { useState, useEffect } from 'react';
import WorkoutEngineEnhanced from '../../services/WorkoutEngineEnhanced';
import { ConditionalSet, MaxAttemptResult } from '../../types/enhanced';
import ConditionalSetCard from '../../components/workout/ConditionalSetCard';
import MaxAttemptFeedbackModal from '../../components/workout/MaxAttemptFeedbackModal';
import DownSetBanner from '../../components/workout/DownSetBanner';
import IntensityBadge from '../../components/workout/IntensityBadge';
import { initializeConditionalSets, logEnhancedSet, updateVisibleSets, clearMaxAttemptResult, activateDownSets } from '../../store/slices/workoutSliceEnhanced';
```

#### Step 1.2: Add State Variables (10 min)
```typescript
// Add after existing useState declarations
const [conditionalSets, setConditionalSets] = useState<ConditionalSet[]>([]);
const [showMaxFeedback, setShowMaxFeedback] = useState(false);
const [maxAttemptResult, setMaxAttemptResult] = useState<MaxAttemptResult | null>(null);
const [showDownSets, setShowDownSets] = useState(false);
const [downSets, setDownSets] = useState<ConditionalSet[]>([]);

// Get enhanced state from Redux
const enhancedState = useAppSelector((state) => state.workout.enhancedState);
const currentConditionalSets = useAppSelector(
  (state) => state.workout.currentConditionalSets[currentExerciseLog?.exerciseId || ''] || []
);
const visibleSets = useAppSelector(
  (state) => state.workout.visibleSets[currentExerciseLog?.exerciseId || ''] || []
);
```

#### Step 1.3: Initialize Pyramid Sets (15 min)
```typescript
// Add useEffect to generate pyramid sets when exercise changes
useEffect(() => {
  if (currentExerciseLog) {
    const exerciseId = currentExerciseLog.exerciseId;
    
    // Get user's 1RM for this exercise (from Redux or default)
    const userMaxes = {}; // TODO: Get from state.progress.maxLifts
    const userMax = userMaxes[exerciseId]?.weight || 100; // Default 100 lbs
    
    // Generate pyramid sets
    const sets = WorkoutEngineEnhanced.generateWorkoutSets(
      exerciseId,
      userMax,
      currentExerciseLog.sets,
      {
        includeProgressiveMaxAttempts: true,
        includeDownSets: false // Will be dynamic
      }
    );
    
    // Dispatch to Redux
    dispatch(initializeConditionalSets({ exerciseId, sets }));
  }
}, [currentExerciseLog?.id]);
```

#### Step 1.4: Update handleLogSet (30 min)
```typescript
const handleLogSet = () => {
  if (!weight || !reps || !currentExerciseLog) return;

  const loggedWeight = parseFloat(weight);
  const loggedReps = parseInt(reps, 10);
  
  // Get user's 1RM
  const userMax = 225; // TODO: Get from Redux state
  
  // Use enhanced logging
  const result = WorkoutEngineEnhanced.logSetWithProgression(
    currentExerciseLog,
    currentSetNumber,
    loggedWeight,
    loggedReps,
    90, // Will be calculated dynamically
    userMax,
    undefined // perceivedEffort - optional
  );

  // Dispatch enhanced set log
  dispatch(logEnhancedSet({
    exerciseIndex: currentExerciseIndex,
    setLog: result.setLog,
    maxAttemptResult: result.maxAttemptResult,
    unlockedSets: result.unlockedSets,
    downSetsGenerated: result.downSetsGenerated
  }));

  // Handle max attempt result
  if (result.maxAttemptResult) {
    setMaxAttemptResult(result.maxAttemptResult);
    setShowMaxFeedback(true);
    
    // Store down sets if generated
    if (result.downSetsGenerated.length > 0) {
      setDownSets(result.downSetsGenerated);
    }
  }

  // Calculate rest duration based on intensity
  const currentSet = conditionalSets.find(s => s.setNumber === currentSetNumber);
  if (currentSet) {
    const restSeconds = WorkoutEngineEnhanced.parseRestPeriodToSeconds(
      currentSet.restPeriod
    );
    dispatch(startRestTimer(restSeconds));
  } else {
    dispatch(startRestTimer(90)); // Default fallback
  }

  // Clear inputs for next set
  setWeight('');
  setReps('');
};
```

#### Step 1.5: Add Modal Handlers (15 min)
```typescript
// Add handler for max attempt modal
const handleMaxAttemptContinue = () => {
  if (maxAttemptResult?.success) {
    // User wants to try next weight (+5 lbs)
    setShowMaxFeedback(false);
    // Next conditional set should already be unlocked
  } else {
    // User wants to do down sets
    if (downSets.length > 0 && currentExerciseLog) {
      dispatch(activateDownSets({ exerciseId: currentExerciseLog.exerciseId }));
      setShowDownSets(true);
    }
    setShowMaxFeedback(false);
  }
};

const handleDismissMaxFeedback = () => {
  setShowMaxFeedback(false);
  dispatch(clearMaxAttemptResult());
  // User skipping to next exercise
};
```

#### Step 1.6: Replace Set Logging UI (1 hour)
Replace the current set logging card section (lines 385-489) with:

```tsx
{/* Down Set Banner - Shows when max attempt fails */}
{showDownSets && downSets.length > 0 && (
  <DownSetBanner
    numberOfSets={downSets.length}
    weight={downSets[0].weight}
    visible={showDownSets}
  />
)}

{/* Conditional Set Cards - Replace old logging card */}
{visibleSets.map((set, index) => {
  const isCurrentSet = set.setNumber === currentSetNumber;
  const isCompleted = currentExerciseLog?.sets.some(s => s.setNumber === set.setNumber) || false;
  
  return (
    <ConditionalSetCard
      key={set.setNumber}
      set={set}
      isCurrentSet={isCurrentSet}
      isCompleted={isCompleted}
      onPress={() => {
        // Pre-fill weight when set is tapped
        if (!isCompleted && set.shouldDisplay) {
          setWeight(set.weight.toString());
          setReps(typeof set.targetReps === 'number' ? set.targetReps.toString() : '');
        }
      }}
    />
  );
})}

{/* Original Logging Input (keep for manual entry) */}
{currentExerciseLog && (
  <Card style={dynamicStyles.loggingCard}>
    {/* ... keep existing weight/reps input UI ... */}
  </Card>
)}

{/* Max Attempt Feedback Modal */}
<MaxAttemptFeedbackModal
  visible={showMaxFeedback}
  result={maxAttemptResult}
  onContinue={handleMaxAttemptContinue}
  onDismiss={handleDismissMaxFeedback}
/>
```

#### Step 1.7: Add Intensity Badge to Current Set (15 min)
```tsx
{/* Add before SET {currentSetNumber} title */}
{(() => {
  const currentSet = conditionalSets.find(s => s.setNumber === currentSetNumber);
  return currentSet ? (
    <View style={{ alignItems: 'center', marginBottom: 16 }}>
      <IntensityBadge 
        percentage={currentSet.intensityPercentage}
        size="large"
        showLabel={true}
      />
    </View>
  ) : null;
})()}
```

---

### Task 2: Update RestTimer (1 hour)

**File:** [`app/src/components/workout/RestTimer.tsx`](../app/src/components/workout/RestTimer.tsx)

#### Changes Needed:

1. **Add intensity-based rest calculation**
2. **Show rest explanation**
3. **Support variable rest periods** (30s, 1-2 MIN, 1-5 MIN)

**Implementation:**
```typescript
import WorkoutEngineEnhanced from '../../services/WorkoutEngineEnhanced';

// In component:
interface RestTimerProps {
  onComplete: () => void;
  weight?: number;         // NEW
  oneRepMax?: number;      // NEW
  setType?: 'warmup' | 'working' | 'max' | 'downset'; // NEW
}

// Calculate rest duration
const calculateRestDuration = () => {
  if (weight && oneRepMax) {
    const restPeriod = WorkoutEngineEnhanced.calculateRestPeriod(
      weight,
      oneRepMax,
      setType
    );
    return WorkoutEngineEnhanced.parseRestPeriodToSeconds(restPeriod);
  }
  return targetDuration; // Use prop if provided
};

// Show explanation
const getRestExplanation = () => {
  if (!weight || !oneRepMax) return null;
  
  const intensity = weight / oneRepMax;
  
  if (intensity <= 0.35) return 'Quick recovery for warmup';
  if (intensity >= 0.90) return 'Full recovery - take your time for max effort!';
  if (intensity >= 0.65) return 'Moderate recovery for working sets';
  return 'Standard recovery';
};

// In JSX:
<Text style={styles.explanation}>
  {getRestExplanation()}
</Text>
```

---

### Task 3: Create Unit Tests (1-2 hours)

**File:** Create [`app/__tests__/services/FormulaCalculatorEnhanced.test.ts`](../app/__tests__/services/FormulaCalculatorEnhanced.test.ts)

```typescript
import FormulaCalculator from '../../src/services/FormulaCalculatorEnhanced';

describe('FormulaCalculatorEnhanced', () => {
  describe('calculateWeightByPercentage', () => {
    test('standard weight calculation', () => {
      expect(FormulaCalculator.calculateWeightByPercentage(200, 0.35)).toBe(70);
    });

    test('beginner special case - 1RM < 125', () => {
      expect(FormulaCalculator.calculateWeightByPercentage(100, 0.35)).toBe(45);
    });

    test('rounds to nearest 5 lbs', () => {
      expect(FormulaCalculator.calculateWeightByPercentage(203, 0.80)).toBe(160);
    });
  });

  describe('evaluateMaxAttempt', () => {
    test('success - adds 5 lbs', () => {
      const result = FormulaCalculator.evaluateMaxAttempt(225, 1);
      expect(result.success).toBe(true);
      expect(result.newMax).toBe(230);
      expect(result.instruction).toBe('NEW_MAX_ATTEMPT');
    });

    test('failure - redirects to down sets', () => {
      const result = FormulaCalculator.evaluateMaxAttempt(225, 0);
      expect(result.success).toBe(false);
      expect(result.instruction).toBe('PROCEED_TO_DOWN_SETS');
    });
  });

  describe('shouldDisplaySet', () => {
    test('non-conditional set always displays', () => {
      const set = {
        setNumber: 1,
        isConditional: false,
        shouldDisplay: true
      } as any;
      expect(FormulaCalculator.shouldDisplaySet(set, [])).toBe(true);
    });

    test('conditional set - condition met', () => {
      const set = {
        setNumber: 5,
        isConditional: true,
        condition: { type: 'reps_achieved', requiredReps: 1 }
      } as any;
      const completed = [{ setNumber: 4, reps: 1 }] as any;
      expect(FormulaCalculator.shouldDisplaySet(set, completed)).toBe(true);
    });

    test('conditional set - condition not met', () => {
      const set = {
        setNumber: 5,
        isConditional: true,
        condition: { type: 'reps_achieved', requiredReps: 1 }
      } as any;
      const completed = [{ setNumber: 4, reps: 0 }] as any;
      expect(FormulaCalculator.shouldDisplaySet(set, completed)).toBe(false);
    });
  });

  describe('generateDownSets', () => {
    test('generates 3 down sets at 80%', () => {
      const sets = FormulaCalculator.generateDownSets(225);
      expect(sets).toHaveLength(3);
      expect(sets[0].weight).toBe(180); // 80% of 225
      expect(sets[0].targetReps).toBe(8);
      expect(sets[2].targetReps).toBe('REP_OUT');
    });
  });
});
```

---

### Task 4: Integration Testing (1 hour)

Create test scenarios for complete workout flows.

---

## Quick Integration Checklist

Use this to track your progress:

### ActiveWorkoutScreen Updates
- [ ] Import all new components and services
- [ ] Add state variables for conditional sets
- [ ] Add useEffect to generate pyramid sets
- [ ] Update handleLogSet to use WorkoutEngineEnhanced
- [ ] Add max attempt modal handlers
- [ ] Replace set logging UI with ConditionalSetCard list
- [ ] Add DownSetBanner rendering
- [ ] Add MaxAttemptFeedbackModal
- [ ] Add IntensityBadge to current set display
- [ ] Wire up all event handlers
- [ ] Test manually with sample workout

### RestTimer Updates
- [ ] Add weight, oneRepMax, setType props
- [ ] Calculate rest duration from intensity
- [ ] Show rest explanation
- [ ] Test with various intensities

### Testing
- [ ] Unit tests for FormulaCalculatorEnhanced
- [ ] Unit tests for WorkoutEngineEnhanced
- [ ] Component tests for UI components
- [ ] Integration test for full workout flow
- [ ] Edge case testing (beginners, failures, etc.)
- [ ] Performance testing (<100ms set logging)

---

## Code Templates Ready to Use

All code examples are in:
- [`UI_INTEGRATION_GUIDE.md`](./UI_INTEGRATION_GUIDE.md) - Complete integration examples
- [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md) - What works now
- [`PHASE_1_IMPLEMENTATION_COMPLETE.md`](./PHASE_1_IMPLEMENTATION_COMPLETE.md) - Backend usage

---

## Alternative: Staged Rollout

If full integration seems overwhelming, consider:

### Stage 1: Visual Only (2 hours)
- Add IntensityBadge to existing set display
- Show intensity percentages
- No logic changes

### Stage 2: Conditional Sets (3 hours)
- Add ConditionalSetCard rendering
- Show lock/unlock states
- No progression logic yet

### Stage 3: Full Integration (3 hours)
- Add max attempt evaluation
- Add down set generation
- Complete formula integration

---

## Support

For any questions during integration:
1. Check [`UI_INTEGRATION_GUIDE.md`](./UI_INTEGRATION_GUIDE.md) for code examples
2. Review [`WorkoutEngineEnhanced.ts`](../app/src/services/WorkoutEngineEnhanced.ts) for method signatures
3. See [`workoutSliceEnhanced.ts`](../app/src/store/slices/workoutSliceEnhanced.ts) for Redux actions

---

## Success Criteria

✅ **Complete when:**
- ActiveWorkoutScreen uses ConditionalSetCard for all sets
- Sets unlock progressively with animations
- Max attempt feedback modal shows on set 4+
- Down set banner appears when max fails
- RestTimer uses intensity-based durations
- All tests pass
- Manual testing shows smooth UX

---

## Timeline

**Optimistic:** 6 hours (1 day)
**Realistic:** 8 hours (1-2 days)  
**Conservative:** 10 hours (2 days)

---

## You're Almost There!

**80% done** - All the hard work (formula extraction, backend logic, UI components) is complete. The remaining work is straightforward integration following the provided code examples.

**Next:** Open [`ActiveWorkoutScreen.tsx`](../app/src/screens/workout/ActiveWorkoutScreen.tsx) and follow Step 1.1 above.

Good luck! 🚀
