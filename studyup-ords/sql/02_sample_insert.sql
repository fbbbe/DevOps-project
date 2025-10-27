-- 02_sample_insert.sql
-- Insert one sample row (idempotent-ish using MAX+1).
SET DEFINE OFF;
BEGIN
  INSERT INTO topics (topic_id, code, name_ko, title, body)
  SELECT NVL(MAX(topic_id),0)+1, RAWTOHEX(SYS_GUID()), '첫 글', '첫 글', 'AutoREST smoke test'
  FROM topics;
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
COMMIT;
