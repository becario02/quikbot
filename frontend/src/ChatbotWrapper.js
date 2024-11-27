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
      const googleToken = getGoogleToken();
      if (!googleToken) {
        throw new Error('No se encontró el token de autenticación');
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Google ${googleToken}`
        },
        body: JSON.stringify({ 
          message, 
          session_id: sessionId,
          is_support: true
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      chatbotRef.current?.addBotResponse(data.response);
    } catch (error) {
      console.error('Error al enviar mensaje al servidor:', error);
      chatbotRef.current?.addBotResponse('Lo siento, ha ocurrido un error al procesar tu mensaje.');
    }
  }, [sessionId, getGoogleToken]);

  // Configuración de event listeners y saludo inicial
  useEffect(() => {
    const chatbotElement = chatbotRef.current;
    if (!chatbotElement || !sessionId) return;

    const messageListener = (event) => handleMessage(event.detail);
    chatbotElement.addEventListener('message-sent', messageListener);

    if (!hasShownGreeting) {
      const initialGreeting = `¡Hola ${user?.name || ''}! 👋\n\nComo miembro del equipo de soporte, tienes acceso completo a toda la información del sistema. ¿En qué puedo ayudarte?`;
      chatbotElement.addBotResponse(initialGreeting);
      setHasShownGreeting(true);
    }

    return () => {
      chatbotElement.removeEventListener('message-sent', messageListener);
    };
  }, [sessionId, handleMessage, user, hasShownGreeting]);

  return <chatbot-component ref={chatbotRef} />;
};

export default ChatbotWrapper;