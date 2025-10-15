import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../theme.js";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function ProgressScreen({ route }) {
  const study = route?.params?.study;
  const [progress, setProgress] = useState(study?.progress || 0);

  const add = (n) => setProgress((p) => Math.min(100, Math.max(0, p + n)));

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>{study?.name || "스터디"} 진도 관리</Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.muted}>현재 {progress}%</Text>
        <Button onPress={() => add(10)}>+10%</Button>
        <Button variant="destructive" onPress={() => add(-10)}>-10%</Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: theme.colors.foreground },
  muted: { color: theme.colors.mutedForeground, marginVertical: 6 },
  barBg: { height: 12, backgroundColor: theme.colors.muted, borderRadius: 999, overflow: "hidden", marginBottom: 10 },
  barFill: { height: "100%", backgroundColor: theme.colors.primary },
});
