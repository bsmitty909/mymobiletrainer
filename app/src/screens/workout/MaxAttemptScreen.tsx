/**
 * MaxAttemptScreen
 * 
 * Specialized UI for P1 max testing flow with success/failure paths.
 * Guides user through warmups → max attempts → down sets.
 * 
 * P1 Flow:
 * 1. Complete adaptive warmups (2-3 sets)
 * 2. Attempt 100% 4RM for 4 reps
 * 3. Success → increase weight +2.5-5%, retry
 * 4. Failure → establish new max, proceed to down sets
 * 5. Complete 2 down sets (85-90%, 80-85%)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { startP1Testing, completeP1Testing, failP1Testing } from '../../store/slices/protocolSlice';
import { P1MaxProtocolHelper } from '../../services/ProtocolWorkoutEngine';
import FourRepMaxService from '../../services/FourRepMaxService';
import GameInput from '../../components/common/GameInput';
import GameButton from '../../components/common/GameButton';
import WarmupProgressView from '../../components/workout/WarmupProgressView';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

interface MaxAttemptScreenProps {
  navigation: any;
  route: {
    params: {
      exerciseId: string;
      exerciseName: string;
      fourRepMax: number;
      muscleGroup: string;
      equipmentType: string;
    };
  };
}

export default function MaxAttemptScreen({ navigation, route }: MaxAttemptScreenProps) {
  const { exerciseId, exerciseName, fourRepMax, muscleGroup, equipmentType } = route.params;
  
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const userId = useAppSelector(state => state.user.currentUser?.id || '');
  const p1TestingStatus = useAppSelector(state => state.protocol.p1TestingStatus);

  const [phase, setPhase] = useState<'warmup' | 'max_attempt' | 'down_sets' | 'complete'>('warmup');
  const [warmupSets, setWarmupSets] = useState<any[]>([]);
  const [downSets, setDownSets] = useState<any[]>([]);
  const [completedWarmups, setCompletedWarmups] = useState(0);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [currentAttemptWeight, setCurrentAttemptWeight] = useState(fourRepMax);
  const [newFourRepMax, setNewFourRepMax] = useState(fourRepMax);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    // Initialize P1 session
    const session = P1MaxProtocolHelper.initializeP1Session(
      exerciseId,
      { id: '', userId, exerciseId, weight: fourRepMax, dateAchieved: Date.now(), verified: true },
      muscleGroup as any,
      equipmentType as any
    );

    setWarmupSets(session.warmupSets);
    setCurrentAttemptWeight(session.maxAttemptWeight);
    
    dispatch(startP1Testing({ exerciseId }));
  }, []);

  const handleLogWarmup = () => {
    const completed = completedWarmups + 1;
    setCompletedWarmups(completed);

    if (completed >= warmupSets.length) {
      setPhase('max_attempt');
      setWeight(currentAttemptWeight.toString());
      setReps('4');
    } else {
      const nextSet = warmupSets[completed];
      setWeight(nextSet.targetWeight.toString());
      setReps(nextSet.targetReps?.min.toString() || '');
    }
  };

  const handleLogMaxAttempt = () => {
    const attemptedWeight = parseFloat(weight);
    const repsCompleted = parseInt(reps, 10);

    // Record attempt
    const attempt = FourRepMaxService.recordMaxAttempt(
      userId,
      exerciseId,
      fourRepMax,
      attemptedWeight,
      repsCompleted,
      'session-id'
    );
    setAttempts([...attempts, attempt]);

    // Process result
    const result = P1MaxProtocolHelper.processAttempt(
      attemptedWeight,
      repsCompleted,
      attemptNumber,
      fourRepMax,
      equipmentType as any
    );

    if (result.action === 'retry' && result.nextWeight) {
      // Success! Try higher weight
      setAttemptNumber(attemptNumber + 1);
      setCurrentAttemptWeight(result.nextWeight);
      setWeight(result.nextWeight.toString());
      setReps('4');
    } else {
      // Failed or hit limit - proceed to down sets
      if (result.newMax) {
        setNewFourRepMax(result.newMax);
      }
      
      const downSetsGenerated = P1MaxProtocolHelper.generateDownSets(
        result.newMax || fourRepMax,
        warmupSets.length
      );
      setDownSets(downSetsGenerated);
      setPhase('down_sets');
      setWeight(downSetsGenerated[0]?.targetWeight.toString() || '');
      setReps('');
    }
  };

  const handleCompleteP1 = () => {
    // Create new 4RM record
    const newMax = FourRepMaxService.updateFourRepMax(
      userId,
      exerciseId,
      newFourRepMax,
      'session-id'
    );

    dispatch(completeP1Testing({
      fourRepMax: newMax,
      attempts,
    }));

    setPhase('complete');
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: '#FF5722',
      padding: spacing.base,
      paddingTop: spacing.huge,
    },
    title: {
      ...typography.h1,
      fontSize: 28,
      color: '#FFFFFF',
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    subtitle: {
      ...typography.body,
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.9)',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>🎯 P1 Max Testing</Text>
        <Text style={dynamicStyles.subtitle}>{exerciseName}</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: spacing.base }}>
        {/* Warmup Phase */}
        {phase === 'warmup' && (
          <>
            <WarmupProgressView
              warmupSets={warmupSets}
              workingWeight={fourRepMax}
              fourRepMax={fourRepMax}
            />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Warmup Set {completedWarmups + 1} of {warmupSets.length}
              </Text>
              
              <View style={styles.inputRow}>
                <GameInput
                  label="WEIGHT"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  incrementAmount={5}
                  unit="lbs"
                />
                <GameInput
                  label="REPS"
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="numeric"
                  incrementAmount={1}
                  unit="reps"
                />
              </View>

              <GameButton onPress={handleLogWarmup} variant="primary">
                Log Warmup Set
              </GameButton>
            </View>
          </>
        )}

        {/* Max Attempt Phase */}
        {phase === 'max_attempt' && (
          <>
            <View style={styles.maxCard}>
              <Text style={styles.maxTitle}>MAX ATTEMPT #{attemptNumber}</Text>
              <Text style={styles.maxGoal}>Goal: {currentAttemptWeight} lbs × 4 reps</Text>
              <Text style={styles.maxInstruction}>
                Give everything you have. Stop at technical failure.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.inputRow}>
                <GameInput
                  label="WEIGHT"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
                <GameInput
                  label="REPS"
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="numeric"
                />
              </View>

              <GameButton onPress={handleLogMaxAttempt} variant="success">
                Log Max Attempt
              </GameButton>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                💡 Success (4+ reps) = try higher weight{'\n'}
                💡 Failure (&lt;4 reps) = establish max &amp; move to down sets
              </Text>
            </View>
          </>
        )}

        {/* Down Sets Phase */}
        {phase === 'down_sets' && (
          <>
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>🎉 New 4RM: {newFourRepMax} lbs</Text>
              <Text style={styles.successGain}>+{newFourRepMax - fourRepMax} lbs gained!</Text>
              <Text style={styles.successText}>Complete down sets to finish strong</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Down Sets ({downSets.length} sets)</Text>
              
              {downSets.map((set, index) => (
                <View key={index} style={styles.downSetCard}>
                  <Text style={styles.downSetNumber}>Set {index + 1}</Text>
                  <Text style={styles.downSetWeight}>{set.targetWeight} lbs</Text>
                  <Text style={styles.downSetInstruction}>
                    {set.instruction === 'rep-out' ? 'Rep Out' : `${set.targetReps?.min}-${set.targetReps?.max} reps`}
                  </Text>
                </View>
              ))}

              <GameButton onPress={handleCompleteP1} variant="success" style={{ marginTop: spacing.md }}>
                Complete P1 Testing
              </GameButton>
            </View>
          </>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && (
          <View style={styles.completeCard}>
            <Text style={styles.completeEmoji}>🏆</Text>
            <Text style={styles.completeTitle}>P1 Testing Complete!</Text>
            <Text style={styles.completeMax}>New 4RM: {newFourRepMax} lbs</Text>
            <Text style={styles.completeGain}>+{newFourRepMax - fourRepMax} lbs</Text>
            
            <GameButton onPress={() => navigation.goBack()} variant="primary" style={{ marginTop: spacing.generous }}>
              Return to Workout
            </GameButton>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  maxCard: {
    backgroundColor: '#FF5722',
    padding: spacing.generous,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.lg,
  },
  maxTitle: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  maxGoal: {
    ...typography.h3,
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  maxInstruction: {
    ...typography.body,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  successCard: {
    backgroundColor: '#4CAF50',
    padding: spacing.generous,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.lg,
  },
  successTitle: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  successGain: {
    ...typography.h3,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  successText: {
    ...typography.body,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  downSetCard: {
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downSetNumber: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
  },
  downSetWeight: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  downSetInstruction: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#999999',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 18,
  },
  completeCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.huge,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginTop: spacing.huge,
    ...shadows.xl,
  },
  completeEmoji: {
    fontSize: 64,
    marginBottom: spacing.base,
  },
  completeTitle: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.md,
  },
  completeMax: {
    ...typography.h2,
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  completeGain: {
    ...typography.h3,
    fontSize: 18,
    color: '#FF9800',
    fontWeight: '600',
  },
});
