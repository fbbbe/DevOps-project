import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import theme from '../styles/theme';

type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  style?: ViewStyle | ViewStyle[];
};

export default function Button({
  children,
  onPress,
  disabled = false,
  variant = 'default',
  size = 'default',
  style,
}: Props) {
  const wrap = [
    S.base,
    size === 'default' && S.sizeDefault,
    size === 'sm' && S.sizeSm,
    size === 'lg' && S.sizeLg,
    size === 'icon' && S.sizeIcon,
    variant === 'default' && S.varDefault,
    variant === 'destructive' && S.varDestructive,
    variant === 'outline' && S.varOutline,
    variant === 'secondary' && S.varSecondary,
    variant === 'ghost' && S.varGhost,
    variant === 'link' && S.varLink,
    disabled && { opacity: 0.5 },
    style,
  ];

  const textStyle =
    variant === 'default'
      ? S.textOnPrimary
      : variant === 'destructive'
      ? S.textOnDestructive
      : variant === 'link'
      ? S.textLink
      : S.textDefault;

  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [wrap, pressed && { opacity: 0.9 }]}>
      <Text style={textStyle}>{children}</Text>
    </Pressable>
  );
}

const S = StyleSheet.create({
  base: {
    // inline-flex center + rounded-md + text-sm + transition + disabled style
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8, // rounded-md
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 16, // px-4
    // text-sm는 실제 Text에서 처리하지만 전체 높이를 맞추기 위해 size에서 h-* 적용
  },
  // sizes
  sizeDefault: { height: 36, paddingVertical: 8 }, // h-9
  sizeSm: { height: 32, paddingHorizontal: 12, paddingVertical: 6 }, // h-8
  sizeLg: { height: 40, paddingHorizontal: 24, paddingVertical: 8 }, // h-10
  sizeIcon: { width: 36, height: 36, borderRadius: 8, padding: 0 },

  // variants
  varDefault: {
    backgroundColor: theme.color.primary,
    borderColor: theme.color.primary,
  },
  varDestructive: {
    backgroundColor: theme.color.destructive,
    borderColor: theme.color.destructive,
  },
  varOutline: {
    backgroundColor: theme.color.bg,
    borderColor: theme.color.border,
  },
  varSecondary: {
    backgroundColor: theme.color.secondary,
    borderColor: theme.color.border,
  },
  varGhost: {
    backgroundColor: theme.color.ghostBg,
    borderColor: 'transparent',
  },
  varLink: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingHorizontal: 0,
    height: undefined,
  },

  // text colors
  textOnPrimary: { color: theme.color.onPrimary, fontSize: 14, fontWeight: '600' },
  textOnDestructive: { color: theme.color.onDestructive, fontSize: 14, fontWeight: '600' },
  textDefault: { color: theme.color.text, fontSize: 14, fontWeight: '600' },
  textLink: { color: theme.color.link, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});
