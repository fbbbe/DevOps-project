import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BookOpen, MessageSquare } from "lucide-react-native";

import Screen from "../components/Screen";
import { Card, CardContent, CardTitle } from "../components/Card";
import theme from "../styles/theme";
import { useAuth } from "../context/AuthContext";
import chatService from "../services/chatService";

const AVATAR_PALETTE = ["#E8F0FF", "#FFE8EC", "#E8FFF4", "#FFF4E8", "#F1E8FF", "#FFE8F8"] as const;

const mapStatusToLabel = (status?: string) => {
  switch (String(status ?? "").toUpperCase()) {
    case "OPEN":
      return "모집중";
    case "IN_PROGRESS":
      return "진행중";
    case "COMPLETED":
      return "완료";
    case "CLOSED":
      return "마감";
    default:
      return "";
  }
};

const mapTermToLabel = (term?: string) => {
  switch (String(term ?? "").toUpperCase()) {
    case "SHORT":
      return "단기";
    case "LONG":
      return "장기";
    case "WEEKLY":
      return "주간";
    case "MONTHLY":
      return "월간";
    default: {
      const raw = term?.trim();
      return raw ?? "";
    }
  }
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
};

const buildPeriodLabel = (start?: string, end?: string) => {
  const startDate = formatDate(start);
  const endDate = formatDate(end);
  if (startDate && endDate) return `${startDate} ~ ${endDate}`;
  if (startDate) return `${startDate} 시작`;
  if (endDate) return `${endDate} 종료`;
  return "";
};

const hashToIndex = (value: string | number | undefined, size: number) => {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.abs(value) % size;
  }
  let hash = 0;
  const str = String(value);
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) % size;
  }
  return Math.abs(hash) % size;
};

export default function ChatListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState<chatService.ChatListItem[]>([]);

  useEffect(() => {
    if (!user) {
      setChats([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await chatService.listMyChats();
        setChats(Array.isArray(list) ? list : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "채팅 목록을 불러오는 데 실패했어요.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.user_id]);

  const avatars = useMemo(() => AVATAR_PALETTE, []);

  const renderAvatar = (name: string, tintIndex: number) => {
    const display = name.trim().charAt(0).toUpperCase() || "스";
    const backgroundColor = avatars[tintIndex % avatars.length];
    return (
      <View style={[styles.avatar, { backgroundColor }]}
      >
        <Text style={styles.avatarTxt}>{display}</Text>
      </View>
    );
  };

  return (
    <Screen withPadding={false}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <BookOpen size={20} color={theme.color.primary} />
          <Text style={{ fontSize: 16, fontWeight: "700", color: theme.color.text }}>채팅</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={theme.color.primary} />
            <Text style={{ color: theme.color.mutedText, marginTop: 8 }}>채팅 목록을 불러오는 중입니다.</Text>
          </View>
        ) : error ? (
          <View style={styles.empty}>
            <Text style={{ color: theme.color.destructive ?? "#B00020" }}>{error}</Text>
          </View>
        ) : chats.length === 0 ? (
          <View style={styles.empty}>
            <MessageSquare size={48} color={theme.color.mutedText} />
            <Text style={{ color: theme.color.mutedText, marginTop: 8 }}>참여 중인 채팅이 없어요.</Text>
            <Text style={{ color: theme.color.mutedText, fontSize: 12, marginTop: 4 }}>
              스터디에 참여하면 채팅을 시작할 수 있어요.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {chats.map((chat, index) => {
              const key = chat?.studyId !== undefined && chat?.studyId !== null ? `chat-${chat.studyId}` : `chat-${index}`;

              const name = (() => {
                const trimmed = chat?.name?.trim();
                if (trimmed) return trimmed;
                if (chat?.studyId !== undefined && chat?.studyId !== null) {
                  return `스터디 #${String(chat.studyId)}`;
                }
                return "이름 없는 스터디";
              })();

              const tintIndex = hashToIndex(chat?.studyId ?? name, avatars.length);

              const statusLabel = mapStatusToLabel(chat.status);
              const termLabel = mapTermToLabel(chat.termType);
              const periodLabel = buildPeriodLabel(chat.startDate, chat.endDate);

              const metaPieces = [
                chat?.studyId !== undefined && chat?.studyId !== null ? `ID ${String(chat.studyId)}` : "",
                statusLabel && `상태 ${statusLabel}`,
                termLabel && `유형 ${termLabel}`,
                periodLabel,
              ]
                .filter(Boolean)
                .join(" · ");

              const description = chat?.description?.trim() ? chat.description : `${name} 스터디 소개가 준비 중이에요.`;

              return (
                <Pressable
                  key={key}
                  onPress={() =>
                    navigation?.navigate?.("채팅", {
                      study: {
                        id: chat.studyId,
                        name: chat.name,
                        description: chat.description,
                        currentMembers: chat.memberCount,
                      },
                      user,
                    })
                  }
                  style={{ borderRadius: 12, overflow: "hidden" }}
                >
                  <Card>
                    <CardContent style={{ padding: 14 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        {renderAvatar(name, tintIndex)}
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <CardTitle style={{ fontSize: 15 }} numberOfLines={1}>
                              {name}
                            </CardTitle>
                            <Text style={{ fontSize: 12, color: theme.color.mutedText }}>{`${chat.memberCount ?? 0}명`}</Text>
                          </View>
                          {metaPieces ? (
                            <Text style={styles.metaLine} numberOfLines={1}>
                              {metaPieces}
                            </Text>
                          ) : null}
                          <Text style={{ fontSize: 12, color: theme.color.mutedText }} numberOfLines={1}>
                            {description}
                          </Text>
                          {chat.lastMessageAt && (
                            <Text style={styles.chatMeta}>
                              최근 활동: {new Date(chat.lastMessageAt).toLocaleString()}
                            </Text>
                          )}
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: theme.color.onSecondary, fontWeight: "700", fontSize: 16 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 6 },
  loadingBox: { alignItems: "center", paddingVertical: 48 },
  metaLine: { fontSize: 11, color: theme.color.secondaryText ?? theme.color.mutedText, marginTop: 2 },
  chatMeta: { fontSize: 11, color: theme.color.mutedText, marginTop: 4 },
});
