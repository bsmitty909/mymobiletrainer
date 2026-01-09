# UI Integration Guide - Phase 2

## New Components Created

### 1. IntensityBadge
**File:** [`app/src/components/workout/IntensityBadge.tsx`](../app/src/components/workout/IntensityBadge.tsx)

**Purpose:** Visual indicator showing intensity percentage with color coding

**Usage:**
```tsx
import IntensityBadge from '../../components/workout/IntensityBadge';

// In your component
<IntensityBadge 
  percentage={0.80}  // 80% of 1RM
  size="medium"      // 'small' | 'medium' | 'large'
  showLabel={true}   // Show "HEAVY" label
/>
```

**Color Scheme:**
- Green (≤35%): Warmup
- Blue (50-65%): Moderate
- Orange (70-85%): Heavy
- Red (≥90%): Max Effort

### 2. ConditionalSetCard
**File:** [`app/src/components/workout/ConditionalSetCard.tsx`](../app/src/components/workout/ConditionalSetCard.tsx)

**Purpose:** Display sets with lock/unlock states and smooth animations

**Usage:**
```tsx
import ConditionalSetCard from '../../components/workout/ConditionalSetCard';

// In your component
<ConditionalSetCard
  set={{
    setNumber: 5,
    weight: 230,
    targetReps: 1,
    restPeriod: '1-5 MIN',
    intensityPercentage: 1.05,
    isConditional: true,
    shouldDisplay: false, // Will show locked
    condition: {
      type: 'reps_achieved',
      requiredReps: 1
    }
  }}
  isCurrentSet={false}
  isCompleted={false}
  onPress={() => {/* handle set tap */}}
/>
```

**Features:**
- 🔒 Shows locked state for conditional sets
- ✨ Animates unlock when condition met
- ✓ Checkmark badge when completed
- 📊 Intensity badge included
- 💬 Explains unlock condition

### 3. MaxAttemptFeedbackModal
**File:** [`app/src/components/workout/MaxAttemptFeedbackModal.tsx`](../app/src/components/workout/MaxAttemptFeedbackModal.tsx)

**Purpose:** Show feedback after max attempts (success or failure)

**Usage:**
```tsx
import MaxAttemptFeedbackModal from '../../components/workout/MaxAttemptFeedbackModal';

// In your component
const [showFeedback, setShowFeedback] = useState(false);
const [maxResult, setMaxResult] = useState<MaxAttemptResult | null>(null);

// After logging a max attempt set
const result = WorkoutEngineEnhanced.evaluateMaxAttemptResult(225, repsCompleted);
setMaxResult(result);
setShowFeedback(true);

// Render modal
<MaxAttemptFeedbackModal
  visible={showFeedback}
  result={maxResult}
  onContinue={() => {
    // User wants to attempt next weight or start down sets
    if (maxResult.success) {
      // Unlock next conditional set
      unlockNextSet(maxResult.newMax);
    } else {
      // Generate and show down sets
      generateDownSets();
    }
    setShowFeedback(false);
  }}
  onDismiss={() => {
    // User wants to skip to next exercise
    setShowFeedback(false);
    completeExercise();
  }}
/>
```

**Displays:**
- ✅ Success: Confetti animation, new max, option to try +5 lbs
- ❌ Failure: Down sets explanation, volume work prompt

### 4. DownSetBanner
**File:** [`app/src/components/workout/DownSetBanner.tsx`](../app/src/components/workout/DownSetBanner.tsx)

**Purpose:** Prominent banner when down sets (volume work) begin

**Usage:**
```tsx
import DownSetBanner from '../../components/workout/DownSetBanner';

// Show when max attempt fails and down sets are generated
<DownSetBanner
  numberOfSets={3}
  weight={180}  // 80% of 225 lb max
  visible={showDownSets}
/>
```

---

## Integration Steps

### Step 1: Update workoutSlice

Add enhanced workout state to Redux:

