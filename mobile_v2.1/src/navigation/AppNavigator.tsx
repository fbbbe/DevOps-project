// src/navigation/AppNavigator.tsx
import React from "react";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Platform } from "react-native";
import theme from "../styles/theme";

import DashboardScreen from "../screens/DashboardScreen";
import CreateStudyScreen from "../screens/CreateStudyScreen";
import AttendanceScreen from "../screens/AttendanceScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ProgressScreen from "../screens/ProgressScreen";
import StudyChatScreen from "../screens/StudyChatScreen";
import ChatListScreen from "../screens/ChatListScreen";
import LoginScreen from "../screens/LoginScreen";
import StudyDetailScreen from "../screens/StudyDetailScreen";

import { Home, Plus, User, MessageSquare } from "lucide-react-native";

import { AuthProvider } from "../context/AuthContext"; // ✅ 추가

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  const insets = useSafeAreaInsets();

  const BASE_HEIGHT = 64; // 웹 하단바 높이 느낌 그대로 유지
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
      {/* 메인 홈 */}
      <Tab.Screen
        name="홈"
        component={DashboardScreen}
        options={{
          tabBarLabel: "메인",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />

      {/* 채팅 목록 */}
      <Tab.Screen
        name="채팅목록"
        component={ChatListScreen}
        options={{
          tabBarLabel: "채팅",
          tabBarIcon: ({ color, size }) => (
            <MessageSquare color={color} size={size} />
          ),
        }}
      />

      {/* 만들기 (+ 중앙 버튼) */}
      <Tab.Screen
        name="생성"
        component={CreateStudyScreen}
        options={{
          tabBarLabel: "만들기",
          tabBarIcon: () => (
            <View
              style={{
                marginTop: -8,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.color.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={24} color={theme.color.onPrimary} />
            </View>
          ),
        }}
      />

      {/* 마이페이지 */}
      <Tab.Screen
        name="프로필"
        component={ProfileScreen}
        options={{
          tabBarLabel: "마이",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
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
        {/* 로그인 먼저, 이후 Root 탭 등 */}
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="로그인"
        >
          <Stack.Screen name="로그인" component={LoginScreen} />
          <Stack.Screen name="Root" component={Tabs} />

          {/* 탭 위로 올라오는 추가 화면들 */}
          <Stack.Screen name="StudyDetail" component={StudyDetailScreen} />
          <Stack.Screen name="진행률" component={ProgressScreen} />
          <Stack.Screen name="채팅" component={StudyChatScreen} />
          {/* 출석 화면 등 필요하면 여기에 */}
          <Stack.Screen name="출석" component={AttendanceScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
