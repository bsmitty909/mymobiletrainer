/**
 * Video Player Modal
 *
 * Displays exercise instructional videos in a modal
 * Opens videos in external browser for now (WebView has dependency conflicts)
 */

import React from 'react';
import { View, StyleSheet, Dimensions, Linking, Alert, Platform } from 'react-native';
import { Modal, Portal, IconButton, Text, Button } from 'react-native-paper';
import useThemeColors from '../../utils/useThemeColors';

interface VideoPlayerModalProps {
  visible: boolean;
  videoUrl: string | null;
  exerciseName?: string;
  onDismiss: () => void;
}

export default function VideoPlayerModal({
  visible,
  videoUrl,
  exerciseName,
  onDismiss,
}: VideoPlayerModalProps) {
  const colors = useThemeColors();
  
  const openVideoInBrowser = async () => {
    if (!videoUrl) return;

    try {
      const supported = await Linking.canOpenURL(videoUrl);
      if (supported) {
        await Linking.openURL(videoUrl);
        onDismiss();
      } else {
        Alert.alert('Error', 'Cannot open video URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open video');
      console.error('Error opening video:', error);
    }
  };

  const { width, height } = Dimensions.get('window');
  const videoHeight = Platform.OS === 'ios' ? height * 0.4 : height * 0.35;

  const styles = StyleSheet.create({
    modal: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginVertical: 60,
      borderRadius: 12,
      overflow: 'hidden',
      maxHeight: height * 0.8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.headerBackground,
    },
    title: {
      color: colors.headerText,
      fontWeight: 'bold',
      flex: 1,
    },
    videoContainer: {
      height: videoHeight,
      backgroundColor: '#000000',
    },
    placeholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    placeholderText: {
      color: colors.textSecondary,
      textAlign: 'center',
      marginVertical: 8,
    },
    content: {
      padding: 24,
    },
    description: {
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    openButton: {
      marginTop: 8,
    },
    footer: {
      padding: 16,
      backgroundColor: colors.surface,
    },
    footerText: {
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            {exerciseName || 'Exercise Video'}
          </Text>
          <IconButton
            icon="close"
            iconColor={colors.headerText}
            size={24}
            onPress={onDismiss}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.placeholder}>
            <Text variant="bodyLarge" style={styles.placeholderText}>
              📹
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Exercise demonstration video
            </Text>
            <Button
              mode="contained"
              onPress={openVideoInBrowser}
              style={styles.openButton}
              disabled={!videoUrl}
            >
              Open Video
            </Button>
          </View>
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            💡 Watch the video to ensure proper form and technique
          </Text>
        </View>
      </Modal>
    </Portal>
  );
}
