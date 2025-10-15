import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default function Button({ title, children, variant = 'primary' , size = 'md', style, textStyle, ...props }) {
  const isLink = variant === 'link';
  const isDestructive = variant === 'destructive';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const containerStyles = [
    styles.base, size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : null,
    isLink && styles.link,
    isDestructive && styles.destructive,
    isSecondary && styles.secondary || isOutline && styles.outline || isGhost && styles.ghost || (!isLink && !isDestructive && styles.primary),
    style,
  ];

  const labelStyles = [
    styles.label,
    isLink && styles.linkLabel,
    isDestructive && styles.destructiveLabel,
    isSecondary && styles.secondaryLabel || isOutline && styles.outlineLabel || isGhost && styles.ghostLabel || (!isLink && !isDestructive && styles.primaryLabel),
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


// extend styles



