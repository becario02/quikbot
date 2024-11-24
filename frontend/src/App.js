import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider        } from './components/AuthProvider'
import ProtectedRoute          from './components/ProtectedRoute'
import HomePage        from './pages/HomePage'
import DashboardLayout from './components/DashboardLayout'
import Files           from './pages/Files'
import ChatbotWrapper  from './ChatbotWrapper'

// Constantes
const GOOGLE_CLIENT_ID = "869195614443-tu9nh2p59rq1v3hc6vkc3cjot284sl1u.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Ruta principal */}
            <Route path="/" element={<HomePage />} />

            {/* Rutas del dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireAdmin>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Redirigir /dashboard a /dashboard/files */}
              <Route index element={<Navigate to="/dashboard/files" replace />} />
              {/* Ruta de Files */}
              <Route path="files" element={<Files />} />
            </Route>

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Chatbot global */}
          <ProtectedRoute>
            <ChatbotWrapper />
          </ProtectedRoute>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;