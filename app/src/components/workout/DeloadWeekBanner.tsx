/**
 * DeloadWeekBanner Component
 * 
 * Displays a prominent banner during deload weeks
 * Shows reduced intensity (70%) and recovery-focused messaging
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useThemeColors from '../../utils/useThemeColors';
import { PeriodizationPlan } from '../../services/PeriodizationService';

interface DeloadWeekBannerProps {
  periodizationPlan: PeriodizationPlan;
  visible: boolean;
}

export default function DeloadWeekBanner({ 
  periodizationPlan, 
  visible 
}: DeloadWeekBannerProps) {
  const colors = useThemeColors();

  if (!visible || !periodizationPlan.isDeloadWeek) return null;

  const intensityPercentage = Math.round(periodizationPlan.intensityMultiplier * 100);

  const dynamicStyles = StyleSheet.create({
    banner: {
      backgroundColor: '#06B6D4', // Cyan for recovery
      marginHorizontal: 16,
      marginVertical: 12,
      padding: 20,
      borderRadius: 16,
      elevation: 6,
      shadowColor: '#06B6D4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      borderWidth: 2,
      borderColor: '#06B6D4' + '40',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      gap: 8,
    },
    icon: {
      fontSize: 24,
    },
    title: {
      fontSize: 22,
      fontWeight: '900',
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    divider: {
      height: 2,
      backgroundColor: '#fff',
      opacity: 0.3,
      marginVertical: 12,
      borderRadius: 1,
    },
    info: {
      alignItems: 'center',
    },
    infoText: {
      fontSize: 15,
      color: '#fff',
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 22,
      opacity: 0.95,
    },
    intensityHighlight: {
      fontSize: 32,
      fontWeight: '900',
      color: '#fff',
      marginVertical: 8,
    },
    weekInfo: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '700',
      opacity: 0.9,
      marginTop: 8,
    },
    benefitsContainer: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#fff',
      opacity: 0.3,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
      gap: 8,
    },
    benefitIcon: {
      fontSize: 16,
    },
    benefitText: {
      fontSize: 13,
      color: '#fff',
      fontWeight: '600',
      opacity: 0.95,
    },
    motivation: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#fff',
      opacity: 0.3,
    },
    motivationText: {
      fontSize: 13,
      color: '#fff',
      fontWeight: '700',
      textAlign: 'center',
      opacity: 0.9,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={dynamicStyles.banner}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.icon}>🛡️</Text>
        <Text style={dynamicStyles.title}>Recovery Week</Text>
        <Text style={dynamicStyles.icon}>🛡️</Text>
      </View>

      <View style={dynamicStyles.divider} />

      <View style={dynamicStyles.info}>
        <Text style={dynamicStyles.infoText}>
          Training at reduced intensity
        </Text>
        <Text style={dynamicStyles.intensityHighlight}>
          {intensityPercentage}%
        </Text>
        <Text style={dynamicStyles.infoText}>
          Week {periodizationPlan.currentWeek}
        </Text>
        <Text style={dynamicStyles.weekInfo}>
          Next deload: Week {periodizationPlan.nextDeloadWeek}
        </Text>
      </View>

      <View style={dynamicStyles.benefitsContainer}>
        <View style={dynamicStyles.benefitRow}>
          <Text style={dynamicStyles.benefitIcon}>✓</Text>
          <Text style={dynamicStyles.benefitText}>
            Promotes muscle recovery
          </Text>
        </View>
        <View style={dynamicStyles.benefitRow}>
          <Text style={dynamicStyles.benefitIcon}>✓</Text>
          <Text style={dynamicStyles.benefitText}>
            Reduces accumulated fatigue
          </Text>
        </View>
        <View style={dynamicStyles.benefitRow}>
          <Text style={dynamicStyles.benefitIcon}>✓</Text>
          <Text style={dynamicStyles.benefitText}>
            Prepares for next intensity wave
          </Text>
        </View>
      </View>

      <View style={dynamicStyles.motivation}>
        <Text style={dynamicStyles.motivationText}>
          "Recovery is not weakness, it's strategic strength building"
        </Text>
      </View>
    </View>
  );
}
