import * as Speech from 'expo-speech';

export interface TTSConfig {
  rate: number;
  pitch: number;
  volume: number;
}

/**
 * 文字转语音服务（使用 Expo Speech）
 */
class TTSService {
  private config: TTSConfig = {
    rate: 0.5, // 语速较慢，适合儿童
    pitch: 1.0, // 正常音调
    volume: 1.0, // 最大音量
  };

  /**
   * 朗读文字
   * @param text 要朗读的文字
   * @param language 语言代码（zh-CN 为中文）
   */
  async speak(text: string, language: string = 'zh-CN'): Promise<void> {
    try {
      await Speech.speak(text, {
        language,
        rate: this.config.rate,
        pitch: this.config.rate,
        volume: this.config.volume,
      });
    } catch (error) {
      console.error('TTS 朗读失败:', error);
    }
  }

  /**
   * 停止朗读
   */
  async stop(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('停止 TTS 失败:', error);
    }
  }

  /**
   * 暂停朗读
   */
  async pause(): Promise<void> {
    try {
      await Speech.pause();
    } catch (error) {
      console.error('暂停 TTS 失败:', error);
    }
  }

  /**
   * 继续朗读
   */
  async resume(): Promise<void> {
    try {
      await Speech.resume();
    } catch (error) {
      console.error('继续 TTS 失败:', error);
    }
  }

  /**
   * 设置语速
   */
  setRate(rate: number) {
    this.config.rate = Math.max(0.1, Math.min(1.0, rate));
  }

  /**
   * 设置音调
   */
  setPitch(pitch: number) {
    this.config.pitch = Math.max(0.5, Math.min(2.0, pitch));
  }

  /**
   * 设置音量
   */
  setVolume(volume: number) {
    this.config.volume = Math.max(0.0, Math.min(1.0, volume));
  }

  /**
   * 获取当前配置
   */
  getConfig(): TTSConfig {
    return {...this.config};
  }
}

export const ttsService = new TTSService();