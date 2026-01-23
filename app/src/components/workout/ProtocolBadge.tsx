/**
 * ProtocolBadge Component
 * 
 * Displays P1/P2/P3 protocol badge with color coding and tooltips.
 * Visual indicator of which protocol an exercise uses.
 * 
 * Color Scheme:
 * - P1 (Max Testing): Red/Orange #FF5722
 * - P2 (Volume): Blue #2196F3
 * - P3 (Accessory): Purple #9C27B0
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Protocol } from '../../types';

interface ProtocolBadgeProps {
  protocol: Protocol;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
  onPress?: () => void;
}

export const ProtocolBadge: React.FC<ProtocolBadgeProps> = ({
  protocol,
  size = 'medium',
  showTooltip = false,
  onPress,
}) => {
  const config = getProtocolConfig(protocol);
  const sizeStyles = getSizeStyles(size);

  const badge = (
    <View style={[styles.badge, { backgroundColor: config.color }, sizeStyles.container]}>
      <Text style={[styles.emoji, sizeStyles.emoji]}>{config.emoji}</Text>
      <Text style={[styles.label, sizeStyles.label]}>{protocol}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {badge}
        {showTooltip && (
          <View style={[styles.tooltip, { borderColor: config.color }]}>
            <Text style={styles.tooltipTitle}>{config.name}</Text>
            <Text style={styles.tooltipDescription}>{config.description}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return badge;
};

function getProtocolConfig(protocol: Protocol) {
  const configs = {
    P1: {
      name: 'Max Testing',
      emoji: '🎯',
      color: '#FF5722',
      description: 'Test your 4RM and earn strength increases through successful max attempts.',
    },
    P2: {
      name: 'Volume Work',
      emoji: '💪',
      color: '#2196F3',
      description: 'Build muscle with 3 rep-out sets. Signals readiness for P1 testing.',
    },
    P3: {
      name: 'Accessory',
      emoji: '⚡',
      color: '#9C27B0',
      description: 'Fatigue-managed isolation work with 2 rep-out sets.',
    },
  };

  return configs[protocol];
}

function getSizeStyles(size: 'small' | 'medium' | 'large') {
  const sizes = {
    small: {
      container: styles.small,
      emoji: styles.emojiSmall,
      label: styles.labelSmall,
    },
    medium: {
      container: styles.medium,
      emoji: styles.emojiMedium,
      label: styles.labelMedium,
    },
    large: {
      container: styles.large,
      emoji: styles.emojiLarge,
      label: styles.labelLarge,
    },
  };

  return sizes[size];
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  
  // Size variants
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  emojiSmall: {
    fontSize: 12,
  },
  labelSmall: {
    fontSize: 11,
  },
  
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  emojiMedium: {
    fontSize: 16,
  },
  labelMedium: {
    fontSize: 14,
  },
  
  large: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  emojiLarge: {
    fontSize: 20,
  },
  labelLarge: {
    fontSize: 16,
  },

  // Tooltip
  tooltip: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  tooltipTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  tooltipDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
});

export default ProtocolBadge;
