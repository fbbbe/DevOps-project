import React, { useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAppContext } from "../context/AppContext";
import { ChatMessage } from "../types";
import { colors, radii, shadows } from "../styles/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export const StudyChatScreen = ({ route }: Props) => {
  const { studyId } = route.params;
  const { user, studies, chatMessages, addChatMessage } = useAppContext();
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const study = useMemo(
    () => studies.find(item => item.id === studyId),
    [studies, studyId],
  );

  const messages: ChatMessage[] = chatMessages[studyId] ?? [];

  const handleSend = () => {
    if (!user || !message.trim()) {
      return;
    }
    addChatMessage(studyId, {
      text: message.trim(),
      userId: user.id,
      userNickname: user.nickname,
    });
    setMessage("");
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.userId === user?.id;
    return (
      <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
        {!isOwn && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.userNickname.charAt(0)}</Text>
          </View>
        )}
        <View
          style={[styles.messageBubble, isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther]}
        >
          {!isOwn && <Text style={styles.nickname}>{item.userNickname}</Text>}
          <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>{item.text}</Text>
          <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
            {new Date(item.timestamp).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
          <Text style={styles.title}>{study?.name ?? "스터디 채팅"}</Text>
        </View>
        <Text style={styles.subtitle}>스터디원들과 메시지를 주고받으며 소통하세요.</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력해 주세요."
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={18} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  messageList: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 14,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    gap: 10,
  },
  messageRowOwn: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "700",
    color: colors.text,
  },
  messageBubble: {
    maxWidth: "78%",
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageBubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radii.xs,
  },
  messageBubbleOther: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    ...shadows.soft,
  },
  nickname: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  messageTextOwn: {
    color: colors.primaryForeground,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: "right",
  },
  messageTimeOwn: {
    color: colors.primaryForeground,
    opacity: 0.7,
  },
  inputBar: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
    backgroundColor: colors.card,
    alignItems: "flex-end",
    gap: 12,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: colors.overlay,
    color: colors.text,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radii.lg,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.4,
  },
});
