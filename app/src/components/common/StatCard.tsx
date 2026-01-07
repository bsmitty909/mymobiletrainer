/**
 * StatCard Component
 * 
 * Displays a statistic with label, value, and optional icon/trend
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onPress?: () => void;
}

export default function StatCard({ 
  label, 
  value, 
  icon, 
  trend, 
  trendValue,
  onPress 
}: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#10B981'; // Green
      case 'down':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '—';
    }
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text variant="bodyMedium" style={styles.label}>
            {label}
          </Text>
        </View>
        
        <Text variant="headlineMedium" style={styles.value}>
          {value}
        </Text>
        
        {trend && trendValue && (
          <View style={styles.trendContainer}>
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {getTrendIcon()} {trendValue}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 120,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  label: {
    color: '#6B7280',
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginVertical: 4,
  },
  trendContainer: {
    marginTop: 4,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
