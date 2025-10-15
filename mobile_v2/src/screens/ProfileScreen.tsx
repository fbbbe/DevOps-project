import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { colors, radii, shadows } from "../styles/theme";

export const ProfileScreen = () => {
  const { user, studies, favoriteStudyIds, logout } = useAppContext();

  const favoriteStudies = useMemo(
    () => studies.filter(study => favoriteStudyIds.includes(study.id)),
    [studies, favoriteStudyIds],
  );

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠어요?", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.nickname?.charAt(0) ?? "유"}</Text>
        </View>
        <Text style={styles.nickname}>{user?.nickname ?? "스터디 유저"}</Text>
        <Text style={styles.email}>{user?.email ?? "이메일 미등록"}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>성별</Text>
            <Text style={styles.metaValue}>{user?.gender ?? "-"}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>참여 스터디</Text>
            <Text style={styles.metaValue}>{studies.length}개</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>즐겨찾기</Text>
            <Text style={styles.metaValue}>{favoriteStudies.length}개</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>즐겨찾는 스터디</Text>
          <Ionicons name="sparkles" size={18} color={colors.primary} />
        </View>
        <FlatList
          data={favoriteStudies}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.favoriteCard}>
              <Text style={styles.favoriteTitle}>{item.name}</Text>
              <Text style={styles.favoriteMeta}>
                {item.type === "online" ? "온라인" : "오프라인"} · {item.currentMembers}/
                {item.maxMembers}명
              </Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={28} color={colors.textSecondary} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>관심 있는 스터디를 즐겨찾기에 추가해 보세요.</Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    paddingVertical: 26,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    marginBottom: 20,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: colors.primaryForeground,
    fontSize: 30,
    fontWeight: "700",
  },
  nickname: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  email: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  metaCard: {
    backgroundColor: colors.overlay,
    borderRadius: radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    minWidth: 90,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  section: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  favoriteCard: {
    backgroundColor: colors.overlay,
    borderRadius: radii.lg,
    padding: 16,
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  favoriteMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.xl,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    ...shadows.soft,
  },
  logoutText: {
    color: colors.primaryForeground,
    fontWeight: "700",
    fontSize: 15,
  },
});
