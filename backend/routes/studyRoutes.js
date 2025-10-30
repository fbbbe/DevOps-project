// backend/routes/studyRoutes.js

import express from 'express';
import {
  createStudyInDB,
  getAllStudiesFromDB,
  getStudyMembersFromDB,
  getMembershipStatusFromDB,
  createJoinRequestInDB,
  cancelJoinRequestInDB,
  getJoinRequestsFromDB,
  updateJoinRequestStatusInDB,
} from '../services/studyService.js';

const router = express.Router();

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
    } catch (e) {
      reject(e);
    }
  });
}

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

async function normalizeRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row ?? {})) {
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

async function normalizeRows(rows) {
  if (!Array.isArray(rows)) return [];
  const list = [];
  for (const r of rows) {
    list.push(await normalizeRow(r));
  }
  return list;
}

// Create Study
router.post('/studies', async (req, res) => {
  try {
    const userId = req.user?.id ?? req.body?.createdByUserId;
    if (!userId) {
      return res.status(401).json({ error: '인증 토큰이 유효하지 않습니다.' });
    }

    const result = await createStudyInDB({ ...req.body, createdByUserId: userId });
    const normalized = await normalizeRow(result);
    return res.status(201).json(normalized);
  } catch (err) {
    console.error('Create Study Error:', err);
    return res.status(500).json({ error: err?.message || '스터디 생성 실패' });
  }
});

// Get all studies
router.get('/studies', async (_req, res) => {
  try {
    const studies = await getAllStudiesFromDB();
    return res.json(await normalizeRows(studies));
  } catch (err) {
    console.error('Get Studies Error:', err);
    return res.status(500).json({ error: err?.message || '스터디 목록 조회 실패' });
  }
});

// Get members for a study
router.get('/studies/:studyId/members', async (req, res) => {
  const { studyId } = req.params;
  if (!studyId) {
    return res.status(400).json({ error: 'studyId가 필요합니다.' });
  }
  try {
    const members = await getStudyMembersFromDB(studyId);
    return res.json(await normalizeRows(members));
  } catch (err) {
    console.error('Get Study Members Error:', err);
    return res.status(500).json({ error: err?.message || '스터디 멤버 조회 실패' });
  }
});

// Membership status for current user
router.get('/studies/:studyId/membership', async (req, res) => {
  const { studyId } = req.params;
  const userId = req.user?.id;
  if (!studyId) {
    return res.status(400).json({ error: 'studyId가 필요합니다.' });
  }
  try {
    const status = await getMembershipStatusFromDB(studyId, userId);
    return res.json(status);
  } catch (err) {
    console.error('Get Membership Status Error:', err);
    return res.status(500).json({ error: err?.message || '멤버십 상태 조회 실패' });
  }
});

// Create join request
router.post('/studies/:studyId/join-requests', async (req, res) => {
  const { studyId } = req.params;
  const userId = req.user?.id;
  const { message } = req.body ?? {};
  if (!userId) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }
  try {
    const result = await createJoinRequestInDB({ studyId, userId, message });
    return res.json(result);
  } catch (err) {
    console.error('Create Join Request Error:', err);
    return res.status(500).json({ error: err?.message || '참여 신청에 실패했습니다.' });
  }
});

// Cancel join request (self)
router.delete('/studies/:studyId/join-requests', async (req, res) => {
  const { studyId } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }
  try {
    const result = await cancelJoinRequestInDB({ studyId, userId });
    return res.json(result);
  } catch (err) {
    console.error('Cancel Join Request Error:', err);
    return res.status(500).json({ error: err?.message || '참여 요청 취소에 실패했습니다.' });
  }
});

// Pending requests (owner only)
router.get('/studies/:studyId/join-requests', async (req, res) => {
  const { studyId } = req.params;
  if (!req.user?.id) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }
  try {
    const membership = await getMembershipStatusFromDB(studyId, req.user.id);
    if (membership.status !== 'owner') {
      return res.status(403).json({ error: '방장만 접근할 수 있습니다.' });
    }
    const requests = await getJoinRequestsFromDB(studyId);
    return res.json(await normalizeRows(requests));
  } catch (err) {
    console.error('Get Join Requests Error:', err);
    return res.status(500).json({ error: err?.message || '참여 요청 조회 실패' });
  }
});

// Approve / reject join request (owner)
router.patch('/join-requests/:requestId', async (req, res) => {
  const { requestId } = req.params;
  const { decision } = req.body ?? {};
  if (!req.user?.id) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'decision 값이 올바르지 않습니다.' });
  }
  try {
    const result = await updateJoinRequestStatusInDB({
      requestId,
      decision,
      decidedBy: req.user.id,
    });
    if (result?.error === 'not_found') {
      return res.status(404).json({ error: '요청을 찾을 수 없습니다.' });
    }
    if (result?.error === 'already_processed') {
      return res.status(409).json({ error: '이미 처리된 요청입니다.' });
    }
    return res.json(result);
  } catch (err) {
    console.error('Update Join Request Error:', err);
    return res.status(500).json({ error: err?.message || '참여 요청 처리 실패' });
  }
});

export default router;
