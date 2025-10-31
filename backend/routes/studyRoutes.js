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
  getStudyChatsFromDB,
  getStudyMessagesFromDB,
  createStudyMessageInDB,
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
      return res
        .status(401)
        .json({ error: '\uC778\uC99D \uD1A0\uD070\uC774 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.' });
    }

    const result = await createStudyInDB({ ...req.body, createdByUserId: userId });
    const normalized = await normalizeRow(result);
    return res.status(201).json(normalized);
  } catch (err) {
    console.error('Create Study Error:', err);
    return res
      .status(500)
      .json({ error: err?.message || '\uC2A4\uD130\uB514 \uC0DD\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.' });
  }
});

// Get all studies
router.get('/studies', async (_req, res) => {
  try {
    const studies = await getAllStudiesFromDB();
    return res.json(await normalizeRows(studies));
  } catch (err) {
    console.error('Get Studies Error:', err);
    return res
      .status(500)
      .json({ error: err?.message || '\uC2A4\uD130\uB514 \uBAA9\uB85D \uC870\uD68C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.' });
  }
});

// Get members for a study
router.get('/studies/:studyId/members', async (req, res) => {
  const { studyId } = req.params;
  if (!studyId) {
    return res.status(400).json({ error: 'studyId\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.' });
  }
  try {
    const members = await getStudyMembersFromDB(studyId);
    return res.json(await normalizeRows(members));
  } catch (err) {
    console.error('Get Study Members Error:', err);
    return res
      .status(500)
      .json({ error: err?.message || '\uC2A4\uD130\uB514 \uBA64\uBC84 \uC870\uD68C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.' });
  }
});

// Membership status for current user
router.get('/studies/:studyId/membership', async (req, res) => {
  const { studyId } = req.params;
  const userId = req.user?.id;
  if (!studyId) {
    return res.status(400).json({ error: 'studyId\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.' });
  }
  try {
    const status = await getMembershipStatusFromDB(studyId, userId);
    return res.json(status);
  } catch (err) {
    console.error('Get Membership Status Error:', err);
    return res
      .status(500)
      .json({ error: err?.message || '\uBA64\uBC84 \uC0C1\uD0DC \uC870\uD68C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.' });
  }
});

// Create join request
router.post('/studies/:studyId/join-requests', async (req, res) => {
  const { studyId } = req.params;
  const userId = req.user?.id;
  const { message } = req.body ?? {};
  if (!userId) {
    return res.status(401).json({ error: '\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.' });
  }
  try {
    const result = await createJoinRequestInDB({ studyId, userId, message });
    return res.json(result);
  } catch (err) {
    console.error('Create Join Request Error:', err);
    return res
      .status(500)
      .json({ error: err?.message || '\uCC38\uC5EC \uC694\uCCAD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.' });
  }
});

// Cancel join request (self)
router.delete('/studies/:studyId/join-requests', async (req, res) => {
  const { studyId } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: '\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.' });
  }
  try {
    const result = await cancelJoinRequestInDB({ studyId, userId });
    return res.json(result);
  } catch (err) {
    console.error('Cancel Join Request Error:', err);
    return res
      .status(500)
      .json({ error: err?.message || '\uCC38\uC5EC \uC694\uCCAD \uCDE8\uC18C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.' });
  }
});

// Pending requests (owner only)
router.get('/studies/:studyId/join-requests', async (req, res) => {
  const { studyId } = req.params;
  if (!req.user?.id) {
    return res.status(401).json({ error: '\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.' });
  }
  try {
    const membership = await getMembershipStatusFromDB(studyId, req.user.id);
    if (membership.status !== 'owner') {
      return res.status(403).json({ error: '\uBC29\uC7A5\uB9CC \uC811\uADFC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.' });
    }
    const requests = await getJoinRequestsFromDB(studyId);
    return res.json(await normalizeRows(requests));
  } catch (err) {
    console.error('Get Join Requests Error:', err);
    return res
      .status(500)
      .json({ error: err?.message || '\uCC38\uC5EC \uC694\uCCAD \uC870\uD68C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.' });
  }
});

