import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  GestureResponderEvent,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {soundService} from '../../services/soundService';
import {useAppStore} from '../../store/appStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ParentGate'>;

const LONG_PRESS_DURATION = 3000; // 3 秒长按

export default function ParentGateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {parentPassword} = useAppStore((state) => state.settings);
  const {setAppMode, setParentVerified} = useAppStore();

  const [phase, setPhase] = useState<'longPress' | 'password'>('longPress');
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const handlePressIn = () => {
    if (phase !== 'longPress') return;

    setIsPressing(true);
    setError('');

    // 进度条动画
    let progress = 0;
    progressInterval.current = setInterval(() => {
      progress += 100;
      setPressProgress(progress);
      if (progress >= 100) {
        clearInterval(progressInterval.current!);
      }
    }, LONG_PRESS_DURATION / 100);

    // 长按计时器
    pressTimer.current = setTimeout(() => {
      setIsPressing(false);
      setPhase('password');
      clearInterval(progressInterval.current!);
    }, LONG_PRESS_DURATION);
  };

  const handlePressOut = () => {
    if (phase !== 'longPress') return;

    setIsPressing(false);
    setPressProgress(0);

    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === parentPassword) {
      soundService.play('correct');
      setAppMode('parent');
      setParentVerified(true);
      navigation.reset({
        index: 0,
        routes: [{name: 'ParentDashboard'}],
      });
    } else {
      soundService.play('wrong');
      setError('密码错误，请重试');
      setPassword('');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleBackToPress = () => {
    setPhase('longPress');
    setPassword('');
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {phase === 'longPress' ? (
          <>
            <Text style={styles.title}>长按下方按钮进入家长模式</Text>
            <Text style={styles.subtitle}>防止小朋友误操作</Text>

            <TouchableOpacity
              style={[styles.longPressButton, isPressing && styles.pressing]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={1}>
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {width: `${pressProgress}%`},
                  ]}
                />
              </View>
              <Text style={styles.buttonText}>
                {isPressing ? '继续按住...' : '长按 3 秒'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>请输入家长密码</Text>
            <Text style={styles.subtitle}>默认密码：1234</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handlePasswordSubmit}
                placeholder="输入密码"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.toggleText}>{showPassword ? '隐藏' : '显示'}</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handlePasswordSubmit}>
              <Text style={styles.confirmButtonText}>确认</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBackToPress}>
              <Text style={styles.cancelText}>返回</Text>
            </TouchableOpacity>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  longPressButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.xxl,
    ...shadow.large,
  },
  pressing: {
    transform: [{scale: 0.95}],
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: fontSize.xl,
    color: colors.white,
    fontWeight: 'bold',
    zIndex: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  passwordInput: {
    flex: 1,
    height: 60,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.xxxl,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
  },
  toggleButton: {
    marginLeft: spacing.md,
  },
  toggleText: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    marginBottom: spacing.lg,
    ...shadow.medium,
  },
  confirmButtonText: {
    fontSize: fontSize.xl,
    color: colors.white,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: spacing.md,
  },
  cancelText: {
    fontSize: fontSize.md,
    color: colors.textLight,
  },
});