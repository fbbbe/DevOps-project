// backend/services/studyService.js
import { getConn, oracledb } from "../db/oracleClient.js";

// === Utility helpers ======================================================

function TO_DATE(str) {
  if (!str) return null;
  try {
    const dt = new Date(str);
    return Number.isNaN(dt.getTime()) ? null : dt;
  } catch (e) {
    return null;
  }
}

const COLUMN_CACHE = {
  studyMembers: null,
  joinRequests: null,
};

async function loadColumns(connection, tableName) {
  const cacheKey = tableName.toLowerCase();
  if (COLUMN_CACHE[cacheKey]) return COLUMN_CACHE[cacheKey];

  const result = await connection.execute(
    `SELECT COLUMN_NAME FROM ALL_TAB_COLUMNS WHERE TABLE_NAME = :tableName`,
    { tableName: tableName.toUpperCase() },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const columns = new Set(
    (result.rows || []).map((row) => String(row.COLUMN_NAME).toUpperCase())
  );
  COLUMN_CACHE[cacheKey] = columns;
  return columns;
}

function hasColumn(columns, name) {
  return columns.has(name.toUpperCase());
}

async function closeQuietly(connection) {
  if (!connection) return;
  try {
    await connection.close();
  } catch (e) {
    // ignore
  }
}

// === Study Creation =======================================================

export async function createStudyInDB(payload) {
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

  if (!name || !description || !type || !duration || !createdByUserId) {
    throw new Error("필수 항목 누락");
  }

  const connection = await getConn();

  try {
    const TOPIC_ID = null;
    const IS_ONLINE = type === "online" ? "Y" : "N";
    const REGION_CODE = regionDetail?.sido ?? (type === "online" ? "ONLINE" : null);
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
      STATUS: "OPEN",
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

    if (tags && tags.length > 0) {
      for (const tagNameRaw of tags) {
        const tagName = (tagNameRaw ?? "").trim();
        if (!tagName) continue;

        let tagId;
        const findTagSql = `SELECT TAG_ID FROM TAGS WHERE NAME_KO = :tagName`;
        const findTagRes = await connection.execute(findTagSql, { tagName });
        if (findTagRes.rows?.length) {
          tagId = findTagRes.rows[0].TAG_ID;
        } else {
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

        const linkTagSql = `
          INSERT INTO STUDY_TAGS (STUDY_ID, TAG_ID)
          VALUES (:newStudyId, :tagId)
        `;
        await connection.execute(linkTagSql, { newStudyId, tagId });
      }
    }

    await connection.commit();

    return {
      STUDY_ID: newStudyId,
      NAME: name,
      STATUS: "OPEN",
    };
  } catch (err) {
    await connection.rollback();
    console.error("CreateStudyInDB Error:", err);
    throw new Error("스터디 생성 중 오류가 발생했습니다: " + err.message);
  } finally {
    await closeQuietly(connection);
  }
}

// === Study List ===========================================================

export async function getAllStudiesFromDB() {
  const conn = await getConn();

  try {
    const result = await conn.execute(
      `
      WITH StudyTags AS (
        SELECT
          ST.STUDY_ID,
          LISTAGG(T.NAME_KO, ',') WITHIN GROUP (ORDER BY T.TAG_ID) AS TAG_NAMES
        FROM STUDY_TAGS ST
        JOIN TAGS T ON ST.TAG_ID = T.TAG_ID
        GROUP BY ST.STUDY_ID
      )
      SELECT
        S.STUDY_ID,
        S.NAME,
        S.DESCRIPTION,
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
        ST.TAG_NAMES,
        U.NICKNAME AS OWNER_NICKNAME
      FROM STUDIES S
      LEFT JOIN StudyTags ST ON S.STUDY_ID = ST.STUDY_ID
      LEFT JOIN USERS U ON U.USER_ID = S.CREATED_BY
      ORDER BY S.STUDY_ID DESC
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = result.rows || [];

    return rows.map((r) => ({
      STUDY_ID: r.STUDY_ID,
      NAME: r.NAME ?? "",
      DESCRIPTION: r.DESCRIPTION ?? "",
      TOPIC_ID: r.TOPIC_ID ?? null,
      REGION_CODE: r.REGION_CODE ?? "",
      REGION_PATH: r.REGION_PATH ?? "",
      IS_ONLINE: String(r.IS_ONLINE || "").toUpperCase() === "Y" ? "online" : "offline",
      TERM_TYPE: String(r.TERM_TYPE || "").toUpperCase() === "LONG" ? "long" : "short",
      START_DATE: r.START_DATE ?? null,
      END_DATE: r.END_DATE ?? null,
      STATUS: r.STATUS ?? "OPEN",
      CREATED_BY: r.CREATED_BY ?? null,
      PROGRESS_PCT: Number(r.PROGRESS_PCT ?? 0),
      TAGS: (r.TAG_NAMES || '').split(',').filter(Boolean),
      OWNER_NICKNAME: r.OWNER_NICKNAME ?? '',
    }));
  } finally {
    await closeQuietly(conn);
  }
}

// === Study Members ========================================================

export async function getStudyMembersFromDB(studyId) {
  const connection = await getConn();
  try {
    const memberColumns = await loadColumns(connection, 'STUDY_MEMBERS');

    const selectFields = [
      'sm.STUDY_MEMBER_ID AS MEMBER_ID',
      'sm.STUDY_ID',
      'sm.USER_ID',
      hasColumn(memberColumns, 'ROLE') ? "NVL(sm.ROLE, 'MEMBER') AS ROLE" : "'MEMBER' AS ROLE",
      hasColumn(memberColumns, 'JOINED_AT') ? 'sm.JOINED_AT' : 'NULL AS JOINED_AT',
      hasColumn(memberColumns, 'ATTENDANCE_RATE')
        ? 'sm.ATTENDANCE_RATE'
        : 'NULL AS ATTENDANCE_RATE',
      hasColumn(memberColumns, 'WARNING_COUNT')
        ? 'NVL(sm.WARNING_COUNT, 0) AS WARNING_COUNT'
        : hasColumn(memberColumns, 'WARNINGS')
          ? 'NVL(sm.WARNINGS, 0) AS WARNING_COUNT'
          : '0 AS WARNING_COUNT',
      'u.NICKNAME',
      'u.EMAIL',
      'u.ROLE AS USER_ROLE',
      'u.STATUS',
    ];

    const baseMemberSql = `
      SELECT ${selectFields.join(', ')}
      FROM STUDY_MEMBERS sm
      JOIN USERS u ON u.USER_ID = sm.USER_ID
      WHERE sm.STUDY_ID = :studyId
    `;

    const ownerSql = `
      SELECT
        NULL AS MEMBER_ID,
        s.STUDY_ID,
        s.CREATED_BY AS USER_ID,
        'OWNER' AS ROLE,
        NULL AS JOINED_AT,
        NULL AS ATTENDANCE_RATE,
        0 AS WARNING_COUNT,
        u.NICKNAME,
        u.EMAIL,
        u.ROLE AS USER_ROLE,
        u.STATUS
      FROM STUDIES s
      JOIN USERS u ON u.USER_ID = s.CREATED_BY
      WHERE s.STUDY_ID = :studyId
        AND NOT EXISTS (
          SELECT 1
          FROM STUDY_MEMBERS sm
          WHERE sm.STUDY_ID = s.STUDY_ID AND sm.USER_ID = s.CREATED_BY
        )
    `;

    const result = await connection.execute(
      `
      ${baseMemberSql}
      UNION ALL
      ${ownerSql}
      ORDER BY ROLE DESC, JOINED_AT NULLS LAST, NICKNAME
      `,
      { studyId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows || [];
  } finally {
    await closeQuietly(connection);
  }
}

export async function getMembershipStatusFromDB(studyId, userId) {
  if (!userId) {
    return { status: 'guest' };
  }
  const connection = await getConn();
  try {
    const memberRes = await connection.execute(
      `
      SELECT ROLE
      FROM STUDY_MEMBERS
      WHERE STUDY_ID = :studyId AND USER_ID = :userId
      `,
      { studyId, userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (memberRes.rows?.length) {
      const role = (memberRes.rows[0].ROLE || '').toLowerCase();
      return { status: role === 'owner' ? 'owner' : 'member' };
    }

    const ownerRes = await connection.execute(
      `SELECT 1 FROM STUDIES WHERE STUDY_ID = :studyId AND CREATED_BY = :userId`,
      { studyId, userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (ownerRes.rows?.length) {
      return { status: 'owner' };
    }

    const requestRes = await connection.execute(
      `
      SELECT REQUEST_ID, STATUS
      FROM STUDY_JOIN_REQUESTS
      WHERE STUDY_ID = :studyId AND USER_ID = :userId
      ORDER BY REQUESTED_AT DESC
      FETCH FIRST 1 ROW ONLY
      `,
      { studyId, userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (requestRes.rows?.length) {
      const row = requestRes.rows[0];
      return { status: String(row.STATUS || '').toLowerCase(), requestId: row.REQUEST_ID };
    }

    return { status: 'none' };
  } finally {
    await closeQuietly(connection);
  }
}

export async function createJoinRequestInDB({ studyId, userId, message }) {
  const connection = await getConn();
  try {
    const memberCheck = await connection.execute(
      `SELECT 1 FROM STUDY_MEMBERS WHERE STUDY_ID = :studyId AND USER_ID = :userId`,
      { studyId, userId }
    );
    if (memberCheck.rows?.length) {
      return { status: 'already_member' };
    }

    const existing = await connection.execute(
      `
      SELECT REQUEST_ID, STATUS
      FROM STUDY_JOIN_REQUESTS
      WHERE STUDY_ID = :studyId AND USER_ID = :userId
      ORDER BY REQUESTED_AT DESC
      FETCH FIRST 1 ROW ONLY
      `,
      { studyId, userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (existing.rows?.length) {
      const row = existing.rows[0];
      if (String(row.STATUS).toUpperCase() === 'PENDING') {
        return { status: 'pending', requestId: row.REQUEST_ID };
      }
      if (String(row.STATUS).toUpperCase() === 'APPROVED') {
        return { status: 'already_member' };
      }
    }

    const insertSql = `
      INSERT INTO STUDY_JOIN_REQUESTS (
        REQUEST_ID, STUDY_ID, USER_ID, MESSAGE, STATUS, REQUESTED_AT
      ) VALUES (
        SEQ_STUDY_JOIN_REQUESTS.NEXTVAL, :studyId, :userId, :message, 'PENDING', SYSTIMESTAMP
      ) RETURNING REQUEST_ID INTO :newRequestId
    `;

    const res = await connection.execute(insertSql, {
      studyId,
      userId,
      message: message ?? null,
      newRequestId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    });

    await connection.commit();

    return { status: 'pending', requestId: res.outBinds.newRequestId[0] };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    await closeQuietly(connection);
  }
}

export async function cancelJoinRequestInDB({ studyId, userId }) {
  const connection = await getConn();
  try {
    const result = await connection.execute(
      `
      UPDATE STUDY_JOIN_REQUESTS
      SET STATUS = 'CANCELLED', UPDATED_AT = SYSTIMESTAMP
      WHERE STUDY_ID = :studyId AND USER_ID = :userId AND STATUS = 'PENDING'
      `,
      { studyId, userId }
    );
    await connection.commit();
    return { cancelled: result.rowsAffected > 0 };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    await closeQuietly(connection);
  }
}

export async function getJoinRequestsFromDB(studyId) {
  const connection = await getConn();
  try {
    const result = await connection.execute(
      `
      SELECT
        r.REQUEST_ID,
        r.STUDY_ID,
        r.USER_ID,
        r.MESSAGE,
        r.STATUS,
        r.REQUESTED_AT,
        r.UPDATED_AT,
        r.DECIDED_BY,
        u.NICKNAME,
        u.EMAIL
      FROM STUDY_JOIN_REQUESTS r
      JOIN USERS u ON u.USER_ID = r.USER_ID
      WHERE r.STUDY_ID = :studyId
      ORDER BY r.REQUESTED_AT DESC
      `,
      { studyId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows || [];
  } finally {
    await closeQuietly(connection);
  }
}

export async function updateJoinRequestStatusInDB({ requestId, decision, decidedBy }) {
  const connection = await getConn();
  try {
    const fetch = await connection.execute(
      `
      SELECT REQUEST_ID, STUDY_ID, USER_ID, STATUS
      FROM STUDY_JOIN_REQUESTS
      WHERE REQUEST_ID = :requestId
      `,
      { requestId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!fetch.rows?.length) {
      return { error: 'not_found' };
    }

    const row = fetch.rows[0];
    if (String(row.STATUS).toUpperCase() !== 'PENDING') {
      return { error: 'already_processed' };
    }

    const newStatus = decision === 'approve' ? 'APPROVED' : 'REJECTED';

    if (newStatus === 'APPROVED') {
      await connection.execute(
        `
        INSERT INTO STUDY_MEMBERS (
          STUDY_MEMBER_ID, STUDY_ID, USER_ID, ROLE, JOINED_AT, ATTENDANCE_RATE, WARNING_COUNT
        ) VALUES (
          SEQ_STUDY_MEMBERS.NEXTVAL, :studyId, :userId, 'MEMBER', SYSTIMESTAMP, 0, 0
        )
        `,
        { studyId: row.STUDY_ID, userId: row.USER_ID }
      );
    }

    await connection.execute(
      `
      UPDATE STUDY_JOIN_REQUESTS
      SET STATUS = :status,
          UPDATED_AT = SYSTIMESTAMP,
          DECIDED_AT = SYSTIMESTAMP,
          DECIDED_BY = :decidedBy
      WHERE REQUEST_ID = :requestId
      `,
      { status: newStatus, decidedBy, requestId }
    );

    await connection.commit();
    return { status: newStatus };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    await closeQuietly(connection);
  }
}
