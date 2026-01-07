/**
 * Workout Dashboard Screen
 * 
 * Main workout screen showing current week/day and workout overview.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { startSession } from '../../store/slices/workoutSlice';

export default function WorkoutDashboardScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.currentUser);
  const currentWeek = user?.currentWeek || 1;
  const currentDay = user?.currentDay || 1;

  // Mock workout data - TODO: Replace with actual program data
  const mockWorkoutData = {
    exercises: [
      { exerciseId: 'bench-press', suggestedWeight: 215, sets: [1, 2, 3, 4], targetReps: { min: 1, max: 6 } },
      { exerciseId: 'lat-pulldown', suggestedWeight: 250, sets: [1, 2, 3, 4], targetReps: { min: 10, max: 12 } },
      { exerciseId: 'dumbbell-incline-press', suggestedWeight: 85, sets: [1, 2, 3], targetReps: { min: 10, max: 12 } },
      { exerciseId: 'machine-low-row', suggestedWeight: 200, sets: [1, 2, 3], targetReps: 'REP_OUT' },
      { exerciseId: 'dumbbell-chest-fly', suggestedWeight: 40, sets: [1, 2], targetReps: 'REP_OUT' },
    ],
  };

  const handleViewDetails = () => {
    navigation.navigate('WorkoutDetail', {
      weekNumber: currentWeek,
      dayNumber: currentDay,
      workoutData: mockWorkoutData,
    });
  };

  const handleStartWorkout = () => {
    // Create a sample workout session
    const mockSession = {
      id: `session-${Date.now()}`,
      userId: user?.id || 'test-user',
      weekNumber: currentWeek,
      dayNumber: currentDay,
      startedAt: Date.now(),
      status: 'not_started' as const,
      exercises: mockWorkoutData.exercises.map((ex, idx) => ({
        id: `ex-${Date.now()}-${idx}`,
        sessionId: `session-${Date.now()}`,
        exerciseId: ex.exerciseId,
        order: idx + 1,
        suggestedWeight: ex.suggestedWeight,
        sets: [],
      })),
    };

    // Dispatch to Redux
    dispatch(startSession(mockSession));
    
    // Navigate to active workout
    navigation.navigate('ActiveWorkout');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          MY MOBILE TRAINER
        </Text>
        <Text variant="titleMedium" style={styles.welcome}>
          Welcome back, {user?.name || 'User'}! 👋
        </Text>
      </View>

      <Card style={styles.workoutCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.cardLabel}>
            TODAY'S WORKOUT
          </Text>
          <Text variant="headlineMedium" style={styles.workoutTitle}>
            Week {currentWeek} - Day {currentDay}
          </Text>
          <Text variant="bodyLarge" style={styles.workoutSubtitle}>
            {currentDay === 1 ? 'Chest & Back' : currentDay === 2 ? 'Legs' : 'Shoulders & Arms'}
          </Text>
          
          <View style={styles.workoutMeta}>
            <Text variant="bodyMedium">🏋️ 5 Exercises</Text>
            <Text variant="bodyMedium">⏱️ ~30 min</Text>
          </View>

          <Button
            mode="contained"
            onPress={handleStartWorkout}
            style={styles.startButton}
            contentStyle={styles.startButtonContent}
          >
            START WORKOUT
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.statsTitle}>
            📊 Quick Stats
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall">8</Text>
              <Text variant="bodySmall">Workouts this month</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall">5</Text>
              <Text variant="bodySmall">Day streak</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.goalsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.goalsTitle}>
            🎯 This Week's Goals
          </Text>
          <Text variant="bodyMedium" style={styles.goalsText}>
            Continue to attempt new maxes and go for max repetitions. 
            Keep great form and push to your limits!
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#2563EB',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcome: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  workoutCard: {
    margin: 16,
    marginTop: -40,
    elevation: 4,
  },
  cardLabel: {
    color: '#6B7280',
    marginBottom: 4,
  },
  workoutTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutSubtitle: {
    color: '#6B7280',
    marginBottom: 16,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  startButton: {
    marginTop: 8,
  },
  startButtonContent: {
    paddingVertical: 8,
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
  },
  statsTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  goalsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  goalsTitle: {
    marginBottom: 12,
  },
  goalsText: {
    lineHeight: 22,
    color: '#6B7280',
  },
});
