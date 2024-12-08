import React from 'react';
import { Bot, ArrowRight } from 'lucide-react';

const HeroButtons = ({ user, hasAdminAccess, navigate, login }) => {
  const openChat = () => {
    const chatComponent = document.querySelector('chatbot-component');
    if (chatComponent && !chatComponent.isOpen) {
      chatComponent.toggleChat();
    }
  };

  return (
    <div className="hero-buttons">
      {user ? (
        // Usuario autenticado
        <>
          <button 
            className="primary-button"
            onClick={openChat}
          >
            Iniciar Chat <Bot size={20} />
          </button>
          {hasAdminAccess && (
            <button 
              className="secondary-button"
              onClick={() => navigate('/dashboard')}
            >
              QuikBot Panel <ArrowRight size={20} />
            </button>
          )}
        </>
      ) : (
        // Usuario no autenticado
        <button 
          className="secondary-button"
          onClick={() => login()}
        >
          Iniciar con Google <ArrowRight size={20} />
        </button>
      )}

      <style>{`

        .hero-buttons {
          display: flex;
          gap: 16px;
          transform: translateY(20px);
          opacity: 0;
          animation: slideUpButtons 0.8s ease forwards 1.2s;
        }
            
        .primary-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: var(--primary-color);
          color: white;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0, 157, 224, 0.2);
        }
            
        .primary-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg,
              transparent 0%,
              rgba(255, 255, 255, 0.2) 50%,
              transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
            
        .primary-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 157, 224, 0.3);
        }
            
        .primary-button:hover::before {
          transform: translateX(100%);
        }
            
        .secondary-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background-color: white;
          color: var(--primary-color);
          border: 1px solid rgba(0, 157, 224, 0.2);
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 157, 224, 0.05);
        }
            
        .secondary-button:hover {
          background-color: white;
          border-color: var(--primary-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 157, 224, 0.1);
        }
            
        .secondary-button svg,
        .primary-button svg {
          transition: transform 0.3s ease;
        }
            
        .secondary-button:hover svg,
        .primary-button:hover svg {
          transform: scale(1.1);
        }

      `}</style>
    </div>
  );
};

export default HeroButtons;