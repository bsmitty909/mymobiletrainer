/**
 * ProtocolAnalyticsScreen
 * 
 * Displays protocol usage statistics, P1 testing performance,
 * rep-out trends, and training effectiveness metrics.
 * 
 * Features:
 * - Protocol distribution (P1/P2/P3)
 * - P1 testing success rates
 * - Rep-out performance analysis
 * - Strength gain tracking
 * - Export functionality
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useAppSelector } from '../../store/store';
import ProtocolAnalyticsService from '../../services/ProtocolAnalyticsService';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';

export default function ProtocolAnalyticsScreen({ navigation }: any) {
  const userId = useAppSelector(state => state.user.profile?.userId || '');
  const [periodDays, setPeriodDays] = useState(90);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [periodDays]);

  const loadAnalytics = () => {
    // In real implementation, would fetch from database
    // Mock data for now
    const mockReport = {
      userId,
      period: {
        start: Date.now() - (periodDays * 24 * 60 * 60 * 1000),
        end: Date.now(),
        days: periodDays,
      },
      protocolDistribution: {
        p1Sessions: 8,
        p2Sessions: 16,
        p3Sessions: 12,
        totalProtocolSessions: 36,
      },
      p1TestingStats: {
        totalTests: 8,
        successRate: 75,
        avgGainPerTest: 5.5,
        testsPerMonth: 2.7,
      },
      repOutPerformance: {
        avgRepsP2: 8.5,
        avgRepsP3: 9.2,
        idealRangePercentage: 68,
      },
    };

    setReport(mockReport);
  };

  const handleExportData = async () => {
    try {
      const exportData = ProtocolAnalyticsService.exportProtocolData(
        userId,
        [], // fourRepMaxes
        [], // maxAttempts
        []  // splitTracking
      );

      const jsonString = JSON.stringify(exportData, null, 2);
      
      await Share.share({
        message: `Protocol Analytics Export\n\n${jsonString}`,
        title: 'Protocol Analytics Data',
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  const totalSessions = report.protocolDistribution.totalProtocolSessions;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Protocol Analytics</Text>
        <TouchableOpacity onPress={handleExportData}>
          <Text style={styles.exportButton}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {[30, 90, 180, 365].map(days => (
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
              {days === 365 ? '1 Year' : `${days} Days`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Protocol Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Protocol Distribution</Text>
        
        <View style={styles.distributionCard}>
          {[
            { protocol: 'P1', count: report.protocolDistribution.p1Sessions, color: '#FF5722', name: 'Max Testing' },
            { protocol: 'P2', count: report.protocolDistribution.p2Sessions, color: '#2196F3', name: 'Volume' },
            { protocol: 'P3', count: report.protocolDistribution.p3Sessions, color: '#9C27B0', name: 'Accessory' },
          ].map(({ protocol, count, color, name }) => {
            const percentage = totalSessions > 0 ? (count / totalSessions) * 100 : 0;
            
            return (
              <View key={protocol} style={styles.protocolRow}>
                <View style={styles.protocolHeader}>
                  <View style={styles.protocolLabel}>
                    <View style={[styles.protocolDot, { backgroundColor: color }]} />
                    <Text style={styles.protocolName}>{protocol} - {name}</Text>
                  </View>
                  <Text style={styles.protocolCount}>{count} sessions</Text>
                </View>
                
                <View style={styles.barContainer}>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.barPercentage}>{percentage.toFixed(0)}%</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Protocol Sessions</Text>
          <Text style={styles.summaryValue}>{totalSessions}</Text>
        </View>
      </View>

      {/* P1 Testing Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 P1 Testing Performance</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{report.p1TestingStats.totalTests}</Text>
            <Text style={styles.statLabel}>Total Tests</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[
              styles.statValue,
              { color: report.p1TestingStats.successRate >= 60 ? '#4CAF50' : '#FF9800' }
            ]}>
              {report.p1TestingStats.successRate}%
            </Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>+{report.p1TestingStats.avgGainPerTest}</Text>
            <Text style={styles.statLabel}>Avg Gain (lbs)</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{report.p1TestingStats.testsPerMonth}</Text>
            <Text style={styles.statLabel}>Tests/Month</Text>
          </View>
        </View>

        {/* Success Rate Indicator */}
        <View style={styles.performanceCard}>
          <Text style={styles.performanceLabel}>P1 Success Rate Trend</Text>
          <View style={styles.performanceBar}>
            <View style={[
              styles.performanceFill,
              {
                width: `${report.p1TestingStats.successRate}%`,
                backgroundColor: report.p1TestingStats.successRate >= 60 ? '#4CAF50' : '#FF9800'
              }
            ]} />
          </View>
          <Text style={styles.performanceText}>
            {report.p1TestingStats.successRate >= 60 ? '✓ Excellent performance' : '⚠️ Room for improvement'}
          </Text>
        </View>
      </View>

      {/* Rep-Out Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💪 Rep-Out Performance</Text>
        
        <View style={styles.repOutCard}>
          <View style={styles.repOutRow}>
            <Text style={styles.repOutLabel}>P2 Average Reps</Text>
            <Text style={[
              styles.repOutValue,
              { color: report.repOutPerformance.avgRepsP2 >= 7 && report.repOutPerformance.avgRepsP2 <= 9 ? '#4CAF50' : '#666666' }
            ]}>
              {report.repOutPerformance.avgRepsP2} reps
            </Text>
          </View>
          
          <View style={styles.repOutRow}>
            <Text style={styles.repOutLabel}>P3 Average Reps</Text>
            <Text style={[
              styles.repOutValue,
              { color: report.repOutPerformance.avgRepsP3 >= 7 && report.repOutPerformance.avgRepsP3 <= 9 ? '#4CAF50' : '#666666' }
            ]}>
              {report.repOutPerformance.avgRepsP3} reps
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.idealRangeCard}>
            <Text style={styles.idealRangeLabel}>Ideal Range Performance (7-9 reps)</Text>
            <Text style={styles.idealRangeValue}>{report.repOutPerformance.idealRangePercentage}%</Text>
            <View style={styles.idealRangeBar}>
              <View style={[
                styles.idealRangeFill,
                { width: `${report.repOutPerformance.idealRangePercentage}%` }
              ]} />
            </View>
          </View>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Insights</Text>
        
        {report.p1TestingStats.successRate >= 70 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>🎯</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Strong P1 Performance</Text>
              <Text style={styles.insightText}>
                Your {report.p1TestingStats.successRate}% success rate shows you're progressing at a sustainable pace.
              </Text>
            </View>
          </View>
        )}

        {report.repOutPerformance.idealRangePercentage >= 60 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>💪</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Rep-Out Mastery</Text>
              <Text style={styles.insightText}>
                {report.repOutPerformance.idealRangePercentage}% of your rep-outs are in the ideal range - excellent load management.
              </Text>
            </View>
          </View>
        )}

        {report.protocolDistribution.p2Sessions > report.protocolDistribution.p1Sessions * 2 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>📈</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Volume Focus</Text>
              <Text style={styles.insightText}>
                You're prioritizing P2 volume work - great for hypertrophy and building work capacity.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Mode Comparison Link */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.comparisonButton}
          onPress={() => navigation.navigate('ModeComparison')}
        >
          <Text style={styles.comparisonButtonText}>📊 Compare Modes</Text>
          <Text style={styles.comparisonButtonSubtext}>See percentage vs protocol performance</Text>
        </TouchableOpacity>
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
  exportButton: {
    ...typography.body,
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '600',
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
  distributionCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  protocolRow: {
    marginBottom: spacing.md,
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  protocolLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  protocolDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  protocolName: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  protocolCount: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#999999',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barPercentage: {
    ...typography.labelSmall,
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
    width: 35,
  },
  summaryCard: {
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
  },
  summaryValue: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    ...typography.labelSmall,
    fontSize: 11,
    color: '#999999',
    textAlign: 'center',
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.base,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  performanceLabel: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: spacing.sm,
  },
  performanceBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  performanceFill: {
    height: '100%',
    borderRadius: 6,
  },
  performanceText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
  },
  repOutCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.base,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  repOutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  repOutLabel: {
    ...typography.body,
    fontSize: 14,
    color: '#1a1a1a',
  },
  repOutValue: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: spacing.sm,
  },
  idealRangeCard: {
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  idealRangeLabel: {
    ...typography.body,
    fontSize: 13,
    color: '#666666',
    marginBottom: spacing.sm,
  },
  idealRangeValue: {
    ...typography.h2,
    fontSize: 32,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  idealRangeBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  idealRangeFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  insightIcon: {
    fontSize: 24,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  insightText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  comparisonButton: {
    backgroundColor: '#FFFFFF',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  comparisonButtonText: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 4,
  },
  comparisonButtonSubtext: {
    ...typography.bodySmall,
    fontSize: 12,
    color: '#999999',
  },
});
