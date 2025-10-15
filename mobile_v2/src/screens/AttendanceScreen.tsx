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
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAppContext } from "../context/AppContext";
import { colors, radii, shadows } from "../styles/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Attendance">;

export const AttendanceScreen = ({ route }: Props) => {
  const { studyId } = route.params;
  const { studies, attendanceSessions, createAttendanceSession, closeAttendanceSession } =
    useAppContext();

  const study = useMemo(
    () => studies.find(item => item.id === studyId),
    [studies, studyId],
  );

  const studySessions = useMemo(
    () =>
      attendanceSessions
        .filter(session => session.studyId === studyId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [attendanceSessions, studyId],
  );

  const handleGenerateCode = () => {
    const session = createAttendanceSession(studyId);
    Alert.alert("출석 코드 생성", `새로운 출석 코드: ${session.code}`);
  };

  const handleDeactivate = (sessionId: string) => {
    closeAttendanceSession(sessionId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="qr-code" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{study?.name ?? "출석 관리"}</Text>
          <Text style={styles.subtitle}>실시간 출석 코드를 생성하고 관리해 보세요.</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.generateButton} onPress={handleGenerateCode}>
        <Ionicons name="add" size={18} color={colors.primaryForeground} style={{ marginRight: 6 }} />
        <Text style={styles.generateButtonText}>출석 코드 생성하기</Text>
      </TouchableOpacity>

      <FlatList
        data={studySessions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View>
                <Text style={styles.sessionTitle}>
                  {new Date(item.date).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Text style={styles.sessionSubTitle}>
                  {new Date(item.date).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  item.isActive ? styles.statusBadgeActive : styles.statusBadgeClosed,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    item.isActive && styles.statusBadgeTextActive,
                  ]}
                >
                  {item.isActive ? "진행중" : "마감됨"}
                </Text>
              </View>
            </View>
            <Text style={styles.sessionCode}>CODE · {item.code}</Text>
            {item.isActive && (
              <TouchableOpacity
                style={styles.deactivateButton}
                onPress={() => handleDeactivate(item.id)}
              >
                <Ionicons
                  name="lock-closed"
                  size={14}
                  color={colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.deactivateText}>출석 마감하기</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="hourglass" size={34} color={colors.textSecondary} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>생성된 출석 코드가 없습니다.</Text>
            <Text style={styles.emptyDesc}>새로운 출석 코드를 생성하면 이곳에 표시됩니다.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
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
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.xl,
    marginBottom: 18,
    ...shadows.soft,
  },
  generateButtonText: {
    color: colors.primaryForeground,
    fontSize: 15,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 48,
    gap: 16,
  },
  sessionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  sessionSubTitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  statusBadgeActive: {
    backgroundColor: colors.secondary,
  },
  statusBadgeClosed: {
    backgroundColor: colors.overlay,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  statusBadgeTextActive: {
    color: colors.primary,
  },
  sessionCode: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 2,
  },
  deactivateButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    flexDirection: "row",
    alignItems: "center",
  },
  deactivateText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
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
