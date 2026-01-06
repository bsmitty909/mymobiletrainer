# My Mobile Trainer - React Native App

An intelligent fitness companion app based on Lance McCullough's "30 Minute Body" program, featuring formula-driven weight calculations that adapt to user performance.

## 🚀 Quick Start

```bash
# Navigate to app directory
cd app

# Install dependencies (if not already done)
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 📁 Project Structure

```
app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Buttons, Cards, Inputs, etc.
│   │   ├── workout/        # Workout-specific components
│   │   ├── charts/         # Progress charts and visualizations
│   │   └── navigation/     # Navigation components
│   │
│   ├── screens/            # Screen components
│   │   ├── onboarding/    # Welcome, Profile Setup, etc.
│   │   ├── workout/       # Dashboard, Active Workout, etc.
│   │   ├── progress/      # Progress tracking screens
│   │   └── profile/       # Profile and settings screens
│   │
│   ├── services/          # Business logic services
│   │   ├── FormulaCalculator.ts   ✅ IMPLEMENTED
│   │   ├── WorkoutEngine.ts       (TODO)
│   │   ├── ProgressionService.ts  (TODO)
│   │   └── ExerciseService.ts     (TODO)
│   │
│   ├── models/            # Database models (WatermelonDB)
│   │   └── schema.ts      (TODO)
│   │
│   ├── store/             # Redux state management
│   │   ├── slices/        # Redux slices
│   │   ├── selectors/     # Memoized selectors
│   │   └── store.ts       (TODO)
│   │
│   ├── types/             # TypeScript definitions
│   │   └── index.ts       ✅ IMPLEMENTED
│   │
│   ├── constants/         # App constants and config
│   │   └── workoutProgram.json  (TODO)
│   │
│   └── utils/             # Utility functions
│       └── helpers.ts     (TODO)
│
├── assets/                # Images, fonts, icons
├── App.tsx               # Root component
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## ✅ What's Implemented

### 1. TypeScript Types (`src/types/index.ts`)
Complete type definitions for:
- User and profile models
- Exercise and workout program structures
- Workout session and logging
- Progress tracking and PRs
- Navigation types
- Settings and preferences

### 2. FormulaCalculator Service (`src/services/FormulaCalculator.ts`)
Core calculation engine implementing Excel formulas:
- ✅ Weight calculation based on user maxes
- ✅ Week-type percentages (Intensity 85%, Percentage 75%, etc.)
- ✅ Progressive overload logic (adjust based on previous performance)
- ✅ Rep-out set handling
- ✅ Accessory exercise calculations
- ✅ Weight rounding to gym increments
- ✅ PR detection
- ✅ Volume calculations
- ✅ Max testing progression generation
- ✅ Weight validation

## 🎯 Formula Logic Summary

### Week Types & Percentages
```typescript
Max Week:        100% (progressive loading)
Intensity Week:   85% (Weeks 1-2)
Percentage Week:  75% (Week 3)
Mixed Week:       90% (Week 4)
```

### Progressive Overload
```typescript
If avgReps > targetMax:
  nextWeight = currentWeight + increment (2.5-5 lbs)

If avgReps < targetMin:
  nextWeight = currentWeight - 5 lbs

Otherwise:
  nextWeight = currentWeight (maintain)
```

### Set Types
```typescript
Warmup:   40% of max, 6 reps
Working:  Week percentage, variable reps
Down Set: 65% of max, rep out
Max:      Progressive 85-95%+, 1-4 reps
```

## 📦 Dependencies Installed

### Core
- `react-native` - Mobile framework
- `expo` - Development toolchain
- `typescript` - Type safety

### State & Data
- `@reduxjs/toolkit` - State management
- `react-redux` - React bindings for Redux
- `@nozbe/watermelondb` - Local database
- `@nozbe/with-observables` - Reactive data

### Navigation
- `@react-navigation/native` - Navigation core
- `@react-navigation/stack` - Stack navigator
- `@react-navigation/bottom-tabs` - Tab navigator
- `react-native-screens` - Native screen primitives
- `react-native-safe-area-context` - Safe area handling

### UI
- `react-native-paper` - Material Design components
- `react-native-svg` - SVG support
- `victory-native` - Charts and graphs

## 🔨 Next Steps for Implementation

### Phase 1: Complete Foundation
1. **Create README.md** ✅ (this file)
2. **Install remaining dependencies**
   ```bash
   npm install --legacy-peer-deps @react-native-async-storage/async-storage expo-notifications
   ```

3. **Create utility helpers** (`src/utils/helpers.ts`)
   - Date formatting
   - String utilities
   - Validation functions

4. **Create constants** (`src/constants/exercises.ts`, `workoutProgram.json`)
   - Exercise library
   - Workout program data from Excel
   - Formula constants

### Phase 2: Database Layer
5. **Setup WatermelonDB schema** (`src/models/schema.ts`)
   - Users, BodyWeights, MaxLifts
   - WorkoutSessions, ExerciseLogs, SetLogs
   - Exercises, ExerciseVariants

6. **Create database models**
   - User model
   - WorkoutSession model
   - ExerciseLog model
   - MaxLift model

### Phase 3: Business Logic
7. **Build WorkoutEngine** (`src/services/WorkoutEngine.ts`)
   - Load workout programs
   - Calculate all weights for a session
   - Handle workout flow logic

8. **Create ProgressionService** (`src/services/ProgressionService.ts`)
   - Week-to-week advancement
   - Program phase transitions
   - Completion tracking

### Phase 4: State Management
9. **Setup Redux Store** (`src/store/store.ts`)
   - Configure store with slices
   - Setup middleware
   - Persist configuration

