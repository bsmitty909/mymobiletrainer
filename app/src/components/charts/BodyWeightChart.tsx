/**
 * Body Weight Chart Component
 * 
 * Displays body weight trend over time using a line chart
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

interface BodyWeightChartProps {
  bodyWeights: Array<{ date: number; weight: number }>;
}

export default function BodyWeightChart({ bodyWeights }: BodyWeightChartProps) {
  // If no data, show placeholder
  if (!bodyWeights || bodyWeights.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text variant="bodyLarge" style={styles.placeholderText}>
          📊
        </Text>
        <Text variant="bodyMedium" style={styles.placeholderText}>
          No body weight data yet
        </Text>
        <Text variant="bodySmall" style={styles.placeholderSubtext}>
          Log your weight to see trends
        </Text>
      </View>
    );
  }

  // Prepare chart data
  const sortedData = [...bodyWeights].sort((a, b) => a.date - b.date);
  const weights = sortedData.map(d => d.weight);
  const labels = sortedData.map(d => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  // Show only last 7 data points for readability
  const displayWeights = weights.slice(-7);
  const displayLabels = labels.slice(-7);

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#2563EB',
    },
  };

  const chartWidth = Dimensions.get('window').width - 64;

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: displayLabels,
          datasets: [
            {
              data: displayWeights,
            },
          ],
        }}
        width={chartWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        withDots={true}
        withShadow={false}
        fromZero={false}
      />
      <View style={styles.legend}>
        <Text variant="bodySmall" style={styles.legendText}>
          Last {displayWeights.length} weigh-ins
        </Text>
      </View>
    </View>
  );
}

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
    color: '#9CA3AF',
    marginVertical: 4,
  },
  placeholderSubtext: {
    color: '#D1D5DB',
    marginTop: 8,
  },
  legend: {
    marginTop: 8,
  },
  legendText: {
    color: '#6B7280',
  },
});
