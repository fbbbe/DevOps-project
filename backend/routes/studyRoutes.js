// backend/routes/studyRoutes.js

import express from 'express';
import {
  createStudyInDB,
  getAllStudiesFromDB,
} from '../services/studyService.js';

const router = express.Router();

/** LOB/Stream 판별 */
function isLikelyLob(v) {
  return (
    v &&
    typeof v === 'object' &&
    typeof v.on === 'function' && // Node stream
    ( 'chunkSize' in v || '_chunkSize' in v || 'pieceSize' in v || '_pieceSize' in v || 'type' in v || '_type' in v )
  );
}

/** CLOB/BLOB 스트림 읽어서 문자열로 */
function readLobToString(lob) {
  return new Promise((resolve, reject) => {
    try {
      // CLOB 기준. BLOB이면 base64로 바꾸고 싶다면 여기서 모드 분기
      if (typeof lob.setEncoding === 'function') lob.setEncoding('utf8');
      let acc = '';
      lob.on('data', (chunk) => { acc += chunk; });
      lob.on('end', () => resolve(acc));
      lob.on('error', reject);
      // 일부 드라이버는 close 이벤트가 올 수 있음
      lob.on('close', () => {});
    } catch (e) {
      reject(e);
    }
  });
}

/** 값 정규화: LOB->string, Date->ISO, Buffer->base64, 나머지는 그대로/문자열화 */
async function normalizeValue(v) {
  if (v == null) return v;
  if (isLikelyLob(v)) {
    try { return await readLobToString(v); }
    catch { return ''; }
  }
  if (v instanceof Date) return v.toISOString();
  // Node Buffer
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer?.(v)) {
    // 필요에 따라 'utf8'로 바꾸세요.
    return v.toString('base64');
  }
  // 일반 원시/객체/배열은 그대로 두고, 순환만 라우트레벨에서 끊음
  return v;
}

/** 한 행(객체) 정규화 */
async function normalizeRow(row) {
  const out = {};
  const entries = Object.entries(row ?? {});
  for (const [k, v] of entries) {
    if (Array.isArray(v)) {
      out[k] = await Promise.all(v.map((x) => normalizeValue(x)));
    } else if (v && typeof v === 'object' && !isLikelyLob(v) && !Array.isArray(v)) {
      // 중첩 객체도 한 단계만 순회 (필요시 깊게 처리)
      const inner = {};
      for (const [ik, iv] of Object.entries(v)) {
        inner[ik] = await normalizeValue(iv);
      }
      out[k] = inner;
    } else {
      out[k] = await normalizeValue(v);
    }
  }
  return out;
}

/** 여러 행 정규화 */
async function normalizeRows(rows) {
  if (!Array.isArray(rows)) return [];
  const list = [];
  for (const r of rows) {
    list.push(await normalizeRow(r));
  }
  return list;
}

/** 순환 참조 안전 JSON (로그용) */
function safeStringify(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (k, v) => {
    if (v && typeof v === 'object') {
      if (seen.has(v)) return '[Circular]';
      seen.add(v);
    }
    return v;
  }, 2);
}

// 스터디 생성 (기존 + 결과 정규화)
router.post('/studies', async (req, res) => {
  try {
    const result = await createStudyInDB(req.body);
    const normalized = await normalizeRow(result);
    return res.status(201).json(normalized);
  } catch (err) {
    console.error('Create Study Error:', err);
    return res
      .status(500)
      .json({ error: err?.message || '스터디 생성 실패' });
  }
});

// 스터디 목록 조회 (핵심: LOB -> string)
router.get('/studies', async (req, res) => {
  try {
    const studies = await getAllStudiesFromDB();
    const payload = await normalizeRows(studies);
    return res.json(payload);
  } catch (err) {
    console.error('Get Studies Error:', err?.stack || err);
    // 디버깅 도움
    try { console.error('Get Studies Error (string):', safeStringify(err)); } catch {}
    return res
      .status(500)
      .json({ error: err?.message || '스터디 목록 조회 실패' });
  }
});

export default router;
