/**
 * RepOutSetCard Component
 * 
 * Enhanced set card for rep-out sets in P2/P3 protocols.
 * Shows rep-out target with real-time performance feedback.
 * 
 * Rep Band Feedback:
 * - 1-4 reps: Red (too heavy)
 * - 5-6 reps: Orange (overloaded)
 * - 7-9 reps: Green (ideal)
 * - 10-12 reps: Blue (reserve)
 * - 13-15 reps: Purple (light)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RepBand } from '../../types';
import RepOutInterpreterService from '../../services/RepOutInterpreterService';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

interface RepOutSetCardProps {
  setNumber: number;
  targetWeight: number;
  completedReps?: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onPress?: () => void;
}

export const RepOutSetCard: React.FC<RepOutSetCardProps> = ({
  setNumber,
  targetWeight,
  completedReps,
  isCompleted,
  isCurrent,
  onPress,
}) => {
  const feedback = completedReps 
    ? RepOutInterpreterService.getRepOutFeedback(completedReps, null)
    : null;

  const getStatusColor = () => {
    if (!isCompleted) return '#E0E0E0';
    if (!feedback) return '#4CAF50';
    return feedback.color;
  };

  const getStatusEmoji = () => {
    if (!isCompleted) return '⏱️';
    if (!feedback) return '✅';
    return feedback.emoji;
  };

  const getBorderColor = () => {
    if (isCurrent) return '#FF6B00';
    if (!isCompleted) return '#E0E0E0';
    if (!feedback) return '#4CAF50';
    return feedback.color;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCurrent && styles.currentCard,
        isCompleted && styles.completedCard,
        { borderColor: getBorderColor() }
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {/* Set Header */}
      <View style={styles.header}>
        <View style={styles.setInfo}>
          <Text style={styles.setNumber}>SET {setNumber}</Text>
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT</Text>
            </View>
          )}
        </View>
        <Text style={styles.statusEmoji}>{getStatusEmoji()}</Text>
      </View>

      {/* Weight Display */}
      <View style={styles.weightRow}>
        <Text style={styles.weightLabel}>Target Weight</Text>
        <Text style={styles.weightValue}>{targetWeight} lbs</Text>
      </View>

      {/* Rep Out Instruction */}
      <View style={[styles.repOutBanner, { backgroundColor: isCurrent ? '#FF6B00' : '#2196F3' }]}>
        <Text style={styles.repOutText}>REP OUT 💪</Text>
        <Text style={styles.repOutSubtext}>Technical failure only</Text>
      </View>

      {/* Performance Feedback (if completed) */}
      {isCompleted && completedReps && feedback && (
        <View style={[styles.feedbackCard, { backgroundColor: feedback.color + '15' }]}>
          <View style={styles.feedbackHeader}>
            <View style={[styles.bandBadge, { backgroundColor: feedback.color }]}>
              <Text style={styles.bandEmoji}>{feedback.emoji}</Text>
            </View>
            <Text style={[styles.feedbackTitle, { color: feedback.color }]}>
              {completedReps} REPS - {feedback.band.toUpperCase().replace('_', ' ')}
            </Text>
          </View>
          <Text style={styles.feedbackMessage}>{feedback.message}</Text>
          <Text style={styles.feedbackRecommendation}>{feedback.recommendation}</Text>
        </View>
      )}

      {/* Completed Stats */}
      {isCompleted && completedReps && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Reps</Text>
            <Text style={[styles.statValue, { color: getStatusColor() }]}>
              {completedReps}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Volume</Text>
            <Text style={styles.statValue}>
              {targetWeight * completedReps} lbs
            </Text>
          </View>
        </View>
      )}

      {/* Expected Range (if not completed) */}
      {!isCompleted && (
        <View style={styles.expectedRange}>
          <Text style={styles.expectedLabel}>Expected Range:</Text>
          <Text style={styles.expectedValue}>7-15 reps</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    ...shadows.md,
  },
  currentCard: {
    borderWidth: 3,
    ...shadows.xl,
  },
  completedCard: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  setInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  setNumber: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  currentBadge: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  currentBadgeText: {
    ...typography.labelSmall,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusEmoji: {
    fontSize: 24,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.md,
  },
  weightLabel: {
    ...typography.body,
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  weightValue: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  repOutBanner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  repOutText: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  repOutSubtext: {
    ...typography.bodySmall,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  feedbackCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bandBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bandEmoji: {
    fontSize: 16,
  },
  feedbackTitle: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '700',
  },
  feedbackMessage: {
    ...typography.body,
    fontSize: 13,
    color: '#1a1a1a',
    marginBottom: spacing.sm,
  },
  feedbackRecommendation: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
  },
  statValue: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  expectedRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F0F0F0',
    borderRadius: borderRadius.sm,
  },
  expectedLabel: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
  },
  expectedValue: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});

export default RepOutSetCard;
