# Arranca backend y frontend (Windows)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"
$env:PYTHONIOENCODING = "utf-8"

Write-Host "`n=== Radar-Mora: arranque ===" -ForegroundColor Cyan

# Liberar puerto 8000 si hay un proceso colgado
$on8000 = netstat -ano | Select-String ":8000.*LISTENING"
if ($on8000) {
  $pid8000 = ($on8000 -replace '\s+', ' ').Trim().Split(' ')[-1]
  Write-Host "Puerto 8000 en uso (PID $pid8000). Reiniciando backend..." -ForegroundColor Yellow
  Stop-Process -Id $pid8000 -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 2
}

$py = Join-Path $Backend "venv\Scripts\python.exe"
if (-not (Test-Path $py)) {
  Write-Host "Ejecuta primero .\scripts\setup.ps1" -ForegroundColor Red
  exit 1
}

Write-Host "Iniciando backend en http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "Set-Location '$Backend'; `$env:PYTHONIOENCODING='utf-8'; & '$py' start.py"
) -WindowStyle Normal

Write-Host "Esperando API (max 120s)..." -ForegroundColor DarkGray
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  try {
    $h = Invoke-RestMethod "http://127.0.0.1:8000/health" -TimeoutSec 3
    if ($h.status -eq "ok") { $ready = $true; break }
  } catch { Start-Sleep -Seconds 2 }
}
if (-not $ready) {
  Write-Host "Backend aun iniciando (primera vez puede tardar varios minutos)." -ForegroundColor Yellow
  Write-Host "Cuando veas 'Uvicorn running' en la otra ventana, abre http://localhost:5173" -ForegroundColor Yellow
} else {
  Write-Host "Backend OK." -ForegroundColor Green
}

Write-Host "Iniciando frontend en http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "Set-Location '$Frontend'; npm run dev"
) -WindowStyle Normal

Write-Host "`nListo. Abre http://localhost:5173`n" -ForegroundColor Cyan
