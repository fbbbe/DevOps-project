// ✅ 변경 전: 조건부로 로그인/Root를 번갈아 렌더
// {!isAuthed ? ( <Stack.Screen name="로그인" .../> ) : ( <Stack.Screen name="Root" .../> ... )}

import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Platform } from 'react-native';
import theme from '../styles/theme';

import DashboardScreen from '../screens/DashboardScreen';
import CreateStudyScreen from '../screens/CreateStudyScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProgressScreen from '../screens/ProgressScreen';
import StudyChatScreen from '../screens/StudyChatScreen';
import ChatListScreen from '../screens/ChatListScreen';
import LoginScreen from '../screens/LoginScreen';
import StudyDetailScreen from '../screens/StudyDetailScreen';
import { Home, Plus, User, MessageSquare } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  const insets = useSafeAreaInsets();

  // 웹 h-16(≈64px) 기준
  const BASE_HEIGHT = 64;
  const height = BASE_HEIGHT + insets.bottom;
  const padTop = Platform.select({ ios: 6, android: 4, default: 4 });
  const padBottom = Math.max(8, 8 + Math.floor(insets.bottom / 2));

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.color.primary,       // text-primary
        tabBarInactiveTintColor: theme.color.mutedText,   // text-muted-foreground
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 12, marginTop: 0, marginBottom: 4 },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarStyle: {
          height,
          paddingTop: padTop,
          paddingBottom: padBottom,
          backgroundColor: theme.color.bg,    // bg-background
          borderTopWidth: 1,
          borderTopColor: theme.color.border, // border-t
        },
        sceneContainerStyle: { backgroundColor: theme.color.bg },
      }}
    >
      {/* 1) 메인 */}
      <Tab.Screen
        name="홈"
        component={DashboardScreen}
        options={{
          tabBarLabel: '메인',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />

      {/* 2) 채팅 */}
      <Tab.Screen
        name="채팅목록"
        component={ChatListScreen}
        options={{
          tabBarLabel: '채팅',
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
        }}
      />

      {/* 3) 만들기 — 중앙 둥근 + 버튼 */}
      <Tab.Screen
        name="생성"
        component={CreateStudyScreen}
        options={{
          tabBarLabel: '만들기',
          tabBarIcon: ({ color, size }) => <Plus color={color} size={size} />,
        }}
      />

      {/* 4) 마이 */}
      <Tab.Screen
        name="프로필"
        component={ProfileScreen}
        options={{
          tabBarLabel: '마이',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.color.bg,
          card: theme.color.bg,
          border: theme.color.border,
          text: theme.color.text,
          primary: theme.color.primary,
        },
      }}
    >
      {/* ✅ 항상 두 스크린 모두 등록하고, 시작만 로그인으로 */}
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="로그인">
        <Stack.Screen name="로그인" component={LoginScreen} />
        <Stack.Screen name="Root" component={Tabs} />

        {/* 탭 위로 쌓일 상세/기능 화면들 */}
        <Stack.Screen name="StudyDetail" component={StudyDetailScreen} />
        <Stack.Screen name="진행률" component={ProgressScreen} />
        <Stack.Screen name="채팅" component={StudyChatScreen} />
        <Stack.Screen
          name="Attendance"                       // ✅ 추가: navigate('출석', ...) 과 일치
          component={AttendanceScreen}
          options={{ headerShown: false }} // (원래 헤더 숨기는 방식 유지)
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
