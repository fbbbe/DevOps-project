import React, { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAppContext } from "../context/AppContext";
import { colors, radii, shadows } from "../styles/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Progress">;

export const ProgressScreen = ({ route }: Props) => {
  const { studyId } = route.params;
  const { studies, progressByStudy, toggleProgressCheckpoint } = useAppContext();

  const study = useMemo(
    () => studies.find(item => item.id === studyId),
    [studies, studyId],
  );

  const checkpoints = progressByStudy[studyId] ?? [];
  const completed = checkpoints.filter(item => item.completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="checkbox" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{study?.name ?? "학습 현황"}</Text>
          <Text style={styles.subtitle}>
            체크리스트를 업데이트하여 스터디 진척도를 공유하세요.
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryValue}>
          {completed} / {checkpoints.length}
        </Text>
        <Text style={styles.summaryLabel}>완료된 체크포인트</Text>
      </View>

      <FlatList
        data={checkpoints}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isDone = item.completed;
          return (
            <TouchableOpacity
              style={[styles.itemCard, isDone && styles.itemCardDone]}
              onPress={() => toggleProgressCheckpoint(studyId, item.id)}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemHeaderLeft}>
                  <View style={[styles.checkIcon, isDone && styles.checkIconDone]}>
                    <Ionicons
                      name={isDone ? "checkmark" : "ellipse-outline"}
                      size={16}
                      color={isDone ? colors.primaryForeground : colors.primary}
                    />
                  </View>
                  <Text style={[styles.itemTitle, isDone && styles.itemTitleDone]}>{item.title}</Text>
                </View>
                <Text style={styles.itemDue}>{item.dueDate}</Text>
              </View>
              <Text style={[styles.itemDesc, isDone && styles.itemDescDone]}>{item.description}</Text>
              <Text style={[styles.itemStatus, isDone && styles.itemStatusDone]}>
                {isDone
                  ? "완료됨 · 다시 누르면 되돌릴 수 있어요."
                  : "진행중 · 눌러서 완료 표시"}
              </Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="clipboard" size={34} color={colors.textSecondary} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>등록된 체크포인트가 없습니다.</Text>
            <Text style={styles.emptyDesc}>스터디 목표를 세분화해 팀원들과 공유해 보세요.</Text>
          </View>
        }
      />
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
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    marginBottom: 20,
  },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 22,
    ...shadows.soft,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primaryForeground,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#d5d8ff",
    marginTop: 6,
  },
  listContent: {
    paddingBottom: 48,
    gap: 16,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  itemCardDone: {
    backgroundColor: colors.overlay,
    borderColor: colors.secondary,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  checkIconDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    flexShrink: 1,
  },
  itemTitleDone: {
    color: colors.primary,
    textDecorationLine: "line-through",
    opacity: 0.8,
  },
  itemDue: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  itemDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 19,
  },
  itemDescDone: {
    color: colors.textSecondary,
  },
  itemStatus: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  itemStatusDone: {
    color: colors.primary,
  },
  emptyState: {
    marginTop: 80,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
