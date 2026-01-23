/**
 * TrainingModeOnboardingScreen
 * 
 * Guides new users through training mode selection during initial setup.
 * Explains both modes and helps users choose based on experience and goals.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '../../store/store';
import { setTrainingMode } from '../../store/slices/userSlice';
import WorkoutEngineRouter from '../../services/WorkoutEngineRouter';
import { TrainingMode, ExperienceLevel } from '../../types';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

interface TrainingModeOnboardingScreenProps {
  route?: {
    params?: {
      experienceLevel?: ExperienceLevel;
      trainingGoal?: 'strength' | 'hypertrophy' | 'general';
      onModeSelected?: (mode: TrainingMode) => void;
    };
  };
}

type NavigationProp = NativeStackNavigationProp<any>;

export default function TrainingModeOnboardingScreen({ route }: TrainingModeOnboardingScreenProps) {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  
  // Use defaults if params not provided (e.g., during initial onboarding)
  const experienceLevel = route?.params?.experienceLevel || 'beginner';
  const trainingGoal = route?.params?.trainingGoal || 'general';
  const onModeSelected = route?.params?.onModeSelected;

  const [selectedMode, setSelectedMode] = useState<TrainingMode | null>(null);

  const recommendation = WorkoutEngineRouter.recommendMode(
    experienceLevel,
    trainingGoal,
    'moderate' // Assume moderate time availability
  );

  const modeDetails = {
    percentage: {
      emoji: '📊',
      name: 'Percentage Mode',
      tagline: 'Structured & Predictable',
      color: '#2196F3',
      howItWorks: [
        'Week-based training cycles (4 weeks)',
        'Automated weight calculations from your maxes',
        'Hit target reps → weight increases automatically',
        'Perfect for consistent, predictable progress',
      ],
      bestFor: [
        '✅ Beginners learning the basics',
        '✅ Structured, planned progression',
        '✅ Limited time for testing sessions',
        '✅ Want predictable, automated increases',
      ],
      example: 'Week 1: 85% of max, Week 2: 85%, Week 3: 75%, Week 4: Mixed',
    },
    protocol: {
      emoji: '🎯',
      name: 'Protocol Mode',
      tagline: 'Test, Earn, Progress',
      color: '#FF5722',
      howItWorks: [
        'P1: Test your 4-rep max (earn strength gains)',
        'P2: Volume work (3 rep-out sets for muscle growth)',
        'P3: Accessory work (2 rep-out sets, lighter weight)',
        'Maxes only increase when you EARN them through P1 testing',
      ],
      bestFor: [
        '✅ Intermediate/advanced lifters',
        '✅ Love testing your limits',
        '✅ Want earned, not guessed progression',
        '✅ Focus on strength + muscle growth',
      ],
      example: 'P1: Test 185 lbs × 4 reps → Success! Try 190 lbs → New max earned',
    },
  };

  const handleSelectMode = (mode: TrainingMode) => {
    setSelectedMode(mode);
  };

  const handleContinue = () => {
    if (selectedMode) {
      dispatch(setTrainingMode(selectedMode));
      onModeSelected(selectedMode);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Training Style</Text>
        <Text style={styles.subtitle}>
          Select the mode that best fits your experience and goals
        </Text>
      </View>

      {/* Recommendation Card */}
      {recommendation && (
        <View style={[styles.recommendationCard, { borderColor: modeDetails[recommendation.recommendedMode].color }]}>
          <Text style={styles.recommendationBadge}>💡 RECOMMENDED FOR YOU</Text>
          <Text style={[styles.recommendationMode, { color: modeDetails[recommendation.recommendedMode].color }]}>
            {modeDetails[recommendation.recommendedMode].emoji} {modeDetails[recommendation.recommendedMode].name}
          </Text>
          <Text style={styles.recommendationReason}>{recommendation.reason}</Text>
        </View>
      )}

      {/* Mode Options */}
      {(Object.keys(modeDetails) as TrainingMode[]).map(mode => {
        const details = modeDetails[mode];
        const isSelected = selectedMode === mode;
        const isRecommended = recommendation?.recommendedMode === mode;

        return (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeCard,
              isSelected && { borderColor: details.color, borderWidth: 3 }
            ]}
            onPress={() => handleSelectMode(mode)}
            activeOpacity={0.8}
          >
            {isRecommended && (
              <View style={[styles.recommendedBanner, { backgroundColor: details.color }]}>
                <Text style={styles.recommendedText}>⭐ Recommended for You</Text>
              </View>
            )}

            {/* Mode Header */}
            <View style={styles.modeHeader}>
              <Text style={styles.modeEmoji}>{details.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.modeName}>{details.name}</Text>
                <Text style={[styles.modeTagline, { color: details.color }]}>
                  {details.tagline}
                </Text>
              </View>
              {isSelected && (
                <View style={[styles.selectedCheck, { backgroundColor: details.color }]}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </View>

            {/* How It Works */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How It Works:</Text>
              {details.howItWorks.map((point, i) => (
                <Text key={i} style={styles.bulletPoint}>• {point}</Text>
              ))}
            </View>

            {/* Best For */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Best For:</Text>
              {details.bestFor.map((point, i) => (
                <Text key={i} style={styles.bulletPoint}>{point}</Text>
              ))}
            </View>

            {/* Example */}
            <View style={[styles.exampleCard, { backgroundColor: details.color + '10' }]}>
              <Text style={styles.exampleLabel}>Example:</Text>
              <Text style={styles.exampleText}>{details.example}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Don't worry - you can change modes anytime in Settings. Your progress will be preserved.
        </Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedMode && styles.continueButtonDisabled,
          selectedMode && { backgroundColor: modeDetails[selectedMode].color }
        ]}
        onPress={handleContinue}
        disabled={!selectedMode}
      >
        <Text style={styles.continueButtonText}>
          {selectedMode ? `Continue with ${modeDetails[selectedMode].name}` : 'Select a Mode to Continue'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: spacing.generous,
    paddingTop: spacing.huge,
    backgroundColor: '#FFFFFF',
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    color: '#666666',
  },
  recommendationCard: {
    margin: spacing.base,
    padding: spacing.base,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    ...shadows.md,
  },
  recommendationBadge: {
    ...typography.labelSmall,
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: spacing.sm,
  },
  recommendationMode: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  recommendationReason: {
    ...typography.body,
    fontSize: 14,
    color: '#666666',
  },
  modeCard: {
    margin: spacing.base,
    marginTop: 0,
    padding: spacing.base,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    ...shadows.md,
  },
  recommendedBanner: {
    marginBottom: spacing.md,
    marginHorizontal: -spacing.base,
    marginTop: -spacing.base,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderTopLeftRadius: borderRadius.xl - 2,
    borderTopRightRadius: borderRadius.xl - 2,
  },
  recommendedText: {
    ...typography.body,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  modeEmoji: {
    fontSize: 36,
  },
  modeName: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modeTagline: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
  },
  selectedCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    ...typography.body,
    fontSize: 13,
    color: '#666666',
    marginBottom: 6,
    paddingLeft: spacing.sm,
  },
  exampleCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  exampleLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 4,
  },
  exampleText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#1a1a1a',
    fontStyle: 'italic',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.base,
    padding: spacing.md,
    backgroundColor: '#E3F2FD',
    borderRadius: borderRadius.md,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#1565C0',
    flex: 1,
  },
  continueButton: {
    margin: spacing.base,
    marginBottom: spacing.huge,
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.lg,
  },
  continueButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  continueButtonText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
