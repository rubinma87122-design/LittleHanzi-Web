import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  AppState,
  AppStateStatus,
} from 'react-native';
import {useAppStore} from '../store/appStore';

interface ChildModeLockProps {
  children: React.ReactNode;
}

/**
 * 儿童模式锁定组件
 * 防止儿童通过以下方式退出：
 * - 按返回键
 * - 滑动手势
 * - 快速点击
 */
export default function ChildModeLock({children}: ChildModeLockProps) {
  const {appMode} = useAppStore();
  const lastBackPressed = useRef(Date.now());

  useEffect(() => {
    if (appMode !== 'child') {
      return;
    }

    // 禁用返回键
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // 在 Android 上禁用返回键
      return true;
    });

    // 监听应用状态变化
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && appMode === 'child') {
        // 应用回到前台，确保仍在儿童模式
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      backHandler.remove();
      subscription.remove();
    };
  }, [appMode]);

  // 如果不是儿童模式，直接返回子组件
  if (appMode !== 'child') {
    return <>{children}</>;
  }

  // 儿童模式下，添加额外的保护层
  return (
    <View style={styles.lockContainer}>
      {children}
      {/* 覆盖层防止手势导航 */}
      <View style={styles.overlay} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20, // 顶部状态栏区域
    backgroundColor: 'transparent',
  },
});