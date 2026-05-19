import React from 'react';
import {View, Text, StyleSheet, SafeAreaView, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {useAppStore} from '../../store/appStore';

type NavigationProp = any;

export default function Statistics() {
  const navigation = useNavigation<NavigationProp>();
  const {groups, todayStudyCount, todayCorrectCount} = useAppStore();

  // 计算统计数据
  const totalGroups = groups.length;
  const totalCharacters = groups.reduce(
    (sum, g) => sum + (g.characters?.length || 0),
    0,
  );
  const learnedCharacters = groups.reduce(
    (sum, g) =>
      sum + (g.characters?.filter((c) => c.isLearned).length || 0),
    0,
  );
  const accuracy =
    todayStudyCount > 0
      ? ((todayCorrectCount / todayStudyCount) * 100).toFixed(0)
      : 0;

  // 模拟易错字排行
  const errorRanking = [
    {character: '不', errorCount: 5},
    {character: '这', errorCount: 3},
    {character: '那', errorCount: 2},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 今日统计 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日学习</Text>
          <View style={styles.todayCard}>
            <View style={styles.todayItem}>
              <Text style={styles.todayValue}>{todayStudyCount}</Text>
              <Text style={styles.todayLabel}>学习字数</Text>
            </View>
            <View style={styles.todayDivider} />
            <View style={styles.todayItem}>
              <Text style={styles.todayValue}>{accuracy}%</Text>
              <Text style={styles.todayLabel}>正确率</Text>
            </View>
            <View style={styles.todayDivider} />
            <View style={styles.todayItem}>
              <Text style={styles.todayValue}>{todayCorrectCount}</Text>
              <Text style={styles.todayLabel}>正确次数</Text>
            </View>
          </View>
        </View>

        {/* 总体统计 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>总体统计</Text>
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>总分组数</Text>
              <Text style={styles.totalValue}>{totalGroups}</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>总汉字数</Text>
              <Text style={styles.totalValue}>{totalCharacters}</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>已掌握</Text>
              <Text style={[styles.totalValue, styles.learnedValue]}>
                {learnedCharacters}
              </Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>待复习</Text>
              <Text style={styles.totalValue}>
                {totalCharacters - learnedCharacters}
              </Text>
            </View>
          </View>
        </View>

        {/* 易错字排行 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>易错字排行</Text>
          <View style={styles.rankingCard}>
            {errorRanking.length > 0 ? (
              errorRanking.map((item, index) => (
                <View key={item.character} style={styles.rankingItem}>
                  <View style={styles.rankingRank}>
                    <Text
                      style={[
                        styles.rankingRankText,
                        index === 0 && styles.rankingFirst,
                      ]}>
                      #{index + 1}
                    </Text>
                  </View>
                  <Text style={styles.rankingCharacter}>{item.character}</Text>
                  <Text style={styles.rankingCount}>
                    错 {item.errorCount} 次
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无数据</Text>
              </View>
            )}
          </View>
        </View>

        {/* 分组统计 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>分组详情</Text>
          <View style={styles.groupsCard}>
            {groups.map((group) => (
              <View key={group.id} style={styles.groupItem}>
                <View style={styles.groupLeft}>
                  <Text style={styles.groupDate}>{group.name}</Text>
                  {group.note && (
                    <Text style={styles.groupNote}>{group.note}</Text>
                  )}
                </View>
                <Text style={styles.groupCount}>
                  {group.characters?.length || 0} 字
                </Text>
              </View>
            ))}
            {groups.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无分组</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  todayCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadow.medium,
  },
  todayItem: {
    flex: 1,
    alignItems: 'center',
  },
  todayValue: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  todayLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  todayDivider: {
    width: 1,
    backgroundColor: colors.divider,
  },
  totalCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadow.medium,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  totalDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  totalLabel: {
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  learnedValue: {
    color: colors.success,
  },
  rankingCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadow.medium,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rankingRank: {
    width: 50,
  },
  rankingRankText: {
    fontSize: fontSize.md,
    color: colors.textLight,
    fontWeight: 'bold',
  },
  rankingFirst: {
    color: colors.primary,
    fontSize: fontSize.lg,
  },
  rankingCharacter: {
    flex: 1,
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  rankingCount: {
    fontSize: fontSize.sm,
    color: colors.error,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  groupsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadow.medium,
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  groupLeft: {
    flex: 1,
  },
  groupDate: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: 'bold',
  },
  groupNote: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  groupCount: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: 'bold',
  },
});