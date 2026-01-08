# Remaining Emoji to Material Icon Replacements

## Files to Update:

### 1. ProgressDashboardScreen.tsx
- Line 177: 📈 Body Weight Trend → `chart-line-variant`
- Line 203: 🏆 Personal Records → `trophy`
- Line 236: 📅 Recent Workouts → `calendar-check`

### 2. WorkoutDashboardScreen.tsx
- Line 376: 🏋️ 5 Exercises → `dumbbell` icon
- Line 379: ⏱️ ~30 min → `clock-outline` icon
- Line 402: 🏆 Weekly Achievements → Remove (title text only)
- Line 461: 🎯 This Week's Mission → Remove (title text only)
- Line 465: 💯 → Remove from text

### 3. ActiveWorkoutScreen.tsx
- Line 310: 💪 Set {currentSetNumber} → Remove emoji, just "SET {n}"

### 4. WorkoutSummaryScreen.tsx
- Line 191: 🏆 → `trophy` icon in header
- Line 204: 📊 Your Stats → Remove (section title)
- Line 253: 🏆 New Personal Records! → Remove (title)
- Line 291: ✓ → `check` icon or remove
- Line 311: 💪...🔥 → Remove emojis from motivational text

### 5. WelcomeScreen.tsx
- Line 177: 💪 → Material icon or remove
- Line 190-193: ✓ → `check-circle` icons
- Line 281: 🎯 → Remove from title
- Line 312: 🔥 → Remove from title
- Line 338: 💪 → Remove from title
- Line 377: 🏋️ → Remove from title
- Line 396: 💪 → Material icon in segmented button
- Line 401: 🔥 → Material icon in segmented button

### 6. Other Components
- ExerciseInstructionCard.tsx Line 37: 🎯 Target → Remove
- WeeklyJourneyView.tsx Line 46: 🗺️ → Remove from title
- BodyWeightChart.tsx Line 54: 📊 → Material icon
- VolumeTrendChart.tsx Line 54: 📊 → Material icon
- ProfileScreen.tsx Line 75: 📊 → Remove

### 7. WorkoutDetailScreen.tsx
- Line 219: ⏱️ Estimated Duration → `clock-outline`

## Material Icon Mappings:
- 🏋️ → dumbbell
- 💪 → arm-flex or dumbbell  
- 🔥 → fire
- 🏆 → trophy
- 📊 → chart-bar or chart-line
- 📈 → chart-line-variant
- 📅 → calendar-check
- ⏱️ → clock-outline or timer
- 🎯 → target
- ✓ → check-circle or check
- 💯 → Remove from text

## Strategy:
1. Remove decorative emojis from titles (🎯, 🏆, 📊, etc.)
2. Replace functional emojis with Material icons where appropriate
3. Keep text clean and professional
4. Use icons in headers/sections where visual indicators are helpful
