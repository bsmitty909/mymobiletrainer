/**
 * Max Lifts Screen
 * 
 * View and manage personal record (PR) lifts for all exercises
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, FAB, Portal, Modal, Button } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { updateMaxLifts } from '../../store/slices/userSlice';
import Input from '../../components/common/Input';
import StorageService from '../../services/StorageService';
import useThemeColors from '../../utils/useThemeColors';

export default function MaxLiftsScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const userProfile = useAppSelector((state) => state.user.profile);
  const userMaxes = userProfile?.maxLifts || {};
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [maxReps, setMaxReps] = useState('1');

  const handleEditMax = (exerciseId: string, currentMax: number) => {
    setSelectedExercise(exerciseId);
    setExerciseName(exerciseId);
    setMaxWeight(currentMax.toString());
    setMaxReps('1');
    setEditModalVisible(true);
  };

  const handleSaveMax = async () => {
    const weight = parseFloat(maxWeight);
    const reps = parseInt(maxReps, 10);

    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return;
    }

    if (isNaN(reps) || reps <= 0) {
      Alert.alert('Invalid Reps', 'Please enter a valid number of reps.');
      return;
    }

    const exerciseId = selectedExercise || exerciseName.toLowerCase().replace(/\s+/g, '-');

    try {
      dispatch(updateMaxLifts({ exerciseId, weight, reps }));
      
      const updatedMaxes = {
        ...userMaxes,
        [exerciseId]: {
          id: `max-${Date.now()}`,
          userId: userProfile?.userId || 'user1',
          exerciseId,
          weight,
          reps,
          dateAchieved: Date.now(),
          verified: true,
        },
      };
      await StorageService.saveMaxes(updatedMaxes);

      Alert.alert('Success', 'Max lift saved!');
      setEditModalVisible(false);
      setSelectedExercise(null);
      setExerciseName('');
      setMaxWeight('');
      setMaxReps('1');
    } catch (error) {
      Alert.alert('Error', 'Failed to save max lift.');
      console.error('Error saving max:', error);
    }
  };

  const handleAddNew = () => {
    setSelectedExercise(null);
    setExerciseName('');
    setMaxWeight('');
    setMaxReps('1');
    setEditModalVisible(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const maxLiftsArray = Object.values(userMaxes || {});

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      marginTop: 100,
    },
    emptyTitle: {
      marginBottom: 12,
      textAlign: 'center',
      color: colors.text,
    },
    emptyDescription: {
      textAlign: 'center',
      color: colors.textSecondary,
    },
    list: {
      paddingVertical: 8,
    },
    sectionTitle: {
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 8,
      color: colors.primary,
      fontWeight: 'bold',
    },
    sectionTitleSpaced: {
      marginTop: 16,
    },
    listItem: {
      backgroundColor: colors.surface,
      marginVertical: 1,
    },
    maxValue: {
      flexDirection: 'row',
      alignItems: 'baseline',
      paddingRight: 8,
    },
    weight: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    unit: {
      marginLeft: 4,
      color: colors.textSecondary,
    },
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      backgroundColor: colors.primary,
    },
    modal: {
      backgroundColor: colors.surface,
      padding: 24,
      margin: 20,
      borderRadius: 8,
    },
    modalTitle: {
      marginBottom: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    input: {
      marginVertical: 8,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 24,
      gap: 12,
    },
    modalButton: {
      minWidth: 100,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {maxLiftsArray.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="headlineMedium" style={styles.emptyTitle}>
              No Max Lifts Yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptyDescription}>
              Complete your first max determination week or add maxes manually
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Primary Lifts
            </Text>
            
            {maxLiftsArray
              .filter((max) => 
                ['bench-press', 'squat', 'deadlift', 'shoulder-press'].includes(max.exerciseId)
              )
              .map((max) => (
                <List.Item
                  key={max.id}
                  title={max.exerciseId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  description={`Achieved on ${formatDate(max.dateAchieved)}`}
                  left={props => <List.Icon {...props} icon="weight-lifter" />}
                  right={() => (
                    <View style={styles.maxValue}>
                      <Text variant="titleLarge" style={styles.weight}>
                        {max.weight}
                      </Text>
                      <Text variant="bodySmall" style={styles.unit}>
                        lbs
                      </Text>
                    </View>
                  )}
                  onPress={() => handleEditMax(max.exerciseId, max.weight)}
                  style={styles.listItem}
                />
              ))}

            <Text variant="titleMedium" style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
              Accessory Exercises
            </Text>
            
            {maxLiftsArray
              .filter((max) => 
                !['bench-press', 'squat', 'deadlift', 'shoulder-press'].includes(max.exerciseId)
              )
              .map((max) => (
                <List.Item
                  key={max.id}
                  title={max.exerciseId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  description={`Achieved on ${formatDate(max.dateAchieved)}`}
                  left={props => <List.Icon {...props} icon="dumbbell" />}
                  right={() => (
                    <View style={styles.maxValue}>
                      <Text variant="titleLarge" style={styles.weight}>
                        {max.weight}
                      </Text>
                      <Text variant="bodySmall" style={styles.unit}>
                        lbs
                      </Text>
                    </View>
                  )}
                  onPress={() => handleEditMax(max.exerciseId, max.weight)}
                  style={styles.listItem}
                />
              ))}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddNew}
        label="Add Max"
      />

      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            {selectedExercise ? 'Edit Max Lift' : 'Add New Max Lift'}
          </Text>
          
          {!selectedExercise && (
            <Input
              label="Exercise Name"
              placeholder="e.g., Bench Press"
              style={styles.input}
            />
          )}
          
          <Input
            label="Weight (lbs)"
            value={maxWeight}
            onChangeText={setMaxWeight}
            keyboardType="numeric"
            placeholder="0"
            style={styles.input}
          />
          
          <Input
            label="Reps"
            value={maxReps}
            onChangeText={setMaxReps}
            keyboardType="numeric"
            placeholder="1"
            style={styles.input}
            helperText="Usually 1 for true max lifts"
          />
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setEditModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveMax}
              style={styles.modalButton}
              disabled={!maxWeight}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}
