# Lumen App Questionnaire Workflow & Ideas for MyMobileTrainer

**Document Created:** January 10, 2026  
**Purpose:** Research insights from Lumen's onboarding process and application to MyMobileTrainer

---

## Overview of Lumen App

### What is Lumen?
Lumen is a handheld metabolic tracking device and app that measures whether your body is burning carbohydrates or fats through breath analysis (indirect calorimetry). It provides real-time, personalized feedback about metabolic state and offers coaching for nutrition, exercise, and lifestyle optimization.

### Core Value Proposition
- **Personalization:** Real-time metabolic feedback tailored to individual physiology
- **Data-Driven:** Scientific measurements (CO2 in breath) drive recommendations
- **Holistic Approach:** Integrates nutrition, exercise, sleep, and lifestyle factors
- **Continuous Learning:** App learns from user patterns over time and adjusts recommendations

---

## Lumen's Onboarding & Questionnaire Workflow

### Phase 1: Account Creation & Device Pairing
**Duration:** 2-3 minutes

1. **Account Setup**
   - Login method selection (Apple, Google, Facebook, Email)
   - Email verification
   - Accept terms & privacy policy

2. **Device Connection**
   - Enable Bluetooth permissions
   - Enable Location permissions
   - Turn on Lumen device
   - Pair via Bluetooth (purple indicator when connected)

### Phase 2: Personal Profile Questionnaire
**Duration:** 3-5 minutes  
**Purpose:** Establish baseline understanding of user's physiology and lifestyle

#### Basic Demographics
- **Age** (affects metabolic rate calculations)
- **Gender** (hormonal factors, body composition norms)
- **Height** (BMI and energy expenditure calculations)
- **Current Weight** (metabolic baseline)
- **Target Weight** (if weight management is a goal)

#### Lifestyle Assessment
- **Estimated Hours of Sleep** (daily average)
- **Sleep Quality** (poor, fair, good, excellent)
- **Daily Activity Level**
  - Sedentary (desk job, minimal movement)
  - Light Activity (some walking, light exercise)
  - Moderate Activity (regular exercise 3-4x/week)
  - Very Active (intense exercise 5-6x/week)
  - Athlete (training daily, high intensity)

#### Health & Goals
- **Primary Goal Selection**
  - Weight Loss
  - Muscle Gain
  - Athletic Performance
  - Quality of life (old people)

- **Current Diet Pattern** (Extensive Onboarding)
  - Standard (balanced, no restrictions)
  - Low Carb / Keto
  - Mediterranean
  - Plant-Based / Vegetarian
  - Intermittent Fasting
  - Other / Prefer not to say

- **Dietary Restrictions & Allergies** (optional) (Extensive Onboarding)
  - Food allergies
  - Religious/ethical restrictions
  - Food preferences

#### Exercise Habits
- **Current Workout Frequency**
  - Not currently exercising
  - 1-2 times per week
  - 3-4 times per week
  - 5-6 times per week
  - Daily

- **Primary Exercise Types**
  - Cardio (running, cycling)
  - Strength Training
  - HIIT
  - Yoga/Pilates
  - Sports
  - Mixed/Varied

- **Workout Timing**
  - Morning (before breakfast)
  - Morning (after breakfast)
  - Afternoon
  - Evening

#### Medical & Lifestyle Factors
- **Stress Level** (1-10 scale)
- **Coffee/Caffeine Intake** (cups per day)
- **Alcohol Consumption** (drinks per week)
- **Medications** (that affect metabolism - optional)
- **Health Conditions** (diabetes, thyroid issues, etc.)

### Phase 3: Device Calibration & First Measurement
**Duration:** 5-10 minutes

1. **Tutorial/Education**
   - How the device works (video/animation)
   - Proper breathing technique
   - What the scores mean (1-5 scale)
   - How to interpret results

2. **Calibration Breaths**
   - Morning fasted measurement (baseline)
   - Wait for result processing
   - Receive first metabolic score
   - Get initial recommendations

3. **Personalized Insights Setup**
   - Review calculated metabolic age
   - See metabolic flexibility score
   - Establish baseline metrics
   - Set up daily measurement reminders

### Phase 4: Nutrition Plan Setup
**Duration:** 2-3 minutes

1. **Meal Timing Preferences**
   - Wake-up time
   - Typical breakfast time
   - Lunch time
   - Dinner time
   - Snacking habits

