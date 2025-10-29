import express from "express";
import cors from "cors";
import oracledb from "oracledb";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import dbConfig from "./db/dbConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8181;

// walletDir / TNS_ADMIN 세팅 (지금 너가 쓰고 있는 거 유지)
const walletDir = path.isAbsolute(dbConfig.walletLocation)
  ? dbConfig.walletLocation
  : path.join(__dirname, dbConfig.walletLocation || "db/wallet_Study_Up");

process.env.TNS_ADMIN = walletDir;

async function getConn() {
  return await oracledb.getConnection({
    user: dbConfig.user,               // CYUSER
    password: dbConfig.password,       // CYUSER 비번
    connectString: dbConfig.connectString,
    configDir: walletDir,
    walletLocation: walletDir,
    walletPassword: dbConfig.walletPassword,
  });
}

/**
 * 회원가입
 * body: { email, password, nickname }
 * INSERT INTO USERS (USER_ID, EMAIL, NICKNAME, PASSWORD_HASH, ROLE, STATUS, CREATED_AT)
 * VALUES (SEQ_USERS.NEXTVAL, :email, :nickname, :passwordHash, 'USER', 'ACTIVE', SYSTIMESTAMP)
 */
app.post("/api/signup", async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email과 password는 필수입니다." });
  }

  const finalNickname =
    nickname && nickname.trim() !== "" ? nickname.trim() : email.split("@")[0];

  let connection;
  try {
    connection = await getConn();

    // 이메일 중복 확인 (UQ_USERS_EMAIL)
    const dupCheck = await connection.execute(
      `SELECT USER_ID FROM USERS WHERE EMAIL = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (dupCheck.rows.length > 0) {
      return res.status(409).json({ error: "이미 가입된 이메일입니다." });
    }

    // 비밀번호 해시
    const passwordHash = await bcrypt.hash(password, 10);

    // INSERT + PK 회수
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

    return res.status(201).json({
      user_id: newUserId,
      email,
      nickname: finalNickname,
      role: "USER",
      status: "ACTIVE",
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error("close err:", e); }
    }
  }
});

/**
 * 로그인
 * body: { email, password }
 * 1) USERS에서 해당 email 조회
 * 2) 비번 bcrypt.compare
 * 3) status 가 'ACTIVE' 인지 확인
 * 4) OK면 user info 리턴
 */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email과 password는 필수입니다." });
  }

  let connection;
  try {
    connection = await getConn();

    const result = await connection.execute(
      `
      SELECT USER_ID, EMAIL, NICKNAME, PASSWORD_HASH, ROLE, STATUS
      FROM USERS
      WHERE EMAIL = :email
      `,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const row = result.rows[0];

    // 비밀번호 비교
    const okPw = await bcrypt.compare(password, row.PASSWORD_HASH);
    if (!okPw) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    // status 체크 (ACTIVE만 허용)
    if (row.STATUS !== "ACTIVE") {
      return res.status(403).json({ error: "비활성화된 계정입니다." });
    }

    // 로그인 성공
    return res.json({
      user_id: row.USER_ID,
      email: row.EMAIL,
      nickname: row.NICKNAME,
      role: row.ROLE,
      status: row.STATUS,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error("close err:", e); }
    }
  }
});

// 나머지 /api/studies 등 기존 라우트 그대로 유지

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
