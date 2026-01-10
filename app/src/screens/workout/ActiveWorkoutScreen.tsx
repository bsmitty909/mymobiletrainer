/**
 * Active Workout Screen - Modern 2024 Design
 *
 * Redesigned with clean, professional aesthetic inspired by Nike/Hevy
 * Maintains all existing functionality with improved visual hierarchy
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  logEnhancedSet,
  initializeConditionalSets,
  completeExercise,
  completeWorkout,
  clearMaxAttemptResult,
  activateDownSets
} from '../../store/slices/workoutSliceEnhanced';
import { startRestTimer, nextExercise } from '../../store/slices/uiSlice';
import WorkoutEngineEnhanced from '../../services/WorkoutEngineEnhanced';
import { SmartWeightSuggestionService, WorkoutHistoryEntry } from '../../services/SmartWeightSuggestionService';
import { ConditionalSet, MaxAttemptResult } from '../../types/enhanced';
import RestTimer from '../../components/workout/RestTimer';
import GameButton from '../../components/common/GameButton';
import GameInput from '../../components/common/GameInput';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import CompactSetCard from '../../components/workout/CompactSetCard';
import ExerciseInstructionCard from '../../components/workout/ExerciseInstructionCard';
import MaxAttemptFeedbackModal from '../../components/workout/MaxAttemptFeedbackModal';
import DownSetBanner from '../../components/workout/DownSetBanner';
import IntensityBadge from '../../components/workout/IntensityBadge';
import WeightSuggestionCard from '../../components/workout/WeightSuggestionCard';
import PlateCalculatorCard from '../../components/workout/PlateCalculatorCard';
import ExerciseVideoPlayer from '../../components/workout/ExerciseVideoPlayer';
import { getExerciseById, getExerciseInstructions } from '../../constants/exercises';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

export default function ActiveWorkoutScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const activeSession = useAppSelector((state) => state.workout.activeSession);
  const currentExerciseIndex = useAppSelector(
    (state) => state.ui.activeWorkout.currentExerciseIndex
  );

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [conditionalSets, setConditionalSets] = useState<ConditionalSet[]>([]);
  const [showMaxFeedback, setShowMaxFeedback] = useState(false);
  const [maxAttemptResult, setMaxAttemptResult] = useState<MaxAttemptResult | null>(null);
  const [showDownSets, setShowDownSets] = useState(false);
  const [downSets, setDownSets] = useState<ConditionalSet[]>([]);
  const [weightSuggestion, setWeightSuggestion] = useState<any>(null);
  const [showSuggestion, setShowSuggestion] = useState(true);

  const maxLifts = useAppSelector((state) => state.progress.maxLifts);
  const recentWorkouts = useAppSelector((state) => state.progress.recentWorkouts);
  
  const totalExercises = activeSession?.exercises.length || 0;
  const allExercisesComplete = currentExerciseIndex >= totalExercises;
  const currentExerciseLog = !allExercisesComplete && activeSession
    ? activeSession.exercises[currentExerciseIndex]
    : null;
  
  const currentSetNumber = (currentExerciseLog?.sets?.length || 0) + 1;

  const generateSmartSuggestion = (currentSet: ConditionalSet, userMax: number, exerciseId: string) => {
    if (!currentExerciseLog || !activeSession) return;
    
    const workoutHistory: WorkoutHistoryEntry[] = (recentWorkouts || [])
      .filter(w => w.exercises.some(e => e.exerciseId === exerciseId))
      .slice(0, 3)
      .map(workout => {
        const exerciseLog = workout.exercises.find(e => e.exerciseId === exerciseId);
        return {
          sessionId: workout.id,
          exerciseId,
          completedAt: workout.completedAt || workout.startedAt,
          sets: exerciseLog?.sets || [],
          fourRepMax: userMax
        };
      });
    
    const maxAttemptHistory = workoutHistory.flatMap(w =>
      w.sets
        .filter((s: any) => s.weight >= userMax * 0.9)
        .map((s: any) => ({
          id: s.id,
          userId: activeSession.userId,
          exerciseId,
          sessionId: w.sessionId,
          attemptedWeight: s.weight,
          repsCompleted: s.reps,
          successful: s.reps >= 1,
          attemptedAt: s.completedAt
        }))
    );
    
    const suggestion = SmartWeightSuggestionService.generateSuggestion(
      exerciseId,
      currentSet.weight,
      userMax,
      currentSet.intensityPercentage,
      workoutHistory,
      maxAttemptHistory
    );
    
    setWeightSuggestion(suggestion);
    setShowSuggestion(true);
  };

  useEffect(() => {
    if (currentExerciseLog) {
      const exerciseId = currentExerciseLog.exerciseId;
      const maxLift = maxLifts?.find((m: any) => m.exerciseId === exerciseId);
      const userMax = maxLift?.weight || 100;
      
      const sets = WorkoutEngineEnhanced.generateWorkoutSets(
        exerciseId,
        userMax,
        currentExerciseLog.sets || [],
        {
          includeProgressiveMaxAttempts: true,
          includeDownSets: false
        }
      );
      
      setConditionalSets(sets);
      dispatch(initializeConditionalSets({ exerciseId, sets }));
      
      const currentSet = sets.find(s => s.setNumber === currentSetNumber);
      if (currentSet) {
        generateSmartSuggestion(currentSet, userMax, exerciseId);
        
        // Auto-fill weight and reps suggestions
        if (!weight) {
          setWeight(currentSet.weight.toString());
        }
        if (!reps && typeof currentSet.targetReps === 'number') {
          setReps(currentSet.targetReps.toString());
        }
      }
    }
  }, [currentExerciseLog?.id, dispatch, currentSetNumber]);

  if (!activeSession) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text variant="headlineMedium">No active workout</Text>
          <GameButton
            onPress={() => navigation.goBack()}
            size="medium"
            variant="secondary"
            style={{ marginTop: 16, width: 200 }}
          >
            Back to Dashboard
          </GameButton>
        </View>
      </View>
    );
  }

  const exercise = currentExerciseLog ? getExerciseById(currentExerciseLog.exerciseId) : null;

  const handleLogSet = () => {
    if (!weight || !reps || !currentExerciseLog) return;

    const loggedWeight = parseFloat(weight);
    const loggedReps = parseInt(reps, 10);
    
    const exerciseId = currentExerciseLog.exerciseId;
    const maxLift = maxLifts?.find((m: any) => m.exerciseId === exerciseId);
    const userMax = maxLift?.weight || 100;
    
    const result = WorkoutEngineEnhanced.logSetWithProgression(
      currentExerciseLog,
      currentSetNumber,
      loggedWeight,
      loggedReps,
      90,
      userMax,
      undefined
    );

    dispatch(logEnhancedSet({
      exerciseIndex: currentExerciseIndex,
      setLog: result.setLog,
      maxAttemptResult: result.maxAttemptResult,
      unlockedSets: result.unlockedSets,
      downSetsGenerated: result.downSetsGenerated
    }));

    if (result.maxAttemptResult) {
      setMaxAttemptResult(result.maxAttemptResult);
      setShowMaxFeedback(true);
      
      if (result.downSetsGenerated.length > 0) {
        setDownSets(result.downSetsGenerated);
      }
    }

    const currentSet = conditionalSets.find(s => s.setNumber === currentSetNumber);
    if (currentSet) {
      const restSeconds = WorkoutEngineEnhanced.parseRestPeriodToSeconds(
        currentSet.restPeriod
      );
      dispatch(startRestTimer(restSeconds));
    } else {
      dispatch(startRestTimer(90));
    }

    const nextSet = conditionalSets.find(s => s.setNumber === currentSetNumber + 1);
    if (nextSet) {
      setWeight(nextSet.weight.toString());
      setReps(typeof nextSet.targetReps === 'number' ? nextSet.targetReps.toString() : '');
    } else {
      setWeight('');
      setReps('');
    }
  };

  const handleMaxAttemptContinue = () => {
    if (maxAttemptResult?.success) {
      setShowMaxFeedback(false);
    } else {
      if (downSets.length > 0 && currentExerciseLog) {
        dispatch(activateDownSets({ exerciseId: currentExerciseLog.exerciseId }));
        setShowDownSets(true);
      }
      setShowMaxFeedback(false);
    }
  };

  const handleDismissMaxFeedback = () => {
    setShowMaxFeedback(false);
    dispatch(clearMaxAttemptResult());
  };

  const handleCompleteExercise = () => {
    dispatch(completeExercise(currentExerciseIndex));
    
    if (currentExerciseIndex < totalExercises - 1) {
      dispatch(nextExercise());
      setWeight('');
      setReps('');
    } else {
      dispatch(completeWorkout());
      navigation.navigate('WorkoutSummary');
    }
  };

  const quickSelectReps = (repCount: number) => {
    setReps(repCount.toString());
  };

  const completionPercentage = ((currentExerciseIndex + 1) / totalExercises) * 100;
  const previousSet = currentExerciseLog?.sets && currentExerciseLog.sets.length > 0
    ? currentExerciseLog.sets[currentExerciseLog.sets.length - 1]
    : undefined;

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      paddingTop: 50,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    headerTitle: {
      ...typography.body,
      color: '#fff',
      fontWeight: '600',
    },
    headerSubtitle: {
      ...typography.bodySmall,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    exerciseName: {
      ...typography.h1,
      fontSize: 24,
      color: '#fff',
      marginBottom: spacing.sm,
    },
    progressBar: {
      height: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      borderRadius: borderRadius.sm,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.success,
      borderRadius: borderRadius.sm,
    },
    scrollView: {
      flex: 1,
      paddingBottom: 100,
    },
    contentPadding: {
      padding: spacing.base,
    },
    currentSetCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.base,
      ...shadows.md,
      borderWidth: 2,
      borderColor: colors.primary + '20',
    },
    setHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.base,
    },
    setTitle: {
      ...typography.h2,
      fontSize: 18,
      color: colors.primary,
      letterSpacing: 0.5,
    },
    quickStats: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.base,
      padding: spacing.md,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
    },
    quickStat: {
      flex: 1,
    },
    quickStatLabel: {
      ...typography.labelSmall,
      fontSize: 10,
      color: colors.textSecondary,
    },
    quickStatValue: {
      ...typography.bodyLarge,
      fontSize: 15,
      color: colors.text,
      fontWeight: '600',
      marginTop: 2,
    },
    inputRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.base,
    },
    inputWrapper: {
      flex: 1,
    },
    inputLabel: {
      ...typography.label,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    repsChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      justifyContent: 'center',
    },
    repChip: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 2,
      borderColor: colors.border,
      minWidth: 44,
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    repChipText: {
      ...typography.body,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    selectedChipText: {
      color: '#fff',
      fontWeight: '700',
    },
    sectionMargin: {
      marginBottom: spacing.md,
    },
  });

  const currentSet = conditionalSets.find(s => s.setNumber === currentSetNumber);
  const exerciseId = currentExerciseLog?.exerciseId || '';
  const maxLift = maxLifts?.find((m: any) => m.exerciseId === exerciseId);
  const userMax = maxLift?.weight || 100;
  
  const visibleSets = conditionalSets.filter(set => 
    WorkoutEngineEnhanced.shouldDisplaySet(set, currentExerciseLog?.sets || [])
  );

  return (
    <View style={dynamicStyles.container}>
      <RestTimer
        onComplete={() => {}}
        weight={currentSet?.weight}
        fourRepMax={userMax}
        setType={
          currentSet?.intensityPercentage <= 0.35 ? 'warmup' :
          currentSet?.intensityPercentage >= 0.90 ? 'max' :
          currentSet?.setType === 'down' ? 'downset' : 'working'
        }
      />

      {/* Compact Header */}
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerTop}>
          <Text style={dynamicStyles.headerTitle}>
            {activeSession.weekNumber > 0 ? `Week ${activeSession.weekNumber}` : 'Max Week'} • Day {activeSession.dayNumber}
          </Text>
          <Text style={dynamicStyles.headerSubtitle}>
            {currentExerciseIndex + 1}/{totalExercises}
          </Text>
        </View>
        <Text style={dynamicStyles.exerciseName}>
          {exercise?.name || 'Exercise'}
        </Text>
        <View style={dynamicStyles.progressBar}>
          <View style={[dynamicStyles.progressFill, { width: `${completionPercentage}%` }]} />
        </View>
      </View>

      <ScrollView style={dynamicStyles.scrollView}>
        {/* Exercise Video Player - At Top */}
        {exercise?.videoUrl && (
          <ExerciseVideoPlayer
            videoUrl={exercise.videoUrl}
            exerciseName={exercise.name}
            collapsed={false}
          />
        )}

        <View style={dynamicStyles.contentPadding}>
          {/* Current Set Logging Card */}
          <View style={dynamicStyles.currentSetCard}>
            <View style={dynamicStyles.setHeader}>
              <Text style={dynamicStyles.setTitle}>SET {currentSetNumber}</Text>
              {currentSet && (
                <IntensityBadge
                  percentage={currentSet.intensityPercentage}
                  size="medium"
                  showLabel={false}
                />
              )}
            </View>

            {/* Quick Stats */}
            <View style={dynamicStyles.quickStats}>
              <View style={dynamicStyles.quickStat}>
                <Text style={dynamicStyles.quickStatLabel}>Target</Text>
                <Text style={dynamicStyles.quickStatValue}>
                  {currentSet?.weight || currentExerciseLog?.suggestedWeight} lbs
                </Text>
              </View>
              {previousSet && (
                <View style={dynamicStyles.quickStat}>
                  <Text style={dynamicStyles.quickStatLabel}>Last Set</Text>
                  <Text style={dynamicStyles.quickStatValue}>
                    {previousSet.weight}×{previousSet.reps}
                  </Text>
                </View>
              )}
              <View style={dynamicStyles.quickStat}>
                <Text style={dynamicStyles.quickStatLabel}>Completed</Text>
                <Text style={dynamicStyles.quickStatValue}>
                  {currentExerciseLog?.sets.length || 0}
                </Text>
              </View>
            </View>

            {/* Weight Input */}
            <View style={{ marginBottom: 0 }}>
              <GameInput
                label="WEIGHT"
                value={weight}
                onChangeText={setWeight}
                placeholder={currentExerciseLog?.suggestedWeight.toString()}
                keyboardType="numeric"
                onIncrement={() => {
                  const currentWeight = parseFloat(weight) || currentExerciseLog?.suggestedWeight || 0;
                  setWeight((currentWeight + 5).toString());
                }}
                onDecrement={() => {
                  const currentWeight = parseFloat(weight) || currentExerciseLog?.suggestedWeight || 0;
                  setWeight((currentWeight - 5).toString());
                }}
                incrementAmount={5}
                unit="lbs"
              />
            </View>

            {/* Quick Select Reps First */}
            <View style={{ marginTop: 4, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>
                QUICK SELECT REPS
              </Text>
              <View style={dynamicStyles.repsChipsRow}>
                {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      dynamicStyles.repChip,
                      reps === num.toString() && dynamicStyles.selectedChip
                    ]}
                    onPress={() => quickSelectReps(num)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      dynamicStyles.repChipText,
                      reps === num.toString() && dynamicStyles.selectedChipText
                    ]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Manual Reps Input (Alternative) */}
            <View style={{ marginTop: 0, marginBottom: 0 }}>
              <GameInput
                label="OR ENTER MANUALLY"
                value={reps}
                onChangeText={setReps}
                placeholder="Enter reps"
                keyboardType="numeric"
                onIncrement={() => {
                  const currentReps = parseInt(reps, 10) || 0;
                  setReps(Math.max(1, currentReps + 1).toString());
                }}
                onDecrement={() => {
                  const currentReps = parseInt(reps, 10) || 0;
                  setReps(Math.max(1, currentReps - 1).toString());
                }}
                incrementAmount={1}
                unit="reps"
              />
            </View>

            {/* Log Set Button */}
            <GameButton
              onPress={handleLogSet}
              disabled={!weight || !reps}
              variant="success"
              icon="checkbox-marked-circle"
            >
              LOG SET & REST
            </GameButton>

            {/* Complete Exercise Button */}
            <GameButton
              onPress={handleCompleteExercise}
              variant="primary"
              size="medium"
              icon="arrow-right-circle"
              style={{ marginTop: 12 }}
            >
              Complete Exercise
            </GameButton>
          </View>

          {/* Down Set Banner */}
          {showDownSets && downSets.length > 0 && (
            <DownSetBanner
              numberOfSets={downSets.length}
              weight={downSets[0]?.weight || 0}
              visible={showDownSets}
            />
          )}

          {/* All Sets Overview - Collapsible */}
          {visibleSets.length > 0 && (
            <View style={dynamicStyles.sectionMargin}>
              <CollapsibleSection
                title="All Sets"
                icon="💪"
                badge={`${currentExerciseLog?.sets.length || 0}/${visibleSets.length}`}
                defaultExpanded={false}
                compact
              >
                {visibleSets.map((set) => {
                  const isCompleted = currentExerciseLog?.sets.some(s => s.setNumber === set.setNumber);
                  const isCurrent = set.setNumber === currentSetNumber;
                  const isLocked = !WorkoutEngineEnhanced.shouldDisplaySet(set, currentExerciseLog?.sets || []);
                  
                  return (
                    <CompactSetCard
                      key={set.setNumber}
                      setNumber={set.setNumber}
                      weight={set.weight}
                      reps={set.targetReps}
                      intensityPercentage={set.intensityPercentage}
                      label={set.label}
                      isCompleted={isCompleted}
                      isCurrent={isCurrent}
                      isLocked={isLocked}
                      onPress={() => {
                        if (!isCompleted && set.shouldDisplay) {
                          setWeight(set.weight.toString());
                          setReps(typeof set.targetReps === 'number' ? set.targetReps.toString() : '');
                        }
                      }}
                    />
                  );
                })}
              </CollapsibleSection>
            </View>
          )}

          {/* Smart Suggestion - Collapsible */}
          {weightSuggestion && showSuggestion && (
            <View style={dynamicStyles.sectionMargin}>
              <CollapsibleSection
                title="Smart Suggestion"
                icon="💡"
                defaultExpanded={false}
                compact
              >
                <WeightSuggestionCard
                  suggestion={weightSuggestion}
                  onAccept={() => {
                    setWeight(weightSuggestion.suggestedWeight.toString());
                    setShowSuggestion(false);
                  }}
                  onAdjust={(adjustment) => {
                    const newWeight = weightSuggestion.suggestedWeight + adjustment;
                    setWeight(newWeight.toString());
                    setWeightSuggestion({
                      ...weightSuggestion,
                      suggestedWeight: newWeight
                    });
                  }}
                  onDismiss={() => setShowSuggestion(false)}
                />
              </CollapsibleSection>
            </View>
          )}

          {/* Plate Calculator - Collapsible */}
          {weight && parseFloat(weight) > 0 && (
            <View style={dynamicStyles.sectionMargin}>
              <CollapsibleSection
                title="Plate Calculator"
                icon="⚖️"
                defaultExpanded={false}
                compact
              >
                <PlateCalculatorCard
                  targetWeight={parseFloat(weight)}
                  equipmentType="barbell"
                  compact={true}
                />
              </CollapsibleSection>
            </View>
          )}

          {/* Exercise Instructions - Collapsible */}
          {currentExerciseLog && getExerciseInstructions(currentExerciseLog.exerciseId) && (
            <View style={dynamicStyles.sectionMargin}>
              <CollapsibleSection
                title="Instructions"
                icon="📋"
                defaultExpanded={false}
                compact
              >
                <ExerciseInstructionCard
                  {...getExerciseInstructions(currentExerciseLog.exerciseId)!}
                />
              </CollapsibleSection>
            </View>
          )}

          {/* Form Tips - Collapsible */}
          {exercise?.formTips && (
            <View style={dynamicStyles.sectionMargin}>
              <CollapsibleSection
                title="Form Tips"
                icon="✨"
                defaultExpanded={false}
                compact
              >
                {exercise.formTips.map((tip, idx) => (
                  <Text key={idx} style={{ color: colors.text, marginBottom: 8, fontSize: 14 }}>
                    • {tip}
                  </Text>
                ))}
              </CollapsibleSection>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Max Attempt Feedback Modal */}
      <MaxAttemptFeedbackModal
        visible={showMaxFeedback}
        result={maxAttemptResult}
        onContinue={handleMaxAttemptContinue}
        onDismiss={handleDismissMaxFeedback}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
});
