#!/usr/bin/env bash
# Diagnostico rapido en otra maquina (Mac/Linux)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PY="$ROOT/backend/venv/bin/python"

echo ""
echo "=== Radar-Mora: diagnostico ==="

check() {
  if [ "$1" = "1" ]; then echo "[OK] $2"; else echo "[FALTA] $2"; [ -n "$3" ] && echo "      $3"; fi
}

[ -x "$PY" ] && check 1 "Entorno Python" || check 0 "Entorno Python" "Ejecuta ./scripts/setup.sh"
[ -d "$ROOT/frontend/node_modules" ] && check 1 "node_modules" || check 0 "node_modules" "cd frontend && npm install"
[ -f "$ROOT/backend/data/cooptech.db" ] && check 1 "Base de datos" || check 0 "Base de datos" "Se crea con python start.py"

if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
  check 1 "API /health"
  curl -sf http://localhost:8000/api/dashboard/extended-stats | head -c 80
  echo ""
else
  check 0 "API localhost:8000" "cd backend && source venv/bin/activate && python start.py"
fi

echo ""
