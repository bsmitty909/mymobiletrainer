/**
 * AchievementCard Component
 *
 * Game-styled achievement/accomplishment card for weekly progress
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

  const gradientColors = {
    gold: ['#FFD700', '#FFA500'],
    silver: ['#C0C0C0', '#808080'],
    bronze: ['#CD7F32', '#8B4513'],
    blue: ['#4A90E2', '#357ABD'],
    green: ['#00b894', '#00a085'],
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
      style={styles.touchable}
    >
      <LinearGradient
        colors={gradientColors[color]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={32} color="#fff" />
        </View>
        <View style={styles.content}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.shine} />
        {onPress && (
          <View style={styles.tapIndicator}>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255, 255, 255, 0.6)" />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 16,
  },
  container: {
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'flex-start',
  },
  value: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    marginTop: 4,
    opacity: 0.95,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tapIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
});
