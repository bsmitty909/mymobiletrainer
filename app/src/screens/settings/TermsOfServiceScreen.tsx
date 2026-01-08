/**
 * Terms of Service Screen
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Appbar } from 'react-native-paper';
import useThemeColors from '../../utils/useThemeColors';

export default function TermsOfServiceScreen({ navigation }: any) {
  const colors = useThemeColors();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.text,
    },
    date: {
      color: colors.textSecondary,
      marginBottom: 24,
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 12,
      color: colors.primary,
    },
    paragraph: {
      lineHeight: 22,
      color: colors.text,
      marginBottom: 12,
    },
    bottomSpacing: {
      height: 40,
    },
  });
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Terms of Service" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Terms of Service
          </Text>
          <Text variant="bodySmall" style={styles.date}>
            Last Updated: January 6, 2026
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            1. Acceptance of Terms
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            By accessing and using My Mobile Trainer app, you accept and agree to be bound by the terms and provision of this agreement.
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            2. Use License
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Permission is granted to use this app for personal fitness training purposes. This is the grant of a license, not a transfer of title.
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            3. Disclaimer
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            The workout programs and weight calculations provided by this app are for informational purposes only. Always consult with a qualified healthcare provider before beginning any exercise program.
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            This app does not provide medical advice. The information is not intended to diagnose, treat, cure, or prevent any disease.
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            4. Limitations
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            In no event shall My Mobile Trainer or its developers be liable for any damages arising out of the use or inability to use this app.
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            5. Accuracy of Materials
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            The materials appearing in this app could include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current.
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            6. User Responsibilities
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            You are responsible for:
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Using proper form and technique{'\n'}
            • Starting with appropriate weights{'\n'}
            • Listening to your body{'\n'}
            • Consulting healthcare providers as needed{'\n'}
            • Maintaining accurate records
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            7. Modifications
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We may revise these terms of service at any time without notice. By using this app you are agreeing to be bound by the current version of these terms.
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            8. Program Attribution
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            This app is based on the "30 Minute Body" program by Lance McCullough. All workout methodologies and formulas are adapted from this proven system.
          </Text>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
}
