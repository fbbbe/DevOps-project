import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Platform,
} from 'react-native';
import theme from '../styles/theme';
import { ChevronDown, Check } from 'lucide-react-native';

// 웹의 구조와 트리거 높이/사이즈(sm|default)를 반영: Trigger/Content/Item/Value, h-8/h-9  :contentReference[oaicite:4]{index=4}
export type Option = { label: string; value: string };
type Size = 'sm' | 'default';

export default function Select({
  value,
  onChange,
  placeholder = '선택',
  options,
  size = 'default',
  disabled = false,
  isInvalid = false, // aria-invalid 대응
}: {
  value: string | null | undefined;  // placeholder 상태 표현 가능
  onChange: (v: string) => void;
  placeholder?: string;
  options: Option[];
  size?: Size;
  disabled?: boolean;
  isInvalid?: boolean;
}) {
  const [open, setOpen] = useState(false);

  // ✅ 웹 Radix Select와 마찬가지로 "빈 문자열 value"는 지원하지 않도록 강제 (버그 방지)  :contentReference[oaicite:5]{index=5}
  useEffect(() => {
    const bad = options.find((o) => o.value === '');
    if (bad) {
      console.warn(
        `[Select] options에 빈 문자열 value가 있습니다: "${bad.label}". 빈 문자열은 허용되지 않습니다. 'all' 등으로 교체하세요.`,
      );
    }
  }, [options]);

  const currentLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found ? found.label : placeholder;
  }, [options, value, placeholder]);

  const height = size === 'sm' ? 32 : 36; // h-8 / h-9  :contentReference[oaicite:6]{index=6}

  return (
    <>
      {/* Trigger */}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          S.trigger,
          { height },
          isInvalid && S.invalid,
          disabled && S.disabled,
          pressed && { opacity: 0.95 },
        ]}
      >
        <Text
          style={[
            S.triggerText,
            !options.find((o) => o.value === value) && { color: theme.color.mutedText }, // placeholder 색상
          ]}
          numberOfLines={1}
        >
          {currentLabel}
        </Text>
        <ChevronDown size={16} color={theme.color.mutedText} />
      </Pressable>

      {/* Content */}
      <Modal
        visible={open}
        transparent
        animationType={Platform.select({ ios: 'slide', android: 'fade', default: 'fade' })}
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={S.backdrop} onPress={() => setOpen(false)}>
          <View style={S.sheet}>
            <FlatList
              data={options}
              keyExtractor={(it) => it.value || it.label}
              contentContainerStyle={{ paddingVertical: 4 }}
              renderItem={({ item }) => {
                const selected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    disabled={disabled}
                    style={({ pressed }) => [
                      S.item,
                      selected && S.itemSelected,
                      pressed && { opacity: 0.95 },
                    ]}
                  >
                    <Text
                      style={[S.itemText, selected && { fontWeight: '700' }]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    {selected && <Check size={18} color={theme.color.text} />}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const S = StyleSheet.create({
  // Trigger: border, rounded-md, bg-input-background, px-3, text-sm  :contentReference[oaicite:7]{index=7}
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 8,
    backgroundColor: theme.color.inputBg,
    paddingHorizontal: 12, // px-3
    paddingVertical: 8, // py-2 (시각적 높이는 height로 제어)
  },
  triggerText: { fontSize: 14, color: theme.color.text },
  invalid: {
    borderColor: theme.color.destructive,
    shadowColor: theme.color.ring,
    shadowOpacity: 1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
  disabled: { opacity: 0.5 },
  // Content (모달 시트)
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '60%',
    borderTopWidth: 1,
    borderColor: theme.color.border,
  },
  // Item: focus:bg-accent … text-sm …  :contentReference[oaicite:8]{index=8}
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10, // py-1.5 근사
    paddingHorizontal: 8, // pl-2 / pr-8 근사
    borderRadius: 6,
  },
  itemSelected: { backgroundColor: '#f5f6f8' },
  itemText: { fontSize: 14, color: theme.color.text, flex: 1 },
});
