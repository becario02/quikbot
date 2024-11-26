import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import ToastAlert from './ToastAlert';
import Modal from './Modal';

// Configuraciones
const AUTHORIZED_EMAILS = [
  'becario02@advanpro.com.mx',
  'admin@advanpro.com.mx',
];

const STORAGE_KEYS = {
  USER: 'advan_user',
  TOKEN: 'google_token'
};

const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const DOMAIN_RESTRICTION = '@advanpro.com.mx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Estado para el sistema de alertas
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'info'
  });

  // Función para mostrar alertas
  const showAlert = (message, variant = 'info') => {
    setAlert({
      show: true,
      message,
      variant
    });
  };

  // Función para cerrar la alerta
  const closeAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  const hasAdminAccess = (email) => AUTHORIZED_EMAILS.includes(email);

  const handleLoginSuccess = async (response) => {
    try {
      // Guardar el token de Google
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);

      // Obtener información del usuario
      const userInfo = await fetch(GOOGLE_USER_INFO_URL, {
        headers: { Authorization: `Bearer ${response.access_token}` },
      });
      const userData = await userInfo.json();

      if (userData.email?.endsWith(DOMAIN_RESTRICTION)) {
        const userToSave = {
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
          hasAdminAccess: hasAdminAccess(userData.email)
        };
        
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSave));
        setUser(userToSave);
        showAlert('Inicio de sesión exitoso', 'success');
      } else {
        showAlert(`Solo se permite el acceso con correos de Advan Pro (${DOMAIN_RESTRICTION})`, 'error');
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
    } catch (error) {
      console.error('Error durante la autenticación:', error);
      showAlert('Error al iniciar sesión. Por favor, intenta de nuevo.', 'error');
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  };

  // Verificar autenticación al inicio
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: () => {
      console.error('Error en el inicio de sesión');
      showAlert('Error al iniciar sesión. Por favor, intenta de nuevo.', 'error');
    },
  });

  // Nuevas funciones para manejar el logout con confirmación
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setUser(null);
    showAlert('Sesión cerrada correctamente', 'info');
    setIsLogoutModalOpen(false);
    navigate('/', { replace: true });
  };

  const getGoogleToken = () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  };

  const contextValue = {
    user,
    login,
    logout: handleLogout, // Actualizamos para usar el handleLogout
    loading,
    hasAdminAccess: user?.hasAdminAccess ?? false,
    getGoogleToken,
    showAlert
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {/* Sistema de alertas */}
      <ToastAlert
        isVisible={alert.show}
        message={alert.message}
        variant={alert.variant}
        onClose={closeAlert}
      />
      {/* Modal de confirmación de logout */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Cerrar Sesión"
        description="¿Estás seguro que deseas cerrar la sesión? Necesitarás volver a iniciar sesión para acceder nuevamente."
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        variant="danger"
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthProvider;