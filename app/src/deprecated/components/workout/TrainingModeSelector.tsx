/**
 * TrainingModeSelector Component
 * 
 * User/trainer interface to choose between percentage and protocol training modes.
 * Explains differences, validates requirements, handles mode switching.
 * 
 * Two Modes:
 * - Percentage Mode: Formula-based, week cycling, predictable progression
 * - Protocol Mode: P1/P2/P3 based, earned progression, rep-out focused
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setTrainingMode } from '../../store/slices/userSlice';
import WorkoutEngineRouter from '../../services/WorkoutEngineRouter';
import { TrainingMode } from '../../types';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

interface TrainingModeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onModeSelected?: (mode: TrainingMode) => void;
}

export const TrainingModeSelector: React.FC<TrainingModeSelectorProps> = ({
  visible,
  onClose,
  onModeSelected,
}) => {
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector(state => state.user.profile?.trainingMode || 'percentage');
  const userProfile = useAppSelector(state => state.user.profile);
  const activeSession = useAppSelector(state => state.workout.activeSession);
  const activeHolds = useAppSelector(state => state.rehab.activeHolds);

  const [selectedMode, setSelectedMode] = useState<TrainingMode>(currentMode);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const modeInfo = {
    percentage: {
      name: 'Percentage Mode',
      emoji: '📊',
      tagline: 'Structured & Predictable',
      color: '#2196F3',
      benefits: [
        'Week-based percentage cycling',
        'Predictable progression (+5 lbs on success)',
        'Automated weight calculations',
        'Great for beginners and structured training',
        'Periodization built-in',
      ],
      bestFor: 'Beginners, structured progressors, limited time',
    },
    protocol: {
      name: 'Protocol Mode',
      emoji: '🎯',
      tagline: 'Test, Earn, Progress',
      color: '#FF5722',
      benefits: [
        'P1 Max Testing (earn your PRs)',
        'P2/P3 Rep-Out training (hypertrophy focus)',
        '4RM-based programming',
        'Readiness signals guide progression',
        'Coaching-style earned progression',
      ],
      bestFor: 'Intermediate/advanced, strength focus, testing mindset',
    },
  };

  const handleModeChange = () => {
    if (!userProfile) return;

    // Validate mode switch
    const validation = WorkoutEngineRouter.validateModeSwitch(
      currentMode,
      selectedMode,
      activeSession,
      activeHolds
    );

    if (!validation.safe) {
      // Show blockers
      alert(`Cannot switch modes:\n${validation.blockers.join('\n')}`);
      return;
    }

    // Show confirmation if there are warnings
    if (validation.warnings.length > 0 || selectedMode !== currentMode) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSwitch = () => {
    if (!userProfile) return;

    const result = WorkoutEngineRouter.switchTrainingMode(
      currentMode,
      selectedMode,
      userProfile
    );

    if (result.success) {
      dispatch(setTrainingMode(selectedMode));
      setShowConfirmation(false);
      onModeSelected?.(selectedMode);
      onClose();
    } else {
      alert(`Mode switch failed: ${result.message}`);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Training Mode</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Current Mode Indicator */}
        {currentMode && (
          <View style={styles.currentModeCard}>
            <Text style={styles.currentModeLabel}>Currently Using:</Text>
            <Text style={[styles.currentModeName, { color: modeInfo[currentMode].color }]}>
              {modeInfo[currentMode].emoji} {modeInfo[currentMode].name}
            </Text>
          </View>
        )}

        {/* Mode Options */}
        {(Object.keys(modeInfo) as TrainingMode[]).map((mode) => {
          const info = modeInfo[mode];
          const isSelected = selectedMode === mode;
          const isCurrent = currentMode === mode;

          return (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeCard,
                isSelected && { borderColor: info.color, borderWidth: 3 }
              ]}
              onPress={() => setSelectedMode(mode)}
              activeOpacity={0.8}
            >
              {/* Card Header */}
              <View style={styles.modeHeader}>
                <View style={styles.modeTitle}>
                  <Text style={styles.modeEmoji}>{info.emoji}</Text>
                  <View>
                    <Text style={styles.modeName}>{info.name}</Text>
                    <Text style={[styles.modeTagline, { color: info.color }]}>
                      {info.tagline}
                    </Text>
                  </View>
                </View>
                
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>CURRENT</Text>
                  </View>
                )}
                
                {isSelected && !isCurrent && (
                  <View style={[styles.selectedBadge, { backgroundColor: info.color }]}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </View>

              {/* Benefits List */}
              <View style={styles.benefitsList}>
                {info.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Text style={[styles.bulletPoint, { color: info.color }]}>•</Text>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              {/* Best For */}
              <View style={[styles.bestForCard, { backgroundColor: info.color + '15' }]}>
                <Text style={styles.bestForLabel}>Best for:</Text>
                <Text style={[styles.bestForText, { color: info.color }]}>
                  {info.bestFor}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Action Buttons */}
        {selectedMode !== currentMode && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.switchButton, { backgroundColor: modeInfo[selectedMode].color }]}
              onPress={handleModeChange}
            >
              <Text style={styles.switchButtonText}>
                Switch to {modeInfo[selectedMode].name}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Footer */}
        <View style={styles.infoFooter}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            You can change modes anytime in Settings. Your progress and maxes will be preserved.
          </Text>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationTitle}>Confirm Mode Switch</Text>
            
            <Text style={styles.confirmationText}>
              Switch from {modeInfo[currentMode].name} to {modeInfo[selectedMode].name}?
            </Text>

            {selectedMode === 'protocol' && (
              <View style={styles.conversionInfo}>
                <Text style={styles.conversionIcon}>🔄</Text>
                <Text style={styles.conversionText}>
                  Your 1RMs will be converted to estimated 4RMs (90% of 1RM). Complete P1 testing to verify actual 4RM.
                </Text>
              </View>
            )}

            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={styles.cancelConfirmButton}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.cancelConfirmText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmConfirmButton, { backgroundColor: modeInfo[selectedMode].color }]}
                onPress={handleConfirmSwitch}
              >
                <Text style={styles.confirmConfirmText}>Confirm Switch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  currentModeCard: {
    margin: spacing.base,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
  },
  currentModeLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
  },
  currentModeName: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
  },
  modeCard: {
    margin: spacing.base,
    marginTop: 0,
    padding: spacing.base,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    ...shadows.md,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  modeEmoji: {
    fontSize: 32,
  },
  modeName: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modeTagline: {
    ...typography.bodySmall,
    fontSize: 12,
    fontWeight: '600',
  },
  currentBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  currentBadgeText: {
    ...typography.labelSmall,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  benefitsList: {
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: spacing.sm,
    fontWeight: '700',
  },
  benefitText: {
    ...typography.body,
    fontSize: 13,
    color: '#1a1a1a',
    flex: 1,
  },
  bestForCard: {
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  bestForLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#666666',
    marginBottom: 4,
  },
  bestForText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtons: {
    margin: spacing.base,
  },
  switchButton: {
    paddingVertical: spacing.comfortable,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.lg,
  },
  switchButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.base,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
    flex: 1,
    lineHeight: 18,
  },
  
  // Confirmation Modal
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.generous,
    width: '100%',
    maxWidth: 400,
    ...shadows.xl,
  },
  confirmationTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  confirmationText: {
    ...typography.body,
    fontSize: 14,
    color: '#666666',
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  conversionInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
  },
  conversionIcon: {
    fontSize: 16,
  },
  conversionText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#E65100',
    flex: 1,
    lineHeight: 18,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelConfirmButton: {
    flex: 1,
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  cancelConfirmText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  confirmConfirmButton: {
    flex: 1,
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  confirmConfirmText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default TrainingModeSelector;
