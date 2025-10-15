import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { theme } from "../theme.js";

const TABS = [
  { key: "Dashboard", label: "대시보드", icon: "layout" },
  { key: "ChatList", label: "채팅", icon: "message-circle" },
  { key: "Profile", label: "프로필", icon: "user" },
  { key: "CreateStudy", label: "만들기", icon: "plus-circle" },
];

export default function BottomNav({ navigation, current }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((tab) => {
          const isActive = current === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.item, isActive && styles.itemActive]}
              onPress={() => navigation.navigate(tab.key)}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
            >
              <Feather
                name={tab.icon}
                size={20}
                color={isActive ? theme.colors.primary : theme.colors.mutedForeground}
              />
              <Text style={[styles.label, isActive && styles.active]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.card,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingTop: 12,
  },
  item: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radiusSm,
  },
  itemActive: {
    backgroundColor: theme.colors.accent,
  },
  label: {
    color: theme.colors.mutedForeground,
    fontSize: 12,
    fontWeight: "600",
  },
  active: {
    color: theme.colors.primary,
  },
});
