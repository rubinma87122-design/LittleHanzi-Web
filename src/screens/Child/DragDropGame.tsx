import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  PanResponder,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {ttsService} from '../../services/ttsService';
import {soundService} from '../../services/soundService';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DragDropGame'>;

export default function DragDropGame({route}: Props) {
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

  const [showResult, setShowResult] = useState(false);
  const [showRetry, setShowRetry] = useState(false);

  // 生成目标区域（包含正确答案和干扰项）
  const targets = React.useMemo(() => {
    if (!currentCharacter || characters.length < 2) return [];

    const correct = {
      id: currentCharacter.id,
      character: currentCharacter.character,
      isCorrect: true,
    };

    const distractors = characters
      .filter((c) => c.id !== currentCharacter.id)
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        character: c.character,
        isCorrect: false,
      }));

    const all = [correct, ...distractors];
    return all.sort(() => Math.random() - 0.5);
  }, [currentCharacter, characters]);

  // 创建拖拽响应
  const pan = useState(new Animated.ValueXY({x: 0, y: 0}))[0];
  const [dragging, setDragging] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => {
      // 如果显示结果，不允许拖拽
      return !showResult && !showRetry;
    },
    onPanResponderGrant: () => {
      setDragging(true);
      pan.extractOffset();
      pan.setValue({x: 0, y: 0});
    },
    onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}]),
    onPanResponderRelease: (e, gesture) => {
      setDragging(false);
      pan.flattenOffset();

      // 检查拖拽位置，判断选择了哪个目标
      const screenMiddle = 200; // 屏幕中间位置
      let selectedIdx = -1;

      if (gesture.dx < -100) {
        // 向左拖拽
        selectedIdx = 0;
      } else if (gesture.dx > 100) {
        // 向右拖拽
        selectedIdx = 1;
      } else if (gesture.dy > 100) {
        // 向下拖拽
        selectedIdx = 2;
      } else if (gesture.dy < -100) {
        // 向上拖拽
        selectedIdx = 3;
      }

      if (selectedIdx >= 0 && selectedIdx < targets.length) {
        const target = targets[selectedIdx];
        const isCorrect = target.isCorrect;
        setSelectedTarget(selectedIdx);

        // 使用 handleAnswer 处理答案
        const {shouldContinue} = handleAnswer(isCorrect);

        if (isCorrect) {
          setShowResult(true);
          // 正确答案，延迟后自动进入下一题
          setTimeout(() => {
            setShowResult(false);
            setSelectedTarget(null);
            pan.setValue({x: 0, y: 0});
            goToNext();
          }, 500);
        } else if (shouldContinue) {
          // 达到错误阈值，显示结果后延迟进入下一题
          setShowResult(true);
          setTimeout(() => {
            setShowResult(false);
            setShowRetry(false);
            setSelectedTarget(null);
            pan.setValue({x: 0, y: 0});
            goToNext();
          }, 1500);
        } else {
          // 第一次错误，显示再试试选项
          setShowRetry(true);
          setTimeout(() => {
            pan.setValue({x: 0, y: 0});
          }, 200);
        }
      } else {
        // 没有拖到目标区域，重置位置
        Animated.spring(pan, {
          toValue: {x: 0, y: 0},
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // 重置并再试试
  const handleRetry = () => {
    setShowRetry(false);
    setSelectedTarget(null);
    pan.setValue({x: 0, y: 0});
  };

  // 跳过
  const handleSkip = () => {
    setShowRetry(false);
    setSelectedTarget(null);
    pan.setValue({x: 0, y: 0});
    goToNext();
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

      {/* 提示 */}
      <View style={styles.instructionSection}>
        <Text style={styles.instructionText}>
          {showRetry ? '拖错了！' : '将汉字拖动到对应的位置'}
        </Text>
      </View>

      {/* 可拖拽的汉字 */}
      <View style={styles.dragSection}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.draggableCharacter,
            {
              transform: [{translateX: pan.x}, {translateY: pan.y}],
            },
            dragging && styles.draggingCharacter,
            showResult && styles.disabledCharacter,
            showRetry && styles.disabledCharacter,
          ]}>
          <Text style={styles.characterText}>{currentCharacter.character}</Text>
          <Text style={styles.pinyinText}>{currentCharacter.pinyin}</Text>
        </Animated.View>
      </View>

      {/* 目标区域 */}
      <View style={styles.targetsContainer}>
        <View style={styles.targetsGrid}>
          {targets.map((target, index) => {
            const isCorrect = target.isCorrect;
            const showCorrect = showResult && isCorrect;
            const showWrong =
              showResult && selectedTarget === index && !isCorrect;

            return (
              <View
                key={target.id}
                style={[
                  styles.target,
                  showCorrect && styles.correctTarget,
                  showWrong && styles.wrongTarget,
                ]}>
                <View style={styles.targetContent}>
                  <Text style={styles.targetCharacter}>{target.character}</Text>
                </View>
                {showCorrect && <Text style={styles.resultIcon}>✓</Text>}
                {showWrong && <Text style={styles.resultIconWrong}>✗</Text>}
              </View>
            );
          })}
        </View>
      </View>

      {/* 再试试按钮 */}
      {showRetry && (
        <View style={styles.retrySection}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>再试试</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
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
  instructionSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  instructionText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
    fontWeight: 'bold',
  },
  dragSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  draggableCharacter: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xxxl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    ...shadow.large,
  },
  disabledCharacter: {
    opacity: 0.5,
  },
  draggingCharacter: {
    opacity: 0.8,
    transform: [{scale: 1.1}],
  },
  characterText: {
    fontSize: fontSize.xxxxxl,
    fontWeight: 'bold',
    color: colors.white,
  },
  pinyinText: {
    fontSize: fontSize.lg,
    color: colors.primaryLight,
    marginTop: spacing.sm,
  },
  targetsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  targetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'center',
  },
  target: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.medium,
  },
  correctTarget: {
    borderWidth: 4,
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  wrongTarget: {
    borderWidth: 4,
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  targetContent: {
    alignItems: 'center',
  },
  targetCharacter: {
    fontSize: fontSize.xxxxxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  resultIcon: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    fontSize: fontSize.xxl,
    color: colors.white,
    fontWeight: 'bold',
  },
  resultIconWrong: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    fontSize: fontSize.xxl,
    color: colors.white,
    fontWeight: 'bold',
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
});