import { useState, useEffect } from 'react';
import { Users, CreditCard, DollarSign, AlertTriangle, TrendingUp, Bell, Briefcase, User, GraduationCap, Home, Calendar, Globe, Award, Heart } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, CartesianGrid, LineChart, Line } from 'recharts';
import { dashboardAPI, alertsAPI } from '../services/api';

const RISK_COLORS = { 'Bajo': '#10b981', 'Medio': '#f59e0b', 'Alto': '#f97316', 'Crítico': '#ef4444' };

function formatCurrency(n) {
  if (n == null) return '$0';
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function formatNumber(n) {
  if (n == null) return '0';
  return n.toLocaleString();
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>{label}</p>
      {payload.map((entry, i) => {
        let valStr = entry.value;
        if (typeof entry.value === 'number') {
          if (entry.name?.includes('$') || entry.name?.includes('Monto')) {
            valStr = formatCurrency(entry.value);
          } else if (entry.name?.includes('%') || entry.name?.toLowerCase().includes('tasa')) {
            valStr = `${entry.value.toFixed(1)}%`;
          } else {
            valStr = formatNumber(entry.value);
          }
        }
        return (
          <p key={i} style={{ color: entry.color, fontSize: 12, margin: '2px 0' }}>
            {entry.name}: {valStr}
          </p>
        );
      })}
    </div>
  );
};

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [riskDist, setRiskDist] = useState([]);
  const [trend, setTrend] = useState([]);
  const [byAgency, setByAgency] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [extendedStats, setExtendedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');

  useEffect(() => {
    Promise.all([
      dashboardAPI.getOverview().catch(() => null),
      dashboardAPI.getRiskDistribution().catch(() => []),
      dashboardAPI.getTrend().catch(() => []),
      dashboardAPI.getRiskByAgency().catch(() => []),
      alertsAPI.getAll().catch(() => []),
      dashboardAPI.getExtendedStats().catch(() => null),
    ]).then(([ov, rd, tr, ag, al, ext]) => {
      setOverview(ov);
      setRiskDist(Array.isArray(rd) ? rd : []);
      setTrend(Array.isArray(tr) ? tr : []);
      const cleanedAgencies = (Array.isArray(ag) ? ag : []).map(item => ({
        ...item,
        agencia: typeof item.agencia === 'string' ? item.agencia.replace(/^Agencia\s+/i, '') : item.agencia
      }));
      setByAgency(cleanedAgencies);
      const alertList = Array.isArray(al) ? al : (al?.alerts || []);
      setAlerts(alertList.slice(0, 8));
      setExtendedStats(ext);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <div className="loading-text">Cargando panel de control...</div>
      </div>
    );
  }

  const kpis = [
    { label: 'Socios Activos', value: formatNumber(overview?.total_socios), icon: Users, color: 'accent' },
    { label: 'Créditos Vigentes', value: formatNumber(overview?.creditos_vigentes), icon: CreditCard, color: 'success' },
    { label: 'Cartera Total', value: formatCurrency(overview?.cartera_total), icon: DollarSign, color: 'warning' },
    { label: 'Tasa de Morosidad', value: `${(overview?.tasa_morosidad || 0).toFixed(1)}%`, icon: AlertTriangle, color: 'danger' },
  ];

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1>Panel de Control</h1>
        <p>Monitoreo integral del riesgo crediticio en tiempo real</p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className={`kpi-card ${kpi.color} animate-in`}>
            <div className={`kpi-icon ${kpi.color}`}>
              <kpi.icon size={22} />
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Additional KPIs row */}
      {overview && (
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
          <div className="kpi-card danger animate-in">
            <div className="kpi-icon danger"><AlertTriangle size={22} /></div>
            <div className="kpi-value">{formatNumber(overview.socios_riesgo_alto)}</div>
            <div className="kpi-label">Socios Riesgo Alto</div>
          </div>
          <div className="kpi-card danger animate-in">
            <div className="kpi-icon danger" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><AlertTriangle size={22} /></div>
            <div className="kpi-value">{formatNumber(overview.socios_riesgo_critico)}</div>
            <div className="kpi-label">Socios Riesgo Crítico</div>
          </div>
          <div className="kpi-card warning animate-in">
            <div className="kpi-icon warning"><DollarSign size={22} /></div>
            <div className="kpi-value">{formatCurrency(overview.monto_en_riesgo)}</div>
            <div className="kpi-label">Monto en Riesgo</div>
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="chart-grid">
        <div className="card animate-in">
          <div className="card-header">
            <div>
              <div className="card-title">Distribución de Riesgo</div>
              <div className="card-subtitle">Clasificación por nivel de riesgo</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={550}>
            <PieChart>
              <Pie
                data={riskDist}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={150}
                dataKey="cantidad"
                nameKey="nivel"
                labelLine={false}
                label={renderPieLabel}
                strokeWidth={2}
                stroke="rgba(10,14,26,0.8)"
              >
                {riskDist.map((entry, i) => (
                  <Cell key={i} fill={entry.color || RISK_COLORS[entry.nivel] || '#6366f1'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card animate-in">
          <div className="card-header">
            <div>
              <div className="card-title">Riesgo por Agencia</div>
              <div className="card-subtitle">Distribución geográfica del riesgo</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={550}>
            <BarChart data={byAgency} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis type="category" dataKey="agencia" width={120} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} interval={0} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bajo" name="Bajo" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="medio" name="Medio" stackId="a" fill="#f59e0b" />
              <Bar dataKey="alto" name="Alto" stackId="a" fill="#f97316" />
              <Bar dataKey="critico" name="Crítico" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="chart-grid">
        <div className="card animate-in">
          <div className="card-header">
            <div>
              <div className="card-title">Tendencia de Morosidad</div>
              <div className="card-subtitle">Evolución de la tasa de mora en los últimos 12 meses</div>
            </div>
            <TrendingUp size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="colorMora" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="tasa_morosidad" name="Tasa Mora (%)" stroke="#ef4444" fill="url(#colorMora)" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card animate-in">
          <div className="card-header">
            <div>
              <div className="card-title">Alertas Recientes</div>
              <div className="card-subtitle">Últimas notificaciones del sistema</div>
            </div>
            <Bell size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {alerts.length === 0 ? (
              <div className="empty-state"><p>No hay alertas recientes</p></div>
            ) : (
              alerts.map((alert, i) => (
                <div key={i} className="alert-item" style={{ padding: '10px 12px', marginBottom: 6 }}>
                  <div className={`alert-icon ${alert.prioridad || 'media'}`}>
                    <AlertTriangle size={16} />
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">{alert.socio_nombre || 'Socio'}</div>
                    <div className="alert-message">{alert.mensaje}</div>
                    <div className="alert-meta">{alert.fecha} · Score: {alert.risk_score}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Advanced Statistics Section */}
      <div className="page-header animate-in" style={{ marginTop: 40, marginBottom: 16 }}>
        <h2>Estadísticas Avanzadas de la Cartera</h2>
        <p>Métricas detalladas extraídas en tiempo real del dataset maestro de producción</p>
      </div>

      {/* Selector de Pestañas Premium */}
      <div className="stats-tabs animate-in">
        <button 
          className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          <TrendingUp size={16} />
          Portafolio y Geografía
        </button>
        <button 
          className={`tab-btn ${activeTab === 'demographic' ? 'active' : ''}`}
          onClick={() => setActiveTab('demographic')}
        >
          <Users size={16} />
          Perfil Demográfico
        </button>
        <button 
          className={`tab-btn ${activeTab === 'behavior' ? 'active' : ''}`}
          onClick={() => setActiveTab('behavior')}
        >
          <CreditCard size={16} />
          Comportamiento Crediticio
        </button>
      </div>

      {/* PESTAÑA 1: PORTAFOLIO Y GEOGRAFÍA */}
      {activeTab === 'portfolio' && (
        <div className="animate-in" style={{ animationDelay: '0.1s' }}>
          {/* Advanced Charts Grid 1 */}
          <div className="chart-grid-three">
            <div className="card animate-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Mora por Tipo de Crédito</div>
                  <div className="card-subtitle">Volumen de mora y tasa de morosidad por cartera</div>
                </div>
                <CreditCard size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={extendedStats?.mora_por_tipo || []} margin={{ bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorMontoMora" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--accent-2)" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="tipo_cartera" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={formatCurrency} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="mora_monto" name="Monto en Mora ($)" fill="url(#colorMontoMora)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="tasa_mora_monto" name="Tasa de Mora (%)" fill="var(--critical)" radius={[4, 4, 0, 0]} opacity={0.7} />
                  <Legend verticalAlign="top" height={36} formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card animate-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Mora por Zona Geográfica</div>
                  <div className="card-subtitle">Análisis de morosidad y saldo en mora por región</div>
                </div>
                <TrendingUp size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={extendedStats?.mora_por_zona || []} margin={{ bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorZonaMora" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="zona" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={formatCurrency} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="mora_monto" name="Monto en Mora ($)" fill="url(#colorZonaMora)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="tasa_mora_monto" name="Tasa de Mora (%)" fill="var(--danger)" radius={[4, 4, 0, 0]} opacity={0.7} />
                  <Legend verticalAlign="top" height={36} formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card animate-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Mora por Rango de Monto</div>
                  <div className="card-subtitle">Análisis de morosidad según el volumen del crédito otorgado</div>
                </div>
                <DollarSign size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={extendedStats?.mora_por_rango_monto || []} margin={{ bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorRangoMora" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--warning)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="rango" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="tasa_mora_monto" name="Tasa de Morosidad (%)" stroke="var(--warning)" fill="url(#colorRangoMora)" strokeWidth={2} dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Advanced Charts Grid 2 */}
          <div className="chart-grid">
            <div className="card animate-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="card-header">
                  <div>
                    <div className="card-title">
                      {showAllActivities ? "Actividades Económicas (Vista Completa)" : "Top 5 Actividades con Mayor Exposición"}
                    </div>
                    <div className="card-subtitle">
                      {showAllActivities 
                        ? "Listado detallado de todos los sectores con operaciones activas"
                        : "Sectores económicos clave con mayor número de operaciones activas"}
                    </div>
                  </div>
                  <Briefcase size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="table-container" style={{ marginTop: 10, maxHeight: showAllActivities ? '380px' : 'none', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Actividad Económica</th>
                        <th style={{ textAlign: 'right' }}>Total Ops</th>
                        <th style={{ textAlign: 'right' }}>Cartera Total</th>
                        <th style={{ textAlign: 'right' }}>Ops en Mora</th>
                        <th style={{ textAlign: 'center', width: '160px' }}>Tasa Morosidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showAllActivities 
                        ? (extendedStats?.mora_por_actividad || [])
                        : (extendedStats?.mora_por_actividad?.slice(0, 5) || [])
                      ).map((act, i) => {
                        let barColor = 'var(--success)';
                        if (act.tasa_mora_monto > 20) barColor = 'var(--critical)';
                        else if (act.tasa_mora_monto > 12) barColor = 'var(--danger)';
                        else if (act.tasa_mora_monto > 5) barColor = 'var(--warning)';

                        return (
                          <tr key={i} style={{ cursor: 'default' }}>
                            <td style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'normal', maxWidth: '240px' }}>{act.actividad}</td>
                            <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{formatNumber(act.total_ops)}</td>
                            <td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(act.total_monto)}</td>
                            <td style={{ textAlign: 'right', color: 'var(--critical)', fontWeight: 500 }}>{formatNumber(act.mora_ops)}</td>
                            <td>
                              <div className="risk-bar" style={{ justifyContent: 'center' }}>
                                <div className="risk-bar-track" style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, maxWidth: '100px', flex: 1 }}>
                                  <div 
                                    className="risk-bar-fill" 
                                    style={{ 
                                      width: `${Math.min(100, act.tasa_mora_monto * 3.5)}%`, 
                                      background: barColor, 
                                      height: '100%', 
                                      borderRadius: 4 
                                    }} 
                                  />
                                </div>
                                <span className="risk-bar-value" style={{ fontSize: 12, fontWeight: 700, color: barColor, minWidth: '42px', textAlign: 'right' }}>
                                  {act.tasa_mora_monto}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <button 
                  onClick={() => setShowAllActivities(!showAllActivities)}
                  style={{
                    background: 'var(--glass)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '10px 24px',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    outline: 'none',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  className="toggle-stats-btn"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--glass-hover)';
                    e.currentTarget.style.borderColor = 'var(--glass-border-hover)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--glass)';
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {showAllActivities ? 'Mostrar Menos (Top 5)' : `Ver Todas (${extendedStats?.mora_por_actividad?.length || 0} Actividades)`}
                </button>
              </div>
            </div>

            <div className="card animate-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="card-header" style={{ marginBottom: 12 }}>
                  <div>
                    <div className="card-title">Distribución por Género</div>
                    <div className="card-subtitle">Comportamiento e impacto de la cartera por sexo del socio</div>
                  </div>
                  <User size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
                  {extendedStats?.por_genero?.map((g, i) => {
                    const isFem = g.genero === "Femenino";
                    const genderColor = isFem ? '#ec4899' : '#3b82f6';
                    const genderBg = isFem ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)';
                    
                    return (
                      <div key={i} style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.04)', 
                        borderRadius: '12px', 
                        padding: '16px',
                        transition: 'var(--transition)',
                      }}
                      className="gender-card"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ 
                              width: 32, 
                              height: 32, 
                              borderRadius: '8px', 
                              background: genderBg, 
                              color: genderColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 14
                            }}>
                              {isFem ? '♀' : '♂'}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{g.genero}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatNumber(g.total_ops)} operaciones</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(g.total_monto)}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Monto colocado</div>
                          </div>
                        </div>
                        
                        <div style={{ marginTop: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Ops en Mora: <strong style={{ color: 'var(--critical)' }}>{formatNumber(g.mora_ops)}</strong></span>
                            <span style={{ fontWeight: 700, color: genderColor }}>Tasa Mora: {g.tasa_mora_monto}%</span>
                          </div>
                          <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${Math.min(100, g.tasa_mora_monto * 4.5)}%`, 
                              background: `linear-gradient(90deg, ${genderColor}, var(--critical))`, 
                              height: '100%', 
                              borderRadius: 3 
                            }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div style={{ 
                marginTop: 20, 
                padding: '12px 14px', 
                background: 'var(--success-bg)', 
                border: '1px solid rgba(16,185,129,0.15)', 
                borderRadius: '10px',
                fontSize: '11px',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span>✨</span>
                <span><strong>Nota de Riesgo:</strong> La cartera femenina presenta excelente comportamiento en pagos y menor tasa de mora en general.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: PERFIL DEMOGRÁFICO */}
      {activeTab === 'demographic' && (
        <div className="animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="chart-grid">
            {/* Estado Civil */}
            <div className="card animate-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Riesgo por Estado Civil</div>
                  <div className="card-subtitle">Morosidad y colocación según el estado civil del socio</div>
                </div>
                <Heart size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={extendedStats?.mora_por_estado_civil || []} margin={{ left: 10, right: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="estado_civil" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={formatCurrency} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="total_monto" name="Monto Colocado ($)" fill="var(--accent)" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar yAxisId="right" dataKey="tasa_mora_monto" name="Tasa Mora (%)" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                  <Legend verticalAlign="top" height={36} formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cargas Familiares */}
            <div className="card animate-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Impacto por Cargas Familiares</div>
                  <div className="card-subtitle">Relación entre número de dependientes y tasa de morosidad</div>
                </div>
                <Users size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={extendedStats?.mora_por_cargas || []} margin={{ left: 10, right: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="cargas" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="tasa_mora_monto" name="Tasa Mora (%)" stroke="var(--critical)" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-grid-three" style={{ marginTop: 24 }}>
            {/* Edad */}
            <div className="card animate-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Mora por Rangos de Edad</div>
                  <div className="card-subtitle">Comportamiento según el ciclo de vida del socio</div>
                </div>
                <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={extendedStats?.mora_por_edad || []}>
                  <defs>
                    <linearGradient id="colorEdadMora" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="rango_edad" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="tasa_mora_monto" name="Tasa Mora (%)" stroke="#ec4899" fill="url(#colorEdadMora)" strokeWidth={2} dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Nivel Educativo */}
            <div className="card animate-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Mora por Nivel Educativo</div>
                  <div className="card-subtitle">Comportamiento de pago según grado de instrucción</div>
                </div>
                <GraduationCap size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={extendedStats?.mora_por_educacion || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="nivel_educativo" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tasa_mora_monto" name="Tasa Mora (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tipo de Vivienda */}
            <div className="card animate-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Mora por Tipo de Vivienda</div>
                  <div className="card-subtitle">Relación entre tenencia de vivienda y morosidad</div>
                </div>
                <Home size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={extendedStats?.mora_por_vivienda || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="tipo_vivienda" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tasa_mora_monto" name="Tasa Mora (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tarjeta Informativa de Nacionalidad y Geolocalización Cantonal */}
          <div className="card animate-in" style={{ marginTop: 24, padding: 0 }}>
            <div className="nationality-card">
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ 
                  background: 'rgba(99,102,241,0.12)', 
                  color: 'var(--accent-light)', 
                  width: 48, 
                  height: 48, 
                  borderRadius: 12, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Globe size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Análisis de Nacionalidad y Geolocalización Cantonal (DINARDAP)
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    La cartera de la cooperativa se compone en un **100% de socios de nacionalidad ecuatoriana**, dado su enfoque de desarrollo y ahorro comunitario en la Sierra Norte. El análisis espacial profundo se realiza mediante el código cantonal de origen registrado de forma segura desde la base de datos de DINARDAP (columna `cidudad_orig`), donde cantones clave como **Tulcán (Carchi)** con 7,829 socios, **Ibarra (Imbabura)** con 3,931 socios y **Quito (Pichincha)** con 3,248 socios concentran la mayor densidad y flujo transaccional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: COMPORTAMIENTO CREDITICIO */}
      {activeTab === 'behavior' && (
        <div className="animate-in" style={{ animationDelay: '0.1s' }}>
          {/* Destinos de Crédito y Cuotas */}
          <div className="chart-grid">
            {/* Destino del Crédito Table */}
            <div className="card animate-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="card-header">
                  <div>
                    <div className="card-title">Mora por Destino del Crédito (Alta Exposición)</div>
                    <div className="card-subtitle">Tasa de mora y volumen en los principales fines declarados del crédito</div>
                  </div>
                  <Briefcase size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="table-container" style={{ marginTop: 12 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Destino Final</th>
                        <th style={{ textAlign: 'right' }}>Total Ops</th>
                        <th style={{ textAlign: 'right' }}>Monto Colocado</th>
                        <th style={{ textAlign: 'center', width: '150px' }}>Morosidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(extendedStats?.mora_por_destino || []).map((dest, i) => {
                        let barColor = 'var(--success)';
                        if (dest.tasa_mora_monto > 35) barColor = 'var(--critical)';
                        else if (dest.tasa_mora_monto > 25) barColor = 'var(--danger)';
                        else if (dest.tasa_mora_monto > 15) barColor = 'var(--warning)';

                        return (
                          <tr key={i} style={{ cursor: 'default' }}>
                            <td style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'normal', maxWidth: '220px' }}>{dest.destino}</td>
                            <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 12 }}>{formatNumber(dest.total_ops)}</td>
                            <td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 500, fontSize: 12 }}>{formatCurrency(dest.total_monto)}</td>
                            <td>
                              <div className="risk-bar" style={{ justifyContent: 'center' }}>
                                <div className="risk-bar-track" style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, maxWidth: '80px', flex: 1 }}>
                                  <div 
                                    className="risk-bar-fill" 
                                    style={{ 
                                      width: `${Math.min(100, dest.tasa_mora_monto * 2.5)}%`, 
                                      background: barColor, 
                                      height: '100%', 
                                      borderRadius: 3 
                                    }} 
                                  />
                                </div>
                                <span className="risk-bar-value" style={{ fontSize: 11, fontWeight: 700, color: barColor, minWidth: '38px', textAlign: 'right' }}>
                                  {dest.tasa_mora_monto}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Plazo en Cuotas */}
            <div className="card animate-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Mora según Plazo del Crédito (Cuotas)</div>
                  <div className="card-subtitle">Relación entre la cantidad de cuotas pactadas y el índice de mora</div>
                </div>
                <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={extendedStats?.mora_por_cuotas || []} margin={{ left: 10, right: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="rango_cuotas" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={formatNumber} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="total_ops" name="Total Operaciones" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar yAxisId="right" dataKey="tasa_mora_monto" name="Tasa Mora (%)" fill="var(--critical)" radius={[4, 4, 0, 0]} />
                  <Legend verticalAlign="top" height={36} formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calificación de Riesgo, Ingresos y Día de Pago */}
          <div className="chart-grid-three" style={{ marginTop: 24 }}>
            {/* Calificación */}
            <div className="card animate-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Mora por Calificación Interna</div>
                  <div className="card-subtitle">Evaluación de mora según la calificación oficial</div>
                </div>
                <Award size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={extendedStats?.mora_por_calificacion || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="calificacion" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tasa_mora_monto" name="Tasa Mora (%)" fill="var(--critical)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Ingresos Socio */}
            <div className="card animate-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Mora por Nivel de Ingresos</div>
                  <div className="card-subtitle">Comportamiento según el salario reportado por el socio</div>
                </div>
                <DollarSign size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={extendedStats?.mora_por_ingresos || []}>
                  <defs>
                    <linearGradient id="colorIngresosMora" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--warning)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="rango_ingresos" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="tasa_mora_monto" name="Tasa Mora (%)" stroke="var(--warning)" fill="url(#colorIngresosMora)" strokeWidth={2} dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Día de Pago */}
            <div className="card animate-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Mora por Ventana / Día de Pago</div>
                  <div className="card-subtitle">Relación entre el día de cobro mensual y la morosidad</div>
                </div>
                <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={extendedStats?.mora_por_dia_pago || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="dia_pago" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tasa_mora_monto" name="Tasa Mora (%)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

