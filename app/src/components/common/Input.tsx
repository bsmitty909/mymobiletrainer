/**
 * Input Component
 * 
 * Reusable text/number input field with consistent styling
 */

import React, { forwardRef } from 'react';
import { StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';
import useThemeColors from '../../utils/useThemeColors';

interface InputProps extends Omit<TextInputProps, 'mode'> {
  error?: boolean;
  helperText?: string;
}

const Input = forwardRef<RNTextInput, InputProps>(({
  error,
  helperText,
  style,
  ...props
}, ref) => {
  const colors = useThemeColors();
  
  const styles = StyleSheet.create({
    input: {
      backgroundColor: colors.surface,
      marginVertical: 8,
    },
  });

  return (
    <>
      <TextInput
        ref={ref}
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
});

Input.displayName = 'Input';

export default Input;
