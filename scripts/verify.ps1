# Diagnostico rapido en otra maquina
$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"
$Py = Join-Path $Backend "venv\Scripts\python.exe"

Write-Host "`n=== Radar-Mora: diagnostico ===" -ForegroundColor Cyan

function Test-Item($label, $ok, $detail = "") {
  $color = if ($ok) { "Green" } else { "Red" }
  $mark = if ($ok) { "OK" } else { "FALTA" }
  Write-Host ("[{0}] {1}" -f $mark, $label) -ForegroundColor $color
  if ($detail) { Write-Host "      $detail" -ForegroundColor DarkGray }
}

# Python / venv
$hasPy = Test-Path $Py
Test-Item "Entorno Python (venv)" $hasPy $(if (-not $hasPy) { "Ejecuta .\scripts\setup.ps1" } else { $Py })

if ($hasPy) {
  $ver = & $Py -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
  Test-Item "Version Python" ($ver -match "^(3\.(1[0-4]))") $ver
}

# Node
$hasNpm = [bool](Get-Command npm -ErrorAction SilentlyContinue)
Test-Item "Node.js / npm" $hasNpm $(if (-not $hasNpm) { "Instala Node 18+ LTS" } else { (npm -v) })

$hasModules = Test-Path (Join-Path $Frontend "node_modules")
Test-Item "Dependencias frontend" $hasModules "cd frontend; npm install"

$db = Join-Path $Backend "data\cooptech.db"
Test-Item "Base de datos" (Test-Path $db) $(if (-not (Test-Path $db)) { "Se crea con backend\start.py (3-8 min)" } else { $db })

if ($hasPy -and (Test-Path $db)) {
  & $Py -c @"
import sys, os
sys.path.insert(0, r'$Backend')
from database import get_table_count
for t in ('socios','creditos','pagos'):
    print(f'  {t}:', get_table_count(t))
"@ 2>$null
}

# API
try {
  $h = Invoke-RestMethod "http://localhost:8000/health" -TimeoutSec 5
  Test-Item "API /health" ($h.status -eq "ok") ("db=$($h.database) model=$($h.model)")
  $ext = Invoke-RestMethod "http://localhost:8000/api/dashboard/extended-stats" -TimeoutSec 20
  Test-Item "Estadisticas extendidas" ($ext.mora_por_actividad.Count -gt 0) ("source=$($ext.source) actividades=$($ext.mora_por_actividad.Count)")
} catch {
  Test-Item "API en http://localhost:8000" $false "Backend no responde. cd backend; .\venv\Scripts\python.exe start.py"
}

Write-Host "`nSi algo falla, lee INSTALACION.md o ejecuta .\scripts\setup.ps1`n" -ForegroundColor Yellow
