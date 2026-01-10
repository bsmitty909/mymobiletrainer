/**
 * GameButton Component - Modern 2024 Design
 *
 * Enhanced button with modern styling, haptic feedback, and animations
 * Matches new design system while keeping game-like feel
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors as designColors, typography, spacing, components, shadows } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';
import HapticService from '../../services/HapticService';

interface GameButtonProps {
  onPress: () => void;
  children: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'large' | 'medium' | 'small';
  disabled?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: ViewStyle;
  hapticFeedback?: boolean;
}

export default function GameButton({
  onPress,
  children,
  variant = 'primary',
  size = 'large',
  disabled = false,
  icon,
  style,
  hapticFeedback = true,
}: GameButtonProps) {
  const colors = useThemeColors();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePress = async () => {
    if (hapticFeedback) {
      await HapticService.buttonPress();
    }
    onPress();
  };

  const buttonHeight = {
    large: components.button.height.large,
    medium: components.button.height.medium,
    small: components.button.height.small,
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: buttonHeight[size],
      borderRadius: components.button.borderRadius,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: components.button.paddingHorizontal,
      marginVertical: spacing.sm,
    };

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: colors.textDisabled,
        opacity: 0.5,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: designColors.primary.main,
          ...shadows.primary,
        };
      
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: designColors.success.main,
          shadowColor: designColors.success.main,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 6,
        };
      
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: designColors.error.main,
          shadowColor: designColors.error.main,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 6,
        };
      
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          borderWidth: 2,
          borderColor: colors.border,
          ...shadows.sm,
        };
      
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      ...typography.labelLarge,
      fontSize: size === 'large' ? 15 : size === 'medium' ? 13 : 12,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    };

    if (variant === 'secondary') {
      return { ...baseTextStyle, color: colors.text };
    }

    return { ...baseTextStyle, color: '#FFFFFF' };
  };

  const iconSize = size === 'large' ? 20 : size === 'medium' ? 18 : 16;
  const iconColor = variant === 'secondary' ? colors.text : '#FFFFFF';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
        style={[getButtonStyle(), style]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={iconSize}
            color={iconColor}
            style={styles.icon}
          />
        )}
        <Text style={getTextStyle()}>{children}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginRight: spacing.sm,
  },
});
