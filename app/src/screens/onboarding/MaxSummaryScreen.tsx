/**
 * Max Summary Screen
 * 
 * Displays the results of the Max Determination Week, including all established
 * 4RMs, strength score, and percentile ranking. Provides transition to start training.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Divider, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { completeMaxTesting } from '../../store/slices/progressSlice';
import { completeOnboarding } from '../../store/slices/userSlice';
import { MaxDeterminationService } from '../../services/MaxDeterminationService';
import useThemeColors from '../../utils/useThemeColors';

type NavigationProp = NativeStackNavigationProp<any>;

export default function MaxSummaryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  
  const maxTestingProgress = useAppSelector(state => state.progress.maxTestingProgress);
  const currentUser = useAppSelector(state => state.user.currentUser);
  const bodyWeight = 180; // TODO: Get from user profile

  const completedExercises = maxTestingProgress.exercises.filter(e => e.completed);
  
  const maxLiftsRecord: Record<string, number> = {};
  completedExercises.forEach(ex => {
    if (ex.determined4RM) {
      maxLiftsRecord[ex.exerciseId] = ex.determined4RM;
    }
  });

  const strengthScore = MaxDeterminationService.calculateStrengthScore(
    maxLiftsRecord,
    bodyWeight
  );

  const handleStartTraining = () => {
    const maxLifts = MaxDeterminationService.convertToMaxLifts(
      currentUser?.id || 'user-1',
      maxTestingProgress.exercises
    );

    dispatch(completeMaxTesting(maxLifts));
    dispatch(completeOnboarding());
    navigation.navigate('MainTabs');
  };

  const handleRetakeTests = () => {
    navigation.navigate('MaxDeterminationIntro');
  };

  const getStrengthLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return '#3B82F6';
      case 'intermediate':
        return '#10B981';
      case 'advanced':
        return '#8B5CF6';
      default:
        return colors.primary;
    }
  };

  const getStrengthLevelEmoji = (level: string) => {
    switch (level) {
      case 'beginner':
        return '🌱';
      case 'intermediate':
        return '💪';
      case 'advanced':
        return '🏆';
      default:
        return '💪';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 24,
      paddingBottom: 40,
    },
    celebrationSection: {
      alignItems: 'center',
      marginBottom: 32,
      paddingTop: 20,
    },
    celebrationEmoji: {
      fontSize: 80,
      marginBottom: 16,
    },
    title: {
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
      color: colors.text,
    },
    subtitle: {
      textAlign: 'center',
      color: colors.textSecondary,
      lineHeight: 22,
    },
    strengthScoreCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      alignItems: 'center',
      borderWidth: 3,
      borderColor: getStrengthLevelColor(strengthScore.level),
    },
    strengthEmoji: {
      fontSize: 48,
      marginBottom: 12,
    },
    strengthLevel: {
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
      color: getStrengthLevelColor(strengthScore.level),
    },
    strengthScore: {
      fontWeight: 'bold',
      marginBottom: 4,
      color: colors.text,
    },
    percentileText: {
      color: colors.textSecondary,
    },
    percentileValue: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: 12,
      color: colors.text,
    },
    maxLiftCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    maxLiftIcon: {
      fontSize: 32,
      marginRight: 16,
    },
    maxLiftInfo: {
      flex: 1,
    },
    maxLiftName: {
      fontWeight: '600',
      marginBottom: 4,
      color: colors.text,
    },
    maxLiftValue: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    infoTitle: {
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.text,
    },
    infoText: {
      color: colors.text,
      lineHeight: 20,
    },
    buttonContainer: {
      gap: 12,
      marginTop: 8,
    },
    buttonContent: {
      paddingVertical: 8,
    },
    divider: {
      marginVertical: 24,
      backgroundColor: colors.border,
    },
    encouragementCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center',
    },
    encouragementText: {
      textAlign: 'center',
      color: colors.text,
      lineHeight: 24,
      fontSize: 16,
    },
  });

  const exerciseIcons: Record<string, string> = {
    'bench-press': '🏋️',
    'lat-pulldown': '💪',
    'leg-press': '🦵',
    'shoulder-press': '🤸',
    'bicep-cable-curl': '💪',
  };

  const getEncouragement = () => {
    if (strengthScore.level === 'advanced') {
      return "You're incredibly strong! Your dedication to training shows. Let's take you even further!";
    } else if (strengthScore.level === 'intermediate') {
      return "Great foundation! You're ready to make serious gains with our structured program.";
    } else {
      return "Perfect starting point! This program is designed to help you build strength systematically and safely.";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.celebrationSection}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text variant="headlineLarge" style={styles.title}>
            Max Testing Complete!
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            You've established your baseline strength levels
          </Text>
        </View>

        <View style={styles.strengthScoreCard}>
          <Text style={styles.strengthEmoji}>
            {getStrengthLevelEmoji(strengthScore.level)}
          </Text>
          <Text variant="headlineSmall" style={styles.strengthLevel}>
            {strengthScore.level}
          </Text>
          <Text variant="displaySmall" style={styles.strengthScore}>
            Score: {strengthScore.total}
          </Text>
          <Text variant="bodyMedium" style={styles.percentileText}>
            Stronger than{' '}
            <Text style={styles.percentileValue}>{strengthScore.percentile}%</Text>
            {' '}of users
          </Text>
        </View>

        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementText}>
            {getEncouragement()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Your Established Maxes
          </Text>
          {completedExercises.map((exercise) => (
            <View key={exercise.exerciseId} style={styles.maxLiftCard}>
              <Text style={styles.maxLiftIcon}>
                {exerciseIcons[exercise.exerciseId] || '🏋️'}
              </Text>
              <View style={styles.maxLiftInfo}>
                <Text variant="bodyLarge" style={styles.maxLiftName}>
                  {exercise.exerciseName}
                </Text>
                <Text variant="titleMedium" style={styles.maxLiftValue}>
                  {exercise.determined4RM} lbs
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text variant="titleSmall" style={styles.infoTitle}>
            📈 What Happens Next?
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            These maxes will be used to calculate your workout weights for the entire 48-week program. Each workout is precisely tailored to your strength level using proven formulas for optimal results.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text variant="titleSmall" style={styles.infoTitle}>
            💡 Pro Tip
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            As you progress through the program, you'll regularly test and update these maxes. This ensures your workouts stay challenging and effective as you get stronger.
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleStartTraining}
            contentStyle={styles.buttonContent}
            icon="rocket-launch"
          >
            🚀 Start Week 1 Training
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleRetakeTests}
            contentStyle={styles.buttonContent}
          >
            Retake Max Tests
          </Button>
        </View>

        <Text variant="bodySmall" style={[styles.subtitle, { marginTop: 16 }]}>
          You can view and update your maxes anytime from your profile
        </Text>
      </ScrollView>
    </View>
  );
}
