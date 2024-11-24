import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al inicio
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si se requiere acceso de administrador y el usuario no lo tiene
  if (requireAdmin && !user.hasAdminAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;