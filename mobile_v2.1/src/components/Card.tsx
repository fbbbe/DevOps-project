// mobile_v2.1/src/components/Card.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import theme from '../styles/theme';

export function Card({ style, ...props }: ViewProps) {
  return <View {...props} style={[S.card, style]} />;
}
export function CardHeader({ style, ...props }: ViewProps) {
  return <View {...props} style={[S.header, style]} />;
}
export function CardTitle({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[S.title, style]}>{children}</Text>;
}
export function CardDescription({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[S.desc, style]}>{children}</Text>;
}
export function CardAction({ style, ...props }: ViewProps) {
  return <View {...props} style={[S.action, style]} />;
}
export function CardContent({ style, ...props }: ViewProps) {
  return <View {...props} style={[S.content, style]} />;
}
export function CardFooter({ style, ...props }: ViewProps) {
  return <View {...props} style={[S.footer, style]} />;
}

const S = StyleSheet.create({
  card: {
    backgroundColor: theme.color.card,
    borderColor: theme.color.border,
    borderWidth: 1,
    borderRadius: 12, // rounded-xl
  },
  header: {
    paddingTop: 24, // pt-6
    paddingHorizontal: 24, // px-6
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    color: theme.color.text,
  },
  desc: { color: theme.color.mutedText },
  action: { alignSelf: 'flex-end' },
  content: { paddingHorizontal: 24, paddingBottom: 24 }, // px-6 [&:last-child]:pb-6
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24, // pb-6
    flexDirection: 'row',
    alignItems: 'center',
  },
});
