# Nike Style Redesign - Implementation Status

**Date**: January 10, 2026  
**Status**: Phase 1 Complete - Foundation & Key Screens Updated

---

## ✅ Completed Work

### 1. Design Tokens Update ✓
**File**: [`app/src/theme/designTokens.ts`](app/src/theme/designTokens.ts)

#### Typography Scale - Nike-Inspired
- **Hero Display**: 72px, weight 900, -1.5px letter spacing
- **Large Display**: 56px, weight 900, -1px letter spacing  
- **Display**: 48px, weight 900, -0.8px letter spacing
- **H1**: 36px, weight 700, -0.5px letter spacing
- **H2**: 28px, weight 700, -0.3px letter spacing
- **Body Large**: 18px (increased from 17px)
- **Body**: 16px (increased from 15px)

#### Spacing Scale - Generous
```
micro: 4px
tight: 8px
close: 16px
base: 24px (increased from 16px)
comfortable: 32px
generous: 48px
huge: 64px
massive: 80px
giant: 100px
```

#### Border Radius - Rounder
```
sm: 12px (was 8px)
md: 16px (was 12px)
lg: 24px (was 16px)
xl: 32px (was 20px)
```

#### Colors - Enhanced
- **Success**: Updated to #00D96F (more vibrant green)
- **Gradients**: Added 3-stop gradients for primary, success, and hero backgrounds
- **Shadows**: Added XL shadow and more prominent colored shadows

#### Components - Larger Dimensions
- **Button Heights**: 52px (small), 64px (medium), 72px (large)
- **Input Height**: 64px
- **Header Heights**: 120px (standard), 250px (hero)
- **Card Padding**: 32px (standard), 48px (hero)

### 2. WorkoutDashboard Screen ✓
**File**: [`app/src/screens/workout/WorkoutDashboardScreen.tsx`](app/src/screens/workout/WorkoutDashboardScreen.tsx)

#### Key Nike-Style Features Implemented:
- **Hero Header**: 250px tall with massive 56px user name
- **Overlapping Card**: -60px margin overlap (Nike signature style)
- **Week Number**: 72px with gradient effect (heroDisplay typography)
- **Section Headers**: 36px bold headers
- **Generous Spacing**: 64px between major sections
- **Achievement Cards**: Larger with better hierarchy
- **Gradient Backgrounds**: 3-stop primary gradient

### 3. Common Components ✓
**File**: [`app/src/components/common/GameButton.tsx`](app/src/components/common/GameButton.tsx)

- Already using new design token values
- Height: 52px/64px/72px based on size
- Border radius: 24px (lg)
- Enhanced shadows for primary/success variants

### 4. HTML Mockup Created ✓
**File**: [`mockups/nike-style-workout-dashboard.html`](mockups/nike-style-workout-dashboard.html)

- Interactive visual reference
- Demonstrates all Nike-style principles
- Can be opened in browser for preview

---

## 🚧 Remaining Work

### Phase 2: Critical Screens (Priority)

#### 1. ActiveWorkout Screen Enhancement
**File**: `app/src/screens/workout/ActiveWorkoutScreen.tsx`

**Current State**: Already well-designed, needs Nike token update

**Required Changes**:
```typescript
// Update header to use new spacing
paddingTop: spacing.huge (was spacing.md)
paddingBottom: spacing.comfortable (was spacing.md)

// Make exercise name larger
exerciseName: {
  ...typography.h1,
  fontSize: 32, // Increase from 24
}

// Enhance current set card
currentSetCard: {
  borderRadius: borderRadius.xl, // 32px
  padding: spacing.generous, // 48px
}

// Make SET number more prominent
setTitle: {
  ...typography.display, // Use display instead of h2
  color: colors.primary,
}

// Larger inputs for better touch targets
inputHeight: 64px (already at this value)
```

#### 2. WorkoutSummary Screen
**File**: `app/src/screens/workout/WorkoutSummaryScreen.tsx`

