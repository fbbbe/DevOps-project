import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default function Input(props) {
  return <TextInput placeholderTextColor={theme.colors.mutedForeground} style={styles.input} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.foreground,
    marginBottom: 8,
  },
});

