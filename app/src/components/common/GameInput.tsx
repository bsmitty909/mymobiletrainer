/**
 * GameInput Component - Modern 2024 Design
 *
 * Clean input with increment/decrement buttons for workout logging
 */

import React from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, components } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

interface GameInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  keyboardType?: 'default' | 'numeric' | 'number-pad' | 'decimal-pad';
  onIncrement?: () => void;
  onDecrement?: () => void;
  incrementAmount?: number;
  unit?: string;
}

export default function GameInput({
  value,
  onChangeText,
  placeholder,
  label,
  keyboardType = 'numeric',
  onIncrement,
  onDecrement,
  incrementAmount = 5,
  unit,
}: GameInputProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <View style={styles.inputRow}>
        {onDecrement && (
          <TouchableOpacity
            onPress={onDecrement}
            style={[styles.adjustButton, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }]}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="minus"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        )}
        
        <View style={[styles.inputWrapper, {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            keyboardType={keyboardType}
            style={[styles.input, { color: colors.text }]}
            selectionColor={colors.primary}
          />
          {unit && (
            <Text style={[styles.unit, { color: colors.textSecondary }]}>
              {unit}
            </Text>
          )}
        </View>
        
        {onIncrement && (
          <TouchableOpacity
            onPress={onIncrement}
            style={[styles.adjustButton, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }]}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adjustButton: {
    width: 44,
    height: components.input.height,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  inputWrapper: {
    flex: 1,
    height: components.input.height,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  input: {
    flex: 1,
    ...typography.bodyLarge,
    textAlign: 'center',
    paddingVertical: 0,
    fontWeight: '600',
  },
  unit: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
