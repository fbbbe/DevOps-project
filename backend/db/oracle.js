// backend/db/oracle.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 0) backend 기준 상대경로 → 절대경로
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const toAbs = (p) => !p ? null : (path.isAbsolute(p) ? p : path.resolve(backendRoot, p));

// 1) 환경 변수 읽고 TNS_ADMIN 먼저 세팅
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const CONNECT_STRING = process.env.DB_CONNECT_STRING || process.env.DB_CONNECT;

const walletDir = toAbs(process.env.DB_WALLET_LOCATION) || toAbs(process.env.TNS_ADMIN);
if (walletDir) process.env.TNS_ADMIN = walletDir;

// 2) 이제 oracledb를 “동적으로” import (TNS_ADMIN 세팅 이후)
const oracledb = (await import('oracledb')).default;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; // 결과를 객체로

// 3) 지갑 필수 파일 점검(ewallet 포함)
const must = ['tnsnames.ora', 'sqlnet.ora', 'cwallet.sso', 'ewallet.pem', 'ewallet.p12'];
console.log('[wallet] TNS_ADMIN =', process.env.TNS_ADMIN);
must.forEach(f => {
  const full = path.join(process.env.TNS_ADMIN || '', f);
  console.log('[wallet] exists?', f, fs.existsSync(full), '->', full);
});
const missing = must.filter(f => !fs.existsSync(path.join(process.env.TNS_ADMIN || '', f)));
if (missing.length) {
  throw new Error(`[wallet] Missing files: ${missing.join(', ')} in ${process.env.TNS_ADMIN}`);
}

// 4) 커넥션 풀
let poolPromise = null;
async function getPool() {
  if (!USER || !PASSWORD || !CONNECT_STRING) {
    throw new Error('DB env missing: DB_USER / DB_PASSWORD / (DB_CONNECT_STRING or DB_CONNECT)');
  }
  if (!poolPromise) {
    poolPromise = oracledb.createPool({
      user: USER,
      password: PASSWORD,
      connectString: CONNECT_STRING, // e.g. studyupdb_high
      poolMin: 1, poolMax: 5, poolIncrement: 1, stmtCacheSize: 30,
    });
  }
  return poolPromise;
}

export async function getConnection() {
  const pool = await getPool();
  return pool.getConnection();
}

export async function closePool() {
  if (poolPromise) {
    const p = await poolPromise;
    await p.close(10);
    poolPromise = null;
  }
}

process.on('SIGINT',  async () => { await closePool(); process.exit(0); });
process.on('SIGTERM', async () => { await closePool(); process.exit(0); });
