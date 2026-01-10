/**
 * IntensityBadge Component - Modern 2024 Design
 *
 * Clean badge showing workout intensity with design system colors
 * Based on extracted formulas: 35% (warmup), 80% (working), 90% (heavy), 100% (max)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors as designColors, spacing, typography, borderRadius } from '../../theme/designTokens';

interface IntensityBadgeProps {
  percentage: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function IntensityBadge({
  percentage,
  size = 'medium',
  showLabel = true
}: IntensityBadgeProps) {
  const pct = Math.round(percentage * 100);
  
  const getIntensityConfig = () => {
    if (percentage <= 0.35) {
      return {
        color: designColors.intensity.warmup,
        backgroundColor: designColors.intensity.warmup + '20',
        label: 'WARMUP',
        emoji: '🟡',
      };
    } else if (percentage <= 0.65) {
      return {
        color: designColors.intensity.light,
        backgroundColor: designColors.intensity.light + '20',
        label: 'LIGHT',
        emoji: '🟢',
      };
    } else if (percentage <= 0.85) {
      return {
        color: designColors.intensity.moderate,
        backgroundColor: designColors.intensity.moderate + '20',
        label: 'HEAVY',
        emoji: '🟠',
      };
    } else {
      return {
        color: designColors.intensity.heavy,
        backgroundColor: designColors.intensity.heavy + '20',
        label: 'MAX',
        emoji: '🔴',
      };
    }
  };

  const config = getIntensityConfig();
  const sizeConfig = {
    small: { height: 24, fontSize: 11, paddingHorizontal: spacing.sm },
    medium: { height: 28, fontSize: 12, paddingHorizontal: spacing.md },
    large: { height: 32, fontSize: 13, paddingHorizontal: spacing.base },
  };

  const dimensions = sizeConfig[size];

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: config.backgroundColor,
        borderColor: config.color,
        height: dimensions.height,
        paddingHorizontal: dimensions.paddingHorizontal,
      }
    ]}>
      {showLabel && size !== 'small' && (
        <Text style={styles.emoji}>
          {config.emoji}
        </Text>
      )}
      <Text style={[
        styles.percentage,
        { fontSize: dimensions.fontSize, color: config.color }
      ]}>
        {pct}%
      </Text>
      {showLabel && size === 'large' && (
        <Text style={[styles.label, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 10,
  },
  percentage: {
    ...typography.labelSmall,
    fontWeight: '700',
  },
  label: {
    ...typography.labelSmall,
    fontSize: 10,
  },
});
