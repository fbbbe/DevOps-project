// ✅ 변경 전: 조건부로 로그인/Root를 번갈아 렌더
// {!isAuthed ? ( <Stack.Screen name="로그인" .../> ) : ( <Stack.Screen name="Root" .../> ... )}

import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
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
import { Home, Plus, CheckCircle2, User, MessageSquare } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  const insets = useSafeAreaInsets();
  const BASE_HEIGHT = 56;
  const height = BASE_HEIGHT + insets.bottom;
  const padTop = Platform.select({ ios: 6, android: 4, default: 4 });
  const padBottom = Math.max(8, 8 + Math.floor(insets.bottom / 2));

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.color.primary,
        tabBarInactiveTintColor: theme.color.mutedText,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 12, marginTop: 0, marginBottom: 4 },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarStyle: {
          height,
          paddingTop: padTop,
          paddingBottom: padBottom,
          backgroundColor: theme.color.bg,
          borderTopWidth: 1,
          borderTopColor: theme.color.border,
        },
        sceneContainerStyle: { backgroundColor: theme.color.bg },
      }}
    >
      <Tab.Screen name="홈" component={DashboardScreen} options={{ tabBarIcon: ({color, size}) => <Home color={color} size={size}/> }} />
      <Tab.Screen name="생성" component={CreateStudyScreen} options={{ tabBarIcon: ({color, size}) => <Plus color={color} size={size}/> }} />
      <Tab.Screen name="출석" component={AttendanceScreen} options={{ tabBarIcon: ({color, size}) => <CheckCircle2 color={color} size={size}/> }} />
      <Tab.Screen
        name="채팅목록"
        component={ChatListScreen}
        options={{
          tabBarLabel: '채팅',
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
        }}
      />
      <Tab.Screen name="프로필" component={ProfileScreen} options={{ tabBarIcon: ({color, size}) => <User color={color} size={size}/> }} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
