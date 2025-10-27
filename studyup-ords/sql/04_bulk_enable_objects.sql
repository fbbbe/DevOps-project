-- 04_bulk_enable_objects.sql
-- Bulk expose all TABLES and VIEWS in CYUSER via AutoREST (read-only style).
-- WARNING: This exposes potentially sensitive columns. Prefer views to limit columns if needed.
SET SERVEROUTPUT ON;
BEGIN
  -- Ensure schema mapping
  BEGIN ORDS.ENABLE_SCHEMA(p_enabled=>FALSE, p_schema=>'CYUSER'); EXCEPTION WHEN OTHERS THEN NULL; END;
  COMMIT;
  BEGIN
    ORDS.ENABLE_SCHEMA(
      p_enabled             => TRUE,
      p_schema              => 'CYUSER',
      p_url_mapping_type    => 'BASE_PATH',
      p_url_mapping_pattern => 'cyuser',
      p_auto_rest_auth      => FALSE
    );
  EXCEPTION WHEN OTHERS THEN NULL; END;
  COMMIT;

  -- All tables
  FOR t IN (SELECT table_name AS obj FROM user_tables)
  LOOP
    BEGIN
      ORDS.ENABLE_OBJECT(
        p_enabled        => TRUE,
        p_schema         => 'CYUSER',
        p_object         => t.obj,
        p_object_type    => 'TABLE',
        p_auto_rest_auth => FALSE
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;

  -- All views
  FOR v IN (SELECT view_name AS obj FROM user_views)
  LOOP
    BEGIN
      ORDS.ENABLE_OBJECT(
        p_enabled        => TRUE,
        p_schema         => 'CYUSER',
        p_object         => v.obj,
        p_object_type    => 'VIEW',
        p_auto_rest_auth => FALSE
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;

  COMMIT;
END;
/
