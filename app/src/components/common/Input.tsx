/**
 * Input Component
 * 
 * Reusable text/number input field with consistent styling
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';

interface InputProps extends Omit<TextInputProps, 'mode'> {
  error?: boolean;
  helperText?: string;
}

export default function Input({ 
  error, 
  helperText, 
  style,
  ...props 
}: InputProps) {
  return (
    <>
      <TextInput
        mode="outlined"
        style={[styles.input, style]}
        error={error}
        {...props}
      />
      {helperText && (
        <HelperText type={error ? 'error' : 'info'} visible={!!helperText}>
          {helperText}
        </HelperText>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
  },
});
