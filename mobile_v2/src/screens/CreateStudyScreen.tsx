import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAppContext } from "../context/AppContext";
import { STUDY_SUBJECTS } from "../data/mockData";
import { colors, radii, shadows } from "../styles/theme";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

const typeOptions: Array<{ value: "online" | "offline"; label: string }> = [
  { value: "online", label: "온라인" },
  { value: "offline", label: "오프라인" },
];

const durationOptions: Array<{ value: "short" | "long"; label: string }> = [
  { value: "short", label: "단기 (3개월 이하)" },
  { value: "long", label: "장기 (3개월 이상)" },
];

export const CreateStudyScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigation>();
  const { addStudy, user } = useAppContext();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("language");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("서울 / 온라인");
  const [type, setType] = useState<"online" | "offline">("online");
  const [duration, setDuration] = useState<"short" | "long">("short");
  const [startDate, setStartDate] = useState("2024-04-01");
  const [endDate, setEndDate] = useState("2024-06-30");
  const [maxMembers, setMaxMembers] = useState("8");
  const [tagsInput, setTagsInput] = useState("협업, 프로젝트");

  const canSubmit = useMemo(() => {
    return (
      name.trim() &&
      description.trim() &&
      region.trim() &&
      startDate.trim() &&
      endDate.trim() &&
      Number(maxMembers) > 0
    );
  }, [name, description, region, startDate, endDate, maxMembers]);

  const handleCreateStudy = () => {
    if (!canSubmit) {
      Alert.alert("입력 확인", "필수 항목을 모두 입력해 주세요.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);

    const study = addStudy(
      {
        name: name.trim(),
        subject,
        description: description.trim(),
        tags,
        region: region.trim(),
        type,
        duration,
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        maxMembers: Number(maxMembers),
      },
      user?.nickname ?? "스터디장",
    );

    Alert.alert("생성 완료", "새로운 스터디가 생성되었습니다.", [
      {
        text: "바로 확인",
        onPress: () => navigation.navigate("StudyDetail", { studyId: study.id }),
      },
    ]);

    setName("");
    setDescription("");
    setRegion("");
    setTagsInput("");
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <Text style={styles.title}>새로운 스터디 만들기</Text>
        <Text style={styles.subtitle}>
          목표와 일정을 세분화하면 참여할 팀원을 더 쉽게 만날 수 있어요.
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>스터디 이름</Text>
        <TextInput
          style={styles.input}
          placeholder="예: React Native 앱 출시 스터디"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />
      </View>

      <Text style={styles.label}>카테고리</Text>
      <View style={styles.chipContainer}>
        {STUDY_SUBJECTS.map(option => {
          const isActive = subject === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setSubject(option.value)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>스터디 소개</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="스터디 목표와 진행 방식을 설명해 주세요."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>진행 방식</Text>
          <View style={styles.toggleRow}>
            {typeOptions.map(option => {
              const isActive = type === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.toggleButton, isActive && styles.toggleButtonActive]}
                  onPress={() => setType(option.value)}
                >
                  <Text style={[styles.toggleButtonText, isActive && styles.toggleButtonTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>기간</Text>
          <View style={styles.toggleRow}>
            {durationOptions.map(option => {
              const isActive = duration === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.toggleButton, isActive && styles.toggleButtonActive]}
                  onPress={() => setDuration(option.value)}
                >
                  <Text style={[styles.toggleButtonText, isActive && styles.toggleButtonTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>시작일</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={startDate}
            onChangeText={setStartDate}
          />
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>종료일</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={endDate}
            onChangeText={setEndDate}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>지역 / 채널</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 서울 강남 / 줌"
            placeholderTextColor={colors.textSecondary}
            value={region}
            onChangeText={setRegion}
          />
        </View>
        <View style={[styles.rowItem, { flex: 0.4 }] }>
          <Text style={styles.label}>정원</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 10"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={maxMembers}
            onChangeText={setMaxMembers}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>태그 (쉼표 구분)</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 사이드프로젝트, 실전"
          placeholderTextColor={colors.textSecondary}
          value={tagsInput}
          onChangeText={setTagsInput}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleCreateStudy}
        disabled={!canSubmit}
      >
        <Text style={styles.submitButtonText}>스터디 생성하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  hero: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    ...shadows.card,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.overlay,
    fontSize: 14,
    color: colors.text,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.lg,
    backgroundColor: colors.chipBackground,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primaryForeground,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  rowItem: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    backgroundColor: colors.overlay,
    paddingVertical: 12,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: colors.primaryForeground,
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    paddingVertical: 16,
    alignItems: "center",
    ...shadows.soft,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.4,
  },
  submitButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: "700",
  },
});
