import AsyncStorage from '@react-native-async-storage/async-storage';

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface StoredJoinRequest {
  requestId: string;
  studyId: string;
  userId: string;
  nickname: string;
  message?: string;
  status: JoinRequestStatus;
  requestedAt: string;
  updatedAt?: string;
}

const STORAGE_PREFIX = 'study_join_requests_v1';

function storageKey(studyId: string) {
  return `${STORAGE_PREFIX}:${studyId}`;
}

function nowIso() {
  return new Date().toISOString();
}

function ensureArray(raw: any): StoredJoinRequest[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item) => typeof item === 'object' && item && item.requestId);
}

async function readRequests(studyId: string): Promise<StoredJoinRequest[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(studyId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return ensureArray(parsed);
  } catch (err) {
    console.warn('[joinRequestStore] read failed', err);
    return [];
  }
}

async function writeRequests(studyId: string, list: StoredJoinRequest[]): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(studyId), JSON.stringify(list));
  } catch (err) {
    console.warn('[joinRequestStore] write failed', err);
  }
}

export async function loadJoinRequests(studyId: string): Promise<StoredJoinRequest[]> {
  return readRequests(studyId);
}

export async function clearJoinRequests(studyId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(storageKey(studyId));
  } catch (err) {
    console.warn('[joinRequestStore] clear failed', err);
  }
}

export async function addJoinRequest(params: {
  studyId: string;
  userId: string;
  nickname: string;
  message?: string;
}): Promise<StoredJoinRequest> {
  const { studyId, userId, nickname, message } = params;
  const list = await readRequests(studyId);

  const existing = list.find((req) => req.userId === userId);
  if (existing) {
    // reuse existing request and keep previous status
    return existing;
  }

  const request: StoredJoinRequest = {
    requestId: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    studyId,
    userId,
    nickname,
    message,
    status: 'pending',
    requestedAt: nowIso(),
  };

  const next = [...list, request];
  await writeRequests(studyId, next);
  return request;
}

export async function cancelJoinRequest(params: {
  studyId: string;
  userId: string;
}): Promise<void> {
  const { studyId, userId } = params;
  const list = await readRequests(studyId);
  const next = list.filter((req) => !(req.userId === userId && req.status === 'pending'));
  await writeRequests(studyId, next);
}

export async function updateJoinRequestStatus(params: {
  studyId: string;
  requestId: string;
  status: JoinRequestStatus;
}): Promise<StoredJoinRequest | null> {
  const { studyId, requestId, status } = params;
  const list = await readRequests(studyId);
  let updated: StoredJoinRequest | null = null;
  const next = list.map((req) => {
    if (req.requestId !== requestId) return req;
    updated = {
      ...req,
      status,
      updatedAt: nowIso(),
    };
    return updated;
  });
  if (updated) {
    await writeRequests(studyId, next);
  }
  return updated;
}

export async function upsertJoinRequests(studyId: string, list: StoredJoinRequest[]) {
  await writeRequests(studyId, list);
}
