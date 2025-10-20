import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, Alert
} from 'react-native';
import Screen from '../components/Screen';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import theme from '../styles/theme';
import { BookOpen, Users } from 'lucide-react-native';

type User = {
  id: string;
  nickname: string;
  gender?: '남성' | '여성';
  email?: string;
  role: 'user' | 'admin';
};

export default function LoginScreen({ route, navigation }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: '',
    password: '',
    nickname: '',
    gender: '' as '' | '남성' | '여성',
  });

  const setField = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  // 간단 검증 (웹의 required와 동등)  :contentReference[oaicite:1]{index=1}
  const canSubmit = useMemo(() => {
    const okEmail = /\S+@\S+\.\S+/.test(form.email);
    const okPw = form.password.trim().length >= 4; // 데모 기준(원하면 6 이상으로)
    if (isLogin) return okEmail && okPw;
    const okNick = form.nickname.trim().length > 0;
    const okGender = form.gender === '남성' || form.gender === '여성';
    return okEmail && okPw && okNick && okGender;
  }, [form, isLogin]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    // 웹과 동일하게 mock 사용자 생성  :contentReference[oaicite:2]{index=2}
    const user: User = {
      id: Math.random().toString(36).slice(2, 10),
      nickname: isLogin ? '테스트유저' : form.nickname.trim(),
      gender: (isLogin ? '남성' : (form.gender || undefined)) as any,
      email: form.email,
      role: 'user',
    };

    // onLogin 콜백을 params로 받았으면 호출, 아니면 루트로 리셋
    const onLogin = route?.params?.onLogin;
    if (typeof onLogin === 'function') onLogin(user);

    Alert.alert('환영합니다!', `${user.nickname}님, 로그인 완료`);
    navigation.replace('Root');
  };

  return (
    <Screen withPadding={false}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Logo / Title */}
          <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 20 }}>
            <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: theme.color.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <BookOpen size={28} color={theme.color.onPrimary} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: theme.color.primary }}>Study-UP</Text>
            <Text style={{ color: theme.color.mutedText, marginTop: 4 }}>함께 성장하는 스터디 플랫폼</Text>
          </View>

          {/* Card */}
          <Card style={{ elevation: 2 }}>
            <CardHeader style={{ alignItems: 'center' }}>
              <CardTitle>{isLogin ? '로그인' : '회원가입'}</CardTitle>
              <CardDescription>{isLogin ? '계정에 로그인하세요' : '새 계정을 만들어보세요'}</CardDescription>
            </CardHeader>
            <CardContent style={{ gap: 12 }}>
              {/* 이메일 */}
              <View>
                <Text style={S.label}>이메일</Text>
                <Input
                  placeholder="이메일을 입력하세요"
                  value={form.email}
                  onChangeText={(v) => setField('email', v)}
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
                  onChangeText={(v) => setField('password', v)}
                  secureTextEntry
                />
              </View>

              {/* 회원가입 필드 */}
              {!isLogin && (
                <>
                  <View>
                    <Text style={S.label}>닉네임</Text>
                    <Input
                      placeholder="닉네임을 입력하세요"
                      value={form.nickname}
                      onChangeText={(v) => setField('nickname', v)}
                    />
                  </View>

                  {/* 성별: 라디오그룹 대신 Pill 선택 (빈 문자열 없음) */}
                  <View>
                    <Text style={S.label}>성별</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(['남성', '여성'] as const).map(g => {
                        const active = form.gender === g;
                        return (
                          <Pressable
                            key={g}
                            onPress={() => setField('gender', g)}
                            style={[
                              S.pill,
                              active && { borderColor: theme.color.primary, backgroundColor: theme.color.primary + '22' },
                            ]}
                          >
                            <Text style={{ color: active ? theme.color.primary : theme.color.text }}>{g}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </>
              )}

              <Button onPress={handleSubmit} disabled={!canSubmit} style={{ marginTop: 4 }}>
                {isLogin ? '로그인' : '회원가입'}
              </Button>

              <View style={{ alignItems: 'center', marginTop: 6 }}>
                <Button variant="link" onPress={() => setIsLogin(v => !v)} size="sm">
                  {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                </Button>
              </View>
            </CardContent>
          </Card>

          {/* footer stats */}
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Users size={14} color={theme.color.mutedText} />
              <Text style={{ color: theme.color.mutedText, fontSize: 12 }}>1000+ 명이 함께하고 있어요</Text>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const S = StyleSheet.create({
  label: { fontSize: 12, color: theme.color.text, marginBottom: 6 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: theme.color.border, backgroundColor: '#fff'
  },
});
