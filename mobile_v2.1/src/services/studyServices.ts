// src/services/studyServices.ts
// - 목록/상세 조회 시 서버 row를 화면에서 쓰기 쉬운 형태로 "일관" 정규화
// - 태그: 무엇이 오든 string[]
// - 날짜: 무엇이 오든 'YYYY-MM-DD' 문자열

import api from "./api";

export interface RegionDetail {
  sido: string;
  sigungu: string;
  dongEupMyeon?: string;
}

export interface Study {
  id: string;
  name: string;
  subject: string;
  description: string;
  tags: string[];
  type: "online" | "offline";
  regionDetail?: RegionDetail;
  region?: string;        // 단순 표기용
  duration: "short" | "long";
  weekDuration?: string;
  dayDuration?: string;
  startDate: string;      // YYYY-MM-DD
  endDate?: string | null;// YYYY-MM-DD
  maxMembers: number;
  currentMembers: number;
  ownerId: number | string;
  ownerNickname: string;
  status: "recruiting" | "active" | "completed";
  progress: number;
}

/* ---------- helpers ---------- */

// 안전 문자열화
function s(v: any): string {
  if (v == null) return "";
  if (v instanceof Date) return toYmd(v);
  // ISO 문자열이면 앞 10자리(YYYY-MM-DD) 우선
  if (typeof v === "string") {
    const txt = v.trim();
    const iso = txt.match(/^(\d{4}-\d{2}-\d{2})/);
    if (iso) return iso[1];
    // 기타 문자열은 그대로
    return txt;
  }
  return String(v);
}

// 날짜를 'YYYY-MM-DD' 로
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
      // 이미 YYYY-MM-DD... 인 경우
      const iso = input.match(/^(\d{4}-\d{2}-\d{2})/);
      if (iso) return iso[1];
      // 기타 문자열은 Date 파싱 시도
      const dt = new Date(input);
      if (!isNaN(dt.getTime())) return toYmd(dt);
      return "";
    }
    // 숫자 타임스탬프 등
    const dt = new Date(input);
    return isNaN(dt.getTime()) ? "" : toYmd(dt);
  } catch {
    return "";
  }
}

