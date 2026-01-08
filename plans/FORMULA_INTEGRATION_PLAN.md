# Formula Integration & App Rework - Implementation Plan

## Overview
This plan outlines the complete integration of extracted Asa B 2020 formulas into the mobile app, including WorkoutEngine updates, UI rework, and suggested improvements.

---

## Phase 1: Backend Integration (WorkoutEngine)

### 1.1 WorkoutEngine Core Updates
- [ ] Replace FormulaCalculator import with FormulaCalculatorEnhanced
- [ ] Update `createWorkoutSession()` to use pyramid set generation
- [ ] Implement `generateWorkoutSets()` using `generatePyramidSets()`
- [ ] Add conditional set evaluation logic
- [ ] Update `logSet()` to check set conditions and unlock next sets
- [ ] Implement `evaluateSetProgression()` for real-time feedback

### 1.2 Progression Logic
- [ ] Add `evaluateMaxAttemptResult()` method
- [ ] Implement automatic +5 lb progression on successful max attempts
- [ ] Add down set generation when max attempts fail
- [ ] Create `shouldShowDownSets()` logic
- [ ] Update `completeWorkout()` to calculate new 1RMs

### 1.3 Database Schema Updates
- [ ] Add `conditionalSets` table for conditional set tracking
- [ ] Add `maxAttemptResults` table for progression history
- [ ] Add `weeklyMaxes` table for week-to-week tracking
- [ ] Add `intensity_percentage` field to sets table
- [ ] Add `is_conditional` and `condition_met` fields to sets
- [ ] Create migration scripts

---

## Phase 2: UI/UX Rework

### 2.1 Active Workout Screen Redesign
- [ ] **Set Card Redesign**
  - [ ] Show intensity percentage badge (35%, 80%, 90%, 100%)
  - [ ] Display conditional set indicator (🔒 locked, ✓ unlocked)
  - [ ] Add "Previous: X reps @ Y lbs" info
  - [ ] Show suggested weight with reasoning tooltip
  
- [ ] **Progressive Disclosure**
  - [ ] Hide conditional sets until conditions met
  - [ ] Animate set unlock when previous set completed
  - [ ] Show "Complete previous set to unlock" message
  
- [ ] **Max Attempt Feedback**
  - [ ] Success screen: "🎉 NEW MAX! +5 lbs unlocked"
  - [ ] Failure screen: "💪 Redirecting to DOWN SETS for volume work"
  - [ ] Progress bar showing sets completed
  
- [ ] **Down Sets UI**
  - [ ] Special "Volume Work" section header
  - [ ] Auto-populate weight at 80% of max
  - [ ] "REP OUT" indicator for final set
  - [ ] Rep counter with "Keep going!" encouragement

### 2.2 Workout Detail Screen (Pre-Workout)
- [ ] Show complete pyramid structure preview
- [ ] Display intensity percentages for each set
- [ ] Show conditional sets as "Bonus Sets (unlock during workout)"
- [ ] Add "Estimated Duration" based on rest periods
- [ ] Show "Last Time" comparison data

### 2.3 Rest Timer Enhancements
- [ ] Auto-calculate rest based on intensity
  - 30s for ≤35% (warmup)
  - 1-2 MIN for 65-80% (working)
  - 1-5 MIN for ≥90% (max attempts)
- [ ] Show "Why this rest period?" explanation
- [ ] Add quick adjust buttons (+30s, -30s)
- [ ] Show intensity-based fatigue indicator

---

## Phase 3: New Features

### 3.1 Max Determination Week
- [ ] **Onboarding Flow**
  - [ ] Create "Establish Your Maxes" onboarding screen
  - [ ] List all 10 exercises to test
  - [ ] Show video tutorials for each exercise
  
- [ ] **Max Testing Screen**
  - [ ] Progressive weight selector (starts at 45 lbs)
  - [ ] "+5 lbs" button for each successful rep
  - [ ] "Mark as Max" button when failure occurs
  - [ ] Progress: "3/10 exercises complete"
  - [ ] Save and continue later option
  
