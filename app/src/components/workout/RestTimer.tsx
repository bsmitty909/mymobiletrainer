/**
 * Rest Timer Component - Enhanced with Intensity-Based Logic
 *
 * Countdown timer for rest periods between sets with smart rest recommendations.
 * Features:
 * - Visual countdown display
 * - Intensity-based rest guidance (warmup 30s, working 1-2min, max 1-5min)
 * - Progress circle
 * - Add time functionality
 * - Skip timer option
 * - Auto-start capability
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { tickRestTimer, stopRestTimer, addRestTime } from '../../store/slices/uiSlice';
import useThemeColors from '../../utils/useThemeColors';

interface RestTimerProps {
  onComplete?: () => void;
  weight?: number;
  fourRepMax?: number;
  setType?: 'warmup' | 'working' | 'max' | 'downset';
}

export default function RestTimer({ onComplete, weight, fourRepMax, setType }: RestTimerProps) {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const { isActive, remaining, target } = useAppSelector((state) => state.ui.restTimer);

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

  const getRestExplanation = () => {
    if (!weight || !fourRepMax) {
      return '💡 Catch your breath, hydrate!';
    }

    const intensity = weight / fourRepMax;

    if (setType === 'warmup' || intensity <= 0.35) {
      return '🔥 Quick recovery - warmup set';
    } else if (setType === 'downset' || intensity <= 0.65) {
      return '💪 Standard recovery - volume work';
    } else if (intensity <= 0.85) {
      return '⚡ Moderate recovery - working sets';
    } else if (setType === 'max' || intensity >= 0.90) {
      return '🎯 Full recovery - max effort ahead! Take your time.';
    }

    return '💡 Catch your breath, hydrate!';
  };

  const getRestColor = () => {
    if (!weight || !fourRepMax) return colors.primary;

    const intensity = weight / fourRepMax;
    
    if (intensity <= 0.35) return '#10B981'; // Green
    if (intensity <= 0.65) return '#3B82F6'; // Blue
    if (intensity <= 0.85) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.label}>
          REST PERIOD
        </Text>

        <Text variant="displayLarge" style={[styles.time, { color: getRestColor() }]}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </Text>

        <ProgressBar
          progress={progress}
          color={getRestColor()}
          style={styles.progressBar}
        />

        <Text variant="bodyMedium" style={styles.hint}>
          {getRestExplanation()}
        </Text>

        <View style={styles.buttons}>
          <Button
            mode="outlined"
            onPress={() => dispatch(addRestTime(15))}
            style={styles.button}
            textColor="#FFFFFF"
          >
            +15 Seconds
          </Button>
          <Button
            mode="text"
            onPress={() => dispatch(stopRestTimer())}
            style={styles.button}
            textColor="#9CA3AF"
          >
            Skip Timer
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
    marginBottom: 24,
    letterSpacing: 2,
  },
  time: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  progressBar: {
    width: 200,
    height: 8,
    borderRadius: 4,
    marginBottom: 32,
  },
  hint: {
    color: '#9CA3AF',
    marginBottom: 32,
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    minWidth: 120,
  },
});
