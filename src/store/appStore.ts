import {create} from 'zustand';
import {
  AppMode,
  AppSettings,
  Character,
  Group,
  Mascot,
  DailyDifficultChars,
  ReviewPool,
  MasteryLevel,
} from '../types';
import {storageService} from '../services/storageService';

interface AppState {
  appMode: AppMode;
  isParentVerified: boolean;
  currentCharacterId?: string;
  selectedMascot?: Mascot;
  settings: AppSettings;
  groups: Group[];
  todayStudyCount: number;
  todayCorrectCount: number;
  todayErrorCount: number;
  isInitialized: boolean;

  // 易错字相关
  dailyDifficultChars: DailyDifficultChars[];
  currentReviewPool?: ReviewPool;

  // Actions
  initialize: () => Promise<void>;
  setAppMode: (mode: AppMode) => void;
  setParentVerified: (verified: boolean) => void;
  setCurrentCharacterId: (id: string | undefined) => void;
  setSelectedMascot: (mascot: Mascot | undefined) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  deleteGroup: (groupId: string) => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  deleteCharacter: (characterId: string) => void;

  // 学习记录
  recordStudyResult: (characterId: string, isCorrect: boolean, errorCount: number) => void;
  incrementTodayStudy: () => void;
  incrementTodayCorrect: () => void;
  incrementTodayError: () => void;
  resetTodayStats: () => void;

  // 易错字管理
  recordError: (characterId: string) => void;
  recordSuccess: (characterId: string) => void;
  markAsDifficult: (characterId: string) => void;
  unmarkAsDifficult: (characterId: string) => void;
  generateDailyReviewPool: () => ReviewPool;

