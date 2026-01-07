/**
 * Privacy Policy Screen
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Appbar } from 'react-native-paper';

export default function PrivacyPolicyScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Privacy Policy" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Privacy Policy
          </Text>
          <Text variant="bodySmall" style={styles.date}>
            Last Updated: January 6, 2026
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            1. Information We Collect
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            My Mobile Trainer stores all data locally on your device. We collect:
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Profile information (name, age, weight, experience level){'\n'}
            • Workout data (sets, reps, weights){'\n'}
            • Personal records (max lifts){'\n'}
            • App preferences and settings
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            2. How We Use Your Information
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Your information is used solely to:
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Calculate personalized workout weights{'\n'}
            • Track your progress over time{'\n'}
            • Provide progressive overload recommendations{'\n'}
            • Customize your app experience
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            3. Data Storage
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            All data is stored locally on your device using AsyncStorage. We do not transmit your data to external servers. Your workout data never leaves your device.
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            4. Data Security
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Since all data is stored locally, the security of your data depends on your device security. We recommend using device encryption and a strong passcode.
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            5. Your Rights
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Access your data at any time{'\n'}
            • Export your workout history{'\n'}
            • Delete all data from the app{'\n'}
            • Modify your profile information
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            6. Contact Us
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            If you have questions about this Privacy Policy, please contact us at support@mymobiletrainer.com
          </Text>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    color: '#6B7280',
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: '#2563EB',
  },
  paragraph: {
    lineHeight: 22,
    color: '#374151',
    marginBottom: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});
