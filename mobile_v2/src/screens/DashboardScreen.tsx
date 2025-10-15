import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAppContext } from "../context/AppContext";
import { STUDY_SUBJECTS } from "../data/mockData";
import { Study } from "../types";
import { colors, radii, shadows } from "../styles/theme";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

type StudyFilterType = "all" | "online" | "offline";

interface QuickStatProps {
  label: string;
  value: string;
}

const QuickStat = ({ label, value }: QuickStatProps) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const StudyCard = ({
  study,
  isFavorite,
  onPress,
  onToggleFavorite,
}: {
  study: Study;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}) => {
  const statusText =
    study.status === "recruiting"
      ? "모집중"
      : study.status === "active"
      ? "진행중"
      : "종료";

  return (
    <Pressable style={styles.studyCard} onPress={onPress}>
      <View style={styles.studyHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.studyTitle} numberOfLines={1}>
            {study.name}
          </Text>
          <Text style={styles.studyOwner}>{study.ownerNickname}</Text>
        </View>
        <Pressable onPress={onToggleFavorite} hitSlop={10}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? colors.favorite : colors.textSecondary}
          />
        </Pressable>
      </View>

      <Text style={styles.studyDescription} numberOfLines={3}>
        {study.description}
      </Text>

      <View style={styles.tagRow}>
        {study.tags.slice(0, 3).map(tag => (
          <View key={tag} style={styles.tagBadge}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
        {study.tags.length > 3 && (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>+{study.tags.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.metaSection}>
        <View style={styles.metaItem}>
          <Ionicons
            name={study.type === "online" ? "wifi" : "location"}
            size={16}
            color={colors.textSecondary}
            style={styles.metaIcon}
          />
          <Text style={styles.metaText} numberOfLines={1}>
            {study.type === "online"
              ? "온라인"
              : study.regionDetail?.dongEupMyeon ?? study.region}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people" size={16} color={colors.textSecondary} style={styles.metaIcon} />
          <Text style={styles.metaText}>
            {study.currentMembers}/{study.maxMembers}명
          </Text>
        </View>
        <View style={[styles.statusBadge, styles[`status_${study.status}` as const]]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigation>();
  const { studies, favoriteStudyIds, toggleFavorite, user } = useAppContext();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<StudyFilterType>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredStudies = useMemo(() => {
    return studies.filter(study => {
      if (onlyFavorites && !favoriteStudyIds.includes(study.id)) {
        return false;
      }
      if (subjectFilter !== "all" && study.subject !== subjectFilter) {
        return false;
      }
      if (typeFilter !== "all" && study.type !== typeFilter) {
        return false;
      }
      if (searchKeyword.trim().length > 0) {
        const keyword = searchKeyword.toLowerCase();
        return (
          study.name.toLowerCase().includes(keyword) ||
          study.description.toLowerCase().includes(keyword) ||
          study.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
      }
      return true;
    });
  }, [studies, favoriteStudyIds, onlyFavorites, subjectFilter, typeFilter, searchKeyword]);

  const activeStudies = useMemo(
    () => studies.filter(study => study.status !== "completed").length,
    [studies],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }] }>
      <LinearGradient colors={[colors.surface, colors.background]} style={styles.hero}>
        <Text style={styles.heroGreeting}>{user ? `${user.nickname}님,` : "스터디어,"}</Text>
        <Text style={styles.heroHeadline}>반가워요 👋</Text>
        <Text style={styles.heroSubtext}>
          원하는 스터디를 찾거나 새로운 모임을 만들어 보세요.
        </Text>
      </LinearGradient>

      <View style={styles.statsRow}>
        <QuickStat label="전체 스터디" value={`${studies.length}개`} />
        <QuickStat label="진행중" value={`${activeStudies}개`} />
        <QuickStat label="즐겨찾기" value={`${favoriteStudyIds.length}개`} />
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="키워드로 스터디 검색"
        placeholderTextColor={colors.textSecondary}
        value={searchKeyword}
        onChangeText={setSearchKeyword}
      />

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterChip, onlyFavorites && styles.filterChipActive]}
          onPress={() => setOnlyFavorites(prev => !prev)}
        >
          <Text style={[styles.filterChipText, onlyFavorites && styles.filterChipTextActive]}>
            즐겨찾기
          </Text>
        </Pressable>
        {(["all", "online", "offline"] as StudyFilterType[]).map(option => {
          const isActive = typeFilter === option;
          return (
            <Pressable
              key={option}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setTypeFilter(option)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {option === "all" ? "전체" : option === "online" ? "온라인" : "오프라인"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ value: "all", label: "전체" }, ...STUDY_SUBJECTS]}
        keyExtractor={item => item.value}
        contentContainerStyle={styles.subjectList}
        renderItem={({ item }) => {
          const isActive = subjectFilter === item.value;
          return (
            <Pressable
              style={[styles.subjectChip, isActive && styles.subjectChipActive]}
              onPress={() => setSubjectFilter(item.value)}
            >
              <Text style={[styles.subjectChipText, isActive && styles.subjectChipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={filteredStudies}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <StudyCard
            study={item}
            isFavorite={favoriteStudyIds.includes(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onPress={() => navigation.navigate("StudyDetail", { studyId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="compass" size={36} color={colors.textSecondary} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>조건에 맞는 스터디가 없어요.</Text>
            <Text style={styles.emptyDescription}>
              필터를 조정하거나 새로운 스터디를 생성해 보세요.
            </Text>
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
  },
  hero: {
    borderRadius: radii.xl,
    paddingVertical: 24,
    paddingHorizontal: 22,
    marginBottom: 18,
    ...shadows.card,
  },
  heroGreeting: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  heroHeadline: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginTop: 4,
  },
  heroSubtext: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  statLabel: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
  },
  searchInput: {
    backgroundColor: colors.overlay,
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    color: colors.text,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.chipBackground,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
  },
  filterChipActive: {
    backgroundColor: colors.chipActiveBackground,
    borderColor: colors.chipActiveBackground,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.chipActiveText,
  },
  subjectList: {
    paddingVertical: 6,
    gap: 10,
    marginBottom: 12,
  },
  subjectChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.lg,
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    marginRight: 10,
  },
  subjectChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subjectChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  subjectChipTextActive: {
    color: colors.primaryForeground,
  },
  listContent: {
    paddingBottom: 40,
    gap: 16,
  },
  studyCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  studyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  studyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  studyOwner: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
  studyDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: colors.overlay,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  metaSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "35%",
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  status_recruiting: {
    backgroundColor: colors.overlay,
  },
  status_active: {
    backgroundColor: colors.secondary,
  },
  status_completed: {
    backgroundColor: colors.accent,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  emptyState: {
    marginTop: 80,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
