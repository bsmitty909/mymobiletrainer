/**
 * Modern Button Component - 2024 Design System
 * 
 * Professional button following Nike/Hevy design patterns
 * Features smooth animations, proper sizing, and accessibility
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, shadows, components } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'text' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  children: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}: ButtonProps) {
  const themeColors = useThemeColors();
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

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: components.button.borderRadius,
      paddingHorizontal: components.button.paddingHorizontal,
      height: components.button.height[size],
      minWidth: size === 'small' ? 100 : size === 'medium' ? 120 : 140,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? themeColors.textDisabled : colors.primary.main,
          ...(!disabled && shadows.primary),
        };
      
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? themeColors.textDisabled : themeColors.surface,
          borderWidth: 2,
          borderColor: disabled ? themeColors.border : themeColors.border,
          ...shadows.sm,
        };
      
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: disabled ? themeColors.textDisabled : colors.success.main,
          ...(!disabled && {
            shadowColor: colors.success.main,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 6,
          }),
        };
      
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: disabled ? themeColors.textDisabled : colors.primary.main,
        };
      
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          paddingHorizontal: 12,
          minWidth: 0,
        };
      
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...typography.labelLarge,
      fontSize: size === 'small' ? 13 : size === 'medium' ? 15 : 17,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    };

    if (disabled) {
      return { ...baseTextStyle, color: '#999999', opacity: 0.6 };
    }

    switch (variant) {
      case 'primary':
      case 'success':
        return { ...baseTextStyle, color: '#FFFFFF' };
      
      case 'secondary':
        return { ...baseTextStyle, color: themeColors.text };
      
      case 'outline':
      case 'text':
        return { ...baseTextStyle, color: colors.primary.main };
      
      default:
        return baseTextStyle;
    }
  };

  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const iconColor = 
    variant === 'primary' || variant === 'success' ? '#FFFFFF' :
    variant === 'secondary' ? themeColors.text :
    colors.primary.main;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[getButtonStyle(), style]}
        activeOpacity={0.9}
      >
        {icon && iconPosition === 'left' && (
          <MaterialCommunityIcons
            name={icon}
            size={iconSize}
            color={iconColor}
            style={{ marginRight: 8 }}
          />
        )}
        
        <Text style={getTextStyle()}>
          {loading ? 'LOADING...' : children}
        </Text>
        
        {icon && iconPosition === 'right' && (
          <MaterialCommunityIcons
            name={icon}
            size={iconSize}
            color={iconColor}
            style={{ marginLeft: 8 }}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Additional styles if needed
});
