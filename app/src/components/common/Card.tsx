/**
 * Card Component - Modern 2024 Design
 *
 * Reusable card with modern styling following design system
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Animated } from 'react-native';
import { spacing, borderRadius, shadows } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
  onPress?: () => void;
  padding?: number;
}

export default function Card({
  children,
  style,
  elevated = false,
  variant = 'default',
  onPress,
  padding = spacing.lg,
}: CardProps) {
  const colors = useThemeColors();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      padding,
      marginVertical: spacing.md,
      marginHorizontal: spacing.base,
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.border,
        };
      
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: colors.surfaceElevated,
          ...(elevated ? shadows.lg : shadows.sm),
        };
      
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          ...(elevated ? shadows.md : shadows.sm),
        };
    }
  };

  const cardStyle = [getCardStyle(), style];

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.95}
          style={cardStyle}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}
