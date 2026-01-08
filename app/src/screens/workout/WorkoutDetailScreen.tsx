/**
 * Workout Detail Screen
 * 
 * Preview exercises and weights before starting a workout
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, List, Divider } from 'react-native-paper';
import { useAppSelector } from '../../store/store';
import { getExerciseById } from '../../constants/exercises';
import useThemeColors from '../../utils/useThemeColors';

interface WorkoutDetailScreenProps {
  navigation: any;
  route: {
    params: {
      weekNumber: number;
      dayNumber: number;
      workoutData: any;
    };
  };
}

export default function WorkoutDetailScreen({ navigation, route }: WorkoutDetailScreenProps) {
  const colors = useThemeColors();
  const { weekNumber, dayNumber, workoutData } = route.params;
  const userMaxes = useAppSelector((state) => state.user.maxLifts);

  const exercises = workoutData?.exercises || [];

  const handleStartWorkout = () => {
    // TODO: Initialize workout session with calculated weights
    navigation.navigate('ActiveWorkout');
  };

  const formatRepRange = (target: any) => {
    if (target === 'REP_OUT') return 'Rep Out';
    if (typeof target === 'object') return `${target.min}-${target.max}`;
    return target.toString();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.headerBackground,
      padding: 24,
      paddingTop: 60,
    },
    headerTitle: {
      color: colors.headerText,
      fontWeight: 'bold',
    },
    headerSubtitle: {
      color: colors.headerText,
      opacity: 0.9,
      marginTop: 4,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      backgroundColor: colors.card,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 8,
      padding: 16,
    },
    sectionTitle: {
      marginBottom: 12,
      fontWeight: 'bold',
      color: colors.text,
    },
    exerciseItem: {
      paddingVertical: 8,
      paddingHorizontal: 0,
    },
    numberBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    numberText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 14,
    },
    weightContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      paddingRight: 8,
    },
    weight: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    unit: {
      marginLeft: 4,
      color: colors.textSecondary,
    },
    tipCard: {
      padding: 12,
      backgroundColor: colors.primary + '20',
      borderRadius: 8,
    },
    tipText: {
      color: colors.primary,
      marginVertical: 4,
    },
    durationCard: {
      alignItems: 'center',
      padding: 16,
    },
    duration: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    durationSubtitle: {
      color: colors.textSecondary,
      marginTop: 4,
    },
    footer: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    footerButton: {
      flex: 1,
    },
    startButton: {
      backgroundColor: colors.primary,
    },
    startButtonContent: {
      paddingVertical: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          {weekNumber > 0 ? `Week ${weekNumber}` : 'Max Week'} - Day {dayNumber}
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {exercises.length} exercises • {exercises.reduce((total: number, ex: any) => total + (ex.sets?.length || 0), 0)} total sets
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            📋 Exercise Overview
          </Text>
          
          {exercises.map((exercise: any, index: number) => {
            const exerciseDetails = getExerciseById(exercise.exerciseId);
            const suggestedWeight = exercise.suggestedWeight || 0;
            
            return (
              <View key={index}>
                <List.Item
                  title={exerciseDetails?.name || exercise.exerciseId}
                  description={`${exercise.sets?.length || 0} sets • ${formatRepRange(exercise.targetReps)} reps`}
                  left={props => (
                    <View style={styles.numberBadge}>
                      <Text style={styles.numberText}>{index + 1}</Text>
                    </View>
                  )}
                  right={() => (
                    <View style={styles.weightContainer}>
                      <Text variant="titleMedium" style={styles.weight}>
                        {suggestedWeight}
                      </Text>
                      <Text variant="bodySmall" style={styles.unit}>
                        lbs
                      </Text>
                    </View>
                  )}
                  style={styles.exerciseItem}
                />
                {index < exercises.length - 1 && <Divider style={{ backgroundColor: colors.border }} />}
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            💡 Workout Tips
          </Text>
          <View style={styles.tipCard}>
            <Text variant="bodyMedium" style={styles.tipText}>
              • Warm up properly before lifting heavy weights
            </Text>
            <Text variant="bodyMedium" style={styles.tipText}>
              • Focus on form over weight
            </Text>
            <Text variant="bodyMedium" style={styles.tipText}>
              • Rest as needed between sets
            </Text>
            <Text variant="bodyMedium" style={styles.tipText}>
              • Stay hydrated throughout your workout
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Estimated Duration
          </Text>
          <View style={styles.durationCard}>
            <Text variant="headlineMedium" style={styles.duration}>
              45-60 min
            </Text>
            <Text variant="bodySmall" style={styles.durationSubtitle}>
              Including warm-up and rest periods
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.footerButton}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleStartWorkout}
          style={[styles.footerButton, styles.startButton]}
          contentStyle={styles.startButtonContent}
        >
          Begin Workout
        </Button>
      </View>
    </View>
  );
}
