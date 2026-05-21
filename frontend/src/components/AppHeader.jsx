import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle } from 'lucide-react';
import { BrandLockup } from './BrandLogo';

export default function AppHeader() {
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
        </NavLink>
      </nav>
    </header>
  );
}
