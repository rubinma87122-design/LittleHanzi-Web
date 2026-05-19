import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {useAppStore} from '../../store/appStore';

type NavigationProp = any;

export default function ParentDashboard() {
  const navigation = useNavigation<NavigationProp>();
  const {groups, todayStudyCount, todayCorrectCount, setAppMode} = useAppStore();

  const handleCharacterLibrary = () => {
    navigation.navigate('CharacterLibrary');
  };

  const handleOCRScanner = () => {
    navigation.navigate('OCRScanner');
  };

  const handleManualInput = () => {
    navigation.navigate('ManualInput');
  };

  const handleStatistics = () => {
    navigation.navigate('Statistics');
  };

  const handleReviewSchedule = () => {
    navigation.navigate('ReviewSchedule');
  };

  const handleDifficultStats = () => {
    navigation.navigate('DifficultCharsStats');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleExitParentMode = () => {
    setAppMode('child');
    navigation.reset({
      index: 0,
      routes: [{name: 'ChildWelcome'}],
    });
  };

  const accuracy = todayStudyCount > 0
    ? (todayCorrectCount / todayStudyCount * 100).toFixed(0)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 今日概览 */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>今日学习概览</Text>
          <View style={styles.overviewCard}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{todayStudyCount}</Text>
              <Text style={styles.overviewLabel}>今日学习</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{accuracy}%</Text>
              <Text style={styles.overviewLabel}>正确率</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{groups.length}</Text>
              <Text style={styles.overviewLabel}>分组数</Text>
            </View>
          </View>
        </View>

        {/* 功能菜单 */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>功能菜单</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleCharacterLibrary}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>📚</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>字库管理</Text>
              <Text style={styles.menuSubtitle}>管理已录入的汉字</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleOCRScanner}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>📷</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>拍照识字</Text>
              <Text style={styles.menuSubtitle}>拍摄图片自动识别汉字</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleManualInput}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>✏️</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>手动输入</Text>
              <Text style={styles.menuSubtitle}>拼音输入或语音录入</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleStatistics}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>📊</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>学习统计</Text>
              <Text style={styles.menuSubtitle}>查看学习记录和报告</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleReviewSchedule}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>📅</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>复习计划</Text>
              <Text style={styles.menuSubtitle}>查看艾宾浩斯复习安排</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDifficultStats}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>⚠️</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>易错字统计</Text>
              <Text style={styles.menuSubtitle}>查看易错字排行和分析</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSettings}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>⚙️</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>设置</Text>
              <Text style={styles.menuSubtitle}>应用设置和偏好</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 退出按钮 */}
        <TouchableOpacity
          style={styles.exitButton}
          onPress={handleExitParentMode}>
          <Text style={styles.exitButtonText}>退出家长模式</Text>
        </TouchableOpacity>
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
  overviewSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadow.medium,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  overviewLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    backgroundColor: colors.divider,
  },
  menuSection: {
    padding: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.medium,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIconText: {
    fontSize: 28,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  menuArrow: {
    fontSize: fontSize.xxxl,
    color: colors.textMuted,
  },
  exitButton: {
    margin: spacing.lg,
    backgroundColor: colors.error,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadow.medium,
  },
  exitButtonText: {
    fontSize: fontSize.lg,
    color: colors.white,
    fontWeight: 'bold',
  },
});