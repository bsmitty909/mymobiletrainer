/**
 * Body Visualization Component
 * 
 * Grid-based muscle group selector.
 * Users can tap muscle groups to filter exercises.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MuscleGroup } from '../../types';
import { useThemeColors } from '../../utils/useThemeColors';

interface BodyVisualizationProps {
  selectedMuscleGroup?: MuscleGroup | 'all';
  onMuscleGroupPress: (muscleGroup: MuscleGroup) => void;
}

interface MuscleCard {
  id: MuscleGroup;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  gradientColors: [string, string];
}

const muscleCards: MuscleCard[] = [
  { 
    id: 'shoulders', 
    label: 'Shoulders', 
    icon: 'chevron-up',
    gradientColors: ['#EF4444', '#DC2626']
  },
  { 
    id: 'chest', 
    label: 'Chest', 
    icon: 'arm-flex',
    gradientColors: ['#F59E0B', '#D97706']
  },
  { 
    id: 'back', 
    label: 'Back', 
    icon: 'arrow-expand-horizontal',
    gradientColors: ['#10B981', '#059669']
  },
  { 
    id: 'biceps', 
    label: 'Biceps', 
    icon: 'arm-flex-outline',
    gradientColors: ['#3B82F6', '#2563EB']
  },
  { 
    id: 'triceps', 
    label: 'Triceps', 
    icon: 'arm-flex',
    gradientColors: ['#8B5CF6', '#7C3AED']
  },
  { 
    id: 'legs', 
    label: 'Legs', 
    icon: 'run',
    gradientColors: ['#EC4899', '#DB2777']
  },
];

export default function BodyVisualization({ selectedMuscleGroup, onMuscleGroupPress }: BodyVisualizationProps) {
  const colors = useThemeColors();
  const isDark = colors.background === '#111827';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.surface : '#1F2937' }]}>
      <Text style={[styles.title, { color: '#FFFFFF' }]}>Target Muscles</Text>
      
      <View style={styles.grid}>
        {muscleCards.map((muscle) => {
          const isSelected = selectedMuscleGroup === muscle.id;
          return (
            <Pressable
              key={muscle.id}
              onPress={() => onMuscleGroupPress(muscle.id)}
              style={styles.cardWrapper}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={isSelected ? muscle.gradientColors : ['#374151', '#1F2937']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.card,
                    {
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.95 : isSelected ? 1.02 : 1 }],
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? '#FFFFFF' : '#4B5563',
                    },
                  ]}
                >
                  <MaterialCommunityIcons 
                    name={muscle.icon} 
                    size={32} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.cardLabel}>{muscle.label}</Text>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
                    </View>
                  )}
                </LinearGradient>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.hintContainer}>
        <Text style={[styles.hint, { color: '#9CA3AF' }]}>
          Tap a muscle group to filter exercises
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  cardWrapper: {
    width: '30%',
    aspectRatio: 1,
    minWidth: 100,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
  },
  cardLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  hintContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});