```typescript
// app/src/store/slices/workoutSlice.ts

import { ConditionalSet, MaxAttemptResult, EnhancedWorkoutState } from '../../types/enhanced';

interface WorkoutState {
  // ... existing fields
  
  // NEW: Enhanced workout state
  enhancedState: EnhancedWorkoutState | null;
  currentConditionalSets: ConditionalSet[];
  lastMaxAttemptResult: MaxAttemptResult | null;
  pendingDownSets: ConditionalSet[];
}

// NEW: Action to update conditional sets
updateConditionalSets: (state, action: PayloadAction<ConditionalSet[]>) => {
  state.currentConditionalSets = action.payload;
},

// NEW: Action to handle max attempt result
handleMaxAttemptResult: (state, action: PayloadAction<MaxAttemptResult>) => {
  state.lastMaxAttemptResult = action.payload;
  
  if (!action.payload.success) {
    // Generate down sets
    // This will be populated by WorkoutEngineEnhanced
  }
},
```

### Step 2: Update ActiveWorkoutScreen

Replace current set logging with enhanced version:

```tsx
// app/src/screens/workout/ActiveWorkoutScreen.tsx

import WorkoutEngineEnhanced from '../../services/WorkoutEngineEnhanced';
import { ConditionalSet, MaxAttemptResult } from '../../types/enhanced';
import ConditionalSetCard from '../../components/workout/ConditionalSetCard';
import MaxAttemptFeedbackModal from '../../components/workout/MaxAttemptFeedbackModal';
import DownSetBanner from '../../components/workout/DownSetBanner';

// Component state
const [conditionalSets, setConditionalSets] = useState<ConditionalSet[]>([]);
const [showMaxFeedback, setShowMaxFeedback] = useState(false);
const [maxAttemptResult, setMaxAttemptResult] = useState<MaxAttemptResult | null>(null);
const [showDownSets, setShowDownSets] = useState(false);
const [downSets, setDownSets] = useState<ConditionalSet[]>([]);

// On component mount or exercise change, generate pyramid sets
useEffect(() => {
  if (currentExerciseLog) {
    const userMax = getUserMaxForExercise(currentExerciseLog.exerciseId);
    const sets = WorkoutEngineEnhanced.generateWorkoutSets(
      currentExerciseLog.exerciseId,
      userMax,
      currentExerciseLog.sets // Pass completed sets
    );
    setConditionalSets(sets);
  }
}, [currentExerciseLog?.id, currentExerciseLog?.sets.length]);

// Enhanced set logging
const handleLogSet = () => {
  if (!weight || !reps || !currentExerciseLog) return;

  const loggedWeight = parseFloat(weight);
  const loggedReps = parseInt(reps, 10);
  const oneRepMax = getUserMaxForExercise(currentExerciseLog.exerciseId);

  // Use enhanced logging
  const result = WorkoutEngineEnhanced.logSetWithProgression(
    currentExerciseLog,
    currentSetNumber,
    loggedWeight,
    loggedReps,
    90, // rest seconds
    oneRepMax,
    perceivedEffort
  );

  // Dispatch to Redux
  dispatch(logSet({ 
    exerciseIndex: currentExerciseIndex, 
    setLog: result.setLog 
  }));

  // Handle max attempt result
  if (result.maxAttemptResult) {
    setMaxAttemptResult(result.maxAttemptResult);
    setShowMaxFeedback(true);
  }

  // Update conditional sets visibility
  if (result.unlockedSets.length > 0) {
    setConditionalSets(prev => 
      WorkoutEngineEnhanced.updateDisplayedSets(
        [...prev, ...result.unlockedSets],
        currentExerciseLog.sets
      )
    );
  }

  // Handle down sets
  if (result.downSetsGenerated.length > 0) {
    setDownSets(result.downSetsGenerated);
    setShowDownSets(true);
  }

  // Start rest timer with intensity-based duration
  const currentSet = conditionalSets.find(s => s.setNumber === currentSetNumber);
  if (currentSet) {
    const restSeconds = WorkoutEngineEnhanced.parseRestPeriodToSeconds(
      currentSet.restPeriod
    );
    dispatch(startRestTimer(restSeconds));
  }

  // Prepare for next set
  setWeight('');
  setReps('');
};

// Render sets
const visibleSets = WorkoutEngineEnhanced.getVisibleSets(
  conditionalSets,
  currentExerciseLog?.sets || []
);

return (
  <View>
    {/* Down Set Banner */}
    <DownSetBanner
      numberOfSets={downSets.length}
      weight={downSets[0]?.weight || 0}
      visible={showDownSets}
    />

    {/* Conditional Set Cards */}
    {visibleSets.map((set, index) => (
      <ConditionalSetCard
        key={set.setNumber}
        set={set}
        isCurrentSet={set.setNumber === currentSetNumber}
        isCompleted={completedSetNumbers.has(set.setNumber)}
        onPress={() => selectSet(set)}
      />
    ))}

    {/* Max Attempt Feedback */}
    <MaxAttemptFeedbackModal
      visible={showMaxFeedback}
      result={maxAttemptResult}
      onContinue={handleMaxAttemptContinue}
      onDismiss={() => setShowMaxFeedback(false)}
    />
  </View>
);
```

