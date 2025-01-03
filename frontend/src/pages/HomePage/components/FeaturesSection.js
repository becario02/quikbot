import React, { useEffect, useRef } from 'react';
import { Mic, ThumbsUp, Files, Map } from 'lucide-react';

const FeaturesSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const features = [
    {
      icon: <Mic />,
      title: "Control por Voz",
      description: "Interactúa con el asistente mediante comandos de voz, permitiendo realizar consultas y obtener respuestas de forma natural y manos libres.",
      color: "#009de0"
    },
    {
      icon: <ThumbsUp />,
      title: "Feedback Inteligente",
      description: "Sistema de retroalimentación que aprende de las interacciones para mejorar constantemente la precisión y calidad de las respuestas.",
      color: "#00b8a9"
    },
    {
      icon: <Files />,
      title: "Soporte Multi-formato",
      description: "Visualización integrada de PDFs, documentos y presentaciones directamente en el chat, sin necesidad de aplicaciones externas.",
      color: "#5b7fff"
    },
    {
      icon: <Map />,
      title: "Mapas Interactivos",
      description: "Capacidad de mostrar ubicaciones y mapas interactivos cuando la consulta involucra información geográfica o direcciones.",
      color: "#ff7eb6"
    }
  ];

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.3
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    cardsRef.current.forEach(card => {
      if (card) {
        observer.observe(card);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="features-section" ref={sectionRef}>
      <div className="features-header">
        <span className="section-label">Características</span>
        <h2>Interacción Avanzada</h2>
        <p className="section-description">
          Descubre las múltiples formas de interactuar con QuikBot, diseñadas para hacer tu experiencia más natural y eficiente.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="feature-card"
            ref={el => cardsRef.current[index] = el}
          >
            <div className="feature-icon-wrapper" style={{ '--feature-color': feature.color }}>
              {React.cloneElement(feature.icon, {
                size: 24,
                className: 'feature-icon'
              })}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <div className="feature-background"></div>
          </div>
        ))}
      </div>

      <style>{`
        .features-section {
          padding: 80px 80px;
          background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .features-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .features-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 60px;
        }

        .section-label {
          display: inline-block;
          padding: 8px 16px;
          background: var(--primary-color);
          color: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 24px;
        }

        h2 {
          font-size: 42px;
          font-weight: 700;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-description {
          font-size: 18px;
          line-height: 1.6;
          color: #666;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .feature-card {
          position: relative;
          padding: 40px 30px;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.5s ease;
          z-index: 1;
          opacity: 0;
          transform: translateY(30px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .feature-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }

        .feature-card:hover .feature-background {
          opacity: 0.05;
          transform: translate(-50%, -50%) scale(1);
        }

        .feature-icon-wrapper {
          width: 60px;
          height: 60px;
          background: color-mix(in srgb, var(--feature-color) 15%, white);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          position: relative;
        }

        .feature-icon-wrapper::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, 
            var(--feature-color) 0%, 
            transparent 50%,
            var(--feature-color) 100%
          );
          border-radius: inherit;
          opacity: 0.3;
          z-index: -1;
        }

        .feature-icon {
          color: var(--feature-color);
        }

        .feature-card h3 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1a1a1a;
        }

        .feature-card p {
          font-size: 16px;
          line-height: 1.6;
          color: #666;
          margin: 0;
        }

        .feature-background {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 400px;
          height: 400px;
          background: var(--feature-color);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0;
          transition: all 0.5s ease;
          z-index: -1;
        }

        .features-section::before,
        .features-section::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: var(--primary-color);
          opacity: 0.03;
          z-index: 0;
        }

        .features-section::before {
          top: -100px;
          right: -100px;
        }

        .features-section::after {
          bottom: -100px;
          left: -100px;
        }

        @media (max-width: 1024px) {
          .features-section {
            padding: 60px 40px;
          }

          h2 {
            font-size: 36px;
          }

          .section-description {
            font-size: 16px;
          }

          .features-grid {
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .features-section {
            padding: 40px 20px;
          }

          h2 {
            font-size: 28px;
          }

          .feature-card {
            padding: 30px 20px;
            text-align: center;
          }

          .feature-icon-wrapper {
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;