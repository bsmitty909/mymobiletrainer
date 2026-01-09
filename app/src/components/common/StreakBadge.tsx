/**
 * Streak Badge Component
 * 
 * Displays workout streak badges with animations and progress indicators.
 * Shows current streak, longest streak, and next milestone.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../utils/useThemeColors';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
  variant?: 'compact' | 'expanded';
  showMilestone?: boolean;
  onPress?: () => void;
}

interface StreakMilestone {
  value: number;
  title: string;
  emoji: string;
  color: string;
}

const STREAK_MILESTONES: StreakMilestone[] = [
  { value: 3, title: 'On a Roll', emoji: '🎲', color: '#3498db' },
  { value: 7, title: 'Week Warrior', emoji: '📅', color: '#9b59b6' },
  { value: 14, title: 'Two Week Titan', emoji: '⚡', color: '#e67e22' },
  { value: 21, title: '3 Week Champion', emoji: '🏅', color: '#e74c3c' },
  { value: 30, title: 'Monthly Master', emoji: '👑', color: '#f1c40f' },
  { value: 60, title: 'Consistency King', emoji: '💎', color: '#1abc9c' },
  { value: 90, title: 'Quarter Legend', emoji: '🌟', color: '#34495e' },
  { value: 180, title: 'Half Year Hero', emoji: '🦸', color: '#8e44ad' },
  { value: 365, title: 'Year Warrior', emoji: '🏆', color: '#c0392b' },
];

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  currentStreak,
  longestStreak,
  variant = 'compact',
  showMilestone = true,
  onPress,
}) => {
  const colors = useThemeColors();

  const getCurrentMilestone = (): StreakMilestone | null => {
    for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
      if (currentStreak >= STREAK_MILESTONES[i].value) {
        return STREAK_MILESTONES[i];
      }
    }
    return null;
  };

  const getNextMilestone = (): StreakMilestone | null => {
    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak < milestone.value) {
        return milestone;
      }
    }
    return null;
  };

  const calculateProgress = (): number => {
    const nextMilestone = getNextMilestone();
    if (!nextMilestone) return 100;

    const currentMilestone = getCurrentMilestone();
    const previousValue = currentMilestone ? currentMilestone.value : 0;
    
    const progress = ((currentStreak - previousValue) / (nextMilestone.value - previousValue)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getStreakColor = (): string => {
    if (currentStreak === 0) return colors.textSecondary;
    if (currentStreak < 3) return '#3498db';
    if (currentStreak < 7) return '#9b59b6';
    if (currentStreak < 14) return '#e67e22';
    if (currentStreak < 30) return '#e74c3c';
    return '#f1c40f';
  };

  const getMotivationalMessage = (): string => {
    if (currentStreak === 0) return 'Start your streak today!';
    if (currentStreak === 1) return 'Great start! Keep going!';
    if (currentStreak < 3) return 'Building momentum!';
    if (currentStreak < 7) return "You're on fire!";
    if (currentStreak < 14) return 'Unstoppable!';
    if (currentStreak < 30) return 'Elite consistency!';
    return "You're a legend!";
  };

  const currentMilestone = getCurrentMilestone();
  const nextMilestone = getNextMilestone();
  const progress = calculateProgress();
  const streakColor = getStreakColor();

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor: colors.card }]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.compactContent}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <View style={styles.compactInfo}>
            <Text style={[styles.compactStreak, { color: streakColor }]}>
              {currentStreak}
            </Text>
            <Text style={[styles.compactLabel, { color: colors.textSecondary }]}>
              Day Streak
            </Text>
          </View>
        </View>
        {currentStreak > 0 && (
          <View style={styles.compactBadge}>
            <Text style={styles.compactBadgeText}>
              {currentMilestone ? currentMilestone.emoji : '🎯'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.expandedContainer, { backgroundColor: colors.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Workout Streak
        </Text>
        {currentMilestone && (
          <View style={[styles.milestoneChip, { backgroundColor: currentMilestone.color + '20' }]}>
            <Text style={styles.milestoneEmoji}>{currentMilestone.emoji}</Text>
            <Text style={[styles.milestoneTitle, { color: currentMilestone.color }]}>
              {currentMilestone.title}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.streakDisplay}>
        <View style={styles.streakItem}>
          <Text style={styles.fireEmojiLarge}>🔥</Text>
          <Text style={[styles.streakNumber, { color: streakColor }]}>
            {currentStreak}
          </Text>
          <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
            Current Streak
          </Text>
          <Text style={[styles.motivationalText, { color: colors.textSecondary }]}>
            {getMotivationalMessage()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.streakItem}>
          <Text style={styles.starEmoji}>⭐</Text>
          <Text style={[styles.streakNumber, { color: colors.text }]}>
            {longestStreak}
          </Text>
          <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
            Longest Streak
          </Text>
          {longestStreak > 0 && currentStreak === longestStreak && (
            <Text style={[styles.personalBest, { color: '#f1c40f' }]}>
              Personal Best! 🏆
            </Text>
          )}
        </View>
      </View>

      {showMilestone && nextMilestone && (
        <View style={styles.milestoneSection}>
          <View style={styles.milestoneHeader}>
            <Text style={[styles.milestoneLabel, { color: colors.textSecondary }]}>
              Next Milestone
            </Text>
            <Text style={[styles.milestoneTarget, { color: colors.text }]}>
              {nextMilestone.value} days
            </Text>
          </View>

          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: nextMilestone.color,
                },
              ]}
            />
          </View>

          <View style={styles.milestoneInfo}>
            <Text style={styles.nextMilestoneEmoji}>{nextMilestone.emoji}</Text>
            <Text style={[styles.nextMilestoneTitle, { color: colors.text }]}>
              {nextMilestone.title}
            </Text>
            <Text style={[styles.daysRemaining, { color: colors.textSecondary }]}>
              {nextMilestone.value - currentStreak} days to go
            </Text>
          </View>
        </View>
      )}

      {currentStreak === 0 && (
        <View style={styles.callToAction}>
          <Text style={[styles.ctaText, { color: colors.textSecondary }]}>
            💪 Complete a workout today to start your streak!
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fireEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  compactInfo: {
    alignItems: 'flex-start',
  },
  compactStreak: {
    fontSize: 24,
    fontWeight: '700',
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  compactBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(241, 196, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactBadgeText: {
    fontSize: 20,
  },
  expandedContainer: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  milestoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  milestoneEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  milestoneTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  streakDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  fireEmojiLarge: {
    fontSize: 48,
    marginBottom: 8,
  },
  starEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  motivationalText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  personalBest: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  milestoneSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  milestoneTarget: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextMilestoneEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  nextMilestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  daysRemaining: {
    fontSize: 12,
  },
  callToAction: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 8,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default StreakBadge;