2. **Nutrition Plan Generation**
   - Personalized macro targets (carbs, protein, fat)
   - Daily calorie recommendation
   - Meal timing suggestions
   - Hydration goals

3. **Integration Options**
   - Connect fitness trackers (optional)
   - Connect nutrition apps (MyFitnessPal, etc.)
   - Enable notifications

---

## Key UX Patterns from Lumen

### 1. Progressive Disclosure
- Collects information incrementally, not all at once
- Users can skip optional questions and return later
- Advanced features unlock as users engage more

### 2. Contextual Education
- Each question includes "Why we ask this" tooltip
- Scientific explanations are brief but available
- Visual aids (icons, illustrations) clarify complex concepts

### 3. Immediate Value Delivery
- First measurement happens during onboarding
- Users see their metabolic score before finishing setup
- Creates "aha moment" that drives engagement

### 4. Personalization Emphasis
- Constantly reinforces that recommendations are "for you"
- Shows how each data point affects personalization
- Dashboard displays "Your Unique Metabolic Profile"

### 5. Flexibility & Control
- Users can edit profile information anytime
- Can change goals and preferences
- No judgment - app adapts to user's choices

---

## Application to MyMobileTrainer

### Enhanced Onboarding Questionnaire

#### Current State
Your app currently has a simple onboarding:
- Name entry
- Experience level (Beginner/Moderate)
- Body weight input
- Max determination week

#### Proposed Enhancement: Comprehensive Fitness Profile

### Phase 1: Welcome & Account (1-2 min)
```
Screen 1: Welcome
- App value proposition
- "Let's personalize your training" CTA

Screen 2: Account Creation
- Name
- Email (optional for cloud backup)
- Login options

Screen 3: Your Fitness Journey
- "Tell us about yourself so we can create your perfect training plan"
```

### Phase 2: Physical Profile (2-3 min)
```
Screen 4: Body Stats
- Age (affects recovery, intensity recommendations)
- Gender (strength norms, recovery patterns)
- Height
- Current Weight
- Target Weight (optional)

Screen 5: Experience Level
[CURRENT] Keep existing:
- Beginner (start with Pre-Workout 1)
- Moderate (start with Pre-Workout 2)

ADD:
- Advanced (skip to Week 1 after max week)
- Athlete (customize periodization)

Screen 6: Training Background
- Years of consistent training
- Last time trained regularly
- Previous experience with max lifts
- Familiar exercises (multi-select)
```

### Phase 3: Lifestyle Assessment (2-3 min)
```
Screen 7: Recovery Factors
- Average Sleep per Night
  - <6 hours
  - 6-7 hours  
  - 7-8 hours
  - 8+ hours
- Sleep Quality (1-5 stars)
- Stress Level (1-10 slider)

WHY: Affects workout intensity, recovery recommendations, deload timing

Screen 8: Schedule & Availability
- Preferred Workout Days
  - Mon / Tue / Wed / Thu / Fri / Sat / Sun (multi-select)
- Typical Workout Time
  - Early Morning (5-7am)
  - Morning (7-10am)
  - Midday (10am-2pm)
  - Afternoon (2-5pm)
  - Evening (5-8pm)
  - Night (8pm+)
- Average Workout Duration Goal
  - 30-45 minutes
  - 45-60 minutes
  - 60-90 minutes
  - 90+ minutes

WHY: Schedules workouts, adjusts volume based on time availability

Screen 9: Daily Activity
- Occupation Activity Level
  - Sedentary (desk job)
  - Light (some walking)
  - Moderate (standing/moving frequently)
  - Active (physical labor)
- Non-Gym Activity
  - Sports (list)
  - Active hobbies
  - Daily walking/cycling

WHY: Affects total weekly volume, recovery needs
```

### Phase 4: Goals & Motivations (2 min)
```
Screen 10: Primary Goal (select top 3)
- Build Maximum Strength
- Gain Muscle Mass
- Improve Athletic Performance
- Weight Loss
- Improve Fitness & Health
- Increase Energy
- Compete in Powerlifting/Sports
- Look Better / Body Composition
- Prepare for Event (wedding, vacation, etc.)

Screen 11: What Motivates You?
- Breaking personal records
- Seeing physical changes
- Hitting new milestones
- Competition/leaderboards
- Consistency streaks
- Learning proper form
- Achieving specific lift goals

WHY: Customizes gamification, notifications, celebration moments

Screen 12: Specific Goals (optional)
- Target Bench Press Max: ___ lbs
- Target Squat Max: ___ lbs
- Target Deadlift Max: ___ lbs
- Target Body Weight: ___ lbs
- Timeline: ___ months

WHY: Creates milestone tracking, adjusts progression pace
```

