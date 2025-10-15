import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme.js';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import BottomNav from '../components/BottomNav';

export default function StudyCreateScreen({ navigation }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');

  const create = () => {
    alert('스터디가 생성되었습니다.');
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>스터디 만들기</Text>
        <Text style={styles.label}>이름</Text>
        <Input value={name} onChangeText={setName} placeholder="스터디 이름" />
        <Text style={styles.label}>주제</Text>
        <Input value={subject} onChangeText={setSubject} placeholder="주제" />
        <Text style={styles.label}>설명</Text>
        <Input value={desc} onChangeText={setDesc} placeholder="설명" />
        <Button onPress={create}>생성</Button>
      </Card>
      <BottomNav navigation={navigation} current="CreateStudy" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: theme.colors.foreground },
  label: { color: theme.colors.foreground, marginTop: 8, marginBottom: 6 },
});
