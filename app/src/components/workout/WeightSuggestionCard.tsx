/**
 * Weight Suggestion Card Component
 * 
 * Displays smart weight recommendations with contextual reasoning.
 * Shows performance trends, fatigue warnings, and form check prompts.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, Chip, ProgressBar } from 'react-native-paper';
import useThemeColors from '../../utils/useThemeColors';
import { WeightSuggestion } from '../../services/SmartWeightSuggestionService';

interface WeightSuggestionCardProps {
  suggestion: WeightSuggestion;
  onAccept: () => void;
  onAdjust: (adjustment: number) => void;
  onDismiss?: () => void;
}

export default function WeightSuggestionCard({
  suggestion,
  onAccept,
  onAdjust,
  onDismiss
}: WeightSuggestionCardProps) {
  const colors = useThemeColors();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 2,
      borderColor: getBorderColor(),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary || '#666',
      marginBottom: 4,
    },
    suggestedWeight: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.primary,
    },
    confidenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    confidenceLabel: {
      fontSize: 12,
      color: colors.textSecondary || '#666',
      marginRight: 8,
    },
    confidenceBar: {
      flex: 1,
      height: 4,
      borderRadius: 2,
    },
    trendIndicator: {
      fontSize: 24,
      marginLeft: 8,
    },
    reasoning: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 12,
    },
    adjustmentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    adjustmentBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginRight: 8,
    },
    adjustmentText: {
      fontSize: 13,
      fontWeight: '600',
    },
    formCheckWarning: {
      backgroundColor: colors.warning || '#fff3cd',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    formCheckIcon: {
      fontSize: 20,
      marginRight: 8,
    },
    formCheckText: {
      fontSize: 13,
      color: colors.text,
      flex: 1,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    acceptButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      marginRight: 8,
    },
    acceptButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    adjustButtons: {
      flexDirection: 'row',
    },
    adjustButton: {
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginLeft: 8,
      minWidth: 50,
      alignItems: 'center',
    },
    adjustButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });

  function getBorderColor(): string {
    if (suggestion.showFormCheckPrompt) {
      return colors.warning || '#ffc107';
    }
    
    switch (suggestion.confidence) {
      case 'high':
        return colors.success || '#4caf50';
      case 'medium':
        return colors.primary;
      case 'low':
        return colors.textSecondary || '#999';
      default:
        return colors.border || '#e0e0e0';
    }
  }

  function getConfidenceValue(): number {
    switch (suggestion.confidence) {
      case 'high': return 1.0;
      case 'medium': return 0.6;
      case 'low': return 0.3;
      default: return 0.5;
    }
  }

  function getTrendEmoji(): string {
    switch (suggestion.trendIndicator) {
      case 'increasing': return '📈';
      case 'stable': return '➡️';
      case 'decreasing': return '📉';
      default: return '❓';
    }
  }

  function getAdjustmentColor(): string {
    if (suggestion.adjustmentFromBase > 0) {
      return colors.success || '#4caf50';
    } else if (suggestion.adjustmentFromBase < 0) {
      return colors.error || '#f44336';
    }
    return colors.textSecondary || '#666';
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>💡 Smart Suggestion</Text>
          <Text style={styles.suggestedWeight}>
            {suggestion.suggestedWeight} lbs
          </Text>
          
          {/* Confidence Indicator */}
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>
              {suggestion.confidence} confidence
            </Text>
            <ProgressBar
              progress={getConfidenceValue()}
              color={getBorderColor()}
              style={styles.confidenceBar}
            />
          </View>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.trendIndicator}>{getTrendEmoji()}</Text>
          {onDismiss && (
            <IconButton
              icon="close"
              size={16}
              onPress={onDismiss}
            />
          )}
        </View>
      </View>

      {/* Reasoning */}
      <Text style={styles.reasoning}>{suggestion.reasoning}</Text>

      {/* Adjustment Info */}
      {suggestion.adjustmentFromBase !== 0 && (
        <View style={styles.adjustmentInfo}>
          <View style={[
            styles.adjustmentBadge,
            { backgroundColor: getAdjustmentColor() + '20' }
          ]}>
            <Text style={[
              styles.adjustmentText,
              { color: getAdjustmentColor() }
            ]}>
              {suggestion.adjustmentFromBase > 0 ? '+' : ''}{suggestion.adjustmentFromBase} lbs
            </Text>
          </View>
          <Text style={[styles.confidenceLabel, { flex: 1 }]}>
            from base calculation
          </Text>
        </View>
      )}

      {/* Form Check Warning */}
      {suggestion.showFormCheckPrompt && suggestion.formCheckMessage && (
        <View style={styles.formCheckWarning}>
          <Text style={styles.formCheckIcon}>⚠️</Text>
          <Text style={styles.formCheckText}>
            {suggestion.formCheckMessage}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={onAccept}
        >
          <Text style={styles.acceptButtonText}>
            Use {suggestion.suggestedWeight} lbs
          </Text>
        </TouchableOpacity>

        <View style={styles.adjustButtons}>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => onAdjust(-5)}
          >
            <Text style={styles.adjustButtonText}>-5</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => onAdjust(+5)}
          >
            <Text style={styles.adjustButtonText}>+5</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
