import React from 'react';

const AboutSection = () => {
    const images = [
        'https://news.cornell.edu/sites/default/files/styles/story_thumbnail_xlarge/public/2024-07/robot-1280x720_0.jpg?itok=AF6MakCq',
        'https://empreender.com.br/wp-content/uploads/2024/01/Chatbot-no-e-commerce.jpg',
        'https://t3.ftcdn.net/jpg/09/73/25/16/360_F_973251611_fD9g05i7vPtK81fQrhmfjpwrgzqmgMTI.jpg',
        'https://bpract.com/wp-content/uploads/2023/09/ai.webp'
    ];
    

  return (
    <section className="about-section">
      <div className="about-content">
        <span className="section-labell fade-in">Sobre Nosotros</span>
        <h2 className='slide-up delay-1'>Innovando el Futuro con IA</h2>
        <p className="description slide-up delay-2">
          En QuikBot, nos apasiona aprovechar el poder de la inteligencia artificial para 
          transformar la atención al cliente. Fundados en la creencia de que la IA tiene 
          el potencial de revolucionar las tareas cotidianas, estamos dedicados a desarrollar 
          soluciones de vanguardia que empoderan tanto a individuos como a empresas.
        </p>
        
        <div className="mission-vision">
          <div className="info-card fade-in delay-2">
            <div className="icon-wrapper">
              <div className="icon" />
            </div>
            <h3>Nuestra Misión</h3>
            <p>
              Buscamos hacer que la tecnología avanzada de IA sea accesible y fácil de usar,
              mejorando la experiencia de soporte al cliente.
            </p>
          </div>

          <div className="info-card fade-in delay-3">
            <div className="icon-wrapper">
              <div className="icon" />
            </div>
            <h3>Nuestra Visión</h3>
            <p>
              Visualizamos un mundo donde la IA se integra perfectamente con el ingenio humano,
              creando experiencias de soporte excepcionales.
            </p>
          </div>
        </div>

        <button className="more-details fade-in delay-4">Ver Más Detalles</button>
      </div>

      <div className="collage-container">
        <div className="image-collage">
          {images.map((src, index) => (
            <div key={index} className={`collage-item item-${index}`}>
              <div className="image-frame">
                <img src={src} alt={`QuikBot en acción ${index + 1}`} />
              </div>
            </div>
          ))}
          <div className="decorative-circle circle-1" />
          <div className="decorative-circle circle-2" />
          <div className="decorative-dots" />
        </div>
      </div>

      <style>{`
        .about-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          padding: 80px;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
          position: relative;
          overflow: hidden;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-labell {
          color: var(--primary-color);
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 16px;
          display: block;
        }

        h2 {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 24px;
          background: linear-gradient(135deg, var(--primary-color), #40a9ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .description {
          font-size: 16px;
          line-height: 1.6;
          color: #666;
          margin-bottom: 40px;
        }

        .mission-vision {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }

        .info-card {
          padding: 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-5px);
        }

        .icon-wrapper {
          width: 48px;
          height: 48px;
          background: rgba(0, 157, 224, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .icon {
          width: 24px;
          height: 24px;
          background: var(--primary-color);
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E");
          mask-size: contain;
          mask-repeat: no-repeat;
          mask-position: center;
        }

        .info-card h3 {
          font-size: 20px;
          margin-bottom: 12px;
          color: var(--text-color);
        }

        .info-card p {
          font-size: 14px;
          line-height: 1.6;
          color: #666;
        }

        .more-details {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .more-details:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 157, 224, 0.3);
        }

        /* Nuevo estilo de collage */
        .collage-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-collage {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .collage-item {
          position: absolute;
          transition: all 0.5s ease;
        }

        .image-frame {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.5s ease;
          transform: perspective(1000px);
          line-height: 0;
        }

        .image-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .item-0 {
          width: 45%;
          top: 5%;
          left: 5%;
          transform: rotate(-8deg);
        }

        .item-1 {
          width: 50%;
          top: 15%;
          right: 5%;
          transform: rotate(6deg);
        }

        .item-2 {
          width: 40%;
          bottom: 20%;
          left: 10%;
          transform: rotate(12deg);
        }

        .item-3 {
          width: 45%;
          bottom: 10%;
          right: 15%;
          transform: rotate(-5deg);
        }

        .collage-item:hover .image-frame {
          transform: perspective(1000px) rotateY(0deg) translateZ(20px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

        /* Elementos decorativos */
        .decorative-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          background: var(--primary-color);
        }

        .circle-1 {
          width: 200px;
          height: 200px;
          top: -50px;
          right: -50px;
        }

        .circle-2 {
          width: 150px;
          height: 150px;
          bottom: -30px;
          left: -30px;
        }

        .decorative-dots {
          position: absolute;
          width: 100px;
          height: 100px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-image: radial-gradient(circle, var(--primary-color) 1px, transparent 1px);
          background-size: 15px 15px;
          opacity: 0.2;
        }

        @media (max-width: 1024px) {
          .about-section {
            grid-template-columns: 1fr;
            padding: 40px;
          }

          .collage-container {
            min-height: 400px;
          }

          .item-0 { width: 40%; }
          .item-1 { width: 45%; }
          .item-2 { width: 35%; }
          .item-3 { width: 40%; }
        }

        @media (max-width: 768px) {
          h2 {
            font-size: 28px;
          }

          .mission-vision {
            grid-template-columns: 1fr;
          }

          .collage-container {
            min-height: 300px;
          }
        }

        /* Clases base para animaciones */
        .fade-in {
          opacity: 0;
          animation: fadeIn 0.8s ease forwards;
        }
              
        .slide-up {
          opacity: 0;
          transform: translateY(30px);
          animation: slideUp 0.8s ease forwards;
        }
              
        .scale-in {
          opacity: 0;
          transform: scale(0.9);
          animation: scaleIn 0.8s ease forwards;
        }
              
        /* Retrasos para elementos secuenciales */
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        .delay-3 { animation-delay: 0.6s; }
        .delay-4 { animation-delay: 0.8s; }
              
        /* Animaciones para el collage */
        .collage-item {
          opacity: 0;
          animation: collageItemIn 0.8s ease forwards;
        }
              
        .item-0 { animation-delay: 0.3s; }
        .item-1 { animation-delay: 0.5s; }
        .item-2 { animation-delay: 0.7s; }
        .item-3 { animation-delay: 0.9s; }
              
        .decorative-circle {
          opacity: 0;
          animation: circleIn 1s ease forwards;
        }
              
        .circle-1 { animation-delay: 1s; }
        .circle-2 { animation-delay: 1.2s; }
              
        .decorative-dots {
          opacity: 0;
          animation: fadeIn 1s ease forwards 1.4s;
        }
              
        /* Keyframes */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
              
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
              
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
              
        @keyframes collageItemIn {
          from {
            opacity: 0;
            transform: translateY(50px) rotate(0deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotate(var(--rotation));
          }
        }
              
        @keyframes circleIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 0.1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;