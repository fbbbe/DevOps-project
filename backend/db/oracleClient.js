// db/oracleClient.js
import oracledb from "oracledb";
import path from "path";
import { fileURLToPath } from "url";
import dbConfig from "./dbConfig.js";

// __dirname 대체 (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 1) wallet 디렉터리를 명확하게 지정
//    백엔드 기준: backend/db/wallet_Study_Up
const walletDir = path.join(__dirname, "wallet_Study_Up");

// ✅ 2) thin 드라이버가 wallet을 찾을 때 참고하는 환경변수
process.env.TNS_ADMIN = walletDir;

// ✅ 3) 실제 연결 함수
export async function getConn() {
  return await oracledb.getConnection({
    user: dbConfig.user,                 // CYUSER
    password: dbConfig.password,         // CYUSER 비번
    connectString: dbConfig.connectString, // tnsnames.ora 안의 alias (예: STUDY_UP_HIGH 이런거)
    configDir: walletDir,
    walletLocation: walletDir,
    walletPassword: dbConfig.walletPassword,
  });
}

// oracledb 상수/타입도 외부에서 쓸 수 있게 export
export { oracledb };
