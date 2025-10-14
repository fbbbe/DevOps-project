import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default function Button({ title, children, variant = 'primary', style, textStyle, ...props }) {
  const isLink = variant === 'link';
  const isDestructive = variant === 'destructive';

  const containerStyles = [
    styles.base,
    isLink && styles.link,
    isDestructive && styles.destructive,
    !isLink && !isDestructive && styles.primary,
    style,
  ];

  const labelStyles = [
    styles.label,
    isLink && styles.linkLabel,
    isDestructive && styles.destructiveLabel,
    !isLink && !isDestructive && styles.primaryLabel,
    textStyle,
  ];

  return (
    <TouchableOpacity style={containerStyles} {...props}>
      <Text style={labelStyles}>{title || children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  label: {
    fontWeight: '600',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryLabel: {
    color: theme.colors.primaryForeground,
  },
  destructive: {
    backgroundColor: theme.colors.destructive,
  },
  destructiveLabel: {
    color: theme.colors.destructiveForeground,
  },
  link: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  linkLabel: {
    color: theme.colors.primary,
  },
});

