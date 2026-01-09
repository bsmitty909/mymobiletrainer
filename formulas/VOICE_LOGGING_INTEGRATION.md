# Voice Logging Integration Guide

## Overview

This document outlines the planned voice logging feature for My Mobile Trainer. Users will be able to log sets, reps, and weights using voice commands for a completely hands-free workout experience.

**Status:** 📋 **Planned** - Future implementation

---

## Features

### 4.7.4.1 Voice Commands
- "Log 8 reps at 225" → Automatically logs current set
- "Add 10 pounds" → Increases weight
- "Rest timer start" → Begins rest countdown
- "Skip set" → Marks current set as skipped
- "How much weight?" → Reads suggested weight
- "What's next?" → Reads next exercise

### 4.7.4.2 Hands-Free Operation
- Continuous listening mode during workout
- Wake word activation: "Hey Trainer"
- Voice feedback for all actions
- Confirmation prompts for critical actions

### 4.7.4.3 Siri Shortcuts Integration
- Pre-built shortcuts for common actions
- Custom shortcut creation
- Quick workout start
- Progress check via Siri

### 4.7.4.4 Smart Recognition
- Natural language processing
- Context-aware commands
- Error correction and suggestions
- Multi-language support

---

## Technical Implementation

### Architecture

```
Voice Logging System
├── Speech Recognition
│   ├── Native iOS Speech Framework
│   ├── Android Speech Recognizer
│   └── Fallback: Web Speech API
├── Command Processing
│   ├── Intent Classification
│   ├── Entity Extraction
│   └── Context Management
├── Feedback System
│   ├── Text-to-Speech
│   ├── Haptic Feedback
│   └── Visual Confirmation
└── Siri Shortcuts
    ├── Shortcut Definitions
    ├── Parameter Handling
    └── Response Formatting
```

### iOS Speech Recognition

```typescript
// services/VoiceLoggingService.ios.ts
import Voice from '@react-native-voice/voice';

export class VoiceLoggingService {
  private static isListening = false;
  private static currentContext: 'exercise' | 'rest' | 'idle' = 'idle';
  
  static async initialize() {
    Voice.onSpeechStart = this.handleSpeechStart;
    Voice.onSpeechEnd = this.handleSpeechEnd;
    Voice.onSpeechResults = this.handleSpeechResults;
    Voice.onSpeechError = this.handleSpeechError;
    
    await this.requestPermissions();
  }
  
  static async startListening() {
    if (this.isListening) return;
    
    try {
      await Voice.start('en-US');
      this.isListening = true;
      console.log('Started listening for voice commands');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  }
  
  static async stopListening() {
    if (!this.isListening) return;
    
    try {
      await Voice.stop();
      this.isListening = false;
      console.log('Stopped listening');
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }
  
  private static handleSpeechResults(event: any) {
    const results = event.value;
    if (results && results.length > 0) {
      const command = results[0].toLowerCase();
      this.processCommand(command);
    }
  }
  
  private static processCommand(command: string) {
    // Parse and execute voice command
    const intent = this.classifyIntent(command);
    
    switch (intent.type) {
      case 'log_set':
        this.handleLogSet(intent.params);
        break;
      case 'adjust_weight':
        this.handleAdjustWeight(intent.params);
        break;
      case 'start_timer':
        this.handleStartTimer();
        break;
      case 'query':
        this.handleQuery(intent.params);
        break;
      default:
        this.provideFeedback('Sorry, I didn\'t understand that command');
    }
  }
}
```

### Command Classification

```typescript
interface VoiceIntent {
  type: 'log_set' | 'adjust_weight' | 'start_timer' | 'skip' | 'query';
  confidence: number;
  params: {
    reps?: number;
    weight?: number;
    adjustment?: number;
    query?: string;
  };
}

class VoiceCommandProcessor {
  // Regular expressions for command patterns
  private static patterns = {
    logSet: /(?:log|did|completed?)\s+(\d+)\s+(?:reps?|repetitions?)\s+(?:at|@|with)?\s*(\d+)\s*(?:lbs?|pounds?)?/i,
    adjustWeight: /(?:add|increase|subtract|decrease|remove)\s+(\d+)\s*(?:lbs?|pounds?)?/i,
    startTimer: /(?:start|begin)\s+(?:rest\s+)?timer/i,
    skip: /skip\s+(?:this\s+)?set/i,
    queryWeight: /(?:how\s+much|what(?:'s| is)\s+the)\s+weight/i,
    queryNext: /what(?:'s| is)\s+next/i,
  };
  
  static classifyIntent(command: string): VoiceIntent {
    // Log set: "log 8 reps at 225"
    const logMatch = command.match(this.patterns.logSet);
    if (logMatch) {
      return {
        type: 'log_set',
        confidence: 0.95,
        params: {
          reps: parseInt(logMatch[1]),
          weight: parseInt(logMatch[2]),
        },
      };
    }
    
    // Adjust weight: "add 10 pounds"
    const adjustMatch = command.match(this.patterns.adjustWeight);
    if (adjustMatch) {
      const isIncrease = /add|increase/i.test(command);
      const adjustment = parseInt(adjustMatch[1]) * (isIncrease ? 1 : -1);
      return {
        type: 'adjust_weight',
        confidence: 0.9,
        params: { adjustment },
      };
    }
    
    // Start timer: "start rest timer"
    if (this.patterns.startTimer.test(command)) {
      return {
        type: 'start_timer',
        confidence: 0.95,
        params: {},
      };
    }
    
    // Skip set: "skip this set"
    if (this.patterns.skip.test(command)) {
      return {
        type: 'skip',
        confidence: 0.9,
        params: {},
      };
    }
    
    // Query weight: "how much weight?"
    if (this.patterns.queryWeight.test(command)) {
      return {
        type: 'query',
        confidence: 0.85,
        params: { query: 'weight' },
      };
    }
    
    // Query next: "what's next?"
    if (this.patterns.queryNext.test(command)) {
      return {
        type: 'query',
        confidence: 0.85,
        params: { query: 'next' },
      };
    }
    
    return {
      type: 'log_set',
      confidence: 0.0,
      params: {},
    };
  }
}
```

