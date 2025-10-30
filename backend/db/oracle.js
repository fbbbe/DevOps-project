// backend/db/oracle.js
// import 'dotenv/config';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import oracledb from 'oracledb';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import oracledb from 'oracledb';
// === 경로 유틸: backend 폴더 기준으로 상대경로 → 절대경로 변환 ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..'); // .../<project>/backend

function toAbsFromBackend(p) {
  if (!p) return null;
  return path.isAbsolute(p) ? p : path.resolve(backendRoot, p);
}

// === 환경 변수 ===
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const CONNECT_STRING = process.env.DB_CONNECT_STRING || process.env.DB_CONNECT;

// DB_WALLET_LOCATION(상대 가능) 또는 기존 TNS_ADMIN 사용
const walletDir =
  toAbsFromBackend(process.env.DB_WALLET_LOCATION) ||
  toAbsFromBackend(process.env.TNS_ADMIN);

// TNS_ADMIN 지정 (Oracle 드라이버가 이 경로에서 tnsnames/sqlnet/지갑 파일을 읽음)
if (walletDir) process.env.TNS_ADMIN = walletDir;


// 결과를 객체로 받기
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// === 진단 로그 + 지갑 필수 파일 존재 체크 ===
console.log('[wallet] walletDir =', walletDir);
console.log('[wallet] TNS_ADMIN =', process.env.TNS_ADMIN);

['tnsnames.ora', 'sqlnet.ora', 'cwallet.sso'].forEach((f) => {
  const full = path.join(process.env.TNS_ADMIN || walletDir || '', f);
  console.log('[wallet] exists?', f, fs.existsSync(full), '->', full);
});

const missing = ['tnsnames.ora', 'sqlnet.ora', 'cwallet.sso'].filter((f) =>
  !fs.existsSync(path.join(process.env.TNS_ADMIN || walletDir || '', f))
);
if (missing.length) {
  throw new Error(
    `[wallet] Missing files: ${missing.join(', ')} in ${
      process.env.TNS_ADMIN || walletDir
    }`
  );
}
//-----------------------------------------------
try {
  const tnsPath = path.join(process.env.TNS_ADMIN, 'tnsnames.ora');
  const tns = fs.readFileSync(tnsPath, 'utf8');
  const alias = (process.env.DB_CONNECT_STRING || '').trim();
  const found = new RegExp(`^\\s*${alias}\\s*=`, 'mi').test(tns);
  console.log('[tnsnames] alias:', alias, 'found:', found, 'in', tnsPath);
} catch (e) {
  console.warn('[tnsnames] check failed:', e.message);
}
//-----------------------------------------------
// === 커넥션 풀 ===
let poolPromise = null;

async function getPool() {
  if (!USER || !PASSWORD || !CONNECT_STRING) {
    throw new Error(
      'DB env missing: DB_USER / DB_PASSWORD / (DB_CONNECT_STRING or DB_CONNECT)'
    );
  }
  if (!poolPromise) {
    poolPromise = oracledb.createPool({
      user: USER,
      password: PASSWORD,
      connectString: CONNECT_STRING, // e.g. studyupdb_high
      poolMin: 1,
      poolMax: 5,
      poolIncrement: 1,
      stmtCacheSize: 30,
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
    const pool = await poolPromise;
    await pool.close(10);
    poolPromise = null;
  }
}

// 종료 시 풀 정리
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});
