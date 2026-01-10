/**
 * Workout Dashboard Screen - Nike/Hevy Style Redesign
 * 
 * DRAMATICALLY redesigned with large hero elements, generous white space, and bold typography
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { startSession } from '../../store/slices/workoutSliceEnhanced';
import GameButton from '../../components/common/GameButton';
import AchievementCard from '../../components/common/AchievementCard';
import WeeklyJourneyView from '../../components/workout/WeeklyJourneyView';
import OfflineIndicator from '../../components/common/OfflineIndicator';
import ResumeWorkoutCard from '../../components/workout/ResumeWorkoutCard';
import QuickStartService, { ResumeWorkoutInfo } from '../../services/QuickStartService';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

type AchievementType = 'workouts' | 'streak' | 'volume' | 'prs' | null;

export default function WorkoutDashboardScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.currentUser);
  const currentWeek = user?.currentWeek ?? 0;
  const currentDay = user?.currentDay ?? 1;
  const colors = useThemeColors();
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementType>(null);
  const [resumeInfo, setResumeInfo] = useState<ResumeWorkoutInfo | null>(null);

  useEffect(() => {
    checkForResumableWorkout();
  }, [user?.id]);

  const checkForResumableWorkout = async () => {
    if (user?.id) {
      const info = await QuickStartService.canResumeWorkout(user.id);
      setResumeInfo(info);
    }
  };

  const handleResumeWorkout = () => {
    if (resumeInfo?.session) {
      dispatch(startSession(resumeInfo.session));
      navigation.navigate('ActiveWorkout', { sessionId: resumeInfo.session.id });
    }
  };

  const handleDiscardWorkout = async () => {
    await QuickStartService.clearPausedWorkout();
    setResumeInfo(null);
  };

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
    // NIKE/HEVY STYLE: Large hero header with generous padding
    heroHeader: {
      paddingHorizontal: 32,
      paddingTop: 80,
      paddingBottom: 120,
    },
    // HUGE app title like Nike
    appTitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '600',
      marginBottom: 8,
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    // MASSIVE welcome text
    welcomeText: {
      fontSize: 48,
      color: '#FFFFFF',
      fontWeight: '900',
      marginBottom: 4,
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: 18,
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '400',
    },
    // Overlapping card - Nike style
    workoutHeroCard: {
      marginHorizontal: 24,
      marginTop: -80,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      ...shadows.lg,
    },
    heroCardContent: {
      padding: 32,
    },
    todayLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '700',
      letterSpacing: 1.5,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    // HUGE workout title
    workoutHeroTitle: {
      fontSize: 42,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 8,
      letterSpacing: -1,
    },
    workoutType: {
      fontSize: 24,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 24,
    },
    // Meta info row
    metaRow: {
      flexDirection: 'row',
      gap: 24,
      marginBottom: 32,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.borderLight,
    },
    metaItem: {
      alignItems: 'center',
      flex: 1,
    },
    metaIcon: {
      marginBottom: 8,
    },
    metaValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    metaLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    // MASSIVE start button like Nike
    startButtonContainer: {
      marginTop: 8,
    },
    section: {
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    // Larger section titles
    sectionHeader: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 24,
      letterSpacing: -0.5,
    },
    achievementsGrid: {
      gap: 16,
    },
    achievementRow: {
      flexDirection: 'row',
      gap: 16,
    },
    achievementItem: {
      flex: 1,
    },
    motivationCard: {
      marginHorizontal: 24,
      marginTop: 8,
      marginBottom: 48,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: colors.primary + '10',
      borderWidth: 2,
      borderColor: colors.primary + '20',
    },
    motivationContent: {
      padding: 28,
    },
    motivationTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    motivationText: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
    },
  });

  const modalStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      padding: 24,
    },
    modal: {
      borderRadius: 24,
      maxHeight: '80%',
      ...shadows.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 24,
      paddingRight: 8,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    content: {
      padding: 24,
      maxHeight: 400,
    },
    detailText: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.text,
      marginBottom: 8,
    },
    actions: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <OfflineIndicator />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {resumeInfo && resumeInfo.canResume && (
          <ResumeWorkoutCard
            resumeInfo={resumeInfo}
            onResume={handleResumeWorkout}
            onDiscard={handleDiscardWorkout}
          />
        )}
        
        {/* NIKE-STYLE HERO HEADER - Much Larger */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'E6', colors.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <Text style={styles.appTitle}>MY MOBILE TRAINER</Text>
          <Text style={styles.welcomeText}>
            {user?.name || 'Champion'}
          </Text>
          <Text style={styles.subtitle}>
            Ready to crush today's workout?
          </Text>
        </LinearGradient>

        {/* OVERLAPPING HERO CARD - Nike Style */}
        <View style={styles.workoutHeroCard}>
          <View style={styles.heroCardContent}>
            <Text style={styles.todayLabel}>TODAY'S WORKOUT</Text>
            
            {/* MASSIVE workout title */}
            <Text style={styles.workoutHeroTitle}>
              Week {currentWeek}
            </Text>
            
            <Text style={styles.workoutType}>
              {getWorkoutName(currentDay)}
            </Text>

            {/* Meta info with icons */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons 
                  name="weight-lifter" 
                  size={28} 
                  color={colors.primary} 
                  style={styles.metaIcon}
                />
                <Text style={styles.metaValue}>5</Text>
                <Text style={styles.metaLabel}>Exercises</Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons 
                  name="clock-outline" 
                  size={28} 
                  color={colors.primary} 
                  style={styles.metaIcon}
                />
                <Text style={styles.metaValue}>30</Text>
                <Text style={styles.metaLabel}>Minutes</Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons 
                  name="fire" 
                  size={28} 
                  color={colors.primary} 
                  style={styles.metaIcon}
                />
                <Text style={styles.metaValue}>High</Text>
                <Text style={styles.metaLabel}>Intensity</Text>
              </View>
            </View>

            {/* HUGE start button */}
            <View style={styles.startButtonContainer}>
              <GameButton
                onPress={handleStartWorkout}
                icon="play-circle"
                variant="success"
                size="large"
              >
                START WORKOUT
              </GameButton>
            </View>
          </View>
        </View>

        {/* Weekly Journey with more space */}
        <View style={{ marginTop: 32, marginBottom: 16 }}>
          <WeeklyJourneyView
            weeks={weeklyJourney}
            onWeekPress={(weekNum) => {
              console.log(`Week ${weekNum} pressed`);
            }}
          />
        </View>

        {/* CLEANER Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>This Week</Text>
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
                  title="Streak"
                  value="5"
                  icon="fire"
                  color="blue"
                  subtitle="Days"
                  onPress={() => setSelectedAchievement('streak')}
                />
              </View>
            </View>
            
            <View style={styles.achievementRow}>
              <View style={styles.achievementItem}>
                <AchievementCard
                  title="Volume"
                  value="12.5k"
                  icon="lightning-bolt"
                  color="green"
                  subtitle="lbs"
                  onPress={() => setSelectedAchievement('volume')}
                />
              </View>
              <View style={styles.achievementItem}>
                <AchievementCard
                  title="PR's"
                  value="3"
                  icon="trophy"
                  color="bronze"
                  subtitle="Records"
                  onPress={() => setSelectedAchievement('prs')}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Cleaner motivation card */}
        <View style={styles.motivationCard}>
          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>
              This Week's Focus
            </Text>
            <Text style={styles.motivationText}>
              Continue to attempt new maxes and go for maximum repetitions. 
              Keep excellent form and push to your limits!
            </Text>
          </View>
        </View>

        {renderAchievementDetails()}
      </ScrollView>
    </View>
  );
}
