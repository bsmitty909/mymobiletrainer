/**
 * DownSetBanner Component
 * 
 * Displays a prominent banner when down sets (volume work) begin
 * Shown after a failed max attempt to redirect user to volume building
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useThemeColors from '../../utils/useThemeColors';

interface DownSetBannerProps {
  numberOfSets: number;
  weight: number;
  visible: boolean;
}

export default function DownSetBanner({ 
  numberOfSets, 
  weight, 
  visible 
}: DownSetBannerProps) {
  const colors = useThemeColors();

  if (!visible) return null;

  const dynamicStyles = StyleSheet.create({
    banner: {
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      marginVertical: 12,
      padding: 20,
      borderRadius: 16,
      elevation: 6,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      borderWidth: 2,
      borderColor: colors.primary + '40',
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
    weightHighlight: {
      fontSize: 28,
      fontWeight: '900',
      color: '#fff',
      marginVertical: 8,
    },
    setCount: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '700',
      opacity: 0.9,
      marginTop: 8,
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
        <Text style={dynamicStyles.icon}>💪</Text>
        <Text style={dynamicStyles.title}>Volume Work</Text>
        <Text style={dynamicStyles.icon}>💪</Text>
      </View>

      <View style={dynamicStyles.divider} />

      <View style={dynamicStyles.info}>
        <Text style={dynamicStyles.infoText}>
          Build strength with down sets
        </Text>
        <Text style={dynamicStyles.weightHighlight}>
          {weight} lbs
        </Text>
        <Text style={dynamicStyles.infoText}>
          (80% of your max)
        </Text>
        <Text style={dynamicStyles.setCount}>
          {numberOfSets} sets • 8 reps each • Last set: REP OUT
        </Text>
      </View>

      <View style={dynamicStyles.motivation}>
        <Text style={dynamicStyles.motivationText}>
          "Volume builds the mountain, intensity reveals the peak"
        </Text>
      </View>
    </View>
  );
}
