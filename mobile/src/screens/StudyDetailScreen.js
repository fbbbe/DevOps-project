import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme.js';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { AppContext } from '../context/AppContext';

export default function StudyDetailScreen({ route, navigation }) {
  const { favorites, toggleFavorite } = useContext(AppContext);
  const study = route?.params?.study;

  if (!study) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>스터디 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const fav = favorites.includes(study.id);

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>{study.name}</Text>
        <Text style={styles.muted}>주제: {study.subject}</Text>
        <Text style={styles.muted}>진행: {study.progress || 0}%</Text>
        <Button onPress={() => toggleFavorite(study.id)}>{fav ? '즐겨찾기 해제' : '즐겨찾기'}</Button>
        <Button onPress={() => navigation.navigate('Attendance', { study })}>출석 코드</Button>
        <Button onPress={() => navigation.navigate('Progress', { study })}>진도 관리</Button>
        <Button onPress={() => navigation.navigate('Chat', { study })}>채팅</Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: theme.colors.foreground },
  muted: { color: theme.colors.mutedForeground, marginBottom: 6 },
});
