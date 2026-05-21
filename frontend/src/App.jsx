import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SociosList from './components/SociosList';
import SocioProfile from './components/SocioProfile';
import AlertsPanel from './components/AlertsPanel';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <AppHeader />
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/socios" element={<SociosList />} />
            <Route path="/socios/:id" element={<SocioProfile />} />
            <Route path="/alertas" element={<AlertsPanel />} />
          </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
