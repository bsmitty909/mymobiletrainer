/**
 * Exercise Library Screen
 * 
 * Browse all available exercises with search and filtering capabilities.
 * Displays exercises organized by muscle groups with equipment filtering.
 * Includes interactive body visualization for muscle selection.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { exercises } from '../../constants/exercises';
import { Exercise, MuscleGroup, EquipmentType } from '../../types';
import { useThemeColors } from '../../utils/useThemeColors';
import BodyVisualization from '../../components/exercises/BodyVisualization';

const MUSCLE_GROUPS: { key: MuscleGroup | 'all'; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'view-grid' },
  { key: 'chest', label: 'Chest', icon: 'arm-flex' },
  { key: 'back', label: 'Back', icon: 'arrow-expand-horizontal' },
  { key: 'legs', label: 'Legs', icon: 'run' },
  { key: 'shoulders', label: 'Shoulders', icon: 'chevron-up' },
  { key: 'biceps', label: 'Biceps', icon: 'arm-flex-outline' },
  { key: 'triceps', label: 'Triceps', icon: 'arm-flex' },
];

const EQUIPMENT_TYPES: { key: EquipmentType | 'all'; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'filter-variant' },
  { key: 'barbell', label: 'Barbell', icon: 'weight-lifter' },
  { key: 'dumbbell', label: 'Dumbbell', icon: 'dumbbell' },
  { key: 'machine', label: 'Machine', icon: 'cog' },
  { key: 'cable', label: 'Cable', icon: 'link-variant' },
  { key: 'bodyweight', label: 'Bodyweight', icon: 'human-handsup' },
];

export default function ExerciseLibraryScreen() {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');
  const [showBodyViz, setShowBodyViz] = useState(true);

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           exercise.muscleGroups.some(mg => mg.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesMuscleGroup = selectedMuscleGroup === 'all' || 
                                 exercise.muscleGroups.includes(selectedMuscleGroup);
      
      const matchesEquipment = selectedEquipment === 'all' || 
                              exercise.equipmentType === selectedEquipment;

      return matchesSearch && matchesMuscleGroup && matchesEquipment;
    });
  }, [searchQuery, selectedMuscleGroup, selectedEquipment]);

  const groupedExercises = useMemo(() => {
    if (selectedMuscleGroup !== 'all') {
      return [{ title: selectedMuscleGroup.charAt(0).toUpperCase() + selectedMuscleGroup.slice(1), data: filteredExercises }];
    }

    const groups: { title: string; data: Exercise[] }[] = [];
    const muscleGroupOrder: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps'];

    muscleGroupOrder.forEach(muscleGroup => {
      const exercisesForGroup = filteredExercises.filter(ex => ex.primaryMuscle === muscleGroup);
      if (exercisesForGroup.length > 0) {
        groups.push({
          title: muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1),
          data: exercisesForGroup,
        });
      }
    });

    return groups;
  }, [filteredExercises, selectedMuscleGroup]);

  const handleExercisePress = (exercise: Exercise) => {
    (navigation as any).navigate('ExerciseDetail', { exerciseId: exercise.id });
  };

  const handleBodyMusclePress = (muscleGroup: MuscleGroup) => {
    setSelectedMuscleGroup(muscleGroup);
    setShowBodyViz(false);
  };

  const renderExerciseCard = (exercise: Exercise) => (
    <Pressable
      key={exercise.id}
      style={({ pressed }) => [
        styles.exerciseCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={() => handleExercisePress(exercise)}
    >
      <View style={styles.exerciseCardContent}>
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, { color: colors.text }]}>{exercise.name}</Text>
          <View style={styles.exerciseMetadata}>
            <View style={[styles.equipmentBadge, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons 
                name={getEquipmentIcon(exercise.equipmentType)} 
                size={12} 
                color={colors.primary} 
              />
              <Text style={[styles.equipmentText, { color: colors.primary }]}>
                {exercise.equipmentType}
              </Text>
            </View>
            <View style={styles.muscleGroupTags}>
              {exercise.muscleGroups.slice(0, 2).map((mg, index) => (
                <Text key={index} style={[styles.muscleGroupTag, { color: colors.textSecondary }]}>
                  {mg}
                </Text>
              ))}
              {exercise.muscleGroups.length > 2 && (
                <Text style={[styles.muscleGroupTag, { color: colors.textSecondary }]}>
                  +{exercise.muscleGroups.length - 2}
                </Text>
              )}
            </View>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Exercise Library</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.vizToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowBodyViz(!showBodyViz)}
        >
          <MaterialCommunityIcons 
            name={showBodyViz ? "format-list-bulleted" : "human"} 
            size={20} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Body Visualization */}
        {showBodyViz && (
          <BodyVisualization
            selectedMuscleGroup={selectedMuscleGroup}
            onMuscleGroupPress={handleBodyMusclePress}
          />
        )}

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Muscle Group Filter */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            {MUSCLE_GROUPS.map(group => (
              <TouchableOpacity
                key={group.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedMuscleGroup === group.key ? colors.primary : colors.surface,
                    borderColor: selectedMuscleGroup === group.key ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedMuscleGroup(group.key)}
              >
                <MaterialCommunityIcons
                  name={group.icon}
                  size={16}
                  color={selectedMuscleGroup === group.key ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    { color: selectedMuscleGroup === group.key ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {group.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Equipment Filter */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            {EQUIPMENT_TYPES.map(equipment => (
              <TouchableOpacity
                key={equipment.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedEquipment === equipment.key ? colors.primary : colors.surface,
                    borderColor: selectedEquipment === equipment.key ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedEquipment(equipment.key)}
              >
                <MaterialCommunityIcons
                  name={equipment.icon}
                  size={16}
                  color={selectedEquipment === equipment.key ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    { color: selectedEquipment === equipment.key ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {equipment.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseListContainer}>
          {groupedExercises.map(group => (
            <View key={group.title} style={styles.groupSection}>
              <Text style={[styles.groupTitle, { color: colors.text }]}>{group.title}</Text>
              {group.data.map(exercise => renderExerciseCard(exercise))}
            </View>
          ))}
          
          {filteredExercises.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="dumbbell" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No exercises found
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                Try adjusting your filters or search
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getEquipmentIcon(equipmentType: EquipmentType): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (equipmentType) {
    case 'barbell': return 'weight-lifter';
    case 'dumbbell': return 'dumbbell';
    case 'machine': return 'cog';
    case 'cable': return 'link-variant';
    case 'bodyweight': return 'human-handsup';
    default: return 'dumbbell';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  vizToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseListContainer: {
    paddingBottom: 20,
  },
  groupSection: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  exerciseCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  exerciseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  exerciseMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  equipmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  equipmentText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  muscleGroupTags: {
    flexDirection: 'row',
    gap: 6,
  },
  muscleGroupTag: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
});
