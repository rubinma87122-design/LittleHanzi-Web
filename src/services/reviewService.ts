import {Character, DailyDifficultChars, StudyRecord} from '../types';
import {useAppStore} from '../store/appStore';

const ERROR_THRESHOLD = 2; // 错误次数阈值

/**
 * 复习服务 - 管理每日复习逻辑和易错字
 */
class ReviewService {
  /**
   * 记录单次练习结果
   * @param characterId 汉字ID
   * @param errorCount 本次练习错误次数
   * @returns 是否标记为易错字
   */
  recordPracticeResult(
    characterId: string,
    errorCount: number,
  ): boolean {
    const {updateCharacter, recordStudyResult} = useAppStore.getState();

    // 更新学习统计
    const isCorrect = errorCount === 0;
    recordStudyResult(characterId, isCorrect, errorCount);

    // 如果错误次数达到阈值，标记为易错字
    if (errorCount >= ERROR_THRESHOLD && !isCorrect) {
      useAppStore.getState().markAsDifficult(characterId);
      return true;
    }

    return false;
  }

  /**
   * 获取今日易错字列表
   */
  getTodayDifficultChars(): Array<{characterId: string; errorCount: number}> {
    const {groups} = useAppStore.getState();
    const today = new Date().toISOString().split('T')[0];
    const difficultChars: Array<{characterId: string; errorCount: number}> = [];

    groups.forEach(group => {
      if (group.characters) {
        group.characters.forEach(char => {
          // 检查是否是今天标记为易错字的
          const isTodayDifficult =
            char.isDifficult &&
            char.difficultDate &&
            char.difficultDate.toISOString().split('T')[0] === today;

          if (isTodayDifficult) {
            difficultChars.push({
              characterId: char.id,
              errorCount: char.lastReviewErrors || char.totalErrorCount,
            });
          }
        });
      }
    });

    // 按错误次数排序
    difficultChars.sort((a, b) => b.errorCount - a.errorCount);

    return difficultChars;
  }

  /**
   * 完成今日复习，保存易错字记录
   */
  completeDailyReview(): DailyDifficultChars {
    const {groups} = useAppStore.getState();
    const today = new Date().toISOString().split('T')[0];
    const difficultRecords: DailyDifficultChars['characters'] = [];

    groups.forEach(group => {
      if (group.characters) {
        group.characters.forEach(char => {
          // 检查是否是易错字（错误次数 >= 2）
          if (char.lastReviewErrors >= ERROR_THRESHOLD) {
            difficultRecords.push({
              characterId: char.id,
              character: char.character,
              errorCount: char.lastReviewErrors,
            });
          }
        });
      }
    });

    const dailyRecord: DailyDifficultChars = {
      date: today,
      characters: difficultRecords,
    };

    // 保存到 Store
    const state = useAppStore.getState();
    const existingIndex = state.dailyDifficultChars.findIndex(d => d.date === today);
    const newDifficultChars = [...state.dailyDifficultChars];

    if (existingIndex >= 0) {
      newDifficultChars[existingIndex] = dailyRecord;
    } else {
      newDifficultChars.push(dailyRecord);
    }

    // 只保留最近 30 天的记录
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filtered = newDifficultChars.filter(
      d => new Date(d.date) >= thirtyDaysAgo,
    );

    // 更新 store（需要使用 set 方法）
    useAppStore.setState({dailyDifficultChars: filtered});

    // 持久化保存
    useAppStore.getState().saveDailyDifficultChars();

    return dailyRecord;
  }

  /**
   * 获取每日复习字池
   */
  getDailyReviewPool(): Character[] {
    const {generateDailyReviewPool, settings} = useAppStore.getState();
    const pool = generateDailyReviewPool();

    const allChars = [...pool.difficultChars, ...pool.regularChars];
    const shuffled = allChars.sort(() => Math.random() - 0.5);

    return shuffled.slice(0, settings.dailyReviewCount);
  }

  /**
   * 获取未掌握的汉字列表
   */
  getUnmasteredCharacters(): Character[] {
    const {groups, settings} = useAppStore.getState();
    const threshold = settings.masteryThreshold || 80;
    const unmastered: Character[] = [];

    groups.forEach(group => {
      if (group.characters) {
        group.characters.forEach(char => {
          const accuracy =
            char.studyCount > 0 ? (char.correctCount / char.studyCount) * 100 : 0;

          if (accuracy < threshold && !char.isLearned) {
            unmastered.push(char);
          }
        });
      }
    });

    return unmastered;
  }

  /**
   * 获取即将到期的复习汉字
   */
  getDueReviewCharacters(): Character[] {
    const {groups} = useAppStore.getState();
    const today = new Date();
    const dueChars: Character[] = [];

    groups.forEach(group => {
      if (group.characters) {
        group.characters.forEach(char => {
          // 如果没有复习过或者是易错字
          if (!char.lastReviewDate || char.isDifficult) {
            dueChars.push(char);
          }
        });
      }
    });

    return dueChars;
  }

  /**
   * 计算汉字的准确率
   */
  calculateAccuracy(character: Character): number {
    if (character.studyCount === 0) {
      return 0;
    }
    return (character.correctCount / character.studyCount) * 100;
  }

  /**
   * 检查汉字是否需要复习
   */
  needsReview(character: Character): boolean {
    const {settings} = useAppStore.getState();
    const threshold = settings.masteryThreshold || 80;
    const accuracy = this.calculateAccuracy(character);

    // 未掌握或易错字需要复习
    return accuracy < threshold || character.isDifficult;
  }
}

export const reviewService = new ReviewService();