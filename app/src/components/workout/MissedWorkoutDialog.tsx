/**
 * MissedWorkoutDialog Component
 * 
 * Dialog for tracking workout cancellations with reason selection.
 * Provides detraining warning based on days missed.
 * 
 * Per PRD:
 * - Track reasons: injury, no gym access, time constraints, other
 * - Show detraining impact warning
 * - Used for monthly summaries and progress context
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MissedWorkoutReason } from '../../types';
import MissedTrainingService from '../../services/MissedTrainingService';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

interface MissedWorkoutDialogProps {
  visible: boolean;
  onConfirm: (reason: MissedWorkoutReason, notes?: string) => void;
  onCancel: () => void;
  daysSinceLastWorkout: number;
}

export const MissedWorkoutDialog: React.FC<MissedWorkoutDialogProps> = ({
  visible,
  onConfirm,
  onCancel,
  daysSinceLastWorkout,
}) => {
  const [selectedReason, setSelectedReason] = useState<MissedWorkoutReason | null>(null);
  const [notes, setNotes] = useState('');

  const reasons: Array<{
    value: MissedWorkoutReason;
    label: string;
    icon: string;
    description: string;
  }> = [
    {
      value: 'injury',
      label: 'Injury',
      icon: '🏥',
      description: 'Pain or injury preventing training',
    },
    {
      value: 'no_gym_access',
      label: 'No Gym Access',
      icon: '🏋️',
      description: 'Gym closed or unavailable',
    },
    {
      value: 'time_constraints',
      label: 'Time Constraints',
      icon: '⏰',
      description: 'Schedule conflicts or lack of time',
    },
    {
      value: 'other',
      label: 'Other',
      icon: '📝',
      description: 'Other reason (add notes)',
    },
  ];

  const detrainingWarning = MissedTrainingService.shouldWarnAboutDetraining(daysSinceLastWorkout);

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm(selectedReason, notes || undefined);
      // Reset state
      setSelectedReason(null);
      setNotes('');
    }
  };

  const handleCancel = () => {
    setSelectedReason(null);
    setNotes('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}>
            {/* Header */}
            <Text style={styles.title}>Cancel Workout</Text>
            <Text style={styles.subtitle}>
              Help us understand why you're skipping today's workout
            </Text>

            {/* Detraining Warning (if applicable) */}
            {detrainingWarning.shouldWarn && (
              <View style={[
                styles.warningCard,
                { 
                  backgroundColor: 
                    detrainingWarning.severity === 'severe' ? '#FFEBEE' :
                    detrainingWarning.severity === 'moderate' ? '#FFF3E0' :
                    '#FFF9C4'
                }
              ]}>
                <Text style={styles.warningIcon}>
                  {detrainingWarning.severity === 'severe' ? '⚠️' : '💡'}
                </Text>
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>
                    {detrainingWarning.severity === 'severe' ? 'Detraining Alert' : 'Heads Up'}
                  </Text>
                  <Text style={styles.warningText}>{detrainingWarning.message}</Text>
                </View>
              </View>
            )}

            {/* Reason Selection */}
            <Text style={styles.sectionTitle}>Reason for Missing</Text>
            
            {reasons.map((reason) => {
              const isSelected = selectedReason === reason.value;
              
              return (
                <TouchableOpacity
                  key={reason.value}
                  style={[
                    styles.reasonCard,
                    isSelected && styles.reasonCardSelected
                  ]}
                  onPress={() => setSelectedReason(reason.value)}
                >
                  <View style={styles.reasonHeader}>
                    <Text style={styles.reasonIcon}>{reason.icon}</Text>
                    <Text style={[
                      styles.reasonLabel,
                      isSelected && styles.reasonLabelSelected
                    ]}>
                      {reason.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.reasonDescription}>{reason.description}</Text>
                </TouchableOpacity>
              );
            })}

            {/* Notes Input */}
            <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional context..."
              multiline
              numberOfLines={3}
              maxLength={200}
            />

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Go Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedReason && styles.confirmButtonDisabled
                ]}
                onPress={handleConfirm}
                disabled={!selectedReason}
              >
                <Text style={styles.confirmButtonText}>Confirm Cancellation</Text>
              </TouchableOpacity>
            </View>

            {/* Info Footer */}
            <View style={styles.infoFooter}>
              <Text style={styles.infoIcon}>📊</Text>
              <Text style={styles.infoText}>
                This information helps us understand your training patterns and adjust your program if needed.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    ...shadows.xl,
  },
  scrollView: {
    padding: spacing.generous,
  },
  title: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: '#666666',
    marginBottom: spacing.generous,
  },
  warningCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 4,
  },
  warningText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#C62828',
    lineHeight: 18,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.md,
    marginTop: spacing.base,
  },
  reasonCard: {
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reasonCardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  reasonIcon: {
    fontSize: 20,
  },
  reasonLabel: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  reasonLabelSelected: {
    color: '#1565C0',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  reasonDescription: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
    marginLeft: 28,
  },
  notesInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    fontSize: 14,
    color: '#1a1a1a',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.base,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.base,
    marginBottom: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#F44336',
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.md,
  },
  confirmButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  confirmButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    marginBottom: spacing.generous,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    ...typography.bodySmall,
    fontSize: 11,
    color: '#666666',
    flex: 1,
    lineHeight: 16,
  },
});

export default MissedWorkoutDialog;
