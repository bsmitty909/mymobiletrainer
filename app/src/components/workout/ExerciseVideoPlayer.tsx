/**
 * Exercise Video Player
 *
 * Displays YouTube exercise demonstration videos during active workouts
 * Features:
 * - Embedded YouTube video player
 * - Collapsible to save screen space
 * - Auto-plays on exercise start (optional)
 * - Extracts video ID from YouTube URLs
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Card, IconButton, Text, Chip } from 'react-native-paper';
import YoutubeIframe from 'react-native-youtube-iframe';
import useThemeColors from '../../utils/useThemeColors';

interface ExerciseVideoPlayerProps {
  videoUrl: string | null | undefined;
  exerciseName: string;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
}

const extractYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    
    // Handle youtube.com/watch?v=VIDEO_ID format
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
      return urlObj.searchParams.get('v');
    }
    
    // Handle youtu.be/VIDEO_ID format
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    
    // Handle youtube.com/embed/VIDEO_ID format
    if (urlObj.pathname.includes('/embed/')) {
      return urlObj.pathname.split('/embed/')[1]?.split('?')[0] || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting YouTube video ID:', error);
    return null;
  }
};

export default function ExerciseVideoPlayer({
  videoUrl,
  exerciseName,
  collapsed = false,
  onCollapseToggle,
}: ExerciseVideoPlayerProps) {
  const colors = useThemeColors();
  const [playing, setPlaying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const videoId = videoUrl ? extractYoutubeVideoId(videoUrl) : null;
  
  const handleCollapseToggle = useCallback(() => {
    setIsCollapsed(!isCollapsed);
    if (onCollapseToggle) {
      onCollapseToggle();
    }
  }, [isCollapsed, onCollapseToggle]);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  if (!videoId) {
    return null;
  }

  const { width } = Dimensions.get('window');
  const videoHeight = Platform.OS === 'ios' ? 220 : 200;

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      backgroundColor: colors.headerBackground,
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    videoIcon: {
      backgroundColor: colors.primary + '20',
      borderRadius: 8,
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoIconText: {
      fontSize: 16,
    },
    headerText: {
      flex: 1,
    },
    title: {
      color: colors.headerText,
      fontWeight: '700',
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    subtitle: {
      color: colors.headerText + 'CC',
      fontSize: 12,
      marginTop: 2,
    },
    videoContainer: {
      width: width - 32,
      height: videoHeight,
      backgroundColor: '#000',
    },
    collapsedContent: {
      padding: 16,
      alignItems: 'center',
    },
    collapsedText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
    liveBadge: {
      backgroundColor: colors.error + '20',
      borderColor: colors.error,
      borderWidth: 1,
    },
    liveBadgeText: {
      color: colors.error,
      fontSize: 10,
      fontWeight: '700',
    },
  });

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.videoIcon}>
            <Text style={styles.videoIconText}>📹</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Exercise Form Video</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {exerciseName}
            </Text>
          </View>
          {!isCollapsed && playing && (
            <Chip
              style={styles.liveBadge}
              textStyle={styles.liveBadgeText}
              compact
            >
              PLAYING
            </Chip>
          )}
        </View>
        <IconButton
          icon={isCollapsed ? 'chevron-down' : 'chevron-up'}
          iconColor={colors.headerText}
          size={24}
          onPress={handleCollapseToggle}
        />
      </View>

      {!isCollapsed ? (
        <View style={styles.videoContainer}>
          <YoutubeIframe
            height={videoHeight}
            videoId={videoId}
            play={playing}
            onChangeState={onStateChange}
            webViewProps={{
              androidLayerType: Platform.OS === 'android' ? 'hardware' : undefined,
            }}
          />
        </View>
      ) : (
        <View style={styles.collapsedContent}>
          <Text style={styles.collapsedText}>
            Tap to watch exercise demonstration
          </Text>
        </View>
      )}
    </Card>
  );
}
