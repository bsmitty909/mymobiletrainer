/**
 * P1PRCelebration Component
 * 
 * Celebratory animation and feedback when user earns a new 4RM through P1 testing.
 * Shows confetti, XP gained, badges unlocked, and encouragement.
 * 
 * Per PRD: Earned progression deserves celebration!
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Badge } from '../../types';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';
import ConfettiAnimation from '../common/ConfettiAnimation';

interface P1PRCelebrationProps {
  visible: boolean;
  exerciseName: string;
  oldMax: number;
  newMax: number;
  xpGained: number;
  newBadges?: Badge[];
  onClose: () => void;
}

export const P1PRCelebration: React.FC<P1PRCelebrationProps> = ({
  visible,
  exerciseName,
  oldMax,
  newMax,
  xpGained,
  newBadges = [],
  onClose,
}) => {
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const improvement = newMax - oldMax;
  const improvementPercent = ((improvement / oldMax) * 100).toFixed(1);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Confetti */}
        <ConfettiAnimation active={visible} />

        {/* Celebration Card */}
        <Animated.View
          style={[
            styles.celebrationCard,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>NEW PR EARNED!</Text>
            <Text style={styles.subtitle}>P1 Max Testing Success</Text>
          </View>

          {/* Exercise Info */}
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exerciseName}</Text>
            
            <View style={styles.maxComparison}>
              <View style={styles.maxColumn}>
                <Text style={styles.maxLabel}>Previous 4RM</Text>
                <Text style={styles.oldMax}>{oldMax} lbs</Text>
              </View>
              
              <Text style={styles.arrow}>→</Text>
              
              <View style={styles.maxColumn}>
                <Text style={styles.maxLabel}>New 4RM</Text>
                <Text style={styles.newMax}>{newMax} lbs</Text>
              </View>
            </View>

            <View style={styles.improvementCard}>
              <Text style={styles.improvementLabel}>Improvement</Text>
              <Text style={styles.improvementValue}>
                +{improvement} lbs ({improvementPercent}%)
              </Text>
            </View>
          </View>

          {/* XP Gained */}
          <View style={styles.xpCard}>
            <Text style={styles.xpIcon}>✨</Text>
            <View style={styles.xpContent}>
              <Text style={styles.xpLabel}>XP Earned</Text>
              <Text style={styles.xpValue}>+{xpGained} XP</Text>
            </View>
          </View>

          {/* New Badges */}
          {newBadges.length > 0 && (
            <View style={styles.badgesSection}>
              <Text style={styles.badgesTitle}>🏆 Badges Unlocked!</Text>
              {newBadges.map(badge => (
                <View key={badge.id} style={styles.badgeCard}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeDescription}>{badge.description}</Text>
                  </View>
                  <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(badge.rarity) }]}>
                    <Text style={styles.rarityText}>{badge.rarity}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Motivational Message */}
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              You EARNED this PR through testing! This is true earned progression. Keep up the excellent work! 💪
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Helper function for rarity colors
const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return '#9E9E9E';
    case 'rare': return '#2196F3';
    case 'epic': return '#9C27B0';
    case 'legendary': return '#FF9800';
    default: return '#757575';
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  celebrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.generous,
    width: '100%',
    maxWidth: 500,
    ...shadows.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: '700',
    color: '#FF5722',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: '#999999',
    fontWeight: '600',
  },
  exerciseCard: {
    backgroundColor: '#F5F5F5',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
  },
  exerciseName: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  maxComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  maxColumn: {
    alignItems: 'center',
  },
  maxLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
  },
  oldMax: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
  },
  arrow: {
    fontSize: 24,
    color: '#4CAF50',
  },
  newMax: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  improvementCard: {
    backgroundColor: '#4CAF50',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  improvementLabel: {
    ...typography.labelSmall,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
  },
  improvementValue: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  xpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FFF3E0',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
  },
  xpIcon: {
    fontSize: 32,
  },
  xpContent: {
    flex: 1,
  },
  xpLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#E65100',
    fontWeight: '700',
  },
  xpValue: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6F00',
  },
  badgesSection: {
    marginBottom: spacing.base,
  },
  badgesTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  badgeDescription: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  rarityText: {
    ...typography.labelSmall,
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  messageCard: {
    backgroundColor: '#E3F2FD',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
  },
  messageText: {
    ...typography.body,
    fontSize: 13,
    color: '#1565C0',
    textAlign: 'center',
    lineHeight: 19,
  },
  closeButton: {
    backgroundColor: '#FF5722',
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.lg,
  },
  closeButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default P1PRCelebration;
