import {create} from 'zustand';
import {GameType, Character, GameSession, ImageMatchOption} from '../types';

interface GameState {
  currentSession?: GameSession;
  currentGameType: GameType;
  gameOptions: ImageMatchOption[];
  isGameActive: boolean;
  score: number;
  stars: number;
  streak: number;
  currentQuestionIndex: number;
  wrongAttempts: number;

  // Actions
  startGameSession: (
    gameType: GameType,
    characters: Character[],
  ) => void;
  endGameSession: () => void;
  setCurrentGameType: (gameType: GameType) => void;
  setGameOptions: (options: ImageMatchOption[]) => void;
  setIsGameActive: (active: boolean) => void;
  incrementScore: () => void;
  incrementStars: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  nextQuestion: () => void;
  recordWrongAttempt: () => void;
  resetWrongAttempts: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentSession: undefined,
  currentGameType: 'imageMatch',
  gameOptions: [],
  isGameActive: false,
  score: 0,
  stars: 0,
  streak: 0,
  currentQuestionIndex: 0,
  wrongAttempts: 0,

  startGameSession: (gameType, characters) =>
    set({
      currentSession: {
        id: Date.now().toString(),
        gameType,
        characters,
        currentIndex: 0,
        correctCount: 0,
        startTime: new Date(),
      },
      currentGameType: gameType,
      isGameActive: true,
      score: 0,
      stars: 0,
      streak: 0,
      currentQuestionIndex: 0,
      wrongAttempts: 0,
    }),

  endGameSession: () =>
    set((state) => ({
      currentSession: {
        ...state.currentSession!,
        endTime: new Date(),
      },
      isGameActive: false,
    })),

  setCurrentGameType: (gameType) => set({currentGameType: gameType}),
  setGameOptions: (options) => set({gameOptions: options}),
  setIsGameActive: (active) => set({isGameActive: active}),

  incrementScore: () => set((state) => ({score: state.score + 10})),
  incrementStars: () => set((state) => ({stars: state.stars + 1})),
  incrementStreak: () => set((state) => ({streak: state.streak + 1})),
  resetStreak: () => set({streak: 0}),

  nextQuestion: () =>
    set((state) => ({currentQuestionIndex: state.currentQuestionIndex + 1})),

  recordWrongAttempt: () =>
    set((state) => ({wrongAttempts: state.wrongAttempts + 1})),

  resetWrongAttempts: () => set({wrongAttempts: 0}),

  resetGame: () =>
    set({
      currentSession: undefined,
      gameOptions: [],
      isGameActive: false,
      score: 0,
      stars: 0,
      streak: 0,
      currentQuestionIndex: 0,
      wrongAttempts: 0,
    }),
}));