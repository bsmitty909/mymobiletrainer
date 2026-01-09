/**
 * GameInput Component
 * 
 * Large, game-styled input with bold styling
 */

import React from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import useThemeColors from '../../utils/useThemeColors';

interface GameInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  keyboardType?: 'default' | 'numeric' | 'number-pad';
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
  keyboardType = 'default',
  onIncrement,
  onDecrement,
  incrementAmount = 5,
  unit,
}: GameInputProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View style={styles.inputRow}>
        {onDecrement && (
          <TouchableOpacity
            onPress={onDecrement}
            style={[styles.adjustButton, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.adjustButtonText, { color: colors.primary }]}>
              -{incrementAmount}
            </Text>
          </TouchableOpacity>
        )}
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            keyboardType={keyboardType}
            style={[styles.input, { color: colors.text }]}
          />
          {unit && (
            <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>
          )}
        </View>
        {onIncrement && (
          <TouchableOpacity
            onPress={onIncrement}
            style={[styles.adjustButton, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.adjustButtonText, { color: colors.primary }]}>
              +{incrementAmount}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: '400',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  adjustButtonText: {
    fontSize: 14,
    fontWeight: '400',
  },
  inputWrapper: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    paddingVertical: 0,
  },
  unit: {
    fontSize: 10,
    fontWeight: '400',
    flexShrink: 0,
    marginLeft: 4,
    width: 26,
    opacity: 0.3,
  },
});
