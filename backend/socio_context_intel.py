"""
Inteligencia contextual por socio: noticias sugeridas y predicción de impago
por eventos externos (desastres, clima, economía local).
"""

from __future__ import annotations

import hashlib
import re
from datetime import date, timedelta

from database import FECHA_CORTE

PROVINCE_BY_CEDULA = {
    "01": "Azuay",
    "02": "Bolívar",
    "03": "Cañar",
    "04": "Carchi",
    "05": "Cotopaxi",
    "06": "Chimborazo",
    "07": "El Oro",
    "08": "Esmeraldas",
    "09": "Guayas",
    "10": "Imbabura",
    "11": "Loja",
    "12": "Los Ríos",
    "13": "Manabí",
    "14": "Morona Santiago",
    "15": "Napo",
    "16": "Pastaza",
    "17": "Pichincha",
    "18": "Tungurahua",
    "19": "Zamora Chinchipe",
    "20": "Galápagos",
    "21": "Sucumbíos",
    "22": "Orellana",
    "23": "Santo Domingo",
    "24": "Santa Elena",
}

EVENT_CATALOG = [
    {
        "categoria": "desastre_natural",
        "titulo": "Alerta de remoción en vía principal — {zona}",
        "resumen": "Reportes de deslizamiento y cierre parcial de carreteras en {zona} limitan el traslado de productos y el cobro en efectivo.",
        "peso_base": 0.38,
        "tags": ["carchi", "imbabura", "tungurahua", "agro", "transporte"],
    },
    {
        "categoria": "desastre_natural",
        "titulo": "Sismo leve registrado cerca de {zona}",
        "resumen": "Movimiento telúrico de magnitud moderada sin víctimas; algunos comercios cerraron por revisión estructural.",
        "peso_base": 0.28,
        "tags": ["costa", "sierra", "comercio"],
    },
    {
        "categoria": "clima",
        "titulo": "Pronóstico de lluvias intensas (fenómeno El Niño) — {zona}",
        "resumen": "INAMHI y prefectura alertan por precipitaciones que pueden afectar cosechas y rutas de distribución en los próximos días.",
        "peso_base": 0.42,
        "tags": ["agro", "carchi", "imbabura", "cotopaxi", "chimborazo"],
    },
    {
        "categoria": "clima",
        "titulo": "Heladas matinales en zona altoandina ({zona})",
        "resumen": "Bajas temperaturas impactan cultivos de papa y maíz; productores reportan pérdida parcial de producción.",
        "peso_base": 0.35,
        "tags": ["agro", "carchi", "tungurahua"],
    },
    {
        "categoria": "clima",
        "titulo": "Sequía prolongada afecta pastos y ganadería — {zona}",
        "resumen": "Déficit de lluvias reduce ingresos de sectores lecheros y ganaderos en la región.",
        "peso_base": 0.33,
        "tags": ["agro", "leche", "sierra"],
    },
    {
        "categoria": "economico",
        "titulo": "Incremento del precio del combustible y peajes",
        "resumen": "Transportistas y taxistas de {zona} señalan que el alza operativa reduce el margen diario disponible para obligaciones financieras.",
        "peso_base": 0.36,
        "tags": ["taxi", "transporte", "urbano"],
    },
    {
        "categoria": "economico",
        "titulo": "Caída del precio de productos agrícolas en ferias locales",
        "resumen": "Mayor oferta y menor demanda presionan los ingresos de productores en {zona}.",
        "peso_base": 0.34,
        "tags": ["agro", "comercio"],
    },
    {
        "categoria": "otros",
        "titulo": "Paro sectorial de corta duración en {zona}",
        "resumen": "Movilización de transporte o comercio afectó la actividad económica durante 24–48 horas.",
        "peso_base": 0.3,
        "tags": ["transporte", "comercio", "urbano"],
    },
    {
        "categoria": "otros",
        "titulo": "Corte programado de energía eléctrica",
        "resumen": "Interrupción del servicio en barrios de {zona} limitó operación de negocios familiares.",
        "peso_base": 0.22,
        "tags": ["comercio", "urbano"],
    },
]

