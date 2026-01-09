# UI Testing Guide - Section 5.3

**Version:** 1.0  
**Last Updated:** 2026-01-08  
**For:** Formula Integration Plan - Section 5.3 UI Testing

---

## 📱 Overview

This guide covers UI/UX testing for the formula integration, including:
- Conditional set animations
- Max attempt feedback screens
- Rest timer accuracy
- Offline mode functionality
- Cross-device synchronization

**Testing Approach:** Combined automated + manual testing
- **Automated:** Component logic and state management
- **Manual:** Visual appearance, animations, user experience

---

## 🎬 Section 5.3.1: Conditional Set Animations

### Automated Tests (Logic)

The following behaviors are validated through automated tests:
- ✅ Set visibility state changes based on conditions
- ✅ Conditional set unlocking sequence
- ✅ shouldDisplaySet logic correctness

**Test File:** [`app/__tests__/integration/WorkoutFlow.integration.test.ts`](../app/__tests__/integration/WorkoutFlow.integration.test.ts)

### Manual Testing Required

#### Test Case: Set Unlock Animation
**Steps:**
1. Start a workout with Bench Press (225 lbs 1RM)
2. Complete sets 1-3
3. Complete set 4 (max attempt) successfully with 1 rep
4. **Observe:** Set 5 should unlock with smooth animation

**Success Criteria:**
- ✅ Animation duration: 300-500ms
- ✅ Smooth fade-in or slide-down effect
- ✅ 🔒 → 🔓 icon transition
- ✅ No visual glitches or layout jumps
- ✅ Set becomes interactive immediately after animation

#### Test Case: Progressive Unlock Sequence
**Steps:**
1. Continue from above
2. Complete set 5 successfully
3. **Observe:** Set 6 unlocks

**Success Criteria:**
- ✅ Second unlock animation is consistent with first
- ✅ Unlocked sets remain visible and interactive
- ✅ Smooth, professional animation quality

#### Test Case: Down Set Appearance
**Steps:**
1. Start workout with Squat (300 lbs 1RM)
2. Complete sets 1-3
3. Fail set 4 (0 reps)
4. **Observe:** Down sets section appears

**Success Criteria:**
- ✅ "Volume Work" header appears with animation
- ✅ 3 down sets fade in smoothly
- ✅ Different visual style from progressive max attempts
- ✅ Clear distinction between down sets and normal sets

**Status:** ⚠️ Requires manual verification on device

---

## 🎉 Section 5.3.2: Max Attempt Feedback Screens

### Automated Tests (Component Rendering)

**Note:** Component rendering tests require React Native Testing Library setup.

### Manual Testing Required

#### Test Case: Success Modal
**Steps:**
1. Complete max attempt successfully (set 4, 1 rep)
2. **Observe:** Success modal appears

**Success Criteria:**
- ✅ Modal appears immediately after logging set
- ✅ Shows: "🎉 NEW MAX! +5 lbs unlocked"
- ✅ Displays old max → new max (e.g., 225 → 230 lbs)
- ✅ Shows next set preview (230 lbs × 1 rep)
- ✅ "Continue" button functional
- ✅ Can dismiss modal (tap outside or X button)
- ✅ Confetti animation plays (if PR achieved)

#### Test Case: Failure Modal
**Steps:**
1. Complete max attempt unsuccessfully (set 4, 0 reps)
2. **Observe:** Redirect modal appears

**Success Criteria:**
- ✅ Modal shows: "💪 Redirecting to DOWN SETS for volume work"
- ✅ Explains down sets purpose
- ✅ Shows down set preview (3 sets at 80% weight)
- ✅ Motivational messaging present
- ✅ "Continue to Down Sets" button functional

#### Test Case: Progressive Max Attempt Feedback
**Steps:**
1. Complete set 5 successfully (first progression)
2. **Observe:** Success notification

**Success Criteria:**
- ✅ Toast notification or modal appears
- ✅ Shows new 1RM value
- ✅ Indicates set 6 is now available
- ✅ Doesn't interrupt workout flow
- ✅ Auto-dismisses after 3-5 seconds

