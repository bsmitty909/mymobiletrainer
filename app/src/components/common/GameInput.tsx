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
    marginVertical: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustButton: {
    width: 70,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  adjustButtonText: {
    fontSize: 20,
    fontWeight: '900',
  },
  inputWrapper: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    borderWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 8,
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 0,
    marginLeft: 6,
    width: 40,
  },
});
