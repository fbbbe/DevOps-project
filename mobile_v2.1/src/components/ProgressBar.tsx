import React, { useEffect, useRef } from 'react';
import { View, ViewStyle, Animated, Easing } from 'react-native';
import theme from '../styles/theme';

type Props = {
  /** 0 ~ 100 */
  value?: number;
  /** 높이(px). 웹 h-2 기준 8이 기본 */
  height?: number;
  /** 컨테이너 추가 스타일 */
  style?: ViewStyle;
};

/** 웹 Progress(배경 primary/20, 둥근바, 인디케이터 primary) 매핑 */
export default function ProgressBar({ value = 0, height = 8, style }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const anim = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width 애니메이션은 native driver 불가
    }).start();
  }, [clamped]);

  // hex + alpha(0.2) => primary/20 비슷한 효과
  const bgPrimary20 = theme.color.primary.length === 7
    ? `${theme.color.primary}33` // 0x33 ~= 20% 투명도
    : theme.color.secondary;

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        {
          width: '100%',
          height,
          backgroundColor: bgPrimary20,
          borderRadius: 999,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width,
          height: '100%',
          backgroundColor: theme.color.primary,
          borderRadius: 999,
        }}
      />
    </View>
  );
}
