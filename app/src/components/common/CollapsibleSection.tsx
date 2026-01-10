/**
 * CollapsibleSection Component - Modern 2024 Design
 *
 * Clean collapsible section with smooth animations
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, shadows } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  badge?: string | number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  compact?: boolean;
}

export default function CollapsibleSection({
  title,
  icon,
  badge,
  children,
  defaultExpanded = false,
  compact = false,
}: CollapsibleSectionProps) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext({
      duration: 250,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' }
    });
    setExpanded(!expanded);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: compact ? borderRadius.md : borderRadius.lg,
      marginVertical: compact ? spacing.xs : spacing.sm,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: compact ? spacing.md : spacing.base,
      backgroundColor: expanded ? colors.surfaceElevated : 'transparent',
    },
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconContainer: {
      width: 24,
      alignItems: 'center',
    },
    title: {
      ...typography.h3,
      fontSize: compact ? 14 : 15,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    badge: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.md,
      minWidth: 28,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      ...typography.labelSmall,
      fontSize: 10,
      color: '#FFFFFF',
    },
    chevronContainer: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.sm,
    },
    content: {
      padding: compact ? spacing.md : spacing.base,
      paddingTop: compact ? spacing.sm : spacing.md,
      backgroundColor: colors.background,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.8}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {icon && (
              <View style={styles.iconContainer}>
                <Text style={{ fontSize: 16 }}>{icon}</Text>
              </View>
            )}
            <Text style={styles.title}>{title}</Text>
            {badge !== undefined && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <View style={styles.chevronContainer}>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={colors.textSecondary}
            />
          </View>
        </View>
      </TouchableOpacity>
      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}
