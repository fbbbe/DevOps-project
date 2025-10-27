-- 01_enable_schema_and_object.sql
-- Enable ORDS for CYUSER with base path 'cyuser' and expose TOPICS via AutoREST.
SET SERVEROUTPUT ON;
BEGIN
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
  BEGIN
    ORDS.ENABLE_OBJECT(
      p_enabled        => TRUE,
      p_schema         => 'CYUSER',
      p_object         => 'TOPICS',
      p_object_type    => 'TABLE',
      p_auto_rest_auth => FALSE
    );
  EXCEPTION WHEN OTHERS THEN NULL; END;
  COMMIT;
END;
/
