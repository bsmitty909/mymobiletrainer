/**
 * WorkoutHeroImage Component
 * 
 * Display workout-themed hero image/icon at top of workout screens
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeColors from '../../utils/useThemeColors';

interface WorkoutHeroImageProps {
  exerciseName: string;
  exerciseType?: string;
}

const getExerciseIcon = (exerciseName: string): string => {
  const name = exerciseName.toLowerCase();
  if (name.includes('bench') || name.includes('press') || name.includes('chest')) return '💪';
  if (name.includes('squat') || name.includes('leg')) return '🦵';
  if (name.includes('deadlift')) return '🏋️';
  if (name.includes('pull') || name.includes('row') || name.includes('back')) return '💪';
  if (name.includes('curl') || name.includes('arm')) return '💪';
  if (name.includes('shoulder') || name.includes('press')) return '🦾';
  return '🏋️‍♂️';
};

export default function WorkoutHeroImage({ exerciseName, exerciseType }: WorkoutHeroImageProps) {
  const colors = useThemeColors();
  const icon = getExerciseIcon(exerciseName);

  return (
    <LinearGradient
      colors={[colors.primary, colors.primary + 'CC', colors.primary + '88']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.exerciseName}>{exerciseName}</Text>
        {exerciseType && (
          <Text style={styles.exerciseType}>{exerciseType}</Text>
        )}
      </View>
      <View style={styles.pattern}>
        <View style={styles.patternDot} />
        <View style={styles.patternDot} />
        <View style={styles.patternDot} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  icon: {
    fontSize: 50,
  },
  textContainer: {
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  exerciseType: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  pattern: {
    position: 'absolute',
    right: 20,
    top: 20,
    flexDirection: 'row',
    gap: 8,
  },
  patternDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