CATEGORY_LABELS = {
    "desastre_natural": "Desastre natural",
    "clima": "Clima adverso",
    "economico": "Economía local",
    "otros": "Otros sucesos",
}


def _province_from_socio(info: dict) -> str:
    cedula = str(info.get("cedula") or "")
    if len(cedula) >= 2:
        prov = PROVINCE_BY_CEDULA.get(cedula[:2])
        if prov:
            return prov
    agencia = (info.get("agencia") or "").lower()
    if "tulcán" in agencia or "tulcan" in agencia or "carchi" in agencia:
        return "Carchi"
    if "quito" in agencia or "pichincha" in agencia:
        return "Pichincha"
    if "imbabura" in agencia or "ibarra" in agencia or "otavalo" in agencia:
        return "Imbabura"
    if "latacunga" in agencia or "cotopaxi" in agencia:
        return "Cotopaxi"
    return "Sierra norte"


def _activity_tags(ocupacion: str) -> set[str]:
    text = (ocupacion or "").lower()
    tags = set()
    if any(k in text for k in ("agricult", "cultivo", "papa", "leche", "ganader", "floric", "café", "cafe")):
        tags.update(["agro", "sierra"])
    if any(k in text for k in ("taxi", "transport", "carga", "bus", "camion")):
        tags.update(["transporte", "taxi", "urbano"])
    if any(k in text for k in ("comerc", "venta", "tienda", "mercad")):
        tags.update(["comercio", "urbano"])
    if not tags:
        tags.add("comercio")
    return tags


def _seed_int(*parts) -> int:
    raw = "|".join(str(p) for p in parts).encode("utf-8")
    return int(hashlib.sha256(raw).hexdigest()[:8], 16)


def _pick_news(info: dict, zona: str, tags: set[str], n: int = 4) -> list[dict]:
    sid = int(info.get("id") or 0)
    scored = []
    for idx, ev in enumerate(EVENT_CATALOG):
        overlap = len(tags.intersection(set(ev.get("tags") or [])))
        score = ev["peso_base"] + overlap * 0.12 + (_seed_int(sid, idx) % 17) / 100
        scored.append((score, idx, ev))
    scored.sort(key=lambda x: -x[0])
    corte = FECHA_CORTE
    out = []
    for rank, (_, idx, ev) in enumerate(scored[:n]):
        days_ago = 1 + (_seed_int(sid, "d", idx) % 5)
        fecha_pub = (corte - timedelta(days=days_ago)).isoformat()
        titulo = ev["titulo"].format(zona=zona)
        resumen = ev["resumen"].format(zona=zona)
        out.append({
            "id": f"ctx-{sid}-{idx}",
            "titulo": titulo,
            "resumen": resumen,
            "categoria": ev["categoria"],
            "categoria_label": CATEGORY_LABELS[ev["categoria"]],
            "fuente": "Radar Mora · monitoreo contextual",
            "fecha": fecha_pub,
            "relevancia": round(min(0.99, score), 2),
        })
    return out


def _category_scores(tags: set[str], noticias: list[dict], risk: dict, resumen: dict) -> dict:
    scores = {k: 0.0 for k in CATEGORY_LABELS}
    for n in noticias:
        scores[n["categoria"]] = max(scores[n["categoria"]], n["relevancia"] * 0.85)

    if "agro" in tags:
        scores["clima"] += 0.22
        scores["desastre_natural"] += 0.12
    if "transporte" in tags or "taxi" in tags:
        scores["economico"] += 0.2
        scores["clima"] += 0.1
    if resumen.get("en_mora") or int(resumen.get("dias_mora") or 0) > 0:
        scores["economico"] += 0.15
    if float(risk.get("score") or 0) >= 70:
        scores["clima"] += 0.08
        scores["otros"] += 0.06

    return {k: round(min(1.0, v), 3) for k, v in scores.items()}


