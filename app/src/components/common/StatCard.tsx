/**
 * StatCard Component - Modern 2024 Design
 *
 * Clean stat display card with modern styling and proper hierarchy
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';
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
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };
  
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
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      minHeight: 110,
      justifyContent: 'space-between',
      ...shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    label: {
      ...typography.label,
      fontSize: 11,
      color: colors.textSecondary,
    },
    value: {
      ...typography.display,
      fontSize: 32,
      color: colors.text,
      marginVertical: spacing.xs,
    },
    trendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    trendText: {
      ...typography.bodySmall,
      fontSize: 12,
      fontWeight: '600',
      marginLeft: spacing.xs,
    },
  });

  const CardContent = (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={colors.textSecondary}
            style={{ marginRight: spacing.sm }}
          />
        )}
        <Text style={styles.label}>
          {label}
        </Text>
      </View>
      
      <Text style={styles.value}>
        {value}
      </Text>
      
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <MaterialCommunityIcons
            name={getTrendIconName()}
            size={14}
            color={getTrendColor()}
          />
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {trendValue}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.95}
        >
          {CardContent}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return CardContent;
}
