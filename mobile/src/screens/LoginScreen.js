import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { login } from '../services/auth';
import { theme } from '../theme.js';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { AppContext } from '../context/AppContext';

export default function LoginScreen({ navigation }) {
  const { setUser } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const user = await login(email.trim(), password);
      setUser(user);
    } catch (err) {
      Alert.alert('로그인 실패', err?.message || '잠시 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study-UP</Text>
      <Text style={styles.subtitle}>함께 성장하는 스터디 플랫폼</Text>

      <Card>
        <Text style={styles.cardTitle}>로그인</Text>

        <Text style={styles.label}>이메일</Text>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="이메일을 입력하세요"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>비밀번호</Text>
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호를 입력하세요"
          secureTextEntry
        />

        <Button title={loading ? '로그인 중...' : '로그인'} onPress={onSubmit} disabled={loading} />

        <Button variant="link" onPress={() => navigation.navigate('Register')}>
          아직 계정이 없으신가요? 회원가입
        </Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: theme.colors.primary,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.mutedForeground,
    marginTop: 6,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.foreground,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    color: theme.colors.foreground,
  },
});
