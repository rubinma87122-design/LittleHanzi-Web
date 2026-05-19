import React from 'react';
import {View, Text, StyleSheet, SafeAreaView, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';

interface Props {
  route: {
    params: {
      score: number;
      stars: number;
      totalQuestions: number;
      reviewMode?: boolean;
      gameIndex?: number;
      totalGames?: number;
      characters?: any[];
    };
  };
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResultScreen'>;

// 游戏类型顺序
const GAMES_ORDER: (keyof RootStackParamList)[] = [
  'ImageMatchGame',
  'AudioMatchGame',
  'MemoryGame',
  'DragDropGame',
];

export default function ResultScreen({route}: Props) {
  const navigation = useNavigation<NavigationProp>();
  const {
    score,
    stars,
    totalQuestions,
    reviewMode = false,
    gameIndex = 0,
    totalGames = 1,
    characters = [],
  } = route.params;

  const accuracy = totalQuestions > 0 ? (stars / totalQuestions) * 100 : 0;

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'ChildWelcome'}],
    });
  };

  const handlePlayAgain = () => {
    // 如果是复习模式且还有未完成的游戏，进入下一关
    if (reviewMode && gameIndex < totalGames - 1) {
      const nextGameName = GAMES_ORDER[gameIndex + 1];
      if (nextGameName) {
        navigation.navigate(nextGameName as any, {
          characters,
          reviewMode: true,
          gameIndex: gameIndex + 1,
          totalGames,
        });
      }
    } else if (reviewMode && gameIndex >= totalGames - 1) {
      // 复习模式全部完成，进入完成界面
      let totalScore = score;
      let totalStars = stars;
      let totalQuestionsAll = totalQuestions;

      // 累加之前关卡的成绩
      navigation.getParent()?.getState()?.routes.forEach(route => {
        if (route.params && typeof route.params === 'object') {
          const params = route.params as any;
          if (params.score) totalScore += params.score;
          if (params.stars) totalStars += params.stars;
          if (params.totalQuestions) totalQuestionsAll += params.totalQuestions;
        }
      });

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'ReviewCompleteScreen',
            params: {
              score: totalScore,
              stars: totalStars,
              totalQuestions: totalQuestionsAll,
            },
          },
        ],
      });
    } else {
      // 普通模式，重新玩同一关
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 庆祝动画区域 */}
      <View style={styles.celebrationSection}>
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <Text style={styles.congratulationsText}>恭喜完成！</Text>
      </View>

      {/* 成绩卡片 */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>得分</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>获得星星</Text>
          <View style={styles.starsContainer}>
            {[...Array(Math.min(stars, 10))].map((_, i) => (
              <Text key={i} style={styles.star}>⭐</Text>
            ))}
          </View>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>正确率</Text>
          <Text style={styles.scoreValue}>{accuracy.toFixed(0)}%</Text>
        </View>
      </View>

      {/* 评价文字 */}
      <View style={styles.commentSection}>
        <Text style={styles.commentText}>
          {accuracy >= 90
            ? '太棒了！你今天表现非常好！'
            : accuracy >= 70
            ? '不错！继续加油！'
            : '没关系，再试一次吧！'}
        </Text>
      </View>

      {/* 按钮组 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePlayAgain}>
          <Text style={styles.primaryButtonText}>
            {reviewMode && gameIndex < totalGames - 1
              ? '下一关'
              : reviewMode && gameIndex >= totalGames - 1
              ? '查看总结'
              : '再玩一次'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBackToHome}>
          <Text style={styles.secondaryButtonText}>返回首页</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  celebrationSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  celebrationEmoji: {
    fontSize: 100,
    marginBottom: spacing.md,
  },
  congratulationsText: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scoreCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    ...shadow.large,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  scoreLabel: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
  scoreValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  star: {
    fontSize: 24,
  },
  commentSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  commentText: {
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadow.medium,
  },
  primaryButtonText: {
    fontSize: fontSize.xl,
    color: colors.white,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontWeight: 'bold',
  },
});