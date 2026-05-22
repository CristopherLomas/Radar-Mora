# Instalación en otra máquina (Radar-Mora)

## Requisitos

- **Python 3.10, 3.11 o 3.12** (recomendado). Python 3.14 también suele funcionar.
- **Node.js 18+** con `npm`
- Rama: `feature/ui-radar-mora-cooptech`

```bash
git clone https://github.com/CristopherLomas/Radar-Mora.git
cd Radar-Mora
git checkout feature/ui-radar-mora-cooptech
```

## Instalación automática

**Windows (PowerShell):**

```powershell
.\scripts\setup.ps1
```

**Mac / Linux:**

```bash
chmod +x scripts/setup.sh scripts/verify.sh
./scripts/setup.sh
```

## Arranque (2 terminales)

### Terminal 1 — Backend (obligatorio primero)

```powershell
cd backend
.\venv\Scripts\python.exe start.py    # Windows
```

```bash
cd backend
source venv/bin/activate
python start.py                       # Mac/Linux
```

**Importante:** La primera vez crea `backend/data/cooptech.db` y entrena el modelo (**3 a 8 minutos**). Espera:

```text
Uvicorn running on http://0.0.0.0:8000
```

No uses `python start.py` desde la carpeta raíz del proyecto; debe ejecutarse **dentro de `backend/`** (o con el Python del venv).

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Abre: **http://localhost:5173**

## Diagnóstico si algo falla

**Windows:**

```powershell
.\scripts\verify.ps1
```

**Mac/Linux:**

```bash
./scripts/verify.sh
```

Comprueba: venv, base de datos, API `/health` y estadísticas extendidas.

## Problemas frecuentes

| Síntoma | Causa | Solución |
|--------|--------|----------|
| Pantalla “Comprobando conexión…” mucho rato | Backend aún generando datos | Esperar a `Uvicorn running`; el frontend reintenta cada 15 s |
| Banner rojo “No se pudo conectar” | Backend apagado o puerto 8000 ocupado | `cd backend` → `.\venv\Scripts\python.exe start.py` |
| `python start.py` no encontrado | Carpeta incorrecta | Debe estar en `backend/`, no en la raíz |
| Estadísticas avanzadas vacías | BD sin créditos | Completar primera ejecución de `start.py` |
| `npm` no reconocido | Node no instalado | Instalar Node.js LTS |
| Error `pip install` (pandas/numpy) | Python incompatible | Usar Python 3.11 o 3.12 |
| Puerto 8000 en uso | Servidor viejo | Cerrar el proceso anterior o reiniciar PC |
| Logo sin imagen | Archivo faltante | Debe existir `frontend/public/images/coop-tulcan-logo.png` |

## Qué NO va en Git

Por diseño (`.gitignore`):

- `backend/data/` — base de datos y modelo (se generan con `start.py`)
- `backend/venv/`, `frontend/node_modules/`

Cada máquina debe ejecutar `setup.ps1` / `setup.sh` y luego `start.py` al menos una vez.

## Verificar API manualmente

Con el backend activo:

- http://localhost:8000/health → `"status": "ok"`
- http://localhost:8000/api/dashboard/extended-stats → debe tener `mora_por_actividad` con datos

## Dataset de producción (opcional)

Si tienes `dataset_maestro_dashboard.csv` en la raíz del proyecto, `start.py` lo importa automáticamente. Sin CSV, las estadísticas avanzadas usan datos sintéticos (funciona igual en la UI).
