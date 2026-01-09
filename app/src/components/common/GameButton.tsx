/**
 * GameButton Component
 *
 * Large, game-styled button with bold text and visual effects
 * Includes haptic feedback on press
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

  const handlePress = async () => {
    if (hapticFeedback) {
      await HapticService.buttonPress();
    }
    onPress();
  };

  const gradientColors = {
    primary: [colors.primary, colors.primary + 'DD'],
    secondary: ['#6c5ce7', '#5f50d4'],
    success: ['#00b894', '#00a085'],
    danger: ['#d63031', '#c71f20'],
  };

  const buttonHeight = {
    large: 50,
    medium: 44,
    small: 38,
  };

  const fontSize = {
    large: 15,
    medium: 14,
    small: 13,
  };

  const getButtonColor = () => {
    if (variant === 'primary') return colors.primary;
    if (variant === 'success') return colors.success;
    if (variant === 'danger') return colors.error || '#d63031';
    return colors.textSecondary;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          height: buttonHeight[size],
          opacity: disabled ? 0.3 : 1,
          backgroundColor: getButtonColor(),
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={fontSize[size] + 4}
            color="#fff"
          />
        )}
        <Text style={[styles.text, { fontSize: fontSize[size] }]}>{children}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
});
