/**
 * Max Testing Screen
 * 
 * Progressive weight testing interface for determining 4RM (one-rep max)
 * for each exercise. Users progressively increase weight until they reach failure.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, IconButton, ProgressBar, Chip, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  addMaxAttempt,
  completeExerciseMaxTest,
  moveToNextExercise,
  moveToPreviousExercise,
} from '../../store/slices/progressSlice';
import { MaxDeterminationService, MaxAttempt } from '../../services/MaxDeterminationService';
import useThemeColors from '../../utils/useThemeColors';

type NavigationProp = NativeStackNavigationProp<any>;

export default function MaxTestingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  
  const maxTestingProgress = useAppSelector(state => state.progress.maxTestingProgress);
  const currentExercise = maxTestingProgress.exercises[maxTestingProgress.currentExerciseIndex];
  
  const [currentWeight, setCurrentWeight] = useState(45);
  const [selectedReps, setSelectedReps] = useState<number | null>(null);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    if (currentExercise && currentExercise.attempts.length > 0) {
      const lastAttempt = currentExercise.attempts[currentExercise.attempts.length - 1];
      if (lastAttempt.success) {
        const suggested = MaxDeterminationService.suggestNextWeight(lastAttempt);
        setCurrentWeight(suggested);
      }
    }
  }, [currentExercise?.attempts.length]);

  if (!currentExercise) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
          <Text variant="titleLarge" style={{ color: colors.text }}>
            No exercises to test
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  const adjustWeight = (amount: number) => {
    setCurrentWeight(Math.max(45, currentWeight + amount));
    setSelectedReps(null);
  };

  const handleSuccess = () => {
    if (selectedReps === null) return;

    const attempt: MaxAttempt = {
      weight: currentWeight,
      reps: selectedReps,
      timestamp: Date.now(),
      success: true,
    };

    dispatch(addMaxAttempt({
      exerciseId: currentExercise.exerciseId,
      attempt,
    }));

    setSelectedReps(null);
  };

  const handleFailure = () => {
    const determined4RM = MaxDeterminationService.determine4RMFromAttempts(
      currentExercise.attempts
    );

    if (determined4RM) {
      dispatch(completeExerciseMaxTest({
        exerciseId: currentExercise.exerciseId,
        determined4RM,
      }));

      // Move to next exercise or summary
      if (maxTestingProgress.currentExerciseIndex < maxTestingProgress.exercises.length - 1) {
        dispatch(moveToNextExercise());
        setCurrentWeight(45);
        setSelectedReps(null);
      } else {
        navigation.navigate('MaxSummary');
      }
    }
  };

  const handleSkipExercise = () => {
    // Use default max based on body weight
    const defaultMax = 135; // Conservative default
    dispatch(completeExerciseMaxTest({
      exerciseId: currentExercise.exerciseId,
      determined4RM: defaultMax,
    }));

    if (maxTestingProgress.currentExerciseIndex < maxTestingProgress.exercises.length - 1) {
      dispatch(moveToNextExercise());
      setCurrentWeight(45);
      setSelectedReps(null);
    } else {
      navigation.navigate('MaxSummary');
    }
  };

  const completedCount = maxTestingProgress.exercises.filter(e => e.completed).length;
  const totalCount = maxTestingProgress.exercises.length;
  const progress = completedCount / totalCount;

  const estimated4RM = selectedReps
    ? MaxDeterminationService.calculate4RM(currentWeight, selectedReps)
    : null;

  const tips = MaxDeterminationService.getExerciseTips(currentExercise.exerciseId);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    progressSection: {
      marginBottom: 20,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressText: {
      color: colors.textSecondary,
    },
    progressValue: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    exerciseHeader: {
      alignItems: 'center',
      marginBottom: 24,
      padding: 20,
      backgroundColor: colors.surface,
      borderRadius: 16,
    },
    exerciseIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    exerciseName: {
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 4,
      color: colors.text,
    },
    exerciseSubtext: {
      textAlign: 'center',
      color: colors.textSecondary,
    },
    weightSelector: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    weightLabel: {
      textAlign: 'center',
      marginBottom: 8,
      color: colors.textSecondary,
    },
    weightDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    weightValue: {
      fontWeight: 'bold',
      marginHorizontal: 24,
      color: colors.text,
    },
    weightButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
    },
    weightButton: {
      flex: 1,
      maxWidth: 100,
    },
    repSelector: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    repLabel: {
      textAlign: 'center',
      marginBottom: 12,
      color: colors.text,
    },
    repButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    repButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    repButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    repButtonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    repButtonTextSelected: {
      color: '#FFFFFF',
    },
    estimated4RM: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    estimated4RMLabel: {
      color: colors.textSecondary,
      marginBottom: 4,
    },
    estimated4RMValue: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    actionButtons: {
      gap: 12,
      marginBottom: 20,
    },
    successButton: {
      backgroundColor: colors.success,
    },
    failureButton: {
      backgroundColor: colors.error,
    },
    buttonContent: {
      paddingVertical: 8,
    },
    attemptsSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: 12,
      color: colors.text,
    },
    attemptItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    attemptIcon: {
      marginRight: 12,
    },
    attemptText: {
      flex: 1,
      color: colors.text,
    },
    attemptEstimate: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    tipsSection: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    tipsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    tipsTitle: {
      fontWeight: 'bold',
      color: colors.text,
    },
    tipItem: {
      flexDirection: 'row',
      marginBottom: 6,
    },
    tipText: {
      flex: 1,
      color: colors.text,
      marginLeft: 8,
      lineHeight: 20,
    },
    navigationButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    navButton: {
      flex: 1,
    },
    divider: {
      marginVertical: 20,
      backgroundColor: colors.border,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text variant="bodyMedium" style={styles.progressText}>
              Progress
            </Text>
            <Text variant="bodyMedium" style={styles.progressValue}>
              {completedCount} / {totalCount} exercises
            </Text>
          </View>
          <ProgressBar progress={progress} color={colors.primary} />
        </View>

        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseIcon}>🏋️</Text>
          <Text variant="headlineMedium" style={styles.exerciseName}>
            {currentExercise.exerciseName}
          </Text>
          <Text variant="bodySmall" style={styles.exerciseSubtext}>
            Find your one-rep max
          </Text>
        </View>

        <View style={styles.weightSelector}>
          <Text variant="bodyMedium" style={styles.weightLabel}>
            Current Weight
          </Text>
          <View style={styles.weightDisplay}>
            <IconButton
              icon="minus"
              mode="contained"
              size={24}
              onPress={() => adjustWeight(-10)}
            />
            <Text variant="displayMedium" style={styles.weightValue}>
              {currentWeight} lbs
            </Text>
            <IconButton
              icon="plus"
              mode="contained"
              size={24}
              onPress={() => adjustWeight(10)}
            />
          </View>
          <View style={styles.weightButtons}>
            <Button
              mode="outlined"
              onPress={() => adjustWeight(-25)}
              style={styles.weightButton}
            >
              -25
            </Button>
            <Button
              mode="outlined"
              onPress={() => adjustWeight(-5)}
              style={styles.weightButton}
            >
              -5
            </Button>
            <Button
              mode="outlined"
              onPress={() => adjustWeight(5)}
              style={styles.weightButton}
            >
              +5
            </Button>
            <Button
              mode="outlined"
              onPress={() => adjustWeight(25)}
              style={styles.weightButton}
            >
              +25
            </Button>
          </View>
        </View>

        <View style={styles.repSelector}>
          <Text variant="titleMedium" style={styles.repLabel}>
            How many clean reps did you complete?
          </Text>
          <View style={styles.repButtons}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((reps) => (
              <TouchableOpacity
                key={reps}
                style={[
                  styles.repButton,
                  selectedReps === reps && styles.repButtonSelected,
                ]}
                onPress={() => setSelectedReps(reps)}
              >
                <Text
                  style={[
                    styles.repButtonText,
                    selectedReps === reps && styles.repButtonTextSelected,
                  ]}
                >
                  {reps}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {estimated4RM && (
          <View style={styles.estimated4RM}>
            <Text variant="bodySmall" style={styles.estimated4RMLabel}>
              Estimated 4RM
            </Text>
            <Text variant="headlineMedium" style={styles.estimated4RMValue}>
              {estimated4RM} lbs
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleSuccess}
            disabled={selectedReps === null}
            style={styles.successButton}
            contentStyle={styles.buttonContent}
            icon="check"
          >
            ✅ Success - Add More Weight
          </Button>

          <Button
            mode="contained"
            onPress={handleFailure}
            disabled={currentExercise.attempts.length === 0}
            style={styles.failureButton}
            contentStyle={styles.buttonContent}
            icon="close"
          >
            ❌ Failed - Mark as Max
          </Button>
        </View>

        {currentExercise.attempts.length > 0 && (
          <View style={styles.attemptsSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Previous Attempts
            </Text>
            {currentExercise.attempts.slice().reverse().map((attempt, index) => {
              const est4RM = MaxDeterminationService.calculate4RM(attempt.weight, attempt.reps);
              return (
                <View key={index} style={styles.attemptItem}>
                  <Text style={styles.attemptIcon}>✅</Text>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" style={styles.attemptText}>
                      {attempt.weight} lbs × {attempt.reps} reps
                    </Text>
                    <Text variant="bodySmall" style={styles.attemptEstimate}>
                      Est. 4RM: {est4RM} lbs
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.tipsSection}>
          <TouchableOpacity
            style={styles.tipsHeader}
            onPress={() => setShowTips(!showTips)}
          >
            <Text variant="titleSmall" style={styles.tipsTitle}>
              💡 Form Tips
            </Text>
            <IconButton
              icon={showTips ? 'chevron-up' : 'chevron-down'}
              size={20}
            />
          </TouchableOpacity>
          {showTips && (
            <>
              {tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipText}>• {tip}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.navigationButtons}>
          {maxTestingProgress.currentExerciseIndex > 0 && (
            <Button
              mode="outlined"
              onPress={() => dispatch(moveToPreviousExercise())}
              style={styles.navButton}
              icon="chevron-left"
            >
              Previous
            </Button>
          )}
          <Button
            mode="text"
            onPress={handleSkipExercise}
            style={styles.navButton}
          >
            Skip Exercise
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
