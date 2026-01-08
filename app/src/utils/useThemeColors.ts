/**
 * Theme Colors Hook
 * 
 * Provides theme-aware colors that adapt to light/dark mode
 */

import { useTheme } from 'react-native-paper';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  success: string;
  error: string;
  card: string;
  headerBackground: string;
  headerText: string;
}

export function useThemeColors(): ThemeColors {
  const theme = useTheme();
  const isDark = theme.dark;

  return {
    background: isDark ? '#111827' : '#F3F4F6',
    surface: isDark ? '#1F2937' : '#FFFFFF',
    text: isDark ? '#F9FAFB' : '#1F2937',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    primary: theme.colors.primary,
    success: '#10B981',
    error: '#EF4444',
    card: isDark ? '#1F2937' : '#FFFFFF',
    headerBackground: isDark ? '#1F2937' : '#2563EB',
    headerText: '#FFFFFF',
  };
}

export default useThemeColors;
