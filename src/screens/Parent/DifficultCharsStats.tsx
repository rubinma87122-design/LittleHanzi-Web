import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {useAppStore} from '../../store/appStore';

export default function DifficultCharsStats() {
  const {groups, dailyDifficultChars} = useAppStore();

  // 获取所有易错字
  const allDifficultChars = useMemo(() => {
    const chars: Array<{
      id: string;
      character: string;
      pinyin: string;
      groupId: string;
      groupName: string;
      totalErrorCount: number;
      lastReviewDate?: Date;
      lastReviewErrors: number;
      accuracy: number;
    }> = [];

    groups.forEach(group => {
      if (group.characters) {
        group.characters.forEach(char => {
          if (char.isDifficult) {
            const accuracy =
              char.studyCount > 0
                ? (char.correctCount / char.studyCount) * 100
                : 0;
            chars.push({
              id: char.id,
              character: char.character,
              pinyin: char.pinyin,
              groupId: group.id,
              groupName: group.name,
              totalErrorCount: char.totalErrorCount,
              lastReviewDate: char.lastReviewDate,
              lastReviewErrors: char.lastReviewErrors || 0,
              accuracy,
            });
          }
        });
      }
    });

    // 按错误次数排序
    chars.sort((a, b) => b.totalErrorCount - a.totalErrorCount);
    return chars;
  }, [groups]);

  // 获取今日易错字
  const todayDifficultChars = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allDifficultChars.filter(char => {
      const lastReview = char.lastReviewDate;
      return (
        lastReview && lastReview.toISOString().split('T')[0] === today
      );
    });
  }, [allDifficultChars]);

  // 获取易错字统计
  const stats = useMemo(() => {
    return {
      total: allDifficultChars.length,
      today: todayDifficultChars.length,
      avgAccuracy:
        allDifficultChars.length > 0
          ? allDifficultChars.reduce((sum, c) => sum + c.accuracy, 0) /
            allDifficultChars.length
          : 0,
      highErrorCount: allDifficultChars.filter(c => c.totalErrorCount >= 5).length,
    };
  }, [allDifficultChars, todayDifficultChars]);

  const renderDifficultyBadge = (errorCount: number) => {
    if (errorCount >= 5) {
      return (
        <View style={[styles.badge, styles.badgeRed]}>
          <Text style={styles.badgeText}>{errorCount}次</Text>
        </View>
      );
    } else if (errorCount >= 3) {
      return (
        <View style={[styles.badge, styles.badgeOrange]}>
          <Text style={styles.badgeText}>{errorCount}次</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badge, styles.badgeYellow]}>
        <Text style={styles.badgeText}>{errorCount}次</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 统计概览 */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>易错字总数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.statNumberToday]}>
              {stats.today}
            </Text>
            <Text style={styles.statLabel}>今日新增</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statAccuracy,
                stats.avgAccuracy >= 60 && styles.statAccuracyMedium,
                stats.avgAccuracy >= 80 && styles.statAccuracyGood,
              ]}>
              {stats.avgAccuracy.toFixed(0)}%
            </Text>
            <Text style={styles.statLabel}>平均正确率</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.highErrorCount}</Text>
            <Text style={styles.statLabel}>高频错误</Text>
          </View>
        </View>
      </View>

      {/* 今日易错字 */}
      {todayDifficultChars.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📌 今日易错字</Text>
          <View style={styles.todayList}>
            {todayDifficultChars.map(char => (
              <View key={char.id} style={styles.charItem}>
                <Text style={styles.charText}>{char.character}</Text>
                <Text style={styles.charPinyin}>{char.pinyin}</Text>
                {renderDifficultyBadge(char.lastReviewErrors)}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 全部易错字排行 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          📊 易错字排行榜 ({allDifficultChars.length})
        </Text>
        <View style={styles.charList}>
          {allDifficultChars.map((char, index) => (
            <View key={char.id} style={styles.charCard}>
              <View style={styles.charLeft}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View>
                  <Text style={styles.charText}>{char.character}</Text>
                  <Text style={styles.charPinyin}>{char.pinyin}</Text>
                  <Text style={styles.charGroup}>{char.groupName}</Text>
                </View>
              </View>
              <View style={styles.charRight}>
                {renderDifficultyBadge(char.totalErrorCount)}
                <Text style={styles.accuracyText}>
                  准确率 {char.accuracy.toFixed(0)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {allDifficultChars.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyText}>暂无易错字</Text>
          <Text style={styles.emptyHint}>继续保持！</Text>
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
  statsContainer: {
    backgroundColor: colors.card,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadow.medium,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statNumberToday: {
    color: colors.error,
  },
  statAccuracy: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.error,
  },
  statAccuracyMedium: {
    color: colors.warning,
  },
  statAccuracyGood: {
    color: colors.success,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.divider,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  todayList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  charItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadow.small,
  },
  charText: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.xs,
  },
  charPinyin: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginRight: spacing.sm,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeRed: {
    backgroundColor: colors.error,
  },
  badgeOrange: {
    backgroundColor: colors.warning,
  },
  badgeYellow: {
    backgroundColor: colors.warning,
    opacity: 0.7,
  },
  badgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
  },
  charList: {
    gap: spacing.md,
  },
  charCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadow.medium,
  },
  charLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: 'bold',
  },
  charGroup: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  charRight: {
    alignItems: 'flex-end',
  },
  accuracyText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.xl,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: fontSize.md,
    color: colors.textLight,
  },
});