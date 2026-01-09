/**
 * Max Determination Intro Screen
 * 
 * Introduces users to the Max Determination Week and explains the process
 * of establishing 4RM (one-rep max) for each primary exercise.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Checkbox, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { startMaxTesting } from '../../store/slices/progressSlice';
import { MaxDeterminationService } from '../../services/MaxDeterminationService';
import useThemeColors from '../../utils/useThemeColors';

type NavigationProp = NativeStackNavigationProp<any>;

export default function MaxDeterminationIntroScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const currentUser = useAppSelector(state => state.user.currentUser);
  
  const [checkedExercises, setCheckedExercises] = React.useState<Set<string>>(
    new Set(MaxDeterminationService.PRIMARY_EXERCISES.map(e => e.id))
  );
  
  const [showOptional, setShowOptional] = React.useState(false);

  const toggleExercise = (exerciseId: string) => {
    const newSet = new Set(checkedExercises);
    if (newSet.has(exerciseId)) {
      newSet.delete(exerciseId);
    } else {
      newSet.add(exerciseId);
    }
    setCheckedExercises(newSet);
  };

  const handleBegin = () => {
    const selectedExercises = MaxDeterminationService.ALL_EXERCISES
      .filter(ex => checkedExercises.has(ex.id))
      .map(ex => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        attempts: [],
        completed: false,
      }));

    dispatch(startMaxTesting(selectedExercises));
    navigation.navigate('MaxTesting');
  };

  const handleSkip = () => {
    // Navigate to main app with default maxes
    navigation.navigate('MainTabs');
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
    heroSection: {
      alignItems: 'center',
      marginBottom: 32,
      paddingTop: 20,
    },
    heroIcon: {
      fontSize: 64,
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
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: 12,
      color: colors.text,
    },
    card: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    cardTitle: {
      fontWeight: '600',
      marginBottom: 8,
      color: colors.primary,
    },
    cardText: {
      color: colors.text,
      lineHeight: 20,
    },
    importantCard: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: '#F59E0B',
    },
    importantTitle: {
      fontWeight: 'bold',
      color: '#F59E0B',
      marginBottom: 8,
    },
    importantText: {
      color: colors.text,
      lineHeight: 20,
    },
    exerciseList: {
      marginBottom: 24,
    },
    exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    exerciseInfo: {
      flex: 1,
      marginLeft: 8,
    },
    exerciseName: {
      fontWeight: '600',
      color: colors.text,
    },
    exerciseMuscle: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    estimatedTime: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      alignItems: 'center',
    },
    timeText: {
      color: colors.textSecondary,
      marginBottom: 4,
    },
    timeValue: {
      fontWeight: 'bold',
      color: colors.primary,
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
  });

  const selectedCount = checkedExercises.size;
  const estimatedMinutes = selectedCount * 5;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Text style={styles.heroIcon}>🏋️</Text>
          <Text variant="headlineLarge" style={styles.title}>
            Establish Your Maxes
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Before starting your training program, we need to determine your current strength levels
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Why Max Testing Matters
          </Text>
          <View style={styles.card}>
            <Text variant="titleSmall" style={styles.cardTitle}>
              📊 Personalized Training
            </Text>
            <Text variant="bodySmall" style={styles.cardText}>
              Your 4RM (one-rep max) determines the exact weights you'll use for every workout over the next 48 weeks.
            </Text>
          </View>
          <View style={styles.card}>
            <Text variant="titleSmall" style={styles.cardTitle}>
              📈 Track Progress
            </Text>
            <Text variant="bodySmall" style={styles.cardText}>
              Compare your strength gains week-over-week and see measurable improvements.
            </Text>
          </View>
          <View style={styles.card}>
            <Text variant="titleSmall" style={styles.cardTitle}>
              ⚡ Optimal Intensity
            </Text>
            <Text variant="bodySmall" style={styles.cardText}>
              Work at the right intensity for maximum results without overtraining.
            </Text>
          </View>
        </View>

        <View style={styles.importantCard}>
          <Text variant="titleSmall" style={styles.importantTitle}>
            ⚠️ Safety First
          </Text>
          <Text variant="bodySmall" style={styles.importantText}>
            • Warm up thoroughly before testing{'\n'}
            • Use a spotter when possible{'\n'}
            • Stop at technical failure (when form breaks down){'\n'}
            • Rest 3-5 minutes between heavy attempts{'\n'}
            • Listen to your body - it's okay to be conservative
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Primary Exercises ({checkedExercises.size}/10)
          </Text>
          <View style={styles.exerciseList}>
            {MaxDeterminationService.PRIMARY_EXERCISES.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <Checkbox
                  status={checkedExercises.has(exercise.id) ? 'checked' : 'unchecked'}
                  onPress={() => toggleExercise(exercise.id)}
                />
                <View style={styles.exerciseInfo}>
                  <Text variant="bodyMedium" style={styles.exerciseName}>
                    {exercise.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.exerciseMuscle}>
                    {exercise.muscleGroup.charAt(0).toUpperCase() + exercise.muscleGroup.slice(1)} • Primary
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Button
            mode="text"
            onPress={() => setShowOptional(!showOptional)}
            contentStyle={styles.buttonContent}
            icon={showOptional ? 'chevron-up' : 'chevron-down'}
          >
            {showOptional ? 'Hide' : 'Show'} Optional Exercises (5 more)
          </Button>

          {showOptional && (
            <View style={styles.exerciseList}>
              {MaxDeterminationService.OPTIONAL_EXERCISES.map((exercise) => (
                <View key={exercise.id} style={styles.exerciseItem}>
                  <Checkbox
                    status={checkedExercises.has(exercise.id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleExercise(exercise.id)}
                  />
                  <View style={styles.exerciseInfo}>
                    <Text variant="bodyMedium" style={styles.exerciseName}>
                      {exercise.name}
                    </Text>
                    <Text variant="bodySmall" style={styles.exerciseMuscle}>
                      {exercise.muscleGroup.charAt(0).toUpperCase() + exercise.muscleGroup.slice(1)} • Optional
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.estimatedTime}>
          <Text variant="bodySmall" style={styles.timeText}>
            Estimated Time
          </Text>
          <Text variant="headlineMedium" style={styles.timeValue}>
            ~{estimatedMinutes} minutes
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            How It Works
          </Text>
          <Text variant="bodySmall" style={styles.cardText}>
            1. Start with a light warm-up weight{'\n'}
            2. Perform as many clean reps as possible{'\n'}
            3. If successful, increase weight and rest{'\n'}
            4. Repeat until you find your max{'\n'}
            5. Move to the next exercise
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleBegin}
            disabled={selectedCount === 0}
            contentStyle={styles.buttonContent}
          >
            Let's Begin Testing
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleSkip}
            contentStyle={styles.buttonContent}
          >
            Skip for Now (Use Defaults)
          </Button>
        </View>

        <Text variant="bodySmall" style={[styles.subtitle, { marginTop: 16 }]}>
          You can retake these tests anytime from your profile
        </Text>
      </ScrollView>
    </View>
  );
}
