import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: compact ? 8 : 12,
      marginVertical: compact ? 4 : 8,
      overflow: 'hidden',
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: compact ? 12 : 16,
      backgroundColor: colors.surface,
    },
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontSize: compact ? 14 : 16,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    badge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 24,
      alignItems: 'center',
    },
    badgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: 'bold',
    },
    content: {
      padding: compact ? 12 : 16,
      paddingTop: compact ? 8 : 12,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.7}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {icon && <Text style={{ fontSize: 16 }}>{icon}</Text>}
            <Text style={styles.title}>{title}</Text>
            {badge !== undefined && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <IconButton
            icon={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            onPress={toggleExpanded}
          />
        </View>
      </TouchableOpacity>
      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}