**Nike Redesign Plan**:
```typescript
// Hero celebration section
heroSection: {
  height: 250,
  paddingTop: spacing.massive,
  paddingBottom: spacing.giant,
}

// Massive "WORKOUT COMPLETE" text
completeTitle: {
  ...typography.heroDisplay, // 72px
  color: colors.success,
}

// Large stats display
statNumber: {
  ...typography.largeDisplay, // 56px
  fontWeight: '900',
}

// Generous card spacing
statsCard: {
  borderRadius: borderRadius.xl,
  padding: spacing.generous,
  marginBottom: spacing.comfortable,
}
```

#### 3. ProgressDashboard Screen  
**File**: `app/src/screens/progress/ProgressDashboardScreen.tsx`

**Nike Redesign Plan**:
```typescript
// Hero stats at top
heroStat: {
  number: {
    ...typography.heroDisplay, // 72px
    color: colors.primary,
  },
  label: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  }
}

// Large section headers
sectionHeader: {
  ...typography.h1, // 36px
  marginBottom: spacing.comfortable,
}

// Chart cards with more space
chartCard: {
  borderRadius: borderRadius.xl,
  padding: spacing.generous,
  marginBottom: spacing.comfortable,
}
```

### Phase 3: Secondary Screens

#### 4. Profile Screen
**File**: `app/src/screens/profile/ProfileScreen.tsx`

**Nike Redesign Plan**:
- Hero header with large profile name (56px)
- Stats grid with 56px numbers
- Settings list with 48px spacing
- Generous card designs

#### 5. Additional Screens (Lower Priority)
- ExerciseLibrary
- MaxDetermination screens
- Settings screens

---

## 📋 Implementation Guide

### Step-by-Step Process for Each Screen:

1. **Import Design Tokens**
```typescript
import { spacing, typography, borderRadius, shadows, colors as designColors } from '../../theme/designTokens';
```

2. **Update Header Styles**
```typescript
// Before
paddingTop: 50,
fontSize: 28,

// After
paddingTop: spacing.massive,
fontSize: typography.largeDisplay.fontSize,
```

3. **Replace Magic Numbers with Tokens**
```typescript
// Before
marginBottom: 24,
borderRadius: 16,
padding: 20,

// After  
marginBottom: spacing.base,
borderRadius: borderRadius.lg,
padding: spacing.lg,
```

4. **Enhance Typography**
```typescript
// Before
fontSize: 32,
fontWeight: '700',
letterSpacing: -0.5,

// After
...typography.h1,
// or for hero elements
...typography.heroDisplay,
```

5. **Update Component Sizes**
```typescript
// Buttons
height: components.button.height.large, // 72px

// Cards
borderRadius: components.card.hero.borderRadius, // 32px
padding: components.card.hero.padding, // 48px

// Inputs
height: components.input.height, // 64px
```

6. **Add Gradient Backgrounds**
```typescript
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={designColors.gradients.primary}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
>
```

### Testing Checklist for Each Screen:

- [ ] Text is visibly larger (3x for hero elements)
- [ ] Spacing is noticeably more generous
- [ ] Cards have rounder corners (24-32px)
- [ ] Buttons are taller and more prominent
- [ ] Touch targets are minimum 44px
- [ ] Shadows are visible and prominent
- [ ] Colors are vibrant and saturated
- [ ] Overall feel is bold and confident

---

## 🎨 Nike Design Principles to Follow

### 1. Massive Typography
- Headlines should be **3-4x larger** than body text
- Numbers should dominate their cards
- Labels should be small, uppercase, subtle

### 2. Generous White Space
- Section padding: **48-64px**
- Card padding: **32-48px**  
- Element spacing: **32-40px**
- Hero headers: **250px height**

### 3. Bold Visual Hierarchy
- **3-4 distinct size levels** (not 6-7)
- Primary elements 3-4x larger than secondary
- Clear focal point on each screen

### 4. Modern Card Design
- Border radius: **24-32px**
- Prominent shadows
- Overlapping elements (signature Nike style)

### 5. Vibrant Colors
- Use gradients with 3 stops
- High contrast (7:1 minimum)
- Colored shadows on CTAs

---

## 🚀 Quick Wins

### If Short on Time, Prioritize:

1. **Typography Updates** (Biggest Visual Impact)
   - Replace all fontSize values with typography tokens
   - Use heroDisplay for main stats
   - Use largeDisplay for important numbers