### Phase 5: Health & Limitations (1-2 min)
```
Screen 13: Injury & Health Status
- Any Current Injuries? (Yes/No)
  - If Yes: specify area + severity
- Previous Injuries (that still affect training)
- Movement Limitations
- Medical Conditions affecting training

Screen 14: Exercise Restrictions
- Exercises to Avoid
  - Due to injury
  - Due to equipment availability
  - Personal preference
- Preferred Exercise Variations
  - Barbell / Dumbbell / Machine preference

WHY: Exercise substitution suggestions, form check emphasis
```

### Phase 6: Equipment & Environment (1 min)
```
Screen 15: Training Environment
- Where do you train?
  - Commercial Gym (full equipment)
  - Home Gym (list equipment)
  - Garage/Basic Setup
  - Outdoors/Minimal Equipment

Screen 16: Available Equipment (multi-select)
- Barbell & Plates
- Dumbbells (weight range)
- Squat Rack / Cage
- Bench (flat/adjustable)
- Pull-up Bar
- Cable Machine
- Resistance Bands
- Other (specify)

WHY: Exercise selection, substitution options
```

### Phase 7: Preferences & Customization (1-2 min)
```
Screen 17: Training Preferences
- Prefer Higher Reps or Heavier Weight?
  - Heavy (1-5 reps)
  - Moderate (6-10 reps)
  - Higher (10-15 reps)
  - Mixed (variety)

- Rest Period Preference
  - Minimal (short, intense workouts)
  - Standard (follow program)
  - Extended (full recovery)

- Cardio/Conditioning Interest
  - Not interested
  - Light (warm-up only)
  - Moderate (1-2x week)
  - High (regular conditioning)

Screen 18: Nutrition Interest (optional)
- Track Nutrition? (Yes/No)
- Current Diet Pattern
- Interested in Macro Guidance?

WHY: Future feature integration, holistic coaching
```

### Phase 8: Max Determination Setup (3 min)
```
Screen 19: Establishing Your Baseline
[CURRENT FLOW] Enhanced with context from questionnaire

- "Based on your [experience level] and goals, here's how we'll establish your starting weights"

If Beginner:
  - Pre-Workout 1 → Pre-Workout 2 → Max Week
  
If Moderate:
  - Pre-Workout 2 → Max Week
  
If Advanced/Athlete:
  - Option to enter known maxes
  - Or go through Max Week verification

Screen 20: Max Week Introduction
- What to expect
- Exercise list
- Safety tips
- Form resources

Screen 21: Ready to Begin!
- Personalized preview of Week 1
- "Your plan is ready"
- "Let's get started" CTA
```

---

## Implementation Recommendations

### Technical Architecture

#### 1. Data Model: User Profile Schema
```typescript
interface UserProfile {
  // Basic Info
  id: string;
  name: string;
  email?: string;
  createdAt: Date;
  
  // Physical Profile
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  height: number; // inches
  currentWeight: number; // lbs
  targetWeight?: number;
  
  // Experience & Background
  experienceLevel: 'beginner' | 'moderate' | 'advanced' | 'athlete';
  yearsTraining?: number;
  lastTrainedDate?: Date;
  familiarExercises: string[];
  
  // Lifestyle Factors
  sleepHoursAverage: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  stressLevel: number; // 1-10
  occupationActivityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  dailyActivityExtras: string[];
  
  // Training Schedule
  preferredWorkoutDays: string[]; // ['monday', 'wednesday', 'friday']
  preferredWorkoutTime: string;
  targetWorkoutDuration: number; // minutes
  
  // Goals & Motivation
  primaryGoals: string[]; // top 3
  motivationFactors: string[];
  specificGoals?: {
    benchMax?: number;
    squatMax?: number;
    deadliftMax?: number;
    targetBodyWeight?: number;
    timeline?: number; // months
  };
  
  // Health & Limitations
  currentInjuries?: {
    area: string;
    severity: 'minor' | 'moderate' | 'severe';
    description: string;
  }[];
  previousInjuries?: string[];
  movementLimitations?: string[];
  medicalConditions?: string[];
  exercisesToAvoid?: string[];
  
  // Equipment & Environment
  trainingEnvironment: string;
  availableEquipment: string[];
  
  // Training Preferences
  repRangePreference: 'heavy' | 'moderate' | 'higher' | 'mixed';
  restPeriodPreference: 'minimal' | 'standard' | 'extended';
  cardioInterest: 'none' | 'light' | 'moderate' | 'high';
  
  // Optional Features
  trackNutrition: boolean;
  dietPattern?: string;
  interestedInMacros: boolean;
  
  // Onboarding Status
  onboardingComplete: boolean;
  onboardingStep: number;
  lastUpdated: Date;
}
```

