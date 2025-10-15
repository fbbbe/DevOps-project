import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme.js';
import Card from '../components/ui/Card';

export default function AttendanceScreen({ route }) {
  const study = route?.params?.study;
  const code = 'A1B2C3';

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>{study?.name || '스터디'}</Text>
        <Text style={styles.muted}>출석 코드</Text>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.muted}>참여자는 이 코드를 입력하세요.</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: theme.colors.foreground },
  muted: { color: theme.colors.mutedForeground, marginBottom: 6 },
  code: { fontSize: 32, fontWeight: '800', letterSpacing: 6, color: theme.colors.primary, marginVertical: 8 },
});
