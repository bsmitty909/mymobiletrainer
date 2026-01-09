/**
 * Offline Indicator Component
 * 
 * Displays connection status and pending sync information.
 * Shows at the top of the screen when offline or syncing.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useThemeColors from '../../utils/useThemeColors';
import OfflineSyncService, { OfflineState } from '../../services/OfflineSyncService';

interface OfflineIndicatorProps {
  onPress?: () => void;
}

export default function OfflineIndicator({ onPress }: OfflineIndicatorProps) {
  const colors = useThemeColors();
  const [offlineState, setOfflineState] = useState<OfflineState>(
    OfflineSyncService.getState()
  );
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    const unsubscribe = OfflineSyncService.subscribe((state) => {
      setOfflineState(state);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!offlineState.isOnline || offlineState.pendingSyncItems.length > 0) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [offlineState.isOnline, offlineState.pendingSyncItems.length, slideAnim]);

  const getStatusInfo = () => {
    if (!offlineState.isOnline) {
      return {
        icon: 'cloud-off-outline',
        text: 'Offline Mode',
        subtext: 'Data will sync when connection returns',
        backgroundColor: '#FF6B6B',
        iconColor: '#fff',
      };
    }

    if (offlineState.syncInProgress) {
      return {
        icon: 'sync',
        text: 'Syncing...',
        subtext: `${offlineState.pendingSyncItems.length} items remaining`,
        backgroundColor: '#4ECDC4',
        iconColor: '#fff',
      };
    }

    const stats = OfflineSyncService.getSyncStats();
    if (stats.totalPending > 0 || stats.totalFailed > 0) {
      return {
        icon: 'cloud-upload-outline',
        text: `${stats.totalPending + stats.totalFailed} items pending sync`,
        subtext: stats.totalFailed > 0 ? `${stats.totalFailed} failed - tap to retry` : 'Tap to sync now',
        backgroundColor: '#FFE66D',
        iconColor: '#333',
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();

  if (!statusInfo) {
    return null;
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (!offlineState.isOnline) {
      return;
    } else {
      const stats = OfflineSyncService.getSyncStats();
      if (stats.totalFailed > 0) {
        OfflineSyncService.retryFailedSync();
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    banner: {
      backgroundColor: statusInfo.backgroundColor,
      paddingVertical: 12,
      paddingHorizontal: 16,
      paddingTop: 48,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    iconContainer: {
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    text: {
      color: statusInfo.iconColor,
      fontSize: 14,
      fontWeight: '700',
    },
    subtext: {
      color: statusInfo.iconColor,
      fontSize: 12,
      fontWeight: '500',
      opacity: 0.9,
      marginTop: 2,
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={!offlineState.isOnline}
      >
        <View style={styles.iconContainer}>
          <Icon
            name={statusInfo.icon}
            size={24}
            color={statusInfo.iconColor}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{statusInfo.text}</Text>
          <Text style={styles.subtext}>{statusInfo.subtext}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
