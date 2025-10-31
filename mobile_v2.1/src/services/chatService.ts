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

export type StudyChatMessage = {
  messageId?: number | string | null;
  studyId: number | string;
  userId: number | string | null;
  content: string;
  createdAt: string | Date | null;
  nickname: string;
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

async function listMessages(studyId: number | string): Promise<StudyChatMessage[]> {
  try {
    const data = await api.get<StudyChatMessage[]>(`/api/studies/${studyId}/messages`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    const fallbackMessage = "채팅 메시지를 불러오지 못했어요.";
    if (error instanceof Error) {
      throw new Error(error.message || fallbackMessage);
    }
    throw new Error(fallbackMessage);
  }
}

async function sendMessage(studyId: number | string, text: string): Promise<StudyChatMessage | null> {
  try {
    const data = await api.postJSON<StudyChatMessage>(`/api/studies/${studyId}/messages`, { text });
    return data ?? null;
  } catch (error) {
    const fallbackMessage = "메시지를 전송하지 못했어요.";
    if (error instanceof Error) {
      throw new Error(error.message || fallbackMessage);
    }
    throw new Error(fallbackMessage);
  }
}

export default { listMyChats, listMessages, sendMessage };

