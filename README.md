# 🏦 Radar Mora — CoopTech Tulcán

Sistema de perfilamiento de riesgo crediticio y cobranza preventiva para la **Cooperativa de Ahorro y Crédito Tulcán**, con predicción de morosidad mediante Machine Learning.

Puede ejecutarse **en local** (SQLite + FastAPI + React) o en **modo presentación** para demo sin backend.

---

## 📁 Estructura del proyecto

```text
cooptech-deviaton/
├── backend/
│   ├── main.py                 # API FastAPI
│   ├── database.py             # SQLite / helpers
│   ├── start.py                # DB + modelo + servidor
│   ├── models/
│   │   ├── risk_model.py       # Modelo de riesgo
│   │   ├── preventive_cache.py # Cola cobranza preventiva
│   │   └── cobranza_priority.py
│   └── routes/
│       ├── dashboard.py
│       ├── socios.py
│       └── alerts.py
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx
    │   │   ├── PreventiveCollectionPanel.jsx
    │   │   ├── SocioProfile.jsx
    │   │   └── RiskGauge.jsx
    │   └── services/api.js
    └── vercel.json
```

