// mobile_v2.1/src/components/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import theme from '../styles/theme';

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
  // children을 배열로 평탄화하고, 공백만 있는 문자열/Nullish는 제거
  const flat = React.Children.toArray(children).filter((ch) => {
    if (ch == null) return false;
    if (typeof ch === 'string') return ch.trim().length > 0;
    return true;
  });

  if (flat.length === 0) return null;

  const allPrimitive = flat.every(
    (ch) => typeof ch === 'string' || typeof ch === 'number'
  );

  const textColor =
    variant === 'default'
      ? { color: theme.color.onPrimary }
      : variant === 'secondary'
      ? { color: theme.color.onSecondary }
      : variant === 'destructive'
      ? { color: theme.color.onDestructive }
      : { color: theme.color.text };

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
      {allPrimitive ? (
        // 전부 문자열/숫자면 한 개의 Text로 합쳐서 렌더(간격 문제 예방)
        <Text style={[S.text, textColor]} numberOfLines={1}>
          {flat.map(String).join('')}
        </Text>
      ) : (
        // 섞여 있으면 프리미티브만 개별 Text로 감싸고, 요소는 그대로 출력
        flat.map((ch, i) =>
          typeof ch === 'string' || typeof ch === 'number' ? (
            <Text key={`t-${i}`} style={[S.text, textColor]} numberOfLines={1}>
              {String(ch)}
            </Text>
          ) : (
            // React 요소는 그대로 통과
            // (키 없을 수 있어 안전하게 key 부여)
            <React.Fragment key={`e-${i}`}>{ch}</React.Fragment>
          )
        )
      )}
    </View>
  );
}

const S = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 6,     // 내부 여백 타이트
    paddingVertical: 2,
    alignSelf: 'flex-start',  // 내용 길이에 맞게 폭 결정
    gap: 2,                   // 아이콘-텍스트 간격만 최소로
  },
  text: {
    fontSize: 12,
    lineHeight: 14,
    includeFontPadding: false,
    fontWeight: '500',
    color: theme.color.text,
  },
  vDefault: { backgroundColor: theme.color.primary, borderColor: theme.color.primary },
  vSecondary: { backgroundColor: theme.color.secondary, borderColor: theme.color.border },
  vDestructive: { backgroundColor: theme.color.destructive, borderColor: theme.color.destructive },
  vOutline: { backgroundColor: 'transparent', borderColor: theme.color.border },
});