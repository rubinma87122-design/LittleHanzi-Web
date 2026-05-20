import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {Platform} from 'react-native';
import {View, Text} from 'react-native';

import {colors} from '../theme';
import ChildWelcomeScreen from '../screens/Child/ChildWelcomeScreen';
import ParentGateScreen from '../screens/Common/ParentGateScreen';
import ParentDashboard from '../screens/Parent/ParentDashboard';
import CharacterLibrary from '../screens/Parent/CharacterLibrary';
import OCRScanner from '../screens/Parent/OCRScanner';
import ManualInput from '../screens/Parent/ManualInput';
import Statistics from '../screens/Parent/Statistics';
import Settings from '../screens/Parent/Settings';
import ReviewSchedule from '../screens/Parent/ReviewSchedule';
import DifficultCharsStats from '../screens/Parent/DifficultCharsStats';
import ImageMatchGame from '../screens/Child/ImageMatchGame';
import AudioMatchGame from '../screens/Child/AudioMatchGame';
import MemoryGame from '../screens/Child/MemoryGame';
import DragDropGame from '../screens/Child/DragDropGame';
import ResultScreen from '../screens/Child/ResultScreen';
import ReviewCompleteScreen from '../screens/Child/ReviewCompleteScreen';

// Web 兼容性：确保 react-native-screens 在 Web 上正确初始化
if (Platform.OS === 'web') {
  const {enableScreens} = require('react-native-screens');
  enableScreens(false);
}

export type RootStackParamList = {
  ChildWelcome: undefined;
  ParentGate: undefined;
  ParentDashboard: undefined;
  CharacterLibrary: undefined;
  OCRScanner: undefined;
  ManualInput: undefined;
  Statistics: undefined;
  Settings: undefined;
  ReviewSchedule: undefined;
  DifficultCharsStats: undefined;
  ImageMatchGame: {
    characters: Array<{
      id: string;
      character: string;
      pinyin: string;
      imageUrl?: string;
      isLearned?: boolean;
    }>;
    reviewMode?: boolean;
    gameIndex?: number;
    totalGames?: number;
  };
  AudioMatchGame: {
    characters: Array<{
      id: string;
      character: string;
      pinyin: string;
      imageUrl?: string;
      isLearned?: boolean;
    }>;
    reviewMode?: boolean;
    gameIndex?: number;
    totalGames?: number;
  };
  MemoryGame: {
    characters: Array<{
      id: string;
      character: string;
      pinyin: string;
      imageUrl?: string;
      isLearned?: boolean;
    }>;
    reviewMode?: boolean;
    gameIndex?: number;
    totalGames?: number;
  };
  DragDropGame: {
    characters: Array<{
      id: string;
      character: string;
      pinyin: string;
      imageUrl?: string;
      isLearned?: boolean;
    }>;
    reviewMode?: boolean;
    gameIndex?: number;
    totalGames?: number;
  };
  ResultScreen: {
    score: number;
    stars: number;
    totalQuestions: number;
    reviewMode?: boolean;
    gameIndex?: number;
    totalGames?: number;
    characters?: Array<{
      id: string;
      character: string;
      pinyin: string;
      imageUrl?: string;
      isLearned?: boolean;
    }>;
  };
  ReviewCompleteScreen: {
    score: number;
    stars: number;
    totalQuestions: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ChildWelcome"
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: colors.background},
          animation: 'default',
        }}>
        {/* 儿童模式 */}
        <Stack.Screen name="ChildWelcome" component={ChildWelcomeScreen} />
        <Stack.Screen name="ImageMatchGame" component={ImageMatchGame} />
        <Stack.Screen name="AudioMatchGame" component={AudioMatchGame} />
        <Stack.Screen name="MemoryGame" component={MemoryGame} />
        <Stack.Screen name="DragDropGame" component={DragDropGame} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} />
        <Stack.Screen name="ReviewCompleteScreen" component={ReviewCompleteScreen} />

        {/* 家长验证入口 */}
        <Stack.Screen name="ParentGate" component={ParentGateScreen} />

        {/* 家长模式 */}
        <Stack.Screen
          name="ParentDashboard"
          component={ParentDashboard}
          options={{
            headerShown: true,
            headerTitle: '家长模式',
            headerTitleAlign: 'center',
            headerTintColor: colors.text,
            headerStyle: {backgroundColor: colors.background},
          }}
        />
        <Stack.Screen
          name="CharacterLibrary"
          component={CharacterLibrary}
          options={{
            headerShown: true,
            headerTitle: '字库管理',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="OCRScanner"
          component={OCRScanner}
          options={{
            headerShown: true,
            headerTitle: '拍照识字',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="ManualInput"
          component={ManualInput}
          options={{
            headerShown: true,
            headerTitle: '手动输入',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="Statistics"
          component={Statistics}
          options={{
            headerShown: true,
            headerTitle: '学习统计',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{
            headerShown: true,
            headerTitle: '设置',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="ReviewSchedule"
          component={ReviewSchedule}
          options={{
            headerShown: true,
            headerTitle: '复习计划',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="DifficultCharsStats"
          component={DifficultCharsStats}
          options={{
            headerShown: true,
            headerTitle: '易错字统计',
            headerTitleAlign: 'center',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}