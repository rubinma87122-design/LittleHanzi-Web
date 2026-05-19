import {Mascot} from '../types';

/**
 * 卡通角色库
 */
export const MASCOTS: Mascot[] = [
  {
    id: 'mascot_1',
    name: '小哪吒',
    description: '勇敢的小英雄',
    normalLottie: 'nezha_normal.json',
    happyLottie: 'nezha_happy.json',
    encouragingLottie: 'nezha_encouraging.json',
    cheeringLottie: 'nezha_cheering.json',
  },
  {
    id: 'mascot_2',
    name: '小公主',
    description: '美丽的公主',
    normalLottie: 'princess_normal.json',
    happyLottie: 'princess_happy.json',
    encouragingLottie: 'princess_encouraging.json',
    cheeringLottie: 'princess_cheering.json',
  },
  {
    id: 'mascot_3',
    name: '小恐龙',
    description: '可爱的小恐龙',
    normalLottie: 'dino_normal.json',
    happyLottie: 'dino_happy.json',
    encouragingLottie: 'dino_encouraging.json',
    cheeringLottie: 'dino_cheering.json',
  },
  {
    id: 'mascot_4',
    name: '小熊猫',
    description: '憨厚的小熊猫',
    normalLottie: 'panda_normal.json',
    happyLottie: 'panda_happy.json',
    encouragingLottie: 'panda_encouraging.json',
    cheeringLottie: 'panda_cheering.json',
  },
  {
    id: 'mascot_5',
    name: '小兔子',
    description: '活泼的小兔子',
    normalLottie: 'rabbit_normal.json',
    happyLottie: 'rabbit_happy.json',
    encouragingLottie: 'rabbit_encouraging.json',
    cheeringLottie: 'rabbit_cheering.json',
  },
  {
    id: 'mascot_6',
    name: '小猫咪',
    description: '温柔的小猫咪',
    normalLottie: 'cat_normal.json',
    happyLottie: 'cat_happy.json',
    encouragingLottie: 'cat_encouraging.json',
    cheeringLottie: 'cat_cheering.json',
  },
];

/**
 * 根据ID获取角色
 */
export function getMascotById(id: string): Mascot | undefined {
  return MASCOTS.find(m => m.id === id);
}

/**
 * 获取角色表情（临时用Emoji代替Lottie）
 */
export function getMascotEmoji(mascotId: string, mood: 'normal' | 'happy' | 'encouraging' | 'cheering'): string {
  const emojiMap: Record<string, Record<string, string>> = {
    mascot_1: {
      normal: '🧒',
      happy: '🤩',
      encouraging: '😊',
      cheering: '🎉',
    },
    mascot_2: {
      normal: '👧',
      happy: '🥰',
      encouraging: '💕',
      cheering: '🌸',
    },
    mascot_3: {
      normal: '🦖',
      happy: '😆',
      encouraging: '💪',
      cheering: '🦕',
    },
    mascot_4: {
      normal: '🐼',
      happy: '😋',
      encouraging: '🎋',
      cheering: '🎎',
    },
    mascot_5: {
      normal: '🐰',
      happy: '🥕',
      encouraging: '🌈',
      cheering: '🥚',
    },
    mascot_6: {
      normal: '🐱',
      happy: '😸',
      encouraging: '🐾',
      cheering: '🎾',
    },
  };

  return emojiMap[mascotId]?.[mood] || '🧒';
}

/**
 * 获取角色的鼓励语音
 */
export function getMascotEncouragement(mascotId: string, attemptCount: number): string {
  const messages: Record<string, string[]> = {
    mascot_1: [
      '加油，你可以的！',
      '再试试看，这次一定能行！',
      '相信自己，你是最棒的！',
      '离答案很近了，继续努力！',
    ],
    mascot_2: [
      '加油，你可以的！',
      '再试试看，这次一定能行！',
      '太棒了！',
      '你真聪明！',
      '相信自己，你是最棒的！',
      '继续加油！',
      '恭喜你！',
      '太厉害了！',
    ],
    mascot_3: [
      '吼吼，加油！',
      '不要放弃！',
      '吼吼，太棒了！',
      '厉害！',
      '冲鸭！',
      '你可以的！',
      '胜利！',
      '成功！',
    ],
    mascot_4: [
      '加油加油！',
      '慢慢来，不着急',
      '不错哦！',
      '做得好！',
      '继续加油！',
      '相信自己！',
      '太棒啦！',
      '耶！',
    ],
    mascot_5: [
      '加油！加油！',
      '跳跳，加油！',
      '太好了！',
      '耶耶耶！',
      '蹦蹦跳跳，加油！',
      '坚持住！',
      '成功啦！',
      '开心！',
    ],
    mascot_6: [
      '喵~加油',
      '慢慢来',
      '喵~好棒！',
      '喵呜~太好了！',
      '相信自己喵~',
      '继续努力喵~',
      '喵呜~成功！',
      '太厉害了喵~',
    ],
  };

  const characterMessages = messages[mascotId] || messages.mascot_1;
  const index = Math.min(attemptCount, characterMessages.length - 1);
  return characterMessages[index];
}