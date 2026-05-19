import {Platform} from 'react-native';

export type SoundType =
  | 'correct'
  | 'wrong'
  | 'click'
  | 'cheer'
  | 'encourage'
  | 'gameStart'
  | 'gameComplete'
  | 'starEarned';

/**
 * 音效服务（简化版，使用振动反馈）
 */
class SoundService {
  private isLoaded = false;

  /**
   * 初始化音效
   */
  async initialize(): Promise<void> {
    if (this.isLoaded) {
      return;
    }
    this.isLoaded = true;
  }

  /**
   * 播放音效
   */
  async play(type: SoundType): Promise<void> {
    try {
      // 在 iOS 上使用振动反馈
      if (Platform.OS === 'ios') {
        this.vibrate(type);
      }
    } catch (error) {
      console.error('播放音效失败:', error);
    }
  }

  /**
   * 振动反馈
   */
  private vibrate(type: SoundType): void {
    // React Native 不直接支持振动，这里只是占位
    // 实际可以使用 @react-native-haptics 或 expo-haptics
    console.log(`播放音效: ${type}`);
  }

  /**
   * 停止所有音效
   */
  async stopAll(): Promise<void> {
    // 简化实现
  }

  /**
   * 释放资源
   */
  async release(): Promise<void> {
    this.isLoaded = false;
  }
}

export const soundService = new SoundService();