// src/services/topicService.ts
import api from "./api";

/** 서버 Row → 화면용 Topic으로 정규화 */
export interface Topic {
  id: number;
  code: string;
  nameKo: string;
  title: string;
  body?: string;
  createdAt?: string; // YYYY-MM-DD
}

export type SubjectOption = { label: string; value: string };

/* ---------------- helpers (studyServices.ts 스타일) ---------------- */

function s(v: any): string {
  if (v == null) return "";
  if (v instanceof Date && !isNaN(v.getTime())) return toYmd(v);
  if (typeof v === "string") return v.trim();
  return String(v);
}

function toYmd(input: any): string {
  try {
    if (!input) return "";
    if (input instanceof Date && !isNaN(input.getTime())) {
      const y = input.getFullYear();
      const m = String(input.getMonth() + 1).padStart(2, "0");
      const d = String(input.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    if (typeof input === "string") {
      const m = input.match(/^(\d{4}-\d{2}-\d{2})/);
      if (m) return m[1];
      const dt = new Date(input);
      return isNaN(dt.getTime()) ? "" : toYmd(dt);
    }
    const dt = new Date(input);
    return isNaN(dt.getTime()) ? "" : toYmd(dt);
  } catch {
    return "";
  }
}

function mapRowToTopic(row: any): Topic {
  return {
    id: Number(row.TOPIC_ID ?? row.topic_id ?? row.id ?? 0),
    code: s(row.CODE ?? row.code),
    nameKo: s(row.NAME_KO ?? row.name_ko),
    title: s(row.TITLE ?? row.title),
    body: s(row.BODY ?? row.body) || undefined,
    createdAt: toYmd(row.CREATED_AT ?? row.created_at) || undefined,
  };
}

function mapTopicsToOptions(rows: any[]): SubjectOption[] {
  return rows.map(mapRowToTopic).map((t) => {
    const label = t.title || t.nameKo || t.code || "기타";
    return { label, value: label };
  });
}

/* ---------------- API ---------------- */

/** 1) 드롭다운 옵션 불러오기
 * - 백엔드가 이미 [{label,value}] 주면 그대로
 * - rows 형태면 정규화해서 반환
 * - 실패 시 [] 반환
 */
export async function fetchTopicOptions(): Promise<SubjectOption[]> {
<<<<<<< HEAD
  const res = await api.get<any>("/api/topics/options");

  if (Array.isArray(res)) {
    // [{label,value}] or rows
    if (res.length && res[0] && res[0].label != null) return res as SubjectOption[];
    return mapTopicsToOptions(res);
  }

  const data = (res && (res.data ?? res.rows)) ?? res;
  if (Array.isArray(data)) {
    if (data.length && data[0] && data[0].label != null) return data;
    return mapTopicsToOptions(data);
  }
  return [];
}

/** 2) 전체 토픽 목록 불러오기 */
export async function fetchTopics(): Promise<Topic[]> {
  const res = await api.get<any>("/api/topics");
  if (Array.isArray(res)) return res.map(mapRowToTopic);
  const data = (res && (res.data ?? res.rows)) ?? res;
  return Array.isArray(data) ? data.map(mapRowToTopic) : [];
=======
  return await api.get('/api/topics/options');
}

export async function fetchTopics(): Promise<TopicRow[]> {
  return await api.get('/api/topics');
>>>>>>> e6be2c43f7286643cee4b559a9b6ed440fc5d454
}

