// backend/services/studyService.js
import { getConn, oracledb } from "../db/oracleClient.js";

/**
 * payload 예시 (CreateStudyScreen에서 보내는 값)
 * {
 *   name,
 *   subject,
 *   description,
 *   tags,
 *   type,                // "online" | "offline"
 *   regionDetail,        // { sido, sigungu, dongEupMyeon } | undefined (offline일 때만)
 *   duration,            // "short" | "long"
 *   weekDuration,
 *   dayDuration,
 *   maxMembers,
 *   startDate,           // "YYYY-MM-DD" 문자열
 *   endDate,             // "YYYY-MM-DD" 문자열
 *   createdByUserId      // 로그인된 사용자 ID (USERS.USER_ID)
 * }
 */
async function createStudyInDB(payload) {
  const {
    name,
    subject,
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

  // 1) 필수값 체크 (DB 제약조건에 필요한 최소값)
  if (!name || !description || !type || !duration || !createdByUserId) {
    throw new Error("필수 항목 누락");
  }

  // 2) TOPIC_ID 처리
  // 지금 TOPICS 테이블과 매핑(외래키) 안 되어 있어서 subject 넣으면 FK 에러(ORA-02291) 날 수 있음.
  // 당장은 NULL로 넣어서 FK 위반 안 나게 함.
  const TOPIC_ID = null;

  // 3) 온라인/오프라인 관련
  // STUDIES.IS_ONLINE 은 CHECK ('Y','N')
  const IS_ONLINE = type === "online" ? "Y" : "N";

  // STATUS CHECK ('OPEN','CLOSED','EXPIRED')
  const STATUS = "OPEN";

  // TERM_TYPE 은 'SHORT' / 'LONG' 등 문자열 (컬럼 NULL 허용이라 없으면 null 가능)
  const TERM_TYPE = duration ? duration.toUpperCase() : null;

  // 지역 정보 (offline일 때만 들어감)
  let REGION_CODE = null;
  let REGION_PATH = null;

  if (IS_ONLINE === "N" && regionDetail) {
    // REGION_CODE 예: "전라북도-군산시" 같은 걸 대문자/하이픈 등으로 가공
    REGION_CODE = [
      regionDetail.sido || "",
      regionDetail.sigungu || "",
    ]
      .filter(Boolean)
      .join("-")
      .toUpperCase()
      .slice(0, 20); // 컬럼 VARCHAR2(20)

    // REGION_PATH 예: "전라북도 군산시 나운동"
    REGION_PATH = [
      regionDetail.sido || "",
      regionDetail.sigungu || "",
      regionDetail.dongEupMyeon || "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim()
      .slice(0, 200); // 컬럼 VARCHAR2(200)
  }

  // 4) 날짜 바인딩 (빈 문자열이면 null로 넣어주지 않으면 TO_DATE('') 에러)
  const startDateBind =
    startDate && startDate !== "" ? startDate : null;
  const endDateBind =
    endDate && endDate !== "" ? endDate : null;

  // 5) DB 연결 후 INSERT
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

    // 커밋
    await connection.commit();

    // RETURNING STUDY_ID INTO :newStudyId 결과 뽑기
    const newStudyId = result.outBinds.newStudyId[0];

    // TODO: tags 배열이 있다면 STUDY_TAGS 같은 릴레이션 테이블에 insert하는 로직 추가 가능

    return {
      study_id: newStudyId,
      status: "OK",
    };
  } finally {
    // 커넥션 닫기 (에러가 나든 말든 시도)
    try {
      await connection.close();
    } catch (e) {
      // 무시
    }
  }
}

// 스터디 목록 조회
export async function getAllStudiesFromDB() {
  // ✅ 여기서 getConn()을 써야 함 (getConnection() 아님)
  const conn = await getConn();

  try {
    const result = await conn.execute(
      `
      SELECT
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
      FROM STUDIES
      ORDER BY STUDY_ID DESC
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    // result.rows: [
    //   {
    //     STUDY_ID: 12,
    //     NAME: '토익 스터디',
    //     DESCRIPTION: '매일 단어 외우기',
    //     TOPIC_ID: null,
    //     REGION_CODE: 'JEONBUK-GUNSAN',   -- 우리가 .slice(0,20) 해서 넣은 값
    //     REGION_PATH: '전라북도 군산시 나운동', 
    //     IS_ONLINE: 'N' or 'Y',
    //     TERM_TYPE: 'SHORT' or 'LONG',
    //     START_DATE: Date,
    //     END_DATE:   Date | null,
    //     STATUS: 'OPEN',
    //     CREATED_BY: 1,
    //     PROGRESS_PCT: 0
    //   },
    //   ...
    // ]

    return result.rows || [];
  } finally {
    try {
      await conn.close();
    } catch (_) {
      // 연결 닫는 중 에러는 조용히 무시
    }
  }
}

export { createStudyInDB };
