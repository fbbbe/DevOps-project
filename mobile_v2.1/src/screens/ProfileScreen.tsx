import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Screen from "../components/Screen";
import theme from "../styles/theme";
import Button from "../components/Button";
import Input from "../components/Input";
import Badge from "../components/Badge";
import ProgressBar from "../components/ProgressBar";
import SegmentTabs from "../components/SegmentTabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/Card";
import {
  ArrowLeft,
  BookOpen,
  Edit,
  Save,
  X,
  Bell,
  Lock,
  MessageCircle,
  LogOut,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchStudies, type Study } from "../services/studyServices";
import { updateNickname as updateNicknameApi } from "../services/authService";
import { useAuth } from "../context/AuthContext";

type TabKey = "history" | "achievements";

type AchievementItem = {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  icon: string;
};

const STATUS_LABEL: Record<Study["status"], string> = {
  recruiting: "모집중",
  active: "진행중",
  completed: "완료",
};

const TYPE_LABEL: Record<Study["type"], string> = {
  online: "온라인",
  offline: "오프라인",
};

const STAT_CARDS = [
  { id: "participated", label: "참여한 스터디", helper: "모든 스터디" },
  { id: "completed", label: "완료한 스터디", helper: "성공적으로 마무리" },
  { id: "recruiting", label: "모집중 스터디", helper: "새로운 인원을 기다려요" },
  { id: "progress", label: "평균 진행률", helper: "진행 현황" },
];

const STAT_COLORS = ["#e8f1ff", "#e9fbf3", "#f3edff", "#fff4e8"];

