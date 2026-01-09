import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import IntensityBadge from './IntensityBadge';
import useThemeColors from '../../utils/useThemeColors';

interface CompactSetCardProps {
  setNumber: number;
  weight: number;
  reps: number | string;
  restPeriod?: string;
  intensityPercentage: number;
  label?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  isLocked?: boolean;
  onPress?: () => void;
}

export default function CompactSetCard({
  setNumber,
  weight,
  reps,
  restPeriod,
  intensityPercentage,
  label,
  isCompleted = false,
  isCurrent = false,
  isLocked = false,
  onPress,
}: CompactSetCardProps) {
  const colors = useThemeColors();

  const formatReps = (r: number | string) => {
    if (r === 'REP_OUT') return 'Max';
    if (typeof r === 'object' && r !== null) return `${(r as any).min}-${(r as any).max}`;
    return r;
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginVertical: 3,
      backgroundColor: isCompleted
        ? colors.success + '15'
        : isCurrent
        ? colors.primary + '15'
        : isLocked
        ? colors.background
        : colors.surface,
      borderWidth: isCurrent ? 2 : isLocked ? 1 : 0,
      borderColor: isCurrent ? colors.primary : isLocked ? colors.border : 'transparent',
      borderStyle: isLocked ? 'dashed' : 'solid',
      opacity: isLocked ? 0.6 : 1,
    },
    setNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isCompleted ? colors.success : isCurrent ? colors.primary : colors.textSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    setNumberText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    mainInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    weightReps: {
      flex: 1,
    },
    weightText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    labelText: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '600',
      marginTop: 2,
    },
    intensityBadge: {
      marginLeft: 4,
    },
  });

  const CardContent = (
    <View style={styles.container}>
      <View style={styles.setNumber}>
        <Text style={styles.setNumberText}>
          {isLocked ? '🔒' : isCompleted ? '✓' : setNumber}
        </Text>
      </View>
      <View style={styles.mainInfo}>
        <View style={styles.weightReps}>
          <Text style={styles.weightText}>
            {weight} × {formatReps(reps)}
          </Text>
          {label && <Text style={styles.labelText}>{label}</Text>}
        </View>
        <View style={styles.intensityBadge}>
          <IntensityBadge
            percentage={intensityPercentage}
            size="small"
            showLabel={false}
          />
        </View>
      </View>
    </View>
  );

  if (onPress && !isLocked) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
}
