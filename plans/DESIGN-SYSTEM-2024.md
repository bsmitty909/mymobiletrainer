# My Mobile Trainer - Modern Design System 2024

## Overview
A professional, minimalist design system inspired by Nike Training Club, Hevy, and modern fitness app trends. This system prioritizes clarity, usability, and visual hierarchy while maintaining brand identity.

---

## 🎨 Color System

### Primary Palette
```
Primary (Action Blue):
  - Main: #0066FF (rgb(0, 102, 255))
  - Light: #3385FF (60% opacity for hover states)
  - Dark: #0052CC (pressed states)
  - Gradient: linear-gradient(135deg, #0066FF 0%, #0052CC 100%)

Success (Achievement Green):
  - Main: #00C853 (rgb(0, 200, 83))
  - Light: #69F0AE
  - Dark: #00A043

Warning (Attention Orange):
  - Main: #FF9100 (rgb(255, 145, 0))
  - Light: #FFAB40

Error (Alert Red):
  - Main: #FF3B30 (rgb(255, 59, 48))
  - Light: #FF6B6B
```

### Neutral Palette
```
Light Mode:
  - Background: #FFFFFF
  - Surface: #F8F9FA
  - Surface Elevated: #FFFFFF (with shadow)
  - Border: #E5E7EB
  - Border Light: #F3F4F6
  
  Text:
  - Primary: #1A1A1A (rgb(26, 26, 26))
  - Secondary: #6B7280
  - Tertiary: #9CA3AF
  - Disabled: #D1D5DB

Dark Mode:
  - Background: #0A0A0A
  - Surface: #1A1A1A
  - Surface Elevated: #2A2A2A (with subtle glow)
  - Border: #2A2A2A
  - Border Light: #1F1F1F
  
  Text:
  - Primary: #FFFFFF
  - Secondary: #A1A1A1
  - Tertiary: #717171
  - Disabled: #4A4A4A
```

### Semantic Colors
```
Intensity Levels (for workout intensity):
  - Warmup: #FFC107 (Amber)
  - Light: #4CAF50 (Green)
  - Moderate: #FF9800 (Orange)
  - Heavy: #F44336 (Red)
  - Max: #9C27B0 (Purple)

Data Visualization:
  - Chart Blue: #0066FF
  - Chart Green: #00C853
  - Chart Orange: #FF9100
  - Chart Purple: #7C4DFF
  - Chart Pink: #FF4081
```

---

## ✍️ Typography

### Font Family
```
Primary: System Font Stack
iOS: -apple-system, SF Pro Display, SF Pro Text
Android: Roboto
Fallback: Helvetica Neue, Arial, sans-serif

Weight Scale:
  - Regular: 400
  - Medium: 500
  - SemiBold: 600
  - Bold: 700
  - Black: 900 (for headlines only)
```

### Type Scale
```
Display (Hero Headlines):
  - Size: 36px / 44px (size / line-height)
  - Weight: 900 (Black)
  - Letter Spacing: -0.5px
  - Use: Main dashboard titles, celebration screens

Headline 1:
  - Size: 28px / 36px
  - Weight: 700
  - Letter Spacing: -0.3px
  - Use: Screen titles, section headers

Headline 2:
  - Size: 22px / 28px
  - Weight: 700
  - Letter Spacing: -0.2px
  - Use: Card titles, modal headers

Headline 3:
  - Size: 18px / 24px
  - Weight: 600
  - Use: Subsection headers

Body Large:
  - Size: 17px / 24px
  - Weight: 400
  - Use: Primary body text

Body Regular:
  - Size: 15px / 22px
  - Weight: 400
  - Use: Secondary text, descriptions

Body Small:
  - Size: 13px / 18px
  - Weight: 400
  - Use: Captions, metadata

Label Large:
  - Size: 15px / 20px
  - Weight: 600
  - Letter Spacing: 0.5px
  - Text Transform: UPPERCASE
  - Use: Buttons, important labels

Label Regular:
  - Size: 13px / 18px
  - Weight: 600
  - Letter Spacing: 0.3px
  - Text Transform: UPPERCASE
  - Use: Form labels, badges

Label Small:
  - Size: 11px / 16px
  - Weight: 600
  - Letter Spacing: 0.5px
  - Text Transform: UPPERCASE
  - Use: Tiny labels, tags
```

