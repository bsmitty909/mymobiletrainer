/**
 * Welcome Screen
 * 
 * First screen new users see. Introduces the app and begins onboarding.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAppDispatch } from '../../store/store';
import { createUser, completeOnboarding } from '../../store/slices/userSlice';

export default function WelcomeScreen() {
  const dispatch = useAppDispatch();

  const handleGetStarted = () => {
    // For now, create a test user and mark onboarded
    // In full implementation, this would navigate through profile setup
    dispatch(createUser({
      name: 'Test User',
      experienceLevel: 'beginner',
    }));
    dispatch(completeOnboarding());
  };

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  footer: {
    paddingBottom: 32,
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
});
