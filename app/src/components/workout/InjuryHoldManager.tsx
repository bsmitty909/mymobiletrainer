/**
 * InjuryHoldManager Component
 * 
 * UI for pausing muscle groups and setting hold durations.
 * Allows users/trainers to create and manage injury holds.
 * 
 * Per PRD:
 * - Pause muscle groups or movement patterns for set duration
 * - Preview impact before creating hold
 * - Manage active holds (extend, shorten, end early)
 * - View hold timeline
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { addInjuryHold, updateInjuryHold, removeInjuryHold } from '../../store/slices/rehabSlice';
import InjuryHoldService, { CreateHoldParams } from '../../services/InjuryHoldService';
import { MuscleGroup, InjuryHold } from '../../types';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

interface InjuryHoldManagerProps {
  visible: boolean;
  onClose: () => void;
}

export const InjuryHoldManager: React.FC<InjuryHoldManagerProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.user.currentUser?.id || '');
  const activeHolds = useAppSelector(state => state.rehab.activeHolds);

  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleGroup[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [durationWeeks, setDurationWeeks] = useState('4');
  const [reason, setReason] = useState('');

  const muscleGroupOptions: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'
  ];

  const movementPatternOptions = [
    'push', 'pull', 'squat', 'hinge', 'press', 'row'
  ];

  const toggleMuscleGroup = (group: MuscleGroup) => {
    if (selectedMuscleGroups.includes(group)) {
      setSelectedMuscleGroups(prev => prev.filter(g => g !== group));
    } else {
      setSelectedMuscleGroups(prev => [...prev, group]);
    }
  };

  const togglePattern = (pattern: string) => {
    if (selectedPatterns.includes(pattern)) {
      setSelectedPatterns(prev => prev.filter(p => p !== pattern));
    } else {
      setSelectedPatterns(prev => [...prev, pattern]);
    }
  };

  const handleCreateHold = () => {
    const params: CreateHoldParams = {
      userId,
      muscleGroups: selectedMuscleGroups,
      movementPatterns: selectedPatterns,
      durationWeeks: parseInt(durationWeeks, 10),
      reason,
    };

    const hold = InjuryHoldService.createHold(params);
    dispatch(addInjuryHold(hold));

    // Reset form
    setSelectedMuscleGroups([]);
    setSelectedPatterns([]);
    setDurationWeeks('4');
    setReason('');
    setMode('list');
  };

  const handleExtendHold = (hold: InjuryHold, additionalWeeks: number) => {
    const currentDurationWeeks = (hold.endDate - hold.startDate) / (7 * 24 * 60 * 60 * 1000);
    const newDurationWeeks = currentDurationWeeks + additionalWeeks;
    const updated = InjuryHoldService.modifyHoldDuration(hold, newDurationWeeks);
    dispatch(updateInjuryHold(updated));
  };

  const handleEndHold = (holdId: string, hold: InjuryHold) => {
    const ended = InjuryHoldService.endHoldEarly(hold);
    dispatch(updateInjuryHold(ended));
  };

  const getDaysRemaining = (endDate: number): number => {
    return Math.ceil((endDate - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getHoldDuration = (startDate: number, endDate: number): number => {
    return Math.round((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
  };

  if (mode === 'create') {
    return (
      <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
        <ScrollView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setMode('list')} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Injury Hold</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.content}>
            {/* Muscle Groups */}
            <Text style={styles.sectionTitle}>Affected Muscle Groups</Text>
            <View style={styles.chipGrid}>
              {muscleGroupOptions.map(group => {
                const isSelected = selectedMuscleGroups.includes(group);
                return (
                  <TouchableOpacity
                    key={group}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleMuscleGroup(group)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {group}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Movement Patterns */}
            <Text style={styles.sectionTitle}>Movement Patterns (Optional)</Text>
            <View style={styles.chipGrid}>
              {movementPatternOptions.map(pattern => {
                const isSelected = selectedPatterns.includes(pattern);
                return (
                  <TouchableOpacity
                    key={pattern}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => togglePattern(pattern)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {pattern}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Duration */}
            <Text style={styles.sectionTitle}>Hold Duration (Weeks)</Text>
            <TextInput
              style={styles.input}
              value={durationWeeks}
              onChangeText={setDurationWeeks}
              keyboardType="numeric"
              placeholder="4"
            />

            {/* Reason */}
            <Text style={styles.sectionTitle}>Reason</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g., Frozen shoulder, Lower back strain"
              multiline
              numberOfLines={3}
            />

            {/* Preview Impact */}
            {selectedMuscleGroups.length > 0 && (
              <View style={styles.impactCard}>
                <Text style={styles.impactTitle}>⚠️ Impact Preview</Text>
                <Text style={styles.impactText}>
                  Pausing: {selectedMuscleGroups.join(', ')}
                </Text>
                {selectedPatterns.length > 0 && (
                  <Text style={styles.impactText}>
                    Patterns: {selectedPatterns.join(', ')}
                  </Text>
                )}
                <Text style={styles.impactWarning}>
                  Exercises using these areas will be removed from workouts
                </Text>
              </View>
            )}

            {/* Create Button */}
            <TouchableOpacity
              style={[
                styles.createButton,
                (selectedMuscleGroups.length === 0 || !reason) && styles.createButtonDisabled
              ]}
              onPress={handleCreateHold}
              disabled={selectedMuscleGroups.length === 0 || !reason}
            >
              <Text style={styles.createButtonText}>Create Hold</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Injury Holds</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Active Holds Summary */}
          {activeHolds.length > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {activeHolds.length} Active Hold{activeHolds.length > 1 ? 's' : ''}
              </Text>
              {(() => {
                const summary = InjuryHoldService.getHoldSummary(activeHolds);
                return (
                  <>
                    <Text style={styles.summaryText}>
                      Affected: {summary.affectedMuscleGroups.join(', ')}
                    </Text>
                    {summary.daysUntilResume && (
                      <Text style={styles.summaryText}>
                        Next resume: {summary.daysUntilResume} days
                      </Text>
                    )}
                  </>
                );
              })()}
            </View>
          )}

          {/* Active Holds List */}
          {activeHolds.length > 0 ? (
            activeHolds.map(hold => (
              <View key={hold.id} style={styles.holdCard}>
                <View style={styles.holdHeader}>
                  <Text style={styles.holdReason}>{hold.reason}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: hold.active ? '#4CAF50' : '#9E9E9E' }
                  ]}>
                    <Text style={styles.statusText}>
                      {hold.active ? 'ACTIVE' : 'ENDED'}
                    </Text>
                  </View>
                </View>

                <View style={styles.holdInfo}>
                  <Text style={styles.holdLabel}>Muscle Groups:</Text>
                  <Text style={styles.holdValue}>{hold.muscleGroups.join(', ')}</Text>
                </View>

                {hold.movementPatterns.length > 0 && (
                  <View style={styles.holdInfo}>
                    <Text style={styles.holdLabel}>Patterns:</Text>
                    <Text style={styles.holdValue}>{hold.movementPatterns.join(', ')}</Text>
                  </View>
                )}

                <View style={styles.holdInfo}>
                  <Text style={styles.holdLabel}>Duration:</Text>
                  <Text style={styles.holdValue}>
                    {getHoldDuration(hold.startDate, hold.endDate)} weeks
                    ({getDaysRemaining(hold.endDate)} days remaining)
                  </Text>
                </View>

                {hold.active && (
                  <View style={styles.holdActions}>
                    <TouchableOpacity
                      style={styles.extendButton}
                      onPress={() => handleExtendHold(hold, 1)}
                    >
                      <Text style={styles.extendButtonText}>+1 Week</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.endButton}
                      onPress={() => handleEndHold(hold.id, hold)}
                    >
                      <Text style={styles.endButtonText}>End Hold</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyTitle}>No Active Holds</Text>
              <Text style={styles.emptyText}>
                Create a hold when you need to pause training for specific muscle groups
              </Text>
            </View>
          )}

          {/* Create New Hold Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setMode('create')}
          >
            <Text style={styles.addButtonText}>+ Create New Hold</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    ...typography.body,
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  summaryCard: {
    backgroundColor: '#FFF3E0',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  summaryTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: spacing.sm,
  },
  summaryText: {
    ...typography.body,
    fontSize: 13,
    color: '#BF360C',
    marginBottom: 4,
  },
  holdCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  holdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  holdReason: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.labelSmall,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  holdInfo: {
    marginBottom: spacing.sm,
  },
  holdLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
  },
  holdValue: {
    ...typography.body,
    fontSize: 13,
    color: '#1a1a1a',
  },
  holdActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  extendButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  extendButtonText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  endButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  endButtonText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: spacing.generous,
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.base,
    marginBottom: spacing.huge,
    ...shadows.md,
  },
  addButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  // Create Form Styles
  sectionTitle: {
    ...typography.h3,
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: spacing.base,
    marginBottom: spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  chipSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  chipText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: spacing.base,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  impactCard: {
    backgroundColor: '#FFEBEE',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: '#EF5350',
  },
  impactTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: spacing.sm,
  },
  impactText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#B71C1C',
    marginBottom: 4,
  },
  impactWarning: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#D32F2F',
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.base,
    ...shadows.md,
  },
  createButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  createButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default InjuryHoldManager;
