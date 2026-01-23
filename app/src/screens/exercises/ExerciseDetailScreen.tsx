// @ts-nocheck
/**
 * Exercise Detail Screen
 * 
 * Displays detailed information about a specific exercise including:
 * - Video demonstration
 * - Instructions
 * - Form tips
 * - Muscle groups targeted
 * - Equipment required
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { getExerciseById, getExerciseVariants } from '../../constants/exercises';
import { useThemeColors } from '../../utils/useThemeColors';
import VideoPlayerModal from '../../components/workout/VideoPlayerModal';

type ExerciseDetailRouteProp = RouteProp<{ ExerciseDetail: { exerciseId: string } }, 'ExerciseDetail'>;

const { width } = Dimensions.get('window');

export default function ExerciseDetailScreen() {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute<ExerciseDetailRouteProp>();
  const { exerciseId } = route.params;
  
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  const exercise = getExerciseById(exerciseId);
  const variants = getExerciseVariants(exerciseId);

  if (!exercise) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>Exercise not found</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const instructionSteps = exercise.instructions
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^\d+\.\s*/, ''));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Thumbnail */}
        <TouchableOpacity
          style={[styles.videoContainer, { backgroundColor: colors.surface }]}
          onPress={() => setShowVideoModal(true)}
        >
          <View style={styles.videoPlaceholder}>
            <MaterialCommunityIcons name="play-circle" size={64} color={colors.primary} />
            <Text style={[styles.videoText, { color: colors.text }]}>Watch Demonstration</Text>
          </View>
        </TouchableOpacity>

        {/* Primary Info Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="information" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Exercise Info</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name={getEquipmentIcon(exercise.equipmentType)} size={20} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Equipment:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {exercise.equipmentType.charAt(0).toUpperCase() + exercise.equipmentType.slice(1)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="target" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Primary:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {exercise.primaryMuscle.charAt(0).toUpperCase() + exercise.primaryMuscle.slice(1)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="arm-flex" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Muscles:</Text>
            <View style={styles.muscleGroupChips}>
              {exercise.muscleGroups.map((muscle, index) => (
                <View key={index} style={[styles.muscleChip, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.muscleChipText, { color: colors.primary }]}>
                    {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {exercise.incrementSize && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="weight" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Increment:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {exercise.incrementSize} lbs
              </Text>
            </View>
          )}
        </View>

        {/* Instructions Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="format-list-numbered" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>How to Perform</Text>
          </View>
          {instructionSteps.map((step, index) => (
            <View key={index} style={styles.instructionStep}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Form Tips Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Form Tips</Text>
          </View>
          {exercise.formTips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <MaterialCommunityIcons name="check-circle" size={16} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Variants Card */}
        {variants.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="swap-horizontal" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Alternative Exercises</Text>
            </View>
            {variants.map((variant, index) => (
              <View key={variant.id} style={[styles.variantRow, index > 0 && styles.variantRowBorder, { borderTopColor: colors.border }]}>
                <View style={styles.variantInfo}>
                  <Text style={[styles.variantName, { color: colors.text }]}>{variant.name}</Text>
                  <Text style={[styles.variantEquipment, { color: colors.textSecondary }]}>
                    {variant.equipmentType.charAt(0).toUpperCase() + variant.equipmentType.slice(1)}
                  </Text>
                </View>
                <View style={[styles.equivalenceBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.equivalenceText, { color: colors.primary }]}>
                    {Math.round(variant.equivalenceRatio * 100)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Video Modal */}
      {showVideoModal && (
        <VideoPlayerModal
          visible={showVideoModal}
          videoUrl={exercise.videoUrl}
          exerciseName={exercise.name}
          onDismiss={() => setVideoModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

function getEquipmentIcon(equipmentType: string): keyof typeof MaterialCommunityIcons.glyphMap {
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    width: width,
    height: width * 0.5625, // 16:9 aspect ratio
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    alignItems: 'center',
    gap: 12,
  },
  videoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  muscleGroupChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 6,
  },
  muscleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  muscleChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 4,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  variantRowBorder: {
    borderTopWidth: 1,
  },
  variantInfo: {
    flex: 1,
  },
  variantName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  variantEquipment: {
    fontSize: 12,
  },
  equivalenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  equivalenceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 32,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
