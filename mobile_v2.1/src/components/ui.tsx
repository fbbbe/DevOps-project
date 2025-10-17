import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import theme from '../styles/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[S.card, style]}>{children}</View>;
}

export function Button({ children, onPress, variant='primary' }:{
  children: React.ReactNode; onPress?: ()=>void; variant?: 'primary'|'outline';
}) {
  const wrap = variant==='primary' ? S.btnPrimary : S.btnOutline;
  const text = variant==='primary' ? S.btnPrimaryText : S.btnOutlineText;
  return (
    <Pressable onPress={onPress} style={({pressed})=>[wrap, pressed && { opacity:0.9 }]}>
      <Text style={text}>{children}</Text>
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput {...props} placeholderTextColor={theme.color.mutedText} style={[S.input, props.style]} />;
}

const S = StyleSheet.create({
  card: {
    borderWidth: 1, borderColor: theme.color.border, borderRadius: theme.radius.lg,
    backgroundColor: theme.color.card, padding: theme.space.md,
  },
  btnPrimary: {
    backgroundColor: theme.color.primary, paddingVertical: 12, borderRadius: theme.radius.md, alignItems:'center',
  },
  btnPrimaryText: { color: theme.color.onPrimary, fontWeight:'600' },
  btnOutline: {
    backgroundColor: theme.color.bg, borderWidth:1, borderColor: theme.color.border, paddingVertical: 12,
    borderRadius: theme.radius.md, alignItems:'center',
  },
  btnOutlineText: { color: theme.color.text, fontWeight:'600' },
  input: {
    borderWidth:1, borderColor: theme.color.border, borderRadius: theme.radius.md,
    paddingVertical:10, paddingHorizontal:12, color: theme.color.text, backgroundColor:'#fff',
  },
});
