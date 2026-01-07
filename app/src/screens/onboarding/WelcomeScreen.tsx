/**
 * Welcome Screen
 * 
 * Enhanced onboarding that collects user info: age, weight, experience level
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, SegmentedButtons } from 'react-native-paper';
import { useAppDispatch } from '../../store/store';
import { createUser, completeOnboarding } from '../../store/slices/userSlice';
import Input from '../../components/common/Input';
import StorageService from '../../services/StorageService';

type OnboardingStep = 'welcome' | 'profile' | 'experience';

export default function WelcomeScreen() {
  const dispatch = useAppDispatch();
  
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'moderate' | 'advanced'>('beginner');

  const handleGetStarted = () => {
    setStep('profile');
  };

  const handleProfileNext = () => {
    if (name && age && weight) {
      setStep('experience');
    }
  };

  const handleComplete = async () => {
    // Create user profile
    dispatch(createUser({
      name,
      experienceLevel,
    }));

    // Save additional profile data
    const profileData = {
      name,
      age: parseInt(age, 10),
      weight: parseFloat(weight),
      experienceLevel,
      createdAt: Date.now(),
    };

    await StorageService.saveUserProfile(profileData);
    
    // Mark onboarding complete
    dispatch(completeOnboarding());
  };

  // Welcome Step
  if (step === 'welcome') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text variant="displayLarge" style={styles.title}>
            💪
          </Text>
          <Text variant="headlineLarge" style={styles.appName}>
            MY MOBILE TRAINER
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Your Personal Strength Training Companion
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            Smart, adaptive workouts based on Lance McCullough's proven "30 Minute Body" program
          </Text>
          
          <View style={styles.features}>
            <Text variant="bodyMedium" style={styles.feature}>✓ Formula-driven weight calculations</Text>
            <Text variant="bodyMedium" style={styles.feature}>✓ Progressive overload tracking</Text>
            <Text variant="bodyMedium" style={styles.feature}>✓ 5-week structured program</Text>
            <Text variant="bodyMedium" style={styles.feature}>✓ Exercise video demonstrations</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Get Started
          </Button>
          <Text variant="bodySmall" style={styles.credit}>
            Based on "30 Minute Body" by Lance McCullough
          </Text>
        </View>
      </View>
    );
  }

  // Profile Setup Step
  if (step === 'profile') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Text variant="headlineMedium" style={styles.formTitle}>
            👋 Let's Get to Know You
          </Text>
          <Text variant="bodyMedium" style={styles.formSubtitle}>
            This helps us personalize your workout experience
          </Text>

          <Input
            label="Your Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., John Smith"
            style={styles.input}
          />

          <Input
            label="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholder="e.g., 30"
            style={styles.input}
          />

          <Input
            label="Current Weight (lbs)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="e.g., 185"
            style={styles.input}
            helperText="We use this for initial weight calculations"
          />

          <Button
            mode="contained"
            onPress={handleProfileNext}
            disabled={!name || !age || !weight}
            style={styles.nextButton}
            contentStyle={styles.buttonContent}
          >
            Continue
          </Button>

          <Button
            mode="text"
            onPress={() => setStep('welcome')}
            style={styles.backButton}
          >
            Back
          </Button>
        </View>
      </ScrollView>
    );
  }

  // Experience Level Step
  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text variant="headlineMedium" style={styles.formTitle}>
          🏋️ Your Fitness Experience
        </Text>
        <Text variant="bodyMedium" style={styles.formSubtitle}>
          This helps us recommend the right starting point
        </Text>

        <View style={styles.experienceSection}>
          <SegmentedButtons
            value={experienceLevel}
            onValueChange={(value) => setExperienceLevel(value as any)}
            buttons={[
              {
                value: 'beginner',
                label: 'Beginner',
                icon: '🌱',
              },
              {
                value: 'moderate',
                label: 'Moderate',
                icon: '💪',
              },
              {
                value: 'advanced',
                label: 'Advanced',
                icon: '🔥',
              },
            ]}
            style={styles.segmentedButtons}
          />

          <View style={styles.experienceDescriptions}>
            {experienceLevel === 'beginner' && (
              <View style={styles.descriptionCard}>
                <Text variant="titleSmall" style={styles.descriptionTitle}>
                  🌱 Beginner
                </Text>
                <Text variant="bodySmall" style={styles.descriptionText}>
                  • New to strength training{'\n'}
                  • Just starting your fitness journey{'\n'}
                  • Want to build a solid foundation
                </Text>
              </View>
            )}
            {experienceLevel === 'moderate' && (
              <View style={styles.descriptionCard}>
                <Text variant="titleSmall" style={styles.descriptionTitle}>
                  💪 Moderate
                </Text>
                <Text variant="bodySmall" style={styles.descriptionText}>
                  • Some strength training experience{'\n'}
                  • Familiar with basic exercises{'\n'}
                  • Ready to increase intensity
                </Text>
              </View>
            )}
            {experienceLevel === 'advanced' && (
              <View style={styles.descriptionCard}>
                <Text variant="titleSmall" style={styles.descriptionTitle}>
                  🔥 Advanced
                </Text>
                <Text variant="bodySmall" style={styles.descriptionText}>
                  • Experienced lifter{'\n'}
                  • Know your max lifts{'\n'}
                  • Looking for structured progression
                </Text>
              </View>
            )}
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleComplete}
          style={styles.completeButton}
          contentStyle={styles.buttonContent}
        >
          Complete Setup
        </Button>

        <Button
          mode="text"
          onPress={() => setStep('profile')}
          style={styles.backButton}
        >
          Back
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 72,
    marginBottom: 16,
  },
  appName: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2563EB',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  description: {
    textAlign: 'center',
    color: '#6B7280',
    paddingHorizontal: 32,
    lineHeight: 24,
    marginBottom: 32,
  },
  features: {
    alignItems: 'flex-start',
    gap: 8,
  },
  feature: {
    color: '#4B5563',
  },
  footer: {
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  button: {
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  credit: {
    textAlign: 'center',
    color: '#9CA3AF',
  },
  formContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
  },
  formTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  nextButton: {
    marginTop: 24,
  },
  completeButton: {
    marginTop: 32,
  },
  backButton: {
    marginTop: 12,
  },
  experienceSection: {
    marginBottom: 32,
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  experienceDescriptions: {
    minHeight: 150,
  },
  descriptionCard: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  descriptionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2563EB',
  },
  descriptionText: {
    color: '#4B5563',
    lineHeight: 20,
  },
});
