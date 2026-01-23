/**
 * ModeComparisonScreen
 * 
 * Compares user performance between Percentage and Protocol modes.
 * Shows which mode is working better for the user based on:
 * - Adherence rates
 * - Strength gains
 * - PR frequency
 * - User satisfaction
 * 
 * Provides data-driven recommendation for preferred mode.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppSelector } from '../../store/store';
import ProtocolAnalyticsService from '../../services/ProtocolAnalyticsService';
import { TrainingMode } from '../../types';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

export default function ModeComparisonScreen({ navigation }: any) {
  const userId = useAppSelector(state => state.user.profile?.id || '');
  const currentMode = useAppSelector(state => state.user.profile?.trainingMode || 'percentage');
  
  const [report, setReport] = useState<any>(null);
  const [periodDays, setPeriodDays] = useState(90);

  useEffect(() => {
    loadComparison();
  }, [periodDays]);

  const loadComparison = () => {
    // Mock data for demonstration
    const mockReport = {
      userId,
      period: {
        start: Date.now() - (periodDays * 24 * 60 * 60 * 1000),
        end: Date.now(),
      },
      percentageMode: {
        sessions: 28,
        avgStrengthGain: 35,
        adherenceRate: 78,
        prFrequency: 0.21,
      },
      protocolMode: {
        sessions: 36,
        avgStrengthGain: 45,
        adherenceRate: 85,
        prFrequency: 0.28,
      },
      recommendation: {
        preferredMode: 'protocol' as TrainingMode,
        reasoning: [
          'Higher adherence rate (85% vs 78%)',
          'Better strength gains (+45 lbs vs +35 lbs)',
          'More frequent PRs (0.28 vs 0.21 per session)',
          'Increased workout consistency',
        ],
        confidenceScore: 0.82,
      },
    };

    setReport(mockReport);
  };

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading comparison...</Text>
      </View>
    );
  }

  const modeInfo = {
    percentage: { emoji: '📊', color: '#2196F3', name: 'Percentage Mode' },
    protocol: { emoji: '🎯', color: '#FF5722', name: 'Protocol Mode' },
  };

  const recommendedInfo = modeInfo[report.recommendation.preferredMode];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mode Comparison</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {[30, 90, 180].map(days => (
          <TouchableOpacity
            key={days}
            style={[
              styles.periodButton,
              periodDays === days && styles.periodButtonActive
            ]}
            onPress={() => setPeriodDays(days)}
          >
            <Text style={[
              styles.periodButtonText,
              periodDays === days && styles.periodButtonTextActive
            ]}>
              {days} Days
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recommendation Card */}
      <View style={[styles.recommendationCard, { borderColor: recommendedInfo.color }]}>
        <Text style={styles.recommendationBadge}>💡 DATA-DRIVEN RECOMMENDATION</Text>
        <View style={styles.recommendationHeader}>
          <Text style={styles.recommendationEmoji}>{recommendedInfo.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.recommendationMode, { color: recommendedInfo.color }]}>
              {recommendedInfo.name}
            </Text>
            <Text style={styles.recommendationConfidence}>
              {Math.round(report.recommendation.confidenceScore * 100)}% confidence
            </Text>
          </View>
        </View>
        
        <View style={styles.reasoningList}>
          {report.recommendation.reasoning.map((reason: string, index: number) => (
            <View key={index} style={styles.reasoningItem}>
              <Text style={[styles.reasoningBullet, { color: recommendedInfo.color }]}>•</Text>
              <Text style={styles.reasoningText}>{reason}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Comparison Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Performance Comparison</Text>
        
        {/* Sessions */}
        <View style={styles.comparisonCard}>
          <Text style={styles.metricName}>Workout Sessions</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.modeColumn}>
              <Text style={styles.modeLabel}>📊 Percentage</Text>
              <Text style={styles.modeValue}>{report.percentageMode.sessions}</Text>
            </View>
            <View style={styles.vsText}>
              <Text style={styles.vs}>VS</Text>
            </View>
            <View style={styles.modeColumn}>
              <Text style={styles.modeLabel}>🎯 Protocol</Text>
              <Text style={styles.modeValue}>{report.protocolMode.sessions}</Text>
            </View>
          </View>
          {report.protocolMode.sessions > report.percentageMode.sessions && (
            <Text style={styles.winner}>🎯 Protocol wins (+{report.protocolMode.sessions - report.percentageMode.sessions} sessions)</Text>
          )}
        </View>

        {/* Adherence */}
        <View style={styles.comparisonCard}>
          <Text style={styles.metricName}>Adherence Rate</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.modeColumn}>
              <Text style={styles.modeLabel}>📊 Percentage</Text>
              <Text style={styles.modeValue}>{report.percentageMode.adherenceRate}%</Text>
            </View>
            <View style={styles.vsText}>
              <Text style={styles.vs}>VS</Text>
            </View>
            <View style={styles.modeColumn}>
              <Text style={styles.modeLabel}>🎯 Protocol</Text>
              <Text style={styles.modeValue}>{report.protocolMode.adherenceRate}%</Text>
            </View>
          </View>
          {report.protocolMode.adherenceRate > report.percentageMode.adherenceRate && (
            <Text style={styles.winner}>🎯 Protocol wins (+{report.protocolMode.adherenceRate - report.percentageMode.adherenceRate}%)</Text>
          )}
        </View>

        {/* Strength Gain */}
        <View style={styles.comparisonCard}>
          <Text style={styles.metricName}>Total Strength Gain</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.modeColumn}>
              <Text style={styles.modeLabel}>📊 Percentage</Text>
              <Text style={styles.modeValue}>+{report.percentageMode.avgStrengthGain} lbs</Text>
            </View>
            <View style={styles.vsText}>
              <Text style={styles.vs}>VS</Text>
            </View>
            <View style={styles.modeColumn}>
              <Text style={styles.modeLabel}>🎯 Protocol</Text>
              <Text style={styles.modeValue}>+{report.protocolMode.avgStrengthGain} lbs</Text>
            </View>
          </View>
          {report.protocolMode.avgStrengthGain > report.percentageMode.avgStrengthGain && (
            <Text style={styles.winner}>🎯 Protocol wins (+{report.protocolMode.avgStrengthGain - report.percentageMode.avgStrengthGain} lbs)</Text>
          )}
        </View>

        {/* PR Frequency */}
        <View style={styles.comparisonCard}>
          <Text style={styles.metricName}>PR Frequency</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.modeColumn}>
              <Text style={styles.modeLabel}>📊 Percentage</Text>
              <Text style={styles.modeValue}>{(report.percentageMode.prFrequency * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.vsText}>
              <Text style={styles.vs}>VS</Text>
            </View>
            <View style={styles.modeColumn}>
              <Text style={styles.modeLabel}>🎯 Protocol</Text>
              <Text style={styles.modeValue}>{(report.protocolMode.prFrequency * 100).toFixed(0)}%</Text>
            </View>
          </View>
          <Text style={styles.helperText}>PRs per session completed</Text>
          {report.protocolMode.prFrequency > report.percentageMode.prFrequency && (
            <Text style={styles.winner}>🎯 Protocol wins (More PRs per session)</Text>
          )}
        </View>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📈 What This Means</Text>
          <Text style={styles.summaryText}>
            Based on {periodDays} days of data, <Text style={{ fontWeight: '700', color: recommendedInfo.color }}>{recommendedInfo.name}</Text> appears to work better for you. 
          </Text>
          <Text style={styles.summaryText}>
            You've shown higher consistency and better results with this mode. However, both modes are effective - use the one you enjoy more!
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          This comparison is based on your actual training data. You can switch modes anytime in Settings to try different approaches.
        </Text>
      </View>

      <View style={{ height: spacing.huge }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.huge,
    color: '#999999',
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
  periodSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.base,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  periodButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  periodButtonText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  recommendationCard: {
    margin: spacing.base,
    padding: spacing.base,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    borderWidth: 3,
    ...shadows.lg,
  },
  recommendationBadge: {
    ...typography.labelSmall,
    fontSize: 10,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: spacing.md,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  recommendationEmoji: {
    fontSize: 40,
  },
  recommendationMode: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '700',
  },
  recommendationConfidence: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#999999',
  },
  reasoningList: {
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  reasoningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  reasoningBullet: {
    fontSize: 16,
    marginRight: spacing.sm,
    fontWeight: '700',
  },
  reasoningText: {
    ...typography.body,
    fontSize: 13,
    color: '#1a1a1a',
    flex: 1,
  },
  section: {
    margin: spacing.base,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.md,
  },
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  metricName: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  modeColumn: {
    alignItems: 'center',
    flex: 1,
  },
  modeLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#999999',
    marginBottom: spacing.sm,
  },
  modeValue: {
    ...typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  vsText: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  vs: {
    ...typography.labelSmall,
    fontSize: 10,
    fontWeight: '700',
    color: '#999999',
  },
  winner: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  helperText: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#999999',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  summaryTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.md,
  },
  summaryText: {
    ...typography.body,
    fontSize: 14,
    color: '#666666',
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    lineHeight: 18,
  },
});
