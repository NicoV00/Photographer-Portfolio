import React, { useEffect, useRef, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';

const MobileComingSoon = () => {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    // Activar animación después de un pequeño delay
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      overflow: 'hidden'
    }}>
      {/* SVG Filters */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders */}
      <MeshGradient
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
        colors={['#000000', '#1a1a1a', '#ffffff', '#0a0a0a', '#2a2a2a']}
        speed={0.2}
        backgroundColor="#000000"
      />
      
      <MeshGradient
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.4
        }}
        colors={['#000000', '#ffffff', '#333333', '#000000']}
        speed={0.15}
        wireframe={true}
        backgroundColor="transparent"
      />


      
      {/* Contenido principal */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          {/* Logo/Nombre */}
          <h1 style={{
            fontFamily: 'Helvetica-Bold, Helvetica, Arial, sans-serif',
            fontSize: 'clamp(32px, 8vw, 48px)',
            fontWeight: 'bold',
            letterSpacing: '-1px',
            marginBottom: '12px',
            color: '#ffffff',
            textTransform: 'lowercase',
            textShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
            animation: 'fadeInUp 1s ease-out',
            animationFillMode: 'both'
          }}>
            enzo cimillo
          </h1>
          
          {/* Subtítulo */}
          <p style={{
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontSize: 'clamp(11px, 2.5vw, 14px)',
            fontWeight: '400',
            letterSpacing: '2px',
            marginBottom: '0',
            color: 'rgba(255, 255, 255, 0.7)',
            textTransform: 'uppercase',
            animation: 'fadeInUp 1s ease-out 0.2s',
            animationFillMode: 'both'
          }}>
            Fashion Photographer
          </p>
          
          {/* Coming Soon */}
          <div style={{
            marginTop: '60px'
          }}>
            <p style={{
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontSize: 'clamp(16px, 4vw, 24px)',
              fontWeight: '600',
              letterSpacing: '3px',
              color: '#ffffff',
              textTransform: 'uppercase',
              animation: 'pulse 2s ease-in-out infinite, fadeInUp 1s ease-out 0.4s',
              animationFillMode: 'both',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
            }}>
              Coming Soon
            </p>
          </div>
          
          {/* Indicador de desktop */}
          <div style={{
            marginTop: '80px',
            width: '100%'
          }}>
            <p style={{
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              animation: 'fadeInUp 1s ease-out 0.6s',
              animationFillMode: 'both'
            }}>
              Best viewed on desktop
            </p>
          </div>
        </div>
      </div>
      
      {/* Estilos de animación */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MobileComingSoon;
