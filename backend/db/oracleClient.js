// backend/db/oracleClient.js
import oracledb from "oracledb";
import path from "path";
import { fileURLToPath } from "url";
import dbConfig from "./dbConfig.js";

// __dirname 대체 (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wallet 경로 (backend/db/wallet_Study_Up)
const walletDir = path.join(__dirname, "wallet_Study_Up");

// Oracle Thin 드라이버가 wallet을 찾을 때 참고
process.env.TNS_ADMIN = walletDir;

// ✅ 전역 기본설정: 결과를 객체로, CLOB/NCLOB은 문자열로, (필요시) BLOB은 버퍼로
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB, oracledb.NCLOB];
// 필요하면 BLOB도 버퍼로 받기:
// oracledb.fetchAsBuffer = [oracledb.BLOB];

export async function getConn() {
  return await oracledb.getConnection({
    user: dbConfig.user,
    password: dbConfig.password,
    connectString: dbConfig.connectString, // tnsnames.ora의 alias
    configDir: walletDir,
    walletLocation: walletDir,
    walletPassword: dbConfig.walletPassword,
  });
}

export { oracledb };
