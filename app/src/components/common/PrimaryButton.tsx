/**
 * Primary Button Component
 * 
 * Reusable button component with consistent styling across the app.
 * Based on design system from architecture plan.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: any;
}

export default function PrimaryButton({
  title,
  onPress,
  mode = 'contained',
  disabled = false,
  loading = false,
  icon,
  style,
}: PrimaryButtonProps) {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon={icon}
      style={[styles.button, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}
    >
      {title}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  content: {
    paddingVertical: 8,
    minHeight: 56,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
