import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider        } from './components/AuthProvider'
import ProtectedRoute          from './components/ProtectedRoute'
import HomePage        from './pages/HomePage'
import DashboardLayout from './components/DashboardLayout'
import Feedback        from './pages/Feedback'
import Files           from './pages/Files'
import AgentConfig     from './pages/AgentConfig'
import ChatbotWrapper  from './ChatbotWrapper'


function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
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
              {/* Rutas existentes */}
              <Route path="feedback" element={<Feedback />} />
              <Route path="files" element={<Files />} />
              <Route path="agent-config" element={<AgentConfig />} />
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