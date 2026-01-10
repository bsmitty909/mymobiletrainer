/**
 * Body Part Balance Card Component
 * 
 * Displays volume per muscle group with visual progress bars
 * Shows imbalances and provides recommendations
 * 
 * Part of Phase 4.5: Analytics & Insights
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import useThemeColors from '../../utils/useThemeColors';
import { BodyPartBalance } from '../../services/AnalyticsService';

interface BodyPartBalanceCardProps {
  balanceData: BodyPartBalance;
  showRecommendations?: boolean;
}

export default function BodyPartBalanceCard({ 
  balanceData, 
  showRecommendations = true 
}: BodyPartBalanceCardProps) {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    card: {
      marginVertical: 8,
      backgroundColor: colors.card,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    muscleGroupRow: {
      marginVertical: 8,
    },
    muscleGroupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    muscleGroupName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textTransform: 'capitalize',
    },
    muscleGroupStats: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 4,
    },
    placeholder: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    placeholderText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 8,
    },
    summaryContainer: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
    summaryLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
    },
    summaryValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      textTransform: 'capitalize',
    },
    imbalanceSection: {
      marginTop: 16,
    },
    imbalanceTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    imbalanceCard: {
      padding: 10,
      borderRadius: 6,
      marginVertical: 4,
      borderLeftWidth: 3,
    },
    imbalanceHigh: {
      backgroundColor: colors.error + '15',
      borderLeftColor: colors.error,
    },
    imbalanceModerate: {
      backgroundColor: colors.warning + '15',
      borderLeftColor: colors.warning,
    },
    imbalanceLow: {
      backgroundColor: colors.surface,
      borderLeftColor: colors.primary,
    },
    imbalanceText: {
      fontSize: 13,
      color: colors.text,
    },
    recommendationsSection: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
    },
    recommendationsTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    recommendationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: 4,
    },
    recommendationBullet: {
      fontSize: 13,
      color: colors.primary,
      marginRight: 8,
      marginTop: 2,
    },
    recommendationText: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
    },
    noImbalances: {
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.success + '15',
      borderRadius: 8,
      marginTop: 8,
    },
    noImbalancesText: {
      fontSize: 14,
      color: colors.success,
      fontWeight: '600',
    },
  });

  if (!balanceData || balanceData.muscleGroupVolumes.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.placeholder}>
            <Text style={{ fontSize: 32 }}>💪</Text>
            <Text style={styles.placeholderText}>
              No muscle group data yet
            </Text>
            <Text style={[styles.placeholderText, { fontSize: 12, opacity: 0.7 }]}>
              Complete workouts to see body part balance
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  const getColorForPercentage = (percentage: number): string => {
    if (percentage >= 25) return colors.success; // Well-worked
    if (percentage >= 15) return colors.primary; // Moderate
    if (percentage >= 10) return colors.warning; // Light
    return colors.error; // Underworked
  };

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title}>Body Part Balance</Text>

        {/* Muscle Group Distribution */}
        {balanceData.muscleGroupVolumes.map((mg, index) => (
          <View key={index} style={styles.muscleGroupRow}>
            <View style={styles.muscleGroupHeader}>
              <Text style={styles.muscleGroupName}>{mg.muscleGroup}</Text>
              <Text style={styles.muscleGroupStats}>
                {(mg.volume / 1000).toFixed(1)}k lbs · {mg.setCount} sets · {mg.percentage.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${mg.percentage}%`,
                    backgroundColor: getColorForPercentage(mg.percentage),
                  },
                ]}
              />
            </View>
          </View>
        ))}

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Most Worked</Text>
            <Text style={styles.summaryValue}>{balanceData.mostWorked}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Least Worked</Text>
            <Text style={styles.summaryValue}>{balanceData.leastWorked}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Muscle Groups Trained</Text>
            <Text style={styles.summaryValue}>{balanceData.muscleGroupVolumes.length}</Text>
          </View>
        </View>

        {/* Imbalances */}
        {balanceData.imbalances.length > 0 ? (
          <View style={styles.imbalanceSection}>
            <Text style={styles.imbalanceTitle}>⚠️ Detected Imbalances</Text>
            {balanceData.imbalances.map((imbalance, index) => (
              <View
                key={index}
                style={[
                  styles.imbalanceCard,
                  imbalance.severity === 'high'
                    ? styles.imbalanceHigh
                    : imbalance.severity === 'moderate'
                    ? styles.imbalanceModerate
                    : styles.imbalanceLow,
                ]}
              >
                <Text style={styles.imbalanceText}>{imbalance.message}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noImbalances}>
            <Text style={styles.noImbalancesText}>
              ✓ Excellent balance across all muscle groups!
            </Text>
          </View>
        )}

        {/* Recommendations */}
        {showRecommendations && balanceData.recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.recommendationsTitle}>💡 Recommendations</Text>
            {balanceData.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationBullet}>•</Text>
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
}
