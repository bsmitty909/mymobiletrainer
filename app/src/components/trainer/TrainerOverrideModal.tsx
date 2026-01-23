/**
 * TrainerOverrideModal
 * 
 * Allows trainers to override protocol assignments and workout logic.
 * All overrides are logged with reasoning for accountability.
 * 
 * Override Types:
 * - Protocol reorder (change P1/P2/P3 assignment)
 * - Force rehab mode
 * - Adjust intensity manually
 * - Assign exercise alternatives
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import TrainerService from '../../services/TrainerService';
import { TrainerOverrideType, Protocol } from '../../types';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

interface TrainerOverrideModalProps {
  visible: boolean;
  clientId: string;
  trainerId: string;
  onClose: () => void;
  onOverrideCreated: (override: any) => void;
}

export const TrainerOverrideModal: React.FC<TrainerOverrideModalProps> = ({
  visible,
  clientId,
  trainerId,
  onClose,
  onOverrideCreated,
}) => {
  const [overrideType, setOverrideType] = useState<TrainerOverrideType | null>(null);
  const [reason, setReason] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [exerciseId, setExerciseId] = useState('');
  const [intensityAdjustment, setIntensityAdjustment] = useState('0');

  const overrideOptions: { type: TrainerOverrideType; label: string; icon: string; color: string }[] = [
    { type: 'protocol_change', label: 'Change Protocol Assignment', icon: '🔄', color: '#2196F3' },
    { type: 'force_rehab', label: 'Force Rehab Mode', icon: '🏥', color: '#FF9800' },
    { type: 'adjust_intensity', label: 'Adjust Intensity', icon: '⚡', color: '#9C27B0' },
    { type: 'exercise_swap', label: 'Assign Alternative Exercise', icon: '↔️', color: '#4CAF50' },
  ];

  const handleCreateOverride = () => {
    if (!overrideType || !reason.trim()) {
      alert('Please select override type and provide reason');
      return;
    }

    let details: any = {};

    switch (overrideType) {
      case 'protocol_change':
        if (!selectedProtocol || !exerciseId) {
          alert('Please select protocol and exercise');
          return;
        }
        details = { newProtocol: selectedProtocol, exerciseId };
        break;
      
      case 'force_rehab':
        details = { reason: 'trainer_initiated' };
        break;
      
      case 'adjust_intensity':
        const adjustment = parseInt(intensityAdjustment);
        if (isNaN(adjustment) || adjustment < -30 || adjustment > 30) {
          alert('Intensity adjustment must be between -30% and +30%');
          return;
        }
        details = { intensityAdjustment: adjustment };
        break;
      
      case 'exercise_swap':
        if (!exerciseId) {
          alert('Please specify exercise');
          return;
        }
        details = { alternativeExercise: exerciseId };
        break;
    }

    const override = TrainerService.createOverride(
      trainerId,
      clientId,
      overrideType,
      details,
      reason,
      exerciseId || undefined
    );

    onOverrideCreated(override);
    handleClose();
  };

  const handleClose = () => {
    setOverrideType(null);
    setReason('');
    setSelectedProtocol(null);
    setExerciseId('');
    setIntensityAdjustment('0');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.backButton}>✕ Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trainer Override</Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Override Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Override Type</Text>
            {overrideOptions.map(option => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.optionCard,
                  overrideType === option.type && { borderColor: option.color, borderWidth: 3 }
                ]}
                onPress={() => setOverrideType(option.type)}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {overrideType === option.type && (
                  <View style={[styles.selectedBadge, { backgroundColor: option.color }]}>
                    <Text style={styles.selectedCheck}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Override-Specific Inputs */}
          {overrideType === 'protocol_change' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Protocol Assignment</Text>
              
              <Text style={styles.label}>Exercise ID:</Text>
              <TextInput
                style={styles.input}
                value={exerciseId}
                onChangeText={setExerciseId}
                placeholder="e.g., bench-press"
              />

              <Text style={styles.label}>New Protocol:</Text>
              <View style={styles.protocolButtons}>
                {(['P1', 'P2', 'P3'] as Protocol[]).map(protocol => (
                  <TouchableOpacity
                    key={protocol}
                    style={[
                      styles.protocolButton,
                      selectedProtocol === protocol && styles.protocolButtonSelected
                    ]}
                    onPress={() => setSelectedProtocol(protocol)}
                  >
                    <Text style={[
                      styles.protocolButtonText,
                      selectedProtocol === protocol && styles.protocolButtonTextSelected
                    ]}>
                      {protocol}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {overrideType === 'adjust_intensity' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Intensity Adjustment</Text>
              
              <Text style={styles.label}>Adjustment (-30% to +30%):</Text>
              <TextInput
                style={styles.input}
                value={intensityAdjustment}
                onChangeText={setIntensityAdjustment}
                keyboardType="numeric"
                placeholder="e.g., -10"
              />
              
              <Text style={styles.helperText}>
                Negative values reduce load, positive values increase load
              </Text>
            </View>
          )}

          {overrideType === 'exercise_swap' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Exercise Substitution</Text>
              
              <Text style={styles.label}>Original Exercise ID:</Text>
              <TextInput
                style={styles.input}
                value={exerciseId}
                onChangeText={setExerciseId}
                placeholder="e.g., bench-press"
              />
              
              <Text style={styles.helperText}>
                Alternative exercise will be suggested based on muscle groups and equipment
              </Text>
            </View>
          )}

          {overrideType === 'force_rehab' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Force Rehab Mode</Text>
              
              <View style={styles.warningCard}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>
                  This will activate rehab mode for the client with default load reduction. Explain your reasoning below.
                </Text>
              </View>
            </View>
          )}

          {/* Reason Input */}
          {overrideType && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reason for Override *</Text>
              <TextInput
                style={styles.textArea}
                value={reason}
                onChangeText={setReason}
                placeholder="Explain why this override is necessary..."
                multiline
                numberOfLines={4}
              />
              <Text style={styles.helperText}>
                Required for accountability and client transparency
              </Text>
            </View>
          )}

          {/* Warning */}
          <View style={styles.accountabilityCard}>
            <Text style={styles.accountabilityIcon}>📝</Text>
            <View style={styles.accountabilityContent}>
              <Text style={styles.accountabilityTitle}>Logged Override</Text>
              <Text style={styles.accountabilityText}>
                This override will be logged with your trainer ID, timestamp, and reasoning. Clients can view override history.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.createButton,
              (!overrideType || !reason.trim()) && styles.createButtonDisabled
            ]}
            onPress={handleCreateOverride}
            disabled={!overrideType || !reason.trim()}
          >
            <Text style={styles.createButtonText}>Create Override</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: spacing.huge,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    ...typography.body,
    fontSize: 15,
    color: '#F44336',
    fontWeight: '600',
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: spacing.base,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    ...shadows.sm,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionLabel: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheck: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...typography.body,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#999999',
    marginTop: spacing.sm,
  },
  protocolButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  protocolButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  protocolButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  protocolButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: '#666666',
  },
  protocolButtonTextSelected: {
    color: '#FFFFFF',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#FFF3E0',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  warningIcon: {
    fontSize: 20,
  },
  warningText: {
    ...typography.bodySmall,
    fontSize: 13,
    color: '#E65100',
    flex: 1,
    lineHeight: 19,
  },
  accountabilityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    margin: spacing.base,
    padding: spacing.md,
    backgroundColor: '#E3F2FD',
    borderRadius: borderRadius.md,
  },
  accountabilityIcon: {
    fontSize: 20,
  },
  accountabilityContent: {
    flex: 1,
  },
  accountabilityTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#1565C0',
    marginBottom: 4,
  },
  accountabilityText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  createButton: {
    flex: 2,
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: '#2196F3',
    ...shadows.md,
  },
  createButtonDisabled: {
    backgroundColor: '#BDBDBD',
    opacity: 0.5,
  },
  createButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default TrainerOverrideModal;
