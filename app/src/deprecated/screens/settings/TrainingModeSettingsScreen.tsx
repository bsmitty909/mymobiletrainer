/**
 * TrainingModeSettingsScreen
 * 
 * In-app training mode switcher accessible from Settings.
 * Shows current mode, allows switching with confirmation dialog.
 * 
 * Integrates with Settings menu for easy access.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppSelector } from '../../store/store';
import TrainingModeSelector from '../../components/workout/TrainingModeSelector';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

export default function TrainingModeSettingsScreen({ navigation }: any) {
  const currentMode = useAppSelector(state => state.user.profile?.trainingMode || 'percentage');
  const [showModeSelector, setShowModeSelector] = useState(false);

  const modeInfo = {
    percentage: {
      name: 'Percentage Mode',
      emoji: '📊',
      color: '#2196F3',
      description: 'Structured week-based progression with automated weight calculations',
    },
    protocol: {
      name: 'Protocol Mode',
      emoji: '🎯',
      color: '#FF5722',
      description: 'P1/P2/P3 protocol system with earned progression through max testing',
    },
  };

  const current = modeInfo[currentMode];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Settings</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Training Mode</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Current Mode Card */}
      <View style={[styles.currentModeCard, { borderColor: current.color }]}>
        <View style={styles.currentModeHeader}>
          <Text style={styles.currentModeLabel}>Current Mode</Text>
          <View style={[styles.currentModeBadge, { backgroundColor: current.color }]}>
            <Text style={styles.badgeText}>ACTIVE</Text>
          </View>
        </View>
        
        <View style={styles.modeDisplay}>
          <Text style={styles.currentModeEmoji}>{current.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.currentModeName, { color: current.color }]}>
              {current.name}
            </Text>
            <Text style={styles.currentModeDescription}>
              {current.description}
            </Text>
          </View>
        </View>
      </View>

      {/* Change Mode Button */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Switch Training Mode</Text>
        <Text style={styles.sectionDescription}>
          Change between Percentage Mode and Protocol Mode. Your progress and maxes will be preserved.
        </Text>
        
        <TouchableOpacity
          style={styles.changeButton}
          onPress={() => setShowModeSelector(true)}
        >
          <Text style={styles.changeButtonText}>Change Training Mode</Text>
        </TouchableOpacity>
      </View>

      {/* About Modes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Training Modes</Text>
        
        {/* Percentage Mode */}
        <View style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <Text style={styles.aboutEmoji}>📊</Text>
            <Text style={styles.aboutName}>Percentage Mode</Text>
          </View>
          <Text style={styles.aboutText}>
            Formula-based training with week cycling and automated progression. Perfect for beginners and those who prefer structured, predictable training.
          </Text>
        </View>

        {/* Protocol Mode */}
        <View style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <Text style={styles.aboutEmoji}>🎯</Text>
            <Text style={styles.aboutName}>Protocol Mode</Text>
          </View>
          <Text style={styles.aboutText}>
            P1/P2/P3 protocol system with earned progression through max testing. Ideal for intermediate/advanced lifters who want coaching-style training.
          </Text>
        </View>
      </View>

      {/* Info Footer */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Mode switching is safe and your training data will be converted automatically. You can switch back at any time.
        </Text>
      </View>

      {/* Mode Selector Modal */}
      <TrainingModeSelector
        visible={showModeSelector}
        onClose={() => setShowModeSelector(false)}
        onModeSelected={(mode) => {
          setShowModeSelector(false);
          navigation.goBack();
        }}
      />
    </ScrollView>
  );
}

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
    paddingTop: spacing.huge,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  backText: {
    ...typography.body,
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '600',
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  currentModeCard: {
    margin: spacing.base,
    padding: spacing.base,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    ...shadows.lg,
  },
  currentModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currentModeLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#999999',
    fontWeight: '700',
  },
  currentModeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    ...typography.labelSmall,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  currentModeEmoji: {
    fontSize: 48,
  },
  currentModeName: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  currentModeDescription: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  section: {
    margin: spacing.base,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.body,
    fontSize: 14,
    color: '#666666',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  changeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: spacing.comfortable,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.md,
  },
  changeButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  aboutEmoji: {
    fontSize: 24,
  },
  aboutName: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  aboutText: {
    ...typography.bodySmall,
    fontSize: 13,
    color: '#666666',
    lineHeight: 19,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    margin: spacing.base,
    padding: spacing.md,
    backgroundColor: '#E3F2FD',
    borderRadius: borderRadius.md,
    marginBottom: spacing.huge,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#1565C0',
    flex: 1,
    lineHeight: 18,
  },
});
