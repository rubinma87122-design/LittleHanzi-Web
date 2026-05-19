import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SETTINGS: 'LittleHanzi_settings',
  GROUPS: 'LittleHanzi_groups',
  STUDY_RECORDS: 'LittleHanzi_studyRecords',
  TODAY_STATS: 'LittleHanzi_todayStats',
  DIFFICULT_CHARS: 'LittleHanzi_difficultChars',
};

interface StorageData {
  [key: string]: any;
}

/**
 * 本地存储服务
 */
class StorageService {
  /**
   * 保存数据
   */
  async save(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('保存数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取数据
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('获取数据失败:', error);
      return null;
    }
  }

  /**
   * 删除数据
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('删除数据失败:', error);
      throw error;
    }
  }

  /**
   * 清空所有数据
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('清空数据失败:', error);
      throw error;
    }
  }

  /**
   * 保存设置
   */
  async saveSettings(settings: any): Promise<void> {
    return this.save(STORAGE_KEYS.SETTINGS, settings);
  }

  /**
   * 获取设置
   */
  async getSettings(): Promise<any | null> {
    return this.get(STORAGE_KEYS.SETTINGS);
  }

  /**
   * 保存分组
   */
  async saveGroups(groups: any[]): Promise<void> {
    return this.save(STORAGE_KEYS.GROUPS, groups);
  }

  /**
   * 获取分组
   */
  async getGroups(): Promise<any[] | null> {
    return this.get(STORAGE_KEYS.GROUPS);
  }

  /**
   * 保存学习记录
   */
  async saveStudyRecords(records: any[]): Promise<void> {
    return this.save(STORAGE_KEYS.STUDY_RECORDS, records);
  }

  /**
   * 获取学习记录
   */
  async getStudyRecords(): Promise<any[] | null> {
    return this.get(STORAGE_KEYS.STUDY_RECORDS);
  }

  /**
   * 保存今日统计
   */
  async saveTodayStats(stats: {studyCount: number; correctCount: number}): Promise<void> {
    return this.save(STORAGE_KEYS.TODAY_STATS, {
      ...stats,
      date: new Date().toDateString(),
    });
  }

  /**
   * 获取今日统计
   */
  async getTodayStats(): Promise<{studyCount: number; correctCount: number} | null> {
    const stats = await this.get(STORAGE_KEYS.TODAY_STATS);
    if (stats && stats.date === new Date().toDateString()) {
      return {studyCount: stats.studyCount, correctCount: stats.correctCount};
    }
    return null;
  }
}

export const storageService = new StorageService();