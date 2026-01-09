/**
 * Intensity Distribution Chart Component
 * 
 * Displays a pie chart showing the distribution of sets across
 * intensity levels (warmup, working, heavy, max)
 * 
 * Part of Phase 4.5: Analytics & Insights
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import useThemeColors from '../../utils/useThemeColors';
import { IntensityDistribution } from '../../services/AnalyticsService';

interface IntensityDistributionChartProps {
  intensityData: IntensityDistribution;
}

export default function IntensityDistributionChart({ intensityData }: IntensityDistributionChartProps) {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    chart: {
      borderRadius: 16,
    },
    placeholder: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    placeholderText: {
      color: colors.textSecondary,
      marginVertical: 4,
    },
    placeholderSubtext: {
      color: colors.textSecondary,
      marginTop: 8,
      opacity: 0.7,
    },
    statsContainer: {
      marginTop: 16,
      width: '100%',
      paddingHorizontal: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statsLabel: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    colorIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    labelText: {
      fontSize: 14,
      color: colors.text,
    },
    statsValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    summaryContainer: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    summaryLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    warningText: {
      fontSize: 12,
      color: colors.warning,
      marginTop: 8,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    goodText: {
      fontSize: 12,
      color: colors.success,
      marginTop: 8,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  // If no data, show placeholder
  if (!intensityData || intensityData.intensityBuckets.every(bucket => bucket.setCount === 0)) {
    return (
      <View style={styles.placeholder}>
        <Text variant="bodyLarge" style={styles.placeholderText}>
          📊
        </Text>
        <Text variant="bodyMedium" style={styles.placeholderText}>
          No intensity data yet
        </Text>
        <Text variant="bodySmall" style={styles.placeholderSubtext}>
          Complete workouts to see intensity distribution
        </Text>
      </View>
    );
  }

  // Color scheme for intensity levels
  const intensityColors: Record<string, string> = {
    'Warmup': '#60A5FA', // Blue
    'Working': '#34D399', // Green
    'Heavy': '#FBBF24', // Yellow
    'Max': '#F87171', // Red
  };

  // Prepare pie chart data - only include buckets with data
  const pieData = intensityData.intensityBuckets
    .filter(bucket => bucket.setCount > 0)
    .map(bucket => ({
      name: bucket.label,
      population: bucket.setCount,
      color: intensityColors[bucket.label] || '#9CA3AF',
      legendFontColor: colors.text,
      legendFontSize: 13,
    }));

  if (pieData.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text variant="bodyMedium" style={styles.placeholderText}>
          No intensity data available
        </Text>
      </View>
    );
  }

  const chartWidth = Dimensions.get('window').width - 64;

  // Analyze intensity distribution for warnings/feedback
  const heavyPercentage = intensityData.intensityBuckets
    .filter(b => b.label === 'Heavy' || b.label === 'Max')
    .reduce((sum, b) => sum + b.percentage, 0);

  const workingPercentage = intensityData.intensityBuckets
    .find(b => b.label === 'Working')?.percentage || 0;

  let feedbackMessage = '';
  let feedbackStyle = styles.goodText;

  if (heavyPercentage > 40) {
    feedbackMessage = '⚠️ High intensity load. Ensure adequate recovery between sessions.';
    feedbackStyle = styles.warningText;
  } else if (workingPercentage > 60) {
    feedbackMessage = '✓ Balanced intensity distribution. Great training volume!';
    feedbackStyle = styles.goodText;
  } else if (intensityData.warmupSetsCount / (intensityData.warmupSetsCount + intensityData.workingSetsCount + intensityData.heavySetsCount) > 0.4) {
    feedbackMessage = 'Consider adding more working sets for better results.';
    feedbackStyle = styles.warningText;
  } else {
    feedbackMessage = '✓ Good intensity balance across your workout.';
    feedbackStyle = styles.goodText;
  }

  return (
    <View style={styles.container}>
      <PieChart
        data={pieData}
        width={chartWidth}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        hasLegend={false}
      />

      {/* Custom Legend with Stats */}
      <View style={styles.statsContainer}>
        {intensityData.intensityBuckets
          .filter(bucket => bucket.setCount > 0)
          .map((bucket, index) => (
            <View key={index} style={styles.statsRow}>
              <View style={styles.statsLabel}>
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: intensityColors[bucket.label] || '#9CA3AF' },
                  ]}
                />
                <Text style={styles.labelText}>
                  {bucket.label} ({bucket.range})
                </Text>
              </View>
              <Text style={styles.statsValue}>
                {bucket.setCount} sets ({bucket.percentage.toFixed(0)}%)
              </Text>
            </View>
          ))}
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Average Intensity</Text>
          <Text style={styles.summaryValue}>{intensityData.averageIntensity}%</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Heavy Sets (≥85%)</Text>
          <Text style={styles.summaryValue}>{intensityData.heavySetsCount} sets</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Working Sets (65-85%)</Text>
          <Text style={styles.summaryValue}>{intensityData.workingSetsCount} sets</Text>
        </View>
        
        <Text style={feedbackStyle}>{feedbackMessage}</Text>
      </View>
    </View>
  );
}
