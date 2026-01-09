/**
 * Resume Workout Card Component
 * 
 * Displays a card prompting the user to resume an incomplete workout.
 * Shows progress and time elapsed since starting.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import GameButton from '../common/GameButton';
import useThemeColors from '../../utils/useThemeColors';
import { ResumeWorkoutInfo } from '../../services/QuickStartService';

interface ResumeWorkoutCardProps {
  resumeInfo: ResumeWorkoutInfo;
  onResume: () => void;
  onDiscard: () => void;
}

export default function ResumeWorkoutCard({
  resumeInfo,
  onResume,
  onDiscard,
}: ResumeWorkoutCardProps) {
  const colors = useThemeColors();

  if (!resumeInfo.canResume || !resumeInfo.session) {
    return null;
  }

  const formatElapsedTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const progressPercentage =
    (resumeInfo.progress.exercisesCompleted / resumeInfo.progress.totalExercises) * 100;

  const styles = StyleSheet.create({
    card: {
      margin: 16,
      marginTop: 8,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 8,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    content: {
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.text,
      textTransform: 'uppercase',
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
      fontWeight: '600',
    },
    progressSection: {
      marginBottom: 16,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    stat: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
      fontWeight: '600',
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
    },
  });

  return (
    <Card style={styles.card}>
      <LinearGradient
        colors={[colors.primary + '10', colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="play-circle" size={28} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Resume Workout</Text>
            <Text style={styles.subtitle}>
              Paused {formatElapsedTime(resumeInfo.timeElapsed)}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {resumeInfo.progress.exercisesCompleted}/{resumeInfo.progress.totalExercises}
              </Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {resumeInfo.progress.setsCompleted}
              </Text>
              <Text style={styles.statLabel}>Sets Done</Text>
            </View>
            
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                ~{resumeInfo.progress.estimatedTimeRemaining}
              </Text>
              <Text style={styles.statLabel}>Min Left</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <GameButton
              onPress={onDiscard}
              variant="secondary"
              size="medium"
              icon="close"
            >
              DISCARD
            </GameButton>
          </View>
          <View style={styles.actionButton}>
            <GameButton
              onPress={onResume}
              variant="success"
              size="medium"
              icon="play"
            >
              RESUME
            </GameButton>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );
}
