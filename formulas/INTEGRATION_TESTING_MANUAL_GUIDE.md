# Integration Testing - Manual Testing Guide

**Version:** 1.0  
**Last Updated:** 2026-01-08  
**For:** Formula Integration Plan - Section 5.2

---

## 📋 Overview

This guide provides step-by-step instructions for manually testing the complete formula integration. Use this in conjunction with the automated integration tests to ensure full system validation.

**Prerequisites:**
- App running on device/simulator
- Test user account created
- Clean database state OR existing user with known maxes

---

## Test Suite Organization

| Test ID | Test Name | Priority | Duration |
|---------|-----------|----------|----------|
| **MT-001** | End-to-End Workout Flow (Success Path) | 🔴 Critical | 15 min |
| **MT-002** | End-to-End Workout Flow (Failure Path) | 🔴 Critical | 15 min |
| **MT-003** | Max Determination Week Flow | 🔴 Critical | 20 min |
| **MT-004** | Progressive Max Attempts (3+ Successes) | 🟡 High | 10 min |
| **MT-005** | Down Set Redirect on Failure | 🟡 High | 10 min |
| **MT-006** | Week-to-Week Progression Tracking | 🟢 Medium | 15 min |
| **MT-007** | Conditional Set Animations | 🟢 Medium | 5 min |
| **MT-008** | Rest Timer Accuracy | 🟢 Medium | 5 min |
| **MT-009** | Offline Mode Functionality | 🔵 Low | 10 min |
| **MT-010** | 4-Week Mini Program | 🟡 High | 60 min |

**Total Estimated Time:** 2.5 hours

---

## 🔴 MT-001: End-to-End Workout Flow (Success Path)

**Goal:** Verify complete workout from start to finish with successful max attempts and progression

### Test Data
- **User:** test-user-001
- **Exercise:** Bench Press
- **Starting 1RM:** 225 lbs
- **Expected Outcome:** +10 lbs progression (225 → 235 lbs)

### Steps

#### 1. Pre-Test Setup
- [ ] Navigate to Profile → Max Lifts
- [ ] Set Bench Press 1RM to 225 lbs
- [ ] Note the date and current max

#### 2. Start Workout
- [ ] Navigate to Workout Dashboard
- [ ] Select "Week 1, Day 1" (or next available workout)
- [ ] Verify workout preview shows:
  - Set 1: ~80 lbs × 6 reps (35%)
  - Set 2: 180 lbs × 1 rep (80%)
  - Set 3: 205 lbs × 1 rep (90%)
  - Set 4: 225 lbs × 1 rep (100%)
  - Sets 5-6: Shown as "Bonus Sets (unlock during workout)"
- [ ] Tap "Start Workout"

#### 3. Complete Set 1 (Warmup)
- [ ] Verify displayed weight: 80 lbs
- [ ] Verify intensity badge: "35% - Warmup"
- [ ] Complete 6 reps
- [ ] Log set
- [ ] **Expected:** Rest timer starts at 30 seconds
- [ ] **Expected:** Set card shows checkmark ✅

#### 4. Complete Set 2 (Primer)
- [ ] Verify displayed weight: 180 lbs
- [ ] Verify intensity badge: "80% - Heavy"
- [ ] Complete 1 rep
- [ ] Log set
- [ ] **Expected:** Rest timer starts at 90-120 seconds (1-2 MIN)
- [ ] **Expected:** Plate calculator shows plate breakdown

#### 5. Complete Set 3 (Build-up)
- [ ] Verify displayed weight: 205 lbs
- [ ] Verify intensity badge: "90% - Near Max"
- [ ] Complete 1 rep
- [ ] Log set
- [ ] **Expected:** Rest timer starts at 120-180 seconds

#### 6. Complete Set 4 (Max Attempt)
- [ ] Verify displayed weight: 225 lbs
- [ ] Verify intensity badge: "100% - Max Effort"
- [ ] Verify guidance text mentions max attempt
- [ ] Complete 1 rep successfully
- [ ] Log set
- [ ] **Expected:** 🎉 Success modal appears: "NEW MAX! +5 lbs unlocked"
- [ ] **Expected:** Set 5 unlocks and becomes visible (230 lbs)
- [ ] **Expected:** No down sets appear
- [ ] Dismiss modal

