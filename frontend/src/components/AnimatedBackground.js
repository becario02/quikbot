import React, { useEffect, useRef } from 'react';

// Versión 1: Fluid Waves
const FluidBackground = ({ children }) => {
  return (
    <div className="fluid-background">
      <div className="wave-pattern">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
      {children}
      
      <style>{`
        .fluid-background {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f0f2f5 0%, #f8f9ff 100%);
        }

        .wave-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          opacity: 0.3;
        }

        .wave {
          position: absolute;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, #009de0, #40a9ff);
          opacity: 0.2;
        }

        .wave1 {
          animation: waveMove 25s infinite linear;
          clip-path: polygon(0 30%, 100% 10%, 100% 100%, 0% 100%);
        }

        .wave2 {
          animation: waveMove 20s infinite linear;
          clip-path: polygon(0 40%, 100% 20%, 100% 100%, 0% 100%);
          opacity: 0.15;
        }

        .wave3 {
          animation: waveMove 15s infinite linear;
          clip-path: polygon(0 50%, 100% 30%, 100% 100%, 0% 100%);
          opacity: 0.1;
        }

        @keyframes waveMove {
          0% { transform: translate(-50%, 0) rotate(0deg); }
          100% { transform: translate(-50%, 0) rotate(360deg); }
        }

        .fluid-background > *:not(.wave-pattern) {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

// Versión 2: Interactive Particles
const ParticlesBackground = ({ children }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    contextRef.current = context;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particlesRef.current = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1
      }));
    };

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        // Mover partículas
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Rebotar en los bordes
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        // Interacción con el cursor
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          particle.x -= Math.cos(angle) * 1;
          particle.y -= Math.sin(angle) * 1;
        }

        // Dibujar partícula
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = 'rgba(0, 157, 224, 0.3)';
        context.fill();
      });

      // Dibujar conexiones
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            context.beginPath();
            context.moveTo(p1.x, p1.y);
            context.lineTo(p2.x, p2.y);
            context.strokeStyle = `rgba(0, 157, 224, ${0.2 * (1 - distance / 100)})`;
            context.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="particles-background">
      <canvas ref={canvasRef} className="particles-canvas" />
      {children}
      
      <style>{`
        .particles-background {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f0f2f5 0%, #f8f9ff 100%);
        }

        .particles-canvas {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
        }

        .particles-background > *:not(.particles-canvas) {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

// Versión 3: Geometric Patterns
const GeometricBackground = ({ children }) => {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const container = document.querySelector('.geometric-background');
      const rect = container.getBoundingClientRect();
      
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      };

      container.style.setProperty('--mouse-x', `${mouseRef.current.x}%`);
      container.style.setProperty('--mouse-y', `${mouseRef.current.y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="geometric-background">
      <div className="geometric-pattern">
        {Array.from({ length: 36 }, (_, i) => (
          <div key={i} className="geometric-shape" />
        ))}
      </div>
      {children}
      
      <style>{`
        .geometric-background {
          --mouse-x: 50%;
          --mouse-y: 50%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f0f2f5 0%, #f8f9ff 100%);
        }

        .geometric-pattern {
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          transform: rotate(15deg) scale(1.5);
          z-index: 0;
          opacity: 0.4;
        }

        .geometric-shape {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 100%;
          background: linear-gradient(
            45deg,
            rgba(0, 157, 224, 0.1),
            rgba(64, 169, 255, 0.1)
          );
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          transform-origin: center;
          animation: rotateShape 20s linear infinite;
        }

        .geometric-shape::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at var(--mouse-x) var(--mouse-y),
            rgba(64, 169, 255, 0.2),
            transparent 50%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .geometric-background:hover .geometric-shape::before {
          opacity: 1;
        }

        .geometric-shape:nth-child(3n) {
          animation-duration: 25s;
          animation-direction: reverse;
        }

        .geometric-shape:nth-child(5n) {
          animation-duration: 30s;
        }

        @keyframes rotateShape {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .geometric-background > *:not(.geometric-pattern) {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export { FluidBackground, ParticlesBackground, GeometricBackground };