const ACHIEVEMENTS = [
  {
    id: "first",
    name: "첫 스터디 개설",
    description: "처음으로 스터디를 개설했어요.",
    icon: "🏅",
    requires: { total: 1 },
  },
  {
    id: "active",
    name: "활발한 진행",
    description: "진행중인 스터디가 있어요.",
    icon: "🌟",
    requires: { active: 1 },
  },
  {
    id: "closer",
    name: "완주 달성",
    description: "완료한 스터디가 세 개 이상이에요.",
    icon: "🔥",
    requires: { completed: 3 },
  },
  {
    id: "power",
    name: "파워 호스트",
    description: "다섯 개 이상의 스터디를 운영했어요.",
    icon: "🎯",
    requires: { total: 5 },
  },
];

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user: authUser, setUser } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("history");
  const [editing, setEditing] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    studyReminder: true,
    attendanceAlert: true,
    chatMessages: false,
    weeklyReport: true,
  });
  const [contactCategory, setContactCategory] = useState<string>("");
  const [contactSubject, setContactSubject] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");

  useEffect(() => {
    setNicknameDraft(authUser?.nickname ?? "");
  }, [authUser?.nickname]);

  useEffect(() => {
    if (!authUser) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchStudies();
        setStudies(list);
      } catch (err) {
        const message = err instanceof Error ? err.message : "스터디 정보를 불러올 수 없습니다.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authUser?.user_id]);

  const myStudies = useMemo(() => {
    if (!authUser) return [];
    const myId = String(authUser.user_id);
    return studies.filter((study) => String(study.ownerId) === myId);
  }, [studies, authUser]);

  const stats = useMemo(() => {
    const total = myStudies.length;
    const recruiting = myStudies.filter((study) => study.status === "recruiting").length;
    const active = myStudies.filter((study) => study.status === "active").length;
    const completed = myStudies.filter((study) => study.status === "completed").length;
    const averageProgress = total
      ? Math.round(
          myStudies.reduce((sum, study) => sum + (Number(study.progress) || 0), 0) / total,
        )
      : 0;

    return { total, recruiting, active, completed, averageProgress };
  }, [myStudies]);

  const statCards = useMemo(() => {
    return STAT_CARDS.map((card) => {
      if (card.id === "participated") return { ...card, value: stats.total };
      if (card.id === "completed") return { ...card, value: stats.completed };
      if (card.id === "recruiting") return { ...card, value: stats.recruiting };
      if (card.id === "progress") return { ...card, value: `${stats.averageProgress}%` };
      return card;
    });
  }, [stats]);

  const achievements = useMemo<AchievementItem[]>(() => {
    return ACHIEVEMENTS.map((item) => {
      const { total, active, completed } = stats;
      const achieved =
        (item.requires.total ? total >= item.requires.total : true) &&
        (item.requires.active ? active >= item.requires.active : true) &&
        (item.requires.completed ? completed >= item.requires.completed : true);
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        achieved,
        icon: item.icon,
      };
    });
  }, [stats]);

  const handleSaveNickname = async () => {
    if (!authUser) return;
    const trimmed = nicknameDraft.trim();
    if (!trimmed) {
      Alert.alert("안내", "닉네임을 입력해 주세요.");
      return;
    }
    try {
      setSavingNickname(true);
      const { user, token } = await updateNicknameApi(trimmed);
      if (token) {
        await AsyncStorage.setItem("userToken", token);
      }
      setUser({ ...user, token });
      setEditing(false);
      Alert.alert("완료", "닉네임이 수정되었습니다.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "닉네임을 수정할 수 없습니다.";
      Alert.alert("오류", message);
    } finally {
      setSavingNickname(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
    } catch {
      // ignore storage error
    }
    setUser(null);
    navigation.reset({ index: 0, routes: [{ name: "로그인" }] });
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const submitContact = () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      Alert.alert("안내", "문의 제목과 내용을 입력해 주세요.");
      return;
    }
    Alert.alert("문의 접수", "문의가 접수되었습니다. 빠르게 답변 드릴게요.");
    setContactCategory("");
    setContactSubject("");
    setContactMessage("");
    setContactOpen(false);
  };

  if (!authUser) {
    return (
      <Screen withPadding={false}>
        <View style={styles.headerPlaceholder} />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>로그인 후 프로필 정보를 확인할 수 있습니다.</Text>
        </View>
      </Screen>
    );
  }

  const initials =
    authUser.nickname?.slice(0, 2).toUpperCase() ??
    authUser.email?.slice(0, 2).toUpperCase() ??
    "ME";

  return (
    <Screen withPadding={false}>
      <View style={styles.pageHeader}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack?.()}>
          <ArrowLeft size={22} color={theme.color.text} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <BookOpen size={18} color={theme.color.primary} />
          <Text style={styles.headerTitle}>프로필</Text>
        </View>
        <Pressable style={styles.headerIcon} onPress={handleLogout}>
          <LogOut size={20} color={theme.color.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <CardContent style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{initials}</Text>
            </View>

            <View style={styles.profileInfo}>
              {editing ? (
                <Input
                  value={nicknameDraft}
                  onChangeText={setNicknameDraft}
                  autoCapitalize="none"
                  style={{ textAlign: "center" }}
                />
              ) : (
                <Text style={styles.profileName}>{authUser.nickname || "닉네임 없음"}</Text>
              )}
              <Text style={styles.profileMeta}>{authUser.email}</Text>
              <Text style={styles.profileMeta}>
                권한: {authUser.role === "ADMIN" ? "관리자" : "일반 사용자"}
              </Text>
              <Text style={styles.profileMeta}>
                상태: {authUser.status === "ACTIVE" ? "활성" : authUser.status}
              </Text>
            </View>

            <View style={styles.profileActions}>
              {editing ? (
                <>
                  <Button
                    size="sm"
                    style={{ flex: 1 }}
                    onPress={handleSaveNickname}
                    disabled={savingNickname}
                    leftIcon={<Save size={14} color={theme.color.onPrimary} />}
                  >
                    {savingNickname ? "저장중..." : "저장"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ flex: 1 }}
                    onPress={() => {
                      setNicknameDraft(authUser.nickname ?? "");
                      setEditing(false);
                    }}
                    leftIcon={<X size={14} color={theme.color.text} />}
                  >
                    취소
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => setEditing(true)}
                  leftIcon={<Edit size={14} color={theme.color.text} />}
                >
                  닉네임 수정
                </Button>
              )}
            </View>
          </CardContent>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <CardHeader>
            <CardTitle>활동 통계</CardTitle>
            <CardDescription>내 스터디 기록을 한눈에 볼 수 있어요.</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.statsGrid}>
              {statCards.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.statBox,
                    { backgroundColor: STAT_COLORS[index % STAT_COLORS.length] },
                  ]}
                >
                  <Text style={styles.statLabel}>{item.label}</Text>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statHelper}>{item.helper}</Text>
                </View>
              ))}
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.metaTitle}>평균 진행률</Text>
              <ProgressBar value={stats.averageProgress} />
              <Text style={styles.metaText}>{stats.averageProgress}%</Text>
            </View>
          </CardContent>
        </Card>

        <View style={{ marginTop: 24 }}>
          <SegmentTabs
            value={tab}
            onChange={(value) => setTab(value as TabKey)}
            tabs={[
              { value: "history", label: "스터디 기록" },
              { value: "achievements", label: "성취" },
            ]}
          />
        </View>

        <View style={{ marginTop: 16, gap: 12 }}>
          {loading && (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color={theme.color.primary} />
            </View>
          )}

          {!!error && !loading && <Text style={styles.errorText}>{error}</Text>}

          {tab === "history" && !loading && (
            <>
              {myStudies.length === 0 ? (
                <View style={styles.emptyBox}>
                  <BookOpen size={20} color={theme.color.mutedText} />
                  <Text style={styles.emptyText}>
                    아직 내가 개설한 스터디가 없어요. 새로운 스터디를 만들어보세요!
                  </Text>
                </View>
              ) : (
                myStudies.map((study) => (
                  <Card key={study.id}>
                    <Pressable
                      onPress={() =>
                        navigation.navigate("StudyDetail", {
                          study,
                          user: authUser,
                          isMember: true,
                        })
                      }
                    >
                      <CardHeader>
                        <CardTitle>{study.name}</CardTitle>
                        <CardDescription>{study.subject || "기타"}</CardDescription>
                      </CardHeader>
                      <CardContent style={{ gap: 10 }}>
                        <View style={styles.historyHeader}>
                          <View style={styles.badgeRow}>
                            <Badge variant="outline">멤버</Badge>
                            <Badge variant="secondary">{STATUS_LABEL[study.status]}</Badge>
                          </View>
                          <Text style={styles.metaText}>
                            인원 {study.currentMembers}/{study.maxMembers}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.metaText}>진행률 {study.progress ?? 0}%</Text>
                          <ProgressBar value={study.progress ?? 0} />
                        </View>
                        <Text style={styles.metaText}>
                          시작일 {study.startDate}
                          {study.endDate ? ` · 종료일 ${study.endDate}` : ""}
                        </Text>
                      </CardContent>
                    </Pressable>
                  </Card>
                ))
              )}
            </>
          )}

          {tab === "achievements" && !loading && (
            <View style={{ gap: 12 }}>
              {achievements.map((item) => (
                <Card key={item.id}>
                  <CardContent style={styles.achievementRow}>
                    <View style={styles.achievementIconWrap}>
                      <Text style={styles.achievementIcon}>{item.icon}</Text>
                    </View>
                    <View style={styles.achievementInfo}>
                      <Text style={styles.achievementTitle}>{item.name}</Text>
                      <Text style={styles.metaText}>{item.description}</Text>
                    </View>
                    <Badge variant={item.achieved ? "default" : "outline"}>
                      {item.achieved ? "달성" : "미달성"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}
        </View>

        
          <CardContent style={{ gap: 12 }}>
            <Button
              variant="outline"
              onPress={handleLogout}
              style={{ borderColor: theme.color.destructive ?? "#B00020" }}
            >
              로그아웃
            </Button>
          </CardContent>
        
      </ScrollView>

      <Modal visible={notifOpen} animationType="slide" transparent>
        <Pressable style={styles.modalBackdrop} onPress={() => setNotifOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>알림 설정</Text>
              <Pressable onPress={() => setNotifOpen(false)}>
                <X size={18} color={theme.color.mutedText} />
              </Pressable>
            </View>
            {(
              [
                { key: "studyReminder", label: "스터디 시작 알림" },
                { key: "attendanceAlert", label: "출석 체크 알림" },
                { key: "chatMessages", label: "채팅 메시지 알림" },
                { key: "weeklyReport", label: "주간 보고서" },
              ] as Array<{ key: keyof typeof notifications; label: string }>
            ).map(({ key, label }) => {
              const active = notifications[key];
              return (
                <Pressable key={key} style={styles.toggleRow} onPress={() => toggleNotification(key)}>
                  <Text style={styles.toggleLabel}>{label}</Text>
                  <View style={[styles.toggleKnob, active && styles.toggleOn]}>
                    <View style={[styles.toggleThumb, active && styles.toggleThumbOn]} />
                  </View>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={privacyOpen} animationType="slide" transparent>
        <Pressable style={styles.modalBackdrop} onPress={() => setPrivacyOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>개인 정보 안내</Text>
              <Pressable onPress={() => setPrivacyOpen(false)}>
                <X size={18} color={theme.color.mutedText} />
              </Pressable>
            </View>
            <Text style={styles.metaText}>
              회원님의 개인정보는 스터디 운영 목적 외에는 사용되지 않으며, 언제든지 삭제를 요청하실 수 있습니다.
            </Text>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={contactOpen} animationType="slide" transparent>
        <Pressable style={styles.modalBackdrop} onPress={() => setContactOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>문의 보내기</Text>
              <Pressable onPress={() => setContactOpen(false)}>
                <X size={18} color={theme.color.mutedText} />
              </Pressable>
            </View>
            <View style={{ gap: 12 }}>
              <Text style={styles.modalLabel}>문의 유형</Text>
              <View style={styles.contactPills}>
                {[
                  { label: "서비스", value: "service" },
                  { label: "버그", value: "bug" },
                  { label: "기타", value: "etc" },
                ].map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setContactCategory(opt.value)}
                    style={[styles.contactPill, contactCategory === opt.value && styles.contactPillActive]}
                  >
                    <Text
                      style={
                        contactCategory === opt.value ? styles.contactPillActiveText : styles.contactPillText
                      }
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.modalLabel}>문의 제목</Text>
              <Input
                value={contactSubject}
                onChangeText={setContactSubject}
                placeholder="문의 제목을 입력해 주세요"
              />

              <Text style={styles.modalLabel}>문의 내용</Text>
              <TextInput
                value={contactMessage}
                onChangeText={setContactMessage}
                multiline
                placeholder="궁금한 내용을 자세히 작성해 주세요"
                placeholderTextColor={theme.color.mutedText}
                style={styles.contactTextarea}
              />

              <Button onPress={submitContact}>문의 보내기</Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.color.border,
    backgroundColor: theme.color.bg,
  },
  headerPlaceholder: {
    height: 60,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.color.text,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 16,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 8,
  },
  profileHeader: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 32,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.color.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.color.onSecondary,
  },
  profileInfo: {
    alignItems: "center",
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.color.text,
  },
  profileMeta: {
    fontSize: 14,
    color: theme.color.mutedText,
  },
  profileActions: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "stretch",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  statBox: {
    width: "48%",
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: "center",
    gap: 6,
    shadowColor: "#00000022",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.color.mutedText,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.color.text,
  },
  statHelper: {
    fontSize: 11,
    color: theme.color.mutedText,
  },
  metaTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.color.mutedText,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    color: theme.color.mutedText,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.color.border,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.color.mutedText,
    textAlign: "center",
  },
  errorText: {
    color: theme.color.destructive ?? "#B00020",
    textAlign: "center",
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 12,
  },
  achievementIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.color.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementIcon: {
    fontSize: 22,
  },
  achievementInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.color.text,
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quickButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.color.border,
    backgroundColor: "#fff",
    alignItems: "center",
    gap: 6,
  },
  quickLabel: {
    fontSize: 12,
    color: theme.color.text,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.color.text,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.color.text,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  toggleLabel: {
    color: theme.color.text,
    fontSize: 14,
  },
  toggleKnob: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleOn: {
    backgroundColor: theme.color.primary + "33",
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
  },
  toggleThumbOn: {
    alignSelf: "flex-end",
    backgroundColor: theme.color.primary,
  },
  contactPills: {
    flexDirection: "row",
    gap: 8,
  },
  contactPill: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.color.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  contactPillActive: {
    borderColor: theme.color.primary,
    backgroundColor: theme.color.primary + "11",
  },
  contactPillText: {
    fontSize: 12,
    color: theme.color.text,
  },
  contactPillActiveText: {
    fontSize: 12,
    color: theme.color.primary,
    fontWeight: "600",
  },
  contactTextarea: {
    minHeight: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.color.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    color: theme.color.text,
  },
});