#### 7. Complete Set 5 (First Progression)
- [ ] **Verify:** Set 5 is now visible and unlocked
- [ ] Verify displayed weight: 230 lbs (+5 lbs)
- [ ] Verify intensity badge: "105% - Over Max"
- [ ] Complete 1 rep successfully
- [ ] Log set
- [ ] **Expected:** Success notification appears
- [ ] **Expected:** Set 6 unlocks (235 lbs)
- [ ] **Expected:** New 1RM updated to 230 lbs

#### 8. Complete Set 6 (Second Progression)
- [ ] **Verify:** Set 6 is now visible and unlocked
- [ ] Verify displayed weight: 235 lbs (+10 lbs from original)
- [ ] Complete 1 rep successfully
- [ ] Log set
- [ ] **Expected:** Success notification
- [ ] **Expected:** New 1RM updated to 235 lbs

#### 9. Finish Workout
- [ ] Tap "Complete Workout"
- [ ] **Expected:** Workout Summary Screen shows:
  - Total sets: 6
  - Total volume: ~1,320 lbs (calculation check)
  - New PR: 235 lbs (+10 lbs) 🎉
  - Progression badge displayed
- [ ] **Expected:** Confetti animation plays
- [ ] **Expected:** Share button available

#### 10. Verify Persistence
- [ ] Navigate to Profile → Max Lifts
- [ ] **Verify:** Bench Press 1RM now shows 235 lbs
- [ ] Navigate to Progress Dashboard
- [ ] **Verify:** Week 1 shows +10 lbs gain
- [ ] **Verify:** Progression chart updated

### Success Criteria
- ✅ All 6 sets completed
- ✅ Set 5 and 6 unlocked in sequence
- ✅ 1RM increased from 225 → 235 lbs
- ✅ No down sets generated
- ✅ Stats accurately calculated
- ✅ Data persisted correctly

---

## 🔴 MT-002: End-to-End Workout Flow (Failure Path)

**Goal:** Verify down set generation when max attempt fails

### Test Data
- **User:** test-user-002
- **Exercise:** Squat
- **Starting 1RM:** 300 lbs
- **Expected Outcome:** Down sets generated, 1RM unchanged

### Steps

#### 1. Pre-Test Setup
- [ ] Set Squat 1RM to 300 lbs
- [ ] Start new workout

#### 2. Complete Sets 1-3
- [ ] Complete warmup set (105 lbs × 6)
- [ ] Complete primer set (240 lbs × 1)
- [ ] Complete build-up set (270 lbs × 1)

#### 3. Fail Set 4 (Max Attempt)
- [ ] Attempt 300 lbs × 1
- [ ] **Log 0 reps (failure)**
- [ ] **Expected:** Modal appears: "💪 Redirecting to DOWN SETS for volume work"
- [ ] **Expected:** Down sets section appears with 3 sets at 240 lbs (80%)
- [ ] **Expected:** Sets 5-6 (progressive max attempts) do NOT appear

#### 4. Complete Down Sets
- [ ] **Verify:** Down Set 1 shows 240 lbs × 8 reps
- [ ] Complete 8 reps, log set
- [ ] **Verify:** Down Set 2 shows 240 lbs × 8 reps
- [ ] Complete 8 reps, log set
- [ ] **Verify:** Down Set 3 shows 240 lbs × "REP OUT"
- [ ] Complete max reps (e.g., 10), log set
- [ ] **Expected:** Motivational message displayed

#### 5. Finish Workout
- [ ] Complete workout
- [ ] **Expected:** Summary shows:
  - Total sets: 6 (3 base + 3 down sets)
  - No PR achieved
  - 1RM maintained at 300 lbs
  - Volume work completed banner

#### 6. Verify Persistence
- [ ] **Verify:** Squat 1RM still 300 lbs (unchanged)
- [ ] **Verify:** Workout marked as completed
- [ ] **Verify:** Down set completion tracked

### Success Criteria
- ✅ Down sets generated after set 4 failure
- ✅ 3 down sets at 80% weight (240 lbs)
- ✅ Last down set marked as "REP OUT"
- ✅ 1RM remained at 300 lbs
- ✅ No progressive max attempt sets shown

---

## 🔴 MT-003: Max Determination Week Flow

**Goal:** Complete initial max testing for new user

### Test Data
- **User:** new-user-001 (fresh account)
- **Exercise:** Deadlift
- **Expected Outcome:** Determine 1RM through progressive loading

