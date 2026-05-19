import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {useAppStore} from '../../store/appStore';

export default function Settings() {
  const {settings, updateSettings} = useAppStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState(settings.parentPassword);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [ocrApiKey, setOCRApiKey] = useState(settings.ocrApiKey || '');

  const dailyReviewOptions = [5, 10, 15, 20];

  const handleDailyReviewChange = (count: number) => {
    updateSettings({dailyReviewCount: count});
  };

  const handlePasswordUpdate = () => {
    if (newPassword.length < 4) {
      Alert.alert('提示', '密码至少需要4位');
      return;
    }
    updateSettings({parentPassword: newPassword});
    setShowPasswordModal(false);
    Alert.alert('成功', '密码已更新');
  };

  const handleOCRKeySave = () => {
    updateSettings({ocrApiKey: ocrApiKey});
    setShowOCRModal(false);
    Alert.alert('成功', 'OCR API Key 已保存');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 学习设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>学习设置</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>每日复习字数</Text>
          <View style={styles.optionsRow}>
            {dailyReviewOptions.map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.optionButton,
                  settings.dailyReviewCount === count &&
                    styles.optionButtonActive,
                ]}
                onPress={() => handleDailyReviewChange(count)}>
                <Text
                  style={[
                    styles.optionText,
                    settings.dailyReviewCount === count &&
                      styles.optionTextActive,
                  ]}>
                  {count}字
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* 安全设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>安全设置</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowPasswordModal(true)}>
          <View style={styles.cardRow}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>家长密码</Text>
              <Text style={styles.cardHint}>用于进入家长模式</Text>
            </View>
            <Text style={styles.cardValue}>••••</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* API 设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API 设置</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowOCRModal(true)}>
          <View style={styles.cardRow}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>百度 OCR API Key</Text>
              <Text style={styles.cardHint}>用于拍照识别汉字</Text>
            </View>
            <Text style={styles.cardValue}>
              {settings.ocrApiKey ? '已配置' : '未配置'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 关于 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle}>版本</Text>
            <Text style={styles.cardValue}>v1.0.0</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle}>开发者</Text>
            <Text style={styles.cardValue}>LittleHanzi Team</Text>
          </View>
        </View>
      </View>

      {/* 密码修改弹窗 */}
      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>修改家长密码</Text>
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="输入新密码（至少4位）"
              keyboardType="number-pad"
              maxLength={6}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowPasswordModal(false);
                  setNewPassword(settings.parentPassword);
                }}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handlePasswordUpdate}>
                <Text style={styles.modalConfirmText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* OCR API Key 弹窗 */}
      <Modal visible={showOCRModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>配置百度 OCR API</Text>
            <Text style={styles.modalHint}>
              请在百度云控制台申请 OCR API Key
            </Text>
            <TextInput
              style={styles.modalInput}
              value={ocrApiKey}
              onChangeText={setOCRApiKey}
              placeholder="输入 API Key"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowOCRModal(false);
                  setOCRApiKey(settings.ocrApiKey || '');
                }}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleOCRKeySave}>
                <Text style={styles.modalConfirmText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.medium,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardHint: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
  },
  cardValue: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: 'bold',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.textLight,
    fontWeight: 'bold',
  },
  optionTextActive: {
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalHint: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: 'bold',
  },
});