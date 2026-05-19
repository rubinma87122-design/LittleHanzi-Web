import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {useAppStore} from '../../store/appStore';
import {ebbinghausManager} from '../../utils/ebbinghaus';
import {Character} from '../../types';

type NavigationProp = any;

export default function ReviewSchedule() {
  const navigation = useNavigation<NavigationProp>();
  const {groups} = useAppStore();

  // 获取所有汉字
  const allCharacters = React.useMemo(() => {
    const chars: Character[] = [];

    groups.forEach(group => {
      if (group.characters) {
        group.characters.forEach(char => {
          chars.push({
            id: char.id,
            character: char.character,
            pinyin: char.pinyin,
            imageUrl: char.imageUrl,
            groupId: group.id,
            createdAt: char.createdAt || new Date(),
            isLearned: char.isLearned,
            masteryLevel: char.masteryLevel || 'unknown',
            studyCount: char.studyCount,
            correctCount: char.correctCount,
            totalErrorCount: char.totalErrorCount || 0,
            lastReviewErrors: char.lastReviewErrors || 0,
            isDifficult: char.isDifficult || false,
          });
        });
      }
    });

    return chars;
  }, [groups]);

  const reviewStats = ebbinghausManager.getReviewStats(allCharacters);

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部统计 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>复习计划</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 统计概览 */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, styles.statDotUrgent]} />
              <Text style={styles.statLabel}>紧急</Text>
              <Text style={styles.statValue}>{reviewStats.urgent}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, styles.statDotImportant]} />
              <Text style={styles.statLabel}>重要</Text>
              <Text style={styles.statValue}>{reviewStats.important}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, styles.statDotNormal]} />
              <Text style={styles.statLabel}>正常</Text>
              <Text style={styles.statValue}>{reviewStats.normal}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, styles.statDotCompleted]} />
              <Text style={styles.statLabel}>已完成</Text>
              <Text style={styles.statValue}>{reviewStats.completed}</Text>
            </View>
          </View>
          <View style={styles.masteryContainer}>
            <Text style={styles.masteryLabel}>平均掌握度</Text>
            <Text style={styles.masteryValue}>
              {reviewStats.averageMastery.toFixed(0)}%
            </Text>
            <View style={styles.masteryBar}>
              <View
                style={[
                  styles.masteryFill,
                  {width: `${reviewStats.averageMastery}%`},
                ]}
              />
            </View>
          </View>
        </View>

        {/* 艾宾浩斯遗忘曲线说明 */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📖 艾宾浩斯遗忘曲线</Text>
          <Text style={styles.infoText}>
            根据科学记忆规律，在特定时间点复习可以有效巩固记忆。
          </Text>
          <View style={styles.scheduleList}>
            <Text style={styles.scheduleItem}>• 首次复习：学习后第 1 天</Text>
            <Text style={styles.scheduleItem}>• 第二次复习：学习后第 2 天</Text>
            <Text style={styles.scheduleItem}>• 第三次复习：学习后第 4 天</Text>
            <Text style={styles.scheduleItem}>• 后续复习：第 7、15、30、60、90 天</Text>
          </View>
        </View>

        {/* 开始复习按钮 */}
        {reviewStats.urgent + reviewStats.important > 0 ? (
          <TouchableOpacity style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>
              开始复习 ({reviewStats.urgent + reviewStats.important} 字)
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.noReviewContainer}>
            <Text style={styles.noReviewEmoji}>✨</Text>
            <Text style={styles.noReviewText}>太棒了！暂时没有需要复习的汉字</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: colors.card,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadow.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  statDotUrgent: {
    backgroundColor: colors.error,
  },
  statDotImportant: {
    backgroundColor: colors.warning,
  },
  statDotNormal: {
    backgroundColor: colors.info,
  },
  statDotCompleted: {
    backgroundColor: colors.success,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  masteryContainer: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  masteryLabel: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  masteryValue: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  masteryBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  masteryFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  infoContainer: {
    backgroundColor: colors.card,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadow.medium,
  },
  infoTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginBottom: spacing.md,
    lineHeight: fontSize.md * 1.5,
  },
  scheduleList: {
    gap: spacing.sm,
  },
  scheduleItem: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: fontSize.md * 1.6,
  },
  reviewButton: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    borderRadius: borderRadius.xxxl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    ...shadow.large,
  },
  reviewButtonText: {
    fontSize: fontSize.xl,
    color: colors.white,
    fontWeight: 'bold',
  },
  noReviewContainer: {
    backgroundColor: colors.card,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  noReviewEmoji: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  noReviewText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
    textAlign: 'center',
  },
});