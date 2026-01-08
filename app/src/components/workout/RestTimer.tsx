/**
 * Rest Timer Component
 *
 * Countdown timer for rest periods between sets.
 * Features:
 * - Visual countdown display
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
}

export default function RestTimer({ onComplete }: RestTimerProps) {
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.label}>
          REST PERIOD
        </Text>

        <Text variant="displayLarge" style={styles.time}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </Text>

        <ProgressBar
          progress={progress}
          color={colors.primary}
          style={styles.progressBar}
        />

        <Text variant="bodyMedium" style={styles.hint}>
          💡 Catch your breath, hydrate!
        </Text>

        <View style={styles.buttons}>
          <Button
            mode="outlined"
            onPress={() => dispatch(addRestTime(15))}
            style={styles.button}
          >
            +15 Seconds
          </Button>
          <Button
            mode="text"
            onPress={() => dispatch(stopRestTimer())}
            style={styles.button}
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
