/**
 * Haptic Feedback Service
 * 
 * Provides haptic feedback for user interactions and achievements.
 * Uses expo-haptics to provide tactile feedback on supported devices.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

class HapticService {
  private enabled: boolean = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async trigger(type: HapticType = 'light'): Promise<void> {
    if (!this.enabled || Platform.OS === 'web') {
      return;
    }

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.log('Haptic feedback not supported on this device');
    }
  }

  async buttonPress(): Promise<void> {
    await this.trigger('light');
  }

  async setLogged(): Promise<void> {
    await this.trigger('medium');
  }

  async exerciseCompleted(): Promise<void> {
    await this.trigger('success');
  }

  async workoutCompleted(): Promise<void> {
    await this.trigger('success');
  }

  async achievementUnlocked(): Promise<void> {
    await this.trigger('success');
  }

  async prAchieved(): Promise<void> {
    await this.trigger('success');
  }

  async levelUp(): Promise<void> {
    await this.trigger('heavy');
  }

  async streakMilestone(): Promise<void> {
    await this.trigger('success');
  }

  async selectionChange(): Promise<void> {
    await Haptics.selectionAsync();
  }
}

export default new HapticService();
