import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, StyleSheet as RNSS } from 'react-native';
import theme from '../styles/theme';

export type SegmentTab = { value: string; label: string; icon?: React.ReactNode; };

type Props = {
  value: string;
  onChange: (v: string) => void;
  tabs: SegmentTab[];
  style?: ViewStyle;
  height?: number;
};

export default function SegmentTabs({
  value, onChange, tabs, style, height = 36,
}: Props) {
  const pad = 3;
  const radius = 12;

  return (
    <View
      style={[
        {
          backgroundColor: theme.color.secondary,
          borderRadius: radius,
          padding: pad,
          flexDirection: 'row',
          gap: 6,
          width: '100%',            // ✅ 가로 꽉
          overflow: 'hidden',       // (옵션) 리플 클리핑
        },
        style,
      ]}
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <Pressable
            key={t.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => { if (!active) onChange(t.value); }}
            style={[
              S.triggerBase,
              {
                height: height - 1,
                borderRadius: radius,
                paddingHorizontal: 10,
                flex: 1,              // ✅ 3등분 (동일 너비)
                minWidth: 0,          // ✅ 텍스트 줄바꿈/잘림 안전
              },
              active && {
                backgroundColor: '#fff',
                borderColor: theme.color.border,
                borderWidth: RNSS.hairlineWidth,
              },
            ]}
          >
            {!!t.icon && <View style={{ marginRight: 6 }}>{t.icon}</View>}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                S.triggerText,
                { textAlign: 'center' },                            // ✅ 라벨 가운데
                active ? { color: theme.color.text } : { color: theme.color.mutedText },
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const S = StyleSheet.create({
  triggerBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',   // 아이콘+텍스트 묶음 중앙
    gap: 6,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
  },
});