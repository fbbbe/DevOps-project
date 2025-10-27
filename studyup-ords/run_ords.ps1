\
    # run_ords.ps1 - helper to start ORDS locally (no secrets)
    $ORDS = "C:\Users\BILAB\ords-latest\bin\ords.exe"
    taskkill /IM ords.exe /F 2>$null
    $env:TNS_ADMIN = "C:\oracle_wallets\Wallet_studyupdb"
    & $ORDS --config "C:\ords-config" serve
