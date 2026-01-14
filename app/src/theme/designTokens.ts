/**
 * Design Tokens - Nike/Hevy Style Design System
 *
 * Updated to Nike-inspired bold, confident aesthetic
 * Based on /plans/NIKE-STYLE-REDESIGN-PLAN.md
 */

export const colors = {
  // Primary Palette - Bold & Saturated
  primary: {
    main: '#0066FF',
    light: '#3385FF',
    dark: '#0052CC',
    darker: '#003D99',
  },
  
  success: {
    main: '#00D96F',
    light: '#00F47F',
    dark: '#00C65A',
    darker: '#00B34A',
  },
  
  warning: {
    main: '#FF9500',
    light: '#FFAB40',
    dark: '#FF8000',
  },
  
  error: {
    main: '#FF3B30',
    light: '#FF6B6B',
    dark: '#FF1F13',
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
    background: '#000000',
    surface: '#1A1A1A',
    surfaceElevated: '#2A2A2A',
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    
    text: {
      primary: '#FFFFFF',
      secondary: '#AAAAAA',
      tertiary: '#888888',
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
    green: '#00D96F',
    orange: '#FF9500',
    purple: '#7C4DFF',
    pink: '#FF4081',
  },
  
  // Gradients
  gradients: {
    primary: ['#0066FF', '#0052CC', '#003D99'],
    success: ['#00D96F', '#00C65A', '#00B34A'],
    hero: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.4)'],
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
  
  // Nike-Inspired Type Scale - MASSIVE typography
  heroDisplay: {
    fontSize: 72,
    lineHeight: 80,
    fontWeight: '900' as const,
    letterSpacing: -1.5,
  },
  
  largeDisplay: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '900' as const,
    letterSpacing: -1,
  },
  
  display: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '900' as const,
    letterSpacing: -0.8,
  },
  
  h1: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  
  h3: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  
  bodyLarge: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
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
  micro: 4,
  tight: 8,
  close: 16,
  base: 24,
  comfortable: 32,
  generous: 48,
  huge: 64,
  massive: 80,
  giant: 100,
};

export const borderRadius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
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
