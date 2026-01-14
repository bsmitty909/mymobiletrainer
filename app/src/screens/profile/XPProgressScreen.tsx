/**
 * XP Progress Screen
 * 
 * Displays detailed gamification progress including:
 * - Current level and XP progress
 * - Next level requirements
 * - Badge progress
 * - Stats breakdown
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store/store';
import { useThemeColors } from '../../utils/useThemeColors';
import GamificationService, { AVAILABLE_BADGES } from '../../services/GamificationService';
import { Badge, BadgeCategory } from '../../types';

const { width } = Dimensions.get('window');

export default function XPProgressScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const colors = useThemeColors();
  const gamification = useAppSelector((state) => state.gamification);

  const level = gamification.level;
  const xpPercentage = (level.xp / level.xpForNextLevel) * 100;
  const xpRemaining = level.xpForNextLevel - level.xp;

  const nextLevel = GamificationService.calculateLevel(
    level.xp + level.xpForNextLevel
  );

  const getBadgeCategoryInfo = (category: BadgeCategory) => {
    const icons: Record<BadgeCategory, string> = {
      workout_count: 'dumbbell',
      streak: 'fire',
      volume: 'weight-lifter',
      pr: 'trophy',
      consistency: 'calendar-check',
      milestone: 'flag-checkered',
    };

    const labels: Record<BadgeCategory, string> = {
      workout_count: 'Workouts',
      streak: 'Streak',
      volume: 'Volume',
      pr: 'PRs',
      consistency: 'Consistency',
      milestone: 'Milestones',
    };

    const values: Record<BadgeCategory, number> = {
      workout_count: gamification.totalWorkouts,
      streak: gamification.streak.currentStreak,
      volume: gamification.totalVolume,
      pr: gamification.totalPRs,
      consistency: gamification.streak.longestStreak,
      milestone: 0,
    };

    return {
      icon: icons[category],
      label: labels[category],
      value: values[category],
    };
  };

  const getNextBadgeProgress = (category: BadgeCategory) => {
    const info = getBadgeCategoryInfo(category);
    const nextBadge = GamificationService.getNextBadgeInCategory(
      category,
      info.value,
      gamification.unlockedBadges
    );
    
    if (!nextBadge) return null;

    const progress = Math.min(100, (info.value / nextBadge.requirement) * 100);
    const remaining = Math.max(0, nextBadge.requirement - info.value);

    return {
      badge: nextBadge,
      progress,
      remaining,
    };
  };

  const categories: BadgeCategory[] = ['workout_count', 'streak', 'volume', 'pr'];

  const getRarityColor = (rarity: string) => {
    const rarityColors: Record<string, string> = {
      common: colors.text.tertiary,
      rare: colors.primary,
      epic: '#9C27B0',
      legendary: '#FF9500',
    };
    return rarityColors[rarity] || colors.text.secondary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          XP Progress
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Level Card */}
        <LinearGradient
          colors={['#0066FF', '#0052CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelCard}
        >
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelTitle}>{level.title}</Text>
              <Text style={styles.levelNumber}>Level {level.level}</Text>
            </View>
            <View style={styles.levelBadge}>
              <MaterialCommunityIcons name="star" size={32} color="#FFF" />
              <Text style={styles.levelBadgeText}>{level.level}</Text>
            </View>
          </View>

          {/* XP Progress Bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpLabels}>
              <Text style={styles.xpLabel}>{level.xp} XP</Text>
              <Text style={styles.xpLabel}>{level.xpForNextLevel} XP</Text>
            </View>
            <View style={styles.xpBarContainer}>
              <View style={[styles.xpBarFill, { width: `${xpPercentage}%` }]} />
            </View>
            <Text style={styles.xpRemaining}>
              {xpRemaining} XP to Level {level.level + 1}
            </Text>
          </View>

          {/* Next Level Preview */}
          <View style={styles.nextLevelSection}>
            <MaterialCommunityIcons name="arrow-up" size={20} color="#FFF" />
            <Text style={styles.nextLevelText}>
              Next: {nextLevel.title} • Level {level.level + 1}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons
              name="dumbbell"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {gamification.totalWorkouts}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Workouts
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons
              name="fire"
              size={24}
              color="#FF9500"
            />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {gamification.streak.currentStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Day Streak
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons
              name="trophy"
              size={24}
              color="#00D96F"
            />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {gamification.totalPRs}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              PRs Set
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons
              name="medal"
              size={24}
              color="#9C27B0"
            />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {gamification.badges.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Badges
            </Text>
          </View>
        </View>

        {/* Next Badges Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Next Badges
          </Text>
          {categories.map((category) => {
            const progress = getNextBadgeProgress(category);
            if (!progress) return null;

            return (
              <View
                key={category}
                style={[styles.badgeProgressCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.badgeProgressHeader}>
                  <View style={styles.badgeIcon}>
                    <Text style={styles.badgeEmoji}>{progress.badge.icon}</Text>
                  </View>
                  <View style={styles.badgeProgressInfo}>
                    <Text style={[styles.badgeName, { color: colors.text.primary }]}>
                      {progress.badge.name}
                    </Text>
                    <Text
                      style={[
                        styles.badgeDescription,
                        { color: colors.text.secondary },
                      ]}
                    >
                      {progress.badge.description}
                    </Text>
                    <Text
                      style={[
                        styles.badgeRarity,
                        { color: getRarityColor(progress.badge.rarity) },
                      ]}
                    >
                      {progress.badge.rarity.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.badgeProgressBar}>
                  <View style={styles.badgeProgressBarBg}>
                    <View
                      style={[
                        styles.badgeProgressBarFill,
                        {
                          width: `${progress.progress}%`,
                          backgroundColor: getRarityColor(progress.badge.rarity),
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.badgeProgressText, { color: colors.text.secondary }]}
                  >
                    {progress.remaining} more to unlock
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Unlocked Badges Section */}
        {gamification.badges.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Unlocked Badges ({gamification.badges.length})
            </Text>
            <View style={styles.badgesGrid}>
              {gamification.badges.slice(0, 12).map((badge) => (
                <View
                  key={badge.id}
                  style={[styles.unlockedBadge, { backgroundColor: colors.surface }]}
                >
                  <Text style={styles.unlockedBadgeEmoji}>{badge.icon}</Text>
                  <Text
                    style={[
                      styles.unlockedBadgeName,
                      { color: colors.text.secondary },
                    ]}
                    numberOfLines={1}
                  >
                    {badge.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* How to Earn XP Section */}
        <View style={[styles.section, styles.infoSection]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            How to Earn XP
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                  5 XP
                </Text>{' '}
                per set completed
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                  10 XP
                </Text>{' '}
                per exercise completed
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                  2 XP
                </Text>{' '}
                per 100 lbs lifted
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                  3 XP
                </Text>{' '}
                per minute of workout
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#00D96F"
              />
              <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                  50 XP
                </Text>{' '}
                for each personal record!
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  levelCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  levelNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  levelBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeText: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  xpSection: {
    marginBottom: 20,
  },
  xpLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  xpBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 6,
  },
  xpRemaining: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  nextLevelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  nextLevelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  badgeProgressCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  badgeProgressHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeProgressInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  badgeDescription: {
    fontSize: 13,
    marginBottom: 4,
  },
  badgeRarity: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeProgressBar: {
    gap: 8,
  },
  badgeProgressBarBg: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  badgeProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  badgeProgressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  unlockedBadge: {
    width: (width - 64) / 3,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  unlockedBadgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  unlockedBadgeName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 0,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    flex: 1,
  },
});
