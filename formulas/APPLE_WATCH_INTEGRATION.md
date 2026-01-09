# Apple Watch Integration Guide

## Overview

This document outlines the planned Apple Watch integration for My Mobile Trainer. The watch app will provide a companion experience for tracking workouts directly from the wrist.

**Status:** 📋 **Planned** - Future implementation

---

## Features

### 4.7.3.1 Current Set Display
- Show current exercise name
- Display target weight and reps
- Show set number and progress
- Timer for rest periods

### 4.7.3.2 Rest Timer on Watch
- Full-screen countdown timer
- Haptic feedback at intervals (30s, 15s, 5s, done)
- Quick add time buttons (+15s, +30s)
- Pause/resume controls

### 4.7.3.3 Quick Log from Watch
- Voice dictation for reps
- Digital crown for weight adjustment
- Tap to complete set
- Sync to phone in real-time

### 4.7.3.4 Heart Rate Zone Display
- Real-time heart rate monitoring
- Zone indicator (warmup, aerobic, anaerobic)
- Integration with HealthKit
- Calorie burn estimation

---

## Technical Implementation

### WatchOS App Structure

```
MyMobileTrainerWatch/
├── Extension/
│   ├── ExtensionDelegate.swift
│   ├── WorkoutInterfaceController.swift
│   ├── RestTimerController.swift
│   └── SetLogController.swift
├── Models/
│   ├── WatchWorkoutSession.swift
│   └── WatchSetLog.swift
└── Connectivity/
    ├── WatchConnectivityManager.swift
    └── HealthKitManager.swift
```

### Watch Connectivity

**Communication Methods:**
1. **Background Transfer**: For workout data sync
2. **Interactive Messaging**: For real-time updates during active workout
3. **Context Sharing**: For current workout state
4. **ComplicationController**: For watch face display

```swift
// Example: Watch Connectivity Manager
import WatchConnectivity

class WatchConnectivityManager: NSObject, WCSessionDelegate {
    static let shared = WatchConnectivityManager()
    
    func startSession() {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        session.delegate = self
        session.activate()
    }
    
    func sendWorkoutUpdate(_ workout: WorkoutSession) {
        let data: [String: Any] = [
            "type": "workout_update",
            "weekNumber": workout.weekNumber,
            "dayNumber": workout.dayNumber,
            "currentExercise": workout.currentExerciseIndex,
            "currentSet": workout.currentSetIndex
        ]
        
        WCSession.default.sendMessage(data, replyHandler: nil)
    }
    
    func receiveSetLog(_ setLog: SetLog) {
        // Handle set logged from watch
        NotificationCenter.default.post(
            name: .watchSetLogged,
            object: setLog
        )
    }
}
```

### HealthKit Integration

```swift
import HealthKit

class HealthKitManager {
    let healthStore = HKHealthStore()
    
    func requestAuthorization() {
        let types: Set<HKSampleType> = [
            HKObjectType.quantityType(forIdentifier: .heartRate)!,
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKObjectType.workoutType()
        ]
        
        healthStore.requestAuthorization(toShare: types, read: types) { success, error in
            if success {
                self.startWorkoutSession()
            }
        }
    }
    
    func startWorkoutSession() {
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = .traditionalStrengthTraining
        configuration.locationType = .indoor
        
        // Start workout session
    }
}
```

---

## UI/UX Design

### Watch Face Complications

**Modular Complications:**
- Large: Next workout countdown
- Small: Current week/day indicator
- Circular: Streak flame icon

### Watch App Screens

#### 1. Workout Overview
```
┌─────────────────┐
│  Week 2 • Day 1 │
│                 │
│   CHEST & BACK  │
│                 │
│   5 Exercises   │
│    ~30 min      │
│                 │
│  [START] [SKIP] │
└─────────────────┘
```

#### 2. Active Set
```
┌─────────────────┐
│  Bench Press    │
│   Set 3 of 6    │
│                 │
│    225 lbs      │
│    × 5 reps     │
│                 │
│  [DONE] [SKIP]  │
└─────────────────┘
```

