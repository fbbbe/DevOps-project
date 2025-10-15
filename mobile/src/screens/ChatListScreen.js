import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../theme.js';
import Card from '../components/ui/Card';
import BottomNav from '../components/BottomNav';

export default function ChatListScreen({ navigation }) {
  const myStudies = [
    { id: 's1', name: '알고리즘 스터디' },
    { id: 's2', name: '영어 회화' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={myStudies}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.name}>{item.name}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Chat', { study: item })}>
                <Text style={{ color: theme.colors.primary }}>입장</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />
      <BottomNav navigation={navigation} current="ChatList" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  name: { color: theme.colors.foreground, fontWeight: '600' },
});