  // 数据持久化
  saveAllData: () => Promise<void>;
  saveDailyDifficultChars: () => Promise<void>;
  loadDailyDifficultChars: () => Promise<void>;
  setState: (state: Partial<AppState>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  appMode: 'child',
  isParentVerified: false,
  currentCharacterId: undefined,
  selectedMascot: undefined,
  settings: {
    id: 'default',
    dailyReviewCount: 10,
    sourceMode: 'oldest',
    mascotId: 'mascot_1',
    parentPassword: '1234',
    parentGateMethod: 'combined',
    masteryThreshold: 80,
  },
  groups: [],
  todayStudyCount: 0,
  todayCorrectCount: 0,
  todayErrorCount: 0,
  isInitialized: false,
  dailyDifficultChars: [],
  currentReviewPool: undefined,

  setState: (updates) => set(updates),

  initialize: async () => {
    try {
      // 加载设置
      const savedSettings = await storageService.getSettings();
      if (savedSettings) {
        set({settings: {...get().settings, ...savedSettings}});
      }

      // 加载分组
      const savedGroups = await storageService.getGroups();
      if (savedGroups) {
        set({groups: savedGroups});
      }

      // 加载今日统计
      const todayStats = await storageService.getTodayStats();
      if (todayStats) {
        set({
          todayStudyCount: todayStats.studyCount,
          todayCorrectCount: todayStats.correctCount,
        });
      } else {
        set({todayStudyCount: 0, todayCorrectCount: 0, todayErrorCount: 0});
      }

      // 加载易错字记录
      await get().loadDailyDifficultChars();

      set({isInitialized: true});
    } catch (error) {
      console.error('初始化数据失败:', error);
      set({isInitialized: true});
    }
  },

  setAppMode: (mode) => set({appMode: mode, isParentVerified: false}),

  setParentVerified: (verified) => set({isParentVerified: verified}),

  setCurrentCharacterId: (id) => set({currentCharacterId: id}),

  setSelectedMascot: (mascot) => set({selectedMascot: mascot}),

  updateSettings: (updates) =>
    set((state) => ({
      settings: {...state.settings, ...updates},
    })),

  addGroup: (group) =>
    set((state) => ({
      groups: [...state.groups, group],
    })),

  updateGroup: (groupId, updates) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? {...g, ...updates} : g,
      ),
    })),

  deleteGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
    })),

  addCharacter: (character) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === character.groupId
          ? {
              ...g,
              characters: [...(g.characters || []), character],
            }
          : g,
      ),
    })),

  updateCharacter: (characterId, updates) =>
    set((state) => ({
      groups: state.groups.map((g) => ({
        ...g,
        characters: g.characters?.map((c) =>
          c.id === characterId ? {...c, ...updates} : c,
        ),
      })),
    })),

  deleteCharacter: (characterId) =>
    set((state) => ({
      groups: state.groups.map((g) => ({
        ...g,
        characters: g.characters?.filter((c) => c.id !== characterId),
      })),
    })),

  recordStudyResult: (characterId, isCorrect, errorCount) => {
    const state = get();
    const updatedGroups = state.groups.map((g) => ({
      ...g,
      characters: g.characters?.map((c) => {
        if (c.id !== characterId) return c;

        const newCorrectCount = c.correctCount + (isCorrect ? 1 : 0);
        const newStudyCount = c.studyCount + 1;
        const accuracy = newCorrectCount / newStudyCount;
        const masteryThreshold = state.settings.masteryThreshold || 80;

        let newMasteryLevel: MasteryLevel = c.masteryLevel || 'unknown';
        if (accuracy >= 90) {
          newMasteryLevel = 'mastered';
        } else if (accuracy >= 80) {
          newMasteryLevel = 'learning';
        } else if (accuracy >= 50) {
          newMasteryLevel = 'difficult';
        }

        return {
          ...c,
          studyCount: newStudyCount,
          correctCount: newCorrectCount,
          totalErrorCount: c.totalErrorCount + errorCount,
          lastReviewDate: new Date(),
          lastReviewErrors: errorCount,
          isLearned: accuracy >= masteryThreshold / 100,
          masteryLevel: newMasteryLevel,
        };
      }),
    }));

    set({groups: updatedGroups});
  },

  incrementTodayStudy: () =>
    set((state) => ({todayStudyCount: state.todayStudyCount + 1})),

  incrementTodayCorrect: () =>
    set((state) => ({todayCorrectCount: state.todayCorrectCount + 1})),

  incrementTodayError: () =>
    set((state) => ({todayErrorCount: state.todayErrorCount + 1})),

  resetTodayStats: () =>
    set({todayStudyCount: 0, todayCorrectCount: 0, todayErrorCount: 0}),

  recordError: (characterId) => {
    const state = get();
    const char = state.groups
      .flatMap(g => g.characters || [])
      .find(c => c.id === characterId);

    if (char) {
      state.updateCharacter(characterId, {
        totalErrorCount: (char.totalErrorCount || 0) + 1,
        lastReviewDate: new Date(),
        lastReviewErrors: (char.lastReviewErrors || 0) + 1,
      });
    }
  },

  recordSuccess: (characterId) => {
    get().updateCharacter(characterId, {
      lastReviewDate: new Date(),
      lastReviewErrors: 0,
    });
  },

  markAsDifficult: (characterId) => {
    get().updateCharacter(characterId, {
      isDifficult: true,
      difficultDate: new Date(),
    });
  },

  unmarkAsDifficult: (characterId) => {
    get().updateCharacter(characterId, {
      isDifficult: false,
      difficultDate: undefined,
    });
  },

  generateDailyReviewPool: (): ReviewPool => {
    const state = get();
    const {dailyReviewCount, masteryThreshold} = state.settings;

    // 获取所有汉字
    const allCharacters: Character[] = [];
    state.groups.forEach(g => {
      if (g.characters) {
        allCharacters.push(...g.characters);
      }
    });

    // 获取昨日易错字
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayDifficult = state.dailyDifficultChars.find(
      d => d.date === yesterdayStr,
    );

    const yesterdayDifficultCharIds = yesterdayDifficult
      ? yesterdayDifficult.characters.map(c => c.characterId)
      : [];

    // 获取昨日易错字
    const difficultChars: Character[] = [];
    allCharacters.forEach(char => {
      if (yesterdayDifficultCharIds.includes(char.id)) {
        difficultChars.push(char);
      }
    });

    // 按错误次数排序，取最高的 N 个
    difficultChars.sort(
      (a, b) => (b.totalErrorCount || 0) - (a.totalErrorCount || 0),
    );

    const poolDifficultChars = difficultChars.slice(0, dailyReviewCount);

    // 计算剩余名额
    const remainingCount = Math.max(0, dailyReviewCount - poolDifficultChars.length);

    // 获取未掌握的汉字（正确率低于阈值）
    const unmasteredChars: Character[] = [];
    const threshold = masteryThreshold || 80;

    allCharacters.forEach(char => {
      // 排除已选的易错字
      if (yesterdayDifficultCharIds.includes(char.id)) {
        return;
      }

      // 检查是否未掌握
      const accuracy =
        char.studyCount > 0 ? (char.correctCount / char.studyCount) * 100 : 0;

      if (accuracy < threshold && !char.isLearned) {
        unmasteredChars.push(char);
      }
    });

    // 优先选择最久未复习且掌握度最低的
    unmasteredChars.sort((a, b) => {
      // 先按掌握度排序
      const aAccuracy =
        a.studyCount > 0 ? (a.correctCount / a.studyCount) * 100 : 0;
      const bAccuracy =
        b.studyCount > 0 ? (b.correctCount / b.studyCount) * 100 : 0;

      if (Math.abs(aAccuracy - bAccuracy) > 10) {
        return aAccuracy - bAccuracy;
      }

      // 然后按最近复习时间排序（越久未复习越靠前）
      const aLastReview = a.lastReviewDate?.getTime() || 0;
      const bLastReview = b.lastReviewDate?.getTime() || 0;
      return aLastReview - bLastReview;
    });

    const poolRegularChars = unmasteredChars.slice(0, remainingCount);

    const reviewPool: ReviewPool = {
      date: new Date().toISOString().split('T')[0],
      difficultChars: poolDifficultChars,
      regularChars: poolRegularChars,
      total: poolDifficultChars.length + poolRegularChars.length,
    };

    set({currentReviewPool: reviewPool});
    return reviewPool;
  },

  saveAllData: async () => {
    const state = get();
    try {
      await storageService.saveSettings(state.settings);
      await storageService.saveGroups(state.groups);
      await storageService.saveTodayStats({
        studyCount: state.todayStudyCount,
        correctCount: state.todayCorrectCount,
      });
      await state.saveDailyDifficultChars();
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  },

  saveDailyDifficultChars: async () => {
    const {dailyDifficultChars} = get();
    await storageService.save('LittleHanzi_difficultChars', dailyDifficultChars);
  },

  loadDailyDifficultChars: async () => {
    const data = await storageService.get<DailyDifficultChars[]>(
      'LittleHanzi_difficultChars',
    );
    if (data) {
      set({dailyDifficultChars: data});
    }
  },
}));