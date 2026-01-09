/**
 * Exercise Substitution Modal
 * 
 * Allows users to substitute an exercise with an alternative when equipment
 * is unavailable or they want to use a variant.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  addExerciseSubstitution,
  setPermanentSubstitution,
  updateMaxLifts,
} from '../../store/slices/userSlice';
import ExerciseSubstitutionService, { SubstituteOption } from '../../services/ExerciseSubstitutionService';
import { getExerciseById } from '../../constants/exercises';
import { useThemeColors } from '../../utils/useThemeColors';

interface ExerciseSubstitutionModalProps {
  visible: boolean;
  exerciseId: string;
  currentMax: number;
  weekNumber: number;
  dayNumber: number;
  onClose: () => void;
  onSubstitute: (substituteId: string, variantId?: string, adjustedMax?: number) => void;
}

export const ExerciseSubstitutionModal: React.FC<ExerciseSubstitutionModalProps> = ({
  visible,
  exerciseId,
  currentMax,
  weekNumber,
  dayNumber,
  onClose,
  onSubstitute,
}) => {
  const dispatch = useDispatch();
  const colors = useThemeColors();
  const [selectedSubstitute, setSelectedSubstitute] = useState<SubstituteOption | null>(null);
  const [makePermanent, setMakePermanent] = useState(false);

  const userId = useSelector((state: RootState) => state.user.currentUser?.id);
  const permanentSubs = useSelector((state: RootState) => 
    state.user.profile?.permanentSubstitutions || {}
  );

  const exercise = useMemo(() => getExerciseById(exerciseId), [exerciseId]);
  
  const substitutes = useMemo(() => {
    if (!exercise) return [];
    return ExerciseSubstitutionService.getAvailableSubstitutes(exerciseId, currentMax);
  }, [exerciseId, currentMax, exercise]);

  const handleSelectSubstitute = (substitute: SubstituteOption) => {
    setSelectedSubstitute(substitute);
  };

  const handleConfirm = () => {
    if (!selectedSubstitute || !userId) return;

    const substituteId = selectedSubstitute.isVariant 
      ? selectedSubstitute.primaryExerciseId!
      : ('id' in selectedSubstitute.exercise ? selectedSubstitute.exercise.id : '');

    const variantId = selectedSubstitute.isVariant 
      ? selectedSubstitute.variantId 
      : undefined;

    // Create substitution record
    const substitution = ExerciseSubstitutionService.createSubstitution(
      userId,
      exerciseId,
      substituteId,
      variantId,
      weekNumber,
      dayNumber,
      selectedSubstitute.reason,
      makePermanent
    );

    dispatch(addExerciseSubstitution(substitution));

    // If permanent, update permanent substitutions
    if (makePermanent) {
      dispatch(setPermanentSubstitution({
        originalExerciseId: exerciseId,
        substituteExerciseId: substituteId,
      }));

      // Update the max for the substitute exercise
      dispatch(updateMaxLifts({
        exerciseId: substituteId,
        weight: selectedSubstitute.adjustedMax,
        reps: 1,
      }));
    }

    // Call the callback with the substitute info
    onSubstitute(substituteId, variantId, selectedSubstitute.adjustedMax);
    
    // Reset and close
    setSelectedSubstitute(null);
    setMakePermanent(false);
    onClose();
  };

  const handleCancel = () => {
    setSelectedSubstitute(null);
    setMakePermanent(false);
    onClose();
  };

  if (!exercise) return null;

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Substitute Exercise</Text>
            <Text style={styles.headerSubtitle}>
              Can't do {exercise.name}?
            </Text>
          </View>

          {/* Substitute Options */}
          <ScrollView style={styles.scrollView}>
            <Text style={styles.sectionTitle}>Available Alternatives:</Text>
            
            {substitutes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No suitable substitutes found for this exercise.
                </Text>
              </View>
            ) : (
              substitutes.map((substitute, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.substituteCard,
                    selectedSubstitute === substitute && styles.selectedCard,
                  ]}
                  onPress={() => handleSelectSubstitute(substitute)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.exerciseName}>
                      {'name' in substitute.exercise ? substitute.exercise.name : ''}
                    </Text>
                    {substitute.isVariant && (
                      <View style={styles.variantBadge}>
                        <Text style={styles.variantText}>Variant</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.equipmentRow}>
                    <Text style={styles.equipmentLabel}>Equipment:</Text>
                    <Text style={styles.equipmentValue}>
                      {'equipmentType' in substitute.exercise 
                        ? substitute.exercise.equipmentType 
                        : ''}
                    </Text>
                  </View>

                  <View style={styles.weightAdjustment}>
                    <Text style={styles.adjustmentLabel}>Weight Adjustment:</Text>
                    <View style={styles.weightRow}>
                      <Text style={styles.originalWeight}>{currentMax} lbs</Text>
                      <Text style={styles.arrow}>→</Text>
                      <Text style={styles.adjustedWeight}>
                        {substitute.adjustedMax} lbs
                      </Text>
                      <Text style={styles.percentage}>
                        ({Math.round(substitute.equivalenceRatio * 100)}%)
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.reason}>{substitute.reason}</Text>

                  {selectedSubstitute === substitute && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedText}>✓ Selected</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Make Permanent Option */}
          {selectedSubstitute && (
            <TouchableOpacity
              style={styles.permanentOption}
              onPress={() => setMakePermanent(!makePermanent)}
            >
              <View style={[styles.checkbox, makePermanent && styles.checkboxChecked]}>
                {makePermanent && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.permanentTextContainer}>
                <Text style={styles.permanentLabel}>
                  Always use this substitute
                </Text>
                <Text style={styles.permanentDescription}>
                  Future workouts will automatically use this exercise instead
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                !selectedSubstitute && styles.buttonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedSubstitute}
            >
              <Text style={styles.confirmButtonText}>
                {makePermanent ? 'Set Permanent' : 'Use Once'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  scrollView: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    padding: 16,
    paddingBottom: 8,
  },
  substituteCard: {
    margin: 12,
    marginTop: 8,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  variantBadge: {
    backgroundColor: colors.info,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  variantText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  equipmentRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  equipmentLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginRight: 8,
  },
  equipmentValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  weightAdjustment: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  adjustmentLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 8,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalWeight: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 16,
    color: colors.secondaryText,
    marginHorizontal: 8,
  },
  adjustedWeight: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  percentage: {
    fontSize: 14,
    color: colors.secondaryText,
    marginLeft: 8,
  },
  reason: {
    fontSize: 14,
    color: colors.secondaryText,
    fontStyle: 'italic',
    marginTop: 8,
  },
  selectedIndicator: {
    marginTop: 12,
    padding: 8,
    backgroundColor: colors.success,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  permanentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permanentTextContainer: {
    flex: 1,
  },
  permanentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  permanentDescription: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExerciseSubstitutionModal;
