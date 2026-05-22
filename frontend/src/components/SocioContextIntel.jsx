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

  return (
    <section className="card context-intel animate-in" style={{ marginBottom: 24 }}>
      <div className="context-intel-header">
        <div>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Newspaper size={20} style={{ color: 'var(--coop-verde-primario)' }} />
            Contexto externo y noticias
          </div>
          <div className="card-subtitle">
            Titulares sugeridos para la zona del socio y predicción IA de impago por eventos externos
          </div>
        </div>
        <div className="context-intel-meta">
          <span className="context-intel-meta-item">
            <MapPin size={14} />
            {zona}
          </span>
          <span className="context-intel-meta-item">Corte {formatFecha(fecha_analisis)}</span>
        </div>
      </div>

      <div className="context-intel-body">
        <div className={`context-intel-pred ${nivelClass}`}>
          <div className="context-intel-pred-icon">
            <Sparkles size={22} />
          </div>
          <div className="context-intel-pred-main">
            <span className="context-intel-pred-kicker">Predicción IA · eventos externos</span>
            <h3 className="context-intel-pred-title">{pred?.titulo}</h3>
            <p className="context-intel-pred-text">{pred?.explicacion}</p>
            <p className="context-intel-pred-rec">
              <strong>Recomendación:</strong> {pred?.recomendacion}
            </p>
          </div>
          <div className="context-intel-pred-stats">
            <span className={`badge ${(pred?.nivel || 'Medio').toLowerCase().replace('í', 'i')}`}>
              {pred?.nivel}
            </span>
          </div>
        </div>

        <div className="context-intel-factors">
          <h4 className="context-intel-factors-title">Factores monitoreados</h4>
          <div className="context-intel-factors-grid">
            {(pred?.factores || []).map((f) => {
              const Icon = CATEGORY_ICONS[f.tipo] || Info;
              const pct = Math.round((f.peso || 0) * 100);
              return (
                <div
                  key={f.tipo}
                  className={`context-intel-factor ${f.activo ? 'context-intel-factor--active' : ''}`}
                >
                  <Icon size={16} />
                  <span className="context-intel-factor-label">{f.etiqueta}</span>
                  <div className="context-intel-factor-bar">
                    <div className="context-intel-factor-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="context-intel-factor-pct">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="context-intel-news">
          <h4 className="context-intel-news-title">Noticias sugeridas</h4>
          <ul className="context-intel-news-list">
            {noticias_sugeridas.map((n) => {
              const Icon = CATEGORY_ICONS[n.categoria] || Info;
              return (
                <li key={n.id} className="context-intel-news-item">
                  <div className={`context-intel-news-cat context-intel-news-cat--${n.categoria}`}>
                    <Icon size={14} />
                    {n.categoria_label}
                  </div>
                  <h5 className="context-intel-news-headline">{n.titulo}</h5>
                  <p className="context-intel-news-summary">{n.resumen}</p>
                  <div className="context-intel-news-foot">
                    <span>{n.fuente}</span>
                    <span>{formatFecha(n.fecha)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {disclaimer && (
        <p className="context-intel-disclaimer">{disclaimer}</p>
      )}
    </section>
  );
}
