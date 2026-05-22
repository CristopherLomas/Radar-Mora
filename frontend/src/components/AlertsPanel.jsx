import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, Filter, Cpu, Brain, CheckCircle, TrendingUp, Sparkles, UserCheck } from 'lucide-react';
import { alertsAPI, modelAPI } from '../services/api';

export default function AlertsPanel() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      alertsAPI.getAll().catch(() => []),
      modelAPI.getInfo().catch(() => null)
    ]).then(([alertsData, modelData]) => {
      const alertList = Array.isArray(alertsData) ? alertsData : (alertsData?.alerts || []);
      setAlerts(alertList);
      setModelInfo(modelData);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // Filter logic
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.socio_nombre?.toLowerCase().includes(search.toLowerCase()) || 
                          alert.mensaje?.toLowerCase().includes(search.toLowerCase());
    
    // Normalize priority names
    let normalizedPriority = alert.prioridad?.toLowerCase() || '';
    if (normalizedPriority === 'critica') normalizedPriority = 'alta'; // Map critical to high for UI clarity
    
    const matchesPriority = !priorityFilter || normalizedPriority === priorityFilter.toLowerCase();
    const matchesType = !typeFilter || alert.tipo === typeFilter;

    return matchesSearch && matchesPriority && matchesType;
  });

  // Calculate some stats from alerts
  const highAlertsCount = alerts.filter(a => a.prioridad === 'alta' || a.prioridad === 'critica').length;
  const mediumAlertsCount = alerts.filter(a => a.prioridad === 'media').length;
  const lowAlertsCount = alerts.filter(a => a.prioridad === 'baja').length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <div className="loading-text">Cargando radar de alertas y telemetría de IA...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Radar de Alertas Tempranas</h1>
        <p>Predicciones del modelo de IA y desvíos transaccionales detectados</p>
      </div>

      {/* Alertas Resumen & Telemetría IA Grid */}
      <div className="chart-grid" style={{ gridTemplateColumns: '2fr 1.1fr', marginBottom: 24 }}>
        
        {/* Panel Izquierdo: Buscador y Lista de Alertas */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card-header" style={{ marginBottom: 8, paddingBottom: 0 }}>
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} style={{ color: 'var(--critical)' }} />
                <span>Panel de Alertas Activas ({filteredAlerts.length})</span>
              </div>
              <div className="card-subtitle">Alertas prioritarias que requieren monitoreo inmediato</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="filters-bar" style={{ marginBottom: 8 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="filter-input"
                style={{ paddingLeft: 40, width: '100%' }}
                placeholder="Buscar por nombre o palabra clave..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <select 
              className="filter-select" 
              value={priorityFilter} 
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="">Todas las prioridades</option>
              <option value="alta">🔴 Alta / Crítica ({highAlertsCount})</option>
              <option value="media">🟡 Media ({mediumAlertsCount})</option>
              <option value="baja">🔵 Baja ({lowAlertsCount})</option>
            </select>

            <select 
              className="filter-select" 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="Cambio de categoría">Cambio de categoría (IA)</option>
              <option value="Atraso detectado">Atraso detectado</option>
              <option value="Saldo crítico">Saldo crítico</option>
              <option value="Patrón inusual">Patrón inusual</option>
            </select>
          </div>

          {/* Listado de Alertas */}
          <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredAlerts.length === 0 ? (
              <div className="empty-state" style={{ padding: '80px 20px' }}>
                <UserCheck size={40} style={{ color: 'var(--success)', opacity: 0.6 }} />
                <p style={{ marginTop: 12 }}>No hay alertas activas que coincidan con los filtros.</p>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>El comportamiento financiero de los socios está estable.</span>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const priorityClass = alert.prioridad === 'alta' || alert.prioridad === 'critica' ? 'alta' : alert.prioridad === 'media' ? 'media' : 'baja';
                return (
                  <div key={alert.id} className="alert-item animate-in" style={{ padding: '16px 20px', marginBottom: 12, alignItems: 'center' }}>
                    <div className={`alert-icon ${priorityClass}`}>
                      <AlertTriangle size={18} />
                    </div>
                    <div className="alert-content">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="alert-title" style={{ fontSize: '15px', fontWeight: 700 }}>
                          {alert.socio_nombre}
                        </span>
                        <span className={`badge ${priorityClass}`} style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {alert.prioridad === 'critica' ? 'crítico' : alert.prioridad}
                        </span>
                      </div>
                      <div className="alert-message" style={{ fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: 6 }}>
                        {alert.mensaje}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="alert-meta" style={{ fontSize: '12px', display: 'flex', gap: 12 }}>
                          <span>📅 {alert.fecha}</span>
                          <span>•</span>
                          <span>📂 Tipo: <strong>{alert.tipo}</strong></span>
                          {alert.risk_score > 0 && (
                            <>
                              <span>•</span>
                              <span style={{ color: alert.risk_score > 75 ? 'var(--critical)' : alert.risk_score > 40 ? 'var(--warning)' : 'var(--success)' }}>
                                Score IA: <strong>{alert.risk_score}</strong>
                              </span>
                            </>
                          )}
                        </div>
                        <button 
                          className="back-btn" 
                          style={{ padding: '5px 12px', fontSize: '12px', background: 'var(--glass-hover)' }}
                          onClick={() => navigate(`/socios/${alert.socio_id}`)}
                        >
                          <Brain size={12} style={{ marginRight: 4 }} />
                          Analizar IA (XAI)
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel Derecho: Telemetría y estado de la IA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Card: Estado del Modelo de IA */}
          <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="card-header" style={{ marginBottom: 16 }}>
              <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Brain size={18} style={{ color: 'var(--accent-light)' }} />
                  <span>Estado de la IA</span>
                </div>
                <div className="card-subtitle">Métricas de entrenamiento y algoritmos</div>
              </div>
              <Sparkles size={16} style={{ color: 'var(--warning)' }} />
            </div>

            {modelInfo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Cpu size={24} style={{ color: 'var(--accent-light)' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Algoritmo Predictivo</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{modelInfo.model_name || 'Random Forest'}</div>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-label">Precisión General (Accuracy)</span>
                  <span className="info-value" style={{ color: 'var(--success)' }}>{(modelInfo.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Precisión de Alertas (Precision)</span>
                  <span className="info-value">{(modelInfo.precision * 100).toFixed(1)}%</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Sensibilidad (Recall)</span>
                  <span className="info-value">{(modelInfo.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="info-row">
                  <span className="info-label">F1-Score (Equilibrio)</span>
                  <span className="info-value">{(modelInfo.f1_score * 100).toFixed(1)}%</span>
                </div>
                <div className="info-row" style={{ borderBottom: 'none' }}>
                  <span className="info-label">Socios Analizados</span>
                  <span className="info-value" style={{ color: 'var(--accent-light)' }}>{modelInfo.total_samples || 500}</span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <CheckCircle size={12} style={{ color: 'var(--success)' }} />
                  <span>Modelo entrenado localmente con éxito</span>
                </div>
              </div>
            ) : (
              <div className="empty-state">No se cargaron datos del modelo</div>
            )}
          </div>

          {/* Card: Guía de Uso Pitch */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px' }}>
                <TrendingUp size={16} style={{ color: 'var(--warning)' }} />
                <span>Storytelling para el Pitch 💡</span>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p>
                <strong>1. Elige un Socio Crítico:</strong> Abre la lista de alertas, filtra por 🔴 <strong>Alta</strong>, y haz clic en <strong>Analizar IA</strong>.
              </p>
              <p>
                <strong>2. Explica el "Por qué" (XAI):</strong> Muestra al jurado la importancia de las variables (Feature Importance). Explica que el riesgo aumentó no por azar, sino por <em>patrones conductuales concretos</em> como la caída del saldo mensual y el aumento de retiros.
              </p>
              <p>
                <strong>3. Acción Preventiva:</strong> Enfatiza que Radar-Mora le permite a CoopTech Tulcán reestructurar deudas de forma proactiva <strong>antes</strong> de caer en mora legal.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
