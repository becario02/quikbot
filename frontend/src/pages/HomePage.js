import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { ArrowRight, LogOut } from 'lucide-react';
import { GeometricBackground } from '../components/AnimatedBackground';
import HeroButtons from '../components/HeroButtons';
import AboutSection from '../components/AboutSection';
import FeaturesSection from '../components/FeaturesSection';
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
            Quikbot Panel
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

  return (
    <div className="landing-container" key={key}>
      {/* Header */}
      <header className="landing-header">
        <div className="logo">
          <img src={advanLogo} alt="Advan Logo" />
        </div>
        <nav className="landing-nav">
          {user ? <UserProfile /> : <LoginButton />}
        </nav>
      </header>

      {/* Hero Section */}
      <GeometricBackground>
        <section className="hero-section">
          <div className="hero-content">
            <h1>QuikBot: El Asistente Virtual de Advan Pro</h1>
            <p>La plataforma de asistencia técnica de Advan Pro que unifica documentación, tickets y conocimiento empresarial en un solo asistente virtual</p>
            <HeroButtons
              user={user}
              hasAdminAccess={hasAdminAccess}
              navigate={navigate}
              login={login}
            />
          </div>
          <div className="hero-visual">
            <img src={robotHero} alt="Robot Assistant" className="robot-image" />
            <div className="hero-image">
              <div class="chat-preview">
                <div class="chat-message-container">
                  <div class="chat-message-group">
                    <div class="bot-avatar">
                      <svg viewBox="180 50 270 270" xmlns="http://www.w3.org/2000/svg">
                        <g>
                          <path class="st4" d="M429.8,164.5c0-62.8-50.9-113.8-113.8-113.8c-28.8,0-55,10.7-75,28.3c54.4,48.5,121.5,86.4,187,105.6 C429.2,178,429.8,171.3,429.8,164.5z" />
                          <path class="st4" d="M202.9,176.2c5.9,57.3,54.3,102.1,113.2,102.1c41.5,0,77.7-22.2,97.6-55.3c-1.6,0-3.2,0-4.9,0 C369.9,223,287.3,217.4,202.9,176.2z" />
                          <g>
                            <path class="st3" d="M435.1,195.5c-3-0.8-5.9-1.7-8.9-2.6c0-0.1,0-0.2,0.1-0.2c-11.6-3.4-23.2-7.3-34.9-11.8 c-0.3-0.1-0.6-0.2-0.9-0.4c-3.5-1.4-6.9-2.7-10.4-4.2c-51.7-21.6-102.4-53.4-145.2-91.7c-2.1-1.9-4.2-3.8-6.3-5.8 c-20,18.7-35.4,58.4-36.5,79.9c-0.1,1.1-0.1,2.2,0,3.3c0.6,0.3,1.1,0.6,1.7,0.9l0.2-0.5c2.7,1.5,5.5,2.8,8.2,4.2 c92.3,46.3,183.2,48.8,215.9,47.9c5.8-0.2,9.8-0.4,11.7-0.6l0,0.1c0.1,0,0.2,0,0.3,0c0.2-0.5,0.5-1.2,0.8-1.9 C432.6,208.1,434.8,201,435.1,195.5L435.1,195.5z" />
                          </g>
                        </g>
                      </svg>
                    </div>
                    <div class="chat-message">¡Hola! 👋 Soy QuikBot, ¿en qué puedo ayudarte?</div>
                  </div>
                  <div class="chat-message user">Necesito saber el estado del reporte #4521</div>
                  <div class="chat-message-group">
                    <div class="bot-avatar">
                      <svg viewBox="180 50 270 270" xmlns="http://www.w3.org/2000/svg">
                        <g>
                          <path class="st4" d="M429.8,164.5c0-62.8-50.9-113.8-113.8-113.8c-28.8,0-55,10.7-75,28.3c54.4,48.5,121.5,86.4,187,105.6 C429.2,178,429.8,171.3,429.8,164.5z" />
                          <path class="st4" d="M202.9,176.2c5.9,57.3,54.3,102.1,113.2,102.1c41.5,0,77.7-22.2,97.6-55.3c-1.6,0-3.2,0-4.9,0 C369.9,223,287.3,217.4,202.9,176.2z" />
                          <g>
                            <path class="st3" d="M435.1,195.5c-3-0.8-5.9-1.7-8.9-2.6c0-0.1,0-0.2,0.1-0.2c-11.6-3.4-23.2-7.3-34.9-11.8 c-0.3-0.1-0.6-0.2-0.9-0.4c-3.5-1.4-6.9-2.7-10.4-4.2c-51.7-21.6-102.4-53.4-145.2-91.7c-2.1-1.9-4.2-3.8-6.3-5.8 c-20,18.7-35.4,58.4-36.5,79.9c-0.1,1.1-0.1,2.2,0,3.3c0.6,0.3,1.1,0.6,1.7,0.9l0.2-0.5c2.7,1.5,5.5,2.8,8.2,4.2 c92.3,46.3,183.2,48.8,215.9,47.9c5.8-0.2,9.8-0.4,11.7-0.6l0,0.1c0.1,0,0.2,0,0.3,0c0.2-0.5,0.5-1.2,0.8-1.9 C432.6,208.1,434.8,201,435.1,195.5L435.1,195.5z" />
                          </g>
                        </g>
                      </svg>
                    </div>
                    <div class="chat-message">El reporte #4521 está en fase de "Validación" ✅. ¿Deseas ver los últimos comentarios...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </GeometricBackground>

      <AboutSection />

      <FeaturesSection />

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