### Steps

#### 1. Onboarding Flow
- [ ] Create new user account
- [ ] **Expected:** "Establish Your Maxes" onboarding screen appears
- [ ] **Verify:** List of exercises shown:
  - Bench Press
  - Squat
  - Deadlift
  - Overhead Press
  - Barbell Row
- [ ] **Verify:** Video tutorial links present
- [ ] Tap "Start Max Testing"

#### 2. Select Exercise
- [ ] Select "Deadlift"
- [ ] **Expected:** Max Testing Screen appears
- [ ] **Verify:** Starting weight: 45 lbs
- [ ] **Verify:** Instructions: "Complete 1 rep, then increase by 5 lbs..."
- [ ] **Verify:** Weight adjustment buttons: +5, -5, +25, -25

#### 3. Progressive Testing
- [ ] Attempt 45 lbs × 1 rep → Success
- [ ] Tap "+5 lbs" → Now 50 lbs
- [ ] Attempt 50 lbs × 1 rep → Success
- [ ] Tap "+5 lbs" → Now 55 lbs
- [ ] Continue pattern: 60, 65, 70, 75, 80, 85, 90, 95, 100
- [ ] Attempt 105 lbs × 1 rep → **Failure**
- [ ] Tap "Mark as Max"

#### 4. Confirm Max
- [ ] **Expected:** "Max determined: 100 lbs" confirmation
- [ ] **Expected:** "Progress: 1/5 exercises complete"
- [ ] **Verify:** Option to "Continue to next exercise" OR "Save and exit"

#### 5. Complete All Exercises (Optional)
- [ ] Repeat for remaining 4 exercises
- [ ] OR tap "Save and exit"

#### 6. View Summary
- [ ] Navigate to Max Summary Screen
- [ ] **Expected:** All determined maxes displayed:
  - Deadlift: 100 lbs ✅
  - Others: TBD or completed
- [ ] **Expected:** Strength score calculated
- [ ] **Expected:** Percentile ranking shown
- [ ] **Expected:** "Ready to start Week 1!" CTA

#### 7. Verify Persistence
- [ ] Navigate to Profile → Max Lifts
- [ ] **Verify:** Deadlift 1RM: 100 lbs
- [ ] **Verify:** Date achieved: Today
- [ ] Navigate to Workout Dashboard
- [ ] **Verify:** Week 1 workouts now available

### Success Criteria
- ✅ Progressive weight testing works (+5 lb increments)
- ✅ Max correctly determined (last successful weight)
- ✅ Progress tracking accurate (X/5 exercises)
- ✅ Maxes saved to profile
- ✅ Week 1 workouts unlocked
- ✅ Strength score calculated

---

## 🟡 MT-004: Progressive Max Attempts (3+ Consecutive Successes)

**Goal:** Verify ability to unlock and complete multiple progressive max attempts

### Test Data
- **User:** test-user-003
- **Exercise:** Bench Press
- **Starting 1RM:** 200 lbs
- **Expected Outcome:** 3 consecutive progressions (200 → 215 lbs)

### Steps

#### 1. Setup
- [ ] Set Bench Press 1RM to 200 lbs
- [ ] Start workout

#### 2. Complete Base Pyramid
- [ ] Complete sets 1-3 (warmup, primer, build-up)

#### 3. Set 4: 200 lbs × 1 (SUCCESS)
- [ ] Complete successfully
- [ ] **Verify:** Set 5 unlocks (205 lbs)

#### 4. Set 5: 205 lbs × 1 (SUCCESS)
- [ ] Complete successfully
- [ ] **Verify:** Set 6 unlocks (210 lbs)
- [ ] **Verify:** New 1RM: 205 lbs

#### 5. Set 6: 210 lbs × 1 (SUCCESS)
- [ ] Complete successfully
- [ ] **Verify:** Set 7 unlocks (215 lbs)
- [ ] **Verify:** New 1RM: 210 lbs

#### 6. Set 7: 215 lbs × 1 (SUCCESS)
- [ ] Complete successfully
- [ ] **Verify:** New 1RM: 215 lbs
- [ ] **Verify:** No Set 8 (optional stopping point)

#### 7. Finish Workout
- [ ] Complete workout
- [ ] **Verify:** Total progression: +15 lbs
- [ ] **Verify:** All 7 sets logged

