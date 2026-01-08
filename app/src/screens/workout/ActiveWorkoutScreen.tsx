/**
 * Active Workout Screen
 *
 * Main screen for logging sets during an active workout session.
 * Features:
 * - Exercise display with detailed instructions
 * - Set-by-set logging interface
 * - Large game-styled buttons and inputs
 * - Progress indicator
 * - Previous performance reference
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logSet, completeExercise, completeWorkout } from '../../store/slices/workoutSlice';
import { startRestTimer, nextExercise } from '../../store/slices/uiSlice';
import RestTimer from '../../components/workout/RestTimer';
import GameButton from '../../components/common/GameButton';
import GameInput from '../../components/common/GameInput';
import ExerciseInstructionCard from '../../components/workout/ExerciseInstructionCard';
import { getExerciseById, getExerciseInstructions } from '../../constants/exercises';
import useThemeColors from '../../utils/useThemeColors';

export default function ActiveWorkoutScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const activeSession = useAppSelector((state) => state.workout.activeSession);
  const currentExerciseIndex = useAppSelector(
    (state) => state.ui.activeWorkout.currentExerciseIndex
  );

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  if (!activeSession) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text variant="headlineMedium">No active workout</Text>
          <GameButton
            onPress={() => navigation.goBack()}
            size="medium"
            variant="secondary"
            style={{ marginTop: 16, width: 200 }}
          >
            Back to Dashboard
          </GameButton>
        </View>
      </View>
    );
  }

  const totalExercises = activeSession.exercises.length;
  const allExercisesComplete = currentExerciseIndex >= totalExercises;
  
  const currentExerciseLog = !allExercisesComplete ? activeSession.exercises[currentExerciseIndex] : null;
  const exercise = currentExerciseLog ? getExerciseById(currentExerciseLog.exerciseId) : null;
  const currentSetNumber = currentExerciseLog?.sets.length + 1 || 1;

  const handleLogSet = () => {
    if (!weight || !reps || !currentExerciseLog) return;

    const loggedWeight = parseFloat(weight);
    const loggedReps = parseInt(reps, 10);
    const targetReps = { min: 10, max: 12 };

    const setLog = {
      id: `set-${Date.now()}`,
      exerciseLogId: currentExerciseLog.id,
      setNumber: currentSetNumber,
      weight: loggedWeight,
      reps: loggedReps,
      targetReps,
      restSeconds: 90,
      completedAt: Date.now(),
    };

    dispatch(logSet({ exerciseIndex: currentExerciseIndex, setLog }));
    dispatch(startRestTimer(90));

    let nextWeight = loggedWeight;
    let nextReps = loggedReps;

    if (loggedReps > targetReps.max) {
      nextWeight = loggedWeight + 5;
      nextReps = Math.max(loggedReps - 1, 1);
    } else if (loggedReps < targetReps.min) {
      nextWeight = Math.max(loggedWeight - 5, 0);
      nextReps = loggedReps + 1;
    }
    
    setWeight(nextWeight.toString());
    setReps(nextReps.toString());
  };

  const handleCompleteExercise = () => {
    dispatch(completeExercise(currentExerciseIndex));
    
    if (currentExerciseIndex < totalExercises - 1) {
      dispatch(nextExercise());
      setWeight('');
      setReps('');
    } else {
      dispatch(completeWorkout());
      navigation.navigate('WorkoutSummary');
    }
  };

  const adjustWeight = (amount: number) => {
    const currentWeight = parseFloat(weight) || currentExerciseLog?.suggestedWeight || 0;
    setWeight((currentWeight + amount).toString());
  };

  const adjustReps = (amount: number) => {
    const currentReps = parseInt(reps, 10) || 0;
    setReps(Math.max(1, currentReps + amount).toString());
  };

  const quickSelectReps = (repCount: number) => {
    setReps(repCount.toString());
  };

  const completionPercentage = ((currentExerciseIndex + 1) / totalExercises) * 100;
  const previousSet = currentExerciseLog?.sets[currentExerciseLog.sets.length - 1];

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    scrollView: {
      flex: 1,
    },
    progressHeader: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 16,
      paddingTop: 50,
    },
    headerTitle: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 20,
    },
    exerciseCount: {
      color: 'rgba(255, 255, 255, 0.9)',
      marginTop: 4,
      fontSize: 16,
    },
    progressBar: {
      height: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 4,
      marginTop: 12,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.success,
      borderRadius: 4,
    },
    statsCard: {
      margin: 16,
      marginTop: 16,
      backgroundColor: colors.card,
      borderRadius: 16,
      elevation: 6,
    },
    statsContent: {
      padding: 20,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    statLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    statValue: {
      fontSize: 18,
      color: colors.primary,
      fontWeight: '900',
    },
    loggingCard: {
      margin: 16,
      marginTop: 8,
      backgroundColor: colors.card,
      borderRadius: 20,
      elevation: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    loggingContent: {
      padding: 24,
    },
    setTitle: {
      fontSize: 28,
      marginBottom: 24,
      fontWeight: '900',
      color: colors.primary,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    inputSection: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border + '40',
    },
    inputSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    inputSectionIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    inputSectionIconText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '700',
    },
    inputSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    repsControl: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border + '40',
    },
    repsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    repsLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    repsSubLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 12,
      fontWeight: '500',
    },
    repsChipsContainer: {
      marginBottom: 16,
    },
    repsChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
    },
    repChip: {
      minWidth: 56,
      height: 48,
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    selectedChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      elevation: 6,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      transform: [{ scale: 1.05 }],
    },
    repChipText: {
      fontWeight: '700',
      fontSize: 17,
    },
    manualInputDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 12,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border + '40',
    },
    dividerText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    buttonSection: {
      marginTop: 8,
      gap: 12,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <RestTimer onComplete={() => {}} />

      <ScrollView style={dynamicStyles.scrollView}>
        {/* Progress Header */}
        <View style={dynamicStyles.progressHeader}>
          <Text style={dynamicStyles.headerTitle}>
            {activeSession.weekNumber > 0 ? `Week ${activeSession.weekNumber}` : 'Max Week'} - Day {activeSession.dayNumber}
          </Text>
          <Text style={dynamicStyles.exerciseCount}>
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </Text>
          <View style={dynamicStyles.progressBar}>
            <View style={[dynamicStyles.progressFill, { width: `${completionPercentage}%` }]} />
          </View>
        </View>

        {/* Exercise Instruction Card */}
        {currentExerciseLog && getExerciseInstructions(currentExerciseLog.exerciseId) && (
          <ExerciseInstructionCard
            {...getExerciseInstructions(currentExerciseLog.exerciseId)!}
          />
        )}

        {/* Exercise Stats */}
        <Card style={dynamicStyles.statsCard}>
          <View style={dynamicStyles.statsContent}>
            <View style={dynamicStyles.statRow}>
              <Text style={dynamicStyles.statLabel}>Suggested Weight</Text>
              <Text style={dynamicStyles.statValue}>{currentExerciseLog?.suggestedWeight} lbs</Text>
            </View>
            {previousSet && (
              <View style={dynamicStyles.statRow}>
                <Text style={dynamicStyles.statLabel}>Previous Set</Text>
                <Text style={dynamicStyles.statValue}>
                  {previousSet.reps} reps @ {previousSet.weight} lbs
                </Text>
              </View>
            )}
            <View style={dynamicStyles.statRow}>
              <Text style={dynamicStyles.statLabel}>Sets Completed</Text>
              <Text style={dynamicStyles.statValue}>{currentExerciseLog?.sets.length || 0}</Text>
            </View>
          </View>
        </Card>

        {/* Set Logging */}
        <Card style={dynamicStyles.loggingCard}>
          <View style={dynamicStyles.loggingContent}>
            <Text style={dynamicStyles.setTitle}>
              SET {currentSetNumber}
            </Text>

            {/* Weight Input Section */}
            <View style={dynamicStyles.inputSection}>
              <View style={dynamicStyles.inputSectionHeader}>
                <View style={dynamicStyles.inputSectionIcon}>
                  <Text style={dynamicStyles.inputSectionIconText}>⚖️</Text>
                </View>
                <Text style={dynamicStyles.inputSectionTitle}>Weight</Text>
              </View>
              <GameInput
                value={weight}
                onChangeText={setWeight}
                placeholder={currentExerciseLog?.suggestedWeight.toString()}
                keyboardType="numeric"
                onIncrement={() => adjustWeight(5)}
                onDecrement={() => adjustWeight(-5)}
                incrementAmount={5}
                unit="lbs"
              />
            </View>

            {/* Reps Section */}
            <View style={dynamicStyles.repsControl}>
              <View style={dynamicStyles.repsHeader}>
                <View style={dynamicStyles.inputSectionIcon}>
                  <Text style={dynamicStyles.inputSectionIconText}>💪</Text>
                </View>
                <Text style={dynamicStyles.repsLabel}>Reps Completed</Text>
              </View>
              
              <Text style={dynamicStyles.repsSubLabel}>
                Quick select or enter manually below
              </Text>

              {/* Quick Select Chips */}
              <View style={dynamicStyles.repsChipsContainer}>
                <View style={dynamicStyles.repsChipsRow}>
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15].map((num) => (
                    <Chip
                      key={num}
                      selected={reps === num.toString()}
                      onPress={() => quickSelectReps(num)}
                      style={[
                        dynamicStyles.repChip,
                        reps === num.toString() && dynamicStyles.selectedChip
                      ]}
                      textStyle={[
                        dynamicStyles.repChipText,
                        { color: reps === num.toString() ? '#fff' : colors.text }
                      ]}
                    >
                      {num}
                    </Chip>
                  ))}
                </View>
              </View>

              {/* Divider */}
              <View style={dynamicStyles.manualInputDivider}>
                <View style={dynamicStyles.dividerLine} />
                <Text style={dynamicStyles.dividerText}>or enter manually</Text>
                <View style={dynamicStyles.dividerLine} />
              </View>

              {/* Manual Input */}
              <GameInput
                value={reps}
                onChangeText={setReps}
                placeholder="Enter reps"
                keyboardType="numeric"
                onIncrement={() => adjustReps(1)}
                onDecrement={() => adjustReps(-1)}
                incrementAmount={1}
                unit="reps"
              />
            </View>

            {/* Action Buttons */}
            <View style={dynamicStyles.buttonSection}>
              <GameButton
                onPress={handleLogSet}
                disabled={!weight || !reps}
                variant="success"
                icon="checkbox-marked-circle"
              >
                LOG SET & START REST
              </GameButton>

              <GameButton
                onPress={handleCompleteExercise}
                variant="primary"
                size="medium"
                icon="arrow-right-circle"
              >
                Complete Exercise
              </GameButton>
            </View>
          </View>
        </Card>

        {/* Form Tips */}
        {exercise?.formTips && (
          <Card style={[dynamicStyles.statsCard, { marginBottom: 32 }]}>
            <View style={dynamicStyles.statsContent}>
              <Text style={[dynamicStyles.setTitle, { fontSize: 18, textAlign: 'left' }]}>
                💡 Form Tips
              </Text>
              {exercise.formTips.map((tip, idx) => (
                <Text key={idx} style={[dynamicStyles.statLabel, { marginBottom: 8 }]}>
                  • {tip}
                </Text>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
});
