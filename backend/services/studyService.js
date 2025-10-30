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

// 스터디 생성 (트랜잭션 및 태그 저장 기능 추가)
async function createStudyInDB(payload) {
  const {
    name,
    subject,
    description,
    tags, // ['태그1', '태그2']
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

  // === [수정] 트랜잭션 시작 ===
  const connection = await getConn(); 
  
  try {
    // 1. 스터디 본문 저장
    const TOPIC_ID = null; // 주제는 일단 null 유지
    const IS_ONLINE = type === "online" ? "Y" : "N";
    const REGION_CODE = regionDetail?.sido ?? (type === 'online' ? 'ONLINE' : null);
    const REGION_PATH =
      type === "online"
        ? "온라인"
        : [regionDetail?.sido, regionDetail?.sigungu, regionDetail?.dongEupMyeon]
            .filter(Boolean)
            .join(" ");

    const studyBind = {
      name,
      description,
      TOPIC_ID,
      REGION_CODE,
      REGION_PATH,
      IS_ONLINE,
      TERM_TYPE: duration.toUpperCase(),
      START_DATE: { val: TO_DATE(startDate), type: oracledb.DATE },
      END_DATE: { val: TO_DATE(endDate), type: oracledb.DATE },
      STATUS: "OPEN", // 스터디 생성 시 기본 상태 'OPEN'
      CREATED_BY: createdByUserId,
      PROGRESS_PCT: 0,
      newStudyId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const studySql = `
      INSERT INTO STUDIES (
        STUDY_ID, NAME, DESCRIPTION, TOPIC_ID, REGION_CODE, REGION_PATH,
        IS_ONLINE, TERM_TYPE, START_DATE, END_DATE, STATUS, CREATED_BY, PROGRESS_PCT
      ) VALUES (
        SEQ_STUDIES.NEXTVAL, :name, :description, :TOPIC_ID, :REGION_CODE, :REGION_PATH,
        :IS_ONLINE, :TERM_TYPE, :START_DATE, :END_DATE, :STATUS, :CREATED_BY, :PROGRESS_PCT
      ) RETURNING STUDY_ID INTO :newStudyId
    `;

    const studyResult = await connection.execute(studySql, studyBind);
    const newStudyId = studyResult.outBinds.newStudyId[0];

    // --- [신규] 2. 태그 저장 로직 ---
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        if (!tagName || tagName.trim() === "") continue;

        let tagId;

        // 2a. 기존 태그 검색
        const findTagSql = `SELECT TAG_ID FROM TAGS WHERE NAME_KO = :tagName`;
        const findTagRes = await connection.execute(findTagSql, { tagName });

        if (findTagRes.rows.length > 0) {
          tagId = findTagRes.rows[0].TAG_ID;
        } else {
          // 2b. 신규 태그 생성 (SEQ_TAGS 시퀀스 사용)
          const createTagSql = `
            INSERT INTO TAGS (TAG_ID, NAME_KO) 
            VALUES (SEQ_TAGS.NEXTVAL, :tagName)
            RETURNING TAG_ID INTO :newTagId
          `;
          const createTagRes = await connection.execute(createTagSql, {
            tagName,
            newTagId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          });
          tagId = createTagRes.outBinds.newTagId[0];
        }

        // 2c. 스터디와 태그 연결 (STUDY_TAGS)
        const linkTagSql = `
          INSERT INTO STUDY_TAGS (STUDY_ID, TAG_ID) 
          VALUES (:newStudyId, :tagId)
        `;
        await connection.execute(linkTagSql, { newStudyId, tagId });
      }
    }
    
    // --- [수정] 3. 모든 작업 성공 시 Commit ---
    await connection.commit();

    // 프론트로 생성된 스터디 ID 반환
    return {
      STUDY_ID: newStudyId,
      NAME: name,
      STATUS: "OPEN",
    };

  } catch (err) {
    // --- [수정] 4. 하나라도 실패 시 Rollback ---
    await connection.rollback();
    console.error("CreateStudyInDB Error:", err);
    throw new Error("스터디 생성 중 오류가 발생했습니다: " + err.message);
  } finally {
    // --- [수정] 5. 연결 종료 ---
    try {
      await connection.close();
    } catch (e) {}
  }
}

// YYYY-MM-DD 문자열을 Date 객체로 (null/undefined 안전)
function TO_DATE(str) {
  if (!str) return null;
  try {
    const dt = new Date(str);
    return isNaN(dt.getTime()) ? null : dt;
  } catch (e) {
    return null;
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