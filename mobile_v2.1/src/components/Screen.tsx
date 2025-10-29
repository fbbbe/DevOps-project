// Screen.tsx (전체 교체본)
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';

type Props = {
  children: React.ReactNode;
  /** 본문 좌우/상단 기본 패딩 */
  withPadding?: boolean;
  /** 선택: 하단에 고정해서 넣을 영역 (예: 큰 CTA 버튼) */
  footer?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export default function Screen({ children, withPadding = true, footer, style }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[{ flex: 1, backgroundColor: theme.color.bg }, style]}>
      {/* ✅ 상단만 SafeArea를 적용 (하단은 여기서 절대 주지 않음) */}
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={{ backgroundColor: theme.color.bg }}
      />

      {/* 본문 */}
      <View style={[{ flex: 1 }, withPadding && { paddingHorizontal: 16, paddingTop: 16 }]}>
        {children}
      </View>

      {/* 하단 고정 영역: 필요한 화면에서만 사용 (여기서만 insets.bottom을 더함) */}
      {footer ? (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.color.border,
            backgroundColor: theme.color.bg,
            paddingHorizontal: withPadding ? 16 : 0,
            paddingTop: 8,
            // ⬇⬇ 변경점: 하단 안전영역은 여기서만 더해줍니다.
            paddingBottom: 8 + insets.bottom,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}