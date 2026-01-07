/**
 * Card Component
 * 
 * Reusable card wrapper for consistent styling across the app
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  onPress?: () => void;
}

export default function Card({ children, style, elevated = false, onPress }: CardProps) {
  const cardStyle = [
    styles.card,
    elevated && styles.elevated,
    style,
  ];

  if (onPress) {
    return (
      <PaperCard style={cardStyle} onPress={onPress}>
        <PaperCard.Content>{children}</PaperCard.Content>
      </PaperCard>
    );
  }

  return (
    <PaperCard style={cardStyle}>
      <PaperCard.Content>{children}</PaperCard.Content>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  elevated: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