#### 3. Rest Timer
```
┌─────────────────┐
│   REST TIME     │
│                 │
│      1:30       │
│   ████████░░    │
│                 │
│   +15s  +30s    │
└─────────────────┘
```

---

## React Native Integration

### Setting Up Watch Connectivity

```typescript
// services/WatchConnectivityService.ts
import { NativeModules, NativeEventEmitter } from 'react-native';

const { WatchConnectivity } = NativeModules;
const watchEmitter = new NativeEventEmitter(WatchConnectivity);

export class WatchConnectivityService {
  static initialize() {
    WatchConnectivity.startSession();
    
    watchEmitter.addListener('watchSetLogged', (setLog) => {
      // Handle set logged from watch
      store.dispatch(logSet(setLog));
    });
  }
  
  static sendWorkoutToWatch(workout: WorkoutSession) {
    WatchConnectivity.sendWorkout({
      weekNumber: workout.weekNumber,
      dayNumber: workout.dayNumber,
      exercises: workout.exercises.map(ex => ({
        name: ex.exerciseId,
        suggestedWeight: ex.suggestedWeight,
        sets: ex.sets.length,
      })),
    });
  }
  
  static updateCurrentSet(exerciseIndex: number, setIndex: number) {
    WatchConnectivity.updateCurrentSet(exerciseIndex, setIndex);
  }
}
```

---

## Dependencies

### iOS Native Modules Required

```ruby
# ios/Podfile
target 'MyMobileTrainerWatch Extension' do
  platform :watchos, '7.0'
  
  pod 'WatchConnectivity'
  pod 'HealthKit'
end
```

### React Native Packages

```json
{
  "dependencies": {
    "react-native-watch-connectivity": "^1.1.0"
  }
}
```

---

## Implementation Phases

### Phase 1: Basic Connectivity (Week 1)
- [ ] Set up WatchOS target in Xcode
- [ ] Implement WatchConnectivity on iOS side
- [ ] Create React Native bridge
- [ ] Test basic message passing

### Phase 2: Core Features (Week 2-3)
- [ ] Display current workout on watch
- [ ] Implement rest timer
- [ ] Add set logging from watch
- [ ] Sync data bidirectionally

### Phase 3: Advanced Features (Week 4)
- [ ] Heart rate monitoring
- [ ] Complication support
- [ ] Voice dictation for reps
- [ ] Haptic feedback patterns

### Phase 4: Polish & Testing (Week 5)
- [ ] UI refinements
- [ ] Battery optimization
- [ ] Error handling
- [ ] User testing

---

## Testing Strategy

### Unit Tests
- Watch connectivity message handling
- Data synchronization logic
- HealthKit integration

### Integration Tests
- Phone to watch data flow
- Watch to phone set logging
- Connection loss recovery

### Device Testing
- Test on physical Apple Watch
- Battery drain monitoring
- Real workout scenarios
- Edge case handling

---

## Battery Optimization

### Strategies
1. **Background Updates**: Use efficient background refresh
2. **Workout Sessions**: Use HKWorkoutSession for optimized tracking
3. **Complication Updates**: Limit update frequency
4. **Connectivity**: Batch messages when possible

---

## Accessibility

- VoiceOver support for all screens
- Large text compatibility
- Haptic alternatives to visual feedback
- Color-blind friendly indicators

---

## Future Enhancements

- [ ] Standalone watch app (without phone)
- [ ] Cellular connectivity support
- [ ] Auto-detection of exercise completion
- [ ] Integration with gym equipment (Bluetooth)
- [ ] Social challenges visible on watch

---

## References

- [Apple Watch Development Guide](https://developer.apple.com/watchos/)
- [WatchConnectivity Framework](https://developer.apple.com/documentation/watchconnectivity)
- [HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [React Native Watch Connectivity](https://github.com/mtford90/react-native-watch-connectivity)

---

**Last Updated:** 2026-01-08  
**Status:** Planning Phase  
**Target Release:** Phase 5.0
