# 🏦 CoopTech Tulcán - Sistema de Riesgo Crediticio e IA de Alertas Tempranas

¡Bienvenido al proyecto de la hackathon! Este repositorio contiene la implementación completa para la **Cooperativa de Ahorro y Crédito Tulcán**, diseñada para perfilar el comportamiento transaccional y predecir el riesgo de morosidad mediante Inteligencia Artificial (Machine Learning).

El proyecto está diseñado para funcionar de manera **100% autónoma y local**, garantizando estabilidad y velocidad durante la presentación y demo en vivo frente al jurado.

---

## 📁 Estructura General del Proyecto

El código está organizado de manera limpia y modular en dos directorios principales:

```text
cooptech-deviaton/
├── backend/                    # Motor de IA y API (Python)
│   ├── main.py                 # Punto de entrada de la API FastAPI y CORS
│   ├── database.py             # Helpers de base de datos SQLite y esquemas
│   ├── start.py                # Script de inicio automatizado (Base de datos + ML + Servidor)
│   ├── requirements.txt        # Dependencias de Python
│   ├── models/
│   │   ├── data_generator.py   # Generador inteligente de datos sintéticos realistas ecuatorianos
│   │   └── risk_model.py       # Modelo de Machine Learning (Random Forest de Scikit-learn)
│   └── routes/
│       ├── dashboard.py        # Endpoints para métricas generales y gráficos
│       ├── socios.py           # Gestión y perfilamiento detallado de los socios
│       └── alerts.py           # Motor de Alertas Tempranas y predicciones
│
└── frontend/                   # Interfaz de Usuario y Dashboard (Vite + React)
    ├── package.json            # Dependencias del frontend (React, Recharts, Lucide, Vite)
    ├── vite.config.js          # Configuración de compilación rápida
    ├── index.html              # Plantilla HTML base con fuentes premium (Inter)
    └── src/
        ├── main.jsx            # Entrada de renderizado de React
        ├── App.jsx             # Enrutador y estructura base de la UI
        ├── index.css           # Estilos personalizados (Glassmorphism, Dark mode)
        ├── services/
        │   └── api.js          # Cliente API integrado con Axios/Fetch
        └── components/
            ├── Sidebar.jsx     # Panel de navegación lateral responsive
            ├── Dashboard.jsx   # Pantalla principal (Vista Ejecutiva, KPIs y Gráficos)
            ├── SociosList.jsx  # Explorador interactivo con filtros avanzados
            ├── SocioProfile.jsx# Perfil de socio con radar, análisis transaccional e importancia de features
            └── RiskGauge.jsx   # Indicador visual animado del Score de Riesgo (Velocímetro HSL)
