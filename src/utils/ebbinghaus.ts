import {Character} from '../types';

/**
 * 艾宾浩斯遗忘曲线复习时间点（天数）
 */
const EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30, 60, 90];

/**
 * 学习记录
 */
export interface LearningRecord {
  characterId: string;
  learnedAt: Date;
  reviewAt: Date[];
  correctCount: number;
  totalCount: number;
  masteryLevel: number; // 0-100
  nextReviewAt: Date;
}

/**
 * 复习计划项
 */
export interface ReviewSchedule {
  characterId: string;
  character: string;
  nextReviewAt: Date;
  priority: 'urgent' | 'important' | 'normal' | 'completed';
  interval: number;
  masteryLevel: number;
}

/**
 * 艾宾浩斯复习算法管理器
 */
class EbbinghausManager {
  private records: Map<string, LearningRecord> = new Map();

  /**
   * 记录学习
   */
  recordLearning(characterId: string, character: string): void {
    const now = new Date();
    const record: LearningRecord = {
      characterId,
      learnedAt: now,
      reviewAt: [now],
      correctCount: 0,
      totalCount: 0,
      masteryLevel: 0,
      nextReviewAt: this.calculateNextReview(now, 0),
    };

    this.records.set(characterId, record);
  }

  /**
   * 记录复习结果
   */
  recordReview(characterId: string, isCorrect: boolean): void {
    const record = this.records.get(characterId);
    if (!record) {
      return;
    }

    const now = new Date();
    record.reviewAt.push(now);
    record.totalCount++;

    if (isCorrect) {
      record.correctCount++;
    }

    // 计算掌握度
    record.masteryLevel = this.calculateMastery(record);

    // 计算下次复习时间
    const currentInterval = this.getCurrentInterval(record);
    const nextInterval = isCorrect
      ? this.getNextInterval(currentInterval)
      : this.resetInterval();

    record.nextReviewAt = this.calculateNextReview(now, nextInterval);

    this.records.set(characterId, record);
  }

  /**
   * 获取复习计划
   */
  getReviewSchedule(characters: Character[]): ReviewSchedule[] {
    const schedules: ReviewSchedule[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    characters.forEach(char => {
      const record = this.records.get(char.id);
      const nextReviewAt = record?.nextReviewAt || new Date(today.getTime() + 24 * 60 * 60 * 1000);

      // 计算优先级
      const daysUntilReview = Math.floor(
        (nextReviewAt.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
      );

      let priority: ReviewSchedule['priority'];
      if (daysUntilReview <= 0) {
        priority = 'urgent';
      } else if (daysUntilReview <= 3) {
        priority = 'important';
      } else if (daysUntilReview <= 7) {
        priority = 'normal';
      } else {
        priority = 'completed';
      }

      schedules.push({
        characterId: char.id,
        character: char.character,
        nextReviewAt,
        priority,
        interval: record ? this.getCurrentInterval(record) : 0,
        masteryLevel: record?.masteryLevel || 0,
      });
    });

    // 按优先级排序
    const priorityOrder = {urgent: 0, important: 1, normal: 2, completed: 3};
    schedules.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.nextReviewAt.getTime() - b.nextReviewAt.getTime();
    });

    return schedules;
  }

  /**
   * 获取需要复习的汉字
   */
  getDueCharacters(characters: Character[], limit: number = 10): Character[] {
    const schedules = this.getReviewSchedule(characters);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return schedules
      .filter(s => s.nextReviewAt <= today || s.priority === 'urgent')
      .slice(0, limit)
      .map(s => characters.find(c => c.id === s.characterId)!)
      .filter(Boolean);
  }

  /**
   * 计算掌握度
   */
  private calculateMastery(record: LearningRecord): number {
    if (record.totalCount === 0) {
      return 0;
    }

    const accuracy = record.correctCount / record.totalCount;
    const recentAccuracy = this.getRecentAccuracy(record);

    // 综合考虑总体准确率和近期准确率
    return Math.min(100, (accuracy * 0.6 + recentAccuracy * 0.4) * 100);
  }

  /**
   * 获取近期准确率（最近5次复习）
   */
  private getRecentAccuracy(record: LearningRecord): number {
    const recentReviews = record.reviewAt.slice(-5);
    if (recentReviews.length === 0) {
      return 0;
    }

    // 这里简化处理，实际应该记录每次的结果
    return 0.8;
  }

  /**
   * 获取当前间隔等级
   */
  private getCurrentInterval(record: LearningRecord): number {
    // 根据复习次数确定间隔等级
    return Math.min(record.reviewAt.length - 1, EBBINGHAUS_INTERVALS.length - 1);
  }

  /**
   * 获取下一个间隔
   */
  private getNextInterval(currentInterval: number): number {
    return Math.min(currentInterval + 1, EBBINGHAUS_INTERVALS.length - 1);
  }

  /**
   * 重置间隔（答错时）
   */
  private resetInterval(): number {
    return 0;
  }

  /**
   * 计算下次复习时间
   */
  private calculateNextReview(date: Date, intervalIndex: number): Date {
    const intervalDays = EBBINGHAUS_INTERVALS[intervalIndex];
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + intervalDays);
    return nextDate;
  }

  /**
   * 获取复习统计
   */
  getReviewStats(characters: Character[]) {
    const schedules = this.getReviewSchedule(characters);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const urgent = schedules.filter(s => s.priority === 'urgent').length;
    const important = schedules.filter(s => s.priority === 'important').length;
    const normal = schedules.filter(s => s.priority === 'normal').length;
    const completed = schedules.filter(s => s.priority === 'completed').length;

    const averageMastery =
      schedules.length > 0
        ? schedules.reduce((sum, s) => sum + s.masteryLevel, 0) / schedules.length
        : 0;

    return {
      total: schedules.length,
      urgent,
      important,
      normal,
      completed,
      averageMastery,
    };
  }

  /**
   * 加载学习记录
   */
  loadRecords(records: LearningRecord[]): void {
    records.forEach(record => {
      this.records.set(record.characterId, record);
    });
  }

  /**
   * 获取所有学习记录
   */
  getAllRecords(): LearningRecord[] {
    return Array.from(this.records.values());
  }

  /**
   * 清除所有记录
   */
  clearAllRecords(): void {
    this.records.clear();
  }

  /**
   * 获取遗忘曲线数据（用于图表展示）
   */
  getForgettingCurveData(characterId: string): Array<{
    interval: number;
    retention: number;
  }> {
    const record = this.records.get(characterId);
    if (!record) {
      return [];
    }

    // 简化的遗忘曲线数据
    return EBBINGHAUS_INTERVALS.map((interval, index) => ({
      interval,
      retention: Math.max(10, 100 - index * 15 - (1 - record.masteryLevel / 100) * 30),
    }));
  }
}

export const ebbinghausManager = new EbbinghausManager();