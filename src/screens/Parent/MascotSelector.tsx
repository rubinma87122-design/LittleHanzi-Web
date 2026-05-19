import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {useAppStore} from '../../store/appStore';
import {MASCOTS, getMascotEmoji} from '../../utils/mascotUtils';

export default function MascotSelector() {
  const {settings, updateSettings} = useAppStore();
  const [selectedId, setSelectedId] = useState(settings.mascotId);

  const handleSelect = (mascotId: string) => {
    setSelectedId(mascotId);
    updateSettings({mascotId});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>选择陪伴角色</Text>
        <Text style={styles.subtitle}>为孩子选择一个喜欢的卡通角色</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {MASCOTS.map(mascot => {
            const isSelected = mascot.id === selectedId;

            return (
              <TouchableOpacity
                key={mascot.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleSelect(mascot.id)}
                activeOpacity={0.8}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>
                    {getMascotEmoji(mascot.id, 'normal')}
                  </Text>
                </View>
                <Text style={styles.name}>{mascot.name}</Text>
                <Text style={styles.description}>{mascot.description}</Text>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>已选择</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.hint}>
          角色将在学习过程中陪伴孩子，给予鼓励和反馈
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    width: '45%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadow.medium,
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 60,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
  },
  selectedBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  selectedBadgeText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: 'bold',
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});