---

## 📐 Spacing System

### Base Unit: 4px
```
Scale (multiplier × 4px):
  - xs: 4px (1×)
  - sm: 8px (2×)
  - md: 12px (3×)
  - base: 16px (4×) - Most common
  - lg: 20px (5×)
  - xl: 24px (6×)
  - 2xl: 32px (8×)
  - 3xl: 48px (12×)
  - 4xl: 64px (16×)

Common Applications:
  - Container Padding: 16px (base)
  - Card Padding: 20px (lg)
  - Vertical Spacing Between Elements: 12px (md)
  - Section Spacing: 24px (xl)
  - Screen Top Padding: 20px (lg)
  - Bottom Safe Area: 32px (2xl)
```

---

## 🎯 Component Design Specs

### Buttons

#### Primary Button
```
Style:
  - Height: 56px
  - Border Radius: 12px
  - Background: Primary gradient
  - Text: White, Label Large
  - Padding: 16px horizontal
  - Min Width: 120px
  - Shadow: 0px 4px 12px rgba(0, 102, 255, 0.25)

States:
  - Default: Full opacity
  - Pressed: Scale 0.98, opacity 0.9
  - Disabled: Opacity 0.4, no interaction
  
Icon:
  - Size: 20px
  - Spacing from text: 8px
  - Position: Leading or trailing
```

#### Secondary Button
```
Style:
  - Height: 56px
  - Border Radius: 12px
  - Background: Surface
  - Border: 2px solid Border color
  - Text: Primary text, Label Large
  - Padding: 16px horizontal
  
States:
  - Hover: Border color → Primary
  - Pressed: Background → Surface Elevated
```

#### Text Button
```
Style:
  - Height: auto (min 44px for tap target)
  - Background: transparent
  - Text: Primary color, Label Regular
  - Padding: 8px horizontal
  
States:
  - Pressed: Opacity 0.7
```

### Cards

#### Standard Card
```
Style:
  - Border Radius: 16px
  - Background: Surface
  - Padding: 20px
  - Margin: 16px (sides), 12px (vertical)
  - Shadow (Light): 0px 2px 8px rgba(0, 0, 0, 0.08)
  - Shadow (Dark): 0px 2px 8px rgba(0, 0, 0, 0.3)
  
Interactive Card:
  - Add: Active scale 0.98
  - Transition: transform 0.2s ease
```

#### Elevated Card (Important)
```
Style:
  - All standard card properties
  - Shadow: 0px 4px 16px rgba(0, 0, 0, 0.12)
  - Border: 1px solid rgba(0, 102, 255, 0.1)
```

### Input Fields

#### Text Input
```
Style:
  - Height: 56px
  - Border Radius: 12px
  - Background: Surface
  - Border: 2px solid Border
  - Padding: 16px
  - Text: Body Large
  
States:
  - Focus: Border → Primary
  - Error: Border → Error
  - Disabled: Opacity 0.5

Label:
  - Above input: Label Regular
  - Spacing: 8px from input
```

#### Number Input (with +/- buttons)
```
Style:
  - Container: Same as text input
  - Layout: [- Button] [Input] [+ Button]
  - Buttons: 44px × 44px, circular
  - Button Icon: 20px
  - Unit Label: Label Small, right side
```

### Progress Indicators

#### Progress Bar
```
Style:
  - Height: 8px
  - Border Radius: 4px
  - Background: Border Light
  - Fill: Primary gradient
  - Animation: Smooth fill 0.3s ease
```

#### Circular Progress (Loading)
```
Style:
  - Size: 24px (small), 36px (medium), 48px (large)
  - Stroke Width: 3px
  - Color: Primary
  - Animation: Rotate 1s linear infinite
```