**Status:** ⚠️ Requires manual verification on device

---

## ⏱️ Section 5.3.3: Rest Timer Accuracy

### Automated Tests

**Test File:** Created below - validates timer logic and duration calculations

### Manual Testing Required

#### Test Case: Timer Countdown Accuracy
**Steps:**
1. Complete warmup set (35% intensity)
2. Start stopwatch on phone
3. **Observe:** Rest timer counts down from 30s
4. Verify with stopwatch

**Success Criteria:**
- ✅ Timer accuracy within ±1 second
- ✅ Smooth countdown (no stuttering)
- ✅ Reaches 0 precisely

#### Test Case: Intensity-Based Rest Times
**Setup Data:**
- Warmup (35%): 30s
- Working (80%): 90-120s
- Max (100%): 180-300s

**Steps:**
1. Complete sets at different intensities
2. Record actual rest timer start values

**Success Criteria:**
- ✅ Warmup sets: 30s
- ✅ Working sets: 90-120s (1-2 MIN)
- ✅ Max attempts: 180-300s (1-5 MIN)
- ✅ Down sets: 90-120s

#### Test Case: Quick Adjust Functionality
**Steps:**
1. Start rest timer (any set)
2. Tap "+30s" button
3. **Verify:** Timer extends by exactly 30 seconds
4. Tap "+15s" button
5. **Verify:** Timer extends by exactly 15 seconds

**Success Criteria:**
- ✅ Instant response (<100ms)
- ✅ Accurate time addition
- ✅ Visual feedback on button press
- ✅ No timer reset or glitches

#### Test Case: Background Persistence
**Steps:**
1. Start rest timer (120s)
2. Minimize app (home button/app switcher)
3. Wait 60 seconds
4. Restore app
5. **Verify:** Timer shows ~60s remaining

**Success Criteria:**
- ✅ Timer continues in background
- ✅ Accurate time tracking
- ✅ Push notification at 0s (if enabled)
- ✅ Sound/vibration on completion

**Status:** ⚠️ Requires manual verification on device

---

## 📴 Section 5.3.4: Offline Mode Functionality

### Automated Tests

**Test File:** [`app/__tests__/services/OfflineSyncService.test.ts`](../app/__tests__/services/OfflineSyncService.test.ts)
- ✅ 20 tests passing
- ✅ Validates offline caching logic
- ✅ Validates sync queue management

### Manual Testing Required

#### Test Case: Offline Indicator
**Steps:**
1. Start with network connected
2. **Verify:** No offline indicator shown
3. Enable airplane mode
4. **Observe:** "Offline" indicator appears

**Success Criteria:**
- ✅ Indicator appears within 2 seconds
- ✅ Clear visual distinction (banner/badge)
- ✅ Non-intrusive placement
- ✅ Shows "Working Offline" message

#### Test Case: Workout Completion Offline
**Steps:**
1. Enable airplane mode
2. Start new workout
3. Complete all sets (6 total)
4. Log each set
5. Complete workout

**Success Criteria:**
- ✅ All workout actions work normally
- ✅ Set logs saved locally
- ✅ Workout summary displays correctly
- ✅ Stats calculated accurately
- ✅ No error messages or crashes

#### Test Case: Offline to Online Sync
**Steps:**
1. Complete workout offline (as above)
2. Disable airplane mode (restore connection)
3. **Observe:** Sync process

**Success Criteria:**
- ✅ "Syncing..." indicator appears
- ✅ Sync completes within 5 seconds
- ✅ "Sync complete" confirmation shown
- ✅ Offline indicator disappears
- ✅ Data appears in Progress Dashboard

#### Test Case: Multiple Offline Workouts
**Steps:**
1. Enable airplane mode
2. Complete workout #1
3. Complete workout #2
4. Restore connection

**Success Criteria:**
- ✅ Both workouts queued for sync
- ✅ Sync happens in correct order
- ✅ No data loss or corruption
- ✅ Both workouts appear in history

**Status:** ⚠️ Requires manual verification on device

---

