/**
 * Rest Timer Component - Enhanced with Intensity-Based Durations
 *
 * Countdown timer for rest periods between sets.
 * Enhanced with formulas from Asa B 2020:
 * - 30s: ≤35% (warmup)
 * - 1-2 MIN: 65-80% (working sets)
 * - 1-5 MIN: ≥90% (heavy/max attempts)
 * 
 * Features:
 * - Automatic rest calculation based on intensity
 * - Intensity percentage display
 * - Contextual rest explanations
 * - Visual countdown display
 * - Progress circle
 * - Add time functionality
 * - Skip timer option
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, ProgressBar, IconButton } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { tickRestTimer, stopRestTimer, addRestTime } from '../../store/slices/uiSlice';
import WorkoutEngineEnhanced from '../../services/WorkoutEngineEnhanced';
import { getExerciseById } from '../../constants/exercises';
import useThemeColors from '../../utils/useThemeColors';

interface RestTimerEnhancedProps {
  onComplete?: () => void;
  weight?: number;         // Weight used for the set
  fourRepMax?: number;      // User's 4RM for intensity calculation
  setType?: 'warmup' | 'working' | 'max' | 'downset'; // Type of set
  restPeriod?: string;     // Optional: e.g., "1-2 MIN", "30s"
  exerciseId?: string;     // Exercise ID to show form cues
  onReviewForm?: () => void; // Callback to open form video
}

export default function RestTimerEnhanced({
  onComplete,
  weight,
  fourRepMax,
  setType,
  restPeriod,
  exerciseId,
  onReviewForm
}: RestTimerEnhancedProps) {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const { isActive, remaining, target } = useAppSelector((state) => state.ui.restTimer);
  const [showFormCues, setShowFormCues] = useState(false);

  // Get exercise details for form cues
  const exercise = exerciseId ? getExerciseById(exerciseId) : null;

  // Calculate rest explanation based on intensity
  const getRestExplanation = (): string => {
    if (!weight || !fourRepMax) {
      return '💡 Catch your breath, hydrate!';
    }
    
    const intensity = weight / fourRepMax;
    
    if (intensity <= 0.35) {
      return '⚡ Quick recovery for warmup - keep moving!';
    } else if (intensity >= 0.90) {
      return '🏋️ Full recovery for max effort - take your time!';
    } else if (intensity >= 0.65) {
      return '💪 Moderate recovery for working sets';
    }
    
    return '💡 Rest as needed, focus on your form';
  };

  // Get intensity percentage for display
  const getIntensityInfo = (): { percentage: number; label: string; color: string } | null => {
    if (!weight || !fourRepMax) return null;
    
    const percentage = Math.round((weight / fourRepMax) * 100);
    let label = '';
    let color = colors.primary;
    
    if (percentage <= 35) {
      label = 'Warmup';
      color = '#4CAF50';
    } else if (percentage <= 65) {
      label = 'Moderate';
      color = '#2196F3';
    } else if (percentage <= 85) {
      label = 'Heavy';
      color = '#FF9800';
    } else {
      label = 'Max Effort';
      color = '#F44336';
    }
    
    return { percentage, label, color };
  };

  // Get suggested rest duration range
  const getRestRange = (): string => {
    if (restPeriod) return restPeriod;
    
    if (!weight || !fourRepMax) return '';
    
    const calculated = WorkoutEngineEnhanced.calculateRestPeriod(
      weight,
      fourRepMax,
      setType
    );
    
    return calculated;
  };

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      dispatch(tickRestTimer());
      
      if (remaining <= 1) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, remaining, dispatch, onComplete]);

  if (!isActive) return null;

  const progress = target > 0 ? (target - remaining) / target : 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const intensityInfo = getIntensityInfo();
  const restRange = getRestRange();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.label}>
          REST PERIOD
        </Text>

        {/* Intensity Info Badge */}
        {intensityInfo && (
          <View style={[styles.intensityBadge, { backgroundColor: intensityInfo.color }]}>
            <Text style={styles.intensityPercentage}>
              {intensityInfo.percentage}%
            </Text>
            <Text style={styles.intensityLabel}>
              {intensityInfo.label}
            </Text>
          </View>
        )}

        {/* Rest Range Suggestion */}
        {restRange && (
          <Text variant="bodyMedium" style={styles.restRange}>
            Suggested: {restRange}
          </Text>
        )}

        {/* Countdown Timer */}
        <Text variant="displayLarge" style={styles.time}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </Text>

        <ProgressBar
          progress={progress}
          color={intensityInfo?.color || colors.primary}
          style={styles.progressBar}
        />

        {/* Intensity-Based Explanation */}
        <Text variant="bodyMedium" style={styles.hint}>
          {getRestExplanation()}
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttons}>
          <Button
            mode="outlined"
            onPress={() => dispatch(addRestTime(30))}
            style={styles.button}
            textColor="#FFF"
          >
            +30s
          </Button>
          <Button
            mode="outlined"
            onPress={() => dispatch(addRestTime(15))}
            style={styles.button}
            textColor="#FFF"
          >
            +15s
          </Button>
          <Button
            mode="text"
            onPress={() => dispatch(stopRestTimer())}
            style={styles.button}
            textColor="#9CA3AF"
          >
            Skip
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  label: {
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 2,
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    gap: 8,
  },
  intensityPercentage: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  intensityLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  restRange: {
    color: '#9CA3AF',
    marginBottom: 16,
    fontWeight: '600',
  },
  time: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  progressBar: {
    width: 240,
    height: 8,
    borderRadius: 4,
    marginBottom: 24,
  },
  hint: {
    color: '#9CA3AF',
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    minWidth: 90,
  },
});
