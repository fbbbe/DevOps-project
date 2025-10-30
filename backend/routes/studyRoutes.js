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
    typeof v.on === 'function' &&
    ('chunkSize' in v ||
      '_chunkSize' in v ||
      'pieceSize' in v ||
      '_pieceSize' in v ||
      'type' in v ||
      '_type' in v)
  );
}

/** CLOB/BLOB 스트림을 문자열로 변환 */
function readLobToString(lob) {
  return new Promise((resolve, reject) => {
    try {
      if (typeof lob.setEncoding === 'function') lob.setEncoding('utf8');
      let acc = '';
      lob.on('data', (chunk) => {
        acc += chunk;
      });
      lob.on('end', () => resolve(acc));
      lob.on('error', reject);
      lob.on('close', () => {});
    } catch (e) {
      reject(e);
    }
  });
}

/** 값 정규화: LOB->string, Date->ISO, Buffer->base64 */
async function normalizeValue(v) {
  if (v == null) return v;
  if (isLikelyLob(v)) {
    try {
      return await readLobToString(v);
    } catch {
      return '';
    }
  }
  if (v instanceof Date) return v.toISOString();
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer?.(v)) {
    return v.toString('base64');
  }
  return v;
}

/** 한 행(객체) 정규화 */
async function normalizeRow(row) {
  const out = {};
  const entries = Object.entries(row ?? {});
  for (const [k, v] of entries) {
    if (v instanceof Date) {
      out[k] = await normalizeValue(v);
    } else if (Array.isArray(v)) {
      out[k] = await Promise.all(v.map((x) => normalizeValue(x)));
    } else if (v && typeof v === 'object' && !isLikelyLob(v)) {
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
  return JSON.stringify(
    obj,
    (k, v) => {
      if (v && typeof v === 'object') {
        if (seen.has(v)) return '[Circular]';
        seen.add(v);
      }
      return v;
    },
    2,
  );
}

// 스터디 생성
router.post('/studies', async (req, res) => {
  try {
    const userId = req.user?.id ?? req.body?.createdByUserId;
    if (!userId) {
      return res
        .status(401)
        .json({ error: '인증 토큰이 유효하지 않습니다.' });
    }

    const payload = {
      ...req.body,
      createdByUserId: userId,
    };

    const result = await createStudyInDB(payload);
    const normalized = await normalizeRow(result);
    return res.status(201).json(normalized);
  } catch (err) {
    console.error('Create Study Error:', err);
    return res
      .status(500)
      .json({ error: err?.message || '스터디 생성 실패' });
  }
});

// 스터디 목록 조회
router.get('/studies', async (req, res) => {
  try {
    const studies = await getAllStudiesFromDB();
    const payload = await normalizeRows(studies);
    return res.json(payload);
  } catch (err) {
    console.error('Get Studies Error:', err?.stack || err);
    try {
      console.error('Get Studies Error (string):', safeStringify(err));
    } catch {}
    return res
      .status(500)
      .json({ error: err?.message || '스터디 목록 조회 실패' });
  }
});

export default router;
