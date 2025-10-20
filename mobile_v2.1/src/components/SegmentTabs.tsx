import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import theme from '../styles/theme';

export type SegmentTab = {
  value: string;
  label: string;
  icon?: React.ReactNode;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  tabs: SegmentTab[];
  style?: ViewStyle;
  /** 높이(px). 웹 h-9 ≈ 36px */
  height?: number;
};

/**
 * 웹 tabs.tsx(TabsList/TabsTrigger) 톤을 RN으로 매핑한 세그먼트 탭
 * - 컨테이너: bg-muted 느낌(secondary), 라운드 XL, 내부 패딩 3px
 * - 탭: 활성 시 카드 배경(#fff) + 보더, 비활성은 투명
 */
export default function SegmentTabs({
  value,
  onChange,
  tabs,
  style,
  height = 36,
}: Props) {
  const pad = 3; // p-[3px]
  const radius = 12; // rounded-xl

  return (
    <View
      style={[
        {
          backgroundColor: theme.color.secondary, // 웹 bg-muted 톤
          borderRadius: radius,
          padding: pad,
          alignSelf: 'flex-start',
          flexDirection: 'row',
          gap: 6,
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
            onPress={() => onChange(t.value)}
            style={[
              S.triggerBase,
              {
                height: height - 1, // h-[calc(100%-1px)]
                borderRadius: radius,
                paddingHorizontal: 10,
              },
              active
                ? {
                    backgroundColor: '#fff', // 카드 배경
                    borderColor: theme.color.border,
                    borderWidth: 1,
                  }
                : null,
            ]}
          >
            {!!t.icon && <View style={{ marginRight: 6 }}>{t.icon}</View>}
            <Text
              style={[
                S.triggerText,
                active ? { color: theme.color.text } : { color: theme.color.mutedText },
              ]}
              numberOfLines={1}
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
    justifyContent: 'center',
    gap: 6,
  },
  triggerText: {
    fontSize: 14, // text-sm
    fontWeight: '600',
  },
});