2. **Spacing Updates** (Second Biggest Impact)
   - Replace all padding/margin numbers with spacing tokens
   - Use generous/huge for major sections

3. **Border Radius** (Modern Feel)
   - Update all borderRadius to use tokens
   - Use xl (32px) for hero cards

4. **Button Heights** (Professional Look)
   - Ensure all buttons use component tokens
   - Large buttons should be 72px tall

---

## 📊 Before & After Comparison

### Typography Scale
| Element | Before | After | Increase |
|---------|--------|-------|----------|
| Hero Display | 36px | 72px | **2x** |
| Large Display | 28px | 56px | **2x** |
| Display | 28px | 48px | **1.7x** |
| H1 | 28px | 36px | **1.3x** |
| Body Large | 17px | 18px | 1.06x |
| Body | 15px | 16px | 1.07x |

### Spacing Scale  
| Element | Before | After | Increase |
|---------|--------|-------|----------|
| Base | 16px | 24px | **1.5x** |
| XL | 24px | 32px | 1.3x |
| 2XL | 32px | 48px | **1.5x** |
| 3XL | 48px | 64px | 1.3x |
| 4XL | 64px | 80-100px | **1.5x** |

### Component Dimensions
| Element | Before | After | Increase |
|---------|--------|-------|----------|
| Button (Large) | 64px | 72px | 1.13x |
| Input | 56px | 64px | 1.14x |
| Card Border Radius | 16px | 24-32px | **2x** |
| Hero Header | 160px | 250px | **1.56x** |

---

## ✨ Expected User Experience

### What Users Should Notice:
1. **"Wow, this looks completely different!"**
2. **"Everything is so much easier to read"**
3. **"This feels premium and professional"**
4. **"The buttons are so much easier to tap"**
5. **"It looks like a Nike/Hevy app now"**

### Success Metrics:
- User name on dashboard: **3x larger** (18px → 56px)
- Week number on workout card: **huge and prominent** (72px)
- Stats numbers: **dominate their cards** (56px)
- Buttons: **noticeably taller and more confident** (72px)
- Overall: **"This could be in the App Store top charts"**

---

## 📝 Notes

### Files Modified:
1. ✅ [`app/src/theme/designTokens.ts`](app/src/theme/designTokens.ts) - Foundation updated
2. ✅ [`app/src/screens/workout/WorkoutDashboardScreen.tsx`](app/src/screens/workout/WorkoutDashboardScreen.tsx) - Nike redesign complete
3. ✅ [`mockups/nike-style-workout-dashboard.html`](mockups/nike-style-workout-dashboard.html) - Visual reference created

### Next Files to Update:
1. 🔄 `app/src/screens/workout/ActiveWorkoutScreen.tsx` - Enhance with new tokens
2. 🔄 `app/src/screens/workout/WorkoutSummaryScreen.tsx` - Full Nike redesign
3. 🔄 `app/src/screens/progress/ProgressDashboardScreen.tsx` - Full Nike redesign
4. 🔄 `app/src/screens/profile/ProfileScreen.tsx` - Full Nike redesign

### Key Takeaway:
**The design token foundation is complete. All remaining work is applying these tokens consistently across screens for that bold Nike aesthetic.**

---

## 🎯 Final Checklist

When all screens are updated, verify:

- [ ] All typography uses design tokens (no magic numbers)
- [ ] All spacing uses design tokens  
- [ ] All border radius uses design tokens
- [ ] All component dimensions use design tokens
- [ ] Hero elements are 72px (heroDisplay)
- [ ] Important numbers are 56px (largeDisplay)
- [ ] Section headers are 36px (h1)
- [ ] Cards use 24-32px border radius
- [ ] Buttons are 64-72px tall
- [ ] Spacing between sections is 48-64px
- [ ] Gradients use 3-stop arrays
- [ ] Shadows are prominent and visible
- [ ] App feels bold, confident, and professional

---

**Status**: Foundation Complete ✓  
**Next Step**: Apply tokens to remaining screens using guide above  
**Timeline**: 2-3 hours to complete all remaining screens

**Remember**: The mockup at [`mockups/nike-style-workout-dashboard.html`](mockups/nike-style-workout-dashboard.html) is your visual reference. Open it in a browser to see what we're aiming for!
