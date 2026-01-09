/**
 * IntensityWaveChart Component
 * 
 * Visualizes the 3-week intensity wave pattern:
 * Week 1: Light (85%) → Week 2: Medium (90%) → Week 3: Heavy (95%)
 * Shows current position and upcoming phases
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useThemeColors from '../../utils/useThemeColors';
import { PeriodizationPlan, IntensityWave } from '../../services/PeriodizationService';

interface IntensityWaveChartProps {
  periodizationPlan: PeriodizationPlan;
  visible: boolean;
}

export default function IntensityWaveChart({ 
  periodizationPlan, 
  visible 
}: IntensityWaveChartProps) {
  const colors = useThemeColors();

  if (!visible || !periodizationPlan.currentWave || periodizationPlan.isDeloadWeek) {
    return null;
  }

  const wave = periodizationPlan.currentWave;

  const getPhaseColor = (phase: 'light' | 'medium' | 'heavy', isCurrent: boolean) => {
    if (!isCurrent) return '#9CA3AF'; // Gray for non-current
    
    switch (phase) {
      case 'light': return '#10B981'; // Green
      case 'medium': return '#F59E0B'; // Amber
      case 'heavy': return '#EF4444'; // Red
      default: return colors.primary;
    }
  };

  const getPhaseIntensity = (phase: 'light' | 'medium' | 'heavy') => {
    switch (phase) {
      case 'light': return 85;
      case 'medium': return 90;
      case 'heavy': return 95;
    }
  };

  const phases: Array<'light' | 'medium' | 'heavy'> = ['light', 'medium', 'heavy'];
  const currentPhaseIndex = phases.indexOf(wave.phase);

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    wavePattern: {
      fontSize: 20,
      color: colors.text,
    },
    chart: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 120,
      marginVertical: 12,
    },
    phaseColumn: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    bar: {
      width: '100%',
      borderRadius: 8,
      marginBottom: 8,
    },
    phaseLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      marginBottom: 4,
      textAlign: 'center',
    },
    intensityLabel: {
      fontSize: 18,
      fontWeight: '900',
      textAlign: 'center',
      marginBottom: 4,
    },
    phaseDescription: {
      fontSize: 10,
      textAlign: 'center',
      fontWeight: '600',
    },
    currentIndicator: {
      fontSize: 16,
      marginTop: 4,
    },
    footer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    legendContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 8,
      gap: 16,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerLeft}>
          <Text style={dynamicStyles.title}>Intensity Wave</Text>
          <Text style={dynamicStyles.subtitle}>Week {wave.weekNumber}</Text>
        </View>
        <Text style={dynamicStyles.wavePattern}>
          {wave.phase === 'light' ? '●○○' : wave.phase === 'medium' ? '●●○' : '●●●'}
        </Text>
      </View>

      <View style={dynamicStyles.chart}>
        {phases.map((phase, index) => {
          const isCurrent = index === currentPhaseIndex;
          const isPast = index < currentPhaseIndex;
          const intensity = getPhaseIntensity(phase);
          const phaseColor = getPhaseColor(phase, isCurrent);
          const barHeight = (intensity / 95) * 100; // Scale to max height

          return (
            <View key={phase} style={dynamicStyles.phaseColumn}>
              <Text style={[
                dynamicStyles.phaseLabel,
                { color: isCurrent ? phaseColor : colors.textSecondary }
              ]}>
                {phase}
              </Text>
              <Text style={[
                dynamicStyles.intensityLabel,
                { color: isCurrent ? phaseColor : colors.textSecondary }
              ]}>
                {intensity}%
              </Text>
              <View style={[
                dynamicStyles.bar,
                {
                  height: barHeight,
                  backgroundColor: isCurrent ? phaseColor : isPast ? phaseColor + '40' : colors.border,
                }
              ]} />
              {isCurrent && (
                <Text style={dynamicStyles.currentIndicator}>👉</Text>
              )}
              {isPast && (
                <Text style={[dynamicStyles.phaseDescription, { color: colors.textSecondary }]}>
                  ✓
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={dynamicStyles.footer}>
        <Text style={dynamicStyles.footerText}>
          {wave.description}
        </Text>
        <View style={dynamicStyles.legendContainer}>
          <View style={dynamicStyles.legendItem}>
            <View style={[dynamicStyles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={dynamicStyles.legendText}>Light</Text>
          </View>
          <View style={dynamicStyles.legendItem}>
            <View style={[dynamicStyles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={dynamicStyles.legendText}>Medium</Text>
          </View>
          <View style={dynamicStyles.legendItem}>
            <View style={[dynamicStyles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={dynamicStyles.legendText}>Heavy</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
