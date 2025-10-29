// src/services/authService.ts
import api from "./api";

export type LoginResponse = {
  user_id: string;
  nickname: string;
  token: string;
};

export async function login(email: string, password: string) {
  // ORDS에서 /auth/login 같은 엔드포인트를 제공한다고 가정
  // body와 응답 구조는 실제 ORDS 쪽에서 맞춰줘야 함
  const data = await api.request<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  return data;
}