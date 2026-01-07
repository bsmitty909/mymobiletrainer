/**
 * Video Player Modal
 *
 * Displays exercise instructional videos in a modal
 * Opens videos in external browser for now (WebView has dependency conflicts)
 */

import React from 'react';
import { View, StyleSheet, Dimensions, Linking, Alert } from 'react-native';
import { Modal, Portal, IconButton, Text, Button } from 'react-native-paper';

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
            iconColor="#FFFFFF"
            size={24}
            onPress={onDismiss}
          />
        </View>

        <View style={styles.videoContainer}>
          {embedUrl ? (
            <WebView
              source={{ uri: embedUrl }}
              style={styles.webview}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
            />
          ) : (
            <View style={styles.placeholder}>
              <Text variant="bodyLarge" style={styles.placeholderText}>
                📹
              </Text>
              <Text variant="bodyMedium" style={styles.placeholderText}>
                Video not available
              </Text>
            </View>
          )}
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

const { width, height } = Dimensions.get('window');
const videoHeight = Platform.OS === 'ios' ? height * 0.4 : height * 0.35;

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#1F2937',
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
    backgroundColor: '#2563EB',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
  videoContainer: {
    height: videoHeight,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  placeholderText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#374151',
  },
  footerText: {
    color: '#D1D5DB',
    textAlign: 'center',
  },
});
