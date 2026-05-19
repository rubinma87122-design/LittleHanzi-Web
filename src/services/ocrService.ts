import axios from 'axios';

export interface OCRResult {
  words: string[];
  confidence: number;
  error?: string;
}

export interface OCRConfig {
  apiKey: string;
  secretKey?: string;
}

/**
 * 百度 OCR 服务
 */
class OCRService {
  private config: OCRConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * 初始化配置
   */
  setConfig(config: OCRConfig) {
    this.config = config;
    this.accessToken = null;
  }

  /**
   * 获取访问令牌
   */
  private async getAccessToken(): Promise<string | null> {
    if (!this.config) {
      return null;
    }

    // 检查 token 是否过期
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        'https://aip.baidubce.com/oauth/2.0/token',
        null,
        {
          params: {
            grant_type: 'client_credentials',
            client_id: this.config.apiKey,
            client_secret: this.config.secretKey,
          },
        },
      );

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        // 过期时间减去 5 分钟提前刷新
        this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
        return this.accessToken;
      }
    } catch (error) {
      console.error('获取百度 OCR Token 失败:', error);
    }

    return null;
  }

  /**
   * 识别图片中的文字
   * @param base64Image Base64 编码的图片（不含 data:image/jpeg;base64, 前缀）
   */
  async recognize(base64Image: string): Promise<OCRResult> {
    const token = await this.getAccessToken();
    if (!token) {
      return {
        words: [],
        confidence: 0,
        error: '无法获取访问令牌，请检查 API 配置',
      };
    }

    try {
      const response = await axios.post(
        `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${token}`,
        null,
        {
          params: {
            image: base64Image,
            detect_direction: true,
            language_type: 'CHN_ENG',
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (response.data.words_result) {
        // 提取所有识别的文字
        const allText = (response.data.words_result as Array<{words: string}>)
          .map((item) => item.words)
          .join('');

        // 按字符分割
        const characters = Array.from(new Set(allText.split(''))).filter(
          (char): char is string => /[\u4e00-\u9fa5]/.test(char),
        );

        return {
          words: characters,
          confidence: 0.9, // 百度 OCR 通常准确率较高
        };
      }

      return {
        words: [],
        confidence: 0,
        error: '未识别到文字',
      };
    } catch (error) {
      const err = error as any;
      console.error('OCR 识别失败:', error);
      return {
        words: [],
        confidence: 0,
        error: err?.message || 'OCR 识别失败',
      };
    }
  }

  /**
   * 模拟 OCR 识别（用于开发测试）
   */
  async mockRecognize(): Promise<OCRResult> {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 返回模拟结果
    return {
      words: ['我', '爱', '你', '中', '国', '家', '人', '好', '大', '小'],
      confidence: 0.95,
    };
  }

  /**
   * 清除配置
   */
  clearConfig() {
    this.config = null;
    this.accessToken = null;
    this.tokenExpiry = 0;
  }
}

export const ocrService = new OCRService();