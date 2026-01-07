/**
 * Workout Summary Screen
 * 
 * Displays workout completion stats, new PRs, and exercise breakdown.
 * Shown after user completes a workout session.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { clearActiveSession } from '../../store/slices/workoutSlice';
import FormulaCalculator from '../../services/FormulaCalculator';
import { getExerciseById } from '../../constants/exercises';

export default function WorkoutSummaryScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const activeSession = useAppSelector((state) => state.workout.activeSession);

  if (!activeSession || activeSession.status !== 'completed') {
    return (
      <View style={styles.container}>
        <Text>No completed workout to display</Text>
      </View>
    );
  }

  const duration = activeSession.completedAt && activeSession.startedAt
    ? Math.floor((activeSession.completedAt - activeSession.startedAt) / 1000 / 60)
    : 0;

  const totalVolume = FormulaCalculator.calculateVolume(activeSession.exercises);
  const totalSets = activeSession.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
  const totalReps = activeSession.exercises.reduce(
    (sum, ex) => sum + (ex.sets || []).reduce((s, set) => s + set.reps, 0),
    0
  );

  // Check for PRs (simplified - would check against actual maxes from database)
  const newPRs = activeSession.exercises.filter(ex => {
    if (!ex.sets || ex.sets.length === 0) return false;
    const maxSet = ex.sets.reduce((best, current) =>
      current.weight > (best?.weight || 0) ? current : best
    , ex.sets[0]); // Provide initial value
    return maxSet && maxSet.weight > (ex.suggestedWeight * 1.05); // 5% above suggestion
  });

  const handleDone = () => {
    dispatch(clearActiveSession());
    navigation.navigate('WorkoutDashboard');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.celebration}>
          🎉
        </Text>
        <Text variant="headlineLarge" style={styles.title}>
          WORKOUT COMPLETE!
        </Text>
        <Text variant="titleMedium" style={styles.subtitle}>
          Week {activeSession.weekNumber} - Day {activeSession.dayNumber}
        </Text>
      </View>

      {/* Workout Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            📊 Workout Stats
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statValue}>
                {duration}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Minutes
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statValue}>
                {totalVolume.toLocaleString()}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total lbs
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statValue}>
                {activeSession.exercises.length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Exercises
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statValue}>
                {totalSets}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Sets
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statValue}>
                {totalReps}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Reps
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Personal Records */}
      {newPRs.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              🏆 Personal Records
            </Text>
            {newPRs.map((ex, idx) => {
              const exercise = getExerciseById(ex.exerciseId);
              const maxSet = ex.sets.reduce((best, current) =>
                current.weight > (best?.weight || 0) ? current : best
              );
              return (
                <View key={idx} style={styles.prItem}>
                  <Text variant="titleSmall">{exercise?.name}</Text>
                  <Text variant="bodyLarge" style={styles.prWeight}>
                    {maxSet.weight} lbs × {maxSet.reps} reps
                  </Text>
                </View>
              );
            })}
          </Card.Content>
        </Card>
      )}

      {/* Exercise Breakdown */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            📝 Exercise Breakdown
          </Text>
          {activeSession.exercises.map((ex, idx) => {
            const exercise = getExerciseById(ex.exerciseId);
            return (
              <View key={idx}>
                {idx > 0 && <Divider style={styles.divider} />}
                <View style={styles.exerciseBreakdown}>
                  <Text variant="titleSmall" style={styles.exerciseName}>
                    {idx + 1}. {exercise?.name}
                  </Text>
                  <View style={styles.setsBreakdown}>
                    {ex.sets.map((set, setIdx) => (
                      <Text key={setIdx} variant="bodySmall" style={styles.setText}>
                        Set {set.setNumber}: {set.weight} lbs × {set.reps} reps
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            );
          })}
        </Card.Content>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleDone}
          style={styles.doneButton}
          contentStyle={styles.doneButtonContent}
        >
          Done
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Progress')}
          style={styles.detailButton}
        >
          View Progress
        </Button>
      </View>

      {/* Motivational message */}
      <View style={styles.motivation}>
        <Text variant="bodyMedium" style={styles.motivationText}>
          💪 Great work! Every rep brings you closer to your goals!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 60,
    backgroundColor: '#10B981',
  },
  celebration: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  card: {
    margin: 16,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: '30%',
  },
  statValue: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#6B7280',
    marginTop: 4,
  },
  prItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  prWeight: {
    color: '#8B5CF6',
    fontWeight: 'bold',
    marginTop: 4,
  },
  exerciseBreakdown: {
    paddingVertical: 12,
  },
  exerciseName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  setsBreakdown: {
    gap: 4,
  },
  setText: {
    color: '#6B7280',
  },
  divider: {
    marginVertical: 8,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  doneButton: {
    backgroundColor: '#2563EB',
  },
  doneButtonContent: {
    paddingVertical: 8,
  },
  detailButton: {
    borderColor: '#2563EB',
  },
  motivation: {
    padding: 24,
    alignItems: 'center',
  },
  motivationText: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
