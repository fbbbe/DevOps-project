// services/userService.js
import bcrypt from "bcryptjs";
import { getConn, oracledb } from "../db/oracleClient.js";

// ?ì ?ì±
export async function createUser({ email, password, nickname }) {
  const connection = await getConn();
  try {
    // ì¤ë³µ ?´ë©??ì²´í¬
    const dupCheck = await connection.execute(
      `SELECT USER_ID FROM USERS WHERE EMAIL = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (dupCheck.rows.length > 0) {
      // ?´ë? ?ì
      return { error: "DUP_EMAIL" };
    }

    const finalNickname =
      nickname && nickname.trim() !== ""
        ? nickname.trim()
        : email.split("@")[0];

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await connection.execute(
      `
      INSERT INTO USERS (
        USER_ID,
        EMAIL,
        NICKNAME,
        PASSWORD_HASH,
        ROLE,
        STATUS,
        CREATED_AT
      )
      VALUES (
        SEQ_USERS.NEXTVAL,
        :email,
        :nickname,
        :passwordHash,
        'USER',
        'ACTIVE',
        SYSTIMESTAMP
      )
      RETURNING USER_ID INTO :newUserId
      `,
      {
        email,
        nickname: finalNickname,
        passwordHash,
        newUserId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    await connection.commit();

    const newUserId = result.outBinds.newUserId[0];

    return {
      user_id: newUserId,
      email,
      nickname: finalNickname,
      role: "USER",
      status: "ACTIVE",
    };
  } finally {
    try {
      await connection.close();
    } catch (e) {}
  }
}

// ë¡ê·¸?¸ì©: ?´ë©?¼ë¡ ? ì? ì¡°í + ë¹ë²ê²ì¦?
export async function loginUser({ email, password }) {
  const connection = await getConn();
  try {
    const result = await connection.execute(
      `
      SELECT USER_ID,
             EMAIL,
             NICKNAME,
             PASSWORD_HASH,
             ROLE,
             STATUS
      FROM USERS
      WHERE EMAIL = :email
      `,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return { error: "BAD_CRED" };
    }

    const row = result.rows[0];

    const okPw = await bcrypt.compare(password, row.PASSWORD_HASH);
    if (!okPw) {
      return { error: "BAD_CRED" };
    }

    if (row.STATUS !== "ACTIVE") {
      return { error: "INACTIVE" };
    }

    return {
      user_id: row.USER_ID,
      email: row.EMAIL,
      nickname: row.NICKNAME,
      role: row.ROLE,
      status: row.STATUS,
    };
  } finally {
    try {
      await connection.close();
    } catch (e) {}
  }
}

export async function updateUserNickname({ userId, nickname }) {
  const connection = await getConn();
  try {
    const trimmed = typeof nickname === "string" ? nickname.trim() : "";
    if (!trimmed) {
      throw new Error("?ë¤?ì ?ë ¥??ì£¼ì¸??");
    }

    const updateRes = await connection.execute(
      `
      UPDATE USERS
      SET NICKNAME = :nickname
      WHERE USER_ID = :userId
      `,
      { nickname: trimmed, userId }
    );

    if (updateRes.rowsAffected === 0) {
      await connection.rollback();
      throw new Error("?¬ì©?ë? ì°¾ì ???ìµ?ë¤.");
    }

    const selectRes = await connection.execute(
      `
      SELECT USER_ID, EMAIL, NICKNAME, ROLE, STATUS
      FROM USERS
      WHERE USER_ID = :userId
      `,
      { userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.commit();

    const row = selectRes.rows?.[0];
    if (!row) {
      throw new Error("?ë¡???ë³´ë¥?ë¶ë¬?????ìµ?ë¤.");
    }

    return {
      user_id: row.USER_ID,
      email: row.EMAIL,
      nickname: row.NICKNAME,
      role: row.ROLE,
      status: row.STATUS,
    };
  } catch (err) {
    try {
      await connection.rollback();
    } catch {}
    throw err;
  } finally {
    try {
      await connection.close();
    } catch {}
  }
}
