import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, BookOpen, Send } from "lucide-react-native";

import Screen from "../components/Screen";
import theme from "../styles/theme";
import { Card, CardContent } from "../components/Card";
import Button from "../components/Button";
import chatService, { StudyChatMessage } from "../services/chatService";
import { useAuth } from "../context/AuthContext";

export type Study = {
  id: string | number;
  name: string;
  subject?: string;
  description?: string;
  tags?: string[];
  region?: string;
  type?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  maxMembers?: number;
  currentMembers?: number;
  ownerId?: string;
  ownerNickname?: string;
  status?: string;
};

export type User = { id: string | number; nickname: string };

type Message = {
  id: string;
  userId: string;
  userNickname: string;
  text: string;
  timestamp: Date;
};

const MIN_INPUT_HEIGHT = 44;
const MAX_INPUT_HEIGHT = 140;

const AvatarFallback = ({ name }: { name: string }) => {
  const initial = (name?.trim() || "").charAt(0).toUpperCase() || "스";
  return (
    <View style={S.avatar}>
      <Text style={S.avatarTxt}>{initial}</Text>
    </View>
  );
};

const formatTime = (date: Date) => {
  const d = new Date(date);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours >= 12 ? "오후" : "오전";
  const hour12 = hours % 12 || 12;
  return `${period} ${hour12}:${String(minutes).padStart(2, "0")}`;
};

const formatDate = (date: Date) => {
  const today = new Date();
  const current = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (today.toDateString() === current.toDateString()) return "오늘";
  if (yesterday.toDateString() === current.toDateString()) return "어제";
  return `${current.getMonth() + 1}월 ${current.getDate()}일`;
};

