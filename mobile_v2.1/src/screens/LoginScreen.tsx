// src/screens/LoginScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import Screen from "../components/Screen";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import theme from "../styles/theme";
import { BookOpen, Users } from "lucide-react-native";
import { signUp, login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LegacyLoginPayload = {
  id: number;
  nickname: string;
  email: string;
  role: "admin" | "user";
};

type LegacyLoginHandler = (user: LegacyLoginPayload) => void;

type LoginScreenProps = {
  route?: {
    params?: {
      onLogin?: LegacyLoginHandler;
    };
  };
  navigation: {
    replace: (screen: string) => void;
  };
};

export default function LoginScreen({ route, navigation }: LoginScreenProps) {
  const { setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
  });

  const setField = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  // 입력 검증
  const canSubmit = useMemo(() => {
    const okEmail = /\S+@\S+\.\S+/.test(form.email.trim());
    const okPw = form.password.trim().length >= 4;
    if (isLogin) {
      return okEmail && okPw;
    } else {
      const okNick = form.nickname.trim().length > 0;
      return okEmail && okPw && okNick;
    }
  }, [form, isLogin]);

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;

    const email = form.email.trim();
    const password = form.password;
    const nickname = form.nickname.trim();

    try {
      setLoading(true);

      if (isLogin) {
        const { user, token } = await login(email, password);

        if (token) {
          await AsyncStorage.setItem("userToken", token);
        } else {
          await AsyncStorage.removeItem("userToken");
        }

        setUser(user);

        const onLogin = route?.params?.onLogin;
        if (typeof onLogin === "function") {
          onLogin({
            id: user.user_id,
            nickname: user.nickname,
            email: user.email,
            role: user.role === "ADMIN" ? "admin" : "user",
          });
        }

        Alert.alert("환영합니다!", `${user.nickname}님 로그인 완료`, [
          {
            text: "확인",
            onPress: () => {
              navigation.replace("Root");
            },
          },
        ]);
      } else {
        const { user, token } = await signUp(email, password, nickname);

        if (token) {
          await AsyncStorage.setItem("userToken", token);
        } else {
          await AsyncStorage.removeItem("userToken");
        }

        setUser(user);

        Alert.alert("가입 완료", `${user.nickname}님, 자동으로 로그인되었습니다.`, [
          {
            text: "확인",
            onPress: () => {
              navigation.replace("Root");
            },
          },
        ]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "잠시 후 다시 시도해 주세요.";
      Alert.alert(isLogin ? "로그인 실패" : "회원가입 실패", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen withPadding={false}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* 로고/타이틀 */}
          <View
            style={{
              alignItems: "center",
              marginTop: 32,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: theme.color.primary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <BookOpen size={28} color={theme.color.onPrimary} />
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: theme.color.primary,
              }}
            >
              Study-UP
            </Text>
            <Text style={{ color: theme.color.mutedText, marginTop: 4 }}>
              함께 성장하는 스터디 플랫폼
            </Text>
          </View>

          {/* 카드 */}
          <Card style={{ elevation: 2 }}>
            <CardHeader style={{ alignItems: "center" }}>
              <CardTitle>{isLogin ? "로그인" : "회원가입"}</CardTitle>
              <CardDescription>
                {isLogin ? "계정에 로그인하세요" : "새 계정을 만들어보세요"}
              </CardDescription>
            </CardHeader>

            <CardContent style={{ gap: 12 }}>
              {/* 이메일 */}
              <View>
                <Text style={S.label}>이메일</Text>
                <Input
                  placeholder="이메일을 입력하세요"
                  value={form.email}
                  onChangeText={(v) => setField("email", v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* 비밀번호 */}
              <View>
                <Text style={S.label}>비밀번호</Text>
                <Input
                  placeholder="비밀번호를 입력하세요"
                  value={form.password}
                  onChangeText={(v) => setField("password", v)}
                  secureTextEntry
                />
              </View>

              {/* 회원가입 전용: 닉네임 */}
              {!isLogin && (
                <View>
                  <Text style={S.label}>닉네임</Text>
                  <Input
                    placeholder="닉네임을 입력하세요"
                    value={form.nickname}
                    onChangeText={(v) => setField("nickname", v)}
                  />
                </View>
              )}

              <Button
                onPress={handleSubmit}
                disabled={!canSubmit || loading}
                style={{ marginTop: 4 }}
              >
                {loading
                  ? isLogin
                    ? "로그인 중..."
                    : "가입 중..."
                  : isLogin
                    ? "로그인"
                    : "회원가입"}
              </Button>

              <View style={{ alignItems: "center", marginTop: 6 }}>
                <Button
                  variant="link"
                  size="sm"
                  onPress={() => {
                    setIsLogin((v) => !v);
                  }}
                >
                  {isLogin
                    ? "계정이 없으신가요? 회원가입"
                    : "이미 계정이 있으신가요? 로그인"}
                </Button>
              </View>
            </CardContent>
          </Card>

          {/* footer stats */}
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Users size={14} color={theme.color.mutedText} />
              <Text
                style={{
                  color: theme.color.mutedText,
                  fontSize: 12,
                }}
              >
                1000+ 명이 함께하고 있어요
              </Text>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const S = StyleSheet.create({
  label: {
    fontSize: 12,
    color: theme.color.text,
    marginBottom: 6,
  },
});
