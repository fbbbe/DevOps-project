import React, { useState } from 'react';
import { TextInput, StyleSheet, TextInputProps, View } from 'react-native';
import theme from '../styles/theme';

export default function Input({ style, onFocus, onBlur, ...props }: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[S.wrap, focused && S.wrapFocused]}>
      <TextInput
        {...props}
        style={[S.input, style]}
        placeholderTextColor={theme.color.mutedText}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
      />
    </View>
  );
}

const S = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 8, // rounded-md
    backgroundColor: theme.color.inputBg,
  },
  wrapFocused: {
    borderColor: theme.color.primary,
    shadowColor: theme.color.ring,
    shadowOpacity: 1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
  input: {
    height: 36, // h-9
    paddingHorizontal: 12, // px-3
    fontSize: 14, // text-sm
    color: theme.color.text,
  },
});
