import React, { useContext, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { AppContext } from "../context/AppContext";
import { theme } from "../theme.js";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import BottomNav from "../components/BottomNav";

export default function DashboardScreen({ navigation }) {
  const { user, favorites, toggleFavorite } = useContext(AppContext);

  const studies = useMemo(
    () => [
      { id: "s1", name: "알고리즘 스터디", subject: "CS", progress: 35 },
      { id: "s2", name: "영어 회화", subject: "Language", progress: 60 },
      { id: "s3", name: "머신러닝 스터디", subject: "AI", progress: 10 },
    ],
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={studies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.heroGreeting}>{user?.nickname ? `${user.nickname}님` : '환영합니다'}</Text>
            <Text style={styles.heroTitle}>오늘도 스터디를 이어가요</Text>
            <Text style={styles.heroSubtitle}>즐겨찾기한 스터디와 진행률을 한눈에 확인하세요.</Text>
          </View>
        }
        ListHeaderComponentStyle={{ marginBottom: 16 }}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <Card>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.muted}>주제: {item.subject} • 진행 {item.progress}%</Text>
              <View style={styles.row}>
                <Button onPress={() => navigation.navigate('StudyDetail', { study: item })}>자세히</Button>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={{ marginLeft: 12 }}>
                  <Text style={{ color: favorites.includes(item.id) ? theme.colors.primary : theme.colors.mutedForeground }}>
                    {favorites.includes(item.id) ? '★ 즐겨찾기' : '☆ 즐겨찾기'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}
      />

      <BottomNav navigation={navigation} current="Dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: theme.colors.background },
  hero: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radiusXl,
    padding: 20,
    gap: 8,
  },
  heroGreeting: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
  heroTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.primary },
  heroSubtitle: { fontSize: 13, color: theme.colors.mutedForeground },
  cardWrapper: { marginBottom: 12 },
  name: { fontSize: 16, fontWeight: "600", marginBottom: 6, color: theme.colors.foreground },
  muted: { color: theme.colors.mutedForeground, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center" },
});
