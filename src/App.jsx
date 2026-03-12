import { useState } from 'react'
import Login from './components/Login'
import AdminMenu from './components/AdminMenu'
import CoorAcadMenu from './components/CoorAcadMenu'
import TecnicoMenu from './components/TecnicoMenu'
import EstudianteMenu from './components/EstudianteMenu'
import InstructorMenu from './components/InstructorMenu'
import PseudopilotoMenu from './components/PseudopilotoMenu'
import PWABanner from './components/PWABanner'
import { usePWA } from './hooks/usePWA'
import ChangePasswordModal from './components/ChangePasswordModal'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('role') || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('email') || '');
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || '');

  const [mustChangePassword, setMustChangePassword] = useState(() => localStorage.getItem('mustChangePassword') === 'true');

  const { triggerCacheWarmUp } = usePWA();

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(localStorage.getItem('role') || '');
      setUserEmail(localStorage.getItem('email') || '');
      setUserId(localStorage.getItem('userId') || '');
      setMustChangePassword(localStorage.getItem('mustChangePassword') === 'true');
      // ── Pre-populate SW cache immediately after login ──
      triggerCacheWarmUp();
    } else {
      setIsAuthenticated(false);
      setUserRole('');
      setUserEmail('');
      setMustChangePassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    localStorage.removeItem('mustChangePassword');
    setIsAuthenticated(false);
    setMustChangePassword(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={checkAuth} />;
  }

  const renderDashboard = () => {
    switch (userRole) {
      case 'ADMINISTRADOR':
        return <AdminMenu />;
      case 'COORACAD':
        return <CoorAcadMenu />;
      case 'TECNICO':
        return <TecnicoMenu />;
      case 'ESTUDIANTE':
        return <EstudianteMenu userId={userId} />;
      case 'INSTRUCTOR':
        return <InstructorMenu userId={userId} />;
      case 'PSEUDOPILOTO':
        return <PseudopilotoMenu userId={userId} />;
      default:
        return (
          <main className="main-content">
            <h1>Dashboard</h1>
            <div className="card dashboard-card">
              <p>Welcome to SimLogicFlow! You are successfully authenticated.</p>
              <p>Your current role determines your access level to manage users, courses, and schedules.</p>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="app-container">
      {/* PWA Banners: offline, update, install */}
      <PWABanner />

      <nav className="navbar">
        <div className="nav-brand">SimLogicFlow</div>
        <div className="nav-user">
          <span className="user-email">{userEmail}</span>
          <span className="user-role badge">{userRole}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {renderDashboard()}

      {mustChangePassword && (
        <ChangePasswordModal
          userId={userId}
          onPasswordChanged={() => {
            setMustChangePassword(false);
            checkAuth();
          }}
        />
      )}
    </div>
  )
}

export default App
