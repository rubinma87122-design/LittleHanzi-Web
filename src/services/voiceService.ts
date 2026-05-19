import {Platform} from 'react-native';
import Voice from '@react-native-voice/voice';

export interface VoiceResult {
  text: string;
  error?: string;
}

/**
 * 语音识别服务
 */
class VoiceService {
  private isListening = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    this.setupVoice();
  }

  /**
   * 初始化语音识别
   */
  private setupVoice() {
    Voice.onSpeechStart = () => {
      this.isListening = true;
    };

    Voice.onSpeechEnd = () => {
      this.isListening = false;
    };

    Voice.onSpeechResults = (e) => {
      if (e.value && e.value[0] && this.onResultCallback) {
        this.onResultCallback(e.value[0]);
      }
    };

    Voice.onSpeechError = (e) => {
      this.isListening = false;
      const errorMessage = e.error?.message || e.error?.code || '识别错误';
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage);
      }
    };
  }

  /**
   * 开始录音识别
   */
  async startListening(
    onResult: (text: string) => void,
    onError?: (error: string) => void,
  ): Promise<void> {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;

    try {
      await Voice.start('zh-CN');
      this.isListening = true;
    } catch (error) {
      console.error('启动语音识别失败:', error);
      throw error;
    }
  }

  /**
   * 停止录音识别
   */
  async stopListening(): Promise<void> {
    try {
      await Voice.stop();
      this.isListening = false;
    } catch (error) {
      console.error('停止语音识别失败:', error);
    }
  }

  /**
   * 取消录音识别
   */
  async cancelListening(): Promise<void> {
    try {
      await Voice.cancel();
      this.isListening = false;
    } catch (error) {
      console.error('取消语音识别失败:', error);
    }
  }

  /**
   * 检查是否正在录音
   */
  isAvailable(): boolean {
    return this.isListening;
  }

  /**
   * 清理资源
   */
  destroy() {
    Voice.destroy().then(Voice.removeAllListeners);
  }
}

export const voiceService = new VoiceService();