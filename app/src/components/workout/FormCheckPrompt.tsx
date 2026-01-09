/**
 * Form Check Prompt Component
 * 
 * Displays warnings and prompts when form check is needed based on:
 * - Consecutive failures (3+)
 * - Large weight increases (>15%)
 * 
 * Phase 4.4 - Form & Technique Integration
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { FormCheckTrigger } from '../../services/FormCheckService';
import useThemeColors from '../../utils/useThemeColors';

interface FormCheckPromptProps {
  trigger: FormCheckTrigger;
  onReviewForm: () => void;
  onDismiss: () => void;
}

export default function FormCheckPrompt({
  trigger,
  onReviewForm,
  onDismiss,
}: FormCheckPromptProps) {
  const colors = useThemeColors();

  if (!trigger.shouldPrompt) return null;

  const isCritical = trigger.severity === 'critical';

  const styles = StyleSheet.create({
    card: {
      margin: 16,
      marginTop: 8,
      backgroundColor: isCritical ? '#FEF2F2' : '#FFFBEB',
      borderRadius: 16,
      borderWidth: 2,
      borderColor: isCritical ? '#EF4444' : '#F59E0B',
      elevation: 4,
    },
    content: {
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    icon: {
      fontSize: 28,
      marginRight: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '900',
      color: isCritical ? '#DC2626' : '#D97706',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    message: {
      fontSize: 15,
      fontWeight: '600',
      color: isCritical ? '#991B1B' : '#92400E',
      lineHeight: 22,
      marginBottom: 16,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
    },
  });

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>
            {isCritical ? '⚠️' : '💡'}
          </Text>
          <Text style={styles.title}>
            {isCritical ? 'Form Check Needed' : 'Form Reminder'}
          </Text>
        </View>
        
        <Text style={styles.message}>{trigger.details}</Text>
        
        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={onReviewForm}
            style={styles.button}
            buttonColor={isCritical ? '#DC2626' : '#D97706'}
          >
            Review Form Video
          </Button>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.button}
            textColor={isCritical ? '#DC2626' : '#D97706'}
          >
            Continue Anyway
          </Button>
        </View>
      </View>
    </Card>
  );
}
