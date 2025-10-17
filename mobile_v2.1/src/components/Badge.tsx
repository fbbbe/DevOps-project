import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import theme from '../styles/theme';

// 웹과 동일한 variant 집합: default | secondary | destructive | outline  :contentReference[oaicite:2]{index=2}
type Variant = 'default' | 'secondary' | 'destructive' | 'outline';

export default function Badge({
  children,
  variant = 'default',
  style,
}: {
  children: React.ReactNode;
  variant?: Variant;
  style?: ViewStyle | ViewStyle[];
}) {
  return (
    <View
      style={[
        S.base,
        variant === 'default' && S.vDefault,
        variant === 'secondary' && S.vSecondary,
        variant === 'destructive' && S.vDestructive,
        variant === 'outline' && S.vOutline,
        style,
      ]}
    >
      <Text
        style={[
          S.text,
          variant === 'default' && { color: theme.color.onPrimary },
          variant === 'secondary' && { color: theme.color.onSecondary },
          variant === 'destructive' && { color: theme.color.onDestructive },
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
}

const S = StyleSheet.create({
  // tailwind: inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium ...  :contentReference[oaicite:3]{index=3}
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8, // px-2
    paddingVertical: 2,   // py-0.5
    alignSelf: 'flex-start',
    gap: 4,
  },
  text: { fontSize: 12, fontWeight: '500', color: theme.color.text },
  vDefault: { backgroundColor: theme.color.primary, borderColor: theme.color.primary },
  vSecondary: { backgroundColor: theme.color.secondary, borderColor: theme.color.border },
  vDestructive: { backgroundColor: theme.color.destructive, borderColor: theme.color.destructive },
  vOutline: { backgroundColor: 'transparent', borderColor: theme.color.border },
});
