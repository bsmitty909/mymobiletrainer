/**
 * Welcome Screen - Nike Style
 *
 * Bold onboarding with dramatic typography and generous spacing
 */

import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Text, Button, SegmentedButtons } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch } from '../../store/store';
import { createUser, completeOnboarding } from '../../store/slices/userSlice';
import Input from '../../components/common/Input';
import GameButton from '../../components/common/GameButton';
import StorageService from '../../services/StorageService';
import { spacing, typography, borderRadius, shadows, colors as designColors } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

type OnboardingStep = 'welcome' | 'profile' | 'goals' | 'experience';
type FitnessGoal = 'lose-weight' | 'tone-up' | 'gain-muscle';

export default function WelcomeScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('tone-up');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'moderate' | 'advanced'>('beginner');

  const ageInputRef = useRef<TextInput>(null);
  const weightInputRef = useRef<TextInput>(null);

  const handleGetStarted = () => {
    setStep('profile');
  };

  const handleProfileNext = () => {
    if (name && age && weight) {
      setStep('goals');
    }
  };

  const handleGoalsNext = () => {
    setStep('experience');
  };

  const handleComplete = async () => {
    dispatch(createUser({
      name,
      experienceLevel,
    }));

    const profileData = {
      name,
      age: parseInt(age, 10),
      weight: parseFloat(weight),
      experienceLevel,
      createdAt: Date.now(),
    };

    await StorageService.saveUserProfile(profileData);
    dispatch(completeOnboarding());
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.comfortable,
    },
    logoContainer: {
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 6,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.comfortable,
      backgroundColor: colors.surface,
      ...shadows.xl,
    },
    title: {
      ...typography.heroDisplay,
      textAlign: 'center',
      color: colors.primary,
      marginBottom: spacing.tight,
    },
    appName: {
      ...typography.h1,
      textAlign: 'center',
      marginBottom: spacing.tight,
      color: colors.text,
    },
    subtitle: {
      ...typography.h3,
      textAlign: 'center',
      color: colors.textSecondary,
      marginBottom: spacing.base,
    },
    description: {
      ...typography.bodyLarge,
      textAlign: 'center',
      color: colors.textSecondary,
      paddingHorizontal: spacing.comfortable,
      lineHeight: 28,
      marginBottom: spacing.comfortable,
    },
    features: {
      alignItems: 'flex-start',
      gap: spacing.close,
    },
    feature: {
      ...typography.body,
      color: colors.text,
    },
    footer: {
      paddingBottom: spacing.huge,
      paddingHorizontal: spacing.base,
    },
    button: {
      marginBottom: spacing.close,
    },
    buttonContent: {
      paddingVertical: spacing.tight,
    },
    credit: {
      ...typography.body,
      textAlign: 'center',
      color: colors.textSecondary,
    },
    formContainer: {
      flex: 1,
      padding: spacing.base,
      paddingTop: spacing.massive,
    },
    formTitle: {
      ...typography.display,
      marginBottom: spacing.tight,
      textAlign: 'center',
      color: colors.text,
    },
    formSubtitle: {
      ...typography.bodyLarge,
      textAlign: 'center',
      color: colors.textSecondary,
      marginBottom: spacing.generous,
    },
    input: {
      marginBottom: spacing.close,
    },
    nextButton: {
      marginTop: spacing.comfortable,
    },
    completeButton: {
      marginTop: spacing.generous,
    },
    backButton: {
      marginTop: spacing.close,
    },
    experienceSection: {
      marginBottom: spacing.comfortable,
    },
    segmentedButtons: {
      marginBottom: spacing.base,
    },
    experienceDescriptions: {
      minHeight: 180,
    },
    descriptionCard: {
      backgroundColor: colors.surface,
      padding: spacing.comfortable,
      borderRadius: borderRadius.xl,
      borderLeftWidth: 6,
      borderLeftColor: colors.primary,
      ...shadows.md,
    },
    descriptionTitle: {
      ...typography.h2,
      marginBottom: spacing.close,
      color: colors.primary,
    },
    descriptionText: {
      ...typography.body,
      color: colors.text,
      lineHeight: 24,
    },
  });

  // Welcome Step
  if (step === 'welcome') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text variant="displayLarge" style={styles.title}>
            30 MINUTE
          </Text>
          <Text variant="headlineLarge" style={styles.appName}>
            Personal Body Trainer
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Your Personal Strength Training Companion
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            Smart, adaptive workouts based on Lance McCullough's proven "30 Minute Body" program
          </Text>
          
          <View style={styles.features}>
            <Text variant="bodyMedium" style={styles.feature}>• Formula-driven weight calculations</Text>
            <Text variant="bodyMedium" style={styles.feature}>• Progressive overload tracking</Text>
            <Text variant="bodyMedium" style={styles.feature}>• 5-week structured program</Text>
            <Text variant="bodyMedium" style={styles.feature}>• Exercise video demonstrations</Text>
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
            Let's Get to Know You
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

  // Fitness Goals Step
  if (step === 'goals') {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text variant="headlineMedium" style={styles.formTitle}>
            What's Your Primary Goal?
          </Text>
          <Text variant="bodyMedium" style={styles.formSubtitle}>
            We'll tailor your experience based on your fitness objective
          </Text>

          <View style={styles.experienceSection}>
            <SegmentedButtons
              value={fitnessGoal}
              onValueChange={(value) => setFitnessGoal(value as FitnessGoal)}
              buttons={[
                {
                  value: 'lose-weight',
                  label: 'Lose Weight',
                },
                {
                  value: 'tone-up',
                  label: 'Tone Up',
                },
                {
                  value: 'gain-muscle',
                  label: 'Gain Muscle',
                },
              ]}
              style={styles.segmentedButtons}
            />

            <View style={styles.experienceDescriptions}>
              {fitnessGoal === 'lose-weight' && (
                <View style={styles.descriptionCard}>
                  <Text variant="titleSmall" style={styles.descriptionTitle}>
                    Lose Weight
                  </Text>
                  <Text variant="bodySmall" style={styles.descriptionText}>
                    • Build lean muscle to boost metabolism{'\n'}
                    • Combine strength training with cardio{'\n'}
                    • Focus on compound movements{'\n'}
                    • Track progress with body measurements
                  </Text>
                </View>
              )}
              {fitnessGoal === 'tone-up' && (
                <View style={styles.descriptionCard}>
                  <Text variant="titleSmall" style={styles.descriptionTitle}>
                    ✨ Tone Up
                  </Text>
                  <Text variant="bodySmall" style={styles.descriptionText}>
                    • Define and sculpt your muscles{'\n'}
                    • Moderate weights with higher reps{'\n'}
                    • Balanced full-body approach{'\n'}
                    • Improve overall body composition
                  </Text>
                </View>
              )}
              {fitnessGoal === 'gain-muscle' && (
                <View style={styles.descriptionCard}>
                  <Text variant="titleSmall" style={styles.descriptionTitle}>
                     Gain Muscle
                  </Text>
                  <Text variant="bodySmall" style={styles.descriptionText}>
                    • Progressive overload for muscle growth{'\n'}
                    • Heavy weights with controlled reps{'\n'}
                    • Track strength gains and volume{'\n'}
                    • Maximize muscle hypertrophy
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleGoalsNext}
            style={styles.nextButton}
            contentStyle={styles.buttonContent}
          >
            Continue
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

  // Experience Level Step
  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text variant="headlineMedium" style={styles.formTitle}>
          Your Fitness Experience
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
                
              },
              {
                value: 'moderate',
                label: 'Moderate',
                icon: '',
              },
              {
                value: 'advanced',
                label: 'Advanced',
                
              },
            ]}
            style={styles.segmentedButtons}
          />

          <View style={styles.experienceDescriptions}>
            {experienceLevel === 'beginner' && (
              <View style={styles.descriptionCard}>
                <Text variant="titleSmall" style={styles.descriptionTitle}>
                  Beginner
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
                   Moderate
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
                  Advanced
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
