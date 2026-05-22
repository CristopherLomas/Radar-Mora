import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, AlertTriangle } from 'lucide-react';
import { BrandLockup } from './BrandLogo';
import { alertsAPI } from '../services/api';

export default function AppHeader() {
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    alertsAPI.getAll()
      .then((data) => {
        const total = data && !Array.isArray(data) && data.total_counts
          ? (data.total_counts.alta + data.total_counts.media + data.total_counts.baja)
          : (Array.isArray(data) ? data.length : (data?.alerts || []).length);
        setAlertCount(total);
      })
      .catch(() => setAlertCount(0));
  }, [location.pathname]);

  return (
    <header className="app-header">
      <div className="app-header-top">
        <BrandLockup variant="header" />
      </div>

      <nav className="app-header-nav">
        <NavLink to="/" end className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          Panel de Riesgo
        </NavLink>
        <NavLink to="/socios" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
          <Users size={18} />
          Perfil del Socio
        </NavLink>
        <NavLink to="/alertas" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
          <AlertTriangle size={18} />
          Alertas
          {alertCount > 0 && <span className="header-nav-badge">{alertCount}</span>}
        </NavLink>
      </nav>
    </header>
  );
}
