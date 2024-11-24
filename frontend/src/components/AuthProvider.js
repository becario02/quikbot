import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
      } else {
        alert(`Solo se permite el acceso con correos de Advan Pro (${DOMAIN_RESTRICTION})`);
        // Limpiar el token si el dominio no es válido
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
    } catch (error) {
      console.error('Error durante la autenticación:', error);
      alert('Error al iniciar sesión. Por favor, intenta de nuevo.');
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
      alert('Error al iniciar sesión. Por favor, intenta de nuevo.');
    },
  });

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setUser(null);
    navigate('/', { replace: true });
  };

  const getGoogleToken = () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  };

  const contextValue = {
    user,
    login,
    logout,
    loading,
    hasAdminAccess: user?.hasAdminAccess ?? false,
    getGoogleToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
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