#### 2. Progressive Onboarding Flow
```typescript
interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  completedSections: string[];
  canSkip: boolean;
  minimumRequiredFields: string[];
  optionalFields: string[];
}

// Example: User can complete in stages
const onboardingStages = {
  required: ['name', 'experienceLevel', 'currentWeight'], // Minimum to start
  recommended: ['age', 'gender', 'goals', 'schedule'], // For better personalization
  optional: ['injuries', 'nutrition', 'specificGoals'] // Enhanced features
};
```

#### 3. Smart Recommendations Engine
```typescript
interface PersonalizationEngine {
  // Based on questionnaire data, adjust:
  
  adjustWorkoutVolume(): {
    // Factor in: sleep, stress, daily activity, experience
    volumeMultiplier: number; // 0.8 - 1.2
    recommendedDeloadFrequency: number; // weeks
  };
  
  adjustIntensityRecommendations(): {
    // Factor in: age, recovery quality, goals
    maxIntensityPercentage: number;
    volumeDayEmphasis: boolean;
  };
  
  customizeExerciseSelection(): {
    // Factor in: equipment, injuries, preferences
    exerciseSubstitutions: Map<string, string[]>;
    priorityExercises: string[];
  };
  
  optimizeSchedule(): {
    // Factor in: preferred days, workout duration
    recommendedWorkoutDays: string[];
    workoutSplit: string;
  };
  
  personalizeGamification(): {
    // Factor in: motivation factors
    emphasizedMetrics: string[];
    celebrationTriggers: string[];
    notificationStyle: string;
  };
}
```

### UX Best Practices

#### 1. Progressive Disclosure Pattern
```
✅ DO: Break into digestible chunks (3-5 questions per screen)
✅ DO: Show progress indicator (Step 2 of 8)
✅ DO: Allow "Skip for now" on optional questions
✅ DO: Save progress automatically
✅ DO: Allow editing later in Profile section

❌ DON'T: Long scrolling forms
❌ DON'T: Required fields unless absolutely necessary
❌ DON'T: Technical jargon without explanation
```

#### 2. Contextual Help
```
Each question includes:
- Clear label
- Brief description
- "Why we ask this" tooltip (?)
- Example or suggested values
- Visual aids where helpful
```

#### 3. Visual Design
```
- Use cards for each question group
- Icons for each category (🏋️ for training, 😴 for sleep, etc.)
- Color coding for different sections
- Illustrations for complex concepts
- Progress bar showing completion %
```

#### 4. Time Estimation
```
Show time estimate per section:
"Physical Profile (2-3 minutes)"
"Almost done! (1 minute)"

Total onboarding target: 10-12 minutes
Minimum viable: 3-5 minutes (required only)
```

---

## Personalization Use Cases

### Use Case 1: The Busy Professional
**Profile:** 35-year-old, desk job, limited time, moderate stress

**Questionnaire Data:**
- Occupation: Sedentary
- Sleep: 6-7 hours
- Stress: 7/10
- Preferred Time: Early morning
- Workout Duration: 30-45 min

**Personalization Applied:**
- ✅ Shorter, efficient workouts (supersets, circuits)
- ✅ Volume reduced by 10% vs. standard
- ✅ More frequent deload weeks (every 3 weeks vs. 4)
- ✅ Emphasis on compound movements
- ✅ Recovery tips in notifications

---

### Use Case 2: The Young Athlete
**Profile:** 22-year-old, plays sports, high energy, ambitious goals

**Questionnaire Data:**
- Age: 22
- Experience: Advanced
- Activity: Very Active (sports 3x/week)
- Sleep: 8+ hours
- Goals: Athletic performance, strength