// Approve / reject join request (owner)
router.patch('/join-requests/:requestId', async (req, res) => {
  const { requestId } = req.params;
  const { decision } = req.body ?? {};
  if (!req.user?.id) {
    return res.status(401).json({ error: '\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.' });
  }
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'decision \uAC12\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.' });
  }
  try {
    const result = await updateJoinRequestStatusInDB({
      requestId,
      decision,
      decidedBy: req.user.id,
    });
    if (result?.error === 'not_found') {
      return res.status(404).json({ error: '\uC694\uCCAD\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.' });
    }
    if (result?.error === 'already_processed') {
      return res.status(409).json({ error: '\uC774\uBBF8 \uCC98\uB9AC\uB41C \uC694\uCCAD\uC785\uB2C8\uB2E4.' });
    }
    return res.json(result);
  } catch (err) {
    console.error('Update Join Request Error:', err);
    return res
      .status(500)
      .json({ error: err?.message || '\uCC38\uC5EC \uC694\uCCAD \uCC98\uB9AC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.' });
  }
});

router.get('/studies/:studyId/messages', async (req, res) => {
  const { studyId } = req.params;
  if (!studyId) {
    return res.status(400).json({ error: '\uC2A4\uD130\uB514 ID\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.' });
  }
  if (!req.user?.id) {
    return res.status(401).json({ error: '\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.' });
  }

  const limitRaw = (req.query?.limit ?? req.query?.max);
  let limit = Number(limitRaw);
  if (!limit || Number.isNaN(limit) || limit <= 0) {
    limit = 200;
  }

  try {
    const result = await getStudyMessagesFromDB({
      studyId,
      userId: req.user.id,
      limit,
    });
    if (result?.error === 'not_member') {
      return res.status(403).json({ error: '\uC2A4\uD130\uB514 \uBA64\uBC84\uB9CC \uCC44\uD305\uC744 \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.' });
    }
    return res.json(result.messages ?? []);
  } catch (err) {
    console.error('Get Study Messages Error:', err);
    return res
      .status(500)
      .json({ error: err?.message || '\uCC44\uD305 \uBA54\uC2DC\uC9C0\uB97C \uBD88\uB7EC\uC624\uB294\uB370 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.' });
  }
});

router.post('/studies/:studyId/messages', async (req, res) => {
  const { studyId } = req.params;
  if (!studyId) {
    return res.status(400).json({ error: '\uC2A4\uD130\uB514 ID\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.' });
  }
  if (!req.user?.id) {
    return res.status(401).json({ error: '\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.' });
  }
  const { text } = req.body ?? {};
  if (typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: '\uBA54\uC2DC\uC9C0\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.' });
  }
  try {
    const result = await createStudyMessageInDB({
      studyId,
      userId: req.user.id,
      content: text,
    });
    if (result?.error === 'not_member') {
      return res.status(403).json({ error: '\uC2A4\uD130\uB514 \uBA64\uBC84\uB9CC \uBA54\uC2DC\uC9C0\uB97C \uBCF4\uB0BC \uC218 \uC788\uC2B5\uB2C8\uB2E4.' });
    }
    return res.status(201).json(result.message ?? null);
  } catch (err) {
    console.error('Create Study Message Error:', err);
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : '\uBA54\uC2DC\uC9C0\uB97C \uC800\uC7A5\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.' });
  }
});

router.get('/studies/me/chats', async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }
  try {
    const chats = await getStudyChatsFromDB(req.user.id);
    const normalized = await normalizeRows(chats);
    const mapped = normalized.map((row) => {
      const studyId =
        row.STUDY_ID ?? row.study_id ?? row.studyId ?? row.id ?? null;
      const name = row.NAME ?? row.name ?? row.TITLE ?? row.title ?? '';
      const description =
        row.DESCRIPTION ?? row.description ?? row.BODY ?? row.body ?? '';
      const memberCount =
        Number(row.MEMBER_COUNT ?? row.memberCount ?? row.members ?? 0) || 0;
      const lastMessageAt =
        row.LAST_MESSAGE_AT ?? row.lastMessageAt ?? row.last_activity ?? null;
      const status = row.STATUS ?? row.status ?? null;
      const termType = row.TERM_TYPE ?? row.termType ?? null;
      const startDate = row.START_DATE ?? row.startDate ?? null;
      const endDate = row.END_DATE ?? row.endDate ?? null;

      return {
        studyId,
        name,
        description,
        memberCount,
        lastMessageAt,
        status,
        termType,
        startDate,
        endDate,
      };
    });
    return res.json(mapped);
  } catch (err) {
    console.error('Get Study Chats Error:', err);
    return res
      .status(500)
      .json({ error: err?.message || '채팅 목록을 불러오지 못했습니다.' });
  }
});

export default router;
