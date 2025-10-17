import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ 추가
import { Platform } from 'react-native'; // ✅ 추가
import theme from '../styles/theme';

// 탭 스크린
import DashboardScreen from '../screens/DashboardScreen';
import CreateStudyScreen from '../screens/CreateStudyScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import ProfileScreen from '../screens/ProfileScreen';

// 상세 스크린
import StudyDetailScreen from '../screens/StudyDetailScreen';
import { Home, Plus, CheckCircle2, User } from 'lucide-react-native';

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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={Tabs} />
        <Stack.Screen name="StudyDetail" component={StudyDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