export default function StudyChatScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user: authUser } = useAuth();

  const routedStudy: Study | undefined = route?.params?.study;
  const study: Study = routedStudy ?? {
    id: route?.params?.studyId ?? "",
    name: "스터디 채팅",
  };

  const viewer = useMemo<User>(() => {
    const routeUser = route?.params?.user;
    if (routeUser) {
      const id = routeUser.id ?? routeUser.user_id ?? routeUser.userId ?? "";
      const nickname = routeUser.nickname ?? routeUser.name ?? "나";
      return { id: String(id), nickname };
    }
    if (authUser) {
      const id = authUser.user_id ?? authUser.id ?? authUser.email ?? "";
      const nickname = authUser.nickname ?? authUser.name ?? authUser.email ?? "나";
      return { id: String(id), nickname };
    }
    return { id: "", nickname: "나" };
  }, [authUser, route?.params?.user]);

  const viewerId = useMemo(() => String(viewer.id ?? ""), [viewer.id]);
  const studyId = study.id ?? route?.params?.studyId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const mapMessage = useCallback(
    (item: StudyChatMessage): Message => {
      const created = item.createdAt ? new Date(item.createdAt) : new Date();
      const id = item.messageId != null ? String(item.messageId) : `${item.userId ?? "msg"}-${created.getTime()}`;
      const nickname = item.nickname?.trim()
        || (item.userId != null && String(item.userId) === viewerId ? viewer.nickname : "알 수 없음");
      return {
        id,
        userId: String(item.userId ?? ""),
        userNickname: nickname,
        text: item.content ?? "",
        timestamp: created,
      };
    },
    [viewer.nickname, viewerId]
  );

  const loadMessages = useCallback(
    async (opts?: { refresh?: boolean }) => {
      if (!studyId) {
        if (opts?.refresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
        setMessages([]);
        setLoadingError("채팅방을 불러올 수 없어요. 스터디 정보가 있는지 확인해 주세요.");
        return;
      }

      if (opts?.refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const data = await chatService.listMessages(studyId);
        setMessages(data.map(mapMessage));
        setLoadingError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "채팅 메시지를 불러오지 못했어요.";
        setLoadingError(message);
      } finally {
        if (opts?.refresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [mapMessage, studyId]
  );

  useFocusEffect(
    useCallback(() => {
      if (hasLoadedOnce.current) {
        loadMessages({ refresh: true });
      } else {
        hasLoadedOnce.current = true;
        loadMessages();
      }
    }, [loadMessages])
  );

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading, scrollToBottom]);

  const groupedMessages = useMemo(() => {
    const groups = new Map<string, Message[]>();
    messages.forEach((msg) => {
      const key = formatDate(msg.timestamp);
      const list = groups.get(key) ?? [];
      list.push(msg);
      groups.set(key, list);
    });
    return Array.from(groups.entries());
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = newMessage.trim();
    if (!text || !studyId || sending) return;

    setSending(true);
    try {
      const saved = await chatService.sendMessage(studyId, text);
      if (saved) {
        setMessages((prev) => [...prev, mapMessage(saved)]);
      } else {
        await loadMessages({ refresh: true });
      }
      setLoadingError(null);
      setNewMessage("");
      setInputHeight(MIN_INPUT_HEIGHT);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      const message = err instanceof Error ? err.message : "메시지를 전송하지 못했어요.";
      setLoadingError(message);
    } finally {
      setSending(false);
    }
  }, [loadMessages, mapMessage, newMessage, scrollToBottom, sending, studyId]);

  const onInputSizeChange = useCallback((event: any) => {
    const height = Math.ceil(event.nativeEvent.contentSize.height);
    setInputHeight(Math.min(MAX_INPUT_HEIGHT, Math.max(MIN_INPUT_HEIGHT, height)));
  }, []);

  const handleBack = useCallback(() => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  }, [navigation]);

  const studyTitle = study.name ?? "스터디 채팅";

  return (
    <Screen withPadding={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : undefined}
      >
        <View style={{ flex: 1 }}>
          <View style={S.header}>
            <Pressable onPress={handleBack} style={{ padding: 4 }}>
              <ArrowLeft size={20} color={theme.color.text} />
            </Pressable>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <BookOpen size={20} color={theme.color.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: theme.color.text }} numberOfLines={1}>
                  {studyTitle}
                </Text>
                <Text style={{ fontSize: 12, color: theme.color.mutedText }}>스터디 채팅방</Text>
              </View>
            </View>
            <View style={{ width: 24 }} />
          </View>

          {loading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="small" color={theme.color.primary} />
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadMessages({ refresh: true })} />}
            >
              {loadingError && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: theme.color.destructive ?? "#B00020" }}>{loadingError}</Text>
                </View>
              )}

              {groupedMessages.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 48 }}>
                  <Text style={{ color: theme.color.mutedText }}>아직 대화가 없어요. 첫 메시지를 남겨보세요!</Text>
                </View>
              ) : (
                groupedMessages.map(([date, msgs]) => (
                  <View key={date} style={{ marginBottom: 12 }}>
                    <View style={{ alignItems: "center", marginVertical: 8 }}>
                      <View style={S.datePill}>
                        <Text style={S.datePillTxt}>{date}</Text>
                      </View>
                    </View>

                    {msgs.map((msg) => {
                      const isOwn = msg.userId === viewerId;
                      return (
                        <View
                          key={msg.id}
                          style={[S.msgRow, isOwn ? { flexDirection: "row-reverse" } : null]}
                        >
                          {!isOwn && <AvatarFallback name={msg.userNickname} />}

                          <View
                            style={[
                              { maxWidth: "75%" },
                              isOwn ? { alignItems: "flex-end" } : { alignItems: "flex-start" },
                            ]}
                          >
                            {!isOwn && <Text style={S.nickname}>{msg.userNickname}</Text>}

                            <View style={S.msgLine}>
                              {isOwn && <Text style={S.time}>{formatTime(msg.timestamp)}</Text>}
                              <Card style={[S.bubble, isOwn ? S.bubbleOwn : S.bubbleOther]}>
                                <CardContent style={{ padding: 10 }}>
                                  <Text style={[S.msgText, isOwn ? { color: theme.color.onPrimary } : null]}>
                                    {msg.text}
                                  </Text>
                                </CardContent>
                              </Card>
                              {!isOwn && <Text style={S.time}>{formatTime(msg.timestamp)}</Text>}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ))
              )}
            </ScrollView>
          )}

          <View
            style={[
              S.footer,
              {
                paddingTop: keyboardVisible ? 6 : 12,
                paddingBottom: keyboardVisible ? 0 : 12 + insets.bottom,
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
              <TextInput
                multiline
                value={newMessage}
                onChangeText={setNewMessage}
                onContentSizeChange={onInputSizeChange}
                style={[S.input, { height: inputHeight }]}
                placeholder="메시지를 입력해 주세요..."
                placeholderTextColor={theme.color.mutedText}
                textAlignVertical="top"
                scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
                returnKeyType="send"
                blurOnSubmit={false}
                onFocus={scrollToBottom}
              />
              <Button
                size="icon"
                onPress={handleSend}
                disabled={newMessage.trim() === "" || sending}
                style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
              >
                <Send size={18} color={newMessage.trim() && !sending ? theme.color.onPrimary : theme.color.mutedText} />
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.color.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  avatarTxt: { color: theme.color.onSecondary, fontWeight: "700" },
  datePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: "#eef1f4" },
  datePillTxt: { fontSize: 11, color: theme.color.mutedText },
  msgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 8 },
  nickname: { fontSize: 11, color: theme.color.mutedText, marginBottom: 4, marginLeft: 8 },
  msgLine: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  bubble: { borderRadius: 12, overflow: "hidden" },
  bubbleOwn: { backgroundColor: theme.color.primary },
  bubbleOther: { backgroundColor: "#eef1f4" },
  msgText: { fontSize: 14, lineHeight: 20, color: theme.color.text },
  time: { fontSize: 10, color: theme.color.mutedText },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
    backgroundColor: theme.color.bg,
    padding: 12,
  },
  input: {
    flex: 1,
    minHeight: MIN_INPUT_HEIGHT,
    maxHeight: MAX_INPUT_HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: "#fff",
    color: theme.color.text,
    fontSize: 16,
    lineHeight: 20,
    includeFontPadding: false,
  },
});

