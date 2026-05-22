#!/usr/bin/env bash
# Radar-Mora — instalacion en Mac/Linux (nueva maquina)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PYTHONIOENCODING=utf-8

echo ""
echo "=== Radar-Mora: instalacion ==="

echo ""
echo "[1/3] Backend Python..."
cd "$ROOT/backend"
if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 no encontrado"
  exit 1
fi
if [ ! -d venv ]; then
  python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt
echo "Backend listo."

echo ""
echo "[2/3] Frontend Node..."
cd "$ROOT/frontend"
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm no encontrado. Instala Node.js 18+"
  exit 1
fi
npm install
echo "Frontend listo."

echo ""
echo "[3/3] Arranque (2 terminales):"
echo "  cd backend && source venv/bin/activate && python start.py"
echo "  cd frontend && npm run dev"
echo ""
echo "Abre http://localhost:5173"
echo "(Primera vez el backend tarda 3-8 min generando datos)"
echo ""
