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
    large: 70,
    medium: 56,
    small: 44,
  };

  const fontSize = {
    large: 22,
    medium: 18,
    small: 16,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        { height: buttonHeight[size], opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={fontSize[size] + 6}
              color="#fff"
            />
          )}
          <Text style={[styles.text, { fontSize: fontSize[size] }]}>{children}</Text>
        </View>
        <View style={styles.shine} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    flexShrink: 1,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
