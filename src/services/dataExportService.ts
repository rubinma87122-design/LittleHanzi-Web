import {Character, Group, StudyRecord, AppSettings} from '../types';
import {storageService} from './storageService';

/**
 * 导出数据格式
 */
export interface ExportData {
  version: string;
  exportDate: string;
  settings: AppSettings;
  groups: Group[];
  studyRecords: StudyRecord[];
}

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean;
  message: string;
  groupsCount: number;
  charactersCount: number;
}

/**
 * 数据导出/导入服务
 */
class DataExportService {
  private readonly VERSION = '1.0.0';

  /**
   * 导出所有数据
   */
  async exportAllData(): Promise<string> {
    const settings = await storageService.getSettings();
    const groups = await storageService.getGroups() || [];
    const studyRecords = await storageService.getStudyRecords() || [];

    const exportData: ExportData = {
      version: this.VERSION,
      exportDate: new Date().toISOString(),
      settings,
      groups,
      studyRecords,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 导入数据
   */
  async importData(jsonString: string): Promise<ImportResult> {
    try {
      const data: ExportData = JSON.parse(jsonString);

      // 验证数据格式
      if (!data.version || !data.groups) {
        return {
          success: false,
          message: '无效的数据格式',
          groupsCount: 0,
          charactersCount: 0,
        };
      }

      // 统计汉字数量
      const charactersCount = data.groups.reduce(
        (sum, g) => sum + (g.characters?.length || 0),
        0,
      );

      // 保存数据
      if (data.settings) {
        await storageService.saveSettings(data.settings);
      }

      await storageService.saveGroups(data.groups);

      if (data.studyRecords) {
        await storageService.saveStudyRecords(data.studyRecords);
      }

      return {
        success: true,
        message: '数据导入成功',
        groupsCount: data.groups.length,
        charactersCount,
      };
    } catch (error) {
      console.error('导入数据失败:', error);
      return {
        success: false,
        message: '数据解析失败，请检查文件格式',
        groupsCount: 0,
        charactersCount: 0,
      };
    }
  }

  /**
   * 导出为可分享的文本
   */
  async exportAsText(): Promise<string> {
    const groups = await storageService.getGroups() || [];

    let text = '📚 小小汉字 - 字库导出\n';
    text += `📅 导出时间: ${new Date().toLocaleDateString('zh-CN')}\n`;
    text += '─'.repeat(30) + '\n\n';

    groups.forEach(group => {
      text += `📝 ${group.name}`;
      if (group.note) {
        text += ` (${group.note})`;
      }
      text += '\n';

      if (group.characters && group.characters.length > 0) {
        group.characters.forEach((char: Character) => {
          text += `  ${char.character} (${char.pinyin || '无拼音'})`;
          if (char.isLearned) {
            text += ' ✓';
          }
          text += '\n';
        });
      } else {
        text += '  (无汉字)\n';
      }
      text += '\n';
    });

    const totalCharacters = groups.reduce(
      (sum, g) => sum + (g.characters?.length || 0),
      0,
    );

    text += '─'.repeat(30) + '\n';
    text += `📊 总计: ${groups.length} 个分组, ${totalCharacters} 个汉字\n`;

    return text;
  }

  /**
   * 验证导出数据
   */
  validateExportData(data: unknown): data is ExportData {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const obj = data as Record<string, unknown>;

    return (
      typeof obj.version === 'string' &&
      typeof obj.exportDate === 'string' &&
      Array.isArray(obj.groups)
    );
  }

  /**
   * 获取导出文件名
   */
  getExportFileName(): string {
    const date = new Date().toISOString().split('T')[0];
    return `LittleHanzi_${date}.json`;
  }

  /**
   * 清除所有数据
   */
  async clearAllData(): Promise<void> {
    await storageService.clear();
  }
}

export const dataExportService = new DataExportService();