import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme.js';
import Card from '../components/ui/Card';

export default function HomeScreen({ route, navigation }) {
  const user = route?.params?.user;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>환영합니다{user?.nickname ? `, ${user.nickname}` : ''}님</Text>
      {!!user && (
        <Card>
          <Text style={styles.item}>이메일: {user.email}</Text>
          {user.gender ? <Text style={styles.item}>성별: {user.gender}</Text> : null}
          {user.university ? <Text style={styles.item}>대학교: {user.university}</Text> : null}
        </Card>
      )}

      <TouchableOpacity
        style={styles.logout}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
      >
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
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
    marginVertical: 12,
    color: theme.colors.primary,
  },
  item: {
    marginBottom: 4,
    color: theme.colors.foreground,
  },
  logout: {
    backgroundColor: theme.colors.destructive,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: theme.radius,
    alignItems: 'center',
  },
  logoutText: {
    color: theme.colors.destructiveForeground,
    fontWeight: '600',
  },
});

