import api from "./api";

export type ChatListItem = {
  studyId: number | string;
  name: string;
  description: string;
  memberCount: number;
  lastMessageAt?: string;
  status?: string;
  termType?: string;
  startDate?: string;
  endDate?: string;
};

async function listMyChats(): Promise<ChatListItem[]> {
  try {
    const data = await api.get<ChatListItem[]>("/api/studies/me/chats");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    const fallbackMessage = "채팅 목록을 불러오지 못했어요.";
    if (error instanceof Error) {
      throw new Error(error.message || fallbackMessage);
    }
    throw new Error(fallbackMessage);
  }
}

export default { listMyChats };
