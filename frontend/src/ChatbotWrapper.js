import React, { useRef, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './components/AuthProvider';

import './chatbot-component.js';

const ChatbotWrapper = () => {
  const chatbotRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [hasShownGreeting, setHasShownGreeting] = useState(false);
  const { user, getGoogleToken } = useAuth();

  // Inicialización única
  useEffect(() => {
    setSessionId(uuidv4());

    if (!customElements.get('chatbot-component')) {
      import('./chatbot-component.js');
    }
  }, []);

  // Memoizar el handler de mensajes
  const handleMessage = useCallback(async (message) => {
    try {
      const defaultToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ik1BUlJPUVVJTiIsImV4cCI6MTczMjA0NjkxM30.E6ttnl_pQFdPFQiCF4NWaW0qVpTNNb7sYtskNWkYLPU";
      
      let authToken;
      let tokenType;
      
      if (user?.hasAdminAccess) {
        authToken = getGoogleToken();
        tokenType = 'Google';
      } else {
        authToken = defaultToken;
        tokenType = 'Bearer';
      }

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${tokenType} ${authToken}`
        },
        body: JSON.stringify({ 
          message, 
          session_id: sessionId,
          is_support: user?.hasAdminAccess || false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail);
      }

      const data = await response.json();
      chatbotRef.current?.addBotResponse(data.response);
    } catch (error) {
      console.error('Error al enviar mensaje al servidor:', error);
      // Usar el mensaje de error personalizado que viene del backend
      const errorMessage = error.message || 'Lo siento, ha ocurrido un error al procesar tu mensaje.';
      chatbotRef.current?.addBotResponse(errorMessage);
    }
  }, [sessionId, user, getGoogleToken]);

  // Configuración de event listeners y saludo inicial
  useEffect(() => {
    const chatbotElement = chatbotRef.current;
    if (!chatbotElement || !sessionId) return;

    // Función wrapper para el event listener
    const messageListener = (event) => handleMessage(event.detail);
    
    // Agregar el event listener
    chatbotElement.addEventListener('message-sent', messageListener);

    // Mostrar saludo inicial solo una vez
    if (!hasShownGreeting) {
      const initialGreeting = user?.hasAdminAccess
        ? `¡Hola ${user.name}! 👋\n\nComo miembro del equipo de soporte, tienes acceso completo a toda la información del sistema. ¿En qué puedo ayudarte?`
        : `¡Hola! 👋\n\nPuedo ayudarte con consultas sobre nuestro sistema de gestión de flotas, explicarte cómo usar nuestras herramientas de planificación de rutas y asistirte con problemas de facturación.`;

      chatbotElement.addBotResponse(initialGreeting);
      setHasShownGreeting(true);
    }

    // Cleanup
    return () => {
      chatbotElement.removeEventListener('message-sent', messageListener);
    };
  }, [sessionId, handleMessage, user, hasShownGreeting]);

  return <chatbot-component ref={chatbotRef} />;
};

export default ChatbotWrapper;