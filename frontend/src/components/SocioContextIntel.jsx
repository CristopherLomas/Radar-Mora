import { CloudRain, Mountain, TrendingDown, Info, Newspaper, Sparkles, MapPin } from 'lucide-react';

const CATEGORY_ICONS = {
  desastre_natural: Mountain,
  clima: CloudRain,
  economico: TrendingDown,
  otros: Info,
};

const NIVEL_CLASS = {
  Alto: 'context-intel-pred--alto',
  Medio: 'context-intel-pred--medio',
  Bajo: 'context-intel-pred--bajo',
};

function formatFecha(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function SocioContextIntel({ contexto }) {
  if (!contexto) return null;

  const { zona, fecha_analisis, noticias_sugeridas = [], prediccion_ia: pred, disclaimer } = contexto;
  const nivelClass = NIVEL_CLASS[pred?.nivel] || NIVEL_CLASS.Medio;
  const factoresActivos = (pred?.factores || []).filter((f) => f.activo).slice(0, 4);
  const noticias = noticias_sugeridas.slice(0, 3);

  return (
    <section className="card context-intel context-intel--compact animate-in">
      <div className="context-intel-header">
        <div className="context-intel-header-text">
          <div className="context-intel-header-main">
            <Newspaper size={16} />
            <span className="context-intel-title">Contexto externo y noticias</span>
            <span className={`badge badge-sm ${(pred?.nivel || 'Medio').toLowerCase().replace('í', 'i')}`}>
              {pred?.nivel}
            </span>
          </div>
          <p className="context-intel-subtitle">
            Eventos en la zona del socio que pueden afectar la capacidad de pago
          </p>
        </div>
        <span className="context-intel-meta-inline">
          <MapPin size={12} />
          {zona} · Corte {formatFecha(fecha_analisis)}
        </span>
      </div>

      <div className={`context-intel-pred ${nivelClass}`}>
        <Sparkles size={16} className="context-intel-pred-icon-sm" />
        <div className="context-intel-pred-main">
          <span className="context-intel-pred-kicker">Predicción IA · eventos externos</span>
          <p className="context-intel-pred-title">{pred?.titulo}</p>
          <p className="context-intel-pred-text">{pred?.explicacion}</p>
          {pred?.recomendacion && (
            <p className="context-intel-pred-rec">
              <strong>Gestión sugerida:</strong> {pred.recomendacion}
            </p>
          )}
        </div>
      </div>

      {factoresActivos.length > 0 && (
        <div className="context-intel-section">
          <h4 className="context-intel-section-title">Factores en alerta</h4>
          <div className="context-intel-chips">
            {factoresActivos.map((f) => {
              const Icon = CATEGORY_ICONS[f.tipo] || Info;
              return (
                <span key={f.tipo} className="context-intel-chip">
                  <Icon size={12} />
                  {f.etiqueta}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {noticias.length > 0 && (
        <div className="context-intel-section">
          <h4 className="context-intel-section-title">Noticias sugeridas</h4>
          <ul className="context-intel-news-list">
            {noticias.map((n) => {
              const Icon = CATEGORY_ICONS[n.categoria] || Info;
              return (
                <li key={n.id} className="context-intel-news-item">
                  <div className="context-intel-news-top">
                    <span className={`context-intel-news-cat context-intel-news-cat--${n.categoria}`}>
                      <Icon size={11} />
                      {n.categoria_label}
                    </span>
                    <span className="context-intel-news-date">{formatFecha(n.fecha)}</span>
                  </div>
                  <p className="context-intel-news-headline">{n.titulo}</p>
                  <p className="context-intel-news-summary">{n.resumen}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {disclaimer && (
        <p className="context-intel-disclaimer">{disclaimer}</p>
      )}
    </section>
  );
}
