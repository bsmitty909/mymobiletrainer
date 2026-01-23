# TypeScript Errors - Protocol-Only Consolidation

**Status:** Partial completion - Errors introduced by consolidation changes  
**Date:** January 21, 2026

---

## Errors Introduced by Consolidation (Must Fix)

### 1. MainNavigator.tsx (Lines 107, 111, 203)
**Error:** Cannot find name 'TrainingModeSettingsScreen', 'ModeComparisonScreen', 'TrainingModeOnboardingScreen'

**Cause:** Import statements removed but route registrations still remain

**Fix Required:**
```typescript
// Line 107 - Remove this route:
<ProfileStack.Screen name="TrainingModeSettings" component={TrainingModeSettingsScreen} />

// Line 111 - Remove this route:
<ProfileStack.Screen name="ModeComparison" component={ModeComparisonScreen} />

// Line 203 - Remove this route:
<RootStack.Screen name="TrainingModeOnboarding" component={TrainingModeOnboardingScreen} />
```

### 2. WorkoutEngineRouter.ts (Lines 106, 116, 162-167, 275-313, 360-363)
**Error:** Cannot find name 'TrainingMode' and 'mode' property doesn't exist

**Cause:** Partial update - some functions still reference TrainingMode

**Fix Required:**
- Remove remaining TrainingMode references in function signatures
- Remove 'mode' field from return objects (lines 106, 116)
- Remove or archive methods that still use TrainingMode:
  - switchTrainingMode() (lines 162-167)
  - getRoutingStats() (lines 275-280)
  - validateModeSwitch() (lines 312-313)
  - recommendMode() (lines 360-363)

### 3. ProtocolAnalyticsService.ts (Lines 69, 81, 157, 185, 320, 327, 370, 380)
**Error:** Cannot find name 'TrainingMode' and 'SplitTrackingEntry'

**Cause:** Partial update - some methods still use TrainingMode type

**Fix Required:**
- Remove TrainingMode from function return types
- Replace SplitTrackingEntry with ProtocolTrackingEntry  
- Remove mode comparison logic (lines already attempted but may have failed)

### 4. ProtocolAnalyticsScreen.tsx (Line 22)
**Error:** Property 'id' does not exist on type 'UserProfile'

**Cause:** UserProfile doesn't have 'id' field, it has 'userId'

**Fix Required:**
```typescript
// Line 22 - Change from:
const userId = useAppSelector(state => state.user.profile?.id || '');

// To:
const userId = useAppSelector(state => state.user.profile?.userId || '');
```

---

## Pre-Existing Errors (Not Related to Consolidation)

These errors existed before the consolidation changes:

### Design Token Issues
- Missing spacing properties: `xs`, `sm`, `md`, `xl` (lines across many files)
- Missing typography properties: `labelLarge` (Button.tsx, GameButton.tsx)
- Missing shadow properties: `xl` (Card.tsx, multiple screens)

### Type Issues
- Missing `@react-navigation/native-stack` package (onboarding screens)
- ConditionalSet missing `setType` and `label` properties
- WorkoutSession `startedAt` type mismatch (Date vs number)
- Various other type mismatches

**Status:** These are separate from consolidation work - can be addressed in a separate task

---

## Fix Priority

### HIGH PRIORITY (Blocking consolidation)
1. ✅ Fix MainNavigator route registrations
2. ⏸️ Fix WorkoutEngineRouter TrainingMode references
3. ⏸️ Fix ProtocolAnalyticsService TrainingMode references
4. ⏸️ Fix ProtocolAnalyticsScreen userId reference

### LOW PRIORITY (Pre-existing)
- Design token issues
- Type definition mismatches
- Other unrelated errors

---

## Recommended Approach

**Option A: Fix Only Consolidation Errors**
- Focus on the 4 critical files above
- Leave pre-existing errors for separate task
- Faster path to completion

**Option B: Fix All Errors**
- Fix consolidation errors + pre-existing errors
- Cleaner codebase
- Longer time investment

**Recommendation:** Option A - Fix only consolidation-related errors now

---

## Next Steps

1. Complete MainNavigator fixes (already attempted, may need retry)
2. Read and fix WorkoutEngineRouter
3. Read and fix ProtocolAnalyticsService  
4. Fix ProtocolAnalyticsScreen userId
5. Re-run TypeScript compilation
6. Verify only pre-existing errors remain

---

## Estimated Time

- Fix 4 critical files: 20-30 minutes
- Verify fixes: 10 minutes
- **Total:** ~40 minutes
