/**
 * Design Tokens - Modern 2024 Design System
 * 
 * Centralized design tokens following Nike/Hevy-inspired system
 * Based on /plans/DESIGN-SYSTEM-2024.md
 */

export const colors = {
  // Primary Palette
  primary: {
    main: '#0066FF',
    light: '#3385FF',
    dark: '#0052CC',
  },
  
  success: {
    main: '#00C853',
    light: '#69F0AE',
    dark: '#00A043',
  },
  
  warning: {
    main: '#FF9100',
    light: '#FFAB40',
  },
  
  error: {
    main: '#FF3B30',
    light: '#FF6B6B',
  },
  
  // Light Mode Neutrals
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceElevated: '#FFFFFF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    
    text: {
      primary: '#1A1A1A',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      disabled: '#D1D5DB',
    },
  },
  
  // Dark Mode Neutrals
  dark: {
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceElevated: '#2A2A2A',
    border: '#2A2A2A',
    borderLight: '#1F1F1F',
    
    text: {
      primary: '#FFFFFF',
      secondary: '#A1A1A1',
      tertiary: '#717171',
      disabled: '#4A4A4A',
    },
  },
  
  // Intensity Levels
  intensity: {
    warmup: '#FFC107',
    light: '#4CAF50',
    moderate: '#FF9800',
    heavy: '#F44336',
    max: '#9C27B0',
  },
  
  // Data Visualization
  chart: {
    blue: '#0066FF',
    green: '#00C853',
    orange: '#FF9100',
    purple: '#7C4DFF',
    pink: '#FF4081',
  },
};

export const typography = {
  // Font Weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
  
  // Type Scale
  display: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '900' as const,
    letterSpacing: -0.5,
  },
  
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  
  bodyLarge: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  
  labelLarge: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
  
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  
  // Primary colored shadow for CTAs
  primary: {
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const components = {
  button: {
    height: {
      small: 44,
      medium: 56,
      large: 64,
    },
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
  },
  
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.base,
  },
  
  input: {
    height: 56,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    borderWidth: 2,
  },
  
  badge: {
    height: 24,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
};

export const animation = {
  timing: {
    fast: 150,
    standard: 250,
    slow: 300,
  },
  
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },
};

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
  animation,
};

export default designTokens;
