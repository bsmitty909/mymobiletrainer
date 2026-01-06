/**
 * Progress Dashboard Screen
 * 
 * Shows user's progress, PRs, body weight trends, and workout history.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useAppSelector } from '../../store/store';

export default function ProgressDashboardScreen() {
  const user = useAppSelector((state) => state.user.currentUser);
  const maxLifts = useAppSelector((state) => state.progress.maxLifts);
  const bodyWeights = useAppSelector((state) => state.progress.bodyWeights);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Progress
        </Text>
      </View>

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
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            🏆 Personal Records
          </Text>
          <View style={styles.prList}>
            <View style={styles.prItem}>
              <Text variant="bodyLarge">Bench Press</Text>
              <Text variant="titleMedium">255 lbs</Text>
            </View>
            <View style={styles.prItem}>
              <Text variant="bodyLarge">Lat Pull Down</Text>
              <Text variant="titleMedium">265 lbs</Text>
            </View>
            <View style={styles.prItem}>
              <Text variant="bodyLarge">Leg Press</Text>
              <Text variant="titleMedium">350 lbs</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            📅 Workout Calendar
          </Text>
          <Text variant="bodyMedium" style={styles.placeholder}>
            Calendar view coming soon
          </Text>
        </Card.Content>
      </Card>
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
