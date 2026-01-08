/**
 * About Screen
 * 
 * Information about the workout program, methodology, and approach
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GameButton from '../../components/common/GameButton';
import useThemeColors from '../../utils/useThemeColors';

export default function AboutScreen({ navigation }: any) {
  const colors = useThemeColors();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD', colors.primary + 'AA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.title}>My Mobile Trainer</Text>
        <Text style={styles.subtitle}>Intelligent Strength Training Program</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </LinearGradient>

      {/* Program Overview */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="information-outline" size={28} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                About This Program
              </Text>
            </View>
            <Text style={[styles.bodyText, { color: colors.text }]}>
              My Mobile Trainer is an intelligent, adaptive strength training program designed to help you build muscle, 
              increase strength, and achieve your fitness goals through scientifically-backed progressive overload principles.
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Key Features */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="star-outline" size={28} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Key Features
              </Text>
            </View>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <Text style={[styles.featureText, { color: colors.text }]}>
                  <Text style={styles.featureBold}>Progressive Overload:</Text> Systematic weight progression based on your max lifts
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎯</Text>
                <Text style={[styles.featureText, { color: colors.text }]}>
                  <Text style={styles.featureBold}>Adaptive Programming:</Text> Workouts adjust based on your performance
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💪</Text>
                <Text style={[styles.featureText, { color: colors.text }]}>
                  <Text style={styles.featureBold}>Compound Focus:</Text> Emphasis on major lifts (bench, squat, deadlift)
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📈</Text>
                <Text style={[styles.featureText, { color: colors.text }]}>
                  <Text style={styles.featureBold}>Progress Tracking:</Text> Detailed analytics of your strength gains
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎮</Text>
                <Text style={[styles.featureText, { color: colors.text }]}>
                  <Text style={styles.featureBold}>Gamification:</Text> Levels, badges, streaks, and achievements
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Program Structure */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="calendar-outline" size={28} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Program Structure
              </Text>
            </View>
            <Text style={[styles.bodyText, { color: colors.text }]}>
              The program uses a periodized approach with different week types to optimize strength gains:
            </Text>
            <View style={styles.weekTypeList}>
              <View style={styles.weekType}>
                <Text style={[styles.weekTypeName, { color: colors.primary }]}>Max Week</Text>
                <Text style={[styles.weekTypeDesc, { color: colors.textSecondary }]}>
                  Determine your current maximum lifts for accurate programming
                </Text>
              </View>
              <View style={styles.weekType}>
                <Text style={[styles.weekTypeName, { color: colors.primary }]}>Intensity Week</Text>
                <Text style={[styles.weekTypeDesc, { color: colors.textSecondary }]}>
                  Heavy training at 85% of max to build strength
                </Text>
              </View>
              <View style={styles.weekType}>
                <Text style={[styles.weekTypeName, { color: colors.primary }]}>Percentage Week</Text>
                <Text style={[styles.weekTypeDesc, { color: colors.textSecondary }]}>
                  Moderate intensity at 75% for volume and muscle growth
                </Text>
              </View>
              <View style={styles.weekType}>
                <Text style={[styles.weekTypeName, { color: colors.primary }]}>Mixed Week</Text>
                <Text style={[styles.weekTypeDesc, { color: colors.textSecondary }]}>
                  Combined approach at 90% for balanced development
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Methodology */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="school-outline" size={28} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Training Methodology
              </Text>
            </View>
            <Text style={[styles.bodyText, { color: colors.text }]}>
              Our approach is built on proven training principles:
            </Text>
            <View style={styles.principleList}>
              <Text style={[styles.principle, { color: colors.text }]}>
                • <Text style={styles.principleBold}>Progressive Overload:</Text> Gradually increasing weight over time
              </Text>
              <Text style={[styles.principle, { color: colors.text }]}>
                • <Text style={styles.principleBold}>Periodization:</Text> Cycling intensity for optimal recovery
              </Text>
              <Text style={[styles.principle, { color: colors.text }]}>
                • <Text style={styles.principleBold}>Compound Movements:</Text> Focus on multi-joint exercises
              </Text>
              <Text style={[styles.principle, { color: colors.text }]}>
                • <Text style={styles.principleBold}>Volume Management:</Text> Balanced sets and reps for growth
              </Text>
              <Text style={[styles.principle, { color: colors.text }]}>
                • <Text style={styles.principleBold}>Recovery:</Text> Adequate rest between sets and workouts
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Gamification */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="trophy-outline" size={28} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Gamification System
              </Text>
            </View>
            <Text style={[styles.bodyText, { color: colors.text }]}>
              Stay motivated with our comprehensive achievement system:
            </Text>
            <View style={styles.gamificationList}>
              <View style={styles.gamificationItem}>
                <Text style={styles.gamificationIcon}>🎖️</Text>
                <View style={styles.gamificationContent}>
                  <Text style={[styles.gamificationTitle, { color: colors.text }]}>
                    10 Progression Levels
                  </Text>
                  <Text style={[styles.gamificationDesc, { color: colors.textSecondary }]}>
                    Earn XP and level up from Beginner to Legend
                  </Text>
                </View>
              </View>
              <View style={styles.gamificationItem}>
                <Text style={styles.gamificationIcon}>🏆</Text>
                <View style={styles.gamificationContent}>
                  <Text style={[styles.gamificationTitle, { color: colors.text }]}>
                    26 Collectible Badges
                  </Text>
                  <Text style={[styles.gamificationDesc, { color: colors.textSecondary }]}>
                    Unlock achievements for workouts, streaks, volume, and PRs
                  </Text>
                </View>
              </View>
              <View style={styles.gamificationItem}>
                <Text style={styles.gamificationIcon}>🔥</Text>
                <View style={styles.gamificationContent}>
                  <Text style={[styles.gamificationTitle, { color: colors.text }]}>
                    Workout Streaks
                  </Text>
                  <Text style={[styles.gamificationDesc, { color: colors.textSecondary }]}>
                    Track consecutive workout days with calendar visualization
                  </Text>
                </View>
              </View>
              <View style={styles.gamificationItem}>
                <Text style={styles.gamificationIcon}>🎊</Text>
                <View style={styles.gamificationContent}>
                  <Text style={[styles.gamificationTitle, { color: colors.text }]}>
                    Celebrations
                  </Text>
                  <Text style={[styles.gamificationDesc, { color: colors.textSecondary }]}>
                    Confetti animations and haptic feedback for achievements
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Credits */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="heart-outline" size={28} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Built With
              </Text>
            </View>
            <Text style={[styles.bodyText, { color: colors.text }]}>
              This app is built with React Native and Expo, designed to help you achieve your fitness goals 
              with science-based training methodology and engaging gamification features.
            </Text>
            <Text style={[styles.credits, { color: colors.textSecondary }]}>
              Made with ❤️ for strength athletes everywhere
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Back Button */}
      <View style={styles.actions}>
        <GameButton
          onPress={() => navigation.goBack()}
          variant="primary"
          size="medium"
          icon="arrow-left"
        >
          Back to Profile
        </GameButton>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  section: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  featureBold: {
    fontWeight: '700',
  },
  weekTypeList: {
    gap: 16,
    marginTop: 8,
  },
  weekType: {
    paddingVertical: 8,
  },
  weekTypeName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  weekTypeDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  principleList: {
    gap: 12,
    marginTop: 8,
  },
  principle: {
    fontSize: 15,
    lineHeight: 22,
  },
  principleBold: {
    fontWeight: '700',
  },
  gamificationList: {
    gap: 16,
    marginTop: 8,
  },
  gamificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  gamificationIcon: {
    fontSize: 28,
  },
  gamificationContent: {
    flex: 1,
  },
  gamificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  gamificationDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  credits: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  actions: {
    padding: 16,
  },
  bottomSpacing: {
    height: 32,
  },
});
