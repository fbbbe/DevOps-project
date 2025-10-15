import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { CreateStudyScreen } from "../screens/CreateStudyScreen";
import { ChatListScreen } from "../screens/ChatListScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { StudyDetailScreen } from "../screens/StudyDetailScreen";
import { AttendanceScreen } from "../screens/AttendanceScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { StudyChatScreen } from "../screens/StudyChatScreen";
import { AppTabsParamList, AuthStackParamList, RootStackParamList } from "./types";
import { colors } from "../styles/theme";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabsParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const tabIconMap: Record<keyof AppTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: "grid",
  CreateStudy: "add-circle",
  ChatList: "chatbubbles",
  Profile: "person-circle",
};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
  },
};

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        borderTopWidth: 0,
        height: 64,
        paddingBottom: 10,
        paddingTop: 6,
        backgroundColor: colors.card,
      },
      tabBarIcon: ({ color, size }) => {
        const iconName = tabIconMap[route.name as keyof AppTabsParamList];
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "600",
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "대시보드" }} />
    <Tab.Screen name="CreateStudy" component={CreateStudyScreen} options={{ title: "스터디 생성" }} />
    <Tab.Screen name="ChatList" component={ChatListScreen} options={{ title: "채팅" }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "내 정보" }} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { user } = useAppContext();

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? (
        <RootStack.Navigator>
          <RootStack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
          <RootStack.Screen
            name="StudyDetail"
            component={StudyDetailScreen}
            options={{ title: "스터디 상세" }}
          />
          <RootStack.Screen
            name="Attendance"
            component={AttendanceScreen}
            options={{ title: "출석 관리" }}
          />
          <RootStack.Screen
            name="Progress"
            component={ProgressScreen}
            options={{ title: "학습 현황" }}
          />
          <RootStack.Screen
            name="Chat"
            component={StudyChatScreen}
            options={{ title: "스터디 채팅" }}
          />
        </RootStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};
