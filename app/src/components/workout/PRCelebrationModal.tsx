/**
 * PR Celebration Modal Component
 * 
 * Displays a celebration modal when user achieves a new personal record.
 * Includes confetti animation, PR details, improvement stats, and share functionality.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { useThemeColors } from '../../utils/useThemeColors';
import { ConfettiAnimation } from '../common/ConfettiAnimation';
import PRCelebrationService, { PersonalRecord, ShareableData } from '../../services/PRCelebrationService';
import HapticService from '../../services/HapticService';

interface PRCelebrationModalProps {
  visible: boolean;
  personalRecord: PersonalRecord | null;
  onClose: () => void;
  onShare?: (shareData: ShareableData) => void;
}

export const PRCelebrationModal: React.FC<PRCelebrationModalProps> = ({
  visible,
  personalRecord,
  onClose,
  onShare,
}) => {
  const colors = useThemeColors();
  const [showConfetti, setShowConfetti] = useState(false);
  const [shareData, setShareData] = useState<ShareableData | null>(null);

  useEffect(() => {
    if (visible && personalRecord) {
      setShowConfetti(true);
      HapticService.prAchieved();
      
      const data = PRCelebrationService.generateShareableMessage(personalRecord);
      setShareData(data);

      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [visible, personalRecord]);

  const handleShare = async () => {
    if (!shareData) return;

    try {
      const result = await Share.share({
        message: shareData.message,
        title: `New PR: ${shareData.exerciseName}`,
      });

      if (result.action === Share.sharedAction) {
        HapticService.prAchieved();
        if (onShare) {
          onShare(shareData);
        }
      }
    } catch (error) {
      console.error('Error sharing PR:', error);
    }
  };

  const handleClose = () => {
    setShowConfetti(false);
    onClose();
  };

  if (!personalRecord) return null;

  const motivationalMessage = PRCelebrationService.generateMotivationalMessage(personalRecord);
  const strengthLevel = PRCelebrationService.getStrengthLevel(
    personalRecord.exerciseId,
    personalRecord.weight
  );
  const oneRM = PRCelebrationService.calculateOneRM(personalRecord.weight, personalRecord.reps);
  const nextMilestone = PRCelebrationService.getNextMilestone(
    personalRecord.exerciseId,
    personalRecord.weight
  );
  const milestoneProgress = PRCelebrationService.getMilestoneProgress(
    personalRecord.exerciseId,
    personalRecord.weight
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <ConfettiAnimation
          active={showConfetti}
          duration={4000}
          pieceCount={60}
        />

        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={[styles.title, { color: colors.text }]}>
                NEW PERSONAL RECORD!
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {motivationalMessage}
              </Text>
            </View>

            <View style={[styles.prCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.exerciseName, { color: colors.text }]}>
                {personalRecord.exerciseName}
              </Text>

              <View style={styles.prDetails}>
                <View style={styles.prStat}>
                  <Text style={[styles.prValue, { color: colors.primary }]}>
                    {personalRecord.weight}
                  </Text>
                  <Text style={[styles.prLabel, { color: colors.textSecondary }]}>
                    lbs
                  </Text>
                </View>

                <Text style={[styles.timesSymbol, { color: colors.textSecondary }]}>
                  ×
                </Text>

                <View style={styles.prStat}>
                  <Text style={[styles.prValue, { color: colors.primary }]}>
                    {personalRecord.reps}
                  </Text>
                  <Text style={[styles.prLabel, { color: colors.textSecondary }]}>
                    rep{personalRecord.reps !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.oneRMSection}>
                <Text style={[styles.oneRMLabel, { color: colors.textSecondary }]}>
                  Estimated 4RM
                </Text>
                <Text style={[styles.oneRMValue, { color: colors.text }]}>
                  {Math.round(oneRM)} lbs
                </Text>
              </View>
            </View>

            {personalRecord.improvement.weightGain > 0 && (
              <View style={[styles.improvementCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  📈 Improvement
                </Text>
                <View style={styles.improvementStats}>
                  <View style={styles.improvementStat}>
                    <Text style={[styles.improvementValue, { color: '#00b894' }]}>
                      +{Math.round(personalRecord.improvement.weightGain)} lbs
                    </Text>
                    <Text style={[styles.improvementLabel, { color: colors.textSecondary }]}>
                      Weight Gain
                    </Text>
                  </View>
                  <View style={styles.improvementStat}>
                    <Text style={[styles.improvementValue, { color: '#00b894' }]}>
                      +{personalRecord.improvement.percentageGain.toFixed(1)}%
                    </Text>
                    <Text style={[styles.improvementLabel, { color: colors.textSecondary }]}>
                      Improvement
                    </Text>
                  </View>
                </View>

                {personalRecord.previousRecord && (
                  <View style={styles.previousRecord}>
                    <Text style={[styles.previousLabel, { color: colors.textSecondary }]}>
                      Previous Best
                    </Text>
                    <Text style={[styles.previousValue, { color: colors.text }]}>
                      {personalRecord.previousRecord.weight} lbs × {personalRecord.previousRecord.reps} rep{personalRecord.previousRecord.reps !== 1 ? 's' : ''}
                    </Text>
                    <Text style={[styles.previousDate, { color: colors.textSecondary }]}>
                      {new Date(personalRecord.previousRecord.date).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Strength Level
                </Text>
                <View style={styles.strengthBadge}>
                  <Text style={[styles.strengthLevel, { color: colors.primary }]}>
                    {strengthLevel}
                  </Text>
                </View>
              </View>

              {personalRecord.userPercentile && (
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Percentile
                  </Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    Top {(100 - personalRecord.userPercentile).toFixed(0)}%
                  </Text>
                </View>
              )}

              {nextMilestone && (
                <>
                  <View style={styles.milestoneSection}>
                    <Text style={[styles.milestoneLabel, { color: colors.textSecondary }]}>
                      Next Milestone: {nextMilestone.level}
                    </Text>
                    <Text style={[styles.milestoneTarget, { color: colors.text }]}>
                      {nextMilestone.weight} lbs ({nextMilestone.weight - personalRecord.weight} lbs to go)
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${milestoneProgress}%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                </>
              )}
            </View>

            <View style={styles.actions}>
              {PRCelebrationService.shouldPromptShare(personalRecord) && (
                <TouchableOpacity
                  style={[styles.shareButton, { backgroundColor: colors.primary }]}
                  onPress={handleShare}
                >
                  <Text style={styles.shareButtonText}>
                    📱 Share Your PR
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.card }]}
                onPress={handleClose}
              >
                <Text style={[styles.closeButtonText, { color: colors.text }]}>
                  Continue Workout
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  prCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  prDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  prStat: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  prValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  prLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  timesSymbol: {
    fontSize: 32,
    fontWeight: '300',
  },
  oneRMSection: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    width: '100%',
  },
  oneRMLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  oneRMValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  improvementCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  improvementStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  improvementStat: {
    alignItems: 'center',
  },
  improvementValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  improvementLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  previousRecord: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  previousLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  previousValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  previousDate: {
    fontSize: 12,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  strengthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  strengthLevel: {
    fontSize: 14,
    fontWeight: '700',
  },
  milestoneSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  milestoneLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  milestoneTarget: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actions: {
    gap: 12,
  },
  shareButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PRCelebrationModal;
