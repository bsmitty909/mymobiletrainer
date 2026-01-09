/**
 * Milestone Badge Component
 * 
 * Displays achievement badges for strength gain milestones
 * Supports different milestone types: 10 lb, 25 lb, 50 lb, 100 lb gains
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeColors from '../../utils/useThemeColors';

type MilestoneType = 'gain_10' | 'gain_25' | 'gain_50' | 'gain_100';

interface MilestoneBadgeProps {
  type: MilestoneType;
  title: string;
  description: string;
  icon: string;
  earnedAt?: Date;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

const MILESTONE_COLORS = {
  gain_10: {
    gradient: ['#3B82F6', '#2563EB'],
    borderColor: '#60A5FA',
    shadowColor: '#3B82F6',
  },
  gain_25: {
    gradient: ['#8B5CF6', '#7C3AED'],
    borderColor: '#A78BFA',
    shadowColor: '#8B5CF6',
  },
  gain_50: {
    gradient: ['#F59E0B', '#D97706'],
    borderColor: '#FBBF24',
    shadowColor: '#F59E0B',
  },
  gain_100: {
    gradient: ['#EF4444', '#DC2626', '#B91C1C'],
    borderColor: '#FCA5A5',
    shadowColor: '#EF4444',
  },
};

const SIZE_CONFIG = {
  small: {
    badgeSize: 60,
    iconSize: 28,
    titleSize: 11,
    descSize: 9,
    borderWidth: 2,
  },
  medium: {
    badgeSize: 80,
    iconSize: 36,
    titleSize: 13,
    descSize: 11,
    borderWidth: 3,
  },
  large: {
    badgeSize: 100,
    iconSize: 44,
    titleSize: 16,
    descSize: 13,
    borderWidth: 4,
  },
};

export default function MilestoneBadge({
  type,
  title,
  description,
  icon,
  earnedAt,
  size = 'medium',
  onPress,
}: MilestoneBadgeProps) {
  const colors = useThemeColors();
  const milestoneColors = MILESTONE_COLORS[type];
  const sizeConfig = SIZE_CONFIG[size];

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      margin: 8,
    },
    badgeWrapper: {
      position: 'relative',
      marginBottom: 8,
    },
    badge: {
      width: sizeConfig.badgeSize,
      height: sizeConfig.badgeSize,
      borderRadius: sizeConfig.badgeSize / 2,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: sizeConfig.borderWidth,
      borderColor: milestoneColors.borderColor,
      elevation: 8,
      shadowColor: milestoneColors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },
    icon: {
      fontSize: sizeConfig.iconSize,
    },
    glowEffect: {
      position: 'absolute',
      width: sizeConfig.badgeSize + 20,
      height: sizeConfig.badgeSize + 20,
      borderRadius: (sizeConfig.badgeSize + 20) / 2,
      backgroundColor: milestoneColors.shadowColor,
      opacity: 0.2,
      top: -10,
      left: -10,
    },
    textContainer: {
      alignItems: 'center',
      maxWidth: sizeConfig.badgeSize + 20,
    },
    title: {
      fontSize: sizeConfig.titleSize,
      fontWeight: '900',
      textAlign: 'center',
      color: colors.text,
      marginBottom: 2,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    description: {
      fontSize: sizeConfig.descSize,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.textSecondary,
    },
    earnedDate: {
      fontSize: sizeConfig.descSize - 1,
      color: colors.textSecondary,
      opacity: 0.7,
      marginTop: 2,
    },
    locked: {
      opacity: 0.4,
    },
    lockedBadge: {
      backgroundColor: colors.border,
      borderColor: colors.border,
    },
    lockIcon: {
      fontSize: sizeConfig.iconSize,
    },
  });

  const BadgeContent = (
    <View style={styles.container}>
      <View style={styles.badgeWrapper}>
        {earnedAt && <View style={styles.glowEffect} />}
        <LinearGradient
          colors={earnedAt ? milestoneColors.gradient : [colors.border, colors.border]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <Text style={styles.icon}>
            {earnedAt ? icon : '🔒'}
          </Text>
        </LinearGradient>
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, !earnedAt && styles.locked]}>
          {title}
        </Text>
        <Text style={[styles.description, !earnedAt && styles.locked]}>
          {description}
        </Text>
        {earnedAt && (
          <Text style={styles.earnedDate}>
            {earnedAt.toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress && earnedAt) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {BadgeContent}
      </TouchableOpacity>
    );
  }

  return BadgeContent;
}

/**
 * Helper function to get milestone badge props from gain amount
 */
export function getMilestoneBadgeProps(gainAmount: number): {
  type: MilestoneType;
  title: string;
  description: string;
  icon: string;
} | null {
  if (gainAmount >= 100) {
    return {
      type: 'gain_100',
      title: '💯 Century',
      description: `+${gainAmount} lbs!`,
      icon: '🏆',
    };
  } else if (gainAmount >= 50) {
    return {
      type: 'gain_50',
      title: '💪 Half Century',
      description: `+${gainAmount} lbs!`,
      icon: '⭐',
    };
  } else if (gainAmount >= 25) {
    return {
      type: 'gain_25',
      title: '🎯 Quarter Century',
      description: `+${gainAmount} lbs!`,
      icon: '🔥',
    };
  } else if (gainAmount >= 10) {
    return {
      type: 'gain_10',
      title: '🚀 Strong Start',
      description: `+${gainAmount} lbs!`,
      icon: '💪',
    };
  }
  return null;
}
