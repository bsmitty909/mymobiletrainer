/**
 * P1SuccessCelebration Component
 * 
 * Special celebration animation for earning a new 4RM through P1 testing.
 * Displays achievement with confetti-style animation.
 * 
 * Triggers when user successfully completes P1 max testing.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { TouchableOpacity } from 'react-native';
import ConfettiAnimation from '../common/ConfettiAnimation';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

interface P1SuccessCelebrationProps {
  visible: boolean;
  exerciseName: string;
  oldMax: number;
  newMax: number;
  onDismiss: () => void;
}

export const P1SuccessCelebration: React.FC<P1SuccessCelebrationProps> = ({
  visible,
  exerciseName,
  oldMax,
  newMax,
  onDismiss,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  const gain = newMax - oldMax;
  const gainPercentage = ((gain / oldMax) * 100).toFixed(1);

  useEffect(() => {
    if (visible) {
      // Entrance animation
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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      {/* Confetti Background */}
      <ConfettiAnimation active={visible} />

      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Trophy Icon */}
          <Text style={styles.trophy}>🏆</Text>

          {/* Title */}
          <Text style={styles.title}>NEW 4RM EARNED!</Text>

          {/* Exercise Name */}
          <Text style={styles.exerciseName}>{exerciseName}</Text>

          {/* Max Display */}
          <View style={styles.maxDisplay}>
            <View style={styles.maxColumn}>
              <Text style={styles.maxLabel}>Old Max</Text>
              <Text style={styles.maxValue}>{oldMax} lbs</Text>
            </View>

            <Text style={styles.arrow}>→</Text>

            <View style={styles.maxColumn}>
              <Text style={styles.maxLabel}>New Max</Text>
              <Text style={[styles.maxValue, styles.newMaxValue]}>{newMax} lbs</Text>
            </View>
          </View>

          {/* Gain Badge */}
          <View style={styles.gainBadge}>
            <Text style={styles.gainText}>+{gain} lbs ({gainPercentage}%)</Text>
          </View>

          {/* Message */}
          <Text style={styles.message}>
            You earned this through hard work and P1 testing.{'\n'}
            This is REAL progress!
          </Text>

          {/* XP Badge */}
          <View style={styles.xpBadge}>
            <Text style={styles.xpIcon}>⭐</Text>
            <Text style={styles.xpText}>+100 XP BONUS</Text>
          </View>

          {/* Dismiss Button */}
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.huge,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    ...shadows.xl,
  },
  trophy: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: '700',
    color: '#FF5722',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  exerciseName: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: spacing.generous,
    textAlign: 'center',
  },
  maxDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
    marginBottom: spacing.base,
    width: '100%',
  },
  maxColumn: {
    alignItems: 'center',
    flex: 1,
  },
  maxLabel: {
    ...typography.labelSmall,
    fontSize: 12,
    color: '#999999',
    marginBottom: spacing.sm,
  },
  maxValue: {
    ...typography.display,
    fontSize: 32,
    fontWeight: '700',
    color: '#666666',
  },
  newMaxValue: {
    color: '#4CAF50',
  },
  arrow: {
    fontSize: 32,
    color: '#FF9800',
    fontWeight: '700',
  },
  gainBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.generous,
  },
  gainText: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  message: {
    ...typography.body,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: spacing.base,
    lineHeight: 21,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFD700',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.generous,
  },
  xpIcon: {
    fontSize: 20,
  },
  xpText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  dismissButton: {
    backgroundColor: '#FF5722',
    paddingVertical: spacing.comfortable,
    paddingHorizontal: spacing.huge,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  dismissText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default P1SuccessCelebration;
