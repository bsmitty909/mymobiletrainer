/**
 * Offline Sync Service
 * 
 * Handles offline data caching and synchronization when connection returns.
 * Provides a seamless offline experience for workout tracking.
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { WorkoutSession, MaxLift, PersonalRecord } from '../types';
import StorageService from './StorageService';

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'failed';
export type SyncDataType = 'workout' | 'maxLift' | 'personalRecord' | 'bodyWeight';

export interface PendingSyncItem {
  id: string;
  type: SyncDataType;
  data: any;
  timestamp: number;
  retryCount: number;
  status: SyncStatus;
}

export interface OfflineState {
  isOnline: boolean;
  pendingSyncItems: PendingSyncItem[];
  lastSyncTime: number;
  syncInProgress: boolean;
}

export class OfflineSyncService {
  private static readonly STORAGE_KEY_PENDING = '@mmt_pending_sync';
  private static readonly STORAGE_KEY_CACHED_DATA = '@mmt_cached_data';
  private static readonly MAX_RETRY_COUNT = 3;
  private static listeners: Array<(state: OfflineState) => void> = [];
  private static offlineState: OfflineState = {
    isOnline: true,
    pendingSyncItems: [],
    lastSyncTime: Date.now(),
    syncInProgress: false,
  };

  /**
   * Initialize the offline sync service
   */
  static async initialize(): Promise<void> {
    try {
      await this.loadPendingSyncItems();

      NetInfo.addEventListener((state: NetInfoState) => {
        this.handleConnectionChange(state);
      });

      const currentState = await NetInfo.fetch();
      this.offlineState.isOnline = currentState.isConnected ?? true;

      if (this.offlineState.isOnline) {
        this.syncPendingItems();
      }
    } catch (error) {
      console.error('Error initializing offline sync:', error);
    }
  }

  /**
   * Subscribe to offline state changes
   */
  static subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.push(listener);
    listener(this.offlineState);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get current offline state
   */
  static getState(): OfflineState {
    return { ...this.offlineState };
  }

  /**
   * Check if device is online
   */
  static async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Error checking online status:', error);
      return false;
    }
  }

  /**
   * Handle connection state changes
   */
  private static async handleConnectionChange(state: NetInfoState): Promise<void> {
    const wasOffline = !this.offlineState.isOnline;
    this.offlineState.isOnline = state.isConnected ?? false;

    if (this.offlineState.isOnline && wasOffline) {
      console.log('Connection restored - starting sync');
      await this.syncPendingItems();
    }

    this.notifyListeners();
  }

  /**
   * Save data for offline use or queue for sync
   */
  static async queueForSync(
    type: SyncDataType,
    data: any
  ): Promise<void> {
    try {
      const item: PendingSyncItem = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending',
      };

      this.offlineState.pendingSyncItems.push(item);
      await this.savePendingSyncItems();

      await this.cacheData(type, data);

      if (this.offlineState.isOnline) {
        this.syncPendingItems();
      }

      this.notifyListeners();
    } catch (error) {
      console.error('Error queuing data for sync:', error);
      throw error;
    }
  }

  /**
   * Sync all pending items
   */
  private static async syncPendingItems(): Promise<void> {
    if (this.offlineState.syncInProgress) {
      return;
    }

    if (this.offlineState.pendingSyncItems.length === 0) {
      return;
    }

    this.offlineState.syncInProgress = true;
    this.notifyListeners();

    try {
      const itemsToSync = this.offlineState.pendingSyncItems.filter(
        (item) => item.status === 'pending' || item.status === 'failed'
      );

      for (const item of itemsToSync) {
        if (item.retryCount >= this.MAX_RETRY_COUNT) {
          console.error(`Max retries reached for item ${item.id}`);
          item.status = 'failed';
          continue;
        }

        item.status = 'syncing';
        this.notifyListeners();

        const success = await this.syncItem(item);

        if (success) {
          item.status = 'synced';
          this.offlineState.pendingSyncItems = this.offlineState.pendingSyncItems.filter(
            (i) => i.id !== item.id
          );
        } else {
          item.status = 'failed';
          item.retryCount += 1;
        }
      }

      this.offlineState.lastSyncTime = Date.now();
      await this.savePendingSyncItems();
    } catch (error) {
      console.error('Error syncing pending items:', error);
    } finally {
      this.offlineState.syncInProgress = false;
      this.notifyListeners();
    }
  }

  /**
   * Sync a single item
   */
  private static async syncItem(item: PendingSyncItem): Promise<boolean> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log(`Syncing ${item.type} with ID ${item.id}`);

      return true;
    } catch (error) {
      console.error(`Error syncing item ${item.id}:`, error);
      return false;
    }
  }

  /**
   * Cache data for offline access
   */
  private static async cacheData(type: SyncDataType, data: any): Promise<void> {
    try {
      const cached = await this.getCachedData();
      
      if (!cached[type]) {
        cached[type] = [];
      }

      if (Array.isArray(cached[type])) {
        cached[type].push({
          ...data,
          cachedAt: Date.now(),
        });
      }

      await StorageService.saveItem(this.STORAGE_KEY_CACHED_DATA, cached);
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  /**
   * Get cached data
   */
  static async getCachedData(): Promise<Record<SyncDataType, any[]>> {
    try {
      const cached = await StorageService.getItem<Record<SyncDataType, any[]>>(
        this.STORAGE_KEY_CACHED_DATA
      );
      return cached || {
        workout: [],
        maxLift: [],
        personalRecord: [],
        bodyWeight: [],
      };
    } catch (error) {
      console.error('Error getting cached data:', error);
      return {
        workout: [],
        maxLift: [],
        personalRecord: [],
        bodyWeight: [],
      };
    }
  }

  /**
   * Clear cached data
   */
  static async clearCache(): Promise<void> {
    try {
      await StorageService.removeItem(this.STORAGE_KEY_CACHED_DATA);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Load pending sync items from storage
   */
  private static async loadPendingSyncItems(): Promise<void> {
    try {
      const items = await StorageService.getItem<PendingSyncItem[]>(
        this.STORAGE_KEY_PENDING
      );
      this.offlineState.pendingSyncItems = items || [];
    } catch (error) {
      console.error('Error loading pending sync items:', error);
    }
  }

  /**
   * Save pending sync items to storage
   */
  private static async savePendingSyncItems(): Promise<void> {
    try {
      await StorageService.saveItem(
        this.STORAGE_KEY_PENDING,
        this.offlineState.pendingSyncItems
      );
    } catch (error) {
      console.error('Error saving pending sync items:', error);
    }
  }

  /**
   * Retry failed sync items
   */
  static async retryFailedSync(): Promise<void> {
    this.offlineState.pendingSyncItems.forEach((item) => {
      if (item.status === 'failed') {
        item.status = 'pending';
        item.retryCount = 0;
      }
    });

    await this.savePendingSyncItems();
    
    if (this.offlineState.isOnline) {
      this.syncPendingItems();
    }
  }

  /**
   * Clear all pending sync items
   */
  static async clearPendingSync(): Promise<void> {
    try {
      this.offlineState.pendingSyncItems = [];
      await StorageService.removeItem(this.STORAGE_KEY_PENDING);
      this.notifyListeners();
    } catch (error) {
      console.error('Error clearing pending sync:', error);
    }
  }

  /**
   * Get sync statistics
   */
  static getSyncStats(): {
    totalPending: number;
    totalSyncing: number;
    totalFailed: number;
    oldestPendingTime: number | null;
  } {
    const pending = this.offlineState.pendingSyncItems.filter(
      (item) => item.status === 'pending'
    );
    const syncing = this.offlineState.pendingSyncItems.filter(
      (item) => item.status === 'syncing'
    );
    const failed = this.offlineState.pendingSyncItems.filter(
      (item) => item.status === 'failed'
    );

    const oldestPending = pending.length > 0
      ? Math.min(...pending.map((item) => item.timestamp))
      : null;

    return {
      totalPending: pending.length,
      totalSyncing: syncing.length,
      totalFailed: failed.length,
      oldestPendingTime: oldestPending,
    };
  }

  /**
   * Notify all listeners of state change
   */
  private static notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.offlineState);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }
}

export default OfflineSyncService;
