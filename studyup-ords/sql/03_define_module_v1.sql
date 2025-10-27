-- 03_define_module_v1.sql
-- Define a custom REST module under /ords/cyuser/v1/ (ping + topics list).
BEGIN
  ORDS.DEFINE_MODULE(p_module_name=>'v1', p_base_path=>'v1/');
  ORDS.DEFINE_TEMPLATE(p_module_name=>'v1', p_pattern=>'ping');
  ORDS.DEFINE_HANDLER(
    p_module_name   =>'v1',
    p_pattern       =>'ping',
    p_method        =>'GET',
    p_source_type   => ORDS.source_type_query,
    p_mimes_allowed =>'application/json',
    p_source        => q'[ select 'ok' as status from dual ]'
  );
  ORDS.DEFINE_TEMPLATE(p_module_name=>'v1', p_pattern=>'topics/');
  ORDS.DEFINE_HANDLER(
    p_module_name   =>'v1',
    p_pattern       =>'topics/',
    p_method        =>'GET',
    p_source_type   => ORDS.source_type_query,
    p_mimes_allowed =>'application/json',
    p_source        => q'[
      SELECT topic_id, code, name_ko, created_at, title, body
      FROM topics
      ORDER BY topic_id DESC
    ]'
  );
  COMMIT;
END;
/
