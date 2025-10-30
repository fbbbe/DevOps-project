// backend/services/studyService.js
import { getConn, oracledb } from "../db/oracleClient.js";

/**
 * CreateStudy payload 예시
 * {
 *   name, subject, description, tags,
 *   type,                // "online" | "offline"
 *   regionDetail,        // { sido, sigungu, dongEupMyeon } | undefined
 *   duration,            // "short" | "long"
 *   weekDuration, dayDuration, maxMembers,
 *   startDate, endDate,  // "YYYY-MM-DD"
 *   createdByUserId
 * }
 */

// 스터디 생성
async function createStudyInDB(payload) {
  const {
    name,
    subject, // 현재 TOPIC_ID 매핑 안 하면 FK 없애거나 null 처리
    description,
    tags,
    type,
    regionDetail,
    duration,
    weekDuration,
    dayDuration,
    maxMembers,
    startDate,
    endDate,
    createdByUserId,
  } = payload || {};

  if (!name || !description || !type || !duration || !createdByUserId) {
    throw new Error("필수 항목 누락");
  }

  // TOPIC_ID는 당장 null로 (FK 미구현 가정)
  const TOPIC_ID = null;

  // online/offline
  const IS_ONLINE = type === "online" ? "Y" : "N";
  const STATUS = "OPEN";
  const TERM_TYPE = duration ? duration.toUpperCase() : null;

  // 지역 (offline 일 때만)
  let REGION_CODE = null;
  let REGION_PATH = null;

  if (IS_ONLINE === "N" && regionDetail) {
    REGION_CODE = [regionDetail.sido || "", regionDetail.sigungu || ""]
      .filter(Boolean)
      .join("-")
      .toUpperCase()
      .slice(0, 20); // REGION_CODE VARCHAR2(20)

    REGION_PATH = [
      regionDetail.sido || "",
      regionDetail.sigungu || "",
      regionDetail.dongEupMyeon || "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim()
      .slice(0, 200); // REGION_PATH VARCHAR2(200)
  }

  const startDateBind = startDate && startDate !== "" ? startDate : null;
  const endDateBind = endDate && endDate !== "" ? endDate : null;

  const connection = await getConn();

  try {
    const result = await connection.execute(
      `
      INSERT INTO STUDIES (
        STUDY_ID,
        NAME,
        DESCRIPTION,
        TOPIC_ID,
        REGION_CODE,
        REGION_PATH,
        IS_ONLINE,
        TERM_TYPE,
        START_DATE,
        END_DATE,
        STATUS,
        CREATED_BY,
        PROGRESS_PCT
      )
      VALUES (
        SEQ_STUDIES.NEXTVAL,
        :name,
        :description,
        :topicId,
        :regionCode,
        :regionPath,
        :isOnline,
        :termType,
        CASE WHEN :startDate IS NULL THEN NULL ELSE TO_DATE(:startDate, 'YYYY-MM-DD') END,
        CASE WHEN :endDate   IS NULL THEN NULL ELSE TO_DATE(:endDate,   'YYYY-MM-DD') END,
        :status,
        :createdBy,
        0
      )
      RETURNING STUDY_ID INTO :newStudyId
      `,
      {
        name,
        description,
        topicId: TOPIC_ID,
        regionCode: REGION_CODE,
        regionPath: REGION_PATH,
        isOnline: IS_ONLINE,
        termType: TERM_TYPE,
        startDate: startDateBind,
        endDate: endDateBind,
        status: STATUS,
        createdBy: createdByUserId,
        newStudyId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    await connection.commit();

    const newStudyId = result.outBinds.newStudyId[0];

    // TODO: tags 배열 -> STUDY_TAGS insert 로직(후순위)
    return { study_id: newStudyId, status: "OK" };
  } finally {
    try { await connection.close(); } catch {}
  }
}

// 스터디 목록 조회 (CLOB 오류 수정된 버전)
export async function getAllStudiesFromDB() {
  const conn = await getConn();

  try {
    const result = await conn.execute(
      `
      /* [수정됨] 
        태그를 먼저 StudyTags CTE로 그룹화하여 CLOB (DESCRIPTION) 컬럼이 
        GROUP BY 절에 포함되지 않도록 쿼리 구조를 변경합니다.
      */
      WITH StudyTags AS (
        SELECT
          ST.STUDY_ID,
          LISTAGG(T.NAME_KO, ',') WITHIN GROUP (ORDER BY T.TAG_ID) AS TAG_NAMES
        FROM
          STUDY_TAGS ST
        JOIN
          TAGS T ON ST.TAG_ID = T.TAG_ID
        GROUP BY
          ST.STUDY_ID
      )
      SELECT
        S.STUDY_ID,
        S.NAME,
        S.DESCRIPTION, -- CLOB 컬럼
        S.TOPIC_ID,
        S.REGION_CODE,
        S.REGION_PATH,
        S.IS_ONLINE,
        S.TERM_TYPE,
        S.START_DATE,
        S.END_DATE,
        S.STATUS,
        S.CREATED_BY,
        S.PROGRESS_PCT,
        ST.TAG_NAMES  -- StudyTags CTE에서 합쳐진 태그 목록
      FROM
        STUDIES S
      LEFT JOIN
        StudyTags ST ON S.STUDY_ID = ST.STUDY_ID
      ORDER BY
        S.STUDY_ID DESC
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = result.rows || [];

    // 이 cleanRows 로직은 이전과 동일하게 유지합니다.
    // routes에서 CLOB(DESCRIPTION)과 날짜(START_DATE)를 잘 처리해 줄 것입니다.
    const cleanRows = rows.map((r) => ({
      STUDY_ID: r.STUDY_ID,
      NAME: r.NAME ?? "",
      DESCRIPTION: r.DESCRIPTION ?? "", // CLOB은 여기서 객체로 전달됩니다.
      TOPIC_ID: r.TOPIC_ID ?? null,
      REGION_CODE: r.REGION_CODE ?? "",
      REGION_PATH: r.REGION_PATH ?? "",
      IS_ONLINE:
        String(r.IS_ONLINE || "").toUpperCase() === "Y" ? "online" : "offline",
      TERM_TYPE:
        String(r.TERM_TYPE || "").toUpperCase() === "LONG" ? "long" : "short",
      START_DATE: r.START_DATE ?? null, // Date 객체 (res.json에서 ISO로 직렬화됨)
      END_DATE: r.END_DATE ?? null,
      STATUS: r.STATUS ?? "OPEN",
      CREATED_BY: r.CREATED_BY ?? null,
      PROGRESS_PCT: Number(r.PROGRESS_PCT ?? 0),

      // 쉼표로 구분된 문자열을 배열로 변환
      TAGS: (r.TAG_NAMES || '').split(',').filter(Boolean),
    }));

    return cleanRows;
  } finally {
    try { await conn.close(); } catch {}
  }
}

export { createStudyInDB };