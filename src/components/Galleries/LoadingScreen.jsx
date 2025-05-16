import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';

// Fuentes personalizadas
const MyriadFontStyle = styled('style')({
  '@font-face': {
    fontFamily: 'MYRIADPRO-BOLD',
    src: 'url("/fonts/MYRIADPRO-BOLD.OTF") format("opentype")',
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  }
});

const MediumFontStyle = styled('style')({
  '@font-face': {
    fontFamily: 'Medium OTF',
    src: 'url("/fonts/Medium.otf") format("opentype")',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  }
});

// Estilos para la pantalla de carga
const LoadingScreenContainer = styled(Box)(({ theme, backgroundColor }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: backgroundColor || '#e6e6e6',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  transition: 'opacity 0.5s ease-out',
  overflow: 'hidden',
}));

// Título con estilo renovado
const Title = styled(Typography)(({ theme, fontFamily }) => ({
  fontFamily: fontFamily || '"MYRIADPRO-BOLD", sans-serif',
  fontSize: '80px', // Más grande que antes
  fontWeight: 'bold',
  color: '#000000',
  letterSpacing: '3px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  textTransform: 'uppercase',
}));

const Year = styled(Typography)(({ theme, fontFamily }) => ({
  fontFamily: fontFamily || '"MYRIADPRO-BOLD", sans-serif',
  fontSize: '40px', // Mantenido más pequeño para contraste
  fontWeight: 'bold',
  color: '#000000',
  letterSpacing: '2px',
  marginTop: '8px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  marginBottom: '40px',
}));

// Barra de progreso más cuadrada y minimalista
const ProgressBarContainer = styled(Box)({
  width: '300px',
  height: '3px', // Más fina
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  borderRadius: '0', // Más cuadrada
  overflow: 'hidden',
  position: 'relative',
  marginBottom: '20px',
});

const ProgressBarFill = styled(Box)(({ progress }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: `${progress}%`,
  height: '100%',
  backgroundColor: '#000000',
  borderRadius: '0', // Más cuadrada
  transition: 'width 0.2s ease-out',
}));

/**
 * Componente de pantalla de carga reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título a mostrar (ej: "Plata")
 * @param {string} props.year - Año a mostrar (ej: "2024")
 * @param {number} props.progress - Progreso actual (0-100)
 * @param {Function} props.onComplete - Función a ejecutar cuando termina la carga
 * @param {React.RefObject} props.screenRef - Referencia externa opcional
 * @param {string} props.backgroundColor - Color de fondo 
 * @param {string} props.titleColor - Color del título
 * @param {string} props.yearColor - Color del año
 * @param {string} props.progressColor - Color de la barra de progreso
 * @param {string} props.fontFamily - Fuente personalizada
 */
const LoadingScreen = ({
  title,
  year,
  progress,
  onComplete,
  screenRef,
  backgroundColor,
  titleColor,
  yearColor,
  progressColor,
  fontFamily,
}) => {
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const containerRef = useRef(null);
  const loaderRef = useRef(null); // Para el animador personalizado
  
  // Aplicar referencias externas si se proporcionan
  const actualScreenRef = screenRef || containerRef;
  
  // Efectos de animación al montar
  useEffect(() => {
    if (titleRef.current && yearRef.current) {
      gsap.to(titleRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        delay: 0.3,
      });
      
      gsap.to(yearRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        delay: 0.5,
      });
    }
    
    return () => {
      gsap.killTweensOf(titleRef.current);
      gsap.killTweensOf(yearRef.current);
    };
  }, []);
  
  // Efecto cuando el progreso llegue al 100%
  useEffect(() => {
    if (progress >= 100 && onComplete) {
      if (titleRef.current && yearRef.current && actualScreenRef.current) {
        gsap.to([titleRef.current, yearRef.current], {
          y: -100,
          opacity: 0,
          duration: 0.8,
          ease: "power2.in",
          stagger: 0.1,
          onComplete: () => {
            gsap.to(actualScreenRef.current, {
              opacity: 0,
              duration: 0.5,
              delay: 0.2,
              onComplete
            });
          }
        });
      } else {
        setTimeout(onComplete, 500);
      }
    }
  }, [progress, onComplete]);

  return (
    <>
      <MyriadFontStyle />
      <MediumFontStyle />
      <LoadingScreenContainer 
        ref={actualScreenRef}
        sx={{ backgroundColor: backgroundColor || '#e6e6e6' }}
      >
        <Title 
          ref={titleRef}
          sx={{ 
            color: titleColor || '#000000',
            fontFamily: fontFamily || '"MYRIADPRO-BOLD", sans-serif'
          }}
        >
          {title}
        </Title>
        
        <Year 
          ref={yearRef}
          sx={{ 
            color: yearColor || '#000000',
            fontFamily: fontFamily || '"MYRIADPRO-BOLD", sans-serif'
          }}
        >
          {year}
        </Year>
        
        {/* Renderizar el loader personalizado si se proporciona, si no usar la barra de progreso por defecto */}
        {props.customLoader ? (
          <Box ref={loaderRef}>
            {props.customLoader(progress)}
          </Box>
        ) : (
          <ProgressBarContainer>
            <ProgressBarFill 
              progress={progress} 
              sx={{ 
                backgroundColor: progressColor || '#000000',
              }}
            />
          </ProgressBarContainer>
        )}
      </LoadingScreenContainer>
    </>
  );
};

export default LoadingScreen;
