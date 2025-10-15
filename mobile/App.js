import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppProvider, AppContext } from './src/context/AppContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import StudyDetailScreen from './src/screens/StudyDetailScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatScreen from './src/screens/ChatScreen';
import StudyCreateScreen from './src/screens/StudyCreateScreen';

const Stack = createNativeStackNavigator();

function AuthedNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudyDetail"
        component={StudyDetailScreen}
        options={{ title: '스터디 상세' }}
      />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: '출석 코드' }}
      />
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: '진도 관리' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: '채팅' }}
      />
      <Stack.Screen
        name="CreateStudy"
        component={StudyCreateScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function UnauthedNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user } = useContext(AppContext);

  return (
    <NavigationContainer>
      {user ? <AuthedNavigator /> : <UnauthedNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

