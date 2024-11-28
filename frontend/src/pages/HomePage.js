import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { MessageSquare, Bot, Brain, Shield, ArrowRight, LogOut } from 'lucide-react';
import robotHero from '../assets/images/robot-hero.png';
import advanLogo from '../assets/svg/advan-logo.svg';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, login, logout, hasAdminAccess } = useAuth();
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [user]);

  const UserProfile = () => (
    <div className="user-profile">
      <img 
        src={user.picture} 
        alt={user.name}
        className="user-avatar"
      />
      <div className="user-info">
        <span className="user-name">{user.name}</span>
        <span className="user-email">{user.email}</span>
      </div>
      <div className="user-actions">
        {hasAdminAccess && (
          <button onClick={() => navigate('/dashboard')} className="dashboard-link">
            Dashboard
          </button>
        )}
        <button onClick={logout} className="logout-button">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );

  const LoginButton = () => (
    <button onClick={() => login()} className="login-button">
      Iniciar sesión con Google
    </button>
  );

  const features = [
    {
      icon: <Bot size={24} />,
      title: "IA Avanzada",
      description: "Respuestas precisas y contextuales gracias a nuestra IA de última generación"
    },
    {
      icon: <Brain size={24} />,
      title: "Aprendizaje Continuo",
      description: "Mejora constante basada en las interacciones con los usuarios"
    },
    {
      icon: <Shield size={24} />,
      title: "Seguridad Garantizada",
      description: "Protección de datos y cifrado de extremo a extremo"
    },
    {
      icon: <MessageSquare size={24} />,
      title: "Soporte 24/7",
      description: "Asistencia ininterrumpida para tus usuarios"
    }
  ];

  return (
    <div className="landing-container" key={key}>
      {/* Header */}
      <header className="landing-header">
        <div className="logo">  
          <img src={advanLogo} alt="Advan Logo"/>
        </div>
        <nav className="landing-nav">
          {user ? <UserProfile /> : <LoginButton />}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Revoluciona tu Atención al Cliente con IA</h1>
          <p>Chatbot inteligente que aprende y se adapta a las necesidades de tu negocio</p>
          <div className="hero-buttons">
            {user ? (
              hasAdminAccess && (
                <button 
                  className="primary-button"
                  onClick={() => navigate('/dashboard')}
                >
                  Ir al Dashboard <ArrowRight size={20} />
                </button>
              )
            ) : (
              <button 
                className="primary-button"
                onClick={() => login()}
              >
                Iniciar con Google <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <img src={robotHero} alt="Robot Assistant" className="robot-image" />
          <div className="hero-image">
            <div className="chat-preview">
              <div className="chat-message-container">
                <div className="chat-message">¡Hola! ¿En qué puedo ayudarte?</div>
                <div className="chat-message user">Necesito información sobre sus servicios</div>
                <div className="chat-message">Con gusto. Ofrecemos soluciones personalizadas...</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features-section">
        <h2>Características Principales</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>¿Listo para Empezar?</h2>
        <p>Únete a las empresas que ya están mejorando su atención al cliente</p>
        {user ? (
          hasAdminAccess && (
            <button 
              className="primary-button" 
              style={{ margin: '0 auto' }}
              onClick={() => navigate('/dashboard')}
            >
              Ir al Dashboard <ArrowRight size={20} />
            </button>
          )
        ) : (
          <button 
            className="primary-button" 
            style={{ margin: '0 auto' }}
            onClick={() => login()}
          >
            Iniciar con Google <ArrowRight size={20} />
          </button>
        )}
      </section>
    </div>
  );
};

export default HomePage;