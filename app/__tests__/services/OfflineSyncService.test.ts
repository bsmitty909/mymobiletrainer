/**
 * OfflineSyncService Tests
 * 
 * Tests for offline data caching and synchronization.
 */

import OfflineSyncService, { PendingSyncItem, SyncDataType } from '../../src/services/OfflineSyncService';
import StorageService from '../../src/services/StorageService';

jest.mock('../../src/services/StorageService');

// Mock NetInfo module
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

const NetInfo = require('@react-native-community/netinfo');

describe('OfflineSyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (StorageService.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('initialization', () => {
    it('should initialize and load pending sync items', async () => {
      const mockPendingItems: PendingSyncItem[] = [
        {
          id: 'sync-1',
          type: 'workout',
          data: { sessionId: '123' },
          timestamp: Date.now(),
          retryCount: 0,
          status: 'pending',
        },
      ];

      (StorageService.getItem as jest.Mock).mockResolvedValue(mockPendingItems);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

      await OfflineSyncService.initialize();

      const state = OfflineSyncService.getState();
      expect(state.pendingSyncItems.length).toBe(1);
      expect(state.isOnline).toBe(true);
    });

    it('should handle initialization with no pending items', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue(null);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

      await OfflineSyncService.initialize();

      const state = OfflineSyncService.getState();
      expect(state.pendingSyncItems.length).toBe(0);
    });
  });

  describe('isOnline', () => {
    it('should return true when connected', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

      const result = await OfflineSyncService.isOnline();

      expect(result).toBe(true);
    });

    it('should return false when disconnected', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const result = await OfflineSyncService.isOnline();

      expect(result).toBe(false);
    });

    it('should handle null connection state', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: null });

      const result = await OfflineSyncService.isOnline();

      expect(result).toBe(false);
    });
  });

  describe('queueForSync', () => {
    it('should queue data for sync when offline', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue([]);
      await OfflineSyncService.initialize();

      const workoutData = {
        sessionId: '123',
        weight: 225,
        reps: 8,
      };

      await OfflineSyncService.queueForSync('workout', workoutData);

      const state = OfflineSyncService.getState();
      expect(state.pendingSyncItems.length).toBe(1);
      expect(state.pendingSyncItems[0].type).toBe('workout');
      expect(state.pendingSyncItems[0].data).toEqual(workoutData);
      expect(state.pendingSyncItems[0].status).toBe('pending');
      expect(StorageService.saveItem).toHaveBeenCalled();
    });

    it('should cache data locally', async () => {
      // First mock returns pending items, second returns cached data
      (StorageService.getItem as jest.Mock)
        .mockResolvedValueOnce([])  // For pending sync items
        .mockResolvedValueOnce({ workout: [] });  // For cached data
      
      await OfflineSyncService.initialize();

      const workoutData = { sessionId: '123' };

      await OfflineSyncService.queueForSync('workout', workoutData);

      expect(StorageService.saveItem).toHaveBeenCalledWith(
        '@mmt_cached_data',
        expect.objectContaining({
          workout: expect.arrayContaining([
            expect.objectContaining({ sessionId: '123' }),
          ]),
        })
      );
    });

    it('should handle multiple data types', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue([]);
      await OfflineSyncService.initialize();

      await OfflineSyncService.queueForSync('workout', { id: '1' });
      await OfflineSyncService.queueForSync('maxLift', { id: '2' });
      await OfflineSyncService.queueForSync('personalRecord', { id: '3' });

      const state = OfflineSyncService.getState();
      expect(state.pendingSyncItems.length).toBe(3);
      expect(state.pendingSyncItems.map(i => i.type)).toEqual([
        'workout',
        'maxLift',
        'personalRecord',
      ]);
    });
  });

  describe('getCachedData', () => {
    it('should retrieve cached data', async () => {
      const mockCachedData = {
        workout: [{ id: '1' }],
        maxLift: [{ id: '2' }],
        personalRecord: [],
        bodyWeight: [],
      };

      (StorageService.getItem as jest.Mock).mockResolvedValue(mockCachedData);

      const result = await OfflineSyncService.getCachedData();

      expect(result).toEqual(mockCachedData);
    });

    it('should return empty structure when no cached data', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue(null);

      const result = await OfflineSyncService.getCachedData();

      expect(result).toEqual({
        workout: [],
        maxLift: [],
        personalRecord: [],
        bodyWeight: [],
      });
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      await OfflineSyncService.clearCache();

      expect(StorageService.removeItem).toHaveBeenCalledWith('@mmt_cached_data');
    });
  });

  describe('retryFailedSync', () => {
    it('should reset failed items to pending', async () => {
      const mockItems: PendingSyncItem[] = [
        {
          id: 'sync-1',
          type: 'workout',
          data: {},
          timestamp: Date.now(),
          retryCount: 2,
          status: 'failed',
        },
        {
          id: 'sync-2',
          type: 'maxLift',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          status: 'pending',
        },
      ];

      (StorageService.getItem as jest.Mock).mockResolvedValue(mockItems);
      await OfflineSyncService.initialize();

      await OfflineSyncService.retryFailedSync();

      const state = OfflineSyncService.getState();
      const failedItem = state.pendingSyncItems.find(i => i.id === 'sync-1');
      expect(failedItem?.status).toBe('pending');
      expect(failedItem?.retryCount).toBe(0);
    });
  });

  describe('clearPendingSync', () => {
    it('should clear all pending sync items', async () => {
      const mockItems: PendingSyncItem[] = [
        {
          id: 'sync-1',
          type: 'workout',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          status: 'pending',
        },
      ];

      (StorageService.getItem as jest.Mock).mockResolvedValue(mockItems);
      await OfflineSyncService.initialize();

      await OfflineSyncService.clearPendingSync();

      const state = OfflineSyncService.getState();
      expect(state.pendingSyncItems.length).toBe(0);
      expect(StorageService.removeItem).toHaveBeenCalledWith('@mmt_pending_sync');
    });
  });

  describe('getSyncStats', () => {
    it('should calculate sync statistics', async () => {
      const mockItems: PendingSyncItem[] = [
        {
          id: 'sync-1',
          type: 'workout',
          data: {},
          timestamp: Date.now() - 60000,
          retryCount: 0,
          status: 'pending',
        },
        {
          id: 'sync-2',
          type: 'maxLift',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          status: 'syncing',
        },
        {
          id: 'sync-3',
          type: 'workout',
          data: {},
          timestamp: Date.now(),
          retryCount: 3,
          status: 'failed',
        },
      ];

      (StorageService.getItem as jest.Mock).mockResolvedValue(mockItems);
      await OfflineSyncService.initialize();

      const stats = OfflineSyncService.getSyncStats();

      expect(stats.totalPending).toBe(1);
      expect(stats.totalSyncing).toBe(1);
      expect(stats.totalFailed).toBe(1);
      expect(stats.oldestPendingTime).toBeLessThan(Date.now());
    });

    it('should handle no pending items', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue([]);
      await OfflineSyncService.initialize();

      const stats = OfflineSyncService.getSyncStats();

      expect(stats.totalPending).toBe(0);
      expect(stats.totalSyncing).toBe(0);
      expect(stats.totalFailed).toBe(0);
      expect(stats.oldestPendingTime).toBeNull();
    });
  });

  describe('subscribe', () => {
    it('should notify subscribers of state changes', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue([]);
      await OfflineSyncService.initialize();

      const mockListener = jest.fn();
      const unsubscribe = OfflineSyncService.subscribe(mockListener);

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          isOnline: expect.any(Boolean),
          pendingSyncItems: expect.any(Array),
        })
      );

      unsubscribe();
    });

    it('should allow unsubscribe', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue([]);
      await OfflineSyncService.initialize();

      const mockListener = jest.fn();
      const unsubscribe = OfflineSyncService.subscribe(mockListener);

      mockListener.mockClear();
      unsubscribe();

      await OfflineSyncService.queueForSync('workout', {});

      // Listener should not be called after unsubscribe
      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('getState', () => {
    it('should return current offline state', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue([]);
      await OfflineSyncService.initialize();

      const state = OfflineSyncService.getState();

      expect(state).toHaveProperty('isOnline');
      expect(state).toHaveProperty('pendingSyncItems');
      expect(state).toHaveProperty('lastSyncTime');
      expect(state).toHaveProperty('syncInProgress');
    });
  });

  describe('error handling', () => {
    it('should handle storage errors gracefully', async () => {
      (StorageService.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(OfflineSyncService.initialize()).resolves.not.toThrow();
    });

    it('should handle network info errors gracefully', async () => {
      (NetInfo.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const result = await OfflineSyncService.isOnline();

      expect(result).toBe(false);
    });
  });
});
