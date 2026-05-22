# Radar-Mora — instalacion en Windows (nueva maquina)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"
$env:PYTHONIOENCODING = "utf-8"

Write-Host "`n=== Radar-Mora: instalacion ===" -ForegroundColor Green

# Python
Write-Host "`n[1/3] Backend Python..." -ForegroundColor Cyan
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: Python no encontrado. Instala Python 3.11 o 3.12 desde python.org" -ForegroundColor Red
  exit 1
}

Set-Location $Backend
if (-not (Test-Path "venv")) {
  python -m venv venv
}
& ".\venv\Scripts\python.exe" -m pip install --upgrade pip -q
& ".\venv\Scripts\pip.exe" install -r requirements.txt
Write-Host "Backend listo." -ForegroundColor Green

# Frontend
Write-Host "`n[2/3] Frontend Node..." -ForegroundColor Cyan
Set-Location $Frontend
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: npm no encontrado. Instala Node.js 18+ LTS" -ForegroundColor Red
  exit 1
}
npm install
Write-Host "Frontend listo." -ForegroundColor Green

# Verificacion
Write-Host "`n[3/3] Verificacion..." -ForegroundColor Cyan
Set-Location $Root
& "$Root\scripts\verify.ps1"

Write-Host "=== Arranque (2 terminales) ===" -ForegroundColor Green
Write-Host "Terminal 1:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .\venv\Scripts\python.exe start.py" -ForegroundColor White
Write-Host "  (Primera vez: 3-8 min hasta ver 'Uvicorn running')" -ForegroundColor DarkYellow
Write-Host "Terminal 2:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "`nAbre http://localhost:5173`n" -ForegroundColor Green

Set-Location $Root
