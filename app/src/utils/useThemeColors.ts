/**
 * Theme Colors Hook - Modern 2024 Design System
 *
 * Provides theme-aware colors that adapt to light/dark mode
 * Based on new design tokens
 */

import { useTheme } from 'react-native-paper';
import { colors } from '../theme/designTokens';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  success: string;
  successLight: string;
  warning: string;
  error: string;
  card: string;
  headerBackground: string;
  headerText: string;
}

export function useThemeColors(): ThemeColors {
  const theme = useTheme();
  const isDark = theme.dark;

  const palette = isDark ? colors.dark : colors.light;

  return {
    background: palette.background,
    surface: palette.surface,
    surfaceElevated: palette.surfaceElevated,
    text: palette.text.primary,
    textSecondary: palette.text.secondary,
    textTertiary: palette.text.tertiary,
    textDisabled: palette.text.disabled,
    border: palette.border,
    borderLight: palette.borderLight,
    primary: colors.primary.main,
    primaryLight: colors.primary.light,
    primaryDark: colors.primary.dark,
    success: colors.success.main,
    successLight: colors.success.light,
    warning: colors.warning.main,
    error: colors.error.main,
    card: palette.surface,
    headerBackground: colors.primary.main,
    headerText: '#FFFFFF',
  };
}

export default useThemeColors;
