import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppContext } from "../context/AppContext";
import { Gender, User } from "../types";
import { colors, radii, shadows } from "../styles/theme";

const genders: Gender[] = ["남성", "여성"];

export const LoginScreen = () => {
  const { login } = useAppContext();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedGender, setSelectedGender] = useState<Gender>("남성");

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) {
      return false;
    }
    if (!isLoginMode && !nickname.trim()) {
      return false;
    }
    return true;
  }, [email, password, nickname, isLoginMode]);

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert("입력 확인", "필수 정보를 모두 입력해 주세요.");
      return;
    }

    const baseNickname = nickname.trim() || "스터디 유저";
    const user: User = {
      id: `user-${Date.now()}`,
      nickname: isLoginMode ? "스터디 유저" : baseNickname,
      gender: selectedGender,
      email: email.trim(),
      role: "user",
    };

    login(user);
  };

  return (
    <LinearGradient colors={[colors.surface, colors.background]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>Study-UP</Text>
            <Text style={styles.subtitle}>스터디를 만들고 함께 성장해 보세요.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabButton, isLoginMode && styles.tabButtonActive]}
                onPress={() => setIsLoginMode(true)}
              >
                <Text style={[styles.tabButtonText, isLoginMode && styles.tabButtonTextActive]}>
                  로그인
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, !isLoginMode && styles.tabButtonActive]}
                onPress={() => setIsLoginMode(false)}
              >
                <Text style={[styles.tabButtonText, !isLoginMode && styles.tabButtonTextActive]}>
                  회원가입
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력해 주세요"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {!isLoginMode && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>닉네임</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="닉네임을 입력해 주세요"
                    placeholderTextColor={colors.textSecondary}
                    value={nickname}
                    onChangeText={setNickname}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>성별</Text>
                  <View style={styles.genderRow}>
                    {genders.map(gender => {
                      const isActive = selectedGender === gender;
                      return (
                        <TouchableOpacity
                          key={gender}
                          style={[styles.genderButton, isActive && styles.genderButtonActive]}
                          onPress={() => setSelectedGender(gender)}
                        >
                          <Text style={[styles.genderText, isActive && styles.genderTextActive]}>
                            {gender}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text style={styles.submitButtonText}>{isLoginMode ? "로그인" : "가입하기"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleButton} onPress={() => setIsLoginMode(prev => !prev)}>
              <Text style={styles.toggleButtonText}>
                {isLoginMode ? "계정이 없으신가요? 회원가입" : "이미 계정이 있다면 로그인"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
  },
  inner: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    paddingVertical: 24,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: colors.accent,
    padding: 4,
    borderRadius: radii.lg,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  tabButtonTextActive: {
    color: colors.primaryForeground,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.overlay,
    fontSize: 15,
    color: colors.text,
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.overlay,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  genderTextActive: {
    color: colors.primaryForeground,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.lg,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.4,
  },
  submitButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
  toggleButton: {
    marginTop: 18,
    alignItems: "center",
  },
  toggleButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
