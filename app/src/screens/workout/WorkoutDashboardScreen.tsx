/**
 * Workout Dashboard Screen
 * 
 * Main workout screen showing current week/day and workout overview with gamified UI
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { startSession } from '../../store/slices/workoutSlice';
import GameButton from '../../components/common/GameButton';
import AchievementCard from '../../components/common/AchievementCard';
import WeeklyJourneyView from '../../components/workout/WeeklyJourneyView';
import useThemeColors from '../../utils/useThemeColors';

type AchievementType = 'workouts' | 'streak' | 'volume' | 'prs' | null;

export default function WorkoutDashboardScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.currentUser);
  const currentWeek = user?.currentWeek ?? 0;
  const currentDay = user?.currentDay ?? 1;
  const colors = useThemeColors();
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementType>(null);

  const mockWorkoutData = {
    exercises: [
      { exerciseId: 'bench-press', suggestedWeight: 215, sets: [1, 2, 3, 4], targetReps: { min: 1, max: 6 } },
      { exerciseId: 'lat-pulldown', suggestedWeight: 250, sets: [1, 2, 3, 4], targetReps: { min: 10, max: 12 } },
      { exerciseId: 'dumbbell-incline-press', suggestedWeight: 85, sets: [1, 2, 3], targetReps: { min: 10, max: 12 } },
      { exerciseId: 'machine-low-row', suggestedWeight: 200, sets: [1, 2, 3], targetReps: 'REP_OUT' },
      { exerciseId: 'dumbbell-chest-fly', suggestedWeight: 40, sets: [1, 2], targetReps: 'REP_OUT' },
    ],
  };

  const weeklyJourney = [1, 2, 3, 4, 5, 6, 0].map(weekNum => ({
    weekNumber: weekNum,
    completed: weekNum < currentWeek && weekNum !== 0,
    current: weekNum === currentWeek,
    workoutsCompleted: weekNum < currentWeek ? 3 : (weekNum === currentWeek ? 0 : 0),
    totalWorkouts: weekNum === 0 ? 1 : 3,
    totalVolume: weekNum < currentWeek ? 15000 + (weekNum * 500) : undefined,
  }));

  const achievementDetails = {
    workouts: {
      title: 'Monthly Workouts',
      details: [
        'Week 1: 3 workouts completed',
        'Week 2: 3 workouts completed',
        'Week 3: 2 workouts completed (in progress)',
        '',
        'Total this month: 8 workouts',
        'Average per week: 2.7 workouts',
        'Keep it up! Consistency is key to progress.'
      ],
    },
    streak: {
      title: 'Current Streak',
      details: [
        'Monday: Chest & Back',
        'Tuesday: Rest',
        'Wednesday: Legs',
        'Thursday: Rest',
        'Friday: Shoulders & Arms',
        'Saturday: Chest & Back',
        'Sunday: Legs',
        '',
        'Current streak: 5 days',
        'Longest streak: 12 days',
        'Keep the momentum going!'
      ],
    },
    volume: {
      title: 'Total Volume Lifted',
      details: [
        'Week 1: 15,000 lbs',
        'Week 2: 16,200 lbs (+8%)',
        'Week 3: 5,500 lbs (in progress)',
        '',
        'Total this month: 36,700 lbs',
        'Average per workout: 4,588 lbs',
        'Personal best single workout: 5,800 lbs',
        '',
        'Volume is trending upward - great progress!'
      ],
    },
    prs: {
      title: 'Personal Records Set',
      details: [
        'Bench Press: 225 lbs × 4 reps',
        'Lat Pulldown: 270 lbs × 10 reps',
        'Leg Press: 450 lbs × 12 reps',
        '',
        'Total PRs this month: 3',
        'Total PRs all-time: 15',
        '',
        'You\'re getting stronger every week!',
      ],
    },
  };

  const handleStartWorkout = () => {
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

    dispatch(startSession(mockSession));
    navigation.navigate('Warmup');
  };

  const getWorkoutName = (day: number) => {
    const workouts = {
      1: 'Chest & Back',
      2: 'Legs',
      3: 'Shoulders & Arms',
    };
    return workouts[day as keyof typeof workouts] || 'Full Body';
  };

  const renderAchievementDetails = () => {
    if (!selectedAchievement) return null;
    const details = achievementDetails[selectedAchievement];

    return (
      <Modal
        visible={!!selectedAchievement}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.modal, { backgroundColor: colors.card }]}>
            <View style={modalStyles.header}>
              <Text style={[modalStyles.modalTitle, { color: colors.text }]}>
                {details.title}
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setSelectedAchievement(null)}
                iconColor={colors.text}
              />
            </View>
            <ScrollView style={modalStyles.content}>
              {details.details.map((line, idx) => (
                <Text key={idx} style={[modalStyles.detailText, { color: colors.text }]}>
                  {line}
                </Text>
              ))}
            </ScrollView>
            <View style={modalStyles.actions}>
              <GameButton
                onPress={() => setSelectedAchievement(null)}
                variant="primary"
                size="medium"
                icon="check"
              >
                GOT IT
              </GameButton>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 56,
    },
    title: {
      fontSize: 32,
      color: '#fff',
      fontWeight: '900',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    welcome: {
      fontSize: 18,
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '600',
    },
    workoutCard: {
      margin: 16,
      marginTop: -40,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 12,
    },
    workoutCardContent: {
      padding: 24,
    },
    cardLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    workoutTitle: {
      fontSize: 32,
      fontWeight: '900',
      marginBottom: 8,
      color: colors.text,
    },
    workoutSubtitle: {
      fontSize: 20,
      color: colors.textSecondary,
      marginBottom: 20,
      fontWeight: '600',
    },
    workoutMeta: {
      flexDirection: 'row',
      gap: 20,
      marginBottom: 24,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    metaText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
    },
    achievementsSection: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    achievementsGrid: {
      gap: 12,
    },
    achievementRow: {
      flexDirection: 'row',
      gap: 12,
    },
    achievementItem: {
      flex: 1,
    },
    goalsCard: {
      margin: 16,
      marginTop: 8,
      marginBottom: 32,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 8,
    },
    goalsContent: {
      padding: 24,
    },
    goalsTitle: {
      fontSize: 22,
      marginBottom: 16,
      color: colors.text,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    goalsText: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
      fontWeight: '500',
    },
  });

  const modalStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      padding: 20,
    },
    modal: {
      borderRadius: 20,
      maxHeight: '80%',
      elevation: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 24,
      paddingRight: 8,
      paddingTop: 16,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    content: {
      padding: 24,
      maxHeight: 400,
    },
    detailText: {
      fontSize: 16,
      lineHeight: 28,
      fontWeight: '500',
      marginBottom: 4,
    },
    actions: {
      padding: 16,
      borderTopWidth: 2,
      borderTopColor: colors.border,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.title}>
          30 MIN PT
        </Text>
        <Text style={styles.welcome}>
          Welcome back, {user?.name || 'Champion'}!
        </Text>
      </LinearGradient>

      <Card style={styles.workoutCard}>
        <View style={styles.workoutCardContent}>
          <Text style={styles.cardLabel}>
            TODAY'S WORKOUT
          </Text>
          <Text style={styles.workoutTitle}>
            Week {currentWeek} • Day {currentDay}
          </Text>
          <Text style={styles.workoutSubtitle}>
            {getWorkoutName(currentDay)}
          </Text>
          
          <View style={styles.workoutMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>5 Exercises</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>~30 min</Text>
            </View>
          </View>

          <GameButton
            onPress={handleStartWorkout}
            icon="rocket-launch"
            variant="success"
          >
            START WORKOUT
          </GameButton>
        </View>
      </Card>

      <WeeklyJourneyView
        weeks={weeklyJourney}
        onWeekPress={(weekNum) => {
          console.log(`Week ${weekNum} pressed`);
        }}
      />

      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>
          Weekly Achievements
        </Text>
        <View style={styles.achievementsGrid}>
          <View style={styles.achievementRow}>
            <View style={styles.achievementItem}>
              <AchievementCard
                title="Workouts"
                value="8"
                icon="dumbbell"
                color="gold"
                subtitle="This Month"
                onPress={() => setSelectedAchievement('workouts')}
              />
            </View>
            <View style={styles.achievementItem}>
              <AchievementCard
                title="Day Streak"
                value="5"
                icon="fire"
                color="blue"
                subtitle="Keep Going!"
                onPress={() => setSelectedAchievement('streak')}
              />
            </View>
          </View>
          
          <View style={styles.achievementRow}>
            <View style={styles.achievementItem}>
              <AchievementCard
                title="Total Volume"
                value="12.5k"
                icon="lightning-bolt"
                color="green"
                subtitle="lbs lifted"
                onPress={() => setSelectedAchievement('volume')}
              />
            </View>
            <View style={styles.achievementItem}>
              <AchievementCard
                title="PR's Set"
                value="3"
                icon="trophy"
                color="bronze"
                subtitle="New Records!"
                onPress={() => setSelectedAchievement('prs')}
              />
            </View>
          </View>
        </View>
      </View>

      <Card style={styles.goalsCard}>
        <LinearGradient
          colors={[colors.primary + '20', colors.primary + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.goalsContent}
        >
          <Text style={styles.goalsTitle}>
            This Week's Mission
          </Text>
          <Text style={styles.goalsText}>
            Continue to attempt new maxes and go for maximum repetitions.
            Keep excellent form and push to your limits! Remember: progress over perfection.
          </Text>
        </LinearGradient>
      </Card>

      {renderAchievementDetails()}
    </ScrollView>
  );
}
