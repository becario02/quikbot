import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { Layout, MessageSquare, FileText, Bot, Home, LogOut}
from 'lucide-react';
import { useAuth } from './AuthProvider';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: <Layout size={18} />, path: "/dashboard", exact: true },
    { name: "Feedback", icon: <MessageSquare size={18} />, path: "/dashboard/feedback" },
    { name: "Archivos", icon: <FileText size={18} />, path: "/dashboard/files" },
    { name: "Configuración", icon: <Bot size={18} />, path: "/dashboard/agent-config" },
  ];

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${isInitialLoad ? 'initial-load' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Bot size={24} />
            </div>
            <div className="logo-text">
              <h1>QuikBot</h1>
              <p>Panel de Control</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h2 className="nav-section-title">Menú Principal</h2>
            <ul>
              {menuItems.map((item, index) => (
                <li key={index}>
                  <NavLink 
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) => isActive ? 'active' : ''}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini-profile">
            <img 
              src={user?.picture} 
              alt={user?.name}
              className="user-avatar-small"
            />
            <div className="user-info-small">
              <span className="user-name-small">{user?.name}</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>
          
          <div className="footer-actions">
            <Link to="/" className="footer-button">
              <Home size={18} />
              <span>Inicio</span>
            </Link>
            <button onClick={logout} className="footer-button">
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;