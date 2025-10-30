// backend/routes/topicRoutes.js
import express from 'express';
import { listTopics, listTopicOptions } from '../services/topicService.js';

const router = express.Router();

// 전체 행
router.get('/', async (req, res) => {
  try {
    const rows = await listTopics();
    res.json(rows);
  } catch (e) {
    console.error('[GET /api/topics] ', e);
    res.status(500).json({ error: 'Failed to load topics' });
  }
});

// 드롭다운 옵션
router.get('/options', async (req, res) => {
  try {
    const rows = await listTopicOptions();
    res.json(rows); // [{label:'어학', value:'어학'}, ...]
  } catch (e) {
    console.error('[GET /api/topics/options] ', e);
    res.status(500).json({ error: 'Failed to load topic options' });
  }
});

export default router;
