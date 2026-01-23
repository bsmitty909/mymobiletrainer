/**
 * ModeMigrationWizard Component
 * 
 * Wizard to guide users through training mode conversion with data preservation.
 * Shows what will happen during migration and confirms user understanding.
 * 
 * Migration flows:
 * - Percentage → Protocol: 1RM converted to 4RM (90% of 1RM)
 * - Protocol → Percentage: 4RM converted back to 1RM
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { TrainingMode } from '../../types';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

interface ModeMigrationWizardProps {
  visible: boolean;
  currentMode: TrainingMode;
  targetMode: TrainingMode;
  maxCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ModeMigrationWizard: React.FC<ModeMigrationWizardProps> = ({
  visible,
  currentMode,
  targetMode,
  maxCount,
  onConfirm,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [understood, setUnderstood] = useState(false);

  const migrationInfo = currentMode === 'percentage' && targetMode === 'protocol'
    ? {
        title: 'Migrating to Protocol Mode',
        color: '#FF5722',
        emoji: '🎯',
        steps: [
          {
            title: 'Data Conversion',
            description: `Your ${maxCount} max lifts (1RM) will be converted to 4-rep maxes (4RM)`,
            detail: 'Formula: 4RM = 1RM × 90%',
            icon: '🔄',
          },
          {
            title: 'Verification Needed',
            description: 'Converted 4RMs are estimates and need to be verified through P1 testing',
            detail: 'Complete P1 testing for each exercise to establish true 4RM',
            icon: '✓',
          },
          {
            title: 'New Progression System',
            description: 'Your maxes will only increase through P1 testing (earned progression)',
            detail: 'Rep-outs in P2/P3 signal readiness but don\'t auto-increase maxes',
            icon: '📈',
          },
          {
            title: 'Ready to Start',
            description: 'You\'ll begin with P1/P2/P3 protocol workouts',
            detail: 'P1 for testing, P2 for volume, P3 for accessories',
            icon: '🚀',
          },
        ],
        warning: 'You should verify your 4RMs through P1 testing within the first 2 weeks',
      }
    : {
        title: 'Migrating to Percentage Mode',
        color: '#2196F3',
        emoji: '📊',
        steps: [
          {
            title: 'Data Conversion',
            description: `Your ${maxCount} 4-rep maxes will be converted to 1RMs`,
            detail: 'Formula: 1RM ≈ 4RM ÷ 0.90',
            icon: '🔄',
          },
          {
            title: 'Week-Based Cycling',
            description: 'You\'ll use week-based percentage calculations',
            detail: 'Week 1-2: 85%, Week 3: 75%, Week 4: Mixed protocol',
            icon: '📅',
          },
          {
            title: 'Auto-Progression',
            description: 'Weights will increase automatically when you hit target reps',
            detail: 'No more P1 testing required',
            icon: '⚡',
          },
          {
            title: 'Ready to Start',
            description: 'You\'ll begin with formula-based workouts',
            detail: 'Predictable progression based on percentages',
            icon: '🚀',
          },
        ],
        warning: 'Your training will become more automated and predictable',
      };

  const currentStep = migrationInfo.steps[step - 1];
  const isLastStep = step === migrationInfo.steps.length;

  const handleNext = () => {
    if (isLastStep) {
      if (understood) {
        onConfirm();
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onCancel}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: migrationInfo.color }]}>
          <Text style={styles.headerEmoji}>{migrationInfo.emoji}</Text>
          <Text style={styles.headerTitle}>{migrationInfo.title}</Text>
          <Text style={styles.headerStep}>Step {step} of {migrationInfo.steps.length}</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {migrationInfo.steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index < step && { backgroundColor: migrationInfo.color },
                  index === step - 1 && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Current Step */}
          <View style={styles.stepCard}>
            <Text style={styles.stepIcon}>{currentStep.icon}</Text>
            <Text style={styles.stepTitle}>{currentStep.title}</Text>
            <Text style={styles.stepDescription}>{currentStep.description}</Text>
            
            <View style={[styles.detailCard, { backgroundColor: migrationInfo.color + '10' }]}>
              <Text style={[styles.detailText, { color: migrationInfo.color }]}>
                {currentStep.detail}
              </Text>
            </View>
          </View>

          {/* Warning Card (last step) */}
          {isLastStep && (
            <View style={styles.warningCard}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Important</Text>
                <Text style={styles.warningText}>{migrationInfo.warning}</Text>
              </View>
            </View>
          )}

          {/* Understanding Checkbox (last step) */}
          {isLastStep && (
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setUnderstood(!understood)}
            >
              <View style={[
                styles.checkbox,
                understood && { backgroundColor: migrationInfo.color, borderColor: migrationInfo.color }
              ]}>
                {understood && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I understand how the migration works and want to proceed
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>
              {step === 1 ? 'Cancel' : 'Back'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: migrationInfo.color },
              isLastStep && !understood && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={isLastStep && !understood}
          >
            <Text style={styles.nextButtonText}>
              {isLastStep ? 'Confirm Migration' : 'Next'}
            </Text>
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
    padding: spacing.generous,
    paddingTop: spacing.huge,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  headerStep: {
    ...typography.body,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.generous,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    width: 30,
    borderRadius: 5,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.generous,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  stepIcon: {
    fontSize: 64,
    marginBottom: spacing.base,
  },
  stepTitle: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  stepDescription: {
    ...typography.body,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: spacing.base,
    lineHeight: 24,
  },
  detailCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    width: '100%',
  },
  detailText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.base,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 4,
  },
  warningText: {
    ...typography.bodySmall,
    fontSize: 13,
    color: '#BF360C',
    lineHeight: 19,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.base,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    ...typography.body,
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  backButton: {
    flex: 1,
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  backButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  nextButton: {
    flex: 2,
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.md,
  },
  nextButtonDisabled: {
    backgroundColor: '#BDBDBD',
    opacity: 0.5,
  },
  nextButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ModeMigrationWizard;