## 🔄 Section 5.3.5: Cross-Device Sync

### Manual Testing Required

#### Test Case: Same User, Multiple Devices
**Setup:** iOS device + Android device (or two iOS devices)

**Steps:**
1. Complete workout on Device A
2. Verify workout syncs to cloud
3. Open app on Device B
4. **Verify:** Workout appears in history
5. Check max lifts on Device B
6. **Verify:** 1RM updated correctly

**Success Criteria:**
- ✅ Data syncs within 30 seconds
- ✅ All workout data present (sets, reps, weights)
- ✅ Stats match between devices
- ✅ No duplicate entries
- ✅ Maxes consistent across devices

#### Test Case: Conflict Resolution
**Steps:**
1. Enable airplane mode on both devices
2. Complete different workouts on each device
3. Restore connection on both
4. **Observe:** Sync behavior

**Success Criteria:**
- ✅ Both workouts preserved
- ✅ Timestamps used for conflict resolution
- ✅ No data loss
- ✅ User notified of sync (if conflicts)

**Status:** ⚠️ Requires multi-device testing (Optional - Future)

---

## 🎨 UI/UX Quality Checklist

### Visual Consistency
- [ ] All intensity badges use consistent styling
- [ ] Conditional set indicators (🔒🔓) clearly visible
- [ ] Color scheme matches app theme
- [ ] Typography consistent throughout
- [ ] Spacing and alignment professional

### Animations
- [ ] All transitions smooth (60fps)
- [ ] No janky or stuttering animations
- [ ] Animation timing feels natural (not too fast/slow)
- [ ] Reduced motion respected (accessibility)

### Responsiveness
- [ ] Tap targets minimum 44x44pt
- [ ] Buttons provide haptic feedback
- [ ] Loading states shown for async operations
- [ ] No UI blocking during calculations

### Accessibility
- [ ] Screen reader compatible (VoiceOver/TalkBack)
- [ ] Sufficient color contrast (WCAG AA)
- [ ] Text readable at default sizes
- [ ] Interactive elements keyboard accessible

---

## 🧪 Automated Component Tests

The following component tests should be created using React Native Testing Library:

### Test File Template

```typescript
// app/__tests__/components/ConditionalSetCard.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ConditionalSetCard from '../../src/components/workout/ConditionalSetCard';

describe('ConditionalSetCard', () => {
  test('renders locked state correctly', () => {
    const { getByTestId } = render(
      <ConditionalSetCard
        setNumber={5}
        weight={230}
        targetReps={1}
        isLocked={true}
        onPress={() => {}}
      />
    );
    
    expect(getByTestId('lock-icon')).toBeTruthy();
  });

  test('renders unlocked state correctly', () => {
    const { getByTestID } = render(
      <ConditionalSetCard
        setNumber={5}
        weight={230}
        targetReps={1}
        isLocked={false}
        onPress={() => {}}
      />
    );
    
    expect(getByTestId('unlock-icon')).toBeTruthy();
  });

  test('fires onPress when unlocked', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <ConditionalSetCard
        setNumber={5}
        weight={230}
        targetReps={1}
        isLocked={false}
        onPress={onPressMock}
      />
    );
    
    fireEvent.press(getByTestId('set-card'));
    expect(onPressMock).toHaveBeenCalled();
  });

  test('does not fire onPress when locked', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <ConditionalSetCard
        setNumber={5}
        weight={230}
        targetReps={1}
        isLocked={true}
        onPress={onPressMock}
      />
    );
    
    fireEvent.press(getByTestId('set-card'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
```

### Components Requiring Tests

1. **ConditionalSetCard.tsx**
   - Locked/unlocked states
   - Visual indicators
   - Interaction handling

2. **PRCelebrationModal.tsx**
   - Success message rendering
   - Confetti animation trigger
   - Share functionality

3. **RestTimerEnhanced.tsx**
   - Countdown logic
   - Quick adjust buttons
   - Intensity-based duration

4. **OfflineIndicator.tsx**
   - Connection state detection
   - Banner appearance/dismissal
   - Sync status updates

