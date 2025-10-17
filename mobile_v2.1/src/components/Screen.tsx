import React from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';

type Props = ViewProps & { withPadding?: boolean };

export default function Screen({ children, style, withPadding = true, ...rest }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      {...rest}
      style={[
        { flex: 1, backgroundColor: theme.color.bg, paddingTop: insets.top },
        withPadding && { paddingHorizontal: 16 },
        style,
      ]}
    >
      {children}
    </View>
  );
}
