/**
 * Active Workout Screen
 * 
 * Main screen for logging sets during an active workout session.
 * Features:
 * - Exercise display with video link
 * - Set-by-set logging interface
 * - Weight and rep input
 * - Rest timer integration
 * - Progress indicator
 * - Previous performance reference
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, TextInput, Chip } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logSet, completeExercise, completeWorkout } from '../../store/slices/workoutSlice';
import { startRestTimer, nextExercise, showVideoPlayer, hideVideoPlayer } from '../../store/slices/uiSlice';
import RestTimer from '../../components/workout/RestTimer';
import VideoPlayerModal from '../../components/workout/VideoPlayerModal';
import { getExerciseById } from '../../constants/exercises';

export default function ActiveWorkoutScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const activeSession = useAppSelector((state) => state.workout.activeSession);
  const currentExerciseIndex = useAppSelector(
    (state) => state.ui.activeWorkout.currentExerciseIndex
  );
  const videoPlayerState = useAppSelector((state) => state.ui.modals.videoPlayer);

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  if (!activeSession) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text variant="headlineMedium">No active workout</Text>
          <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            Back to Dashboard
          </Button>
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
    const targetReps = { min: 10, max: 12 }; // TODO: Get from template

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
    
    // Start rest timer
    dispatch(startRestTimer(90));

    // Calculate next set suggestion with inverse weight/rep relationship
    // Rule: +5 lbs = -1 rep, -5 lbs = +1 rep
    let nextWeight = loggedWeight;
    let nextReps = loggedReps;

    if (loggedReps > targetReps.max) {
      // User exceeded target - increase weight, decrease reps
      nextWeight = loggedWeight + 5;
      nextReps = Math.max(loggedReps - 1, 1); // At least 1 rep
    } else if (loggedReps < targetReps.min) {
      // User failed minimum - decrease weight, increase reps
      nextWeight = Math.max(loggedWeight - 5, 0);
      nextReps = loggedReps + 1;
    }
    
    // Set weight and reps for next set
    setWeight(nextWeight.toString());
    setReps(nextReps.toString());
  };

  const handleCompleteExercise = () => {
    dispatch(completeExercise(currentExerciseIndex));
    
    if (currentExerciseIndex < totalExercises - 1) {
      // Move to next exercise
      dispatch(nextExercise());
      setWeight('');
      setReps('');
    } else {
      // Last exercise completed - finish workout and navigate to summary
      dispatch(completeWorkout());
      navigation.navigate('WorkoutSummary');
    }
  };

  const adjustWeight = (amount: number) => {
    const currentWeight = parseFloat(weight) || currentExerciseLog?.suggestedWeight || 0;
    setWeight((currentWeight + amount).toString());
  };

  const quickSelectReps = (repCount: number) => {
    setReps(repCount.toString());
  };

  const completionPercentage = ((currentExerciseIndex + 1) / totalExercises) * 100;
  const previousSet = currentExerciseLog?.sets[currentExerciseLog.sets.length - 1];

  return (
    <View style={styles.container}>
      <RestTimer onComplete={() => {}} />

      <ScrollView style={styles.scrollView}>
        {/* Header with progress */}
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            {activeSession.weekNumber > 0 ? `Week ${activeSession.weekNumber}` : 'Max Week'} - Day {activeSession.dayNumber}
          </Text>
          <Text variant="bodyMedium" style={styles.exerciseCount}>
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
          </View>
        </View>

        {/* Exercise info */}
        <Card style={styles.exerciseCard}>
          <Card.Content>
            <View style={styles.exerciseNameHeaderRow}>
              <Text variant="headlineSmall" style={styles.exerciseName}>
                {exercise?.name || 'Unknown Exercise'}
              </Text>
              <Button mode="text" onPress={() => {}}>
                📹 Video
              </Button>
            </View>

            <Text variant="bodyMedium" style={styles.currentMax}>
              Suggested Weight: {currentExerciseLog?.suggestedWeight} lbs
            </Text>

            {previousSet && (
              <Text variant="bodySmall" style={styles.previous}>
                Previous: {previousSet.reps} reps @ {previousSet.weight} lbs
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Set logging */}
        <Card style={styles.loggingCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.setTitle}>
              Set {currentSetNumber}
            </Text>

            {/* Completed sets */}
            {currentExerciseLog?.sets.map((set, idx) => (
              <View key={idx} style={styles.completedSet}>
                <Text variant="bodyMedium">
                  ✓ Set {set.setNumber}: {set.weight} lbs × {set.reps} reps
                </Text>
              </View>
            ))}

            {/* Weight input */}
            <View style={styles.inputSection}>
              <Text variant="titleSmall" style={styles.inputLabel}>
                Weight (lbs)
              </Text>
              <View style={styles.weightControl}>
                <Button mode="outlined" onPress={() => adjustWeight(-5)} style={styles.adjustButton}>
                  -5
                </Button>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder={currentExerciseLog?.suggestedWeight.toString()}
                  style={styles.input}
                  mode="outlined"
                />
                <Button mode="outlined" onPress={() => adjustWeight(5)} style={styles.adjustButton}>
                  +5
                </Button>
              </View>
            </View>

            {/* Reps input */}
            <View style={styles.inputSection}>
              <Text variant="titleSmall" style={styles.inputLabel}>
                Reps Completed
              </Text>
              <View style={styles.repsControl}>
                {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15].map((num) => (
                  <Chip
                    key={num}
                    selected={reps === num.toString()}
                    onPress={() => quickSelectReps(num)}
                    style={styles.repChip}
                  >
                    {num}
                  </Chip>
                ))}
              </View>
              <TextInput
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
                placeholder="Or enter manually"
                style={styles.input}
                mode="outlined"
              />
            </View>

            {/* Actions */}
            <Button
              mode="contained"
              onPress={handleLogSet}
              disabled={!weight || !reps}
              style={styles.logButton}
              contentStyle={styles.logButtonContent}
            >
              LOG SET & START REST TIMER
            </Button>

            <Button
              mode="outlined"
              onPress={handleCompleteExercise}
              style={styles.completeButton}
            >
              Complete Exercise → Next
            </Button>
          </Card.Content>
        </Card>

        {/* Form tips */}
        {exercise?.formTips && (
          <Card style={styles.tipsCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.tipsTitle}>
                💡 Form Tips
              </Text>
              {exercise.formTips.map((tip, idx) => (
                <Text key={idx} variant="bodySmall" style={styles.tip}>
                  • {tip}
                </Text>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2563EB',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  exerciseCount: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  exerciseCard: {
    margin: 16,
  },
  exerciseNameHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontWeight: 'bold',
    flex: 1,
  },
  currentMax: {
    color: '#2563EB',
    marginTop: 8,
  },
  previous: {
    color: '#6B7280',
    marginTop: 4,
  },
  loggingCard: {
    margin: 16,
    marginTop: 8,
  },
  setTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  completedSet: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  inputSection: {
    marginTop: 16,
  },
  inputLabel: {
    marginBottom: 8,
    color: '#374151',
  },
  weightControl: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  adjustButton: {
    minWidth: 60,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  repsControl: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  repChip: {
    marginRight: 0,
  },
  logButton: {
    marginTop: 24,
  },
  logButtonContent: {
    paddingVertical: 8,
  },
  completeButton: {
    marginTop: 12,
  },
  tipsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  tipsTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  tip: {
    color: '#6B7280',
    marginBottom: 4,
  },
});
