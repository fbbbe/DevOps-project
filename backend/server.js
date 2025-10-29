import express from "express";
import cors from "cors";
import oracledb from "oracledb";
import path from "path";
import { fileURLToPath } from "url";
import dbConfig from "./db/dbConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8181;

// 1) wallet 디렉토리 절대경로 만들기
//    - DB_WALLET_LOCATION이 "./db/wallet_Study_Up" 이런 상대경로라면
//      실행 위치에 따라 깨질 수 있으니까 여기서 절대경로로 바꿔줌
const walletDir = dbConfig.walletLocation
  ? (path.isAbsolute(dbConfig.walletLocation)
      ? dbConfig.walletLocation
      : path.join(__dirname, dbConfig.walletLocation))
  : path.join(__dirname, "db", "wallet_Study_Up");

// 2) oracledb가 tnsnames.ora / sqlnet.ora 를 여기서 찾도록 알려주기
//    두 가지 방식이 있는데, 둘 다 넣어도 문제 없음.
//    - process.env.TNS_ADMIN = walletDir  (전역 설정)
//    - getConnection 옵션에 configDir: walletDir
process.env.TNS_ADMIN = walletDir;

// 예시 API
app.get("/api/recipes", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
      // Oracle Autonomous / ATP 스타일 TLS 접속 정보
      walletLocation: walletDir,
      walletPassword: dbConfig.walletPassword || undefined,

      // ✨ 이게 핵심: NJS-516 해결
      configDir: walletDir,
    });

    const result = await connection.execute("SELECT * FROM RECIPES");
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error(closeErr);
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
