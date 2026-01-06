/**
 * Profile Screen
 * 
 * User profile with stats, settings access, and app information.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List } from 'react-native-paper';
import { useAppSelector } from '../../store/store';

export default function ProfileScreen() {
  const user = useAppSelector((state) => state.user.currentUser);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.avatar}>
          👤
        </Text>
        <Text variant="headlineMedium" style={styles.name}>
          {user?.name || 'User'}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            📊 Current Stats
          </Text>
          <View style={styles.statRow}>
            <Text variant="bodyLarge">Current Week:</Text>
            <Text variant="titleMedium">Week {user?.currentWeek || 1}</Text>
          </View>
          <View style={styles.statRow}>
            <Text variant="bodyLarge">Experience:</Text>
            <Text variant="titleMedium">
              {user?.experienceLevel === 'beginner' ? 'Beginner' : 'Moderate'}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text variant="bodyLarge">Body Weight:</Text>
            <Text variant="titleMedium">185 lbs</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <List.Item
          title="My Max Lifts"
          description="View and manage your maximum lift records"
          left={(props) => <List.Icon {...props} icon="weight-lifter" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <List.Item
          title="Settings"
          description="Preferences, notifications, and more"
          left={(props) => <List.Icon {...props} icon="cog" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <List.Item
          title="Export Data"
          description="Download your workout history"
          left={(props) => <List.Icon {...props} icon="download" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <List.Item
          title="About"
          description="Learn about the program"
          left={(props) => <List.Icon {...props} icon="information" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
      </Card>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.version}>
          Version 0.1.0 (Pre-Alpha)
        </Text>
      </View>
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    fontSize: 64,
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  version: {
    color: '#9CA3AF',
  },
});
