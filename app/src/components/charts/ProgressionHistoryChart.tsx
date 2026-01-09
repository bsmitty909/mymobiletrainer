/**
 * Progression History Chart Component
 * 
 * Displays 4RM progression over time for a specific exercise
 * Shows week-over-week strength gains with trend lines
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import useThemeColors from '../../utils/useThemeColors';

interface ProgressionHistoryChartProps {
  progressionData: Array<{ week: number; weight: number; date: Date }>;
  exerciseName: string;
  showTrend?: boolean;
}

export default function ProgressionHistoryChart({ 
  progressionData, 
  exerciseName,
  showTrend = true 
}: ProgressionHistoryChartProps) {
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
    legend: {
      marginTop: 8,
      alignItems: 'center',
    },
    legendText: {
      color: colors.textSecondary,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 12,
      paddingHorizontal: 16,
    },
    statItem: {
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    statChange: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 2,
    },
    positive: {
      color: '#10B981',
    },
    negative: {
      color: '#EF4444',
    },
    neutral: {
      color: colors.textSecondary,
    },
  });

  if (!progressionData || progressionData.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text variant="bodyLarge" style={styles.placeholderText}>
          📊
        </Text>
        <Text variant="bodyMedium" style={styles.placeholderText}>
          No progression data yet
        </Text>
        <Text variant="bodySmall" style={styles.placeholderSubtext}>
          Complete workouts to see {exerciseName} progression
        </Text>
      </View>
    );
  }

  const sortedData = [...progressionData].sort((a, b) => a.week - b.week);
  
  // Show last 8 data points for readability
  const displayData = sortedData.slice(-8);
  const weights = displayData.map(d => d.weight);
  const labels = displayData.map(d => `W${d.week}`);

  // Calculate progression stats
  const startWeight = displayData[0].weight;
  const currentWeight = displayData[displayData.length - 1].weight;
  const totalGain = currentWeight - startWeight;
  const totalGainPercentage = ((totalGain / startWeight) * 100).toFixed(1);
  const avgGainPerWeek = displayData.length > 1 
    ? (totalGain / (displayData.length - 1)).toFixed(1) 
    : '0';

  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight;

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => {
      // Use green for gains, red for losses
      const baseColor = totalGain >= 0 ? '#10B981' : '#EF4444';
      return `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
    },
    labelColor: (opacity = 1) => `${colors.textSecondary}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '3',
      stroke: totalGain >= 0 ? '#10B981' : '#EF4444',
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // solid lines
      stroke: colors.border,
      strokeWidth: 1,
    },
  };

  const chartWidth = Dimensions.get('window').width - 64;

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: weights,
              color: (opacity = 1) => totalGain >= 0 
                ? `rgba(16, 185, 129, ${opacity})`
                : `rgba(239, 68, 68, ${opacity})`,
              strokeWidth: 3,
            },
          ],
        }}
        width={chartWidth}
        height={240}
        chartConfig={chartConfig}
        bezier={showTrend}
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        withDots={true}
        withShadow={false}
        fromZero={false}
        yAxisSuffix=" lbs"
        yAxisInterval={1}
        segments={4}
      />
      
      <View style={styles.legend}>
        <Text variant="bodySmall" style={styles.legendText}>
          {exerciseName} - Last {displayData.length} weeks
        </Text>
      </View>

      {/* Progression Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Gain</Text>
          <Text style={styles.statValue}>{totalGain >= 0 ? '+' : ''}{totalGain} lbs</Text>
          <Text style={[
            styles.statChange, 
            totalGain > 0 ? styles.positive : totalGain < 0 ? styles.negative : styles.neutral
          ]}>
            {totalGain >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(totalGainPercentage))}%
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg/Week</Text>
          <Text style={styles.statValue}>{avgGainPerWeek} lbs</Text>
          <Text style={[styles.statChange, styles.neutral]}>
            per week
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Range</Text>
          <Text style={styles.statValue}>{range} lbs</Text>
          <Text style={[styles.statChange, styles.neutral]}>
            {minWeight} - {maxWeight}
          </Text>
        </View>
      </View>
    </View>
  );
}
