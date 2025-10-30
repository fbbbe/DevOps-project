import api from "./api";

// 문자열 안전 변환
const s = (v: any, def = "") => {
  if (v === null || v === undefined) return def;
  try { return String(v); } catch { return def; }
};

// 객체에서 "태그로 쓸 수 있는 문자열"을 최대한 뽑아내기
function pickStringFromObject(o: any): string | null {
  if (!o || typeof o !== "object") return null;

  // 1) 흔한 키 우선
  const common = o.name ?? o.label ?? o.title ?? o.value ?? o.tag ?? o.text ?? o.key ?? o.code;
  if (typeof common === "string") return common;

  // 2) 값들 중 문자열 하나 선택 (우선순위: 짧은 문자열)
  const stringVals = Object.values(o).filter((v) => typeof v === "string") as string[];
  if (stringVals.length) {
    // 너무 긴 건 잘라서 사용
    const chosen = stringVals.sort((a, b) => a.length - b.length)[0];
    return chosen.length > 200 ? chosen.slice(0, 200) : chosen;
  }

  // 3) key:true 형태 → key들을 태그로
  const truthyKeys = Object.entries(o)
    .filter(([, v]) => v === true || v === 1 || v === "1")
    .map(([k]) => k);
  if (truthyKeys.length) return truthyKeys.join(",");

  // 4) 마지막 보루: key:value 쌍을 짧게 직렬화
  try {
    const flat = Object.entries(o)
      .map(([k, v]) => `${k}:${typeof v === "string" ? v : JSON.stringify(v)}`)
      .join(",");
    return flat.length > 200 ? flat.slice(0, 200) : flat;
  } catch {
    return null;
  }
}

// 태그 정규화: 무엇이 오든 string[]
function normalizeTags(input: any): string[] {
  if (input == null) return [];

  // 배열
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

  // 문자열: JSON or 구분자 리스트 대응
  if (typeof input === "string") {
    const txt = input.trim();
    if (!txt) return [];
    // JSON 문자열이면 파싱 후 재귀
    if ((txt.startsWith("[") && txt.endsWith("]")) || (txt.startsWith("{") && txt.endsWith("}"))) {
      try {
        const parsed = JSON.parse(txt);
        return normalizeTags(parsed);
      } catch {
        // 실패하면 아래 구분자 split
      }
    }
    // 콤마/파이프/공백 구분자
    return txt.split(/[,\|]/).map((x) => x.trim()).filter(Boolean);
  }

  // URLSearchParams → 값들만
  if (typeof URLSearchParams !== "undefined" && input instanceof URLSearchParams) {
    return Array.from(input.values()).map((v) => v.trim()).filter(Boolean);
  }

  // 객체 → 문자열 후보 추출
  if (typeof input === "object") {
    const picked = pickStringFromObject(input);
    return picked ? [picked] : [JSON.stringify(input)];
  }

  // 숫자/불리언 등
  return [String(input)];
}

// 서버 row -> 화면 Study
function mapRowToStudy(row: any) {
  const isOnline =
    s(row.IS_ONLINE).toUpperCase() === "Y" ||
    s(row.IS_ONLINE).toLowerCase() === "online";

  const duration = s(row.TERM_TYPE).toLowerCase() === "long" ? "long" : "short";

  let mappedStatus: "recruiting" | "active" | "completed" = "recruiting";
  const rawStatus = s(row.STATUS).toLowerCase();
  if (rawStatus === "open") mappedStatus = "recruiting";
  else if (rawStatus === "active") mappedStatus = "active";
  else if (["closed", "expired", "done"].includes(rawStatus)) mappedStatus = "completed";

  // 서버에서 넘어올 수 있는 여러 후보 컬럼명을 순서대로 시도
  const tags = normalizeTags(
    row.tags ??
    row.TAGS ??
    row.tagList ??
    row.TAG_LIST ??
    row.tagsJson ??
    row.TAGS_JSON
  );

  return {
    id: s(row.STUDY_ID),
    name: s(row.NAME),
    subject: row.TOPIC_ID ? s(row.TOPIC_ID) : "기타",
    description: s(row.DESCRIPTION),
    tags, // ← 항상 string[]

    type: isOnline ? "online" : "offline",
    duration,

    region: s(row.REGION_PATH) || s(row.REGION_CODE),
    regionDetail: undefined,

    startDate: row.START_DATE ? s(row.START_DATE).slice(0, 10) : "",
    endDate: row.END_DATE ? s(row.END_DATE).slice(0, 10) : undefined,

    maxMembers: Number(row.MAX_MEMBERS ?? 10),
    currentMembers: Number(row.CURRENT_MEMBERS ?? 1),

    ownerId: s(row.CREATED_BY),
    ownerNickname: "호스트",

    status: mappedStatus,
    progress: Number(row.PROGRESS_PCT ?? 0),
  };
}

// 목록 API
export async function fetchStudies() {
  const rawList = await api.get<any[]>("/studies");
  if (!Array.isArray(rawList)) return [];
  return rawList.map(mapRowToStudy);
}
