import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { FileText, ChevronLeft, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Gestión del Chatbot</h1>
          <hr></hr>
        </div>
        <nav>
          <ul className="sidebar-nav">
            <li><NavLink to="/dashboard/files"><FileText size={18} /> Files</NavLink></li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <div className="top-bar">
          <Link to="/" className="back-home">
            <ChevronLeft size={20} />
            <span>Volver al inicio</span>
          </Link>
          <div className="user-profile-dashboard">
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <img 
              src={user?.picture} 
              alt={user?.name}
              className="user-avatar"
            />
            <button onClick={logout} className="logout-button" title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;