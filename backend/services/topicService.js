// backend/services/topicService.js
import { getConnection } from '../db/oracle.js';
import oracledb from 'oracledb';

export async function listTopics() {
  const conn = await getConnection();
  try {
    const sql = `
      SELECT topic_id, code, name_ko, title, body, created_at
      FROM topics
      ORDER BY topic_id
    `;
    const result = await conn.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result.rows; // [{TOPIC_ID, CODE, NAME_KO, TITLE, BODY, CREATED_AT}, ...]
  } finally {
    await conn.close();
  }
}

/** 드롭다운 옵션: { label, value } */
export async function listTopicOptions() {
  const rows = await listTopics();
  return rows.map(r => ({
    label: r.TITLE ?? r.NAME_KO,
    value: r.TITLE ?? r.NAME_KO,
  }));
}