**Personalization Applied:**
- ✅ Higher volume tolerance
- ✅ Explosive/power movements included
- ✅ Sports-specific conditioning options
- ✅ Competitive leaderboard emphasis
- ✅ Aggressive progression targets

---

### Use Case 3: The Comeback Trainer
**Profile:** 45-year-old, trained years ago, previous injury, cautious

**Questionnaire Data:**
- Years Since Training: 5+ years
- Previous Injury: Lower back
- Movement Limitations: Avoid heavy deadlifts
- Goals: Regain fitness, health

**Personalization Applied:**
- ✅ Extended Pre-Workout phase (3-4 weeks)
- ✅ Deadlift → Trap Bar Deadlift substitution
- ✅ Extra form check prompts
- ✅ Conservative progression rate
- ✅ More recovery days
- ✅ Milestone celebrations for consistency, not just PRs

---

## Implementation Phases

### Phase 1: MVP Enhancement (Week 1-2)
Add essential questions to existing onboarding:
- Age, gender, height (for better max calculations)
- Sleep hours (for recovery insights)
- Preferred workout days (for scheduling)
- Primary goal (for motivation customization)

### Phase 2: Lifestyle Integration (Week 3-4)
Expand profile with lifestyle factors:
- Stress level
- Daily activity
- Schedule preferences
- Time availability

Use data to adjust:
- Volume recommendations
- Deload timing
- Rest period suggestions

### Phase 3: Health & Customization (Week 5-6)
Add health and injury tracking:
- Injury history
- Exercise limitations
- Movement restrictions

Implement:
- Smart exercise substitutions
- Form check prioritization
- Personalized warnings

### Phase 4: Advanced Personalization (Week 7-8)
Full personalization engine:
- Equipment-based workout variations
- Goal-specific programming adjustments
- Motivation-based gamification
- Nutrition interest survey

### Phase 5: Continuous Learning (Ongoing)
Implement feedback loops:
- "How did that workout feel?" (RPE)
- "Are you recovering well?" (weekly check-in)
- "Goals still accurate?" (monthly review)
- Adaptive recommendations based on performance

---

## Key Takeaways from Lumen

### What Makes Lumen's Onboarding Great:

1. **Immediate Value**
   - First breath measurement during onboarding
   - User sees their unique metabolic score right away
   - Creates emotional investment

   **Apply to MyMobileTrainer:**
   - Show "Your Predicted 1RM" after questionnaire
   - Display "Your Personalized Plan Preview"
   - Generate strength potential estimate

2. **Scientific Yet Accessible**
   - Complex science explained simply
   - Visuals and animations clarify concepts
   - "Why this matters" always present

   **Apply to MyMobileTrainer:**
   - Explain periodization in simple terms
   - Show visual of progression over weeks
   - "Why we use percentages" education

3. **Empowering, Not Judging**
   - No "right" or "wrong" answers
   - Adapts to user's current state
   - Positive, encouraging tone

   **Apply to MyMobileTrainer:**
   - "Beginner" → "Building Your Foundation"
   - No shame for time off or limitations
   - Celebrate starting the journey

4. **Flexible Yet Guided**
   - Can skip optional questions
   - Can change answers anytime
   - But app guides toward completeness

   **Apply to MyMobileTrainer:**
   - "Complete Your Profile" card on dashboard
   - "Unlock better recommendations" incentive
   - Periodic "Update your goals?" prompts

5. **Privacy Conscious**
   - Clear about data usage
   - Optional fields clearly marked
   - Can delete/export data

   **Apply to MyMobileTrainer:**
   - Privacy policy clear and accessible
   - Data export feature
   - Optional cloud sync

---

## Mobile UI/UX Mockup Concepts

### Screen Flow Example:

```
[Splash Screen]
    ↓
[Welcome - Value Prop]
    ↓
[Create Account]
    ↓
[Physical Stats - Age/Height/Weight] (Screen 1/8)
    ↓
[Experience Level] (Screen 2/8)
    ↓
[Goals Selection] (Screen 3/8)
    ↓
[Weekly Schedule - How many days a week and which days] (Screen 4/8)
    ↓
[Lifestyle Factors - Premium app feature not on basic Freemium] (Screen 5/8)
    ↓
[Health & Limitations] (Screen 6/8)
    ↓
[Equipment Check] (Screen 7/8)
    ↓
[Max Week Introduction] (Screen 8/8)
    ↓
[Your Plan is Ready! 🎉]
    ↓
[Dashboard]
```

