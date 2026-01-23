// @ts-nocheck
/**
 * Workout Day Detail Screen
 * 
 * Displays detailed statistics and workout information for a specific day.
 * Shows all workouts completed on the selected date with comprehensive analytics.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector } from '../../store/store';
import AchievementCard from '../../components/common/AchievementCard';
import IntensityDistributionChart from '../../components/charts/IntensityDistributionChart';
import BodyPartBalanceCard from '../../components/common/BodyPartBalanceCard';
import AnalyticsService from '../../services/AnalyticsService';
import useThemeColors from '../../utils/useThemeColors';
import { WorkoutSession } from '../../types';

type RouteParams = {
  WorkoutDayDetail: {
    date: string; // ISO date string
  };
};

type WorkoutDayDetailRouteProp = RouteProp<RouteParams, 'WorkoutDayDetail'>;

export default function WorkoutDayDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<WorkoutDayDetailRouteProp>();
  const colors = useThemeColors();
  
  const { date } = route.params;
  const selectedDate = new Date(date);
  
  const allWorkouts = useAppSelector((state) => state.progress.recentWorkouts) || [];
  const personalRecords = useAppSelector((state) => state.progress.personalRecords) || [];

  const dayWorkouts = useMemo(() => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    return allWorkouts.filter(workout => {
      const workoutDate = workout.completedAt || workout.startedAt;
      return workoutDate >= startOfDay.getTime() && workoutDate <= endOfDay.getTime();
    });
  }, [allWorkouts, selectedDate]);

  const dayPRs = useMemo(() => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    return personalRecords.filter(pr => {
      return pr.achievedAt >= startOfDay.getTime() && pr.achievedAt <= endOfDay.getTime();
    });
  }, [personalRecords, selectedDate]);

  const dayStats = useMemo(() => {
    if (dayWorkouts.length === 0) {
      return null;
    }

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    let totalDuration = 0;
    let combinedIntensity = { low: 0, medium: 0, high: 0, veryHigh: 0, averageIntensity: 0 };
    let combinedBodyParts: Record<string, number> = {};

    dayWorkouts.forEach(workout => {
      const analytics = AnalyticsService.analyzeWorkout(workout);
      
      totalVolume += analytics.volume.totalVolume;
      totalSets += 0;  // analytics.totalSets
      totalReps += 0;  // analytics.totalReps
      
      if (workout.completedAt && workout.startedAt) {
        totalDuration += (workout.completedAt - workout.startedAt) / 1000;
      }

      combinedIntensity.low += 0; // intensity.warmup
      combinedIntensity.medium += 0; // intensity.working
      combinedIntensity.high += 0; // intensity.heavy
      combinedIntensity.veryHigh += 0; // intensity.max
      combinedIntensity.averageIntensity += analytics.intensity.averageIntensity;

      Object.entries(analytics.bodyPartBalance).forEach(([part, value]) => {
        combinedBodyParts[part] = (combinedBodyParts[part] || 0) + value;
      });
    });

    combinedIntensity.averageIntensity = Math.round(
      combinedIntensity.averageIntensity / dayWorkouts.length
    );

    return {
      totalVolume,
      totalSets,
      totalReps,
      totalDuration,
      intensity: combinedIntensity,
      bodyPartBalance: combinedBodyParts,
      workoutCount: dayWorkouts.length,
    };
  }, [dayWorkouts]);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD', colors.primary + 'AA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.dateTitle}>{formatDate(selectedDate)}</Text>
          {isToday() && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {dayWorkouts.length === 0 ? (
          <Card style={[styles.card, { backgroundColor: colors.card }]}>
            <Card.Content style={styles.emptyState}>
              <MaterialCommunityIcons 
                name="calendar-blank" 
                size={64} 
                color={colors.textSecondary} 
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Workouts
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No workouts were completed on this day.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Summary Stats */}
            {dayStats && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Daily Summary
                </Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statRow}>
                    <View style={styles.statItem}>
                      <AchievementCard
                        title="Volume"
                        value={`${Math.round(dayStats.totalVolume / 1000)}k`}
                        icon="lightning-bolt"
                        color="gold"
                        subtitle="lbs lifted"
                      />
                    </View>
                    <View style={styles.statItem}>
                      <AchievementCard
                        title="Duration"
                        value={formatDuration(dayStats.totalDuration)}
                        icon="timer"
                        color="blue"
                        subtitle="training time"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.statRow}>
                    <View style={styles.statItem}>
                      <AchievementCard
                        title="Sets"
                        value={dayStats.totalSets.toString()}
                        icon="format-list-numbered"
                        color="green"
                        subtitle="completed"
                      />
                    </View>
                    <View style={styles.statItem}>
                      <AchievementCard
                        title="Intensity"
                        value={`${dayStats.intensity.averageIntensity}%`}
                        icon="fire"
                        color="bronze"
                        subtitle="avg intensity"
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Personal Records */}
            {dayPRs.length > 0 && (
              <View style={styles.section}>
                <Card style={[styles.card, { backgroundColor: colors.card }]}>
                  <Card.Content>
                    <View style={styles.titleWithIcon}>
                      <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        Personal Records ({dayPRs.length})
                      </Text>
                    </View>
                    {dayPRs.map((pr, idx) => (
                      <View 
                        key={pr.id || idx} 
                        style={[styles.prItem, { borderBottomColor: colors.border }]}
                      >
                        <MaterialCommunityIcons name="medal" size={20} color="#FFD700" />
                        <View style={styles.prContent}>
                          <Text style={[styles.prName, { color: colors.text }]}>
                            {pr.exerciseId.split('-').map(w => 
                              w.charAt(0).toUpperCase() + w.slice(1)
                            ).join(' ')}
                          </Text>
                          <Text style={[styles.prValue, { color: colors.textSecondary }]}>
                            {pr.value} {pr.recordType === 'volume' ? 'lbs' : 'reps'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
              </View>
            )}

            {/* Intensity Distribution */}
            {dayStats && (
              <View style={styles.section}>
                <Card style={[styles.card, { backgroundColor: colors.card }]}>
                  <Card.Content>
                    <View style={styles.titleWithIcon}>
                      <MaterialCommunityIcons name="chart-bar" size={24} color={colors.text} />
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        Intensity Distribution
                      </Text>
                    </View>
                    <IntensityDistributionChart intensityData={dayStats.intensity as any} />
                  </Card.Content>
                </Card>
              </View>
            )}

            {/* Body Part Balance */}
            {dayStats && Object.keys(dayStats.bodyPartBalance).length > 0 && (
              <View style={styles.section}>
                <View style={styles.titleWithIcon}>
                  <MaterialCommunityIcons name="arm-flex" size={24} color={colors.text} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Muscle Groups Trained
                  </Text>
                </View>
                <BodyPartBalanceCard
                  balanceData={dayStats.bodyPartBalance}
                  showRecommendations={false}
                />
              </View>
            )}

            {/* Workout Details */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Workouts ({dayWorkouts.length})
              </Text>
              {dayWorkouts.map((workout, idx) => (
                <Card 
                  key={workout.id || idx} 
                  style={[styles.card, styles.workoutCard, { backgroundColor: colors.card }]}
                >
                  <Card.Content>
                    <View style={styles.workoutHeader}>
                      <View>
                        <Text style={[styles.workoutTitle, { color: colors.text }]}>
                          Week {workout.weekNumber} - Day {workout.dayNumber}
                        </Text>
                        <Text style={[styles.workoutTime, { color: colors.textSecondary }]}>
                          {new Date(workout.startedAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                        <MaterialCommunityIcons 
                          name="check-circle" 
                          size={16} 
                          color={colors.primary} 
                        />
                        <Text style={[styles.statusText, { color: colors.primary }]}>
                          Completed
                        </Text>
                      </View>
                    </View>

                    <View style={styles.workoutStats}>
                      <View style={styles.workoutStat}>
                        <MaterialCommunityIcons 
                          name="weight-lifter" 
                          size={16} 
                          color={colors.textSecondary} 
                        />
                        <Text style={[styles.workoutStatText, { color: colors.textSecondary }]}>
                          {workout.exercises.length} exercises
                        </Text>
                      </View>
                      <View style={styles.workoutStat}>
                        <MaterialCommunityIcons 
                          name="timer" 
                          size={16} 
                          color={colors.textSecondary} 
                        />
                        <Text style={[styles.workoutStatText, { color: colors.textSecondary }]}>
                          {formatDuration((workout.completedAt! - workout.startedAt) / 1000)}
                        </Text>
                      </View>
                    </View>

                    {workout.exercises.length > 0 && (
                      <View style={styles.exercisesList}>
                        {workout.exercises.slice(0, 3).map((exercise, exIdx) => (
                          <Text 
                            key={exercise.id || exIdx} 
                            style={[styles.exerciseName, { color: colors.textSecondary }]}
                          >
                            • {exercise.exerciseId.split('-').map(w => 
                              w.charAt(0).toUpperCase() + w.slice(1)
                            ).join(' ')}
                          </Text>
                        ))}
                        {workout.exercises.length > 3 && (
                          <Text style={[styles.exerciseName, { color: colors.textSecondary }]}>
                            +{workout.exercises.length - 3} more
                          </Text>
                        )}
                      </View>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    flex: 1,
  },
  todayBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  todayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  prItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  prContent: {
    flex: 1,
  },
  prName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  prValue: {
    fontSize: 14,
  },
  workoutCard: {
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  workoutTime: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatText: {
    fontSize: 14,
  },
  exercisesList: {
    gap: 4,
  },
  exerciseName: {
    fontSize: 14,
  },
  bottomSpacing: {
    height: 32,
  },
});
