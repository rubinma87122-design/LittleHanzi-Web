import {StyleSheet} from 'react-native';

export const colors = {
  // 主色调 - 温暖明亮
  primary: '#FF6B6B',
  primaryLight: '#FF8E8E',
  primaryDark: '#E55A5A',

  // 次要色 - 柔和
  secondary: '#4ECDC4',
  secondaryLight: '#7EE7E0',
  secondaryDark: '#3DB8B0',

  // 背景色
  background: '#FFF5F0',
  backgroundLight: '#FFFEFD',
  card: '#FFFFFF',

  // 文字颜色
  text: '#2D3436',
  textLight: '#636E72',
  textMuted: '#B2BEC3',
  white: '#FFFFFF',

  // 状态色
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#FF7675',
  info: '#74B9FF',

  // 游戏相关
  correct: '#00CEC9',
  wrong: '#FF7675',
  highlight: '#FDCB6E',

  // 边框和分割线
  border: '#DFE6E9',
  divider: '#F1F2F6',

  // 阴影
  shadow: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  round: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 60, // 大字体适合幼儿
  xxxxxl: 80, // 汉字显示
} as const;

export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
} as const;

export const shadow = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadow.medium,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60, // 大按钮适合幼儿
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
  largeText: {
    fontSize: fontSize.xxxl, // 适合幼儿的大字体
    fontWeight: 'bold',
    color: colors.text,
  },
  characterDisplay: {
    fontSize: fontSize.xxxxxl, // 大字体展示汉字
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    lineHeight: fontSize.xxxxxl * 1.2,
  },
  pinyinDisplay: {
    fontSize: fontSize.xxl,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexColumn: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  absolute: {
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});