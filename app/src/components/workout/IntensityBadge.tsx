/**
 * IntensityBadge Component
 * 
 * Visual indicator showing the intensity percentage of a set
 * Based on extracted formulas: 35% (warmup), 80% (working), 90% (heavy), 100% (max)
 * 
 * Color coding:
 * - Green: ≤35% (warmup)
 * - Blue: 50-65% (moderate)
 * - Orange: 70-85% (heavy)
 * - Red: ≥90% (max effort)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface IntensityBadgeProps {
  percentage: number; // 0.35, 0.80, 0.90, 1.0, etc.
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function IntensityBadge({ 
  percentage, 
  size = 'medium',
  showLabel = true 
}: IntensityBadgeProps) {
  const pct = Math.round(percentage * 100);
  
  // Determine color and label based on intensity
  const getIntensityConfig = () => {
    if (percentage <= 0.35) {
      return {
        color: '#4CAF50',
        label: 'WARMUP',
        emoji: '🔥',
        textColor: '#fff'
      };
    } else if (percentage <= 0.65) {
      return {
        color: '#2196F3',
        label: 'MODERATE',
        emoji: '💪',
        textColor: '#fff'
      };
    } else if (percentage <= 0.85) {
      return {
        color: '#FF9800',
        label: 'HEAVY',
        emoji: '⚡',
        textColor: '#fff'
      };
    } else {
      return {
        color: '#F44336',
        label: 'MAX',
        emoji: '🔥',
        textColor: '#fff'
      };
    }
  };

  const config = getIntensityConfig();
  const sizeConfig = {
    small: { height: 24, fontSize: 12, padding: 6 },
    medium: { height: 32, fontSize: 14, padding: 8 },
    large: { height: 40, fontSize: 16, padding: 10 }
  };

  const dimensions = sizeConfig[size];

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: config.color,
        height: dimensions.height,
        paddingHorizontal: dimensions.padding,
      }
    ]}>
      {showLabel && size !== 'small' && (
        <Text style={[styles.emoji, { fontSize: dimensions.fontSize - 2 }]}>
          {config.emoji}
        </Text>
      )}
      <Text style={[
        styles.percentage,
        { fontSize: dimensions.fontSize, color: config.textColor }
      ]}>
        {pct}%
      </Text>
      {showLabel && size === 'large' && (
        <Text style={[styles.label, { fontSize: dimensions.fontSize - 4, color: config.textColor }]}>
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
    borderRadius: 20,
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emoji: {
    fontWeight: '600',
  },
  percentage: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.8,
  }
});
