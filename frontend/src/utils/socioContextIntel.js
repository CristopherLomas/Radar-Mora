/** Port del módulo backend socio_context_intel (demo sin API). */

const FECHA_CORTE = '2026-05-21';

const PROVINCE_BY_CEDULA = {
  '01': 'Azuay', '02': 'Bolívar', '03': 'Cañar', '04': 'Carchi', '05': 'Cotopaxi',
  '06': 'Chimborazo', '07': 'El Oro', '08': 'Esmeraldas', '09': 'Guayas', '10': 'Imbabura',
  '11': 'Loja', '12': 'Los Ríos', '13': 'Manabí', '14': 'Morona Santiago', '15': 'Napo',
  '16': 'Pastaza', '17': 'Pichincha', '18': 'Tungurahua', '19': 'Zamora Chinchipe',
  '20': 'Galápagos', '21': 'Sucumbíos', '22': 'Orellana', '23': 'Santo Domingo', '24': 'Santa Elena',
};

const EVENT_CATALOG = [
  { categoria: 'desastre_natural', titulo: 'Alerta de remoción en vía principal — {zona}', resumen: 'Reportes de deslizamiento y cierre parcial de carreteras en {zona} limitan el traslado de productos y el cobro en efectivo.', peso_base: 0.38, tags: ['carchi', 'imbabura', 'tungurahua', 'agro', 'transporte'] },
  { categoria: 'desastre_natural', titulo: 'Sismo leve registrado cerca de {zona}', resumen: 'Movimiento telúrico de magnitud moderada sin víctimas; algunos comercios cerraron por revisión estructural.', peso_base: 0.28, tags: ['costa', 'sierra', 'comercio'] },
  { categoria: 'clima', titulo: 'Pronóstico de lluvias intensas (fenómeno El Niño) — {zona}', resumen: 'INAMHI y prefectura alertan por precipitaciones que pueden afectar cosechas y rutas de distribución en los próximos días.', peso_base: 0.42, tags: ['agro', 'carchi', 'imbabura', 'cotopaxi', 'chimborazo'] },
  { categoria: 'clima', titulo: 'Heladas matinales en zona altoandina ({zona})', resumen: 'Bajas temperaturas impactan cultivos de papa y maíz; productores reportan pérdida parcial de producción.', peso_base: 0.35, tags: ['agro', 'carchi', 'tungurahua'] },
  { categoria: 'clima', titulo: 'Sequía prolongada afecta pastos y ganadería — {zona}', resumen: 'Déficit de lluvias reduce ingresos de sectores lecheros y ganaderos en la región.', peso_base: 0.33, tags: ['agro', 'leche', 'sierra'] },
  { categoria: 'economico', titulo: 'Incremento del precio del combustible y peajes', resumen: 'Transportistas y taxistas de {zona} señalan que el alza operativa reduce el margen diario disponible para obligaciones financieras.', peso_base: 0.36, tags: ['taxi', 'transporte', 'urbano'] },
  { categoria: 'economico', titulo: 'Caída del precio de productos agrícolas en ferias locales', resumen: 'Mayor oferta y menor demanda presionan los ingresos de productores en {zona}.', peso_base: 0.34, tags: ['agro', 'comercio'] },
  { categoria: 'otros', titulo: 'Paro sectorial de corta duración en {zona}', resumen: 'Movilización de transporte o comercio afectó la actividad económica durante 24–48 horas.', peso_base: 0.3, tags: ['transporte', 'comercio', 'urbano'] },
  { categoria: 'otros', titulo: 'Corte programado de energía eléctrica', resumen: 'Interrupción del servicio en barrios de {zona} limitó operación de negocios familiares.', peso_base: 0.22, tags: ['comercio', 'urbano'] },
];

const CATEGORY_LABELS = {
  desastre_natural: 'Desastre natural',
  clima: 'Clima adverso',
  economico: 'Economía local',
  otros: 'Otros sucesos',
};

