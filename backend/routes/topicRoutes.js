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
// router.get('/options', async (req, res) => {
//   try {
//     const rows = await listTopicOptions();
//     res.json(rows); // [{label:'어학', value:'어학'}, ...]
//   } catch (e) {
//     console.error('[GET /api/topics/options] ', e);
//     res.status(500).json({ error: 'Failed to load topic options' });
//   }
// });
router.get('/options', async (_req, res) => {
  try {
    const conn = await getConnection();
    const r = await conn.execute(`SELECT title, name_ko FROM topics ORDER BY topic_id`);
    await conn.close();
    const opts = r.rows.map(row => ({
      label: row.TITLE ?? row.NAME_KO,
      value: row.TITLE ?? row.NAME_KO,
    }));
    return res.json(opts);
  } catch (e) {
    console.error('[GET /api/topics/options] DB error:', e.message);
    // ✅ 임시 폴백(수정 가능)
    return res.json([
      { label: '어학', value: '어학' },
      { label: 'IT/프로그래밍', value: 'IT/프로그래밍' },
      { label: '자격증', value: '자격증' },
      { label: '취업/이직', value: '취업/이직' },
      { label: '공무원/고시', value: '공무원/고시' },
      { label: '대학 전공', value: '대학 전공' },
      { label: '독서/글쓰기', value: '독서/글쓰기' },
      { label: '경제/금융', value: '경제/금융' },
      { label: '마케팅/경영', value: '마케팅/경영' },
      { label: '디자인/영상', value: '디자인/영상' },
      { label: '외국어 회화', value: '외국어 회화' },
      { label: '수능/입시', value: '수능/입시' },
      { label: '프로젝트', value: '프로젝트' },
      { label: '기타', value: '기타' },
    ]);
  }
});


export default router;
