/**
 * 常用汉字拼音映射
 * 这里包含最常用的几百个汉字
 */
const PINYIN_MAP: Record<string, string> = {
  // 第一人称
  我: 'wǒ',
  我们: 'wǒmen',
  自己: 'zìjǐ',

  // 第二人称
  你: 'nǐ',
  你们: 'nǐmen',
  您: 'nín',

  // 第三人称
  他: 'tā',
  她: 'tā',
  它: 'tā',
  他们: 'tāmen',
  她们: 'tāmen',

  // 动词
  爱: 'ài',
  喜欢: 'xǐhuān',
  吃: 'chī',
  喝: 'hē',
  睡: 'shuì',
  跑: 'pǎo',
  走: 'zǒu',
  坐: 'zuò',
  站: 'zhàn',
  看: 'kàn',
  听: 'tīng',
  说: 'shuō',
  做: 'zuò',
  玩: 'wán',
  学习: 'xuéxí',
  工作: 'gōngzuò',

  // 名词
  家: 'jiā',
  家人: 'jiārén',
  爸爸: 'bàba',
  妈妈: 'māma',
  父亲: 'fùqīn',
  母亲: 'mǔqīn',
  爷爷: 'yéye',
  奶奶: 'nǎinai',
  哥哥: 'gēge',
  姐姐: 'jiějie',
  弟弟: 'dìdi',
  妹妹: 'mèimei',
  朋友: 'péngyǒu',
  老师: 'lǎoshī',
  学生: 'xuéshēng',

  // 形容词
  好: 'hǎo',
  坏: 'huài',
  大: 'dà',
  小: 'xiǎo',
  多: 'duō',
  少: 'shǎo',
  高: 'gāo',
  矮: 'ǎi',
  长: 'cháng',
  短: 'duǎn',
  快: 'kuài',
  慢: 'màn',
  美: 'měi',
  丑: 'chǒu',
  快乐: 'kuàilè',
  开心: 'kāixīn',
  难过: 'nánguò',
  生气: 'shēngqì',

  // 代词
  这: 'zhè',
  那: 'nà',
  这里: 'zhèlǐ',
  那里: 'nàlǐ',
  这个: 'zhège',
  那个: 'nàge',
  这些: 'zhèxiē',
  那些: 'nàxiē',
  什么: 'shénme',
  哪里: 'nǎlǐ',
  谁: 'shuí',
  哪个: 'nǎge',
  怎么: 'zěnme',

  // 量词
  个: 'gè',
  人: 'rén',
  时: 'shí',
  分: 'fēn',
  秒: 'miǎo',

  // 方位词
  上: 'shàng',
  下: 'xià',
  左: 'zuǒ',
  右: 'yòu',
  前: 'qián',
  后: 'hòu',
  里: 'lǐ',
  外: 'wài',
  中: 'zhōng',
  东: 'dōng',
  南: 'nán',
  西: 'xī',
  北: 'běi',

  // 数字
  一: 'yī',
  二: 'èr',
  三: 'sān',
  四: 'sì',
  五: 'wǔ',
  六: 'liù',
  七: 'qī',
  八: 'bā',
  九: 'jiǔ',
  十: 'shí',
  百: 'bǎi',
  千: 'qiān',
  万: 'wàn',

  // 颜色
  红: 'hóng',
  橙: 'chéng',
  黄: 'huáng',
  绿: 'lǜ',
  青: 'qīng',
  蓝: 'lán',
  紫: 'zǐ',
  白: 'bái',
  黑: 'hēi',
  灰: 'huī',

  // 自然
  天: 'tiān',
  地: 'dì',
  山: 'shān',
  水: 'shuǐ',
  风: 'fēng',
  雨: 'yǔ',
  雪: 'xuě',
  日: 'rì',
  月: 'yuè',
  星: 'xīng',
  云: 'yún',
  火: 'huǒ',
  光: 'guāng',
  花: 'huā',
  草: 'cǎo',
  树: 'shù',
  林: 'lín',
  鸟: 'niǎo',
  鱼: 'yú',
  猫: 'māo',
  狗: 'gǒu',

  // 常用字
  的: 'de',
  了: 'le',
  和: 'hé',
  与: 'yǔ',
  在: 'zài',
  有: 'yǒu',
  无: 'wú',
  是: 'shì',
  不: 'bù',
  会: 'huì',
  能: 'néng',
  可: 'kě',
  要: 'yào',
  想: 'xiǎng',
  去: 'qù',
  来: 'lái',
  回: 'huí',
  到: 'dào',
  从: 'cóng',
  向: 'xiàng',
  给: 'gěi',
  对: 'duì',
  比: 'bǐ',
  被: 'bèi',
  让: 'ràng',
  使: 'shǐ',
  用: 'yòng',
  为: 'wèi',
  因为: 'yīnwèi',
  所以: 'suǒyǐ',
  但是: 'dànshì',
  而且: 'érqiě',
  或者: 'huòzhě',
  如果: 'rúguǒ',
  虽然: 'suīrán',
  就: 'jiù',
  都: 'dōu',
  也: 'yě',
  还: 'hái',
  又: 'yòu',
  很: 'hěn',
  太: 'tài',
  最: 'zuì',
  更: 'gèng',
  真: 'zhēn',
  假: 'jiǎ',
  新: 'xīn',
  老: 'lǎo',

  // 日常
  早上: 'zǎoshang',
  上午: 'shàngwǔ',
  中午: 'zhōngwǔ',
  下午: 'xiàwǔ',
  晚上: 'wǎnshang',
  昨天: 'zuótiān',
  今天: 'jīntiān',
  明天: 'míngtiān',
  现在: 'xiànzài',
  以前: 'yǐqián',
  以后: 'yǐhòu',
  开始: 'kāishǐ',
  结束: 'jiéshù',
  完成: 'wánchéng',
  成功: 'chénggōng',
  失败: 'shībài',

  // 时间
  早: 'zǎo',
  晚: 'wǎn',
  年: 'nián',
  周: 'zhōu',
  钟头: 'zhōngtóu',
  星期: 'xīngqī',

  // 其他常用
  国: 'guó',
  中国: 'zhōngguó',
  学校: 'xuéxiào',
  幼儿园: 'yòu\'éryuán',
  书: 'shū',
  笔: 'bǐ',
  纸: 'zhǐ',
  字: 'zì',
  词: 'cí',
  句: 'jù',
  文: 'wén',
  答案: 'dá\'àn',
  问题: 'wèntí',
  方法: 'fāngfǎ',
  方式: 'fāngshì',
  知识: 'zhīshi',
  能力: 'nénglì',
  技术: 'jìshù',
  艺术: 'yìshù',
  科学: 'kēxué',
  历史: 'lìshǐ',
  文化: 'wénhuà',
  语言: 'yǔyán',
  音乐: 'yīnyuè',
  运动: 'yùndòng',
  健康: 'jiànkāng',
  安全: 'ānquán',
  幸福: 'xìngfú',
  自由: 'zìyóu',
  和平: 'hépíng',
  希望: 'xīwàng',
  梦想: 'mèngxiǎng',
  目标: 'mùbiāo',
  计划: 'jìhuà',
  行动: 'xíngdòng',
  努力: 'nǔlì',
  坚持: 'jiānchí',
  勇敢: 'yǒnggǎn',
  聪明: 'cōngmíng',
  友善: 'yǒushàn',
  诚实: 'chéngshí',
  负责: 'fùzé',
  尊重: 'zūnzhòng',
  理解: 'lǐjiě',
  原谅: 'yuánliàng',
  帮助: 'bāngzhù',
  分享: 'fēnxiǎng',
  合作: 'hézuò',
  团队: 'tuánduì',
  集体: 'jítǐ',
  社会: 'shèhuì',
  世界: 'shìjiè',
  宇宙: 'yǔzhòu',
};

