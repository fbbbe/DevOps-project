# Study-UP ORDS (Release)

**Validated endpoints (as of 2025-10-25 22:04:18Z UTC):**
- GET `http://localhost:8181/ords/cyuser/v1/ping` → `{"items":[{"status":"ok"}]...}`
- GET `http://localhost:8181/ords/cyuser/topics/?limit=5` → JSON list (AutoREST)

## Quick Start
1) Start ORDS
```powershell
$ORDS = "C:\Users\BILAB\ords-latest\bin\ords.exe"
taskkill /IM ords.exe /F 2>$null
$env:TNS_ADMIN = "C:\oracle_wallets\Wallet_studyupdb"
& $ORDS --config "C:\ords-config" serve
```

2) Connect as CYUSER (SQLcl)
```powershell
& "C:\sqlcl\bin\sql.exe" -cloudconfig "C:\oracle_wallets\Wallet_studyupdb.zip" cyuser@studyupdb_high
-- enter CYUSER password
```

3) Run scripts in order (idempotent; safe to re-run)
```sql
@sql/00_create_topics.sql
@sql/01_enable_schema_and_object.sql
@sql/02_sample_insert.sql
@sql/03_define_module_v1.sql
-- Optional mass exposure:
@sql/04_bulk_enable_objects.sql
-- Optional and risky:
@sql/05_bulk_enable_procedures.sql
```

4) Verify
```powershell
curl.exe http://localhost:8181/ords/cyuser/v1/ping
curl.exe "http://localhost:8181/ords/cyuser/topics/?limit=5"
```

## Notes
- Do **NOT** commit wallets or passwords (see .gitignore).
- `04_bulk_enable_objects.sql` will expose **all tables and views** under `/ords/cyuser/<name>/`.
  Use views to limit sensitive columns if needed.
- `05_bulk_enable_procedures.sql` exposes **all procedures**; use with caution.
