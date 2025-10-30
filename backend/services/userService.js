// services/userService.js
import bcrypt from "bcryptjs";
import { getConn, oracledb } from "../db/oracleClient.js";

// 회원 생성
export async function createUser({ email, password, nickname }) {
  const connection = await getConn();
  try {
    // 중복 이메일 체크
    const dupCheck = await connection.execute(
      `SELECT USER_ID FROM USERS WHERE EMAIL = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (dupCheck.rows.length > 0) {
      // 이미 있음
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

// 로그인용: 이메일로 유저 조회 + 비번검증
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
