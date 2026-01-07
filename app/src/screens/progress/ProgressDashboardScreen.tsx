/**
 * Progress Dashboard Screen
 * 
 * Shows user's progress, PRs, body weight trends, and workout history.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useAppSelector } from '../../store/store';
import StatCard from '../../components/common/StatCard';
import BodyWeightChart from '../../components/charts/BodyWeightChart';
import VolumeTrendChart from '../../components/charts/VolumeTrendChart';

export default function ProgressDashboardScreen({ navigation }: any) {
  const user = useAppSelector((state) => state.user.currentUser);
  const workoutHistory = useAppSelector((state) => state.progress.workoutHistory) || [];
  const bodyWeights = useAppSelector((state) => state.progress.bodyWeights) || [];
  const userProfile = useAppSelector((state) => state.user.profile);
  const maxLifts = userProfile?.maxLifts || {};

  const totalWorkouts = workoutHistory?.length || 0;
  const currentStreak = 3; // TODO: Calculate from workout history
  const totalVolume = workoutHistory?.reduce((sum, w) => sum + (w.totalVolume || 0), 0) || 0;

  // Prepare workout history for chart
  const workoutChartData = workoutHistory?.map(w => ({
    date: w.completedAt || Date.now(),
    totalVolume: w.totalVolume || 0,
    weekNumber: w.weekNumber,
    dayNumber: w.dayNumber,
  })) || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Progress
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track your strength journey
        </Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Total Workouts"
          value={totalWorkouts}
          icon="🏋️"
          trend="up"
          trendValue={`+${totalWorkouts > 0 ? 1 : 0} this week`}
        />
        <StatCard
          label="Current Streak"
          value={`${currentStreak} days`}
          icon="🔥"
          trend="neutral"
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label="Total Volume"
          value={`${Math.round(totalVolume / 1000)}k`}
          icon="💪"
          trend="up"
          trendValue="+12% vs last week"
        />
        <StatCard
          label="PRs This Month"
          value={Object.keys(maxLifts).length}
          icon="🏆"
          trend="up"
          trendValue={`${Object.keys(maxLifts).length} personal records`}
        />
      </View>

      {/* Body Weight Trend */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            📈 Body Weight Trend
          </Text>
          <Text variant="bodyLarge" style={styles.placeholder}>
            Chart will display here
          </Text>
          <Text variant="bodyMedium" style={styles.currentWeight}>
            Current: 185 lbs
          </Text>
          <Button mode="outlined" style={styles.addWeightButton}>
            Log Body Weight
          </Button>
        </Card.Content>
      </Card>

      {/* Personal Records */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              🏆 Personal Records
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Profile', { screen: 'MaxLifts' })}
            >
              View All
            </Button>
          </View>
          <View style={styles.prList}>
            {Object.values(maxLifts).slice(0, 3).map((max: any) => (
              <View key={max.id} style={styles.prItem}>
                <Text variant="bodyLarge">
                  {max.exerciseId.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>
                <Text variant="titleMedium" style={styles.prValue}>
                  {max.weight} lbs
                </Text>
              </View>
            ))}
            {Object.keys(maxLifts).length === 0 && (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No PRs yet. Complete your first max week!
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Recent Workouts */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            📅 Recent Workouts
          </Text>
          {workoutHistory.slice(0, 5).map((workout, idx) => (
            <View key={idx} style={styles.workoutItem}>
              <View>
                <Text variant="bodyLarge">
                  Week {workout.weekNumber} - Day {workout.dayNumber}
                </Text>
                <Text variant="bodySmall" style={styles.workoutDate}>
                  {new Date(workout.completedAt).toLocaleDateString()}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.workoutDuration}>
                {Math.round((workout.duration || 0) / 60)} min
              </Text>
            </View>
          ))}
          {workoutHistory.length === 0 && (
            <Text variant="bodyMedium" style={styles.emptyText}>
              No workouts yet. Start your first session!
            </Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  placeholder: {
    textAlign: 'center',
    padding: 32,
    color: '#9CA3AF',
  },
  currentWeight: {
    textAlign: 'center',
    marginTop: 8,
  },
  prList: {
    gap: 12,
  },
  prItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
});
