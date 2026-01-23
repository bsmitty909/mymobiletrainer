/**
 * Weekly Progress Screen
 * 
 * Displays detailed progression tracking:
 * - Week-over-week strength gains
 * - 4RM progression charts
 * - Milestone achievement badges
 * - Max attempt history and success rates
 * - Best lifts in last 30 days
 * - Comparison to program baseline
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '../../store/store';
import useThemeColors from '../../utils/useThemeColors';
import ProgressionService from '../../services/ProgressionService';
import ProgressionHistoryChart from '../../components/charts/ProgressionHistoryChart';
import MilestoneBadge, { getMilestoneBadgeProps } from '../../components/common/MilestoneBadge';
import GameButton from '../../components/common/GameButton';
import { WeeklyMax, MaxAttemptHistory } from '../../types/enhanced';

const CORE_EXERCISES = [
  { id: 'bench-press', name: 'Bench Press', icon: 'weight-lifter' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', icon: 'arm-flex' },
  { id: 'leg-press', name: 'Leg Press', icon: 'human-handsup' },
  { id: 'shoulder-press', name: 'Shoulder Press', icon: 'dumbbell' },
  { id: 'squat', name: 'Squat', icon: 'run' },
];

export default function WeeklyProgressScreen({ navigation }: any) {
  const colors = useThemeColors();
  const [selectedExercise, setSelectedExercise] = useState(CORE_EXERCISES[0].id);
  
  // Get data from Redux (in a real app, this would come from the database)
  const weeklyMaxes = useAppSelector((state) => (state.progress as any).weeklyMaxes || []) as WeeklyMax[];
  const maxAttemptHistory = useAppSelector((state) => (state.progress as any).maxAttemptHistory || []) as MaxAttemptHistory[];
  const currentUser = useAppSelector((state) => state.user.currentUser);

  // Calculate progression summary for all exercises
  const progressSummary = useMemo(() => {
    return ProgressionService.getWeeklyProgressSummary(
      weeklyMaxes,
      CORE_EXERCISES.map(e => e.id)
    );
  }, [weeklyMaxes]);

  // Get data for selected exercise
  const selectedExerciseData = useMemo(() => {
    const progression = ProgressionService.calculateWeeklyProgression(weeklyMaxes, selectedExercise);
    const totalGains = ProgressionService.calculateTotalStrengthGain(weeklyMaxes, selectedExercise);
    const history = ProgressionService.getProgressionHistory(weeklyMaxes, selectedExercise, 12);
    const milestones = ProgressionService.getMilestoneAchievements(weeklyMaxes, selectedExercise);
    
    return { progression, totalGains, history, milestones };
  }, [weeklyMaxes, selectedExercise]);

  // Calculate max attempt stats
  const maxAttemptStats = useMemo(() => {
    return ProgressionService.calculateMaxAttemptSuccessRate(maxAttemptHistory);
  }, [maxAttemptHistory]);

  // Get best lifts in last 30 days
  const bestLifts = useMemo(() => {
    return ProgressionService.getBestLiftsInPeriod(maxAttemptHistory, 30);
  }, [maxAttemptHistory]);

  // Compare to baseline
  const baselineComparison = useMemo(() => {
    return ProgressionService.compareToBaseline(
      weeklyMaxes,
      CORE_EXERCISES.map(e => e.id)
    );
  }, [weeklyMaxes]);

  const selectedExerciseName = CORE_EXERCISES.find(e => e.id === selectedExercise)?.name || 'Exercise';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD', colors.primary + 'AA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Weekly Progress</Text>
            <Text style={styles.headerSubtitle}>Track your strength gains</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Overall Stats Summary */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.titleWithIcon}>
              <MaterialCommunityIcons name="arm-flex" size={24} color={colors.text} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Overall Progress
              </Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  +{baselineComparison.overallGain}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total lbs Gained
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  {baselineComparison.overallGainPercentage}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Strength Increase
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Exercise Selector */}
      <View style={styles.section}>
        <View style={[styles.titleWithIcon, { paddingHorizontal: 16 }]}>
          <MaterialCommunityIcons name="chart-line" size={24} color={colors.text} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Select Exercise
          </Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.exerciseSelectorContainer}
        >
          {CORE_EXERCISES.map((exercise) => {
            const isSelected = exercise.id === selectedExercise;
            const exerciseData = progressSummary.find(p => p.exerciseId === exercise.id);
            
            return (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => setSelectedExercise(exercise.id)}
                style={[
                  styles.exerciseCard,
                  { 
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }
                ]}
              >
                <MaterialCommunityIcons
                  name={(exercise.icon || "dumbbell") as any}
                  size={32}
                  color={isSelected ? '#FFF' : colors.text}
                  style={styles.exerciseIconStyle}
                />
                <Text style={[
                  styles.exerciseName,
                  { color: isSelected ? '#FFF' : colors.text }
                ]}>
                  {exercise.name}
                </Text>
                {exerciseData && (
                  <View style={styles.exerciseStats}>
                    <Text style={[
                      styles.exerciseStat,
                      { color: isSelected ? 'rgba(255,255,255,0.9)' : colors.textSecondary }
                    ]}>
                      {exerciseData.currentMax} lbs
                    </Text>
                    <Text style={[
                      styles.exerciseChange,
                      { 
                        color: exerciseData.weeklyChange >= 0 
                          ? (isSelected ? '#A7F3D0' : '#10B981')
                          : (isSelected ? '#FECACA' : '#EF4444')
                      }
                    ]}>
                      {exerciseData.weeklyChange >= 0 ? '↑' : '↓'} {Math.abs(exerciseData.weeklyChange)} lbs
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Progression Chart */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.titleWithIcon}>
              <MaterialCommunityIcons name="chart-bar" size={24} color={colors.text} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Progression History
              </Text>
            </View>
            <ProgressionHistoryChart
              progressionData={selectedExerciseData.history}
              exerciseName={selectedExerciseName}
            />
          </Card.Content>
        </Card>
      </View>

      {/* Weekly Progression Details */}
      {selectedExerciseData.progression && (
        <View style={styles.section}>
          <Card style={[styles.card, { backgroundColor: colors.card }]}>
            <Card.Content>
              <View style={styles.titleWithIcon}>
                <MaterialCommunityIcons name="fire" size={24} color={colors.text} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  This Week vs Last Week
                </Text>
              </View>
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonItem}>
                  <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>
                    Last Week
                  </Text>
                  <Text style={[styles.comparisonValue, { color: colors.text }]}>
                    {selectedExerciseData.progression.previousMax} lbs
                  </Text>
                </View>
                <MaterialCommunityIcons 
                  name="arrow-right" 
                  size={32} 
                  color={selectedExerciseData.progression.progression >= 0 ? '#10B981' : '#EF4444'} 
                />
                <View style={styles.comparisonItem}>
                  <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>
                    This Week
                  </Text>
                  <Text style={[styles.comparisonValue, { color: colors.text }]}>
                    {selectedExerciseData.progression.currentMax} lbs
                  </Text>
                </View>
              </View>
              <View style={styles.progressionBadge}>
                <Text style={[
                  styles.progressionText,
                  { 
                    color: selectedExerciseData.progression.progression >= 0 
                      ? '#10B981' 
                      : '#EF4444'
                  }
                ]}>
                  {selectedExerciseData.progression.progression >= 0 ? '+' : ''}
                  {selectedExerciseData.progression.progression} lbs 
                  ({selectedExerciseData.progression.progression >= 0 ? '+' : ''}
                  {selectedExerciseData.progression.progressionPercentage}%)
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Milestone Badges */}
      {selectedExerciseData.totalGains && selectedExerciseData.totalGains.totalGain >= 10 && (
        <View style={styles.section}>
          <Card style={[styles.card, { backgroundColor: colors.card }]}>
            <Card.Content>
              <View style={styles.titleWithIcon}>
                <MaterialCommunityIcons name="trophy" size={24} color={colors.text} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Milestone Achievements
                </Text>
              </View>
              <View style={styles.badgesContainer}>
                {[100, 50, 25, 10].map((threshold) => {
                  const gained = selectedExerciseData.totalGains!.totalGain;
                  const badgeProps = getMilestoneBadgeProps(threshold);
                  const isEarned = gained >= threshold;
                  
                  if (!badgeProps) return null;
                  
                  return (
                    <MilestoneBadge
                      key={threshold}
                      {...badgeProps}
                      earnedAt={isEarned ? new Date() : undefined}
                      size="medium"
                    />
                  );
                })}
              </View>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Max Attempt Success Rate */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.titleWithIcon}>
              <MaterialCommunityIcons name="target" size={24} color={colors.text} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Max Attempt Success Rate
              </Text>
            </View>
            <View style={styles.successRateContainer}>
              <View style={styles.successRateCircle}>
                <Text style={[styles.successRateValue, { color: colors.primary }]}>
                  {maxAttemptStats.successRate}%
                </Text>
                <Text style={[styles.successRateLabel, { color: colors.textSecondary }]}>
                  Success Rate
                </Text>
              </View>
              <View style={styles.successRateStats}>
                <View style={styles.successRateStat}>
                  <Text style={[styles.successRateStatValue, { color: '#10B981' }]}>
                    ✓ {maxAttemptStats.successfulAttempts}
                  </Text>
                  <Text style={[styles.successRateStatLabel, { color: colors.textSecondary }]}>
                    Successful
                  </Text>
                </View>
                <View style={styles.successRateStat}>
                  <Text style={[styles.successRateStatValue, { color: '#EF4444' }]}>
                    ✗ {maxAttemptStats.failedAttempts}
                  </Text>
                  <Text style={[styles.successRateStatLabel, { color: colors.textSecondary }]}>
                    Failed
                  </Text>
                </View>
                <View style={styles.successRateStat}>
                  <Text style={[styles.successRateStatValue, { color: colors.text }]}>
                    {maxAttemptStats.totalAttempts}
                  </Text>
                  <Text style={[styles.successRateStatLabel, { color: colors.textSecondary }]}>
                    Total
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Best Lifts Last 30 Days */}
      {bestLifts.length > 0 && (
        <View style={styles.section}>
          <Card style={[styles.card, { backgroundColor: colors.card }]}>
            <Card.Content>
              <View style={styles.titleWithIcon}>
                <MaterialCommunityIcons name="star" size={24} color={colors.text} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Best Lifts (Last 30 Days)
                </Text>
              </View>
              {bestLifts.map((lift) => {
                const exercise = CORE_EXERCISES.find(e => e.id === lift.exerciseId);
                return (
                  <View key={lift.exerciseId} style={[styles.bestLiftRow, { borderBottomColor: colors.border }]}>
                    <MaterialCommunityIcons
                      name={(exercise?.icon || "arm-flex") as any}
                      size={28}
                      color={colors.text}
                      style={styles.bestLiftIconStyle}
                    />
                    <View style={styles.bestLiftInfo}>
                      <Text style={[styles.bestLiftName, { color: colors.text }]}>
                        {exercise?.name || lift.exerciseId}
                      </Text>
                      <Text style={[styles.bestLiftDate, { color: colors.textSecondary }]}>
                        {lift.date.toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.bestLiftWeight}>
                      <Text style={[styles.bestLiftValue, { color: colors.primary }]}>
                        {lift.weight} lbs
                      </Text>
                      <Text style={[styles.bestLiftReps, { color: colors.textSecondary }]}>
                        {lift.reps} {lift.reps === 1 ? 'rep' : 'reps'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        </View>
      )}

      {/* All Exercises Summary */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.titleWithIcon}>
              <MaterialCommunityIcons name="clipboard-text" size={24} color={colors.text} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                All Exercises Progress
              </Text>
            </View>
            {progressSummary.map((exercise) => {
              const exerciseInfo = CORE_EXERCISES.find(e => e.id === exercise.exerciseId);
              return (
                <TouchableOpacity
                  key={exercise.exerciseId}
                  onPress={() => setSelectedExercise(exercise.exerciseId)}
                  style={[styles.summaryRow, { borderBottomColor: colors.border }]}
                >
                  <MaterialCommunityIcons
                    name={"dumbbell" as any}
                    size={24}
                    color={colors.text}
                    style={styles.summaryIconStyle}
                  />
                  <View style={styles.summaryInfo}>
                    <Text style={[styles.summaryName, { color: colors.text }]}>
                      {exercise.exerciseName}
                    </Text>
                    <Text style={[styles.summaryDetail, { color: colors.textSecondary }]}>
                      Total: +{exercise.totalGain} lbs
                    </Text>
                  </View>
                  <View style={styles.summaryStats}>
                    <Text style={[styles.summaryMax, { color: colors.text }]}>
                      {exercise.currentMax} lbs
                    </Text>
                    <Text style={[
                      styles.summaryChange,
                      { color: exercise.weeklyChange >= 0 ? '#10B981' : '#EF4444' }
                    ]}>
                      {exercise.trendDirection === 'up' && '↑'}
                      {exercise.trendDirection === 'down' && '↓'}
                      {exercise.trendDirection === 'stable' && '→'}
                      {' '}{Math.abs(exercise.weeklyChange)} lbs
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Card.Content>
        </Card>
      </View>

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
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 0,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  exerciseSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  exerciseCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 140,
    alignItems: 'center',
  },
  exerciseIconStyle: {
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  exerciseStats: {
    alignItems: 'center',
    marginTop: 4,
  },
  exerciseStat: {
    fontSize: 16,
    fontWeight: '700',
  },
  exerciseChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  progressionBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  progressionText: {
    fontSize: 18,
    fontWeight: '900',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  successRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  successRateCircle: {
    alignItems: 'center',
  },
  successRateValue: {
    fontSize: 48,
    fontWeight: '900',
  },
  successRateLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  successRateStats: {
    gap: 16,
  },
  successRateStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successRateStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  successRateStatLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  bestLiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  bestLiftIconStyle: {
    marginRight: 12,
  },
  bestLiftInfo: {
    flex: 1,
  },
  bestLiftName: {
    fontSize: 16,
    fontWeight: '700',
  },
  bestLiftDate: {
    fontSize: 12,
    marginTop: 2,
  },
  bestLiftWeight: {
    alignItems: 'flex-end',
  },
  bestLiftValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  bestLiftReps: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  summaryIconStyle: {
    marginRight: 12,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryName: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryStats: {
    alignItems: 'flex-end',
  },
  summaryMax: {
    fontSize: 16,
    fontWeight: '900',
  },
  summaryChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 32,
  },
});
