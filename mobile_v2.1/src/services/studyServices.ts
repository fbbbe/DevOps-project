// mobile_v2.1/src/services/studyServices.ts
import api from "./api";

// 안전 문자열화
const s = (v: any, def = "") => {
  if (v === null || v === undefined) return def;
  try { return String(v); } catch { return def; }
};

// 서버 row -> 화면 Study
function mapRowToStudy(row: any) {
  const isOnline =
    s(row.IS_ONLINE).toUpperCase() === "Y" ||
    s(row.IS_ONLINE).toLowerCase() === "online";

  const duration =
    s(row.TERM_TYPE).toLowerCase() === "long" ? "long" : "short";

  let mappedStatus: "recruiting" | "active" | "completed" = "recruiting";
  const rawStatus = s(row.STATUS).toLowerCase();
  if (rawStatus === "open") mappedStatus = "recruiting";
  else if (rawStatus === "active") mappedStatus = "active";
  else if (rawStatus === "closed" || rawStatus === "expired" || rawStatus === "done")
    mappedStatus = "completed";

  return {
    id: s(row.STUDY_ID),
    name: s(row.NAME),                // ← LOB일 가능성 대비
    subject: row.TOPIC_ID ? s(row.TOPIC_ID) : "기타",
    description: s(row.DESCRIPTION),  // ← LOB일 가능성 대비
    tags: [],

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
