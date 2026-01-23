/**
 * RehabModeToggle Component
 * 
 * Interface for entering/exiting rehab mode with required legal disclaimer.
 * 
 * Per PRD:
 * - Must accept disclaimer before activating
 * - Shows load reduction settings
 * - Displays pre-injury markers
 * - Provides recovery progress
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { acceptDisclaimer, activateRehabMode, deactivateRehabMode } from '../../store/slices/rehabSlice';
import RehabModeService from '../../services/RehabModeService';
import { InjurySeverity, MuscleGroup } from '../../types';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

interface RehabModeToggleProps {
  visible: boolean;
  onClose: () => void;
}

export const RehabModeToggle: React.FC<RehabModeToggleProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const rehabState = useAppSelector(state => state.rehab);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<InjurySeverity>('mild');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleGroup[]>([]);

  const disclaimer = RehabModeService.getRehabDisclaimer();

  const handleActivateRehab = () => {
    if (!rehabState.disclaimerAccepted) {
      setShowDisclaimer(true);
      return;
    }

    dispatch(activateRehabMode({
      severity: selectedSeverity,
      affectedMuscleGroups: selectedMuscleGroups,
    }));
    
    onClose();
  };

  const handleAcceptDisclaimer = () => {
    dispatch(acceptDisclaimer());
    setShowDisclaimer(false);
    
    // Now activate rehab mode
    dispatch(activateRehabMode({
      severity: selectedSeverity,
      affectedMuscleGroups: selectedMuscleGroups,
    }));
    
    onClose();
  };

  const handleDeactivate = () => {
    dispatch(deactivateRehabMode());
    onClose();
  };

  const toggleMuscleGroup = (muscleGroup: MuscleGroup) => {
    if (selectedMuscleGroups.includes(muscleGroup)) {
      setSelectedMuscleGroups(selectedMuscleGroups.filter(mg => mg !== muscleGroup));
    } else {
      setSelectedMuscleGroups([...selectedMuscleGroups, muscleGroup]);
    }
  };

  const severityConfig = {
    mild: {
      color: '#FFA726',
      loadReduction: 10,
      description: '10% load reduction - Minor discomfort',
    },
    moderate: {
      color: '#FF7043',
      loadReduction: 20,
      description: '20% load reduction - Noticeable pain',
    },
    severe: {
      color: '#F44336',
      loadReduction: 30,
      description: '30% load reduction - Significant injury',
    },
  };

  const muscleGroupOptions: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'
  ];

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
          <Text style={styles.headerTitle}>
            {rehabState.active ? '🏥 Rehab Mode Active' : '🏥 Enter Rehab Mode'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Current Status */}
        {rehabState.active ? (
          <View style={styles.activeCard}>
            <Text style={styles.activeTitle}>Rehab Mode is Currently Active</Text>
            <Text style={styles.activeDescription}>
              Load reduction and max testing are disabled to support your recovery.
            </Text>
            
            <TouchableOpacity
              style={styles.deactivateButton}
              onPress={handleDeactivate}
            >
              <Text style={styles.deactivateButtonText}>Exit Rehab Mode</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Severity Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Injury Severity</Text>
              
              {(Object.keys(severityConfig) as InjurySeverity[]).map((severity) => {
                const config = severityConfig[severity];
                const isSelected = selectedSeverity === severity;
                
                return (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.severityCard,
                      isSelected && { borderColor: config.color, borderWidth: 2 }
                    ]}
                    onPress={() => setSelectedSeverity(severity)}
                  >
                    <View style={styles.severityHeader}>
                      <Text style={[styles.severityName, { color: config.color }]}>
                        {severity.toUpperCase()}
                      </Text>
                      <View style={[styles.severityDot, { backgroundColor: config.color }]} />
                    </View>
                    <Text style={styles.severityDescription}>{config.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Muscle Group Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Affected Muscle Groups</Text>
              <Text style={styles.sectionSubtitle}>
                Select all muscle groups experiencing pain or injury
              </Text>
              
              <View style={styles.muscleGroupGrid}>
                {muscleGroupOptions.map((muscleGroup) => {
                  const isSelected = selectedMuscleGroups.includes(muscleGroup);
                  
                  return (
                    <TouchableOpacity
                      key={muscleGroup}
                      style={[
                        styles.muscleGroupChip,
                        isSelected && styles.muscleGroupChipSelected
                      ]}
                      onPress={() => toggleMuscleGroup(muscleGroup)}
                    >
                      <Text style={[
                        styles.muscleGroupChipText,
                        isSelected && styles.muscleGroupChipTextSelected
                      ]}>
                        {muscleGroup}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>What is Rehab Mode?</Text>
                <Text style={styles.infoText}>
                  • Reduces training loads by {severityConfig[selectedSeverity].loadReduction}%{'\n'}
                  • Reps remain 10-15 for movement quality{'\n'}
                  • Max testing is disabled{'\n'}
                  • Pain check-ins after sets{'\n'}
                  • Gradual progression as you recover
                </Text>
              </View>
            </View>

            {/* Activate Button */}
            <TouchableOpacity
              style={[
                styles.activateButton,
                selectedMuscleGroups.length === 0 && styles.activateButtonDisabled
              ]}
              onPress={handleActivateRehab}
              disabled={selectedMuscleGroups.length === 0}
            >
              <Text style={styles.activateButtonText}>
                {rehabState.disclaimerAccepted ? 'Activate Rehab Mode' : 'Review Disclaimer & Activate'}
              </Text>
            </TouchableOpacity>

            {selectedMuscleGroups.length === 0 && (
              <Text style={styles.validationText}>
                Select at least one affected muscle group
              </Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Disclaimer Modal */}
      <Modal
        visible={showDisclaimer}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDisclaimer(false)}
      >
        <View style={styles.disclaimerContainer}>
          <ScrollView style={styles.disclaimerScroll}>
            <Text style={styles.disclaimerTitle}>{disclaimer.title}</Text>
            
            <Text style={styles.disclaimerText}>{disclaimer.text}</Text>
            
            <View style={styles.disclaimerFooter}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAcceptDisclaimer}
              >
                <Text style={styles.acceptButtonText}>
                  ✓ {disclaimer.acknowledgment}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => setShowDisclaimer(false)}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  activeCard: {
    margin: spacing.base,
    padding: spacing.generous,
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  activeTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: spacing.sm,
  },
  activeDescription: {
    ...typography.body,
    fontSize: 14,
    color: '#1B5E20',
    marginBottom: spacing.base,
  },
  deactivateButton: {
    backgroundColor: '#F44336',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deactivateButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    margin: spacing.base,
    marginBottom: spacing.generous,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    fontSize: 13,
    color: '#666666',
    marginBottom: spacing.md,
  },
  severityCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  severityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  severityName: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  severityDescription: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
  },
  muscleGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  muscleGroupChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  muscleGroupChipSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  muscleGroupChipText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  muscleGroupChipTextSelected: {
    color: '#FFFFFF',
  },
  infoCard: {
    flexDirection: 'row',
    margin: spacing.base,
    padding: spacing.md,
    backgroundColor: '#E3F2FD',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#1565C0',
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#0D47A1',
    lineHeight: 18,
  },
  activateButton: {
    margin: spacing.base,
    backgroundColor: '#4CAF50',
    paddingVertical: spacing.comfortable,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.md,
  },
  activateButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  activateButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  validationText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  
  // Disclaimer Modal Styles
  disclaimerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  disclaimerScroll: {
    flex: 1,
    padding: spacing.generous,
  },
  disclaimerTitle: {
    ...typography.h1,
    fontSize: 24,
    fontWeight: '700',
    color: '#F44336',
    marginBottom: spacing.generous,
    textAlign: 'center',
  },
  disclaimerText: {
    ...typography.body,
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: spacing.generous,
  },
  disclaimerFooter: {
    gap: spacing.md,
    marginTop: spacing.generous,
    marginBottom: spacing.huge,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: spacing.comfortable,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.lg,
  },
  acceptButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  declineButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.comfortable,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  declineButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
});

export default RehabModeToggle;