### Success Criteria
- ✅ Each successful set unlocks next progression
- ✅ Weights increase by +5 lbs each time
- ✅ 1RM updates after each success
- ✅ User can continue beyond set 6 if successful

---

## 🟡 MT-005: Down Set Redirect on Failure

**Goal:** Verify correct down set generation timing and behavior

### Test Data
- **User:** test-user-004
- **Exercise:** Overhead Press
- **Starting 1RM:** 135 lbs

### Steps

#### 1. Scenario A: Fail on Set 4
- [ ] Complete sets 1-3
- [ ] Fail set 4 (0 reps at 135 lbs)
- [ ] **Verify:** Down sets immediately appear
- [ ] **Verify:** 3 down sets at 110 lbs (80%)
- [ ] **Verify:** Sets 5-6 (progressive) do NOT appear

#### 2. Scenario B: Succeed Set 4, Fail Set 5
- [ ] Complete sets 1-4 successfully
- [ ] **Verify:** Set 5 unlocks (140 lbs)
- [ ] Fail set 5 (0 reps)
- [ ] **Verify:** Down sets appear at position 6
- [ ] **Verify:** Set 6 (second progression) does NOT appear

#### 3. Complete Down Sets
- [ ] Complete all 3 down sets
- [ ] **Verify:** Rep counts: 8, 8, REP OUT
- [ ] **Verify:** Rest periods: 1-2 MIN, 1-2 MIN, 1 MIN

### Success Criteria
- ✅ Down sets only appear after max attempt failure
- ✅ Down sets at correct weight (80%)
- ✅ Last down set is "REP OUT"
- ✅ Progressive max attempts stop after failure

---

## 🟢 MT-006: Week-to-Week Progression Tracking

**Goal:** Verify progression tracking across multiple weeks

### Test Data
- **User:** test-user-005
- **Exercise:** Squat
- **Starting 1RM:** 225 lbs (Week 1)

### Steps

#### 1. Week 1
- [ ] Complete Week 1, Day 1 with +5 lb progression
- [ ] **Verify:** New 1RM: 230 lbs
- [ ] Navigate to Progress Dashboard
- [ ] **Verify:** Week 1 shows +5 lbs gain

#### 2. Week 2
- [ ] Complete Week 2, Day 1 with +5 lb progression
- [ ] **Verify:** New 1RM: 235 lbs
- [ ] **Verify:** Week 2 shows +5 lbs gain
- [ ] **Verify:** Total gain: +10 lbs

#### 3. Week 3
- [ ] Complete Week 3, Day 1 with +5 lb progression
- [ ] **Verify:** New 1RM: 240 lbs
- [ ] **Verify:** Progression chart shows upward trend

#### 4. Week 4
- [ ] Complete Week 4, Day 1 with +5 lb progression
- [ ] **Verify:** New 1RM: 245 lbs
- [ ] **Verify:** 4-week total: +20 lbs
- [ ] **Verify:** Milestone badge appears (if applicable)

#### 5. Progression History
- [ ] Navigate to Weekly Progress Screen
- [ ] **Verify:** Chart shows all 4 weeks
- [ ] **Verify:** Gain per week displayed
- [ ] **Verify:** "Strength Gained: +20 lbs in 4 weeks" banner

### Success Criteria
- ✅ Each week tracked separately
- ✅ Cumulative gain calculated correctly
- ✅ Chart visualizes progression
- ✅ Milestone badges awarded
- ✅ Comparison to program start baseline

---

## 🟢 MT-007: Conditional Set Animations

**Goal:** Verify smooth UI transitions for conditional set unlocking

### Test Data
- **User:** test-user-006
- **Exercise:** Any
- **Focus:** UI/UX animations

### Steps

#### 1. Initial State
- [ ] Start workout
- [ ] **Verify:** Only sets 1-4 visible
- [ ] **Verify:** Sets 5-6 show 🔒 locked indicator or hidden

#### 2. Unlock Animation
- [ ] Complete set 4 successfully
- [ ] **Observe:** Set 5 unlock animation
  - [ ] Smooth fade-in or slide-down
  - [ ] Lock icon → Checkmark transition
  - [ ] Duration: ~300-500ms
- [ ] **Verify:** Set 5 now interactive

#### 3. Progressive Unlock
- [ ] Complete set 5 successfully
- [ ] **Observe:** Set 6 unlock animation
- [ ] **Verify:** Both sets 5 and 6 now visible
- [ ] **Verify:** No visual glitches or jumps

