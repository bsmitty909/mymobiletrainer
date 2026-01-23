/**
 * Workout Summary Screen - Modern 2024 Design
 *
 * Celebration screen with clean, professional styling
 * Maintains confetti animation and haptic feedback
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { clearActiveSession } from '../../store/slices/workoutSliceEnhanced';
import { addWorkoutCompletion } from '../../store/slices/gamificationSlice';
import { addRecentWorkout } from '../../store/slices/progressSlice';
import FormulaCalculator from '../../services/FormulaCalculator';
import { getExerciseById } from '../../constants/exercises';
import GameButton from '../../components/common/GameButton';
import AchievementCard from '../../components/common/AchievementCard';
import ConfettiAnimation from '../../components/common/ConfettiAnimation';
import HapticService from '../../services/HapticService';
import { spacing, typography, borderRadius, shadows, colors as designColors } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

export default function WorkoutSummaryScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const activeSession = useAppSelector((state) => state.workout.activeSession);
  const [showConfetti, setShowConfetti] = useState(false);

  const duration = activeSession?.completedAt && activeSession?.startedAt
    ? Math.floor((activeSession.completedAt - activeSession.startedAt) / 1000 / 60)
    : 0;

  const totalVolume = activeSession?.exercises ? FormulaCalculator.calculateVolume(activeSession.exercises) : 0;
  const totalSets = activeSession?.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0;
  const totalReps = activeSession?.exercises?.reduce(
    (sum, ex) => sum + (ex.sets || []).reduce((s, set) => s + set.reps, 0),
    0
  ) || 0;

  const newPRs = activeSession?.exercises?.filter(ex => {
    if (!ex.sets || ex.sets.length === 0) return false;
    const maxSet = ex.sets.reduce((best, current) =>
      current.weight > (best?.weight || 0) ? current : best
    , ex.sets[0]);
    return maxSet && maxSet.weight > (ex.suggestedWeight * 1.05);
  }) || [];

  useEffect(() => {
    if (activeSession && activeSession.status === 'completed') {
      setShowConfetti(true);
      HapticService.workoutCompleted();
    }
  }, [activeSession]);

  useEffect(() => {
    if (activeSession && activeSession.status === 'completed') {
      dispatch(addWorkoutCompletion({
        setsCompleted: totalSets,
        exercisesCompleted: activeSession.exercises.length,
        totalVolume,
        duration: duration * 60,
        personalRecords: newPRs.length,
      }));
      
      dispatch(addRecentWorkout({
        ...activeSession,
        completedAt: typeof activeSession.completedAt === 'number'
          ? activeSession.completedAt
          : activeSession.completedAt || Date.now(),
        startedAt: typeof activeSession.startedAt === 'number'
          ? activeSession.startedAt
          : activeSession.startedAt || Date.now(),
      }));
    }
  }, [activeSession?.status]);

  if (!activeSession || activeSession.status !== 'completed') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No completed workout to display</Text>
      </View>
    );
  }

  const handleDone = () => {
    dispatch(clearActiveSession());
    navigation.navigate('WorkoutDashboard');
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    celebration: {
      fontSize: 64,
      marginBottom: spacing.base,
    },
    title: {
      ...typography.heroDisplay,
      color: '#FFFFFF',
      marginBottom: spacing.tight,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    subtitle: {
      ...typography.h3,
      color: 'rgba(255, 255, 255, 0.95)',
    },
    achievementsSection: {
      padding: spacing.base,
      paddingTop: spacing.comfortable,
    },
    sectionTitle: {
      ...typography.h1,
      color: colors.text,
      marginBottom: spacing.comfortable,
    },
    achievementsGrid: {
      gap: spacing.close,
    },
    achievementRow: {
      flexDirection: 'row',
      gap: spacing.close,
    },
    achievementItem: {
      flex: 1,
    },
    card: {
      margin: spacing.base,
      marginTop: spacing.tight,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.surface,
      ...shadows.lg,
    },
    cardContent: {
      padding: spacing.generous,
    },
    cardTitle: {
      ...typography.h2,
      marginBottom: spacing.base,
      color: colors.text,
    },
    prItem: {
      paddingVertical: spacing.close,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    prName: {
      ...typography.h3,
      color: colors.text,
    },
    prWeight: {
      ...typography.display,
      fontSize: 32,
      color: '#FFD700',
      marginTop: spacing.tight,
    },
    exerciseBreakdown: {
      paddingVertical: spacing.close,
    },
    exerciseName: {
      ...typography.h3,
      marginBottom: spacing.tight,
      color: colors.text,
    },
    setsBreakdown: {
      gap: spacing.tight,
    },
    setText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    divider: {
      marginVertical: spacing.close,
      backgroundColor: colors.border,
      height: 1,
    },
    actions: {
      padding: spacing.base,
      gap: spacing.close,
      marginBottom: spacing.huge,
    },
    motivation: {
      margin: spacing.base,
      marginBottom: spacing.huge,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      ...shadows.md,
    },
    motivationContent: {
      padding: spacing.generous,
      alignItems: 'center',
    },
    motivationText: {
      ...typography.h3,
      textAlign: 'center',
      color: colors.text,
      lineHeight: 32,
    },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      <LinearGradient
        colors={[colors.success, colors.successLight, colors.success + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ alignItems: 'center', padding: 32, paddingTop: 60 }}
      >
        <Text style={dynamicStyles.celebration}>
          VICTORY
        </Text>
        <Text style={dynamicStyles.title}>
          WORKOUT COMPLETE!
        </Text>
        <Text style={dynamicStyles.subtitle}>
          Week {activeSession.weekNumber} - Day {activeSession.dayNumber}
        </Text>
      </LinearGradient>

      {/* Stats Achievement Cards */}
      <View style={dynamicStyles.achievementsSection}>
        <Text style={dynamicStyles.sectionTitle}>
          Your Stats
        </Text>
        <View style={dynamicStyles.achievementsGrid}>
          <View style={dynamicStyles.achievementRow}>
            <View style={dynamicStyles.achievementItem}>
              <AchievementCard
                title="Duration"
                value={`${duration}m`}
                icon="timer"
                color="blue"
              />
            </View>
            <View style={dynamicStyles.achievementItem}>
              <AchievementCard
                title="Total Volume"
                value={`${(totalVolume / 1000).toFixed(1)}k`}
                icon="lightning-bolt"
                color="gold"
                subtitle="lbs lifted"
              />
            </View>
          </View>
          
          <View style={dynamicStyles.achievementRow}>
            <View style={dynamicStyles.achievementItem}>
              <AchievementCard
                title="Exercises"
                value={activeSession.exercises.length}
                icon="dumbbell"
                color="green"
              />
            </View>
            <View style={dynamicStyles.achievementItem}>
              <AchievementCard
                title="Total Sets"
                value={totalSets}
                icon="fire"
                color="bronze"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Personal Records */}
      {newPRs.length > 0 && (
        <Card style={dynamicStyles.card}>
          <View style={dynamicStyles.cardContent}>
            <Text style={dynamicStyles.cardTitle}>
              VICTORY New Personal Records!
            </Text>
            {newPRs.map((ex, idx) => {
              const exercise = getExerciseById(ex.exerciseId);
              const maxSet = ex.sets.reduce((best, current) =>
                current.weight > (best?.weight || 0) ? current : best
              );
              return (
                <View key={idx} style={dynamicStyles.prItem}>
                  <Text style={dynamicStyles.prName}>{exercise?.name}</Text>
                  <Text style={dynamicStyles.prWeight}>
                    ⭐ {maxSet.weight} lbs × {maxSet.reps} reps
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {/* Exercise Breakdown */}
      <Card style={dynamicStyles.card}>
        <View style={dynamicStyles.cardContent}>
          <Text style={dynamicStyles.cardTitle}>
            📝 Exercise Breakdown
          </Text>
          {activeSession.exercises.map((ex, idx) => {
            const exercise = getExerciseById(ex.exerciseId);
            return (
              <View key={idx}>
                {idx > 0 && <Divider style={dynamicStyles.divider} />}
                <View style={dynamicStyles.exerciseBreakdown}>
                  <Text style={dynamicStyles.exerciseName}>
                    {idx + 1}. {exercise?.name}
                  </Text>
                  <View style={dynamicStyles.setsBreakdown}>
                    {ex.sets.map((set, setIdx) => (
                      <Text key={setIdx} style={dynamicStyles.setText}>
                        Set {set.setNumber}: {set.weight} lbs × {set.reps} reps
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Motivational message */}
      <Card style={dynamicStyles.motivation}>
        <LinearGradient
          colors={[colors.primary + '30', colors.primary + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={dynamicStyles.motivationContent}
        >
          <Text style={dynamicStyles.motivationText}>
            Outstanding work, champion! Every rep brings you closer to your goals! Keep crushing it!
          </Text>
        </LinearGradient>
      </Card>

      {/* Actions */}
      <View style={dynamicStyles.actions}>
        <GameButton
          onPress={handleDone}
          variant="success"
          icon="check-circle"
        >
          FINISH & RETURN
        </GameButton>
        <GameButton
          onPress={() => navigation.navigate('Progress')}
          variant="secondary"
          size="medium"
          icon="chart-line"
        >
          View Progress
        </GameButton>
      </View>

      {/* Confetti Animation */}
      <ConfettiAnimation
        active={showConfetti}
        duration={3000}
        pieceCount={60}
        onComplete={() => setShowConfetti(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
