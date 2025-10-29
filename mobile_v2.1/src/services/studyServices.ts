// src/services/studyServices.ts
import api from "./api";

export type Study = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  region: string;
  type: "online" | "offline";
  duration: "short" | "long";
  startDate: string;
  endDate?: string;
  maxMembers: number;
  currentMembers: number;
  ownerNickname: string;
  status: "recruiting" | "active" | "completed";
  progress?: number;
};

export async function getStudies(
  token: string,
  filter: "all" | "recruiting" | "active" | "completed" | "my" | "favorites"
) {
  // 서버가 /studies?filter=... 형태로 받는다고 가정
  const query = filter === "all" ? "" : `?filter=${encodeURIComponent(filter)}`;

  const data = await api.request<Study[]>(`/studies${query}`, {
    method: "GET",
    token,
  });

  return data;
}

export async function getStudyDetail(token: string, studyId: string) {
  const data = await api.request<Study>(`/studies/${studyId}`, {
    method: "GET",
    token,
  });
  return data;
}

export async function createStudy(token: string, payload: {
  name: string;
  description: string;
  tags: string[];
  region: string;
  type: "online" | "offline";
  duration: "short" | "long";
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  maxMembers: number;
}) {
  const data = await api.request<{ id: string }>("/studies", {
    method: "POST",
    token,
    body: payload,
  });
  return data;
}

export async function submitAttendance(
  token: string,
  studyId: string,
  code: string
) {
  const data = await api.request<{ ok: boolean; warning?: boolean }>(
    `/studies/${studyId}/attendance`,
    {
      method: "POST",
      token,
      body: { code },
    }
  );
  return data;
}

// (선택) 채팅
export async function getMessages(token: string, studyId: string) {
  const data = await api.request<
    { id: string; userId: string; userNickname: string; text: string; timestamp: string }[]
  >(`/studies/${studyId}/messages`, {
    method: "GET",
    token,
  });

  return data;
}

export async function sendMessage(
  token: string,
  studyId: string,
  text: string
) {
  const data = await api.request<{ id: string }>(
    `/studies/${studyId}/messages`,
    {
      method: "POST",
      token,
      body: { text },
    }
  );
  return data;
}
