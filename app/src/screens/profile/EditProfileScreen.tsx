/**
 * Edit Profile Screen
 * 
 * Allows users to edit their profile information including name and experience level
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, TextInput as PaperInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { createUser } from '../../store/slices/userSlice';
import GameButton from '../../components/common/GameButton';
import HapticService from '../../services/HapticService';
import useThemeColors from '../../utils/useThemeColors';
import { ExperienceLevel } from '../../types';

export default function EditProfileScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const user = useAppSelector((state) => state.user.currentUser);

  const [name, setName] = useState(user?.name || '');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    user?.experienceLevel || 'beginner'
  );

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    dispatch(createUser({
      name: name.trim(),
      experienceLevel,
    }));

    HapticService.trigger('success');
    Alert.alert('Success', 'Profile updated successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD', colors.primary + 'AA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <MaterialCommunityIcons name="account-edit" size={64} color="#FFFFFF" />
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update your account information</Text>
      </LinearGradient>

      {/* Name Section */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <Text style={[styles.label, { color: colors.text }]}>
              YOUR NAME
            </Text>
            <PaperInput
              mode="outlined"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              style={[styles.input, { backgroundColor: colors.background }]}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
              placeholderTextColor={colors.textSecondary}
            />
          </Card.Content>
        </Card>
      </View>

      {/* Experience Level Section */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <Text style={[styles.label, { color: colors.text }]}>
              EXPERIENCE LEVEL
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              This helps customize workout intensity and recommendations
            </Text>

            <View style={styles.optionsContainer}>
              <GameButton
                onPress={() => {
                  setExperienceLevel('beginner');
                  HapticService.selectionChange();
                }}
                variant={experienceLevel === 'beginner' ? 'success' : 'secondary'}
                size="medium"
                icon={experienceLevel === 'beginner' ? 'check-circle' : 'account-outline'}
              >
                Beginner
              </GameButton>

              <GameButton
                onPress={() => {
                  setExperienceLevel('moderate');
                  HapticService.selectionChange();
                }}
                variant={experienceLevel === 'moderate' ? 'success' : 'secondary'}
                size="medium"
                icon={experienceLevel === 'moderate' ? 'check-circle' : 'account-star-outline'}
              >
                Moderate
              </GameButton>
            </View>

            {experienceLevel === 'beginner' && (
              <View style={[styles.infoBox, { backgroundColor: colors.primary + '15' }]}>
                <MaterialCommunityIcons name="information" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Beginner: New to strength training or returning after a break
                </Text>
              </View>
            )}

            {experienceLevel === 'moderate' && (
              <View style={[styles.infoBox, { backgroundColor: colors.primary + '15' }]}>
                <MaterialCommunityIcons name="information" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Moderate: Comfortable with gym equipment and basic exercises
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Current Stats */}
      <View style={styles.section}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <Text style={[styles.label, { color: colors.text }]}>
              CURRENT PROGRESS
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Current Week
                </Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  Week {user?.currentWeek || 0}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Current Day
                </Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  Day {user?.currentDay || 1}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <GameButton
          onPress={handleSave}
          variant="success"
          size="large"
          icon="check"
        >
          Save Changes
        </GameButton>
        <GameButton
          onPress={() => navigation.goBack()}
          variant="secondary"
          size="medium"
          icon="close"
        >
          Cancel
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
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
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
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  bottomSpacing: {
    height: 32,
  },
});
