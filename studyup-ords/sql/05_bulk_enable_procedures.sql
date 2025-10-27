-- 05_bulk_enable_procedures.sql (optional)
-- Expose all PROCEDURES. Use with caution: parameters and execution semantics become public.
BEGIN
  FOR p IN (
    SELECT object_name AS obj
    FROM   user_objects
    WHERE  object_type = 'PROCEDURE'
  )
  LOOP
    BEGIN
      ORDS.ENABLE_OBJECT(
        p_enabled        => TRUE,
        p_schema         => 'CYUSER',
        p_object         => p.obj,
        p_object_type    => 'PROCEDURE',
        p_auto_rest_auth => FALSE
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
  COMMIT;
END;
/
