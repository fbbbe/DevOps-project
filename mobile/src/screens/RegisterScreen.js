import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { register } from '../services/auth';
import { theme } from '../theme.js';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const UNIVERSITIES = ['서울대학교', '연세대학교', '고려대학교', '성균관대학교', '한양대학교', '기타'];

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('남성');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const user = await register({ email: email.trim(), password, nickname, gender, university });
      Alert.alert('환영합니다!', `${user.nickname}님, 회원가입이 완료되었습니다.`);
      navigation.reset({ index: 0, routes: [{ name: 'Home', params: { user } }] });
    } catch (err) {
      Alert.alert('회원가입 실패', err?.message || '잠시 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <Card>
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

        <Text style={styles.label}>닉네임</Text>
        <Input
          value={nickname}
          onChangeText={setNickname}
          placeholder="닉네임을 입력하세요"
        />

        <Text style={styles.label}>성별</Text>
        <View style={styles.row}>
          {['남성', '여성'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.chip, gender === g && styles.chipActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title={loading ? '가입 중...' : '회원가입'} onPress={onSubmit} disabled={loading} />

        <Button variant="link" onPress={() => navigation.goBack()}>
          이미 계정이 있으신가요? 로그인
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 10,
    color: theme.colors.primary,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    color: theme.colors.foreground,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.card,
  },
  chipSmall: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: theme.colors.card,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.foreground,
    fontWeight: '600',
  },
  chipTextSmall: {
    color: theme.colors.foreground,
  },
  chipTextActive: {
    color: 'white',
  },
  link: {
    marginTop: 12,
    color: theme.colors.primary,
    textAlign: 'center',
  },
});

