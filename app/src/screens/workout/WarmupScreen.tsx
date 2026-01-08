/**
 * Warmup Screen
 * 
 * Pre-workout warmup checklist and timer before starting the actual workout
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Checkbox } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GameButton from '../../components/common/GameButton';
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
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 56,
    },
    title: {
      fontSize: 32,
      color: '#fff',
      fontWeight: '900',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    subtitle: {
      fontSize: 18,
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '600',
    },
    infoCard: {
      margin: 16,
      marginTop: -40,
      borderRadius: 16,
      backgroundColor: colors.card,
      elevation: 8,
    },
    infoContent: {
      padding: 24,
    },
    infoTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    infoText: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      fontWeight: '500',
    },
    warmupList: {
      margin: 16,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    warmupCard: {
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: colors.card,
      elevation: 4,
    },
    warmupItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    checkboxContainer: {
      marginRight: 16,
    },
    warmupContent: {
      flex: 1,
    },
    warmupTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    warmupDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
      fontWeight: '500',
    },
    warmupDuration: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '700',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    actions: {
      padding: 16,
      gap: 12,
      marginBottom: 32,
    },
    progressText: {
      fontSize: 16,
      textAlign: 'center',
      color: colors.text,
      fontWeight: '700',
      marginBottom: 16,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#ff6b6b', '#ee5a52']}
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
