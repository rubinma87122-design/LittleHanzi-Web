import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {ttsService} from '../../services/ttsService';
import {soundService} from '../../services/soundService';
import {useAppStore} from '../../store/appStore';
import {reviewService} from '../../services/reviewService';

interface Props {
  route: {
    params: {
      score: number;
      stars: number;
      totalQuestions: number;
    };
  };
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReviewCompleteScreen'>;

export default function ReviewCompleteScreen({route}: Props) {
  const navigation = useNavigation<NavigationProp>();
  const {saveAllData, groups} = useAppStore();
  const {score, stars, totalQuestions} = route.params;

  const accuracy = totalQuestions > 0 ? (stars / totalQuestions) * 100 : 0;

  useEffect(() => {
    // 保存今日复习数据，包括易错字
    const saveTodayData = async () => {
      try {
        // 使用 reviewService 完成每日复习并保存易错字
        const todayDifficultChars = reviewService.completeDailyReview();

        // 保存所有数据到本地存储
        await saveAllData();

        console.log('今日易错字:', todayDifficultChars);

        // 根据表现播报语音
        if (todayDifficultChars.characters.length > 0) {
          ttsService.speak(
            `太棒了！今天复习了 ${totalQuestions} 个字，有 ${todayDifficultChars.characters.length} 个字明天要重点复习哦！`,
          );
        } else {
          ttsService.speak('太厉害了！今天所有字都掌握了，明天继续加油！');
        }
      } catch (error) {
        console.error('保存今日数据失败:', error);
      }
    };

    saveTodayData();

    // 播放完成音效
    soundService.play('gameComplete');

    return () => {
      ttsService.stop();
    };
  }, [score, stars, totalQuestions, groups, saveAllData]);

  const handleBackToHome = () => {
    soundService.play('click');
    navigation.reset({
      index: 0,
      routes: [{name: 'ChildWelcome'}],
    });
  };

  const handlePlayAgain = () => {
    soundService.play('click');
    navigation.reset({
      index: 0,
      routes: [{name: 'ChildWelcome'}],
    });
  };

  const commentText =
    accuracy >= 90
      ? '太棒了！你今天表现非常好！'
      : accuracy >= 70
      ? '不错！继续加油！'
      : '没关系，再试一次吧！';

  return (
    <SafeAreaView style={styles.container}>
      {/* 庆祝动画区域 */}
      <View style={styles.celebrationSection}>
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <Text style={styles.congratulationsText}>今日复习完成！</Text>
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
        <Text style={styles.commentText}>{commentText}</Text>
      </View>

      {/* 提示文字 */}
      <View style={styles.hintSection}>
        <Text style={styles.hintText}>💡 明天复习会包含今天学过的字哦</Text>
      </View>

      {/* 按钮组 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePlayAgain}>
          <Text style={styles.primaryButtonText}>完成</Text>
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
  hintSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  hintText: {
    fontSize: fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.lg,
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
});