### Badges & Pills

#### Status Badge
```
Style:
  - Height: 24px
  - Border Radius: 12px (full pill)
  - Padding: 6px 12px
  - Text: Label Small
  - Background: Based on status (opacity 0.15 of status color)
  - Text Color: Full status color
```

#### Count Badge
```
Style:
  - Size: 20px × 20px (circular)
  - Background: Error or Primary
  - Text: White, 11px, Bold
  - Position: Top-right corner with -8px offset
```

---

## 🎬 Motion & Animation

### Principles
1. **Fast**: Animations should be snappy (150-300ms)
2. **Natural**: Use ease curves, not linear
3. **Purposeful**: Every animation communicates meaning

### Timing Functions
```
Standard: cubic-bezier(0.4, 0.0, 0.2, 1) - 250ms
  - Use: Most transitions

Decelerate: cubic-bezier(0.0, 0.0, 0.2, 1) - 200ms
  - Use: Elements entering the screen

Accelerate: cubic-bezier(0.4, 0.0, 1, 1) - 150ms
  - Use: Elements leaving the screen

Spring: spring(1, 80, 12)
  - Use: Tap feedback, celebrations
```

### Common Animations
```
Button Press:
  - Scale: 1 → 0.98
  - Duration: 150ms
  - Timing: ease-out

Card Tap:
  - Scale: 1 → 0.98
  - Opacity: 1 → 0.95
  - Duration: 150ms

Modal Present:
  - Slide from bottom
  - Fade in overlay (0 → 0.7)
  - Duration: 300ms
  - Timing: decelerate

List Item Entry:
  - Fade in + Slide up (20px)
  - Stagger: 50ms per item
  - Duration: 250ms

Success Celebration:
  - Scale pulse: 1 → 1.05 → 1
  - Confetti particle system
  - Duration: 600ms
```

---

## 📱 Screen Layout Patterns

### Standard Screen Layout
```
Structure:
1. Status Bar (system)
2. Navigation Header (60px)
   - Title: Headline 1
   - Actions: Icon buttons (44×44 tap target)
   - Optional: Subtitle below title
3. Content Area
   - Padding: 16px sides
   - ScrollView with sections
4. Bottom Safe Area (with tab bar or action button)
```

### Dashboard Pattern (Homepage)
```
Layout:
1. Hero Header (gradient background)
   - Height: 180px
   - Padding: 60px top, 24px sides
   - Title: Display typography
   - Subtitle: Body Large
   
2. Featured Card (overlapping header)
   - Negative margin: -40px top
   - Elevated shadow
   
3. Grid Sections
   - 2-column grid for stats
   - Full-width for lists
   - Spacing: 12px gap
```

### Workout Active Pattern
```
Layout:
1. Fixed Header (progress bar)
   - Height: 140px
   - Gradient background
   - Exercise name: Headline 1
   - Progress: Linear indicator
   
2. Sticky Current Set Card
   - Elevated
   - Always visible at top of scroll
   
3. Collapsible Sections
   - Secondary info collapsed by default
   - Smooth expand/collapse animations
```

---

## ♿ Accessibility

### Touch Targets
```
Minimum: 44px × 44px (iOS HIG / Android Material)
Preferred: 48px × 48px
Spacing: 8px minimum between targets
```

### Contrast Ratios
```
Text:
  - Large text (18px+): 3:1 minimum
  - Small text: 4.5:1 minimum
  - Active UI elements: 3:1 minimum

Aim for AAA where possible:
  - Large text: 4.5:1
  - Small text: 7:1
```

### Focus States
```
- Visible focus indicator (3px border)
- Color: Primary with 0.5 opacity
- Offset: 2px from element
```

---

## 🌓 Dark Mode Strategy

### Approach
1. **Automatic**: Follow system preference by default
2. **Manual Override**: User can force light/dark in settings
3. **Elevated Surfaces**: Use lighter shades, not shadows
4. **Reduce Vibrance**: Slightly desaturate bright colors (90% saturation)

