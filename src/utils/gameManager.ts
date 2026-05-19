import {GameType} from '../types';

export type GameSessionState = {
  currentGameType: GameType;
  completedGames: Set<GameType>;
  totalGames: number;
};

const GAMES: GameType[] = ['imageMatch', 'audioMatch', 'memory', 'dragDrop'];

/**
 * 游戏管理器 - 负责游戏间切换逻辑
 */
class GameManager {
  private sessionState: GameSessionState | null = null;

  /**
   * 开始新的游戏会话
   */
  startSession(totalGames: number = 4): GameType {
    this.sessionState = {
      currentGameType: GAMES[0],
      completedGames: new Set(),
      totalGames,
    };
    return this.sessionState.currentGameType;
  }

  /**
   * 当前游戏完成
   */
  completeCurrentGame(): GameType | null {
    if (!this.sessionState) {
      return null;
    }

    const {currentGameType, completedGames, totalGames} = this.sessionState;

    // 标记当前游戏完成
    completedGames.add(currentGameType);

    // 检查是否所有游戏都完成
    if (completedGames.size >= totalGames || completedGames.size >= GAMES.length) {
      return null; // 会话结束
    }

    // 获取下一个未完成的游戏
    const nextGame = GAMES.find(game => !completedGames.has(game));

    if (nextGame) {
      this.sessionState.currentGameType = nextGame;
      return nextGame;
    }

    return null;
  }

  /**
   * 获取当前游戏类型
   */
  getCurrentGame(): GameType | null {
    return this.sessionState?.currentGameType || null;
  }

  /**
   * 获取游戏顺序列表
   */
  getGameOrder(): GameType[] {
    return [...GAMES];
  }

  /**
   * 获取游戏名称
   */
  getGameName(gameType: GameType): string {
    const names: Record<GameType, string> = {
      imageMatch: '看字选图',
      audioMatch: '听音找字',
      memory: '翻牌记忆',
      dragDrop: '拖拽组词',
    };
    return names[gameType];
  }

  /**
   * 获取游戏描述
   */
  getGameDescription(gameType: GameType): string {
    const descriptions: Record<GameType, string> = {
      imageMatch: '看看汉字，选出正确的图片',
      audioMatch: '听听读音，找出正确的汉字',
      memory: '翻开卡片，找出匹配的汉字和图片',
      dragDrop: '把汉字拖到对应的图片上',
    };
    return descriptions[gameType];
  }

  /**
   * 获取游戏表情
   */
  getGameEmoji(gameType: GameType): string {
    const emojis: Record<GameType, string> = {
      imageMatch: '🖼️',
      audioMatch: '🔊',
      memory: '🃏',
      dragDrop: '✋',
    };
    return emojis[gameType];
  }

  /**
   * 获取已完成游戏数量
   */
  getCompletedCount(): number {
    return this.sessionState?.completedGames.size || 0;
  }

  /**
   * 获取总游戏数量
   */
  getTotalCount(): number {
    return this.sessionState?.totalGames || GAMES.length;
  }

  /**
   * 重置会话
   */
  resetSession(): void {
    this.sessionState = null;
  }
}

export const gameManager = new GameManager();