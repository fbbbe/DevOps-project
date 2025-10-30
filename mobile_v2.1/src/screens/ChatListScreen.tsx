import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import Screen from "../components/Screen";
import theme from "../styles/theme";
import { Card, CardContent, CardTitle } from "../components/Card";
import { BookOpen, MessageSquare } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import chatService from "../services/chatService";

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
        const message =
          err instanceof Error ? err.message : "채팅 목록을 불러오는 데 실패했어요.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.user_id]);

  const AvatarFallback = ({ name }: { name: string }) => {
    const display = (name?.trim?.() || "스터디").charAt(0).toUpperCase();
    return (
      <View style={styles.avatar}>
        <Text style={styles.avatarTxt}>{display}</Text>
      </View>
    );
  };

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
        return raw ? raw : "";
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

  return (
    <Screen withPadding={false}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <BookOpen size={20} color={theme.color.primary} />
          <Text style={{ fontSize: 16, fontWeight: "700", color: theme.color.text }}>
            채팅
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={theme.color.primary} />
            <Text style={{ color: theme.color.mutedText, marginTop: 8 }}>
              채팅 목록을 불러오는 중입니다.
            </Text>
          </View>
        ) : error ? (
          <View style={styles.empty}>
            <Text style={{ color: theme.color.destructive ?? "#B00020" }}>{error}</Text>
          </View>
        ) : chats.length === 0 ? (
          <View style={styles.empty}>
            <MessageSquare size={48} color={theme.color.mutedText} />
            <Text style={{ color: theme.color.mutedText, marginTop: 8 }}>
              참여 중인 채팅이 없어요.
            </Text>
            <Text style={{ color: theme.color.mutedText, fontSize: 12, marginTop: 4 }}>
              스터디에 참여하면 채팅을 시작할 수 있어요.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {chats.map((chat, index) => {
              const key =
                chat?.studyId !== undefined && chat?.studyId !== null
                  ? `chat-${String(chat.studyId)}`
                  : `chat-${index}`;

              const statusLabel = mapStatusToLabel(chat.status);
              const termLabel = mapTermToLabel(chat.termType);
              const periodLabel = buildPeriodLabel(chat.startDate, chat.endDate);

              const idLabel =
                chat?.studyId !== undefined && chat?.studyId !== null ? `ID ${String(chat.studyId)}` : "";

              const metaPieces = [
                idLabel,
                statusLabel && `상태 ${statusLabel}`,
                termLabel && `유형 ${termLabel}`,
                periodLabel,
              ]
                .filter(Boolean)
                .join(" · ");

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
                        <AvatarFallback name={chat.name ?? ""} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View
                          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                        >
                          <CardTitle style={{ fontSize: 15 }} numberOfLines={1}>
                            {chat.name}
                          </CardTitle>
                          <Text style={{ fontSize: 12, color: theme.color.mutedText }}>
                            {`${chat.memberCount ?? 0}명`}
                          </Text>
                        </View>
                        {metaPieces ? (
                          <Text style={styles.metaLine} numberOfLines={1}>
                            {metaPieces}
                          </Text>
                        ) : null}
                        <Text style={{ fontSize: 12, color: theme.color.mutedText }} numberOfLines={1}>
                          {chat.description || "스터디 소개가 준비 중이에요."}
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
    backgroundColor: theme.color.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: theme.color.onSecondary, fontWeight: "700", fontSize: 16 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 6 },
  loadingBox: { alignItems: "center", paddingVertical: 48 },
  metaLine: { fontSize: 11, color: theme.color.secondaryText ?? theme.color.mutedText, marginTop: 2 },
  chatMeta: { fontSize: 11, color: theme.color.mutedText, marginTop: 4 },
});