10. **Create Redux Slices**
    - `userSlice.ts` - User state
    - `workoutSlice.ts` - Workout state
    - `progressSlice.ts` - Progress state
    - `uiSlice.ts` - UI state

### Phase 5: UI Components
11. **Common Components**
    - Button, Card, Input
    - Loading spinner
    - Error boundary

12. **Workout Components**
    - ExerciseCard
    - SetLogger
    - RestTimer
    - WeightSelector

### Phase 6: Screens
13. **Onboarding Screens**
    - Welcome
    - Profile Setup
    - Body Weight Input

14. **Workout Screens**
    - Dashboard
    - Workout Detail
    - Active Workout
    - Workout Summary

15. **Progress Screens**
    - Progress Dashboard
    - Personal Records
    - Body Weight Charts

16. **Profile Screens**
    - Profile Home
    - Settings
    - Max Lifts

### Phase 7: Testing
17. **Unit Tests**
    - FormulaCalculator tests ⚠️ CRITICAL
    - Utility function tests

18. **Integration Tests**
    - Database operations
    - Redux actions

19. **E2E Tests**
    - Complete workout flow
    - Onboarding journey

## 🧪 Testing the Formula Calculator

Create test file at `__tests__/services/FormulaCalculator.test.ts`:

```typescript
import FormulaCalculator from '../../src/services/FormulaCalculator';

describe('FormulaCalculator', () => {
  describe('calculateWeekWeight', () => {
    it('calculates Week 1 warmup correctly (40% of max)', () => {
      const result = FormulaCalculator.calculateWeekWeight(250, 'intensity', 1, 4);
      expect(result).toBe(100); // 250 * 0.40 = 100
    });

    it('calculates Week 1 working set correctly (85% of max)', () => {
      const result = FormulaCalculator.calculateWeekWeight(250, 'intensity', 2, 4);
      expect(result).toBe(210); // 250 * 0.85 = 212.5 → rounds to 210
    });

    it('calculates Week 3 percentage correctly (75% of max)', () => {
      const result = FormulaCalculator.calculateWeekWeight(250, 'percentage', 2, 4);
      expect(result).toBe(185); // 250 * 0.75 = 187.5 → rounds to 185
    });
  });

  describe('analyzeProgression', () => {
    it('suggests weight increase when reps exceeded', () => {
      const mockLog = {
        sets: [
          { reps: 8, targetReps: { min: 1, max: 6 } },
          { reps: 7, targetReps: { min: 1, max: 6 } },
        ],
      };
      
      const result = FormulaCalculator.analyzeProgression(mockLog, 'dumbbell');
      expect(result.shouldIncrease).toBe(true);
      expect(result.recommendedChange).toBe(2.5);
    });
  });
});
```

## 🎨 Running the App

### Development Mode

```bash
# Start Metro bundler
npm start

# Then press:
# - 'i' for iOS simulator
# - 'a' for Android emulator
# - Scan QR code for physical device
```

### Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Both
eas build --platform all
```

## 📚 Key Files to Review

1. **[`../plans/my-mobile-trainer-architecture.md`](../plans/my-mobile-trainer-architecture.md)**
   - Complete architecture documentation
   - Database schema design
   - Formula implementation guide

2. **[`../plans/ui-mockups-visual-guide.md`](../plans/ui-mockups-visual-guide.md)**
   - Screen mockups
   - UI component designs
   - Interaction patterns

3. **[`../plans/PROJECT-OVERVIEW-AND-NEXT-STEPS.md`](../plans/PROJECT-OVERVIEW-AND-NEXT-STEPS.md)**
   - Project overview
   - Implementation roadmap
   - Success metrics

## 🔑 Critical Implementation Notes

### Formula Calculator - Excel Parity
The `FormulaCalculator` service **must** match the Excel formulas exactly. Key formulas:

```typescript
// Base weight calculation
suggestedWeight = userMax * weekPercentage

// Progressive overload
if (avgReps > targetMax) {
  suggestedWeight += increment (2.5 or 5 lbs)
} else if (avgReps < targetMin) {
  suggestedWeight -= 5 lbs
}

// Round to gym weights
finalWeight = round(suggestedWeight / increment) * increment
```

### Performance Considerations
- Memoize formula calculations within workout session
- Cache workout program data
- Lazy load week data
- Virtual lists for long exercise lists
- Optimize database queries with proper indexing

### Offline-First Strategy
- All core features work without internet
- Local database (WatermelonDB) as source of truth
- Videos optional (show placeholder if offline)
- Sync to cloud in Phase 2

## 🐛 Known Issues / TODO

- [ ] Complete WatermelonDB setup
- [ ] Implement remaining services
- [ ] Create Redux store
- [ ] Build navigation structure
- [ ] Implement all screens
- [ ] Add comprehensive tests
- [ ] Validate formulas against Excel (CRITICAL)
- [ ] Performance optimization
- [ ] Dark mode implementation

## 📖 Documentation

- Architecture: See [`../plans/`](../plans/) directory
- API Documentation: (TODO - generate from TSDoc)
- User Guide: (TODO - in-app help system)

## 🤝 Contributing

This is currently a solo project, but follow these guidelines:
- Use TypeScript strictly (no `any` types)
- Write tests for business logic
- Follow ESLint/Prettier config
- Document complex formulas
- Keep components small and focused

## 📄 License

TBD - Based on Lance McCullough's "30 Minute Body" program

## 🎯 Current Status

**Phase**: Foundation (In Progress)
**Completion**: ~15%
**Next Up**: Database schema, WorkoutEngine service, Redux store

---

**Last Updated**: January 6, 2026
**Version**: 0.1.0 (Pre-Alpha)
