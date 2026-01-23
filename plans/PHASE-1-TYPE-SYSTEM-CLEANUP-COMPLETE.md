# Phase 1: Type System Cleanup - COMPLETE

**Date:** January 21, 2026  
**Status:** ✅ Complete  
**Duration:** ~1 hour

---

## Summary

Successfully removed the dual-mode architecture from the type system and Redux store, eliminating the concept of "training mode selection" at the foundational level. All users will now use the protocol system (P1/P2/P3) exclusively.

---

## Changes Made

### 1. Type Definitions ([`app/src/types/index.ts`](../app/src/types/index.ts))

#### ✅ Updated `UserProfile` Interface (Lines 23-37)
```typescript
// BEFORE:
export interface UserProfile {
  // ...
  trainingMode: TrainingMode; // 'percentage' or 'protocol'
  protocolPreferences?: {
    // ...
  };
}

// AFTER:
export interface UserProfile {
  // ...
  // trainingMode removed entirely
  protocolPreferences: {  // Now required, not optional
    preferredP1Frequency: number;
    autoSuggestP1: boolean;
    showReadinessSignals: boolean;
  };
}
```

#### ✅ Removed Training Mode from Navigation (Lines 329-337)
```typescript
// BEFORE:
export type RootStackParamList = {
  Onboarding: undefined;
  TrainingModeOnboarding: undefined;  // ❌ Removed
  MaxDeterminationIntro: undefined;
  // ...
};

// AFTER:
export type RootStackParamList = {
  Onboarding: undefined;
  // TrainingModeOnboarding removed
  MaxDeterminationIntro: undefined;
  // ...
};
```

#### ✅ Deprecated `TrainingMode` Type (Lines 610-618)
```typescript
// BEFORE:
export type TrainingMode = 'percentage' | 'protocol';

// AFTER:
// @deprecated TrainingMode type removed - all users now use protocol system
// export type TrainingMode = 'percentage' | 'protocol';
```

**Note:** Type is commented out but left for reference during migration. Will be fully removed after all references are cleaned up.

### 2. Redux User Slice ([`app/src/store/slices/userSlice.ts`](../app/src/store/slices/userSlice.ts))

#### ✅ Removed TrainingMode Import (Line 8)
```typescript
// BEFORE:
import { User, UserProfile, ExperienceLevel, UserState, ExerciseSubstitution, TrainingMode } from '../../types';

// AFTER:
import { User, UserProfile, ExperienceLevel, UserState, ExerciseSubstitution } from '../../types';
```

#### ✅ Updated `initializeProfile` Action (Lines 42-61)
```typescript
// BEFORE:
initializeProfile: (state, action: PayloadAction<{ 
  userId: string; 
  currentPhase: string; 
  trainingMode?: TrainingMode 
}>) => {
  const { userId, currentPhase, trainingMode = 'percentage' } = action.payload;
  state.profile = {
    // ...
    trainingMode,
    protocolPreferences: { /* ... */ },
  };
}

// AFTER:
initializeProfile: (state, action: PayloadAction<{ 
  userId: string; 
  currentPhase: string;
}>) => {
  const { userId, currentPhase } = action.payload;
  state.profile = {
    // ...
    // trainingMode removed
    protocolPreferences: {  // Always initialized
      preferredP1Frequency: 2,
      autoSuggestP1: true,
      showReadinessSignals: true,
    },
  };
}
```

#### ✅ Removed `setTrainingMode` Action (Lines 75-80)
```typescript
// REMOVED:
setTrainingMode: (state, action: PayloadAction<TrainingMode>) => {
  if (state.profile) {
    state.profile.trainingMode = action.payload;
  }
},
```

#### ✅ Updated Exports (Lines 142-155)
```typescript
// BEFORE:
export const {
  // ...
  setTrainingMode,  // ❌ Removed
  // ...
} = userSlice.actions;

// AFTER:
export const {
  // ...
  // setTrainingMode removed
  // ...
} = userSlice.actions;
```

---

## Impact Analysis

### ✅ Breaking Changes
1. **UserProfile.trainingMode** - Field no longer exists
   - Any code reading `profile.trainingMode` will now error
   - Need to update all references in Phase 2+

2. **setTrainingMode action** - No longer available
   - Components using this action need to be removed or updated

3. **TrainingModeOnboarding route** - Removed from navigation types
   - Navigation to this screen will error
   - Need to update onboarding flow in Phase 2

### ⚠️ Requires Follow-up
- [ ] Update all components using `trainingMode` field
- [ ] Remove training mode selection UI (Phase 2)
- [ ] Update WorkoutEngineRouter to remove routing logic (Phase 3)
- [ ] Update all service files with mode checks (Phase 3-5)

---

## Files Modified

| File | Lines Changed | Status |
|------|---------------|--------|
| [`app/src/types/index.ts`](../app/src/types/index.ts) | ~20 | ✅ Complete |
| [`app/src/store/slices/userSlice.ts`](../app/src/store/slices/userSlice.ts) | ~15 | ✅ Complete |

---

## Next Steps (Phase 2: Remove Mode Selection UI)

1. **Remove TrainingModeOnboardingScreen** 
   - Archive: `app/src/screens/onboarding/TrainingModeOnboardingScreen.tsx`
   - Update WelcomeScreen to go directly to MaxDetermination

2. **Remove TrainingModeSelector Component**
   - Archive: `app/src/components/workout/TrainingModeSelector.tsx`

3. **Remove TrainingModeSettingsScreen**
   - Archive: `app/src/screens/settings/TrainingModeSettingsScreen.tsx`
   - Update SettingsScreen to remove link

4. **Remove ModeMigrationWizard**
   - Archive: `app/src/components/workout/ModeMigrationWizard.tsx`

5. **Update MainNavigator**
   - Remove TrainingModeOnboarding route
   - Remove TrainingModeSettings route

---

## Testing Status

### Unit Tests
- ⏸️ Not yet run - TypeScript compilation needed first
- ⏸️ Update tests in Phase 5

### Integration Tests
- ⏸️ Deferred until UI changes complete

### Manual Testing
- ⏸️ Will test after all phases complete

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|---------|-----------|
| TypeScript compilation errors | High | Medium | Fix incrementally per phase |
| Runtime errors from removed fields | High | High | Thorough testing in Phase 5 |
| User data migration issues | Low | High | Migration script in Phase 4 |
| Breaking changes for users | Medium | Medium | Clear messaging, gradual rollout |

---

## Rollback Plan

If issues arise:
1. **Revert type changes:** Restore `trainingMode` field as optional
2. **Revert userSlice:** Restore `setTrainingMode` action
3. **Keep UI changes:** UI removal can stay (hidden feature)
4. **Monitor:** Collect data before re-attempting

---

## Notes

- **FormulaCalculator is NOT removed** - It's used BY protocol system for weight calculations
- **Protocol system = Main lifts using P1/P2/P3 + formula-based weight calculations**
- This is an architectural simplification, not a feature removal
- Type deprecation comments left for reference during migration

---

## Completion Criteria

✅ UserProfile.trainingMode field removed  
✅ TrainingMode type deprecated (commented)  
✅ TrainingModeOnboarding removed from nav types  
✅ setTrainingMode action removed from userSlice  
✅ initializeProfile updated to not accept trainingMode  
✅ All imports updated (TrainingMode removed where needed)  

**Phase 1 Status:** COMPLETE ✅

---

## Time to Next Phase

**Estimated:** 30-45 minutes for Phase 2 (UI Removal)

Continue with Phase 2 or review changes first?
