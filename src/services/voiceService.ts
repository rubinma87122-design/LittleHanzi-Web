import {Platform} from 'react-native';

// Web-only import for @react-native-voice/voice - will be handled with fallback
let Voice: any = null;
if (Platform.OS !== 'web') {
  try {
    Voice = require('@react-native-voice/voice').default;
  } catch (e) {
    console.warn('Voice module not available, using fallback');
  }
}

export interface VoiceResult {
  text: string;
  error?: string;
}

/**
 * 语音识别服务 - Web fallback included
 */
class VoiceService {
  private isListening = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private recognition: any = null;

  constructor() {
    if (Platform.OS === 'web') {
      this.setupWebVoice();
    } else if (Voice) {
      this.setupVoice();
    }
  }

  /**
   * Web Speech API 设置
   */
  private setupWebVoice() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'zh-CN';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && this.onResultCallback) {
          this.onResultCallback(event.results[0][0].transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        const errorMessage = event.error || '识别错误';
        if (this.onErrorCallback) {
          this.onErrorCallback(errorMessage);
        }
      };
    }
  }

  /**
   * 初始化语音识别（Native）
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

    if (Platform.OS === 'web') {
      if (this.recognition) {
        try {
          this.recognition.start();
        } catch (error) {
          console.error('启动语音识别失败:', error);
          throw new Error('浏览器不支持语音识别');
        }
      } else {
        throw new Error('浏览器不支持语音识别');
      }
    } else if (Voice) {
      try {
        await Voice.start('zh-CN');
        this.isListening = true;
      } catch (error) {
        console.error('启动语音识别失败:', error);
        throw error;
      }
    } else {
      throw new Error('语音识别模块不可用');
    }
  }

  /**
   * 停止录音识别
   */
  async stopListening(): Promise<void> {
    if (Platform.OS === 'web' && this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('停止语音识别失败:', error);
      }
    } else if (Voice) {
      try {
        await Voice.stop();
        this.isListening = false;
      } catch (error) {
        console.error('停止语音识别失败:', error);
      }
    }
  }

  /**
   * 取消录音识别
   */
  async cancelListening(): Promise<void> {
    if (Platform.OS === 'web' && this.recognition) {
      try {
        this.recognition.abort();
        this.isListening = false;
      } catch (error) {
        console.error('取消语音识别失败:', error);
      }
    } else if (Voice) {
      try {
        await Voice.cancel();
        this.isListening = false;
      } catch (error) {
        console.error('取消语音识别失败:', error);
      }
    }
  }

  /**
   * 检查是否正在录音
   */
  isAvailable(): boolean {
    if (Platform.OS === 'web') {
      return !!this.recognition;
    }
    return this.isListening;
  }

  /**
   * 清理资源
   */
  destroy() {
    if (Platform.OS === 'web' && this.recognition) {
      this.recognition.abort();
      this.recognition = null;
    } else if (Voice) {
      Voice.destroy().then(Voice.removeAllListeners);
    }
  }
}

export const voiceService = new VoiceService();