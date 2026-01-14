/**
 * AchievementCard Component - Modern 2024 Design
 *
 * Clean, modern achievement card with refined gradients and animations
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

interface AchievementCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: 'gold' | 'silver' | 'bronze' | 'blue' | 'green';
  subtitle?: string;
  onPress?: () => void;
}

export default function AchievementCard({ title, value, icon, color, subtitle, onPress }: AchievementCardProps) {
  const colors = useThemeColors();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
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

  const gradientColors: Record<string, [string, string]> = {
    gold: ['#FFD700', '#FFA500'],
    silver: ['#E8E8E8', '#B8B8B8'],
    bronze: ['#CD7F32', '#A0522D'],
    blue: ['#0066FF', '#0052CC'],
    green: ['#00C853', '#00A043'],
  };

  const shadowColors = {
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    blue: '#0066FF',
    green: '#00C853',
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        activeOpacity={0.95}
        style={styles.touchable}
      >
        <LinearGradient
          colors={gradientColors[color]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.container,
            {
              shadowColor: shadowColors[color],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon} size={32} color="#fff" />
          </View>
          
          <View style={styles.content}>
            <Text style={styles.value} numberOfLines={1}>{value}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          
          <View style={styles.shine} />
          
          {onPress && (
            <View style={styles.tapIndicator}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color="rgba(255, 255, 255, 0.5)"
              />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: borderRadius.lg,
  },
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.comfortable,
    height: 160,
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    position: 'absolute',
    top: spacing.close,
    right: spacing.close,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'flex-start',
  },
  value: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    ...typography.label,
    color: '#fff',
    marginTop: spacing.tight,
    opacity: 0.95,
  },
  subtitle: {
    ...typography.label,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: spacing.micro,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tapIndicator: {
    position: 'absolute',
    bottom: spacing.tight,
    right: spacing.tight,
  },
});
