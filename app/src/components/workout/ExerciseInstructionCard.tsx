/**
 * ExerciseInstructionCard Component
 * 
 * Illustrated card showing exercise setup, execution steps, and target muscles
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeColors from '../../utils/useThemeColors';

interface ExerciseInstructionCardProps {
  exerciseName: string;
  targetMuscles: string[];
  setupSteps: string[];
  executionCues: string[];
}

export default function ExerciseInstructionCard({
  exerciseName,
  targetMuscles,
  setupSteps,
  executionCues,
}: ExerciseInstructionCardProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.exerciseName}>{exerciseName}</Text>
        <View style={styles.musclesRow}>
          <Text style={styles.musclesLabel}>Target: </Text>
          <Text style={styles.muscles}>{targetMuscles.join(', ')}</Text>
        </View>
      </LinearGradient>

      <View style={[styles.content, { backgroundColor: colors.card }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📋 Setup
          </Text>
          {setupSteps.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{idx + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ⚡ Execution Cues
          </Text>
          {executionCues.map((cue, idx) => (
            <View key={idx} style={styles.cueRow}>
              <Text style={[styles.bullet, { color: colors.primary }]}>●</Text>
              <Text style={[styles.cueText, { color: colors.text }]}>{cue}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    padding: 20,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  musclesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  musclesLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  muscles: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  divider: {
    height: 2,
    marginVertical: 16,
  },
  cueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    fontSize: 16,
    fontWeight: '900',
    marginRight: 12,
    marginTop: 2,
  },
  cueText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
});
