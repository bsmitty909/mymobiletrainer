# Phase 2: UI Removal - COMPLETE

**Date:** January 21, 2026  
**Status:** ✅ Complete  
**Duration:** ~30 minutes

---

## Summary

Removed all training mode selection UI components and updated navigation flows to bypass mode selection. Users now go directly from profile setup to max determination, eliminating the either/or choice between percentage and protocol modes.

---

## Changes Made

### 1. Archived Deprecated Components

Created deprecation structure and moved obsolete files:

```
app/src/deprecated/
├── components/workout/
│   ├── TrainingModeSelector.tsx          ✅ Archived
│   └── ModeMigrationWizard.tsx          ✅ Archived
├── screens/
│   ├── onboarding/
│   │   └── TrainingModeOnboardingScreen.tsx  ✅ Archived
│   ├── settings/
│   │   └── TrainingModeSettingsScreen.tsx    ✅ Archived
│   └── analytics/
│       └── ModeComparisonScreen.tsx          ✅ Archived
```

### 2. Updated Onboarding Flow ([`app/src/screens/onboarding/WelcomeScreen.tsx`](../app/src/screens/onboarding/WelcomeScreen.tsx:70))

```typescript
// BEFORE:
const handleComplete = async () => {
  // ...
  await StorageService.saveUserProfile(profileData);
  navigation.navigate('TrainingModeOnboarding');  // ❌ Removed
};

// AFTER:
const handleComplete = async () => {
  // ...
  await StorageService.saveUserProfile(profileData);
  navigation.navigate('MaxDeterminationIntro');  // ✅ Direct to max testing
};
```

**Impact:**
- New users skip training mode selection entirely
- Go directly from profile setup → max determination
- Protocol system is the only methodology

### 3. Updated Settings Screen ([`app/src/screens/settings/SettingsScreen.tsx`](../app/src/screens/settings/SettingsScreen.tsx:214))

```typescript
// REMOVED this entire section:
<List.Item
  title="Training Mode"
  description="Switch between training styles"
  onPress={() => navigation.navigate('TrainingModeSettings')}
/>

// KEPT:
<List.Item
  title="Protocol Analytics"
  description="View your protocol performance"
  onPress={() => navigation.navigate('ProtocolAnalytics')}
/>
```

**Impact:**
- Settings no longer shows "Training Mode" option
- Users cannot switch between percentage/protocol modes
- Protocol analytics still accessible

### 4. Updated Navigation Configuration ([`app/src/navigation/MainNavigator.tsx`](../app/src/navigation/MainNavigator.tsx))

#### Removed Imports (Lines 19-47):
```typescript
// REMOVED:
import TrainingModeOnboardingScreen from '../screens/onboarding/TrainingModeOnboardingScreen';
import TrainingModeSettingsScreen from '../screens/settings/TrainingModeSettingsScreen';
import ModeComparisonScreen from '../screens/analytics/ModeComparisonScreen';
```

#### Removed Routes (Lines 104-118, 202-210):
```typescript
// ProfileStack - REMOVED:
<ProfileStack.Screen name="TrainingModeSettings" component={TrainingModeSettingsScreen} />
<ProfileStack.Screen name="ModeComparison" component={ModeComparisonScreen} />

// RootStack onboarding - REMOVED:
<RootStack.Screen name="TrainingModeOnboarding" component={TrainingModeOnboardingScreen} />
```

**Impact:**
- Navigation to these screens will throw errors (intended)
- Onboarding flow simplified: Welcome → MaxDetermination
- Settings navigation simplified

---

## Onboarding Flow Comparison

### Before (Dual-Mode):
```
Welcome Screen
  ↓
Profile Setup
  ↓
Training Mode Selection  ← ❌ REMOVED
  ↓ (percentage or protocol)
Max Determination
  ↓
Main App
```

### After (Protocol-Only):
```
Welcome Screen
  ↓
Profile Setup
  ↓
Max Determination  ← ✅ Direct path
  ↓
Main App (Protocol System)
```

---

## Files Modified

| File | Type | Status |
|------|------|--------|
| **Archived Files** | | |
| [`app/src/deprecated/components/workout/TrainingModeSelector.tsx`](../app/src/deprecated/components/workout/TrainingModeSelector.tsx) | Component | ✅ |
| [`app/src/deprecated/components/workout/ModeMigrationWizard.tsx`](../app/src/deprecated/components/workout/ModeMigrationWizard.tsx) | Component | ✅ |
| [`app/src/deprecated/screens/onboarding/TrainingModeOnboardingScreen.tsx`](../app/src/deprecated/screens/onboarding/TrainingModeOnboardingScreen.tsx) | Screen | ✅ |
| [`app/src/deprecated/screens/settings/TrainingModeSettingsScreen.tsx`](../app/src/deprecated/screens/settings/TrainingModeSettingsScreen.tsx) | Screen | ✅ |
| [`app/src/deprecated/screens/analytics/ModeComparisonScreen.tsx`](../app/src/deprecated/screens/analytics/ModeComparisonScreen.tsx) | Screen | ✅ |
| **Updated Files** | | |
| [`app/src/screens/onboarding/WelcomeScreen.tsx`](../app/src/screens/onboarding/WelcomeScreen.tsx) | Screen | ✅ |
| [`app/src/screens/settings/SettingsScreen.tsx`](../app/src/screens/settings/SettingsScreen.tsx) | Screen | ✅ |
| [`app/src/navigation/MainNavigator.tsx`](../app/src/navigation/MainNavigator.tsx) | Navigation | ✅ |

---

## TypeScript Errors Expected

Since we removed components but other files still reference them, expect errors in:

1. **Services still using TrainingMode type:**
   - `ModeMigrationService.ts`
   - `ProtocolAnalyticsService.ts`
   - `WorkoutEngineRouter.ts`
   - `WorkoutEngine.ts`

2. **Components with mode references:**
   - Any components checking `profile.trainingMode`

**Solution:** These will be fixed in Phase 3 (WorkoutEngine updates)

---

## Next Steps (Phase 3: WorkoutEngine Simplification)

### Files to Update:

1. **`app/src/services/WorkoutEngineRouter.ts`**
   - Remove percentage mode generation
   - Remove mode switching logic
   - Remove mode recommendation logic
   - Simplify to protocol-only routing

2. **`app/src/services/WorkoutEngine.ts`**
   - Remove backward compatibility references
   - Directly use ProtocolWorkoutEngine
   - Update to use 4RMs instead of 1RMs

3. **Archive Migration Services:**
   - `app/src/services/ModeMigrationService.ts` → deprecated/
   - Update `app/src/services/ProtocolAnalyticsService.ts` (remove mode comparison)

---

## Phase 2 Completion Checklist

✅ Deprecated directory structure created  
✅ 5 UI components archived  
✅ WelcomeScreen updated (direct to max determination)  
✅ SettingsScreen updated (training mode link removed)  
✅ MainNavigator updated (routes removed)  
✅ Onboarding flow simplified  
✅ Settings flow simplified  

**Phase 2 Status:** COMPLETE ✅

---

## Estimated Remaining Work

- **Phase 3 (WorkoutEngine):** 45-60 minutes
- **Phase 4 (Service cleanup):** 30 minutes  
- **Phase 5 (Testing):** 60 minutes

**Total Remaining:** ~2.5 hours

---

## User Experience Impact

**Before:** Users chose between two training philosophies  
**After:** Users experience one cohesive protocol-based system (P1/P2/P3)  

**Messaging for Users:**
> "We've streamlined the app to focus exclusively on our proven Protocol Training System, combining the best of formula-driven programming with earned progression through P1/P2/P3 protocols."
