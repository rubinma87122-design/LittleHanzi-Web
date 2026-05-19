import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {useNavigation} from '@react-navigation/native';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {ocrService, OCRResult} from '../../services/ocrService';
import {useAppStore} from '../../store/appStore';

type NavigationProp = any;

export default function OCRScanner() {
  const navigation = useNavigation<NavigationProp>();
  const {addGroup, addCharacter} = useAppStore();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedWords, setRecognizedWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());

  // 请求相册权限
  useEffect(() => {
    (async () => {
      const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限提示', '需要相册权限来选择图片');
      }
    })();
  }, []);

  const handleSelectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri || null);
      }
    } catch (error) {
      Alert.alert('错误', '选择图片失败');
    }
  };

  const handleRecognize = async () => {
    if (!selectedImage) {
      Alert.alert('提示', '请先选择图片');
      return;
    }

    setIsRecognizing(true);
    setRecognizedWords([]);

    try {
      // 实际使用时需要将图片转为 Base64
      // 这里使用模拟数据
      const result: OCRResult = await ocrService.mockRecognize();

      if (result.error) {
        Alert.alert('识别失败', result.error);
      } else if (result.words.length > 0) {
        setRecognizedWords(result.words);
        // 默认全选
        setSelectedWords(new Set(result.words));
      } else {
        Alert.alert('提示', '未识别到汉字');
      }
    } catch (error) {
      Alert.alert('错误', '识别过程出错');
    } finally {
      setIsRecognizing(false);
    }
  };

  const toggleWord = (word: string) => {
    const newSelected = new Set(selectedWords);
    if (newSelected.has(word)) {
      newSelected.delete(word);
    } else {
      newSelected.add(word);
    }
    setSelectedWords(newSelected);
  };

  const handleSave = () => {
    if (selectedWords.size === 0) {
      Alert.alert('提示', '请至少选择一个汉字');
      return;
    }

    // 创建今日分组
    const today = new Date().toISOString().split('T')[0];
    const groupId = `group_${Date.now()}`;

    addGroup({
      id: groupId,
      name: today,
      note: 'OCR 识别录入',
      createdAt: new Date(),
    });

    // 添加汉字
    selectedWords.forEach((word) => {
      addCharacter({
        id: `char_${Date.now()}_${Math.random()}`,
        character: word,
        pinyin: '', // 需要后续完善拼音查询
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

    Alert.alert('成功', `已保存 ${selectedWords.size} 个汉字`, [
      {
        text: '确定',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 图片选择区 */}
      <View style={styles.imageSection}>
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={handleSelectImage}>
          {selectedImage ? (
            <Image
              source={{uri: selectedImage}}
              style={styles.selectedImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderEmoji}>📷</Text>
              <Text style={styles.placeholderText}>点击选择图片</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.recognizeButton,
            !selectedImage && styles.disabledButton,
          ]}
          onPress={handleRecognize}
          disabled={!selectedImage || isRecognizing}>
          <Text style={styles.buttonText}>
            {isRecognizing ? '识别中...' : '开始识别'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 识别结果 */}
      {recognizedWords.length > 0 && (
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>
            识别结果（{selectedWords.size}/{recognizedWords.length}）
          </Text>
          <View style={styles.wordsGrid}>
            {recognizedWords.map((word, index) => {
              const isSelected = selectedWords.has(word);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.wordCard, isSelected && styles.selectedWordCard]}
                  onPress={() => toggleWord(word)}>
                  <Text style={styles.wordText}>{word}</Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* 底部操作栏 */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        {selectedWords.size > 0 && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              保存 {selectedWords.size} 个汉字
            </Text>
          </TouchableOpacity>
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
  imageSection: {
    padding: spacing.lg,
  },
  imagePicker: {
    width: '100%',
    height: 300,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadow.medium,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  placeholderText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
  actionSection: {
    padding: spacing.lg,
  },
  button: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadow.medium,
  },
  recognizeButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.textMuted,
  },
  buttonText: {
    fontSize: fontSize.lg,
    color: colors.white,
    fontWeight: 'bold',
  },
  resultSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  wordCard: {
    width: 70,
    height: 70,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.small,
  },
  selectedWordCard: {
    backgroundColor: colors.primary,
  },
  wordText: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    fontSize: 12,
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
  saveButtonText: {
    fontSize: fontSize.lg,
    color: colors.white,
    fontWeight: 'bold',
  },
});