### Step 3: Update RestTimer

Add intensity-based rest period calculation:

```tsx
// app/src/components/workout/RestTimer.tsx

import WorkoutEngineEnhanced from '../../services/WorkoutEngineEnhanced';

// Calculate rest based on intensity
const calculateRestDuration = (weight: number, oneRepMax: number) => {
  const restPeriod = WorkoutEngineEnhanced.calculateRestPeriod(
    weight, 
    oneRepMax
  );
  return WorkoutEngineEnhanced.parseRestPeriodToSeconds(restPeriod);
};

// Show explanation
const getRestExplanation = (restPeriod: string) => {
  const explanations: Record<string, string> = {
    '30s': 'Quick recovery for warmup',
    '1 MIN': 'Standard recovery',
    '1-2 MIN': 'Moderate recovery for working sets',
    '1-5 MIN': 'Full recovery for max efforts - take your time!'
  };
  return explanations[restPeriod] || 'Rest as needed';
};
```

---

## Complete Example: Enhanced ActiveWorkout Flow

```tsx
import React, { useState, useEffect } from 'react';
import WorkoutEngineEnhanced from '../../services/WorkoutEngineEnhanced';
import { ConditionalSet, MaxAttemptResult } from '../../types/enhanced';
import ConditionalSetCard from '../../components/workout/ConditionalSetCard';
import MaxAttemptFeedbackModal from '../../components/workout/MaxAttemptFeedbackModal';
import DownSetBanner from '../../components/workout/DownSetBanner';
import IntensityBadge from '../../components/workout/IntensityBadge';

export default function EnhancedActiveWorkoutScreen() {
  // State
  const [conditionalSets, setConditionalSets] = useState<ConditionalSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<SetLog[]>([]);
  const [showMaxFeedback, setShowMaxFeedback] = useState(false);
  const [maxResult, setMaxResult] = useState<MaxAttemptResult | null>(null);
  const [downSets, setDownSets] = useState<ConditionalSet[]>([]);
  const [showDownSets, setShowDownSets] = useState(false);

  // Initialize pyramid sets
  useEffect(() => {
    const oneRepMax = 225; // From user's max lifts
    const sets = WorkoutEngineEnhanced.generateWorkoutSets(
      'bench-press',
      oneRepMax,
      completedSets
    );
    setConditionalSets(sets);
  }, []);

  // Handle set logging
  const handleLogSet = (weight: number, reps: number) => {
    const oneRepMax = 225;
    
    // Use enhanced logging
    const result = WorkoutEngineEnhanced.logSetWithProgression(
      exerciseLog,
      currentSetIndex + 1,
      weight,
      reps,
      90,
      oneRepMax
    );

    // Update completed sets
    setCompletedSets(prev => [...prev, result.setLog]);

    // Check for max attempt result
    if (result.maxAttemptResult) {
      setMaxResult(result.maxAttemptResult);
      setShowMaxFeedback(true);
      
      // Handle down sets
      if (result.downSetsGenerated.length > 0) {
        setDownSets(result.downSetsGenerated);
      }
    }

    // Unlock conditional sets
    if (result.unlockedSets.length > 0) {
      const updatedSets = WorkoutEngineEnhanced.updateDisplayedSets(
        [...conditionalSets, ...result.unlockedSets],
        [...completedSets, result.setLog]
      );
      setConditionalSets(updatedSets);
    }

    setCurrentSetIndex(prev => prev + 1);
  };

  // Get visible sets
  const visibleSets = WorkoutEngineEnhanced.getVisibleSets(
    conditionalSets,
    completedSets
  );

  // Get current set
  const currentSet = visibleSets[currentSetIndex];
  
  // Get display info
  const displayInfo = currentSet 
    ? WorkoutEngineEnhanced.getExerciseDisplayInfo(currentSet, 225)
    : null;

  return (
    <View>
      {/* Current Set Info with Intensity */}
      {currentSet && (
        <View>
          <IntensityBadge 
            percentage={currentSet.intensityPercentage}
            size="large"
            showLabel={true}
          />
          <Text>{displayInfo?.guidance}</Text>
        </View>
      )}

      {/* Down Set Banner */}
      <DownSetBanner
        numberOfSets={downSets.length}
        weight={downSets[0]?.weight || 0}
        visible={showDownSets}
      />

      {/* All Sets */}
      {visibleSets.map((set, index) => (
        <ConditionalSetCard
          key={set.setNumber}
          set={set}
          isCurrentSet={index === currentSetIndex}
          isCompleted={completedSets.some(s => s.setNumber === set.setNumber)}
        />
      ))}

      {/* Max Attempt Feedback */}
      <MaxAttemptFeedbackModal
        visible={showMaxFeedback}
        result={maxResult}
        onContinue={() => {
          if (maxResult?.success) {
            // Continue with next max attempt
          } else {
            // Start down sets
            setShowDownSets(true);
          }
          setShowMaxFeedback(false);
        }}
        onDismiss={() => setShowMaxFeedback(false)}
      />
    </View>
  );
}
```

