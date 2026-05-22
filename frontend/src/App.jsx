import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Dashboard from './components/Dashboard';
import SociosList from './components/SociosList';
import SocioProfile from './components/SocioProfile';
import AlertsPanel from './components/AlertsPanel';
import ApiOfflineBanner from './components/ApiOfflineBanner';
import { checkApiHealth } from './services/api';

function App() {
  const [apiOk, setApiOk] = useState(null);

  useEffect(() => {
    const probe = () =>
      checkApiHealth()
        .then(() => setApiOk(true))
        .catch(() => setApiOk(false));
    probe();
    const id = setInterval(probe, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <Router>
      <div className="app-shell">
        <AppHeader />
        <main className="main-content">
          {apiOk === false && <ApiOfflineBanner />}
          {apiOk === null && (
            <div className="loading-container" style={{ minHeight: 120 }}>
              <div className="spinner" />
              <div className="loading-text">Comprobando conexión con el servidor…</div>
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--coop-texto-secundario)', maxWidth: 520, textAlign: 'center' }}>
                La primera vez el backend puede tardar varios minutos generando datos. Ejecuta{' '}
                <code>.\venv\Scripts\python.exe start.py</code> dentro de <code>backend</code>.
              </p>
            </div>
          )}
          {apiOk === true && (
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/socios" element={<SociosList />} />
              <Route path="/socios/:id" element={<SocioProfile />} />
              <Route path="/alertas" element={<AlertsPanel />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
