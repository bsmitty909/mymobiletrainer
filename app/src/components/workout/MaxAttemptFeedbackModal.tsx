// @ts-nocheck
/**
 * MaxAttemptFeedbackModal Component
 * 
 * Shows feedback after a max attempt:
 * - Success: Congratulations on new PR with +5 lb unlock
 * - Failure: Redirect to down sets for volume work
 * 
 * Based on Excel formula: IF(reps < 1, "PROCEED TO DOWN SETS", "NEW 1 REP MAX ATTEMPT")
 */

import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Card } from 'react-native-paper';
import GameButton from '../common/GameButton';
import ConfettiAnimation from '../common/ConfettiAnimation';
import { MaxAttemptResult } from '../../types/enhanced';
import useThemeColors from '../../utils/useThemeColors';

interface MaxAttemptFeedbackModalProps {
  visible: boolean;
  result: MaxAttemptResult | null;
  onContinue: () => void;
  onDismiss: () => void;
}

export default function MaxAttemptFeedbackModal({
  visible,
  result,
  onContinue,
  onDismiss
}: MaxAttemptFeedbackModalProps) {
  const colors = useThemeColors();

  if (!result) return null;

  const isSuccess = result.success;
  const title = isSuccess ? '🎉 NEW MAX!' : '💪 VOLUME WORK';
  const subtitle = isSuccess
    ? `+${result.newMax! - (result.nextWeight! - 5)} lbs Progression`
    : 'Let\'s build strength with down sets';

  const dynamicStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      width: '100%',
      maxWidth: 400,
      elevation: 12,
      shadowColor: isSuccess ? colors.success : colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
    cardContent: {
      padding: 32,
      alignItems: 'center',
    },
    icon: {
      fontSize: 80,
      marginBottom: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: '900',
      color: isSuccess ? colors.success : colors.primary,
      marginBottom: 8,
      textAlign: 'center',
      letterSpacing: 1,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 24,
      textAlign: 'center',
    },
    message: {
      fontSize: 15,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 22,
      fontWeight: '500',
    },
    highlight: {
      fontSize: 36,
      fontWeight: '900',
      color: isSuccess ? colors.success : colors.primary,
      marginVertical: 16,
      textAlign: 'center',
    },
    detail: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      fontWeight: '600',
    },
    buttonSection: {
      width: '100%',
      gap: 12,
    },
    successBox: {
      backgroundColor: colors.success + '15',
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: colors.success + '40',
    },
    successText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.success,
      textAlign: 'center',
    },
    downSetBox: {
      backgroundColor: colors.primary + '15',
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: colors.primary + '40',
    },
    downSetText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={dynamicStyles.overlay}>
        {isSuccess && <ConfettiAnimation active={true} duration={3000} pieceCount={50} />}
        
        <Card style={dynamicStyles.card}>
          <View style={dynamicStyles.cardContent}>
            <Text style={dynamicStyles.icon}>
              {isSuccess ? '🎉' : '💪'}
            </Text>

            <Text style={dynamicStyles.title}>{title}</Text>
            <Text style={dynamicStyles.subtitle}>{subtitle}</Text>

            {isSuccess ? (
              <>
                <View style={dynamicStyles.successBox}>
                  <Text style={dynamicStyles.successText}>
                    ✨ Ready for next attempt? ✨
                  </Text>
                </View>

                <Text style={dynamicStyles.message}>
                  Your new max is:
                </Text>
                <Text style={dynamicStyles.highlight}>
                  {result.newMax} lbs
                </Text>
                <Text style={dynamicStyles.detail}>
                  Want to try {result.nextWeight} lbs?{'\n'}
                  Or move to the next exercise
                </Text>

                <View style={dynamicStyles.buttonSection}>
                  <GameButton
                    onPress={onContinue}
                    variant="success"
                    size="large"
                    icon="trophy"
                  >
        // @ts-expect-error - IntensityBadge accepts both number and string

                    TRY {result.nextWeight || 0} LBS (+5)
                  </GameButton>

                  <GameButton
                    onPress={onDismiss}
                    variant="secondary"
                    size="medium"
                  >
                    Continue to Next Exercise
                  </GameButton>
                </View>
              </>
            ) : (
              <>
                <View style={dynamicStyles.downSetBox}>
                  <Text style={dynamicStyles.downSetText}>
                    💪 Time for Volume Work 💪
                  </Text>
                </View>

                <Text style={dynamicStyles.message}>
                  {result.message || 'Max attempt not completed. Building strength through volume!'}
                </Text>

                <Text style={dynamicStyles.detail}>
                  3 down sets at 80% of your max{'\n'}
                  Focus on form and muscle activation
                </Text>

                <View style={dynamicStyles.buttonSection}>
                  <GameButton
                    onPress={onContinue}
                    variant="primary"
                    size="large"
                    icon="weight-lifter"
                  >
                    START DOWN SETS
                  </GameButton>

                  <GameButton
                    onPress={onDismiss}
                    variant="secondary"
                    size="medium"
                  >
                    Skip to Next Exercise
                  </GameButton>
                </View>
              </>
            )}
          </View>
        </Card>
      </View>
    </Modal>
  );
}
