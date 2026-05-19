import {useState, useCallback} from 'react';
import {useAppStore} from '../store/appStore';
import {soundService} from '../services/soundService';

const ERROR_THRESHOLD = 2; // 错误次数阈值，超过则标记为易错字

export interface GameCharacter {
  id: string;
  character: string;
  pinyin: string;
  imageUrl?: string;
  isLearned?: boolean;
}

interface GameProgress {
  currentIndex: number;
  score: number;
  stars: number;
  wrongAttempts: number; // 当前汉字的错误次数
  completedChars: string[]; // 已完成的汉字ID
}

/**
 * 游戏逻辑 Hook
 */
export function useGameLogic(
  characters: GameCharacter[],
  onComplete: (result: {score: number; stars: number; total: number}) => void,
) {
  const {incrementTodayStudy, incrementTodayCorrect, recordStudyResult} =
    useAppStore();

  const [progress, setProgress] = useState<GameProgress>({
    currentIndex: 0,
    score: 0,
    stars: 0,
    wrongAttempts: 0,
    completedChars: [],
  });

  const currentCharacter = characters[progress.currentIndex];

  /**
   * 处理答案
   */
  const handleAnswer = useCallback(
    (isCorrect: boolean): {shouldContinue: boolean; showResult: boolean} => {
      if (isCorrect) {
        // 正确答案
        setProgress((prev) => ({
          ...prev,
          score: prev.score + 10,
          stars: prev.stars + 1,
          wrongAttempts: 0,
        }));

        // 记录学习结果
        if (currentCharacter) {
          recordStudyResult(currentCharacter.id, true, 0);
          incrementTodayStudy();
          incrementTodayCorrect();

          // 标记完成
          setProgress((prev) => ({
            ...prev,
            completedChars: [...prev.completedChars, currentCharacter.id],
          }));
        }

        soundService.play('correct');

        return {shouldContinue: true, showResult: true};
      } else {
        // 错误答案
        const newWrongAttempts = progress.wrongAttempts + 1;
        setProgress((prev) => ({
          ...prev,
          wrongAttempts: newWrongAttempts,
        }));

        // 记录错误
        if (currentCharacter) {
          recordStudyResult(currentCharacter.id, false, 1);
          incrementTodayStudy();
        }

        soundService.play('wrong');

        // 检查是否达到错误阈值（2次错误）
        if (newWrongAttempts >= ERROR_THRESHOLD) {
          // 标记为易错字
          if (currentCharacter) {
            useAppStore.getState().markAsDifficult(currentCharacter.id);
          }
          return {shouldContinue: true, showResult: true};
        }

        // 第一次错误，给"再试试"机会
        return {shouldContinue: false, showResult: true};
      }
    },
    [
      currentCharacter,
      progress,
      incrementTodayStudy,
      incrementTodayCorrect,
      recordStudyResult,
    ],
  );

  /**
   * 进入下一题
   */
  const goToNext = useCallback(() => {
    if (progress.currentIndex < characters.length - 1) {
      setProgress((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        wrongAttempts: 0,
      }));
    } else {
      // 所有题目完成
      onComplete({
        score: progress.score,
        stars: progress.stars,
        total: characters.length,
      });
    }
  }, [progress.currentIndex, characters.length, progress.score, progress.stars, onComplete]);

  /**
   * 重置游戏
   */
  const resetGame = useCallback(() => {
    setProgress({
      currentIndex: 0,
      score: 0,
      stars: 0,
      wrongAttempts: 0,
      completedChars: [],
    });
  }, []);

  return {
    progress,
    currentCharacter,
    handleAnswer,
    goToNext,
    resetGame,
  };
}