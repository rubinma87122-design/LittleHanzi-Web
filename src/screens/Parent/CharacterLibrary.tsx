import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {useAppStore} from '../../store/appStore';
import {Character, Group} from '../../types';

type NavigationProp = any;

export default function CharacterLibrary() {
  const navigation = useNavigation<NavigationProp>();
  const {groups, addGroup, deleteCharacter, updateGroup} = useAppStore();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );
  const [newCharacter, setNewCharacter] = useState('');

  const handleAddCharacter = () => {
    navigation.navigate('ManualInput');
  };

  const handleOCRScan = () => {
    navigation.navigate('OCRScanner');
  };

  const handleCharacterPress = (char: Character) => {
    setEditingCharacter(char);
    setNewCharacter(char.character);
    setShowModal(true);
  };

  const handleDeleteCharacter = (charId: string) => {
    deleteCharacter(charId);
  };

  const handleUpdateCharacter = () => {
    if (editingCharacter && newCharacter.trim()) {
      // 简单更新
      setShowModal(false);
      setEditingCharacter(null);
      setNewCharacter('');
    }
  };

  const getTotalCharacters = () => {
    return groups.reduce((sum, g) => sum + (g.characters?.length || 0), 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部操作栏 */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleOCRScan}>
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionText}>拍照识字</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAddCharacter}>
          <Text style={styles.actionIcon}>✏️</Text>
          <Text style={styles.actionText}>手动输入</Text>
        </TouchableOpacity>
      </View>

      {/* 统计信息 */}
      <View style={styles.statsSection}>
        <Text style={styles.statsText}>
          共 {groups.length} 个分组，{getTotalCharacters()} 个汉字
        </Text>
      </View>

      {/* 字库列表 */}
      <ScrollView style={styles.scrollView}>
        {groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>还没有汉字哦</Text>
            <Text style={styles.emptyHint}>点击上方按钮添加汉字</Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.id} style={styles.groupContainer}>
              {/* 分组标题 */}
              <View style={styles.groupHeader}>
                <View style={styles.groupTitleContainer}>
                  <Text style={styles.groupTitle}>{group.name}</Text>
                  {group.note && (
                    <Text style={styles.groupNote}>{group.note}</Text>
                  )}
                </View>
                <Text style={styles.groupCount}>
                  {group.characters?.length || 0} 字
                </Text>
              </View>

              {/* 汉字列表 */}
              <View style={styles.characterGrid}>
                {group.characters?.map((char) => (
                  <TouchableOpacity
                    key={char.id}
                    style={styles.characterCard}
                    onPress={() => handleCharacterPress(char)}
                    onLongPress={() => handleDeleteCharacter(char.id)}>
                    <Text style={styles.characterText}>{char.character}</Text>
                    <Text style={styles.pinyinText}>{char.pinyin}</Text>
                    {char.isLearned && (
                      <View style={styles.learnedBadge}>
                        <Text style={styles.learnedText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 编辑弹窗 */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>编辑汉字</Text>
            <TextInput
              style={styles.modalInput}
              value={newCharacter}
              onChangeText={setNewCharacter}
              placeholder="输入汉字"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleUpdateCharacter}>
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
  actionBar: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    ...shadow.medium,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.lg,
    color: colors.white,
    fontWeight: 'bold',
  },
  statsSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statsText: {
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  scrollView: {
    flex: 1,
    padding: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
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
  groupContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.medium,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  groupTitleContainer: {
    flex: 1,
  },
  groupTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
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
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.md,
  },
  characterCard: {
    width: 70,
    height: 90,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterText: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  pinyinText: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  learnedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnedText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
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