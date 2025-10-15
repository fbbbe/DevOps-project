import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { theme } from "../theme.js";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function ChatScreen({ route }) {
  const study = route?.params?.study;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: "m1", text: `${study?.name || "스터디"} 채팅에 오신 것을 환영합니다.`, me: false },
  ]);

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Math.random().toString(36).slice(2), text: input.trim(), me: true }]);
    setInput("");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding", android: undefined })}>
      <View style={styles.container}>
        <Text style={styles.title}>{study?.name || "스터디"} 채팅</Text>
        <FlatList
          data={messages}
          keyExtractor={(x) => x.id}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Card style={{ alignSelf: item.me ? "flex-end" : "flex-start", maxWidth: "80%" }}>
              <Text style={{ color: theme.colors.foreground }}>{item.text}</Text>
            </Card>
          )}
        />
        <View style={styles.row}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            style={styles.input}
          />
          <Button onPress={send}>전송</Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: theme.colors.foreground },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: theme.colors.card },
});
