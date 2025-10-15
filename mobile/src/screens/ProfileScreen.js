import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme.js';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import BottomNav from '../components/BottomNav';
import { AppContext } from '../context/AppContext';

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(AppContext);
  const logout = () => {
    setUser(null);
  };

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>프로필</Text>
        <Text style={styles.item}>닉네임: {user?.nickname || '-'}</Text>
        <Text style={styles.item}>이메일: {user?.email || '-'}</Text>
        <Button variant="destructive" onPress={logout}>로그아웃</Button>
      </Card>
      <BottomNav navigation={navigation} current="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: theme.colors.foreground },
  item: { color: theme.colors.foreground, marginBottom: 6 },
});