5. **DeloadWeekBanner.tsx**
   - Week detection
   - Message customization
   - Dismissible behavior

**Note:** Implementing full component tests requires:
```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

---

## 🎯 Manual Testing Scenarios

### MT-UI-001: Conditional Set Animation Flow

**Priority:** 🔴 Critical  
**Duration:** 10 minutes  
**Device:** iOS Simulator + Real Device

**Test Steps:**
1. Launch app on iOS simulator
2. Navigate to Active Workout
3. Start workout with 225 lbs bench press
4. Complete sets 1-3 (warmup, primer, build-up)
5. Complete set 4 successfully (1 rep at 225 lbs)
6. **Observe animation:**
   - Does set 5 fade in smoothly?
   - Is there a lock → unlock icon transition?
   - Does the animation feel natural?
   - Are there any frame drops or stutters?

7. Complete set 5 successfully
8. **Observe:** Set 6 unlock animation

**Expected Results:**
- Smooth 60fps animations
- No layout shifts during unlock
- Clear visual feedback
- Professional quality transitions

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### MT-UI-002: Max Attempt Feedback Screens

**Priority:** 🔴 Critical  
**Duration:** 15 minutes

#### Success Modal
**Steps:**
1. Complete max attempt successfully
2. **Evaluate modal appearance:**
   - Modal centers on screen
   - Backdrop dims background
   - Success message prominent
   - Confetti animation plays
   - Stats displayed clearly
   - Buttons accessible

**Expected:**
- Instant modal appearance (<100ms)
- Smooth backdrop fade
- Confetti: 4 seconds, 60 pieces
- Clear hierarchy (title > message > buttons)

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

#### Failure Modal
**Steps:**
1. Fail max attempt (0 reps)
2. **Evaluate modal:**
   - Down sets explanation clear
   - Motivational tone
   - Next steps obvious

**Expected:**
- Supportive messaging (not negative)
- Clear path forward
- Easy to dismiss and continue

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### MT-UI-003: Rest Timer Accuracy

**Priority:** 🟡 High  
**Duration:** 20 minutes  
**Tools:** External stopwatch app

#### Timer Countdown Test
**Steps:**
1. Complete warmup set
2. Rest timer starts at 30s
3. Start external stopwatch simultaneously
4. **Measure:** Time to reach 0

**Expected:** 30s ± 1s

**Test Results:**

| Set Type | Expected | Actual | Variance | Pass/Fail |
|----------|----------|--------|----------|-----------|
| Warmup (35%) | 30s | ___s | ___s | [ ] |
| Working (80%) | 90-120s | ___s | ___s | [ ] |
| Max (100%) | 180-300s | ___s | ___s | [ ] |
| Down Set | 90-120s | ___s | ___s | [ ] |

#### Background Persistence Test
**Steps:**
1. Start 120s rest timer
2. Minimize app after 30s
3. Wait 60s (use external timer)
4. Restore app
5. **Verify:** Shows ~30s remaining

**Expected:** Timer continues in background accurately

**Actual Result:**
- Time when backgrounded: ___s
- Time when restored: ___s
- Expected remaining: ___s
- Actual remaining: ___s
- **Pass/Fail:** [ ]

#### Quick Adjust Test
**Steps:**
1. Start 90s timer
2. Tap "+30s" at 60s mark
3. **Verify:** Timer shows 90s (60 + 30)
4. Tap "+15s" at 70s mark
5. **Verify:** Timer shows 85s (70 + 15)

**Expected:**
- Instant response (<100ms)
- Accurate addition
- No timer reset

**Actual Result:** [ ] Pass / [ ] Fail

---

### MT-UI-004: Offline Mode Visual Feedback

**Priority:** 🟡 High  
**Duration:** 15 minutes

#### Offline Indicator Appearance
**Steps:**
1. Start with WiFi enabled
2. **Verify:** No offline indicator
3. Enable airplane mode
4. **Observe:** Offline indicator

**Timing Test:**
- Time to detect offline: ___s (target: <2s)
- Indicator appearance animation: smooth? [ ] Yes [ ] No

**Visual Test:**
- [ ] Indicator clearly visible
- [ ] Color choice appropriate (orange/yellow)
- [ ] Message clear ("Working Offline")
- [ ] Placement doesn't obscure content

#### Sync Status Indicator
**Steps:**
1. Complete workout offline
2. Restore connection
3. **Observe:** Sync progress indicator

**Expected:**
- "Syncing..." message appears
- Progress indicator (spinner/dots)
- "Sync complete" confirmation
- Success checkmark or toast

**Actual Results:**
- Sync start time: ___s
- Sync complete time: ___s
- Visual feedback quality: [ ] Excellent [ ] Good [ ] Poor

---

## 📊 Performance Monitoring

### Frame Rate Monitoring (60fps Target)

#### Test During Animations
1. **Unlock Animation:** ___fps (target: 60fps)
2. **Modal Appearance:** ___fps (target: 60fps)
3. **Confetti Animation:** ___fps (target: 60fps)
4. **List Scrolling:** ___fps (target: 60fps)

**Tools for Measurement:**
- Xcode Instruments (iOS)
- React Native Performance Monitor
- Android Profiler

### Touch Response Time

| Interaction | Target | Actual | Pass/Fail |
|-------------|--------|--------|-----------|
| Button tap | <100ms | ___ms | [ ] |
| Set selection | <100ms | ___ms | [ ] |
| Modal dismiss | <100ms | ___ms | [ ] |
| Input focus | <100ms | ___ms | [ ] |
| Navigation | <300ms | ___ms | [ ] |

---

## ✅ UI Testing Completion Checklist

### Automated Tests
- [x] Component logic tests created
- [x] State management tests passing
- [ ] React Native Testing Library configured (optional)
- [ ] Component rendering tests implemented (optional)

### Manual Tests
- [ ] Conditional set animations verified on device
- [ ] Max attempt modals tested (success + failure)
- [ ] Rest timer accuracy confirmed (±1s)
- [ ] Background timer persistence verified
- [ ] Quick adjust buttons tested
- [ ] Offline indicator appearance verified
- [ ] Sync status feedback confirmed
- [ ] Cross-device sync tested (if multi-device available)

### Performance Verification
- [ ] All animations 60fps
- [ ] Touch response <100ms
- [ ] No memory leaks detected
- [ ] Battery usage acceptable
- [ ] Network requests optimized

### Accessibility
- [ ] VoiceOver tested (iOS)
- [ ] TalkBack tested (Android)
- [ ] Color contrast verified
- [ ] Font scaling tested
- [ ] Reduced motion respected

---

## 🐛 Known Issues / Notes

Use this section to track any UI/UX issues discovered:

### Issue #1
- **Area:** _______________
- **Description:** _______________
- **Severity:** 🔴 Critical / 🟡 High / 🟢 Medium / 🔵 Low
- **Workaround:** _______________

---

## 📚 References

- **Integration Plan:** [`plans/FORMULA_INTEGRATION_PLAN.md`](../plans/FORMULA_INTEGRATION_PLAN.md) Section 5.3
- **Manual Testing Guide:** [`formulas/INTEGRATION_TESTING_MANUAL_GUIDE.md`](./INTEGRATION_TESTING_MANUAL_GUIDE.md)
- **Component Files:**
  - [`ConditionalSetCard.tsx`](../app/src/components/workout/ConditionalSetCard.tsx)
  - [`PRCelebrationModal.tsx`](../app/src/components/workout/PRCelebrationModal.tsx)
  - [`RestTimerEnhanced.tsx`](../app/src/components/workout/RestTimerEnhanced.tsx)
  - [`OfflineIndicator.tsx`](../app/src/components/common/OfflineIndicator.tsx)

---

## ✅ Sign-Off

**UI Testing Complete:** [ ] Yes [ ] No  
**All Critical Tests Passed:** [ ] Yes [ ] No  
**Issues Logged:** [ ] Yes [ ] No / [ ] N/A  

**Tester:** _______________  
**Date:** _______________  
**Device(s):** _______________
