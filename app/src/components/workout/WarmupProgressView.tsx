/**
 * WarmupProgressView Component
 * 
 * Shows adaptive warmup progression leading to working sets.
 * Displays warmup sets with increasing percentages (30%, 45%, 70% for heavy loads).
 * 
 * Visualizes the buildup to max attempts in P1 protocol.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GeneratedProtocolSet } from '../../services/ProtocolWorkoutEngine';
import { spacing, typography, borderRadius } from '../../theme/designTokens';

interface WarmupProgressViewProps {
  warmupSets: GeneratedProtocolSet[];
  workingWeight: number;
  fourRepMax: number;
}

export const WarmupProgressView: React.FC<WarmupProgressViewProps> = ({
  warmupSets,
  workingWeight,
  fourRepMax,
}) => {
  if (warmupSets.length === 0) {
    return null;
  }

  const maxPercentage = Math.max(...warmupSets.map(s => (s.targetWeight / fourRepMax) * 100));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🔥 Warmup Progression</Text>
        <Text style={styles.subtitle}>
          {warmupSets.length} sets building to {workingWeight} lbs
        </Text>
      </View>

      {/* Progress Bar Visualization */}
      <View style={styles.progressContainer}>
        {warmupSets.map((set, index) => {
          const percentage = (set.targetWeight / fourRepMax) * 100;
          const isLast = index === warmupSets.length - 1;
          
          return (
            <View key={set.setNumber} style={styles.progressStep}>
              {/* Step Circle */}
              <View style={[
                styles.stepCircle,
                isLast && styles.stepCircleLast
              ]}>
                <Text style={[
                  styles.stepNumber,
                  isLast && styles.stepNumberLast
                ]}>
                  {set.setNumber}
                </Text>
              </View>

              {/* Step Info */}
              <View style={styles.stepInfo}>
                <Text style={styles.stepWeight}>{set.targetWeight} lbs</Text>
                <Text style={styles.stepReps}>
                  {set.targetReps ? `${set.targetReps.min} reps` : 'warmup'}
                </Text>
                <Text style={styles.stepPercentage}>{Math.round(percentage)}%</Text>
              </View>

              {/* Connector Line */}
              {index < warmupSets.length - 1 && (
                <View style={styles.connector} />
              )}
            </View>
          );
        })}

        {/* Final Working Set Indicator */}
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.workingSetCircle]}>
            <Text style={styles.workingSetIcon}>🎯</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={[styles.stepWeight, { color: '#FF5722' }]}>
              {workingWeight} lbs
            </Text>
            <Text style={styles.stepReps}>MAX ATTEMPT</Text>
            <Text style={[styles.stepPercentage, { color: '#FF5722' }]}>100%</Text>
          </View>
        </View>
      </View>

      {/* Strategy Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          {warmupSets.length === 2 
            ? 'Light warmup protocol - 2 sets to prepare joints and muscles'
            : 'Heavy warmup protocol - 3 sets for optimal CNS activation'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodySmall,
    fontSize: 13,
    color: '#666666',
  },
  progressContainer: {
    paddingVertical: spacing.md,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepCircleLast: {
    backgroundColor: '#FF9800',
  },
  workingSetCircle: {
    backgroundColor: '#FF5722',
  },
  stepNumber: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
  },
  stepNumberLast: {
    color: '#FFFFFF',
  },
  workingSetIcon: {
    fontSize: 20,
  },
  stepInfo: {
    flex: 1,
  },
  stepWeight: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  stepReps: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  stepPercentage: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  connector: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 44,
    backgroundColor: '#E0E0E0',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
});

export default WarmupProgressView;
