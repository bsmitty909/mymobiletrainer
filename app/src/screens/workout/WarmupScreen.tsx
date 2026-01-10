/**
 * Warmup Screen - Modern 2024 Design
 *
 * Pre-workout warmup checklist with clean, professional styling
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Checkbox } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GameButton from '../../components/common/GameButton';
import { spacing, typography, borderRadius, shadows, colors as designColors } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

interface WarmupScreenProps {
  navigation: any;
}

const warmupRoutine = [
  { id: '1', title: '5-10 min light cardio', description: 'Treadmill, bike, or rowing', duration: '5-10 min' },
  { id: '2', title: 'Dynamic stretches', description: 'Arm circles, leg swings, torso twists', duration: '3-5 min' },
  { id: '3', title: 'Joint mobility', description: 'Wrist, ankle, and shoulder rotations', duration: '2-3 min' },
  { id: '4', title: 'Activation exercises', description: 'Band pull-aparts, bodyweight squats', duration: '3-5 min' },
];

export default function WarmupScreen({ navigation }: WarmupScreenProps) {
  const colors = useThemeColors();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const allChecked = checkedItems.size === warmupRoutine.length;

  const handleStartWorkout = () => {
    navigation.navigate('ActiveWorkout');
  };

  const handleSkipWarmup = () => {
    navigation.navigate('ActiveWorkout');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingHorizontal: spacing.xl,
      paddingTop: 60,
      paddingBottom: 56,
    },
    title: {
      ...typography.display,
      fontSize: 28,
      color: '#fff',
      marginBottom: spacing.sm,
      letterSpacing: -0.5,
    },
    subtitle: {
      ...typography.bodyLarge,
      color: 'rgba(255, 255, 255, 0.95)',
      fontWeight: '500',
    },
    infoCard: {
      margin: spacing.base,
      marginTop: -40,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.card,
      ...shadows.lg,
    },
    infoContent: {
      padding: spacing.xl,
    },
    infoTitle: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing.md,
      letterSpacing: -0.2,
    },
    infoText: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 24,
      fontWeight: '400',
    },
    warmupList: {
      margin: spacing.base,
    },
    sectionTitle: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing.base,
      letterSpacing: -0.3,
    },
    warmupCard: {
      marginBottom: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      ...shadows.sm,
    },
    warmupItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
    },
    checkboxContainer: {
      marginRight: spacing.base,
    },
    warmupContent: {
      flex: 1,
    },
    warmupTitle: {
      ...typography.h3,
      fontSize: 16,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    warmupDescription: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    warmupDuration: {
      ...typography.bodySmall,
      color: colors.primary,
      fontWeight: '600',
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    actions: {
      padding: spacing.base,
      gap: spacing.md,
      marginBottom: spacing['2xl'],
    },
    progressText: {
      ...typography.body,
      textAlign: 'center',
      color: colors.success,
      fontWeight: '600',
      marginBottom: spacing.base,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={[colors.warning, colors.warning + 'DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.title}>
            PRE-WORKOUT WARMUP
          </Text>
          <Text style={styles.subtitle}>
            Prepare your body for an effective workout
          </Text>
        </LinearGradient>

        <Card style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Why Warm Up?
            </Text>
            <Text style={styles.infoText}>
              A proper warmup increases blood flow, raises body temperature, and prepares your muscles and joints for intense exercise. This reduces injury risk and improves performance.
            </Text>
          </View>
        </Card>

        <View style={styles.warmupList}>
          <Text style={styles.sectionTitle}>
            Warmup Routine
          </Text>
          
          {warmupRoutine.map((item, index) => (
            <Card key={item.id} style={styles.warmupCard}>
              <View style={styles.warmupItem}>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    status={checkedItems.has(item.id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleCheck(item.id)}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.warmupContent}>
                  <Text style={styles.warmupTitle}>
                    {index + 1}. {item.title}
                  </Text>
                  <Text style={styles.warmupDescription}>
                    {item.description}
                  </Text>
                  <Text style={styles.warmupDuration}>
                    Duration: {item.duration}
                  </Text>
                </View>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons 
                    name={checkedItems.has(item.id) ? "check" : "progress-clock"} 
                    size={24} 
                    color={colors.primary} 
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.actions}>
          {allChecked && (
            <Text style={styles.progressText}>
              All warmup steps completed! Ready to crush this workout!
            </Text>
          )}
          <GameButton
            onPress={handleStartWorkout}
            variant={allChecked ? "success" : "primary"}
            icon="play-circle"
            disabled={!allChecked}
          >
            {allChecked ? "START WORKOUT" : "FINISH WARMUP"}
          </GameButton>
          <GameButton
            onPress={handleSkipWarmup}
            variant="secondary"
            size="medium"
            icon="skip-forward"
          >
            SKIP WARMUP
          </GameButton>
        </View>
      </ScrollView>
    </View>
  );
}
