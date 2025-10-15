import React, { useMemo } from "react";
import {
  ScrollView,
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

type Props = NativeStackScreenProps<RootStackParamList, "StudyDetail">;

const statusLabel = {
  recruiting: "모집중",
  active: "진행중",
  completed: "종료",
} as const;

export const StudyDetailScreen = ({ route, navigation }: Props) => {
  const { studyId } = route.params;
  const { studies, favoriteStudyIds, toggleFavorite } = useAppContext();

  const study = useMemo(
    () => studies.find(item => item.id === studyId),
    [studies, studyId],
  );

  if (!study) {
    return (
      <View style={styles.missingContainer}>
        <Ionicons name="warning" size={36} color={colors.textSecondary} style={{ marginBottom: 16 }} />
        <Text style={styles.missingTitle}>스터디 정보를 찾을 수 없어요.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>뒤로가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFavorite = favoriteStudyIds.includes(study.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{study.name}</Text>
            <Text style={styles.owner}>{study.ownerNickname}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(study.id)}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={26}
              color={isFavorite ? colors.favorite : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.description}>{study.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기본 정보</Text>
        <InfoRow label="진행 방식" value={study.type === "online" ? "온라인" : "오프라인"} />
        <InfoRow label="진행 기간" value={`${study.startDate} ~ ${study.endDate}`} />
        <InfoRow label="모집 정원" value={`${study.currentMembers} / ${study.maxMembers}명`} />
        <InfoRow
          label="진행 지역"
          value={
            study.type === "online"
              ? "온라인"
              : study.regionDetail
              ? `${study.regionDetail.sido} ${study.regionDetail.sigungu} ${study.regionDetail.dongEupMyeon}`
              : study.region
          }
        />
        <InfoRow label="리더" value={study.ownerNickname} />
        <InfoRow label="상태" value={statusLabel[study.status]} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>태그</Text>
        <View style={styles.tagRow}>
          {study.tags.map(tag => (
            <View key={tag} style={styles.tagBadge}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>빠른 실행</Text>
        <ActionButton
          icon="qr-code"
          label="출석 코드 관리"
          description="실시간 출석 코드를 생성하고 공유하세요."
          onPress={() => navigation.navigate("Attendance", { studyId: study.id })}
        />
        <ActionButton
          icon="checkbox"
          label="학습 진행 확인"
          description="체크리스트로 진행 상황을 업데이트하세요."
          onPress={() => navigation.navigate("Progress", { studyId: study.id })}
        />
        <ActionButton
          icon="chatbubbles"
          label="스터디 채팅"
          description="팀원들과 대화를 나누고 공지 사항을 전달합니다."
          onPress={() => navigation.navigate("Chat", { studyId: study.id })}
          showDivider={false}
        />
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const ActionButton = ({
  icon,
  label,
  description,
  onPress,
  showDivider = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  showDivider?: boolean;
}) => (
  <TouchableOpacity onPress={onPress} style={[styles.actionButton, !showDivider && { borderBottomWidth: 0 }]}>
    <View style={styles.actionContent}>
      <View style={styles.actionIconWrapper}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 24,
    paddingBottom: 56,
    gap: 20,
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  owner: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.lg,
    backgroundColor: colors.overlay,
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  actionButton: {
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
  },
  actionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  actionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  missingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  missingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radii.lg,
  },
  backButtonText: {
    color: colors.primaryForeground,
    fontWeight: "600",
  },
});