// 객체 안에서 대표 문자열 하나 추출 (태그 정규화 보조)
function pickStringFromObject(obj: any): string | null {
  try {
    if (!obj || typeof obj !== "object") return null;
    for (const k of ["name", "label", "value", "text", "tag"]) {
      const v = obj[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    // 못 찾으면 압축 요약
    const flat = Object.entries(obj)
      .map(([k, v]) => `${k}:${typeof v === "string" ? v : JSON.stringify(v)}`)
      .join(",");
    return flat.length > 200 ? flat.slice(0, 200) : flat || null;
  } catch {
    return null;
  }
}

// 태그 정규화: 무엇이 오든 string[]
function normalizeTags(input: any): string[] {
  if (input == null) return [];

  if (Array.isArray(input)) {
    return input
      .flatMap((t) => {
        if (typeof t === "string") return t;
        if (t && typeof t === "object") {
          const picked = pickStringFromObject(t);
          return picked != null ? picked : "[unknown]";
        }
        return String(t);
      })
      .map((x) => x.trim())
      .filter(Boolean);
  }

  if (typeof input === "string") {
    const txt = input.trim();
    if (!txt) return [];
    // JSON 문자열이면 파싱 후 재귀
    if (
      (txt.startsWith("[") && txt.endsWith("]")) ||
      (txt.startsWith("{") && txt.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(txt);
        return normalizeTags(parsed);
      } catch {
        // 실패하면 아래 split
      }
    }
    // 콤마/파이프 구분자 대응
    return txt.split(/[,\|]/).map((x) => x.trim()).filter(Boolean);
  }

  // URLSearchParams 등
  if (typeof URLSearchParams !== "undefined" && input instanceof URLSearchParams) {
    return Array.from(input.values()).map((v) => v.trim()).filter(Boolean);
  }

  if (typeof input === "object") {
    const picked = pickStringFromObject(input);
    return picked ? [picked] : [JSON.stringify(input)];
  }

  return [String(input)];
}

// 서버 row -> 화면 Study
function mapRowToStudy(row: any): Study {
  // 온라인 여부
  const isOnline =
    s(row.IS_ONLINE).toUpperCase() === "Y" ||
    s(row.IS_ONLINE).toLowerCase() === "online";

  // 기간
  const duration: "short" | "long" =
    s(row.TERM_TYPE).toLowerCase() === "long" ? "long" : "short";

  // 상태 매핑
  let mappedStatus: "recruiting" | "active" | "completed" = "recruiting";
  const rawStatus = s(row.STATUS).toLowerCase();
  if (rawStatus === "open") mappedStatus = "recruiting";
  else if (rawStatus === "active") mappedStatus = "active";
  else if (["closed", "expired", "done"].includes(rawStatus)) mappedStatus = "completed";

  // 태그: DB가 문자열/JSON/배열 아무거나 보낼 수 있음
  const tags = normalizeTags(
    row.tags ??
    row.TAGS ??
    row.tagList ??
    row.TAG_LIST ??
    row.tagsJson ??
    row.TAGS_JSON ??
    row.TAG_NAMES
  );

  // 주제명: 없으면 '기타'
  const subject = s(row.SUBJECT_NAME || row.SUBJECT || row.TOPIC || row.TOPIC_ID) || "기타";

  // 날짜 정규화 (무조건 YYYY-MM-DD)
  const startDate = toYmd(row.START_DATE || row.start_date || row.startDate);
  const endDate   = toYmd(row.END_DATE   || row.end_date   || row.endDate) || null;

  return {
    id: s(row.STUDY_ID || row.study_id || row.id),
    name: s(row.NAME || row.name) || "이름 없음",
    subject,
    description: s(row.DESCRIPTION || row.description),

    tags,                            // ← 항상 string[]
    type: isOnline ? "online" : "offline",
    duration,

    region: s(row.REGION_PATH) || s(row.REGION_CODE),
    regionDetail: undefined,         // 서버에서 세부 행정구역 분해를 안 주므로 우선 보류

    startDate,                       // ← 항상 'YYYY-MM-DD'
    endDate,                         // ← null 또는 'YYYY-MM-DD'

    maxMembers: Number(row.MAX_MEMBERS ?? row.max_members ?? 10),
    currentMembers: Number(row.CURRENT_MEMBERS ?? row.current_members ?? 1),

    ownerId: row.CREATED_BY ?? row.created_by ?? "",
    ownerNickname: s(row.OWNER_NICKNAME ?? row.created_by_nick) || "호스트",

    status: mappedStatus,
    progress: Number(row.PROGRESS_PCT ?? row.progress ?? 0),
  };
}

/* ---------- API ---------- */

// 스터디 생성
export async function createStudy(payload: {
  name: string;
  description: string;
  tags: string[];
  type: "online" | "offline";
  subject: string;
  regionDetail?: RegionDetail;
  duration: "short" | "long";
  weekDuration?: string;
  dayDuration?: string;
  maxMembers: number;
  startDate: string;      // YYYY-MM-DD
  endDate?: string;       // YYYY-MM-DD
  createdByUserId: number;
}) {
  // 서버: { study_id, status: "OK" } 형태 가정
  const data = await api.request<{ study_id: number; status: string }>(
    "/api/studies",
    { method: "POST", body: payload }
  );
  return data;
}

// 스터디 목록
export async function fetchStudies(): Promise<Study[]> {
  const rawList = await api.request<any[]>("/api/studies", { method: "GET" });
  if (!Array.isArray(rawList)) return [];
  return rawList.map(mapRowToStudy);
}

// 상세(옵션)
export async function getStudyDetail(studyId: string) {
  const data = await api.request<any>(`/api/studies/${studyId}`, { method: "GET" });
  return mapRowToStudy(data);
}

