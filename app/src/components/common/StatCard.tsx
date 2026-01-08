/**
 * StatCard Component
 *
 * Displays a statistic with label, value, and optional icon/trend
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useThemeColors from '../../utils/useThemeColors';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
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
  const colors = useThemeColors();
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getTrendIconName = (): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'minus';
    }
  };

  const styles = StyleSheet.create({
    card: {
      flex: 1,
      margin: 8,
      backgroundColor: colors.card,
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
      color: colors.textSecondary,
      textTransform: 'uppercase',
      fontSize: 12,
      fontWeight: '600',
    },
    value: {
      color: colors.text,
      fontWeight: 'bold',
      marginVertical: 4,
    },
    trendContainer: {
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    trendText: {
      fontSize: 13,
      fontWeight: '600',
    },
  });

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          {icon && <MaterialCommunityIcons name={icon} size={20} color={colors.textSecondary} style={{marginRight: 8}} />}
          <Text variant="bodyMedium" style={styles.label}>
            {label}
          </Text>
        </View>
        
        <Text variant="headlineMedium" style={styles.value}>
          {value}
        </Text>
        
        {trend && trendValue && (
          <View style={styles.trendContainer}>
            <MaterialCommunityIcons name={getTrendIconName()} size={16} color={getTrendColor()} />
            <Text style={[styles.trendText, { color: getTrendColor(), marginLeft: 4 }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}
