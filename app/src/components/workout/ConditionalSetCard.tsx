/**
 * ConditionalSetCard Component
 * 
 * Enhanced with SetConditionChecker integration for precise state management.
 * 
 * Displays a workout set with:
 * - 🔒 Locked: Conditions not met (greyed out)
 * - 🔓 Unlocked: Available to perform (highlighted)
 * - ⏳ Pending: Next in line, conditions almost met (pulsing)
 * - ✅ Completed: Finished (success styling)
 * - Intensity percentage badge
 * - Progress indicators
 * - Animated state transitions
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Card } from 'react-native-paper';
import IntensityBadge from './IntensityBadge';
import { ConditionalSet } from '../../types/enhanced';
import { SetLog } from '../../types';
import { SetConditionChecker, ConditionEvaluationResult } from '../../services/SetConditionChecker';
import useThemeColors from '../../utils/useThemeColors';

interface ConditionalSetCardProps {
  set: ConditionalSet;
  completedSets: SetLog[];
  isCurrentSet: boolean;
  onPress?: () => void;
}

export default function ConditionalSetCard({
  set,
  completedSets,
  isCurrentSet,
  onPress
}: ConditionalSetCardProps) {
  const colors = useThemeColors();
  
  // Evaluate set condition using SetConditionChecker
  const evaluation: ConditionEvaluationResult = SetConditionChecker.evaluateSet(set, completedSets);
  const { status, icon, reason, progressText } = evaluation;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate unlock when set becomes available
  useEffect(() => {
    if (status === 'unlocked' && set.isConditional) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else if (status === 'locked') {
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0.5);
    }
  }, [status]);

  // Pulse animation for pending sets
  useEffect(() => {
    if (status === 'pending') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  const isLocked = status === 'locked';
  const isPending = status === 'pending';
  const isCompleted = status === 'completed';
  const targetRepsText = typeof set.targetReps === 'string' 
    ? set.targetReps 
    : `${set.targetReps} rep${set.targetReps !== 1 ? 's' : ''}`;

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'unlocked':
        return colors.primary;
      case 'pending':
        return colors.warning;
      case 'locked':
      default:
        return colors.textSecondary;
    }
  };

  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: isCompleted 
        ? colors.success + '20'
        : isCurrentSet && !isLocked
        ? colors.primary + '15'
        : isPending
        ? colors.warning + '10'
        : isLocked
        ? colors.surface
        : colors.card,
      borderRadius: 16,
      marginBottom: 12,
      elevation: isLocked ? 1 : 4,
      borderWidth: isCurrentSet && !isLocked ? 2 : isPending ? 1 : 0,
      borderColor: isCurrentSet && !isLocked ? colors.primary : isPending ? colors.warning : 'transparent',
    },
    cardContent: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    setNumber: {
      fontSize: 24,
      fontWeight: '900',
      color: isCompleted ? colors.success : isLocked ? colors.textSecondary : colors.text,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: getStatusColor() + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: isPending ? 1 : 0,
      borderColor: colors.warning,
    },
    statusIcon: {
      fontSize: 16,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
      color: getStatusColor(),
      textTransform: 'uppercase',
    },
    details: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    detailItem: {
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 20,
      fontWeight: '900',
      color: isLocked ? colors.textSecondary : colors.text,
    },
    restPeriod: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    conditionalNote: {
      marginTop: 12,
      padding: 10,
      backgroundColor: isPending 
        ? colors.warning + '15' 
        : isLocked 
        ? colors.textSecondary + '10'
        : colors.warning + '15',
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: isPending ? colors.warning : isLocked ? colors.textSecondary : colors.warning,
    },
    conditionalText: {
      fontSize: 12,
      color: isLocked ? colors.textSecondary : colors.text,
      fontWeight: '600',
    },
    progressIndicator: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    progressText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    completedBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: colors.success,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: colors.success,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    completedIcon: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
  });

  return (
    <Animated.View
      style={{
        transform: [
          { scale: isPending ? pulseAnim : scaleAnim }
        ],
        opacity: opacityAnim
      }}
    >
      <Card 
        style={dynamicStyles.card}
        onPress={!isLocked && !isCompleted ? onPress : undefined}
        disabled={isLocked || isCompleted}
      >
        <View style={dynamicStyles.cardContent}>
          {/* Header with Set Number and Status */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.setNumber}>
              SET {set.setNumber}
            </Text>
            
            <View style={dynamicStyles.statusIndicator}>
              <Text style={dynamicStyles.statusIcon}>{icon}</Text>
              <Text style={dynamicStyles.statusText}>{status}</Text>
            </View>
          </View>

          {/* Intensity Badge for unlocked/completed sets */}
          {(status === 'unlocked' || status === 'completed') && (
            <View style={{ marginBottom: 12 }}>
              <IntensityBadge 
                percentage={set.intensityPercentage} 
                size="medium"
                showLabel={true}
              />
            </View>
          )}

          {/* Set Details */}
          <View style={dynamicStyles.details}>
            <View style={dynamicStyles.detailItem}>
              <Text style={dynamicStyles.detailLabel}>Weight</Text>
              <Text style={dynamicStyles.detailValue}>{set.weight} lbs</Text>
            </View>

            <View style={dynamicStyles.detailItem}>
              <Text style={dynamicStyles.detailLabel}>Reps</Text>
              <Text style={dynamicStyles.detailValue}>{targetRepsText}</Text>
            </View>

            <View style={dynamicStyles.detailItem}>
              <Text style={dynamicStyles.detailLabel}>Rest</Text>
              <Text style={dynamicStyles.restPeriod}>{set.restPeriod}</Text>
            </View>
          </View>

          {/* Conditional Set Info with Progress */}
          {set.isConditional && (isLocked || isPending) && (
            <View style={dynamicStyles.conditionalNote}>
              <Text style={dynamicStyles.conditionalText}>
                {reason || 'Waiting to unlock...'}
              </Text>
              
              {progressText && (
                <View style={dynamicStyles.progressIndicator}>
                  <Text style={dynamicStyles.progressText}>
                    Progress: {progressText}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Completed Checkmark */}
          {isCompleted && (
            <View style={dynamicStyles.completedBadge}>
              <Text style={dynamicStyles.completedIcon}>✓</Text>
            </View>
          )}
        </View>
      </Card>
    </Animated.View>
  );
}
