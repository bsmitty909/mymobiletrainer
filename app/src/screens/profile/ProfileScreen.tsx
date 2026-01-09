/**
 * Profile Screen
 *
 * User profile with gamification stats, achievements, and settings.
 * Enhanced with better visuals and comprehensive user statistics.
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
      paddingBottom: 32,
    },
    headerContent: {
      padding: 24,
      paddingTop: 60,
      alignItems: 'center',
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: '#FFFFFF',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    avatarImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    cameraButton: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      backgroundColor: '#FFFFFF',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.primary,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    name: {
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    levelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 16,
    },
    levelText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 8,
    },
    xpContainer: {
      width: '100%',
      paddingHorizontal: 24,
    },
    xpRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    xpText: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 12,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    actionButtons: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 8,
      gap: 12,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    actionButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 8,
      gap: 8,
    },
    statBox: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      fontWeight: 'bold',
      color: colors.primary,
      marginVertical: 4,
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    card: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cardTitle: {
      color: colors.text,
      fontWeight: '700',
      marginBottom: 16,
    },
    achievementsRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    badgeContainer: {
      alignItems: 'center',
      flex: 1,
    },
    badgeCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    badgeName: {
      fontSize: 10,
      color: colors.text,
      textAlign: 'center',
    },
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginTop: 8,
    },
    streakContent: {
      flex: 1,
      marginLeft: 16,
    },
    streakValue: {
      fontWeight: 'bold',
      color: colors.text,
    },
    streakLabel: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    menuSection: {
      marginTop: 8,
    },
    listItem: {
      paddingVertical: 12,
    },
    footer: {
      padding: 24,
      alignItems: 'center',
    },
    version: {
      color: colors.textSecondary,
    },
    emptyBadge: {
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
          <View style={styles.levelBadge}>
            <MaterialCommunityIcons name="trophy" size={20} color="#FFFFFF" />
            <Text style={styles.levelText}>
              Level {gamification.level.level} • {gamification.level.title}
            </Text>
          </View>
          <View style={styles.xpContainer}>
            <View style={styles.xpRow}>
              <Text style={styles.xpText}>
                {gamification.level.xp} XP
              </Text>
              <Text style={styles.xpText}>
                {gamification.level.xpForNextLevel} XP
              </Text>
            </View>
            <ProgressBar
              progress={levelProgress}
              color="#FFFFFF"
              style={styles.progressBar}
            />
          </View>
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
