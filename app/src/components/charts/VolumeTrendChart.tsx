/**
 * Volume Trend Chart Component
 * 
 * Displays total workout volume over time using a bar chart
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import useThemeColors from '../../utils/useThemeColors';

interface VolumeTrendChartProps {
  workoutHistory: Array<{ date: number; totalVolume: number; weekNumber: number; dayNumber: number }>;
}

export default function VolumeTrendChart({ workoutHistory }: VolumeTrendChartProps) {
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
    },
    legendText: {
      color: colors.textSecondary,
    },
  });

  // If no data, show placeholder
  if (!workoutHistory || workoutHistory.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text variant="bodyLarge" style={styles.placeholderText}>📊</Text>
        <Text variant="bodyMedium" style={styles.placeholderText}>
          No workout data yet
        </Text>
        <Text variant="bodySmall" style={styles.placeholderSubtext}>
          Complete workouts to see volume trends
        </Text>
      </View>
    );
  }

  // Prepare chart data - last 6 workouts
  const sortedData = [...workoutHistory].sort((a, b) => a.date - b.date);
  const recentWorkouts = sortedData.slice(-6);
  
  const volumes = recentWorkouts.map(w => Math.round(w.totalVolume / 1000)); // Convert to thousands
  const labels = recentWorkouts.map(w => `W${w.weekNumber}D${w.dayNumber}`);

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `${colors.success}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    labelColor: (opacity = 1) => `${colors.textSecondary}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.7,
  };

  const chartWidth = Dimensions.get('window').width - 64;

  return (
    <View style={styles.container}>
      <BarChart
        data={{
          labels: labels,
          datasets: [
            {
              data: volumes,
            },
          ],
        }}
        width={chartWidth}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        showValuesOnTopOfBars={true}
        withInnerLines={false}
        fromZero={true}
        yAxisLabel=""
        yAxisSuffix="k"
      />
      <View style={styles.legend}>
        <Text variant="bodySmall" style={styles.legendText}>
          Total volume (1000s of lbs) per workout
        </Text>
      </View>
    </View>
  );
}