- [ ] **Max Summary Screen**
  - [ ] Display all established maxes
  - [ ] Calculate strength score percentile
  - [ ] Show "Ready to start Week 1!" CTA

### 3.2 Conditional Set System
- [ ] **Set Condition Evaluator**
  - [ ] Create `SetConditionChecker` service
  - [ ] Implement `checkCondition()` for each condition type
  - [ ] Add real-time condition checking on set completion
  
- [ ] **Visual Indicators**
  - [ ] 🔒 Locked sets (greyed out)
  - [ ] 🔓 Unlocked sets (highlighted)
  - [ ] ⏳ Pending conditions (pulsing)
  - [ ] ✅ Completed sets

### 3.3 Progression Tracking
- [ ] **Weekly Progress Screen**
  - [ ] Show +5 lb progressions week-over-week
  - [ ] Display "Strength Gained: +X lbs in Y weeks"
  - [ ] Chart of 1RM progression per exercise
  - [ ] Milestone badges (10 lb, 25 lb, 50 lb gains)
  
- [ ] **Max Attempt History**
  - [ ] Log all max attempts (success/fail)
  - [ ] Show success rate percentage
  - [ ] Display "Best lifts last 30 days"
  - [ ] Compare to program start baseline

---

## Phase 4: Improvements & Enhancements

### 4.1 Smart Weight Suggestions
- [ ] **Contextual Recommendations**
  - [ ] Analyze last 3 workouts for trends
  - [ ] Adjust for rest days (more rest = suggest +5 lbs)
  - [ ] Fatigue detection (consecutive failures = suggest -5 lbs)
  - [ ] Form check prompts when weight increases >10%
  
- [ ] **Plate Calculator**
  - [ ] Convert total weight to plate combinations
  - [ ] Example: "225 lbs = 45 lb bar + (2×45) + (2×25) per side"
  - [ ] Support different gym equipment (dumbbells, machines)
  - [ ] Custom plate sets (some gyms lack 2.5 lb plates)

### 4.2 Advanced Periodization
- [ ] **Deload Week Detection**
  - [ ] Suggest deload every 4-6 weeks
  - [ ] Automatically reduce intensity to 70%
  - [ ] Show "Recovery Week" banner
  
- [ ] **Intensity Waves**
  - [ ] Implement 3-week wave: 85%, 90%, 95%
  - [ ] Auto-schedule based on week number
  - [ ] Visual wave pattern in progress screen
  
- [ ] **Training Max Adjustment**
  - [ ] Option to set training max at 90% of true max
  - [ ] "Conservative" mode for beginners
  - [ ] Prevent overreaching

### 4.3 Exercise Library Integration
- [ ] **Exercise Data Enhancement**
  - [ ] Add equipment type (barbell, dumbbell, machine)
  - [ ] Set increment size per equipment (2.5 vs 5 lbs)
  - [ ] Primary muscle groups
  - [ ] Alternate exercises with formulas
  
- [ ] **Exercise Substitution**
  - [ ] "Can't do this exercise?" button
  - [ ] Show alternates with adjusted formulas
  - [ ] Example: Barbell Bench → Dumbbell Bench (adjust % down 10%)
  - [ ] Track substitution history

### 4.4 Form & Technique
- [ ] **Video Integration**
  - [ ] Embed exercise demonstration videos
  - [ ] Key cues display during rest periods
  - [ ] "Review form" quick link
  
- [ ] **Form Check Prompts**
  - [ ] After 3 consecutive failures: "Review form video?"
  - [ ] When weight increases >15%: "Focus on form reminder"
  - [ ] Link to technique articles

### 4.5 Analytics & Insights
- [ ] **Volume Tracking**
  - [ ] Calculate total volume per workout
  - [ ] Show volume trends over time
  - [ ] Compare current volume to last week
  
- [ ] **Intensity Distribution**
  - [ ] Pie chart: % of sets at each intensity level
  - [ ] Ensure balanced training (not too much high intensity)
  
