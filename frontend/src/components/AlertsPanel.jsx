import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, Filter } from 'lucide-react';
import { alertsAPI } from '../services/api';

function riskBadgeClass(level) {
  const l = (level || '').toLowerCase();
  if (l.includes('crít') || l.includes('crit')) return 'critico';
  if (l.includes('alto')) return 'alto';
  if (l.includes('medio')) return 'medio';
  return 'bajo';
}

export default function AlertsPanel() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prioridadFilter, setPrioridadFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    alertsAPI.getAll()
      .then(data => {
        if (!cancelled) {
          setAlerts(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAlerts([]);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const tipos = [...new Set(alerts.map(a => a.tipo).filter(Boolean))];

  const filtered = alerts.filter(a => {
    if (prioridadFilter && a.prioridad !== prioridadFilter) return false;
    if (tipoFilter && a.tipo !== tipoFilter) return false;
    return true;
  });

  const counts = {
    alta: alerts.filter(a => a.prioridad === 'alta').length,
    media: alerts.filter(a => a.prioridad === 'media').length,
    baja: alerts.filter(a => a.prioridad === 'baja').length,
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Cargando alertas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-intro">
        <h1>Centro de Alertas</h1>
        <p>{alerts.length} alertas activas · Detección temprana de mora y patrones de riesgo</p>
      </div>

      <div className="metrics-panel metrics-panel--compact" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-cell metric-cell--critical">
          <div className="metric-cell-icon"><AlertTriangle size={20} /></div>
          <div className="metric-cell-body">
            <span className="metric-cell-value">{counts.alta}</span>
            <span className="metric-cell-label">Prioridad alta</span>
          </div>
        </div>
        <div className="metric-cell metric-cell--warn">
          <div className="metric-cell-icon"><AlertTriangle size={20} /></div>
          <div className="metric-cell-body">
            <span className="metric-cell-value">{counts.media}</span>
            <span className="metric-cell-label">Prioridad media</span>
          </div>
        </div>
        <div className="metric-cell metric-cell--green">
          <div className="metric-cell-icon"><Bell size={20} /></div>
          <div className="metric-cell-body">
            <span className="metric-cell-value">{counts.baja}</span>
            <span className="metric-cell-label">Prioridad baja</span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <select
          className="filter-select"
          value={prioridadFilter}
          onChange={e => setPrioridadFilter(e.target.value)}
        >
          <option value="">Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <select
          className="filter-select"
          value={tipoFilter}
          onChange={e => setTipoFilter(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {tipos.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="card animate-in" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Listado de Alertas</div>
            <div className="card-subtitle">
              {filtered.length} alerta(s) mostrada(s)
            </div>
          </div>
          <Bell size={18} style={{ color: 'var(--text-muted)' }} />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={32} />
            <p>No hay alertas con los filtros seleccionados</p>
          </div>
        ) : (
          filtered.map(alert => (
            <div
              key={alert.id}
              className={`alert-item risk-profile-card ${(alert.risk_level || '').toLowerCase().replace('í', 'i')}`}
              style={{ cursor: 'pointer', borderTopWidth: 5 }}
              onClick={() => navigate(`/socios/${alert.socio_id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/socios/${alert.socio_id}`)}
            >
              <div className={`alert-icon ${alert.prioridad || 'media'}`}>
                <AlertTriangle size={16} />
              </div>
              <div className="alert-content">
                <div className="alert-title">{alert.socio_nombre}</div>
                <div className="alert-message">{alert.mensaje}</div>
                <div className="alert-meta">
                  {alert.tipo} · {alert.fecha} · Score: {alert.risk_score}
                </div>
              </div>
              <span className={`badge ${riskBadgeClass(alert.risk_level)}`}>
                {alert.risk_level}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
