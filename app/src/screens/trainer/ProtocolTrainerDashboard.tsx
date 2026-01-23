/**
 * ProtocolTrainerDashboard
 * 
 * Protocol-aware trainer dashboard showing:
 * - Protocol usage stats (P1/P2/P3 distribution)
 * - Workout flags (plateau, risk, fatigue, injury)
 * - Injury/hold visibility
 * - P1 testing success rates
 * - Trainer override controls
 * - Client notes system
 * 
 * Per PRD: Clean view with optional deep dive into details.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store/store';
import TrainerService from '../../services/TrainerService';
import InjuryHoldService from '../../services/InjuryHoldService';
import RehabModeService from '../../services/RehabModeService';
import TrainerOverrideModal from '../../components/trainer/TrainerOverrideModal';
import TrainerNotesModal from '../../components/trainer/TrainerNotesModal';
import { Protocol, WorkoutFlag } from '../../types';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';
import { activateRehabMode } from '../../store/slices/rehabSlice';

interface ProtocolTrainerDashboardProps {
  navigation: any;
  route: {
    params: {
      clientId: string;
    };
  };
}

export default function ProtocolTrainerDashboard({ navigation, route }: ProtocolTrainerDashboardProps) {
  const { clientId } = route.params;
  const dispatch = useAppDispatch();
  
  // Modal state
  const [view, setView] = useState<'overview' | 'deep_dive'>('overview');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [trainerNotes, setTrainerNotes] = useState<any[]>([]);
  
  // Trainer info - would come from auth in real implementation
  const trainerId = 'trainer-001';

  // Placeholder data - would come from API/Redux
  const dashboardMetrics = {
    protocolUsage: {
      p1Sessions: 4,
      p2Sessions: 8,
      p3Sessions: 6,
    },
    recentActivity: {
      lastWorkout: Date.now() - (2 * 24 * 60 * 60 * 1000),
      adherenceRate: 85,
      consecutiveMissed: 0,
    },
    strengthProgress: {
      exercisesTracked: 6,
      totalStrengthGain: 45,
      avgGainPercentage: 8.5,
    },
    flags: [] as WorkoutFlag[],
    activeInjuries: 1,
    rehabModeActive: false,
  };

  const getProtocolColor = (protocol: Protocol): string => {
    return protocol === 'P1' ? '#FF5722' : protocol === 'P2' ? '#2196F3' : '#9C27B0';
  };

  const getFlagSeverityColor = (severity: string): string => {
    return severity === 'high' ? '#F44336' : severity === 'medium' ? '#FF9800' : '#FFC107';
  };

  const getDaysSinceLastWorkout = (): number => {
    return Math.floor((Date.now() - dashboardMetrics.recentActivity.lastWorkout) / (1000 * 60 * 60 * 24));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client Dashboard</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewButton, view === 'overview' && styles.viewButtonActive]}
          onPress={() => setView('overview')}
        >
          <Text style={[styles.viewButtonText, view === 'overview' && styles.viewButtonTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, view === 'deep_dive' && styles.viewButtonActive]}
          onPress={() => setView('deep_dive')}
        >
          <Text style={[styles.viewButtonText, view === 'deep_dive' && styles.viewButtonTextActive]}>
            Deep Dive
          </Text>
        </TouchableOpacity>
      </View>

      {view === 'overview' ? (
        <>
          {/* At-a-Glance Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 At-a-Glance</Text>
            
            {/* Adherence */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Adherence & Activity</Text>
              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{dashboardMetrics.recentActivity.adherenceRate}%</Text>
                  <Text style={styles.metricSubtext}>Adherence Rate</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={[styles.metricValue, { color: getDaysSinceLastWorkout() > 3 ? '#F44336' : '#4CAF50' }]}>
                    {getDaysSinceLastWorkout()}d
                  </Text>
                  <Text style={styles.metricSubtext}>Since Last Workout</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{dashboardMetrics.recentActivity.consecutiveMissed}</Text>
                  <Text style={styles.metricSubtext}>Consecutive Missed</Text>
                </View>
              </View>
            </View>

            {/* Protocol Usage */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Protocol Usage (Last 30 Days)</Text>
              <View style={styles.protocolBars}>
                {(['P1', 'P2', 'P3'] as Protocol[]).map(protocol => {
                  const count = protocol === 'P1' ? dashboardMetrics.protocolUsage.p1Sessions :
                                protocol === 'P2' ? dashboardMetrics.protocolUsage.p2Sessions :
                                dashboardMetrics.protocolUsage.p3Sessions;
                  const total = Object.values(dashboardMetrics.protocolUsage).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;

                  return (
                    <View key={protocol} style={styles.protocolBar}>
                      <View style={styles.protocolBarHeader}>
                        <Text style={[styles.protocolLabel, { color: getProtocolColor(protocol) }]}>
                          {protocol}
                        </Text>
                        <Text style={styles.protocolCount}>{count} sessions</Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View style={[
                          styles.barFill,
                          { width: `${percentage}%`, backgroundColor: getProtocolColor(protocol) }
                        ]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Strength Progress */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Strength Progress</Text>
              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>+{dashboardMetrics.strengthProgress.totalStrengthGain}</Text>
                  <Text style={styles.metricSubtext}>Total Gain (lbs)</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{dashboardMetrics.strengthProgress.avgGainPercentage}%</Text>
                  <Text style={styles.metricSubtext}>Avg Gain</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{dashboardMetrics.strengthProgress.exercisesTracked}</Text>
                  <Text style={styles.metricSubtext}>Exercises</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Flags & Warnings */}
          {dashboardMetrics.flags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Flags & Warnings</Text>
              {dashboardMetrics.flags.map(flag => (
                <View
                  key={flag.id}
                  style={[styles.flagCard, { borderLeftColor: getFlagSeverityColor(flag.severity) }]}
                >
                  <View style={styles.flagHeader}>
                    <Text style={styles.flagType}>{flag.flagType.replace('_', ' ').toUpperCase()}</Text>
                    <View style={[styles.severityBadge, { backgroundColor: getFlagSeverityColor(flag.severity) }]}>
                      <Text style={styles.severityText}>{flag.severity}</Text>
                    </View>
                  </View>
                  <Text style={styles.flagMessage}>{flag.message}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Injury/Rehab Status */}
          {(dashboardMetrics.activeInjuries > 0 || dashboardMetrics.rehabModeActive) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏥 Injury & Rehab</Text>
              
              {dashboardMetrics.rehabModeActive && (
                <View style={styles.statusCard}>
                  <Text style={styles.statusIcon}>🏥</Text>
                  <View style={styles.statusContent}>
                    <Text style={styles.statusTitle}>Rehab Mode Active</Text>
                    <Text style={styles.statusText}>Client training with reduced loads</Text>
                  </View>
                </View>
              )}

              {dashboardMetrics.activeInjuries > 0 && (
                <View style={styles.statusCard}>
                  <Text style={styles.statusIcon}>⚠️</Text>
                  <View style={styles.statusContent}>
                    <Text style={styles.statusTitle}>{dashboardMetrics.activeInjuries} Active Hold(s)</Text>
                    <Text style={styles.statusText}>Some muscle groups paused</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </>
      ) : (
        <>
          {/* Deep Dive View */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Deep Dive Analytics</Text>
            
            <View style={styles.deepDiveCard}>
              <Text style={styles.deepDiveTitle}>Protocol Analysis</Text>
              <Text style={styles.deepDiveText}>
                • P1 testing frequency and success rates{'\n'}
                • P2/P3 rep-out performance trends{'\n'}
                • Protocol progression over time
              </Text>
            </View>

            <View style={styles.deepDiveCard}>
              <Text style={styles.deepDiveTitle}>Injury Timeline</Text>
              <Text style={styles.deepDiveText}>
                • Active and past injury holds{'\n'}
                • Rehab session history{'\n'}
                • Recovery progression tracking
              </Text>
            </View>

            <View style={styles.deepDiveCard}>
              <Text style={styles.deepDiveTitle}>Missed Training Context</Text>
              <Text style={styles.deepDiveText}>
                • Reason breakdown and patterns{'\n'}
                • Impact on plateau interpretation{'\n'}
                • Adherence coaching recommendations
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📝 Add Trainer Note</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>🔄 Reorder Protocols</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>🏥 Force Rehab Mode</Text>
        </TouchableOpacity>
      </View>
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
  viewToggle: {
    flexDirection: 'row',
    margin: spacing.base,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  viewButtonActive: {
    backgroundColor: '#2196F3',
  },
  viewButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  viewButtonTextActive: {
    color: '#FFFFFF',
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
  metricCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  metricLabel: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
    marginBottom: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  metricSubtext: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#999999',
  },
  protocolBars: {
    gap: spacing.md,
  },
  protocolBar: {
    marginBottom: spacing.sm,
  },
  protocolBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  protocolLabel: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
  },
  protocolCount: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  flagCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  flagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  flagType: {
    ...typography.body,
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  severityText: {
    ...typography.labelSmall,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  flagMessage: {
    ...typography.body,
    fontSize: 13,
    color: '#1a1a1a',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  statusIcon: {
    fontSize: 32,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statusText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
  },
  deepDiveCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.base,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  deepDiveTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.sm,
  },
  deepDiveText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  actionButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
});
