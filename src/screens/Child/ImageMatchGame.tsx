import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ImageMatchGame'>;

export default function ImageMatchGame({route}: Props) {
  const navigation = useNavigation<NavigationProp>();
  const {characters, reviewMode = false, gameIndex = 0, totalGames = 1} =
    route.params;

  // 使用 useGameLogic hook
  const {progress, currentCharacter, handleAnswer, goToNext, resetGame} =
    useGameLogic(characters, (result) => {
      // 游戏完成时的回调
      navigation.navigate('ResultScreen' as any, {
        score: result.score,
        stars: result.stars,
        totalQuestions: result.total,
        reviewMode,
        gameIndex,
        totalGames,
        characters,
      });
    });

  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  const [correctOption, setCorrectOption] = React.useState<number>(0);

  // 生成选项
  const options = React.useMemo(() => {
    if (!currentCharacter || characters.length < 2) return [];

    // 正确答案
    const correct = {
      id: currentCharacter.id,
      imageUrl: currentCharacter.imageUrl,
      isCorrect: true,
    };

    // 干扰项
    const distractors = characters
      .filter((c) => c.id !== currentCharacter.id)
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        imageUrl: c.imageUrl,
        isCorrect: false,
      }));

    // 混合并打乱
    const all = [correct, ...distractors];
    return all.sort(() => Math.random() - 0.5);
  }, [currentCharacter, characters]);

  const handleOptionSelect = (index: number) => {
    if (
      showResult ||
      !currentCharacter ||
      options.length === 0 ||
      selectedOption !== null
    )
      return;

    setSelectedOption(index);
    const isCorrect = options[index].isCorrect;
    setCorrectOption(options.findIndex((o) => o.isCorrect));
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
    // 错误答案但未达到阈值时，显示"再试试"按钮
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

  // 如果没有当前字符（游戏结束或加载中），显示提示
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
      {/* 进度指示器 */}
      <View style={styles.header}>
        <Text style={styles.progressText}>
          {progress.currentIndex + 1} / {characters.length}
        </Text>
        <Text style={styles.scoreText}>得分: {progress.score}</Text>
      </View>

      {/* 汉字展示区 */}
      <View style={styles.characterSection}>
        {currentCharacter && (
          <>
            <Text style={styles.character}>{currentCharacter.character}</Text>
            <Text style={styles.pinyin}>{currentCharacter.pinyin}</Text>
          </>
        )}
      </View>

      {/* 选项区 */}
      <View style={styles.optionsContainer}>
        {options.length > 0 &&
          options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrectOption = option.isCorrect;
            const showCorrect = showResult && isCorrectOption;
            const showWrong = showResult && isSelected && !isCorrectOption;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.option,
                  showCorrect && styles.correctOption,
                  showWrong && styles.wrongOption,
                ]}
                onPress={() => handleOptionSelect(index)}
                disabled={showResult || selectedOption !== null}>
                <View style={styles.optionImage}>
                  {option.imageUrl ? (
                    <Image
                      source={{uri: option.imageUrl}}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.placeholderText}>暂无图片</Text>
                  )}
                </View>
                {showCorrect && <Text style={styles.resultText}>✓</Text>}
                {showWrong && <Text style={styles.resultText}>✗</Text>}
              </TouchableOpacity>
            );
          })}
      </View>

      {/* 错误时显示再试试按钮 */}
      {showResult &&
        selectedOption !== null &&
        !options[selectedOption]?.isCorrect &&
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
  characterSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  character: {
    fontSize: fontSize.xxxxxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pinyin: {
    fontSize: fontSize.xxl,
    color: colors.textLight,
  },
  optionsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  option: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadow.medium,
  },
  optionImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  correctOption: {
    borderWidth: 4,
    borderColor: colors.success,
  },
  wrongOption: {
    borderWidth: 4,
    borderColor: colors.error,
  },
  resultText: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
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