---

## State Management Integration

### Redux Slice Updates

```typescript
// app/src/store/slices/workoutSlice.ts

import { ConditionalSet, MaxAttemptResult } from '../../types/enhanced';

interface WorkoutSliceState {
  // ... existing state
  
  // Enhanced workout state
  currentConditionalSets: ConditionalSet[];
  visibleSets: ConditionalSet[];
  lastMaxAttemptResult: MaxAttemptResult | null;
  pendingDownSets: ConditionalSet[];
  completedSetNumbers: Set<number>;
}

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    // ... existing reducers
    
    initializeConditionalSets: (state, action: PayloadAction<{
      exerciseId: string;
      oneRepMax: number;
    }>) => {
      const sets = WorkoutEngineEnhanced.generateWorkoutSets(
        action.payload.exerciseId,
        action.payload.oneRepMax,
        []
      );
      state.currentConditionalSets = sets;
      state.visibleSets = sets.filter(s => !s.isConditional);
      state.completedSetNumbers = new Set();
    },
    
    logEnhancedSet: (state, action: PayloadAction<{
      exerciseIndex: number;
      weight: number;
      reps: number;
      oneRepMax: number;
    }>) => {
      const exercise = state.activeSession?.exercises[action.payload.exerciseIndex];
      if (!exercise) return;
      
      const result = WorkoutEngineEnhanced.logSetWithProgression(
        exercise,
        exercise.sets.length + 1,
        action.payload.weight,
        action.payload.reps,
        90,
        action.payload.oneRepMax
      );
      
      // Add set to exercise
      exercise.sets.push(result.setLog);
      state.completedSetNumbers.add(result.setLog.setNumber);
      
      // Store max attempt result
      if (result.maxAttemptResult) {
        state.lastMaxAttemptResult = result.maxAttemptResult;
      }
      
      // Handle unlocked sets
      if (result.unlockedSets.length > 0) {
        const updatedSets = WorkoutEngineEnhanced.updateDisplayedSets(
          [...state.currentConditionalSets, ...result.unlockedSets],
          exercise.sets
        );
        state.visibleSets = updatedSets;
      }
      
      // Handle down sets
      if (result.downSetsGenerated.length > 0) {
        state.pendingDownSets = result.downSetsGenerated;
      }
    },
    
    clearMaxAttemptResult: (state) => {
      state.lastMaxAttemptResult = null;
    },
    
    activateDownSets: (state) => {
      state.currentConditionalSets = [
        ...state.currentConditionalSets,
        ...state.pendingDownSets
      ];
      state.visibleSets = [
        ...state.visibleSets,
        ...state.pendingDownSets
      ];
      state.pendingDownSets = [];
    },
  }
});
```

---

## Visual Flow