### Text-to-Speech Feedback

```typescript
import Tts from 'react-native-tts';

export class VoiceFeedbackService {
  static async initialize() {
    await Tts.setDefaultLanguage('en-US');
    await Tts.setDefaultRate(0.5);
    await Tts.setDefaultPitch(1.0);
  }
  
  static async speak(text: string, priority: 'high' | 'normal' = 'normal') {
    try {
      if (priority === 'high') {
        await Tts.stop();
      }
      await Tts.speak(text);
    } catch (error) {
      console.error('Error speaking:', error);
    }
  }
  
  static async speakSetLogged(reps: number, weight: number) {
    await this.speak(
      `Logged ${reps} reps at ${weight} pounds. Great work!`,
      'high'
    );
  }
  
  static async speakSuggestedWeight(weight: number) {
    await this.speak(
      `Your suggested weight is ${weight} pounds`,
      'normal'
    );
  }
  
  static async speakNextExercise(exerciseName: string) {
    await this.speak(
      `Next up: ${exerciseName}`,
      'normal'
    );
  }
}
```

---

## Siri Shortcuts Integration

### iOS Shortcuts Setup

```typescript
// services/SiriShortcutsService.ios.ts
import { SiriShortcutsEvent } from 'react-native-siri-shortcut';

export const SHORTCUT_TYPES = {
  START_WORKOUT: 'com.mymobiletrainer.startWorkout',
  LOG_SET: 'com.mymobiletrainer.logSet',
  CHECK_PROGRESS: 'com.mymobiletrainer.checkProgress',
  QUICK_RESUME: 'com.mymobiletrainer.quickResume',
};

export class SiriShortcutsService {
  static async registerShortcuts() {
    // Register "Start Today's Workout"
    await SiriShortcuts.donateShortcut({
      activityType: SHORTCUT_TYPES.START_WORKOUT,
      title: 'Start Today\'s Workout',
      userInfo: {},
      suggestedInvocationPhrase: 'Start my workout',
      isEligibleForSearch: true,
      isEligibleForPrediction: true,
    });
    
    // Register "Quick Resume"
    await SiriShortcuts.donateShortcut({
      activityType: SHORTCUT_TYPES.QUICK_RESUME,
      title: 'Resume Workout',
      userInfo: {},
      suggestedInvocationPhrase: 'Resume my workout',
      isEligibleForSearch: true,
      isEligibleForPrediction: true,
    });
    
    // Register "Check Progress"
    await SiriShortcuts.donateShortcut({
      activityType: SHORTCUT_TYPES.CHECK_PROGRESS,
      title: 'Check My Progress',
      userInfo: {},
      suggestedInvocationPhrase: 'Show my progress',
      isEligibleForSearch: true,
      isEligibleForPrediction: true,
    });
  }
  
  static handleShortcut(event: SiriShortcutsEvent) {
    const { activityType, userInfo } = event;
    
    switch (activityType) {
      case SHORTCUT_TYPES.START_WORKOUT:
        NavigationService.navigate('WorkoutDashboard');
        // Auto-start workout
        break;
      case SHORTCUT_TYPES.QUICK_RESUME:
        this.resumeWorkout();
        break;
      case SHORTCUT_TYPES.CHECK_PROGRESS:
        NavigationService.navigate('ProgressDashboard');
        break;
    }
  }
}
```

### Shortcut Responses

