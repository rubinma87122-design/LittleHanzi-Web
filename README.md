# 小小汉字复习助手 (LittleHanzi)

一款专为 4 岁幼儿设计的汉字复习应用，通过游戏化方式帮助孩子巩固所学汉字。

## 功能特点

### 家长模式
- **家长验证**：长按 3 秒 + 数字密码双保险，防止儿童误操作
- **字库管理**：按日期分组管理已录入的汉字
- **拍照识字**：使用 OCR 自动识别图片中的汉字
- **手动输入**：拼音查询、语音录入、常用字选择
- **学习统计**：查看每日学习数据、正确率、易错字排行
- **设置管理**：复习字数、密码、API 配置等

### 儿童模式
- **完全锁定**：儿童无法退出或访问设置
- **卡通引导**：可爱的卡通角色陪伴学习
- **四种游戏**：
  - 🖼️ 看字选图
  - 🔊 听音找字
  - 🃏 翻牌记忆
  - ✋ 拖拽组词
- **游戏切换**：一轮结束后自动切换到下一种游戏
- **激励反馈**：正确答案有音效和动画奖励

## 技术栈

- **框架**：React Native 0.76.5
- **语言**：TypeScript
- **导航**：React Navigation (Native Stack)
- **状态管理**：Zustand
- **本地存储**：AsyncStorage
- **UI 组件**：Reanimated, Gesture Handler
- **语音识别**：@react-native-voice/voice
- **OCR 服务**：百度 OCR API

## 项目结构

```
src/
├── components/          # 通用组件
├── screens/             # 页面
│   ├── Parent/          # 家长模式
│   ├── Child/           # 儿童模式
│   └── Common/          # 公共页面
├── store/               # 状态管理
├── services/            # 服务层
│   ├── ocrService.ts    # OCR 识别
│   ├── ttsService.ts    # 文字转语音
│   ├── voiceService.ts  # 语音识别
│   ├── soundService.ts  # 音效
│   └── storageService.ts # 本地存储
├── utils/               # 工具函数
│   ├── pinyinUtils.ts   # 拼音工具
│   └── gameManager.ts   # 游戏管理
├── types/               # 类型定义
├── navigation/          # 导航配置
└── theme/               # 主题样式
```

## 快速开始

### 安装依赖

```bash
npm install
```

### iOS 设置

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

### 运行项目

```bash
# iOS
npx react-native run-ios

# 或使用 Xcode
open ios/LittleHanzi.xcodeproj
```

## 配置说明

### OCR API 配置

1. 访问 [百度云控制台](https://console.bce.baidu.com/)
2. 创建应用获取 API Key 和 Secret Key
3. 在应用设置中填入 API Key

### 家长密码

默认密码：`1234`（可在设置中修改）

### 语音权限

确保 iOS 设备已授予麦克风权限用于语音识别。

## 开发说明

### 语音服务

iOS 原生 TTS 模块位于 `ios/LittleHanzi/AVSpeechModule.m`

### 拼音数据库

常用汉字拼音位于 `src/utils/pinyinUtils.ts`，可根据需要扩展。

### 本地存储

所有数据存储在设备本地，不上传服务器：
- 字库数据
- 学习记录
- 用户设置

## 待完成功能

- [ ] 添加更多卡通角色
- [ ] 完善汉字图片库
- [ ] 实现艾宾浩斯复习算法
- [ ] 支持多个儿童账号
- [ ] 添加家长数据分析报告
- [ ] 支持数据导出/备份

## 许可证

MIT License