/**
 * 根据汉字获取拼音
 */
export function getPinyin(character: string): string {
  return PINYIN_MAP[character] || '';
}

/**
 * 根据拼音查找汉字
 */
export function findCharactersByPinyin(pinyin: string): string[] {
  const results: string[] = [];
  const normalizedPinyin = pinyin.toLowerCase().replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'ü');

  for (const [char, charPinyin] of Object.entries(PINYIN_MAP)) {
    const normalizedCharPinyin = charPinyin.toLowerCase()
      .replace(/[āáǎà]/g, 'a')
      .replace(/[ēéěè]/g, 'e')
      .replace(/[īíǐì]/g, 'i')
      .replace(/[ōóǒò]/g, 'o')
      .replace(/[ūúǔù]/g, 'u')
      .replace(/[ǖǘǚǜ]/g, 'ü');

    if (normalizedCharPinyin === normalizedPinyin) {
      // 如果是单字，返回
      if (char.length === 1) {
        results.push(char);
      }
    }
  }

  return results;
}

/**
 * 批量获取拼音
 */
export function batchGetPinyin(characters: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  characters.forEach(char => {
    result[char] = getPinyin(char);
  });
  return result;
}

export default {
  getPinyin,
  findCharactersByPinyin,
  batchGetPinyin,
};