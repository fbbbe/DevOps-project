import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import theme from '../styles/theme';

type Variant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg' | 'icon';

type Props = {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  onPress?: (e: GestureResponderEvent) => void;
  children?: React.ReactNode;
};

/** 
 * 변경점: 문자열/숫자 children을 자동으로 <Text>로 감싸도록 normalizeChildren 추가
 * (이 한 줄이 RN의 “Text strings must be rendered within a <Text>” 오류를 없앱니다)
 */
export default function Button({
  variant = 'default',
  size = 'md',
  disabled = false,
  style,
  onPress,
  children,
}: Props) {
  const textStyle = [
    S.textBase,
    variant === 'default' && { color: theme.color.onPrimary },
    variant === 'secondary' && { color: theme.color.text },
    variant === 'destructive' && { color: theme.color.onDestructive },
    (variant === 'outline' || variant === 'ghost') && { color: theme.color.text },
    size === 'sm' && { fontSize: 12 },
    size === 'md' && { fontSize: 14 },
    size === 'lg' && { fontSize: 16 },
  ];

  const containerStyle = [
    S.base,
    // size
    size === 'sm' && { height: 32, paddingHorizontal: 10, borderRadius: 8 },
    size === 'md' && { height: 40, paddingHorizontal: 12, borderRadius: 10 },
    size === 'lg' && { height: 48, paddingHorizontal: 14, borderRadius: 12 },
    size === 'icon' && { width: 44, height: 44, borderRadius: 12, paddingHorizontal: 0 },
    // variant
    variant === 'default' && { backgroundColor: theme.color.primary, borderColor: theme.color.primary, borderWidth: 1 },
    variant === 'secondary' && { backgroundColor: theme.color.secondary, borderColor: theme.color.border, borderWidth: 1 },
    variant === 'destructive' && { backgroundColor: theme.color.destructive, borderColor: theme.color.destructive, borderWidth: 1 },
    variant === 'outline' && { backgroundColor: '#fff', borderColor: theme.color.border, borderWidth: 1 },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    disabled && { opacity: 0.5 },
    style,
  ];

  // 🔧 핵심 수정: 문자열/숫자 child는 Text로 감싸기
  const normalizeChildren = (nodes: React.ReactNode) =>
    React.Children.map(nodes, (child, i) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return (
          <Text key={i} style={textStyle} numberOfLines={1}>
            {child}
          </Text>
        );
      }
      return child as React.ReactElement;
    });

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={containerStyle}
    >
      <View
        style={[
          S.inner,
          size === 'icon' && { paddingHorizontal: 0 },
        ]}
      >
        {/* icon 버튼은 보통 아이콘만 들어오므로 children 그대로; 
            일반 버튼은 normalize로 문자열을 Text로 감쌈 */}
        {size === 'icon' ? children : normalizeChildren(children)}
      </View>
    </Pressable>
  );
}

const S = StyleSheet.create({
  base: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textBase: {
    fontWeight: '600',
  },
});