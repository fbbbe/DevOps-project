// src/services/userService.ts
import api from "./api";

export type UserProfile = {
  user_id: string;
  nickname: string;
  email?: string;
  gender?: string;
  attendanceRate?: number; // 개인 출석률 %
  avgProgressRate?: number; // 평균 진행률 %
  warnings?: number; // 경고 횟수 등
};

export async function getMyProfile(token: string) {
  // 예: /users/me
  const data = await api.request<UserProfile>("/users/me", {
    method: "GET",
    token,
  });

  return data;
}