#### 4. Down Set Appearance
- [ ] In a separate workout, fail set 4
- [ ] **Observe:** Down sets appear animation
- [ ] **Verify:** "Volume Work" header appears
- [ ] **Verify:** Special styling for down sets (different color/icon)

### Success Criteria
- ✅ Smooth animations (no lag)
- ✅ Clear visual feedback
- ✅ Locked/unlocked states distinct
- ✅ Down sets visually distinguished
- ✅ No UI flickering or layout shifts

---

## 🟢 MT-008: Rest Timer Accuracy

**Goal:** Verify rest timer matches intensity levels

### Test Data
- **User:** test-user-007
- **Exercise:** Bench Press (225 lbs)

### Steps

#### 1. Warmup Rest (30s)
- [ ] Complete set 1 (80 lbs, 35%)
- [ ] **Verify:** Timer starts at 30 seconds
- [ ] **Verify:** Timer counts down accurately
- [ ] **Verify:** Sound/vibration at 0 seconds (if enabled)

#### 2. Working Set Rest (1-2 MIN)
- [ ] Complete set 2 (180 lbs, 80%)
- [ ] **Verify:** Timer starts at 90-120 seconds
- [ ] **Verify:** Quick adjust buttons present (+15s, +30s)
- [ ] Test quick adjust: Tap +30s
- [ ] **Verify:** Timer extends by 30s

#### 3. Max Attempt Rest (1-5 MIN)
- [ ] Complete set 4 (225 lbs, 100%)
- [ ] **Verify:** Timer starts at 180-300 seconds
- [ ] **Verify:** "Why this rest period?" explanation shown
- [ ] **Verify:** Intensity badge: "100% - Max Effort"

#### 4. Rest Timer Persistence
- [ ] During rest period, minimize app
- [ ] Wait 30 seconds
- [ ] Restore app
- [ ] **Verify:** Timer continued in background
- [ ] **Verify:** Notification shown (if enabled)

### Success Criteria
- ✅ Rest times match intensity levels
- ✅ Timer accuracy within ±1 second
- ✅ Quick adjust buttons work
- ✅ Background persistence works
- ✅ Notifications fire correctly

---

## 🔵 MT-009: Offline Mode Functionality

**Goal:** Verify workout completion without network

### Test Data
- **User:** test-user-008
- **Exercise:** Any
- **Starting State:** Online

### Steps

#### 1. Start Workout Online
- [ ] Start workout with network connected
- [ ] Complete set 1
- [ ] **Verify:** Data saves normally

#### 2. Go Offline
- [ ] Enable airplane mode (or disable WiFi/data)
- [ ] **Verify:** "Offline" indicator appears
- [ ] Complete set 2
- [ ] **Verify:** Set logs locally

#### 3. Continue Offline
- [ ] Complete remaining sets (3-6)
- [ ] **Verify:** All sets log successfully
- [ ] Complete workout
- [ ] **Verify:** Workout marked complete
- [ ] **Verify:** Summary screen shows all data

#### 4. Return Online
- [ ] Disable airplane mode
- [ ] **Verify:** "Syncing..." indicator appears
- [ ] Wait for sync
- [ ] **Verify:** "Sync complete" message
- [ ] **Verify:** Offline indicator disappears

#### 5. Verify Data Sync
- [ ] Navigate to Progress Dashboard
- [ ] **Verify:** Workout appears in history
- [ ] **Verify:** Stats calculated correctly
- [ ] Close and reopen app
- [ ] **Verify:** Data persisted

### Success Criteria
- ✅ Offline indicator appears
- ✅ All workout actions work offline
- ✅ Data queued for sync
- ✅ Auto-sync on reconnection
- ✅ No data loss
- ✅ Sync conflicts resolved

---

## 🟡 MT-010: 4-Week Mini Program

**Goal:** Complete realistic 4-week program with mixed results

### Test Data
- **User:** test-user-009
- **Exercise:** Bench Press
- **Starting 1RM:** 185 lbs
- **Duration:** ~60 minutes (can be spread over days)

### Weekly Plan

#### Week 1: Full Success
- [ ] Day 1: Complete with +5 lb progression → 190 lbs
- [ ] Day 2: Complete with +5 lb progression → 195 lbs
- [ ] Day 3: Complete with +5 lb progression → 200 lbs
- [ ] **Verify:** Week 1 gain: +15 lbs