### Warmup Phase (Set 1)
```
┌─────────────────────────────────┐
│ SET 1              [35% WARMUP] │ ✅ Visible
│ 80 lbs • 6 reps • 30s           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ SET 2              🔒 LOCKED     │ ❌ Hidden
└─────────────────────────────────┘
```

### After Completing Set 1
```
┌─────────────────────────────────┐
│ SET 1         ✓   [35% WARMUP]  │ ✅ Completed
│ 80 lbs • 6 reps                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ SET 2              [80% HEAVY]  │ ✅ Unlocked! (animated)
│ 180 lbs • 1 rep • 1-2 MIN       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ SET 3              [90% HEAVY]  │ ✅ Visible
│ 205 lbs • 1 rep • 1-2 MIN       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ SET 4              [100% MAX]   │ ✅ Visible
│ 225 lbs • 1 rep • 1-5 MIN       │
└─────────────────────────────────┘
```

### After Successful Max Attempt (Set 4)
```
[Modal Appears]
┌─────────────────────────────────┐
│         🎉 NEW MAX!             │
│      +5 lbs Progression         │
│                                 │
│     Your new max is:            │
│         230 lbs                 │
│                                 │
│  Want to try 230 lbs?           │
│                                 │
│  [TRY 230 LBS (+5)]            │
│  [Continue to Next Exercise]    │
└─────────────────────────────────┘

// After modal, Set 5 appears unlocked
┌─────────────────────────────────┐
│ SET 5         ✨   [105% MAX]   │ ✅ Just Unlocked!
│ 230 lbs • 1 rep • 1-5 MIN       │
└─────────────────────────────────┘
```

### After Failed Max Attempt (Set 4, 0 reps)
```
[Modal Appears]
┌─────────────────────────────────┐
│      💪 VOLUME WORK             │
│  Let's build strength with      │
│       down sets                 │
│                                 │
│   3 down sets at 80% of max     │
│   Focus on form and activation  │
│                                 │
│  [START DOWN SETS]             │
│  [Skip to Next Exercise]        │
└─────────────────────────────────┘

// After modal, down set banner appears
┌─────────────────────────────────┐
│  💪   VOLUME WORK   💪          │
│  ────────────────────────       │
│  Build strength with down sets  │
│         180 lbs                 │
│      (80% of your max)          │
│  3 sets • 8 reps • REP OUT     │
└─────────────────────────────────┘
```

---

## Quick Wins - Minimal Integration

If you want to add just the visual improvements without full backend integration:

### 1. Add Intensity Badges (30 min)
```tsx
// In any set display
<View style={{ flexDirection: 'row', gap: 8 }}>
  <Text>SET 1</Text>
  <IntensityBadge percentage={0.35} size="small" showLabel={false} />
</View>
```

### 2. Show Lock Icons for Future Sets (15 min)
```tsx
{setNumber > currentSetNumber && (
  <Text style={{ opacity: 0.5 }}>🔒 Complete previous set</Text>
)}
```

### 3. Display Rest Period (10 min)
```tsx
<Text>Rest: {set.restPeriod}</Text>
```

**Total Time:** ~1 hour for visible improvements

---

## Testing Checklist

- [ ] Intensity badge displays correct colors for each percentage
- [ ] Conditional sets start locked
- [ ] Sets unlock with animation after previous set complete
- [ ] Max attempt success shows confetti and new weight
- [ ] Max attempt failure shows down set modal
- [ ] Down set banner displays with correct weight (80% of max)
- [ ] Rest timer uses intensity-based durations
- [ ] Completed sets show checkmark badge
- [ ] Set 5 unlocks only if set 4 successful (reps >= 1)
- [ ] Down sets replace conditional sets on max failure

---

## Performance Considerations

- ✅ Animations use `useNativeDriver` for 60fps
- ✅ Conditional set evaluation is O(n) - very fast
- ✅ State updates are minimal and targeted
- ✅ No unnecessary re-renders

---

## Next Steps

1. ✅ Create all UI components
2. ⏳ Update workoutSlice with enhanced state
3. ⏳ Update ActiveWorkoutScreen to use new components
4. ⏳ Test complete flow with sample workout
5. ⏳ Fine-tune animations and timing
6. ⏳ Add accessibility labels
7. ⏳ Create demo video showing features

All components are ready to integrate!