### Card-Based Design Pattern:

```
┌─────────────────────────────────────┐
│  💪 Physical Profile                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  Age                                │
│  [           25           ]         │
│                                     │
│  Height                             │
│  [  5  ] ft  [  10  ] in           │
│                                     │
│  Current Weight                     │
│  [          180          ] lbs      │
│                                     │
│  ⓘ Why we ask: Helps calculate...  │
│                                     │
│  [ Skip for now ]     [ Continue ] │
└─────────────────────────────────────┘
```

### Multi-Select Goal Interface:

```
┌─────────────────────────────────────┐
│  🎯 What are your goals?            │
│  (Select up to 3)                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ☑ Build Maximum Strength           │
│  ☐ Gain Muscle Mass                 │
│  ☑ Improve Athletic Performance     │
│  ☐ Weight Loss                      │
│  ☑ Increase Energy                  │
│  ☐ Compete in Powerlifting          │
│  ☐ Look Better                      │
│                                     │
│  Progress: ━━━━━━━━━━━━━━━━━ 3/8   │
│                                     │
│  [ Back ]              [ Continue ] │
└─────────────────────────────────────┘
```

---

## Analytics & Optimization

### Track Onboarding Metrics:

```typescript
interface OnboardingAnalytics {
  // Completion Metrics
  startedOnboarding: number;
  completedOnboarding: number;
  completionRate: number;
  avgTimeToComplete: number; // minutes
  
  // Drop-off Analysis
  dropOffByStep: Map<number, number>;
  mostSkippedQuestions: string[];
  
  // Engagement
  questionsAnswered: Map<string, number>;
  optionalQuestionsCompletionRate: number;
  profileUpdatesAfterOnboarding: number;
  
  // Quality Metrics
  dataCompleteness: number; // % of fields filled
  usersWithCompleteProfiles: number;
}
```

### A/B Testing Opportunities:
- Order of questions (goals first vs. physical stats first)
- Length of onboarding (comprehensive vs. minimal + profile completion)
- Visual style (illustrated vs. photo-based vs. minimal)
- Progress indicator style (steps vs. percentage vs. none)
- Skip options (explicit "Skip" button vs. "I'll do this later")

---

## Future Enhancements

### 1. Adaptive Questionnaire
```
Based on answers, change follow-up questions:

If Goal = "Weight Loss"
  → Ask: Target weight, timeline, dietary restrictions

If Injury = "Yes"
  → Ask: Severity, affected movements, PT involvement

If Equipment = "Home Gym"
  → Ask: Specific items, weight ranges available
```

### 2. Photo/Video Integration
```
- Body progress photos (optional)
- Video form check during onboarding
- Visual equipment selection (show pictures)
```

### 3. Integration Permissions
```
- Connect Apple Health / Google Fit
- Import workout history from other apps
- Sync with wearables (Apple Watch, Whoop, etc.)
```

### 4. Social/Community
```
- Find training partners with similar goals
- Join challenges based on profile
- See others' success stories (similar age/experience)
```

### 5. AI-Powered Recommendations
```
- "Based on users like you, we recommend..."
- Predictive success modeling
- Personalized content feed
```

---

## Conclusion

Lumen's success stems from creating a **personalized, science-backed, yet accessible** onboarding experience that:

1. **Collects meaningful data** without feeling intrusive
2. **Provides immediate value** to justify the time investment
3. **Educates users** about why personalization matters
4. **Adapts continuously** based on ongoing user behavior
5. **Respects user autonomy** while guiding toward better outcomes

For MyMobileTrainer, adopting similar principles would transform the current simple onboarding into a **comprehensive fitness profiling system** that enables truly personalized training recommendations, better adherence, and improved outcomes.

The key is implementing this **progressively** - start with essential questions that immediately improve the experience, then expand based on user engagement and feature development priorities.

---

**Next Steps:**

1. Review current [`WelcomeScreen.tsx`](app/src/screens/onboarding/WelcomeScreen.tsx) implementation
2. Design enhanced questionnaire screens (UI mockups)
3. Implement progressive onboarding (Phase 1)
4. Build personalization engine
5. Test with beta users for feedback
6. Iterate based on completion rates and user satisfaction

**Estimated Development Time:** 6-8 weeks for full implementation

---

*Document compiled from research on Lumen metabolic tracking app and industry best practices for mobile app onboarding flows.*