- [ ] **Time Under Tension**
  - [ ] Estimate based on reps and rest periods
  - [ ] Show "Quality Minutes" (working set time only)
  
- [ ] **Body Part Balance**
  - [ ] Volume per muscle group
  - [ ] Ensure balanced development
  - [ ] Flag imbalances

### 4.6 Social & Motivation
- [ ] **PR Celebration**
  - [ ] Confetti animation on new PRs
  - [ ] Share to social media option
  - [ ] "You're stronger than X% of users"
  
- [ ] **Workout Streaks**
  - [ ] Track consecutive workout weeks
  - [ ] Streak badges (4 week, 12 week, 48 week)
  - [ ] "Don't break the chain" reminders
  
- [ ] **Leaderboards**
  - [ ] Compare strength gains with friends
  - [ ] Anonymous global rankings
  - [ ] Age/weight class categories

### 4.7 User Experience Improvements
- [ ] **Quick Start**
  - [ ] "Resume Workout" from home screen
  - [ ] One-tap to start today's workout
  - [ ] Pre-filled warm-up weights
  
- [ ] **Offline Mode**
  - [ ] Cache workout data for offline use
  - [ ] Sync when connection returns
  - [ ] Show "Offline" indicator
  
- [ ] **Apple Watch Integration**
  - [ ] Show current set on watch
  - [ ] Rest timer on watch
  - [ ] Quick log reps from watch
  - [ ] Heart rate zone display
  
- [ ] **Voice Logging**
  - [ ] "Log 8 reps at 225" voice command
  - [ ] Hands-free during workout
  - [ ] Siri shortcuts integration

---

## Phase 5: Testing & Validation

### 5.1 Formula Validation
- [ ] Unit tests for all formula methods
- [ ] Test beginner special case (1RM < 125)
- [ ] Test conditional set logic with various scenarios
- [ ] Test progression formulas (+5 lb on success)
- [ ] Verify rounding to nearest 5 lbs
- [ ] Test down set generation

### 5.2 Integration Tests
- [ ] End-to-end workout flow
- [ ] Max determination week flow
- [ ] Progressive max attempts (3 consecutive successes)
- [ ] Down set redirect on failure
- [ ] Week-to-week progression
- [ ] 48-week program completion

### 5.3 UI Testing
- [ ] Conditional set animations
- [ ] Max attempt feedback screens
- [ ] Rest timer accuracy
- [ ] Offline mode functionality
- [ ] Cross-device sync

### 5.4 Performance Testing
- [ ] Formula calculation speed (<10ms)
- [ ] UI render performance (60fps)
- [ ] Database query optimization
- [ ] Memory usage monitoring
- [ ] Battery impact (Apple Watch)

---

## Phase 6: Documentation & Training

### 6.1 User Documentation
- [ ] "How It Works" in-app guide
- [ ] Formula explanations (simple language)
- [ ] Progression system walkthrough
- [ ] Video tutorials for key features
- [ ] FAQ section

### 6.2 Developer Documentation
- [ ] Update API documentation
- [ ] Add formula reference comments
- [ ] Create architecture diagrams
- [ ] Write migration guide
- [ ] Document conditional set system

---

## Implementation Priority

### 🔴 **Critical (Week 1-2)**
1. WorkoutEngine integration with FormulaCalculatorEnhanced
2. Conditional set display logic
3. Max attempt progression (+5 lb)
4. Database schema updates
5. Active workout screen redesign

### 🟡 **High Priority (Week 3-4)**
6. Max Determination Week flow
7. Down sets generation
8. Progression tracking
9. Rest timer enhancements
10. Workout detail screen updates

### 🟢 **Medium Priority (Week 5-6)**
11. Smart weight suggestions
12. Exercise library enhancements
13. Analytics dashboard
14. Form check prompts
15. Volume tracking

### 🔵 **Low Priority (Week 7-8)**
16. Advanced periodization
17. Social features
18. Apple Watch integration
19. Voice logging
20. Leaderboards

---