### Dark Mode Adjustments
```
- Reduce shadow intensity (use glows instead)
- Lower image opacity slightly (90%)
- Use surface elevation through brightness, not shadows
- Ensure text contrast remains high (>7:1 for body text)
```

---

## 📊 Data Visualization

### Charts
```
Style:
  - Line/Bar thickness: 3px (lines), 16px (bars)
  - Grid lines: 1px, Border Light color
  - Axes: Label Small typography
  - Legends: Body Small
  - Tooltips: Card style with 8px padding
  
Colors:
  - Primary data: Primary color
  - Secondary: Success color
  - Use consistent color per metric across app
```

### Stats Display
```
Large Number:
  - Value: Display or Headline 1
  - Unit: Body Small (muted color)
  - Label: Label Regular
  - Layout: Value + Unit on same line, Label below
```

---

## 🚀 Implementation Priority

### Phase 1: Foundation (Week 1)
- [ ] Update color tokens in theme system
- [ ] Implement new typography scale
- [ ] Create spacing utilities
- [ ] Update dark mode colors

### Phase 2: Core Components (Week 2)
- [ ] Redesign buttons (Primary, Secondary, Text)
- [ ] Redesign cards
- [ ] Redesign input fields
- [ ] Update navigation components

### Phase 3: Screen Updates (Week 3-4)
- [ ] Dashboard/Home screen
- [ ] Active workout screen
- [ ] Progress dashboard
- [ ] Profile screens
- [ ] Settings screens

### Phase 4: Polish (Week 5)
- [ ] Add animations
- [ ] Refine spacing
- [ ] Accessibility audit
- [ ] Dark mode refinement
- [ ] User testing & iteration

---

## 📝 Design Principles

### 1. Clarity Over Cleverness
- Information hierarchy is king
- Clear labels, obvious actions
- No mystery meat navigation

### 2. Performance First
- Fast animations (<300ms)
- Optimistic UI updates
- Smooth 60fps scrolling
- Instant feedback

### 3. Respectful of User Time
- Quick actions always available
- Smart defaults
- Minimal input required
- Progress always visible

### 4. Consistent but Flexible
- Reuse components
- Consistent patterns
- But adapt to context
- Context-appropriate density

### 5. Build Trust
- Clear data ownership
- Transparent progress tracking
- Helpful, not pushy
- Celebrate achievements authentically

---

## 🎨 Visual Examples

### Color Usage Hierarchy
```
1. Primary: Actions, CTAs, key navigation
2. Success: Completed states, achievements
3. Neutral: Most UI, backgrounds, text
4. Warning/Error: Sparingly, only for alerts

Rule: No more than 3 colors visible at once
```

### White Space Strategy
```
- Generous: Between major sections (24-48px)
- Comfortable: Between related items (12-16px)
- Tight: Within components (4-8px)

More white space = More premium feel
```

### Emphasis Techniques (in priority order)
```
1. Size (bigger = more important)
2. Weight (bolder = more important)
3. Color (brighter = more important)
4. Position (top/center = more important)
5. Space (more surrounding space = more important)
```

---

## 🔗 Reference Inspirations

### Nike Training Club
- Bold, confident typography
- High-impact hero images
- Strong CTAs
- Motivational micro-copy
- Generous white space

### Hevy
- Data-first approach
- Clean, scannable layouts
- Intuitive workout logging
- Excellent use of progressive disclosure
- Clear visual hierarchy

### Modern Fitness App Trends
- Minimalist aesthetic
- Focus on content, not chrome
- Dark mode as default
- Smooth, natural animations
- Gamification done tastefully

---

## ✅ Success Metrics

Post-redesign, measure:
1. **Task completion time**: Should decrease 20%+
2. **User satisfaction**: Target 4.5+ stars
3. **Session duration**: Should increase (more engaging)
4. **Error rate**: Should decrease
5. **Workout completion rate**: Should increase

---

*Design system version 1.0 - January 2026*
*To be iterated based on user feedback and testing*
