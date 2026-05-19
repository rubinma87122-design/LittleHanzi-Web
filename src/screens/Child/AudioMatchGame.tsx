import React from 'react';
import {View, Text, StyleSheet, SafeAreaView, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {ttsService} from '../../services/ttsService';
import {useGameLogic, GameCharacter} from '../../hooks/useGameLogic';

interface Props {
  route: {
    params: {
      characters: GameCharacter[];
      reviewMode?: boolean;
      gameIndex?: number;
      totalGames?: number;
    };
  };
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AudioMatchGame'>;

export default function AudioMatchGame({route}: Props) {
  const navigation = useNavigation<NavigationProp>();
  const {characters, reviewMode = false, gameIndex = 0, totalGames = 1} =
    route.params;

  // 使用 useGameLogic hook
  const {progress, currentCharacter, handleAnswer, goToNext} = useGameLogic(
    characters,
    (result) => {
      navigation.navigate('ResultScreen' as any, {
        score: result.score,
        stars: result.stars,
        totalQuestions: result.total,
        reviewMode,
        gameIndex,
        totalGames,
        characters,
      });
    },
  );

  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);

  // 生成选项（4个汉字选项）
  const options = React.useMemo(() => {
    if (!currentCharacter || characters.length < 2) return [];

    const correct = currentCharacter;
    const distractors = characters
      .filter((c) => c.id !== currentCharacter.id)
      .slice(0, 3);

    const all = [correct, ...distractors];
    return all.sort(() => Math.random() - 0.5);
  }, [currentCharacter, characters]);

  // 播放读音
  const playSound = () => {
    if (!currentCharacter) return;
    setIsPlaying(true);
    ttsService.speak(currentCharacter.character);
    setTimeout(() => setIsPlaying(false), 1000);
  };

  // 自动播放读音
  React.useEffect(() => {
    if (currentCharacter) {
      playSound();
    }
  }, [progress.currentIndex]);

  const handleOptionSelect = (index: number) => {
    if (
      showResult ||
      !currentCharacter ||
      options.length === 0 ||
      selectedOption !== null
    )
      return;

    setSelectedOption(index);
    const isCorrect = options[index].id === currentCharacter.id;
    setShowResult(true);

    // 使用 handleAnswer 处理答案
    const {shouldContinue} = handleAnswer(isCorrect);

    // 正确答案时，延迟后自动进入下一题
    if (isCorrect) {
      setTimeout(() => {
        setSelectedOption(null);
        setShowResult(false);
        goToNext();
      }, 500);
    }
    // 错误答案达到阈值时，延迟后自动进入下一题
    else if (shouldContinue) {
      setTimeout(() => {
        setSelectedOption(null);
        setShowResult(false);
        goToNext();
      }, 1500);
    }
    // 第一次错误，不自动进入下一题，显示"再试试"按钮
  };

  const handlePlayButton = () => {
    playSound();
  };

  // 如果没有当前字符，显示提示
  if (!currentCharacter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>准备中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 进度 */}
      <View style={styles.header}>
        <Text style={styles.progressText}>
          {progress.currentIndex + 1} / {characters.length}
        </Text>
        <Text style={styles.scoreText}>得分: {progress.score}</Text>
      </View>

      {/* 播放按钮 */}
      <View style={styles.playSection}>
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={handlePlayButton}>
          <Text style={styles.playButtonText}>{isPlaying ? '🔊' : '🔇'}</Text>
          <Text style={styles.playButtonLabel}>
            {isPlaying ? '播放中...' : '点击播放'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 选项区 */}
      <View style={styles.optionsContainer}>
        <View style={styles.optionsGrid}>
          {options.length > 0 &&
            options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrectOption = option.id === currentCharacter.id;
              const showCorrect = showResult && isCorrectOption;
              const showWrong = showResult && isSelected && !isCorrectOption;

              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    isSelected && styles.selectedOption,
                    showCorrect && styles.correctOption,
                    showWrong && styles.wrongOption,
                  ]}
                  onPress={() => handleOptionSelect(index)}
                  disabled={showResult || selectedOption !== null}>
                  <Text style={styles.optionText}>{option.character}</Text>
                  {showCorrect && <Text style={styles.resultIcon}>✓</Text>}
                  {showWrong && <Text style={styles.resultIcon}>✗</Text>}
                </TouchableOpacity>
              );
            })}
        </View>
      </View>

      {/* 错误时显示再试试按钮 */}
      {showResult &&
        selectedOption !== null &&
        !options[selectedOption]?.id.startsWith(currentCharacter.id) &&
        progress.wrongAttempts < 2 && (
          <View style={styles.retrySection}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setSelectedOption(null);
                setShowResult(false);
              }}>
              <Text style={styles.retryButtonText}>再试试</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                goToNext();
                setSelectedOption(null);
                setShowResult(false);
              }}>
              <Text style={styles.skipButtonText}>跳过</Text>
            </TouchableOpacity>
          </View>
        )}

      {/* 提示 */}
      <View style={styles.hintSection}>
        <Text style={styles.hintText}>听读音，选出正确的汉字</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  progressText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
  scoreText: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: 'bold',
  },
  playSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  playButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.large,
  },
  playButtonActive: {
    backgroundColor: colors.primaryDark,
    transform: [{scale: 0.95}],
  },
  playButtonText: {
    fontSize: 60,
  },
  playButtonLabel: {
    fontSize: fontSize.md,
    color: colors.white,
    marginTop: spacing.sm,
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  option: {
    width: '45%',
    height: 100,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.medium,
  },
  selectedOption: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  correctOption: {
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.success,
  },
  wrongOption: {
    backgroundColor: colors.error,
    borderWidth: 3,
    borderColor: colors.error,
  },
  optionText: {
    fontSize: fontSize.xxxxxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  resultIcon: {
    position: 'absolute',
    fontSize: fontSize.xxl,
    color: colors.white,
    fontWeight: 'bold',
  },
  hintSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  hintText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
  retrySection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    ...shadow.medium,
  },
  retryButtonText: {
    fontSize: fontSize.lg,
    color: colors.white,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
  },
  skipButtonText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
});
