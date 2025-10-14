import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ route, navigation }) {
  const user = route?.params?.user;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>환영합니다{user?.nickname ? `, ${user.nickname}` : ''}님</Text>
      {!!user && (
        <View style={styles.card}>
          <Text style={styles.item}>이메일: {user.email}</Text>
          {user.gender ? <Text style={styles.item}>성별: {user.gender}</Text> : null}
          {user.university ? <Text style={styles.item}>대학교: {user.university}</Text> : null}
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
      >
        <Text style={styles.buttonText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  item: {
    marginBottom: 4,
    color: '#374151',
  },
  button: {
    backgroundColor: '#ef4444',
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

