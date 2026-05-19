// 核心类型定义
export type GameType = 'imageMatch' | 'audioMatch' | 'memory' | 'dragDrop';

export type SourceMode = 'oldest' | 'specific';

export type AppMode = 'parent' | 'child';

export type MasteryLevel = 'mastered' | 'learning' | 'difficult' | 'unknown';

/**
 * 汉字实体
 */
export interface Character {
  id: string;
  character: string;
  pinyin: string;
  imageUrl?: string;
  groupId: string;
  createdAt: Date;

  // 学习状态
  isLearned: boolean;
  masteryLevel: MasteryLevel; // 掌握程度

  // 统计数据
  studyCount: number; // 总复习次数
  correctCount: number; // 总正确次数

  // 易错字相关
  totalErrorCount: number; // 累计错误次数
  lastReviewDate?: Date; // 最近复习日期
  lastReviewErrors: number; // 最近一次复习的错误次数
  isDifficult: boolean; // 是否标记为易错字
  difficultDate?: Date; // 标记为易错字的日期

  // 复习历史
  reviewHistory?: ReviewHistoryItem[];
}

/**
 * 复习历史记录项
 */
export interface ReviewHistoryItem {
  date: Date;
  gameType: GameType;
  errorCount: number;
  isCorrect: boolean;
}

export interface Group {
  id: string;
  name: string;
  note?: string;
  createdAt: Date;
  characters?: Character[];
}

export interface StudyRecord {
  id: string;
  characterId: string;
  gameType: GameType;
  isCorrect: boolean;
  errorCount: number; // 本次复习错误次数
  timestamp: Date;
}

export interface AppSettings {
  id: string;
  dailyReviewCount: number;
  sourceMode: SourceMode;
  mascotId: string;
  ocrApiKey?: string;
  parentPassword: string;
  parentGateMethod: 'longPress' | 'password' | 'combined';
  masteryThreshold: number; // 掌握度阈值，默认 80%
}

export interface Mascot {
  id: string;
  name: string;
  description: string;
  normalLottie: string;
  happyLottie: string;
  encouragingLottie: string;
  cheeringLottie: string;
}

export interface GameSession {
  id: string;
  gameType: GameType;
  characters: Character[];
  currentIndex: number;
  correctCount: number;
  startTime: Date;
  endTime?: Date;
}

export interface ImageMatchOption {
  id: string;
  imageUrl: string;
  isCorrect: boolean;
}

export interface MemoryCard {
  id: string;
  type: 'character' | 'image';
  content: string;
  characterId: string;
  isMatched: boolean;
  isFlipped: boolean;
}

/**
 * 每日易错字记录
 */
export interface DailyDifficultChars {
  date: string; // 日期 YYYY-MM-DD
  characters: Array<{
    characterId: string;
    character: string;
    errorCount: number;
  }>;
}

/**
 * 复习字池
 */
export interface ReviewPool {
  date: string;
  difficultChars: Character[]; // 易错字
  regularChars: Character[]; // 常规复习字
  total: number;
}