function seedInt(...parts) {
  const raw = parts.join('|');
  let h = 0;
  for (let i = 0; i < raw.length; i += 1) {
    h = ((h << 5) - h) + raw.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function provinceFromSocio(info) {
  const cedula = String(info.cedula || '');
  if (cedula.length >= 2 && PROVINCE_BY_CEDULA[cedula.slice(0, 2)]) {
    return PROVINCE_BY_CEDULA[cedula.slice(0, 2)];
  }
  const agencia = (info.agencia || '').toLowerCase();
  if (agencia.includes('tulcán') || agencia.includes('tulcan') || agencia.includes('carchi')) return 'Carchi';
  if (agencia.includes('quito') || agencia.includes('pichincha')) return 'Pichincha';
  if (agencia.includes('imbabura') || agencia.includes('ibarra') || agencia.includes('otavalo')) return 'Imbabura';
  if (agencia.includes('latacunga') || agencia.includes('cotopaxi')) return 'Cotopaxi';
  return 'Sierra norte';
}

function activityTags(ocupacion) {
  const text = (ocupacion || '').toLowerCase();
  const tags = new Set();
  if (/(agricult|cultivo|papa|leche|ganader|floric|café|cafe)/.test(text)) {
    tags.add('agro'); tags.add('sierra');
  }
  if (/(taxi|transport|carga|bus|camion)/.test(text)) {
    tags.add('transporte'); tags.add('taxi'); tags.add('urbano');
  }
  if (/(comerc|venta|tienda|mercad)/.test(text)) {
    tags.add('comercio'); tags.add('urbano');
  }
  if (!tags.size) tags.add('comercio');
  return tags;
}

function pickNews(info, zona, tags, n = 4) {
  const sid = Number(info.id) || 0;
  const scored = EVENT_CATALOG.map((ev, idx) => {
    const overlap = [...tags].filter((t) => (ev.tags || []).includes(t)).length;
    const score = ev.peso_base + overlap * 0.12 + (seedInt(sid, idx) % 17) / 100;
    return { score, idx, ev };
  }).sort((a, b) => b.score - a.score);

  const corte = new Date(FECHA_CORTE);
  return scored.slice(0, n).map(({ score, idx, ev }) => {
    const daysAgo = 1 + (seedInt(sid, 'd', idx) % 5);
    const fecha = new Date(corte);
    fecha.setDate(fecha.getDate() - daysAgo);
    return {
      id: `ctx-${sid}-${idx}`,
      titulo: ev.titulo.replace('{zona}', zona),
      resumen: ev.resumen.replace('{zona}', zona),
      categoria: ev.categoria,
      categoria_label: CATEGORY_LABELS[ev.categoria],
      fuente: 'Radar Mora · monitoreo contextual',
      fecha: fecha.toISOString().slice(0, 10),
      relevancia: Math.min(0.99, Math.round(score * 100) / 100),
    };
  });
}

function categoryScores(tags, noticias, risk, resumen) {
  const scores = Object.fromEntries(Object.keys(CATEGORY_LABELS).map((k) => [k, 0]));
  noticias.forEach((n) => {
    scores[n.categoria] = Math.max(scores[n.categoria], n.relevancia * 0.85);
  });
  if (tags.has('agro')) {
    scores.clima += 0.22;
    scores.desastre_natural += 0.12;
  }
  if (tags.has('transporte') || tags.has('taxi')) {
    scores.economico += 0.2;
    scores.clima += 0.1;
  }
  if (resumen.en_mora || Number(resumen.dias_mora || 0) > 0) scores.economico += 0.15;
  if (Number(risk.score || 0) >= 70) {
    scores.clima += 0.08;
    scores.otros += 0.06;
  }
  return Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, Math.min(1, Math.round(v * 1000) / 1000)]),
  );
}

function predictImpago(categoryScores, risk, resumen, noticias) {
  const weights = { desastre_natural: 28, clima: 32, economico: 24, otros: 16 };
  let raw = Object.entries(weights).reduce((s, [k, w]) => s + (categoryScores[k] || 0) * w, 0);
  if (resumen.en_mora) raw += 12;
  if (Number(resumen.dias_mora || 0) >= 30) raw += 8;
  const scoreRisk = Number(risk.score || 0);
  raw += Math.max(0, (scoreRisk - 50) * 0.12);
  const prob = Math.round(Math.min(78, Math.max(8, raw * 1.15)) * 10) / 10;

  let nivel; let titulo; let explicacion; let recomendacion;
  if (prob >= 55) {
    nivel = 'Alto';
    titulo = 'Alta probabilidad de no pago por eventos externos';
    explicacion = 'La combinación de noticias adversas en la zona del socio y su perfil crediticio actual sugiere que factores fuera del comportamiento habitual (clima, desastres o economía local) podrían impedir el pago de la próxima cuota.';
    recomendacion = 'Contactar al socio para validar impacto real, ofrecer reprogramación preventiva y documentar evidencia de fuerza mayor si aplica.';
  } else if (prob >= 32) {
    nivel = 'Medio';
    titulo = 'Riesgo moderado por contexto externo';
    explicacion = 'Hay señales de presión externa que conviene monitorear junto con el score de mora interno.';
    recomendacion = 'Incluir en la gestión preguntas sobre ingresos, cosechas o movilidad afectada por el entorno.';
  } else {
    nivel = 'Bajo';
    titulo = 'Contexto externo sin alerta crítica';
    explicacion = 'Las noticias monitoreadas no muestran, por ahora, un choque severo con la capacidad de pago.';
    recomendacion = 'Mantener seguimiento estándar; revisar si cambia el clima o precios locales.';
  }

  const factores = Object.entries(CATEGORY_LABELS)
    .map(([tipo, etiqueta]) => ({
      tipo,
      etiqueta,
      peso: categoryScores[tipo] || 0,
      activo: (categoryScores[tipo] || 0) >= 0.35,
    }))
    .sort((a, b) => b.peso - a.peso);

  return {
    prob_impago_por_evento_pct: prob,
    nivel,
    confianza: Math.min(0.92, Math.round((0.55 + noticias.length * 0.08 + prob / 200) * 100) / 100),
    titulo,
    explicacion,
    recomendacion,
    factores,
    headline_ejemplo: noticias[0]?.titulo || 'sin titulares críticos',
  };
}

export function buildSocioContextIntel(info, risk, resumen) {
  const zona = provinceFromSocio(info);
  const tags = activityTags(info.ocupacion);
  if (['carchi', 'imbabura'].includes(zona.toLowerCase())) tags.add('carchi');
  const noticias = pickNews(info, zona, tags);
  const catScores = categoryScores(tags, noticias, risk, resumen);
  const prediccion = predictImpago(catScores, risk, resumen, noticias);
  return {
    zona,
    actividad_tags: [...tags].sort(),
    fecha_analisis: FECHA_CORTE,
    noticias_sugeridas: noticias,
    prediccion_ia: prediccion,
    disclaimer: 'Análisis contextual generado por Radar Mora a partir de zona, actividad económica y plantillas de eventos públicos al corte. Verifique titulares en fuentes oficiales antes de decisiones de cobranza.',
  };
}