## Technical Architecture

### Data Flow
```
User Completes Set 
  → WorkoutEngine.logSet()
    → FormulaCalculatorEnhanced.evaluateMaxAttempt()
      → Check if progression earned
        → If success: Unlock next conditional set
        → If failure: Generate down sets
    → Update database
      → sets table (with condition_met flag)
      → maxAttemptResults table
      → weeklyMaxes table
    → Update Redux state
      → Trigger UI re-render
        → Show unlocked sets
        → Display feedback message
        → Start rest timer
```

### Key Services
```typescript
FormulaCalculatorEnhanced    // Formula calculations
WorkoutEngineEnhanced        // Workout orchestration  
SetConditionChecker          // Condition evaluation
ProgressionTracker           // Week-to-week tracking
MaxDeterminationService      // Initial max testing
AnalyticsEngine              // Volume, intensity calculations
```

### State Management
```typescript
// Redux slices to update
workoutSlice                 // Add conditional sets, max attempts
progressSlice                // Add weekly maxes, progression history
userSlice                    // Add equipment preferences, training max %
```

---

## Success Metrics

### User Engagement
- [ ] 80%+ workout completion rate
- [ ] Average 3+ workouts per week
- [ ] 50%+ users complete max determination week
- [ ] 70%+ users unlock conditional sets regularly

### Technical Performance
- [ ] <100ms for set logging
- [ ] <50ms for formula calculations
- [ ] 0 crashes related to new features
- [ ] 95%+ offline sync success rate

### User Satisfaction
- [ ] 4.5+ star rating
- [ ] <5% negative feedback on new features
- [ ] 80%+ users find progression "helpful"
- [ ] 70%+ users understand conditional sets

---

## Risk Mitigation

### Technical Risks
- **Formula complexity** → Extensive unit testing
- **Performance issues** → Profiling and optimization
- **Data migration** → Staged rollout with backups
- **Sync conflicts** → Conflict resolution strategy

### UX Risks
- **Feature overload** → Progressive disclosure, gradual introduction
- **Confusion** → Clear onboarding, tooltips, video guides
- **Cognitive load** → Simple visuals, consistent patterns

### Business Risks
- **Development time** → Phased approach, MVP first
- **User adoption** → A/B testing, feedback loops
- **Technical debt** → Code reviews, refactoring sprints

---

## Next Steps

### Immediate Actions (This Week)
1. Review and approve this plan
2. Set up development branch: `feature/formula-integration`
3. Start with Phase 1.1: WorkoutEngine core updates
4. Create database migration scripts
5. Begin unit tests for FormulaCalculatorEnhanced

### Sprint 1 (Week 1-2)
- Complete Phase 1: Backend Integration
- Start Phase 2.1: Active Workout Screen redesign
- Set up conditional set database schema

### Sprint 2 (Week 3-4)
- Complete Phase 2: UI/UX Rework
- Start Phase 3.1: Max Determination Week
- Begin Phase 4 improvements (smart suggestions)

---

## Questions for Stakeholders

1. **Priority**: Which Phase 4 improvements are most important?
2. **Timeline**: Aggressive (8 weeks) vs Conservative (12 weeks)?
3. **Scope**: Full 48-week program or start with 12-week pilot?
4. **Platform**: iOS first, Android simultaneously, or web?
5. **Beta**: Internal testing vs public beta vs full release?

---

## Conclusion

This plan provides a comprehensive roadmap for integrating the extracted Asa B 2020 formulas into a feature-rich, user-friendly mobile app. The phased approach allows for:

- **Incremental delivery** of value
- **Risk mitigation** through testing
- **User feedback** incorporation
- **Technical excellence** via clean architecture

**Estimated Timeline**: 8-12 weeks for Phases 1-3 + critical Phase 4 items

**Estimated Effort**: 
- Backend: 40 hours
- Frontend: 60 hours  
- Testing: 20 hours
- Documentation: 10 hours
- **Total: ~130 hours** (3-4 weeks for 1 full-time developer)
