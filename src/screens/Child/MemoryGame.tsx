import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import {colors, spacing, fontSize, borderRadius, shadow} from '../../theme';
import {soundService} from '../../services/soundService';
import {useAppStore} from '../../store/appStore';
import {GameCharacter} from '../../hooks/useGameLogic';

interface MemoryCard {
  id: string;
  type: 'character' | 'image';
  content: string;
  characterId: string;
  isMatched: boolean;
  isFlipped: boolean;
}

interface Props {
  route: {
    params: {
      characters: GameCharacter[];
      reviewMode?: boolean;
      gameIndex?: number;
      totalGames?: number;
    };
  };
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MemoryGame'>;

const ERROR_THRESHOLD = 2; // 每个汉字错误次数阈值

export default function MemoryGame({route}: Props) {
  const navigation = useNavigation<NavigationProp>();
  const {characters, reviewMode = false, gameIndex = 0, totalGames = 1} =
    route.params;

  const {recordStudyResult, markAsDifficult, incrementTodayStudy, incrementTodayCorrect} =
    useAppStore();

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [errorCountMap, setErrorCountMap] = useState<Map<string, number>>(new Map());
  const [score, setScore] = useState(0);

  // 初始化卡片
  useEffect(() => {
    initCards();
  }, []);

  // 检查游戏是否完成
  useEffect(() => {
    const totalPairs = Math.min(characters.length, 6);
    if (matchedPairs >= totalPairs && totalPairs > 0) {
      // 游戏完成
      setTimeout(() => {
        navigation.navigate('ResultScreen' as any, {
          score,
          stars: matchedPairs,
          totalQuestions: totalPairs,
          reviewMode,
          gameIndex,
          totalGames,
          characters,
        });
      }, 500);
    }
  }, [matchedPairs, characters.length, score, reviewMode, gameIndex, totalGames]);

  const initCards = () => {
    const selectedChars = characters.slice(0, 6); // 使用前6个字符
    const memoryCards: MemoryCard[] = [];

    selectedChars.forEach((char) => {
      // 添加汉字卡片
      memoryCards.push({
        id: `${char.id}_char`,
        type: 'character',
        content: char.character,
        characterId: char.id,
        isMatched: false,
        isFlipped: false,
      });
      // 添加图片卡片
      memoryCards.push({
        id: `${char.id}_img`,
        type: 'image',
        content: char.character,
        characterId: char.id,
        isMatched: false,
        isFlipped: false,
      });
    });

    // 打乱顺序
    const shuffled = memoryCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setErrorCountMap(new Map());
  };

  const handleCardPress = (cardId: string) => {
    if (isLocked) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    // 翻开卡片
    const newCards = cards.map((c) =>
      c.id === cardId ? {...c, isFlipped: true} : c,
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // 检查是否翻开了两张
    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);
      setIsLocked(true);

      const [first, second] = newFlippedCards.map((id) =>
        newCards.find((c) => c.id === id),
      );

      if (first && second) {
        // 检查是否匹配
        if (
          first.characterId === second.characterId &&
          first.type !== second.type
        ) {
          // 匹配成功
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.characterId === first.characterId
                  ? {...c, isMatched: true}
                  : c,
              ),
            );
            setMatchedPairs((prev) => prev + 1);
            setScore((prev) => prev + 10);
            setFlippedCards([]);
            setIsLocked(false);
            soundService.play('correct');

            // 记录学习成功
            recordStudyResult(first.characterId, true, 0);
            incrementTodayStudy();
            incrementTodayCorrect();
          }, 500);
        } else {
          // 不匹配，记录错误
          const wrongCharId = first.characterId;
          const currentErrors = errorCountMap.get(wrongCharId) || 0;
          const newErrors = currentErrors + 1;
          const newErrorMap = new Map(errorCountMap);
          newErrorMap.set(wrongCharId, newErrors);
          setErrorCountMap(newErrorMap);

          // 记录学习错误
          recordStudyResult(wrongCharId, false, 1);
          incrementTodayStudy();

          // 检查是否达到错误阈值
          if (newErrors >= ERROR_THRESHOLD) {
            markAsDifficult(wrongCharId);
          }

          // 翻回卡片
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                newFlippedCards.includes(c.id) ? {...c, isFlipped: false} : c,
              ),
            );
            setFlippedCards([]);
            setIsLocked(false);
            soundService.play('wrong');
          }, 1000);
        }
      }
    }
  };

  const renderCard = (card: MemoryCard) => {
    const isFlipped = card.isFlipped || card.isMatched;

    return (
      <TouchableOpacity
        key={card.id}
        style={[styles.card, isFlipped && styles.cardFlipped]}
        onPress={() => handleCardPress(card.id)}
        activeOpacity={0.8}>
        {isFlipped ? (
          <View
            style={[
              styles.cardFront,
              card.isMatched && styles.cardMatched,
            ]}>
            <Text style={styles.cardContent}>
              {card.type === 'character' ? card.content : '🖼️'}
            </Text>
          </View>
        ) : (
          <View style={styles.cardBack}>
            <Text style={styles.cardBackText}>?</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部信息 */}
      <View style={styles.header}>
        <Text style={styles.headerText}>找到匹配的汉字和图片</Text>
        <View style={styles.statsRow}>
          <Text style={styles.movesText}>移动次数: {moves}</Text>
          <Text style={styles.scoreText}>得分: {score}</Text>
        </View>
      </View>

      {/* 卡片网格 */}
      <View style={styles.grid}>{cards.map(renderCard)}</View>

      {/* 进度 */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          已匹配: {matchedPairs} / {Math.min(characters.length, 6)}
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
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  headerText: {
    fontSize: fontSize.xl,
    color: colors.text,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  movesText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
  scoreText: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: 'bold',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadow.medium,
  },
  cardFlipped: {
    backgroundColor: colors.card,
  },
  cardBack: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackText: {
    fontSize: fontSize.xxxxxl,
    color: colors.white,
    fontWeight: 'bold',
  },
  cardFront: {
    flex: 1,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMatched: {
    backgroundColor: colors.success,
  },
  cardContent: {
    fontSize: fontSize.xxxxxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  progressText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
});
