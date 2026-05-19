import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {ttsService} from '../../services/ttsService';
import {soundService} from '../../services/soundService';
import {useAppStore} from '../../store/appStore';
import {Character} from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChildWelcome'>;

// 预设的卡通角色
const MASCOTS = [
  {
    id: 'mascot_1',
    name: '小哪吒',
    emoji: '🧒',
    color: '#FF6B6B',
  },
  {
    id: 'mascot_2',
    name: '小公主',
    emoji: '👧',
    color: '#4ECDC4',
  },
  {
    id: 'mascot_3',
    name: '小恐龙',
    emoji: '🦖',
    color: '#FDCB6E',
  },
];

// 游戏类型定义
type GameType = 'ImageMatchGame' | 'AudioMatchGame' | 'MemoryGame' | 'DragDropGame';

export default function ChildWelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {generateDailyReviewPool, settings, isInitialized} = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [reviewPoolReady, setReviewPoolReady] = useState(false);

  useEffect(() => {
    // 初始化音效
    soundService.initialize();

    // 欢迎语音
    setTimeout(() => {
      ttsService.speak('欢迎来到小小汉字，开始今天的学习吧！');
    }, 500);

    return () => {
      ttsService.stop();
    };
  }, []);

  const handleStartLearning = async () => {
    soundService.play('click');
    setIsLoading(true);

    try {
      // 生成今日复习字池
      const reviewPool = generateDailyReviewPool();

      if (reviewPool.total === 0) {
        // 没有需要复习的字，使用默认学习模式
        navigation.navigate('ImageMatchGame', {
          characters: [
            {
              id: '1',
              character: '我',
              pinyin: 'wǒ',
              imageUrl: 'https://via.placeholder.com/200?text=我',
            },
            {
              id: '2',
              character: '爱',
              pinyin: 'ài',
              imageUrl: 'https://via.placeholder.com/200?text=爱',
            },
            {
              id: '3',
              character: '你',
              pinyin: 'nǐ',
              imageUrl: 'https://via.placeholder.com/200?text=你',
            },
          ],
        });
      } else {
        // 开始今日复习流程，先从第一个游戏开始
        setReviewPoolReady(true);
        await startReviewFlow(reviewPool);
      }
    } catch (error) {
      console.error('生成复习字池失败:', error);
      ttsService.speak('哎呀，出了一点问题，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // 开始复习流程
  const startReviewFlow = async (reviewPool: any) => {
    // 合并易错字和普通字
    const allChars = [...reviewPool.difficultChars, ...reviewPool.regularChars];

    if (allChars.length === 0) {
      ttsService.speak('今天没有需要复习的汉字');
      return;
    }

    // 每次复习最多 10 个字，分成多个游戏轮次
    const CHARS_PER_GAME = 10;
    const currentGameChars = allChars.slice(0, CHARS_PER_GAME);

    // 从第一个游戏开始
    navigation.navigate('ImageMatchGame', {
      characters: currentGameChars,
      reviewMode: true,
      gameIndex: 0,
      totalGames: 4,
    });
  };

  const handleParentGate = () => {
    navigation.navigate('ParentGate');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 家长入口 - 隐蔽在右上角 */}
      <View style={styles.parentGateArea}>
        <TouchableOpacity
          style={styles.parentGateButton}
          onPress={handleParentGate}>
          <View style={styles.parentGateDot} />
        </TouchableOpacity>
      </View>

      {/* 主内容区 */}
      <View style={styles.content}>
        {/* 卡通角色 */}
        <View style={styles.mascotContainer}>
          <Text style={styles.mascotEmoji}>{MASCOTS[0].emoji}</Text>
          <Text style={styles.mascotName}>{MASCOTS[0].name}</Text>
        </View>

        {/* 欢迎文字 */}
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeTitle}>小小汉字</Text>
          <Text style={styles.welcomeSubtitle}>快乐识字，天天进步</Text>
        </View>

        {/* 加载状态 */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>准备复习内容...</Text>
          </View>
        ) : (
          <>
            {/* 今日学习按钮 */}
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartLearning}
              activeOpacity={0.8}>
              <Text style={styles.startButtonText}>
                {reviewPoolReady ? '继续复习' : '开始学习'}
              </Text>
              <Text style={styles.startButtonSubtext}>
                今天学习 {settings.dailyReviewCount} 个字
              </Text>
            </TouchableOpacity>

            {/* 星星进度 */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>已收集 5 颗星星</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Text key={i} style={styles.star}>⭐</Text>
                ))}
              </View>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  parentGateArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 100,
  },
  parentGateButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentGateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  mascotEmoji: {
    fontSize: 120,
    marginBottom: spacing.sm,
  },
  mascotName: {
    fontSize: fontSize.lg,
    color: colors.textLight,
    fontWeight: '600',
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  welcomeTitle: {
    fontSize: fontSize.xxxxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xxxl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadow.medium,
  },
  startButtonText: {
    fontSize: fontSize.xxxl,
    color: colors.white,
    fontWeight: 'bold',
  },
  startButtonSubtext: {
    fontSize: fontSize.md,
    color: colors.primaryLight,
    marginTop: spacing.xs,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  star: {
    fontSize: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: spacing.md,
  },
});