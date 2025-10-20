import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Platform,
} from 'react-native';
import theme from '../styles/theme';

export type InputProps = TextInputProps & {
  containerStyle?: any;
};

export default React.forwardRef<TextInput, InputProps>(function Input(
  { style, containerStyle, multiline, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      // ✅ 부모 Pressable이 onPress를 가로채지 못하게 이 뷰가 우선 터치 응답자
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      style={[
        S.container,
        focused && S.containerFocused,
        containerStyle,
      ]}
    >
      <TextInput
        ref={ref}
        style={[
          S.input,
          multiline && { textAlignVertical: 'top', paddingVertical: 10 },
          style,
        ]}
        placeholderTextColor={theme.color.mutedText}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        // 기본값 보장
        editable={rest.editable !== false}
        autoCorrect={rest.autoCorrect ?? false}
        autoCapitalize={rest.autoCapitalize ?? 'none'}
        {...rest}
      />
    </View>
  );
});

const S = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  containerFocused: {
    borderColor: theme.color.primary,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 8 }),
    fontSize: 14,
    color: theme.color.text,
  },
});