```typescript
// Example Siri response handling
class SiriResponseHandler {
  static formatWorkoutResponse(workout: WorkoutSession): string {
    const exerciseCount = workout.exercises.length;
    const duration = Math.ceil(exerciseCount * 6); // Rough estimate
    
    return `Starting Week ${workout.weekNumber}, Day ${workout.dayNumber}. ` +
           `You have ${exerciseCount} exercises today, ` +
           `estimated ${duration} minutes. Let's do this!`;
  }
  
  static formatProgressResponse(stats: WorkoutStats): string {
    return `You've completed ${stats.exercisesCompleted} exercises ` +
           `with ${stats.setsCompleted} total sets. ` +
           `Total volume: ${Math.round(stats.totalVolume)} pounds. ` +
           `You're crushing it!`;
  }
}
```

---

## Voice Command Reference

### Set Logging Commands
```
✓ "Log 8 reps at 225"
✓ "Completed 10 repetitions at 185 pounds"
✓ "Did 6 reps with 205"
✓ "Just did 12 at 95"
```

### Weight Adjustment Commands
```
✓ "Add 10 pounds"
✓ "Increase weight by 5"
✓ "Subtract 10 pounds"
✓ "Decrease by 5"
```

### Timer Commands
```
✓ "Start rest timer"
✓ "Begin timer"
✓ "Start resting"
✓ "How much time left?"
```

### Navigation Commands
```
✓ "Skip this set"
✓ "Next exercise"
✓ "Go back"
✓ "Finish workout"
```

### Query Commands
```
✓ "How much weight?"
✓ "What's the suggested weight?"
✓ "What's next?"
✓ "Show my progress"
```

---

## UI Integration

### Voice Button Component

```typescript
// components/workout/VoiceCommandButton.tsx
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import VoiceLoggingService from '../../services/VoiceLoggingService';

export default function VoiceCommandButton() {
  const [isListening, setIsListening] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);
  
  const handlePress = async () => {
    if (isListening) {
      await VoiceLoggingService.stopListening();
      setIsListening(false);
    } else {
      await VoiceLoggingService.startListening();
      setIsListening(true);
    }
  };
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
          backgroundColor: isListening ? '#FF6B6B' : '#4ECDC4',
          borderRadius: 32,
          padding: 16,
        }}
      >
        <Icon
          name={isListening ? 'microphone' : 'microphone-outline'}
          size={32}
          color="#fff"
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
```

---

## Privacy & Permissions

### Required Permissions

**iOS (Info.plist):**
```xml
<key>NSSpeechRecognitionUsageDescription</key>
<string>We need microphone access to enable voice logging of your sets</string>
<key>NSMicrophoneUsageDescription</key>
<string>Voice commands make hands-free workout logging possible</string>
```

**Android (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

### Privacy Considerations
- All voice processing happens on-device
- No audio is stored or transmitted
- User can disable voice features anytime
- Clear opt-in during onboarding

---

## Dependencies

```json
{
  "dependencies": {
    "@react-native-voice/voice": "^3.2.4",
    "react-native-tts": "^4.1.0",
    "react-native-siri-shortcut": "^2.3.0"
  }
}
```

---

## Implementation Phases

### Phase 1: Basic Voice Recognition (Week 1)
- [ ] Set up speech recognition
- [ ] Implement basic command parsing
- [ ] Add permission handling
- [ ] Test on physical devices

### Phase 2: Command Processing (Week 2)
- [ ] Implement intent classification
- [ ] Add entity extraction
- [ ] Build context management
- [ ] Add error handling

### Phase 3: Feedback System (Week 3)
- [ ] Implement text-to-speech
- [ ] Add voice confirmations
- [ ] Create feedback loops
- [ ] Test different scenarios

### Phase 4: Siri Integration (Week 4)
- [ ] Register shortcuts
- [ ] Handle shortcut invocations
- [ ] Format responses
- [ ] Test end-to-end

### Phase 5: Polish & Testing (Week 5)
- [ ] Multi-language support
- [ ] Noise handling
- [ ] Battery optimization
- [ ] User acceptance testing

---

## Testing Strategy

### Unit Tests
- Command parsing accuracy
- Intent classification
- Entity extraction
- Context management

### Integration Tests
- Voice recognition flow
- Siri shortcut handling
- Redux state updates
- Error recovery

### User Testing
- Gym environment testing
- Background noise handling
- Accent compatibility
- Edge case scenarios

---

## Accessibility

- Alternative input methods always available
- Visual feedback for all voice actions
- Haptic feedback support
- Compatible with VoiceOver/TalkBack

---

## Future Enhancements

- [ ] Wake word detection ("Hey Trainer")
- [ ] Continuous listening mode
- [ ] Custom voice training
- [ ] Multi-language support (Spanish, French, German)
- [ ] Conversational AI assistant
- [ ] Integration with smart speakers

---

## References

- [iOS Speech Framework](https://developer.apple.com/documentation/speech)
- [Android SpeechRecognizer](https://developer.android.com/reference/android/speech/SpeechRecognizer)
- [React Native Voice](https://github.com/react-native-voice/voice)
- [Siri Shortcuts](https://developer.apple.com/documentation/sirikit)

---

**Last Updated:** 2026-01-08  
**Status:** Planning Phase  
**Target Release:** Phase 5.5
