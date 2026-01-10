/**
 * Progress Dashboard Screen - Modern 2024 Design
 *
 * Redesigned with clean, professional aesthetic
 * Maintains gamification features with improved visual hierarchy
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { addBodyWeight } from '../../store/slices/progressSlice';
import AchievementCard from '../../components/common/AchievementCard';
import GameButton from '../../components/common/GameButton';
import WorkoutStreakCalendar from '../../components/workout/WorkoutStreakCalendar';
import VolumeTrendChart from '../../components/charts/VolumeTrendChart';
import IntensityDistributionChart from '../../components/charts/IntensityDistributionChart';
import BodyPartBalanceCard from '../../components/common/BodyPartBalanceCard';
import HapticService from '../../services/HapticService';
import AnalyticsService from '../../services/AnalyticsService';
import { spacing, typography, borderRadius, shadows, components } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

export default function ProgressDashboardScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const user = useAppSelector((state) => state.user.currentUser);
  const workoutHistory = useAppSelector((state) => state.progress.recentWorkouts) || [];
  const bodyWeights = useAppSelector((state) => state.progress.bodyWeights) || [];
  const userProfile = useAppSelector((state) => state.user.profile);
  const personalRecords = useAppSelector((state) => state.progress.personalRecords) || [];
  const gamification = useAppSelector((state) => state.gamification);
  
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  const totalWorkouts = gamification.totalWorkouts || workoutHistory.length || 0;
  const currentStreak = gamification.streak?.currentStreak || 0;
  const longestStreak = gamification.streak?.longestStreak || 0;
  const totalVolume = gamification.totalVolume || 0;
  const totalPRs = gamification.totalPRs || personalRecords.length || 0;
  const currentWeight = bodyWeights[bodyWeights.length - 1]?.weight || 0;

  const level = gamification.level || { level: 1, xp: 0, xpForNextLevel: 100, title: 'Beginner' };
  const unlockedBadges = gamification.badges || [];
  const streakDates = gamification.streak?.streakDates || [];

  // Calculate analytics from recent workouts (Phase 4.5)
  const latestWorkoutAnalytics = useMemo(() => {
    if (workoutHistory.length === 0) return null;
    const completedWorkouts = workoutHistory.filter(w => w.status === 'completed');
    if (completedWorkouts.length === 0) return null;
    return AnalyticsService.analyzeWorkout(completedWorkouts[0]);
  }, [workoutHistory]);

  const volumeTrendData = useMemo(() => {
    if (workoutHistory.length === 0) return [];
    const completedWorkouts = workoutHistory.filter(w => w.status === 'completed');
    return completedWorkouts.map(w => ({
      date: w.completedAt || w.startedAt,
      totalVolume: AnalyticsService.calculateVolume(w).totalVolume,
      weekNumber: w.weekNumber,
      dayNumber: w.dayNumber,
    }));
  }, [workoutHistory]);

  const handleLogWeight = () => {
    HapticService.buttonPress();
    setShowWeightModal(true);
  };

  const handleSaveWeight = () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return;
    }

    dispatch(addBodyWeight({
      id: `bw-${Date.now()}`,
      userId: user?.id || '',
      weight,
      weekNumber: user?.currentWeek || 0,
      recordedAt: Date.now(),
    }));

    HapticService.trigger('success');
    setShowWeightModal(false);
    setWeightInput('');
    Alert.alert('Success', `Body weight logged: ${weight} lbs`);
  };

  const xpPercentage = (level.xp / level.xpForNextLevel) * 100;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Level */}
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD', colors.primary + 'AA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Your Progress</Text>
            <Text style={styles.userName}>{user?.name || 'Athlete'}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{level.level}</Text>
            <Text style={styles.levelLabel}>LEVEL</Text>
          </View>
        </View>
        
        <View style={styles.xpContainer}>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${xpPercentage}%` }]} />
          </View>
          <Text style={styles.xpText}>
            {level.xp} / {level.xpForNextLevel} XP • {level.title}
          </Text>
        </View>
      </LinearGradient>

      {/* Quick Action: Weekly Progress */}
      <View style={styles.section}>
        <GameButton
          onPress={() => navigation.navigate('WeeklyProgress')}
          variant="primary"
          size="large"
          icon="chart-line"
        >
          View Weekly Progress
        </GameButton>
      </View>

      {/* Achievement Stats Grid */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Achievements
        </Text>
        <View style={styles.achievementsGrid}>
          <View style={styles.achievementRow}>
            <View style={styles.achievementItem}>
              <AchievementCard
                title="Workouts"
                value={totalWorkouts.toString()}
                icon="arm-flex"
                color="gold"
                subtitle="Completed"
              />
            </View>
            <View style={styles.achievementItem}>
              <AchievementCard
                title="Streak"
                value={currentStreak.toString()}
                icon="fire"
                color="blue"
                subtitle={`Best: ${longestStreak}`}
              />
            </View>
          </View>
          
          <View style={styles.achievementRow}>
            <View style={styles.achievementItem}>
              <AchievementCard
                title="Volume"
                value={`${Math.round(totalVolume / 1000)}k`}
                icon="lightning-bolt"
                color="green"
                subtitle="lbs lifted"
              />
            </View>
            <View style={styles.achievementItem}>
              <AchievementCard
                title="PRs"
                value={totalPRs.toString()}
                icon="trophy"
                color="bronze"
                subtitle="Personal Records"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Badges Section */}
      {unlockedBadges.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Badges ({unlockedBadges.length})
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.badgesScroll}
          >
            {unlockedBadges.slice(0, 6).map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <View style={[styles.badgeCircle, { backgroundColor: colors.card }]}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                </View>
                <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={2}>
                  {badge.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Workout Streak Calendar */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Workout Calendar
        </Text>
        <WorkoutStreakCalendar
          workoutDates={streakDates}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          onDayPress={(date) => {
            navigation.navigate('WorkoutDayDetail', {
              date: date.toISOString()
            });
          }}
        />
      </View>

      {/* Analytics Section - Phase 4.5 */}
      {workoutHistory.length > 0 && (
        <>
          {/* Volume Trend */}
          <View style={styles.section}>
            <Card style={[styles.card, { backgroundColor: colors.card }]}>
              <Card.Content>
                <View style={styles.titleWithIcon}>
                  <MaterialCommunityIcons name="chart-line" size={24} color={colors.text} />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Volume Trends
                  </Text>
                </View>
                <VolumeTrendChart workoutHistory={volumeTrendData} />
              </Card.Content>
            </Card>
          </View>

          {/* Intensity Distribution */}
          {latestWorkoutAnalytics && (
            <View style={styles.section}>
              <Card style={[styles.card, { backgroundColor: colors.card }]}>
                <Card.Content>
                  <View style={styles.titleWithIcon}>
                    <MaterialCommunityIcons name="lightning-bolt" size={24} color={colors.text} />
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      Intensity Distribution
                    </Text>
                  </View>
                  <Text style={[styles.emptyText, { color: colors.textSecondary, marginBottom: 12 }]}>
                    Last Workout (Week {workoutHistory[0]?.weekNumber} Day {workoutHistory[0]?.dayNumber})
                  </Text>
                  <IntensityDistributionChart intensityData={latestWorkoutAnalytics.intensity} />
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Body Part Balance */}
          {latestWorkoutAnalytics && (
            <View style={styles.section}>
              <View style={styles.titleWithIcon}>
                <MaterialCommunityIcons name="arm-flex" size={24} color={colors.text} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Muscle Balance
                </Text>
              </View>
              <BodyPartBalanceCard
                balanceData={latestWorkoutAnalytics.bodyPartBalance}
                showRecommendations={true}
              />
            </View>
          )}

          {/* Time Under Tension Stats */}
          {latestWorkoutAnalytics && latestWorkoutAnalytics.timeUnderTension.totalWorkoutTime > 0 && (
            <View style={styles.section}>
              <Card style={[styles.card, { backgroundColor: colors.card }]}>
                <Card.Content>
                  <View style={styles.titleWithIcon}>
                    <MaterialCommunityIcons name="timer" size={24} color={colors.text} />
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      Workout Metrics
                    </Text>
                  </View>
                  <View style={styles.achievementRow}>
                    <View style={styles.achievementItem}>
                      <AchievementCard
                        title="Duration"
                        value={`${Math.round(latestWorkoutAnalytics.timeUnderTension.totalWorkoutTime / 60)}`}
                        icon="timer"
                        color="blue"
                        subtitle="minutes"
                      />
                    </View>
                    <View style={styles.achievementItem}>
                      <AchievementCard
                        title="Quality Time"
                        value={`${latestWorkoutAnalytics.timeUnderTension.qualityMinutes}`}
                        icon="target"
                        color="green"
                        subtitle="work mins"
                      />
                    </View>
                  </View>
                  <View style={styles.achievementRow}>
                    <View style={styles.achievementItem}>
                      <AchievementCard
                        title="Efficiency"
                        value={`${latestWorkoutAnalytics.timeUnderTension.efficiency}`}
                        icon="lightning-bolt"
                        color="gold"
                        subtitle="score"
                      />
                    </View>
                    <View style={styles.achievementItem}>
                      <AchievementCard
                        title="Avg Intensity"
                        value={`${latestWorkoutAnalytics.intensity.averageIntensity}%`}
                        icon="fire"
                        color="bronze"
                        subtitle="intensity"
                      />
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}
        </>
      )}

      {/* Body Weight Section */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.titleWithIcon}>
              <MaterialCommunityIcons name="chart-bar" size={24} color={colors.text} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Body Weight Tracking
              </Text>
            </View>
            {currentWeight > 0 ? (
              <View style={styles.weightDisplay}>
                <Text style={[styles.currentWeightLabel, { color: colors.textSecondary }]}>
                  Current Weight
                </Text>
                <Text style={[styles.currentWeightValue, { color: colors.text }]}>
                  {currentWeight} lbs
                </Text>
                <Text style={[styles.weightHistory, { color: colors.textSecondary }]}>
                  {bodyWeights.length} measurements recorded
                </Text>
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No weight measurements yet. Start tracking your progress!
              </Text>
            )}
            <GameButton
              onPress={handleLogWeight}
              variant="primary"
              size="medium"
              icon="scale-bathroom"
            >
              Log Body Weight
            </GameButton>
          </Card.Content>
        </Card>
      </View>

      {/* Personal Records */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.titleWithIcon}>
                <MaterialCommunityIcons name="trophy" size={24} color={colors.text} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Personal Records
                </Text>
              </View>
              <GameButton
                onPress={() => navigation.navigate('Profile', { screen: 'MaxLifts' })}
                variant="secondary"
                size="small"
              >
                View All
              </GameButton>
            </View>
            {personalRecords.slice(0, 5).map((pr, idx) => (
              <View key={pr.id || idx} style={[styles.prItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.prName, { color: colors.text }]}>
                  {pr.exerciseId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>
                <Text style={[styles.prValue, { color: '#FFD700' }]}>
                  ⭐ {pr.value} {pr.recordType === 'volume' ? 'lbs' : 'reps'}
                </Text>
              </View>
            ))}
            {personalRecords.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No personal records yet. Keep pushing!
              </Text>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.titleWithIcon}>
              <MaterialCommunityIcons name="calendar" size={24} color={colors.text} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Recent Workouts
              </Text>
            </View>
            {workoutHistory.slice(0, 5).map((workout, idx) => (
              <View key={workout.id || idx} style={[styles.workoutItem, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.workoutTitle, { color: colors.text }]}>
                    Week {workout.weekNumber} - Day {workout.dayNumber}
                  </Text>
                  <Text style={[styles.workoutDate, { color: colors.textSecondary }]}>
                    {new Date(workout.completedAt || Date.now()).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.workoutDuration, { color: colors.primary }]}>
                  {Math.round(((workout.completedAt || 0) - (workout.startedAt || 0)) / 60000)} min
                </Text>
              </View>
            ))}
            {workoutHistory.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No workouts completed yet. Start your first session!
              </Text>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Weight Logging Modal */}
      <Modal
        visible={showWeightModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Log Body Weight
            </Text>
            <TextInput
              style={[styles.weightInput, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.primary,
              }]}
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="decimal-pad"
              placeholder="Enter weight (lbs)"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <GameButton
                onPress={() => setShowWeightModal(false)}
                variant="secondary"
                size="medium"
              >
                Cancel
              </GameButton>
              <GameButton
                onPress={handleSaveWeight}
                variant="success"
                size="medium"
              >
                Save
              </GameButton>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  greeting: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  userName: {
    ...typography.display,
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    minWidth: 70,
  },
  levelNumber: {
    ...typography.display,
    fontSize: 24,
    color: '#FFFFFF',
  },
  levelLabel: {
    ...typography.labelSmall,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  xpContainer: {
    marginTop: spacing.sm,
  },
  xpBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: borderRadius.sm,
  },
  xpText: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  statsSection: {
    padding: spacing.base,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.base,
    letterSpacing: -0.3,
  },
  achievementsGrid: {
    gap: spacing.md,
  },
  achievementRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  achievementItem: {
    flex: 1,
  },
  section: {
    padding: spacing.base,
    paddingTop: 0,
  },
  badgesScroll: {
    marginTop: spacing.sm,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: spacing.base,
    width: 80,
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeName: {
    ...typography.bodySmall,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 18,
    marginBottom: spacing.base,
    letterSpacing: -0.2,
  },
  weightDisplay: {
    alignItems: 'center',
    paddingVertical: spacing.base,
  },
  currentWeightLabel: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  currentWeightValue: {
    ...typography.display,
    fontSize: 40,
  },
  weightHistory: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
    marginBottom: spacing.base,
  },
  prItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  prName: {
    ...typography.body,
    fontWeight: '500',
    flex: 1,
  },
  prValue: {
    ...typography.h3,
    fontSize: 17,
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  workoutTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  workoutDate: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  workoutDuration: {
    ...typography.body,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.lg,
  },
  modalTitle: {
    ...typography.h2,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  weightInput: {
    height: components.input.height,
    borderWidth: 2,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    ...typography.h1,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bottomSpacing: {
    height: spacing['2xl'],
  },
});
