// src/screens/CreateStudyScreen.tsx
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DateTimePicker, {
  AndroidEvent,
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "../components/Screen";
import Input from "../components/Input";
import Button from "../components/Button";
import Select, { Option } from "../components/Select";
import Badge from "../components/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/Card";
import theme from "../styles/theme";
import { KOREA_REGIONS } from "../data/regions";
import { STUDY_SUBJECTS } from "../data/subjects";
import { ArrowLeft, BookOpen, Plus, X } from "lucide-react-native";

import { createStudy } from "../services/studyServices"; // ✅ 서버 호출
import { useAuth } from "../context/AuthContext"; // ✅ 로그인 정보

type StudyType = "online" | "offline";
type DurationType = "short" | "long";

const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function CreateStudyScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth(); // ✅ 현재 로그인중인 유저(없으면 null)

  // ---- form state ----
  const [name, setName] = useState("");
  const [subject, setSubject] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const [type, setType] = useState<StudyType | null>(null);
  const [sido, setSido] = useState<string | null>(null);
  const [sigungu, setSigungu] = useState<string | null>(null);
  const [dongEupMyeon, setDongEupMyeon] = useState("");

  const [duration, setDuration] = useState<DurationType | null>(null);

  // 단기 기간(주/일) 중 택1
  const [weekDuration, setWeekDuration] = useState<string | null>(null);
  const [dayDuration, setDayDuration] = useState<string | null>(null);

  const [maxMembers, setMaxMembers] = useState<number>(6);

  const today = useMemo(() => new Date(), []);
  const oneWeekLater = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }, []);

  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(oneWeekLater);

  // DateTimePicker 표시 여부 (iOS 전용 인라인)
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Android 전용 다이얼로그
  const openAndroidPicker = (which: "start" | "end") => {
    DateTimePickerAndroid.open({
      value: which === "start" ? startDate : endDate,
      mode: "date",
      onChange: (_e, date) => {
        if (!date) return;
        which === "start" ? setStartDate(date) : setEndDate(date);
      },
      minimumDate: which === "end" ? startDate : undefined,
    });
  };

  // ---- derived options ----
  const availableSigungu = useMemo(
    () => (sido ? KOREA_REGIONS[sido] ?? [] : []),
    [sido]
  );

  const subjectOptions: Option[] = useMemo(
    () => STUDY_SUBJECTS.map((s) => ({ label: s.label, value: s.value })),
    []
  );
  const sidoOptions: Option[] = useMemo(
    () =>
      Object.keys(KOREA_REGIONS).map((s) => ({ label: s, value: s })),
    []
  );
  const sigunguOptions: Option[] = useMemo(
    () =>
      availableSigungu.map((g) => ({ label: g, value: g })),
    [availableSigungu]
  );
  const maxMemberOptions: Option[] = useMemo(
    () =>
      [4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((n) => ({
        label: `${n}명`,
        value: String(n),
      })),
    []
  );
  const weekOptions: Option[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => i + 1).map((w) => ({
        label: `${w}주`,
        value: String(w),
      })),
    []
  );
  const dayOptions: Option[] = useMemo(
    () =>
      [7, 14, 21, 30, 45, 60, 90].map((d) => ({
        label: `${d}일`,
        value: String(d),
      })),
    []
  );

  // ---- helpers ----
  const addTag = () => {
    const t = newTag.trim();
    if (!t || tags.includes(t) || tags.length >= 5) return;
    setTags((prev) => [...prev, t]);
    setNewTag("");
  };
  const removeTag = (t: string) =>
    setTags((prev) => prev.filter((x) => x !== t));

  const onChangeSido = (v: string) => {
    setSido(v);
    setSigungu(null);
    setDongEupMyeon("");
  };

  // 주 단위/일 단위 택1
  const onChangeWeek = (v: string | null) => {
    setWeekDuration(v);
    if (v) setDayDuration(null);
  };
  const onChangeDay = (v: string | null) => {
    setDayDuration(v);
    if (v) setWeekDuration(null);
  };

  const datesOk = startDate.getTime() <= endDate.getTime();

  const canSubmit =
    !!name.trim() &&
    !!subject &&
    !!description.trim() &&
    !!type &&
    (type === "online" ||
      (!!sido && !!sigungu && !!dongEupMyeon.trim())) &&
    !!duration &&
    datesOk &&
    (duration === "long" || !!weekDuration || !!dayDuration);

  // ---- submit ----
  const submit = async () => {
    if (!canSubmit) {
      if (!datesOk) {
        Alert.alert(
          "확인",
          "날짜를 확인하세요 (시작일은 종료일 이전/같아야 합니다)"
        );
      } else {
        Alert.alert("확인", "필수 정보를 모두 입력해주세요");
      }
      return;
    }

    if (!user) {
      Alert.alert(
        "로그인 필요",
        "스터디를 만들려면 먼저 로그인하세요."
      );
      return;
    }

    // 서버와 맞는 payload
    const payload = {
      name,
      subject,
      description,
      tags,
      type,
      regionDetail:
        type === "offline"
          ? { sido, sigungu, dongEupMyeon }
          : undefined,
      duration,
      weekDuration,
      dayDuration,
      maxMembers,
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      createdByUserId: user.user_id, // ✅ FK용
    };

    try {
      const result = await createStudy(payload);
      // 예상 result: { study_id, status: "OK" }

      Alert.alert(
        "성공",
        "스터디가 성공적으로 생성되었습니다!",
        [
          {
            text: "확인",
            onPress: () => navigation?.goBack?.(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        "오류",
        err.message || "스터디 생성 중 문제가 발생했습니다."
      );
    }
  };

  // UI 내에서 기간 토글에 쓰는 작은 버튼
  const SegButton = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Button
      variant={active ? "secondary" : "outline"}
      size="sm"
      style={[
        { flex: 1 },
        active && { backgroundColor: theme.color.secondary },
      ]}
      onPress={onPress}
    >
      {label}
    </Button>
  );

  return (
    <Screen>
      {/* 헤더 */}
      <View style={S.header}>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => navigation?.goBack?.()}
          style={{ paddingHorizontal: 8 }}
        >
          <ArrowLeft size={16} color={theme.color.text} />
        </Button>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            flex: 1,
          }}
        >
          <BookOpen size={20} color={theme.color.primary} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.color.text,
            }}
          >
            스터디 만들기
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 96 + insets.bottom,
          }}
        >
          {/* 기본 정보 */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle style={{ fontSize: 16 }}>기본 정보</CardTitle>
              <CardDescription>
                스터디의 기본 정보를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent style={{ gap: 12 }}>
              <View>
                <Text style={S.label}>스터디 이름 *</Text>
                <Input
                  placeholder="예: 토익 900점 달성하기"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View>
                <Text style={S.label}>주제 *</Text>
                <Select
                  value={subject}
                  onChange={setSubject}
                  placeholder="주제를 선택하세요"
                  options={subjectOptions}
                />
              </View>

              <View>
                <Text style={S.label}>설명 *</Text>
                <View style={S.textareaWrap}>
                  <Input
                    multiline
                    style={S.textarea}
                    placeholder="스터디에 대한 자세한 설명을 입력하세요"
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>
              </View>

              <View>
                <Text style={S.label}>태그 (최대 5개)</Text>
                <View
                  style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}
                >
                  <Input
                    placeholder="태그 입력 후 추가 버튼 클릭"
                    value={newTag}
                    onChangeText={setNewTag}
                    onSubmitEditing={addTag}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={addTag}
                  >
                    <Plus size={16} color={theme.color.text} />
                  </Button>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      style={{ paddingRight: 4 }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Text style={{ fontSize: 12 }}>{tag}</Text>
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() =>
                            setTags((prev) =>
                              prev.filter((x) => x !== tag)
                            )
                          }
                          style={{ padding: 4 }}
                        >
                          <X size={12} color={theme.color.text} />
                        </Button>
                      </View>
                    </Badge>
                  ))}
                </View>
              </View>
            </CardContent>
          </Card>

          {/* 장소 및 방식 */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle style={{ fontSize: 16 }}>
                장소 및 방식
              </CardTitle>
            </CardHeader>
            <CardContent style={{ gap: 12 }}>
              <View>
                <Text style={S.label}>진행 방식 *</Text>
                <View style={S.segment}>
                  <SegButton
                    label="오프라인 (대면)"
                    active={type === "offline"}
                    onPress={() => setType("offline")}
                  />
                  <SegButton
                    label="온라인 (비대면)"
                    active={type === "online"}
                    onPress={() => setType("online")}
                  />
                </View>
              </View>

              {type === "offline" && (
                <View
                  style={{
                    gap: 12,
                    backgroundColor: "#f6f7fa",
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.color.border,
                  }}
                >
                  <View>
                    <Text style={S.label}>시/도 *</Text>
                    <Select
                      value={sido}
                      onChange={onChangeSido}
                      placeholder="시/도를 선택하세요"
                      options={sidoOptions}
                    />
                  </View>

                  {sido && (
                    <View>
                      <Text style={S.label}>시/군/구 *</Text>
                      <Select
                        value={sigungu}
                        onChange={setSigungu}
                        placeholder="시/군/구를 선택하세요"
                        options={sigunguOptions}
                      />
                    </View>
                  )}

                  {sido && sigungu && (
                    <View>
                      <Text style={S.label}>동/읍/면 *</Text>
                      <Input
                        placeholder="예: 역삼동"
                        value={dongEupMyeon}
                        onChangeText={setDongEupMyeon}
                      />
                    </View>
                  )}
                </View>
              )}

              <View>
                <Text style={S.label}>최대 인원</Text>
                <Select
                  value={String(maxMembers)}
                  onChange={(v) => {
                    if (!v) return;
                    const n = parseInt(v, 10);
                    if (!Number.isNaN(n)) {
                      setMaxMembers(n);
                    }
                  }}
                  options={maxMemberOptions}
                  placeholder="선택"
                />
              </View>
            </CardContent>
          </Card>

          {/* 진행 기간 */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle style={{ fontSize: 16 }}>
                진행 기간
              </CardTitle>
            </CardHeader>
            <CardContent style={{ gap: 12 }}>
              <View>
                <Text style={S.label}>기간 유형 *</Text>
                <View style={S.segment}>
                  <SegButton
                    label="단기 (12주 이하, 진행률 관리)"
                    active={duration === "short"}
                    onPress={() => setDuration("short")}
                  />
                  <SegButton
                    label="장기 (12주 초과, 지속적 학습)"
                    active={duration === "long"}
                    onPress={() => setDuration("long")}
                  />
                </View>
              </View>

              {duration === "short" && (
                <View
                  style={{
                    gap: 12,
                    backgroundColor: "#f6f7fa",
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.color.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.color.mutedText,
                    }}
                  >
                    단기 스터디는{" "}
                    <Text
                      style={{
                        fontWeight: "700",
                        color: theme.color.text,
                      }}
                    >
                      주 단위
                    </Text>
                    와{" "}
                    <Text
                      style={{
                        fontWeight: "700",
                        color: theme.color.text,
                      }}
                    >
                      일 단위
                    </Text>{" "}
                    중{" "}
                    <Text
                      style={{
                        fontWeight: "700",
                        color: theme.color.text,
                      }}
                    >
                      하나만 설정
                    </Text>
                    할 수 있습니다. (택1)
                  </Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={S.label}>주 단위 기간</Text>
                      <Select
                        value={weekDuration}
                        onChange={onChangeWeek}
                        placeholder="주 선택"
                        options={weekOptions}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={S.label}>일 단위 기간</Text>
                      <Select
                        value={dayDuration}
                        onChange={onChangeDay}
                        placeholder="일 선택"
                        options={dayOptions}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* 날짜 선택 */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={S.label}>시작일 *</Text>
                  <Pressable
                    onPress={() =>
                      Platform.OS === "android"
                        ? openAndroidPicker("start")
                        : setShowStartPicker(true)
                    }
                  >
                    <View pointerEvents="none">
                      <Input value={fmt(startDate)} editable={false} />
                    </View>
                  </Pressable>

                  {showStartPicker &&
                    (Platform.OS === "ios" ? (
                      <View style={S.iosPicker}>
                        <DateTimePicker
                          value={startDate}
                          mode="date"
                          display="spinner"
                          onChange={(_e: any, date?: Date) => {
                            if (date) setStartDate(date);
                          }}
                        />
                        <Button
                          size="sm"
                          onPress={() => setShowStartPicker(false)}
                          style={{ alignSelf: "flex-end" }}
                        >
                          완료
                        </Button>
                      </View>
                    ) : null)}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={S.label}>종료일 *</Text>
                  <Pressable
                    onPress={() =>
                      Platform.OS === "android"
                        ? openAndroidPicker("end")
                        : setShowEndPicker(true)
                    }
                  >
                    <View pointerEvents="none">
                      <Input value={fmt(endDate)} editable={false} />
                    </View>
                  </Pressable>

                  {showEndPicker &&
                    (Platform.OS === "ios" ? (
                      <View style={S.iosPicker}>
                        <DateTimePicker
                          value={endDate}
                          mode="date"
                          display="spinner"
                          minimumDate={startDate}
                          onChange={(_e: any, date?: Date) => {
                            if (date) setEndDate(date);
                          }}
                        />
                        <Button
                          size="sm"
                          onPress={() => setShowEndPicker(false)}
                          style={{ alignSelf: "flex-end" }}
                        >
                          완료
                        </Button>
                      </View>
                    ) : null)}
                </View>
              </View>
            </CardContent>
          </Card>

          {/* 스터디장 정보 */}
          <Card style={{ marginTop: 12 }}>
            <CardHeader>
              <CardTitle style={{ fontSize: 16 }}>
                스터디장 정보
              </CardTitle>
              <CardDescription>자동으로 표시됩니다</CardDescription>
            </CardHeader>
            <CardContent>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: "#f6f7fa",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.color.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: theme.color.onPrimary,
                      fontWeight: "600",
                    }}
                  >
                    {user?.nickname
                      ? user.nickname.slice(0, 1).toUpperCase()
                      : "U"}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontWeight: "600" }}>
                    {user?.nickname ?? "닉네임"}
                  </Text>
                  <Text
                    style={{
                      color: theme.color.mutedText,
                      fontSize: 12,
                    }}
                  >
                    {user?.role ?? "역할"}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 하단 제출 버튼 */}
      <View
        style={[
          S.footer,
          { paddingBottom: 12 + insets.bottom },
        ]}
      >
        <Button
          size="lg"
          onPress={submit}
          style={{ flex: 1 }}
          disabled={!canSubmit}
        >
          스터디 만들기
        </Button>
      </View>
    </Screen>
  );
}

const S = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    paddingVertical: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: theme.color.text,
    marginBottom: 6,
  },
  textareaWrap: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  textarea: {
    minHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.color.text,
  },
  segment: {
    flexDirection: "row",
    gap: 8,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.color.bg,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iosPicker: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    padding: 8,
  },
});