#### Week 2: Mixed Results
- [ ] Day 1: Complete with +5 lb progression → 205 lbs
- [ ] Day 2: Fail max attempt, down sets → 205 lbs (no gain)
- [ ] Day 3: Complete with +5 lb progression → 210 lbs
- [ ] **Verify:** Week 2 gain: +10 lbs

#### Week 3: Partial Success
- [ ] Day 1: Complete with +5 lb progression → 215 lbs
- [ ] Day 2: Complete with +5 lb progression → 220 lbs
- [ ] Day 3: Fail max attempt, down sets → 220 lbs
- [ ] **Verify:** Week 3 gain: +10 lbs

#### Week 4: Recovery and Push
- [ ] Day 1: Fail max attempt, down sets → 220 lbs
- [ ] Day 2: Complete with +5 lb progression → 225 lbs
- [ ] Day 3: Complete with +10 lb progression → 235 lbs
- [ ] **Verify:** Week 4 gain: +15 lbs

### Final Analysis
- [ ] Navigate to Progress Dashboard
- [ ] **Verify:** Total gain: +50 lbs (185 → 235)
- [ ] **Verify:** Success rate: ~75% (9/12 workouts)
- [ ] **Verify:** Progression chart shows realistic pattern
- [ ] **Verify:** Volume trends upward
- [ ] **Verify:** Milestone badges earned

### Success Criteria
- ✅ 12 workouts completed
- ✅ Mix of successes and failures handled
- ✅ Progression tracking accurate across 4 weeks
- ✅ Stats and analytics correct
- ✅ User experience smooth throughout
- ✅ Realistic gain: 40-60 lbs over 4 weeks

---

## 📊 Test Results Recording

### Test Session Information
- **Date:** _____________
- **Tester:** _____________
- **Device:** _____________
- **OS Version:** _____________
- **App Version:** _____________

### Results Summary

| Test ID | Status | Notes | Issues Found |
|---------|--------|-------|--------------|
| MT-001 | ⬜ Pass ⬜ Fail | | |
| MT-002 | ⬜ Pass ⬜ Fail | | |
| MT-003 | ⬜ Pass ⬜ Fail | | |
| MT-004 | ⬜ Pass ⬜ Fail | | |
| MT-005 | ⬜ Pass ⬜ Fail | | |
| MT-006 | ⬜ Pass ⬜ Fail | | |
| MT-007 | ⬜ Pass ⬜ Fail | | |
| MT-008 | ⬜ Pass ⬜ Fail | | |
| MT-009 | ⬜ Pass ⬜ Fail | | |
| MT-010 | ⬜ Pass ⬜ Fail | | |

### Overall Assessment
- **Pass Rate:** ___/10 tests
- **Critical Issues:** ___
- **Minor Issues:** ___
- **Ready for Release:** ⬜ Yes ⬜ No

---

## 🐛 Issue Tracking Template

When you find an issue during testing, document it here:

### Issue #___
- **Test ID:** MT-___
- **Severity:** 🔴 Critical / 🟡 High / 🟢 Medium / 🔵 Low
- **Title:** Brief description
- **Steps to Reproduce:**
  1. 
  2. 
  3. 
- **Expected Result:** 
- **Actual Result:** 
- **Screenshots:** (if applicable)
- **Workaround:** (if known)

---

## 📝 Notes & Observations

Use this section for general observations, suggestions, or edge cases discovered during testing:

---

## ✅ Sign-Off

- [ ] All critical tests (🔴) passed
- [ ] All high priority tests (🟡) passed
- [ ] Issues logged and prioritized
- [ ] Test results documented
- [ ] Ready for next phase

**Tester Signature:** _______________  
**Date:** _______________

---

## 📚 References

- **Formula Integration Plan:** [`plans/FORMULA_INTEGRATION_PLAN.md`](../plans/FORMULA_INTEGRATION_PLAN.md)
- **Automated Tests:** [`app/__tests__/integration/WorkoutFlow.integration.test.ts`](../app/__tests__/integration/WorkoutFlow.integration.test.ts)
- **Formula Reference:** [`formulas/FORMULA_IMPLEMENTATION_GUIDE.md`](./FORMULA_IMPLEMENTATION_GUIDE.md)
