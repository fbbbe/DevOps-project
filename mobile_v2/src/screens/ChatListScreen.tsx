import React, { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAppContext } from "../context/AppContext";
import { colors, radii, shadows } from "../styles/theme";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) {
    return "방금";
  }
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}.${date.getDate()} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

export const ChatListScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigation>();
  const { studies, chatMessages } = useAppContext();

  const listData = useMemo(
    () =>
      studies.map(study => {
        const messages = chatMessages[study.id] ?? [];
        const lastMessage = messages[messages.length - 1];
        return {
          study,
          lastMessage,
        };
      }),
    [studies, chatMessages],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }] }>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="chatbubbles" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>스터디 채팅</Text>
          <Text style={styles.subtitle}>팀원들과 소통하고 진도를 공유해 보세요.</Text>
        </View>
      </View>

      <FlatList
        data={listData}
        keyExtractor={item => item.study.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Chat", { studyId: item.study.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.studyName} numberOfLines={1}>
                {item.study.name}
              </Text>
              <Text style={styles.timestamp}>
                {formatTimestamp(item.lastMessage?.timestamp)}
              </Text>
            </View>
            <Text style={styles.previewText} numberOfLines={2}>
              {item.lastMessage
                ? `${item.lastMessage.userNickname}: ${item.lastMessage.text}`
                : "아직 대화가 없어요. 첫 메시지를 남겨보세요!"}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="paper-plane" size={34} color={colors.textSecondary} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>참여 중인 스터디가 없습니다.</Text>
            <Text style={styles.emptyDesc}>새로운 스터디를 만들거나 참여해 보세요.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 48 }}
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
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    ...shadows.card,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  studyName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  previewText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
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
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
