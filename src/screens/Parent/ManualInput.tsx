import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {useAppStore} from '../../store/appStore';
import {voiceService} from '../../services/voiceService';
import {findCharactersByPinyin, getPinyin} from '../../utils/pinyinUtils';

type NavigationProp = any;

// 常用汉字列表（示例）
const COMMON_CHARS = [
  '我', '你', '他', '她', '爱', '家', '人', '大', '小', '多', '少',
  '好', '不', '是', '的', '了', '和', '有', '在', '这', '那',
];

export default function ManualInput() {
  const navigation = useNavigation<NavigationProp>();
  const {addGroup, addCharacter} = useAppStore();

  const [inputMethod, setInputMethod] = useState<'pinyin' | 'voice'>('pinyin');
  const [pinyinInput, setPinyinInput] = useState('');
  const [pinyinResults, setPinyinResults] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedChars, setSelectedChars] = useState<Set<string>>(new Set());

  const handleSearch = () => {
    if (!pinyinInput.trim()) {
      Alert.alert('提示', '请输入拼音');
      return;
    }

    const results = findCharactersByPinyin(pinyinInput.trim());
    if (results.length > 0) {
      setPinyinResults(results);
    } else {
      Alert.alert('提示', '未找到匹配的汉字');
      setPinyinResults([]);
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      await voiceService.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      try {
        await voiceService.startListening(
          (text) => {
            // 提取汉字
            const chars = Array.from(new Set(text.split(''))).filter(
              (char) => /[\u4e00-\u9fa5]/.test(char),
            );
            chars.forEach((char) => {
              const newSelected = new Set(selectedChars);
              if (!newSelected.has(char)) {
                newSelected.add(char);
                setSelectedChars(newSelected);
              }
            });
            setIsRecording(false);
          },
          (error) => {
            Alert.alert('语音识别失败', error);
            setIsRecording(false);
          },
        );
      } catch (error) {
        Alert.alert('错误', '启动语音识别失败');
        setIsRecording(false);
      }
    }
  };

  const handleAddChar = (char: string) => {
    const newSelected = new Set(selectedChars);
    if (newSelected.has(char)) {
      newSelected.delete(char);
    } else {
      newSelected.add(char);
    }
    setSelectedChars(newSelected);
  };

  const handleClearAll = () => {
    setSelectedChars(new Set());
  };

  const handleSave = () => {
    if (selectedChars.size === 0) {
      Alert.alert('提示', '请至少选择一个汉字');
      return;
    }

    // 创建今日分组
    const today = new Date().toISOString().split('T')[0];
    const groupId = `group_${Date.now()}`;

    addGroup({
      id: groupId,
      name: today,
      note: inputMethod === 'pinyin' ? '拼音输入' : '语音录入',
      createdAt: new Date(),
    });

    // 添加汉字
    selectedChars.forEach((char) => {
      addCharacter({
        id: `char_${Date.now()}_${Math.random()}`,
        character: char,
        pinyin: getPinyin(char),
        groupId,
        createdAt: new Date(),
        isLearned: false,
        masteryLevel: 'unknown',
        studyCount: 0,
        correctCount: 0,
        totalErrorCount: 0,
        lastReviewErrors: 0,
        isDifficult: false,
      });
    });

    Alert.alert('成功', `已保存 ${selectedChars.size} 个汉字`, [
      {
        text: '确定',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleCancel = () => {
    if (selectedChars.size > 0) {
      Alert.alert('提示', '确定要退出吗？已选择的汉字将不会保存。', [
        {text: '继续编辑', style: 'cancel'},
        {
          text: '退出',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 输入方式切换 */}
      <View style={styles.methodToggle}>
        <TouchableOpacity
          style={[
            styles.methodButton,
            inputMethod === 'pinyin' && styles.methodButtonActive,
          ]}
          onPress={() => setInputMethod('pinyin')}>
          <Text
            style={[
              styles.methodButtonText,
              inputMethod === 'pinyin' && styles.methodButtonTextActive,
            ]}>
            拼音输入
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.methodButton,
            inputMethod === 'voice' && styles.methodButtonActive,
          ]}
          onPress={() => setInputMethod('voice')}>
          <Text
            style={[
              styles.methodButtonText,
              inputMethod === 'voice' && styles.methodButtonTextActive,
            ]}>
            语音输入
          </Text>
        </TouchableOpacity>
      </View>

      {/* 输入区域 */}
      <View style={styles.inputSection}>
        {inputMethod === 'pinyin' ? (
          <View style={styles.pinyinInputContainer}>
            <TextInput
              style={styles.pinyinInput}
              value={pinyinInput}
              onChangeText={setPinyinInput}
              placeholder="输入拼音（如：wo ai ni）"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}>
              <Text style={styles.searchButtonText}>查询</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.voiceButton,
              isRecording && styles.voiceButtonRecording,
            ]}
            onPress={handleVoiceRecord}>
            <Text style={styles.voiceEmoji}>
              {isRecording ? '🎤' : '🎙️'}
            </Text>
            <Text style={styles.voiceText}>
              {isRecording ? '正在录音...' : '点击开始录音'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 常用汉字选择 */}
      <View style={styles.charsSection}>
        <Text style={styles.sectionTitle}>常用汉字</Text>
        <ScrollView style={styles.charsGrid}>
          <View style={styles.charsRow}>
            {COMMON_CHARS.map((char) => {
              const isSelected = selectedChars.has(char);
              return (
                <TouchableOpacity
                  key={char}
                  style={[
                    styles.charCard,
                    isSelected && styles.charCardSelected,
                  ]}
                  onPress={() => handleAddChar(char)}>
                  <Text style={styles.charText}>{char}</Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 已选择列表 */}
      {selectedChars.size > 0 && (
        <View style={styles.selectedSection}>
          <View style={styles.selectedHeader}>
            <Text style={styles.selectedTitle}>
              已选择 {selectedChars.size} 个字
            </Text>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearText}>清空</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.selectedGrid}>
            {Array.from(selectedChars).map((char) => (
              <TouchableOpacity
                key={char}
                style={styles.selectedItem}
                onPress={() => handleAddChar(char)}>
                <Text style={styles.selectedItemText}>{char}</Text>
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 底部操作栏 */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedChars.size === 0 && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={selectedChars.size === 0}>
          <Text style={styles.saveButtonText}>
            保存 {selectedChars.size} 个汉字
          </Text>
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
  methodToggle: {
    flexDirection: 'row',
    margin: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: 4,
  },
  methodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  methodButtonActive: {
    backgroundColor: colors.primary,
  },
  methodButtonText: {
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  methodButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  inputSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  pinyinInputContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pinyinInput: {
    flex: 1,
    height: 50,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchButton: {
    height: 50,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: 'bold',
  },
  voiceButton: {
    height: 120,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.medium,
  },
  voiceButtonRecording: {
    backgroundColor: colors.primaryDark,
  },
  voiceEmoji: {
    fontSize: 50,
    marginBottom: spacing.sm,
  },
  voiceText: {
    fontSize: fontSize.lg,
    color: colors.text,
  },
  charsSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  charsGrid: {
    maxHeight: 150,
  },
  charsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  charCard: {
    width: 50,
    height: 50,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.small,
  },
  charCardSelected: {
    backgroundColor: colors.primary,
  },
  charText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  selectedBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
  },
  selectedSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  selectedTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearText: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  selectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedItemText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.sm,
  },
  removeText: {
    fontSize: fontSize.xl,
    color: colors.white,
    fontWeight: 'bold',
  },
  bottomSection: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
  saveButton: {
    flex: 2,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    ...shadow.medium,
  },
  disabledButton: {
    backgroundColor: colors.textMuted,
  },
  saveButtonText: {
    fontSize: fontSize.lg,
    color: colors.white,
    fontWeight: 'bold',
  },
});