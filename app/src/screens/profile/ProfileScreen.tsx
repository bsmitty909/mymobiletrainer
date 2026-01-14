/**
 * Profile Screen - Modern 2024 Design
 *
 * Clean profile screen with modern styling
 * Maintains gamification stats and achievements
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, RefreshControl, Share } from 'react-native';
import { Text, Card, List, ProgressBar, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { updateProfileImage } from '../../store/slices/userSlice';
import HapticService from '../../services/HapticService';
import { spacing, typography, borderRadius, shadows, colors as designColors } from '../../theme/designTokens';
import useThemeColors from '../../utils/useThemeColors';

export default function ProfileScreen({ navigation }: any) {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = React.useState(false);
  
  const user = useAppSelector((state) => state.user.currentUser);
  const gamification = useAppSelector((state) => state.gamification);
  const progress = useAppSelector((state) => state.progress);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await HapticService.trigger('light');
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      dispatch(updateProfileImage(result.assets[0].uri));
      HapticService.trigger('success');
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out my progress! 💪\n\nLevel: ${gamification.level.level} - ${gamification.level.title}\nWorkouts: ${gamification.totalWorkouts}\nStreak: ${gamification.streak.currentStreak} days 🔥\nPRs: ${gamification.totalPRs}`,
      });
      HapticService.trigger('success');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const levelProgress = gamification.level.xp / gamification.level.xpForNextLevel;
  const recentBadges = gamification.badges.slice(0, 3);
  
  const calculateDaysActive = () => {
    if (!user?.createdAt) return 0;
    const diffTime = Date.now() - user.createdAt;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTotalWorkoutTime = () => {
    const totalMinutes = progress.recentWorkouts.reduce((total, workout) => {
      const duration = ((workout.completedAt || 0) - (workout.startedAt || 0)) / 60000;
      return total + duration;
    }, 0);
    return Math.round(totalMinutes);
  };

  const daysActive = calculateDaysActive();
  const totalWorkoutMinutes = getTotalWorkoutTime();
  const badgeCount = gamification.badges.length;
  const maxLiftsCount = progress.maxLifts.length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradientHeader: {
      paddingBottom: spacing.base,
    },
    headerContent: {
      padding: spacing.xl,
      paddingTop: 60,
      alignItems: 'center',
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: spacing.base,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: '#FFFFFF',
      ...shadows.md,
    },
    avatarImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    cameraButton: {
      position: 'absolute',
      right: -4,
      bottom: -4,
      backgroundColor: '#FFFFFF',
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
      ...shadows.sm,
    },
    name: {
      ...typography.h1,
      fontSize: 24,
      color: '#FFFFFF',
      marginBottom: spacing.xs,
    },
    levelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: spacing.comfortable,
      paddingVertical: spacing.base,
      borderRadius: borderRadius.xl,
      marginBottom: 0,
      gap: spacing.sm,
    },
    levelText: {
      ...typography.body,
      fontSize: 17,
      color: '#FFFFFF',
      fontWeight: '700',
      flex: 1,
    },
    xpContainer: {
      width: '100%',
      paddingHorizontal: spacing.xl,
    },
    xpRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    xpText: {
      ...typography.bodySmall,
      color: 'rgba(255, 255, 255, 0.95)',
    },
    progressBar: {
      height: 6,
      borderRadius: borderRadius.sm,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    actionButtons: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingTop: spacing.base,
      paddingBottom: spacing.close,
      gap: spacing.close,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      alignItems: 'center',
      ...shadows.sm,
    },
    actionButtonText: {
      ...typography.label,
      fontSize: 11,
      color: colors.text,
      marginTop: spacing.xs,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: spacing.sm,
      gap: spacing.sm,
    },
    statBox: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      ...typography.h2,
      fontSize: 24,
      color: colors.primary,
      marginVertical: spacing.xs,
    },
    statLabel: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    card: {
      marginHorizontal: spacing.base,
      marginBottom: spacing.base,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    cardTitle: {
      ...typography.h3,
      fontSize: 16,
      color: colors.text,
      marginBottom: spacing.base,
    },
    achievementsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    badgeContainer: {
      alignItems: 'center',
      flex: 1,
    },
    badgeCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    badgeName: {
      ...typography.bodySmall,
      fontSize: 10,
      color: colors.text,
      textAlign: 'center',
    },
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: spacing.base,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
    },
    streakContent: {
      flex: 1,
      marginLeft: spacing.base,
    },
    streakValue: {
      ...typography.h2,
      fontSize: 22,
      color: colors.text,
    },
    streakLabel: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    menuSection: {
      marginTop: spacing.sm,
    },
    listItem: {
      paddingVertical: spacing.md,
    },
    footer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    version: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    emptyBadge: {
      ...typography.bodySmall,
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD', colors.primary + 'AA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
              ) : (
                <MaterialCommunityIcons name="account" size={64} color="#FFFFFF" />
              )}
            </View>
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <MaterialCommunityIcons name="camera" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text variant="headlineMedium" style={styles.name}>
            {user?.name || 'User'}
          </Text>
          <TouchableOpacity
            style={styles.levelBadge}
            onPress={() => navigation.navigate('XPProgress')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="star" size={20} color="#FFFFFF" />
            <Text style={styles.levelText}>
              Level {gamification.level.level} • {gamification.level.xp} XP
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <MaterialCommunityIcons name="account-edit" size={24} color={colors.primary} />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShareProfile}
        >
          <MaterialCommunityIcons name="share-variant" size={24} color={colors.primary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Profile Summary
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="calendar-check" size={24} color={colors.primary} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {daysActive}
              </Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {totalWorkoutMinutes}
              </Text>
              <Text style={styles.statLabel}>Total Minutes</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="medal" size={24} color={colors.primary} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {badgeCount}
              </Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="podium" size={24} color={colors.primary} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {maxLiftsCount}
              </Text>
              <Text style={styles.statLabel}>Max Lifts Set</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Training Info
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="run" size={24} color={colors.primary} />
              <Text variant="headlineSmall" style={styles.statValue}>
                Week {user?.currentWeek || 1}
              </Text>
              <Text style={styles.statLabel}>Current Week</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="account-star" size={24} color={colors.primary} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {user?.experienceLevel === 'beginner' ? 'Beginner' : 'Moderate'}
              </Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {recentBadges.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Recent Achievements
            </Text>
            <View style={styles.achievementsRow}>
              {recentBadges.map((badge) => (
                <View key={badge.id} style={styles.badgeContainer}>
                  <View style={[styles.badgeCircle, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={{ fontSize: 32 }}>{badge.icon}</Text>
                  </View>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
              {recentBadges.length < 3 && (
                <View style={styles.badgeContainer}>
                  <View style={[styles.badgeCircle, { backgroundColor: colors.surface }]}>
                    <MaterialCommunityIcons name="lock" size={24} color={colors.textSecondary} />
                  </View>
                  <Text style={styles.emptyBadge}>Keep going!</Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Workout Streak
          </Text>
          <View style={styles.streakContainer}>
            <MaterialCommunityIcons
              name="fire"
              size={48}
              color={gamification.streak.currentStreak > 0 ? '#FF6B35' : colors.textSecondary}
            />
            <View style={styles.streakContent}>
              <Text variant="headlineSmall" style={styles.streakValue}>
                {gamification.streak.currentStreak} Days
              </Text>
              <Text style={styles.streakLabel}>
                Longest: {gamification.streak.longestStreak} days
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <View style={styles.menuSection}>
          <List.Item
            title="My Max Lifts"
            description="View and manage your maximum lift records"
            left={(props) => <List.Icon {...props} icon="weight-lifter" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('MaxLifts')}
            style={styles.listItem}
          />
          <Divider />
          <List.Item
            title="Progress Dashboard"
            description="Track your progress over time"
            left={(props) => <List.Icon {...props} icon="chart-line" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Progress', { screen: 'ProgressDashboard' })}
            style={styles.listItem}
          />
          <Divider />
          <List.Item
            title="Settings"
            description="Preferences, notifications, and more"
            left={(props) => <List.Icon {...props} icon="cog" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Settings')}
            style={styles.listItem}
          />
          <Divider />
          <List.Item
            title="Export Data"
            description="Download your workout history"
            left={(props) => <List.Icon {...props} icon="download" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Coming Soon', 'Export feature will be available soon!')}
            style={styles.listItem}
          />
          <Divider />
          <List.Item
            title="About"
            description="Learn about the program"
            left={(props) => <List.Icon {...props} icon="information" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('About')}
            style={styles.listItem}
          />
        </View>
      </Card>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.version}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}