def _predict_impago(
    category_scores: dict,
    risk: dict,
    resumen: dict,
    noticias: list[dict],
) -> dict:
    weights = {
        "desastre_natural": 28,
        "clima": 32,
        "economico": 24,
        "otros": 16,
    }
    raw = sum(category_scores.get(k, 0) * weights[k] for k in weights)
    credit_boost = 0.0
    if resumen.get("en_mora"):
        credit_boost += 12
    if int(resumen.get("dias_mora") or 0) >= 30:
        credit_boost += 8
    score_risk = float(risk.get("score") or 0)
    raw += credit_boost + max(0, (score_risk - 50) * 0.12)
    prob = round(min(78.0, max(8.0, raw * 1.15)), 1)

    if prob >= 55:
        nivel = "Alto"
        titulo = "Alta probabilidad de no pago por eventos externos"
        explicacion = (
            "La combinación de noticias adversas en la zona del socio y su perfil crediticio actual "
            "sugiere que factores fuera del comportamiento habitual (clima, desastres o economía local) "
            "podrían impedir el pago de la próxima cuota."
        )
        recomendacion = (
            "Contactar al socio para validar impacto real, ofrecer reprogramación preventiva "
            "y documentar evidencia de fuerza mayor si aplica."
        )
    elif prob >= 32:
        nivel = "Medio"
        titulo = "Riesgo moderado por contexto externo"
        explicacion = (
            "Hay señales de presión externa que conviene monitorear junto con el score de mora interno."
        )
        recomendacion = "Incluir en la gestión preguntas sobre ingresos, cosechas o movilidad afectada por el entorno."
    else:
        nivel = "Bajo"
        titulo = "Contexto externo sin alerta crítica"
        explicacion = (
            "Las noticias monitoreadas no muestran, por ahora, un choque severo con la capacidad de pago."
        )
        recomendacion = "Mantener seguimiento estándar; revisar si cambia el clima o precios locales."

    factores = []
    for key, label in CATEGORY_LABELS.items():
        peso = category_scores.get(key, 0)
        factores.append({
            "tipo": key,
            "etiqueta": label,
            "peso": peso,
            "activo": peso >= 0.35,
        })
    factores.sort(key=lambda x: -x["peso"])

    top_news = noticias[0]["titulo"] if noticias else "sin titulares críticos"
    confianza = round(min(0.92, 0.55 + len(noticias) * 0.08 + prob / 200), 2)

    return {
        "prob_impago_por_evento_pct": prob,
        "nivel": nivel,
        "confianza": confianza,
        "titulo": titulo,
        "explicacion": explicacion,
        "recomendacion": recomendacion,
        "factores": factores,
        "headline_ejemplo": top_news,
    }


def build_socio_context_intel(info: dict, risk: dict, resumen: dict) -> dict:
    """Genera noticias sugeridas y predicción IA de impago por eventos externos."""
    zona = _province_from_socio(info)
    tags = _activity_tags(info.get("ocupacion") or "")
    if zona.lower() in ("carchi", "imbabura"):
        tags.add("carchi")
    noticias = _pick_news(info, zona, tags)
    cat_scores = _category_scores(tags, noticias, risk, resumen)
    prediccion = _predict_impago(cat_scores, risk, resumen, noticias)

    return {
        "zona": zona,
        "actividad_tags": sorted(tags),
        "fecha_analisis": FECHA_CORTE.isoformat(),
        "noticias_sugeridas": noticias,
        "prediccion_ia": prediccion,
        "disclaimer": (
            "Análisis contextual generado por Radar Mora a partir de zona, actividad económica "
            "y plantillas de eventos públicos al corte. Verifique titulares en fuentes oficiales "
            "antes de decisiones de cobranza."
        ),
    }
