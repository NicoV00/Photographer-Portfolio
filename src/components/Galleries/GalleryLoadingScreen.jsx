import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';

// Custom font loading - Helvetica Bold
const HelveticaBoldFontStyle = styled('style')({
  '@font-face': {
    fontFamily: 'Helvetica-Bold',
    src: 'url("/fonts/Helvetica-Bold.ttf") format("truetype")',
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  }
});

// Loading screen
const LoadingScreen = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  transition: 'opacity 0.5s ease-out',
  overflow: 'hidden',
}));

// Título con la fuente Helvetica-Bold - SIN UPPERCASE
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Helvetica-Bold", "Arial Black", sans-serif',
  fontSize: '30px', // Reducido de 60px a 45px
  fontWeight: 'bold',
  letterSpacing: '2px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  textAlign: 'center',
  // Removido textTransform: 'uppercase'
  [theme.breakpoints.down('sm')]: {
    fontSize: '38px', // Ajustado proporcionalmente
    letterSpacing: '1.5px',
  },
}));

// Year con la misma fuente Helvetica-Bold pero más pequeño
const LoadingYear = styled(Box)(({ theme }) => ({
  fontFamily: '"Helvetica-Bold", "Arial Black", sans-serif',
  fontSize: '20px', // Reducido de 40px a 32px
  fontWeight: 'bold',
  letterSpacing: '2px',
  marginTop: '8px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  marginBottom: '40px',
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    fontSize: '28px', // Ajustado proporcionalmente
    letterSpacing: '1.5px',
  },
}));

// Barra de progreso minimalista
const ProgressBarContainer = styled(Box)({
  width: '150px',
  height: '2px',
  backgroundColor: 'rgba(128, 128, 128, 0.3)', // Color más neutro para el fondo
  borderRadius: '0',
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
  borderRadius: '0',
  transition: 'width 0.2s ease-out',
  // backgroundColor se aplicará via sx prop
}));

const GalleryLoadingScreen = ({ 
  title, 
  year, 
  loading, 
  loadProgress = 0,
  onAnimationComplete,
  backgroundColor = '#e6e6e6',
  textColor = '#000000',
  progressColor = '#000000'
}) => {
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);

  // Loading screen title and year animation effect
  useEffect(() => {
    if (!loading) return;
    
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
  }, [loading]);
  
  // Handle loading complete animation
  useEffect(() => {
    if (loadProgress >= 100 && loading) {
      if (titleRef.current && yearRef.current && loadingScreenRef.current) {
        gsap.to([titleRef.current, yearRef.current], {
          y: -100,
          opacity: 0,
          duration: 0.8,
          ease: "power2.in",
          stagger: 0.1,
          onComplete: () => {
            gsap.to(loadingScreenRef.current, {
              opacity: 0,
              duration: 0.5,
              delay: 0.2,
              onComplete: onAnimationComplete
            });
          }
        });
      } else {
        setTimeout(onAnimationComplete, 500);
      }
    }
  }, [loadProgress, loading, onAnimationComplete]);

  if (!loading) return null;

  return (
    <>
      <HelveticaBoldFontStyle />
      
      <LoadingScreen 
        ref={loadingScreenRef}
        sx={{ backgroundColor }} // Usa el color de fondo pasado como prop
      >
        <LoadingTitle 
          ref={titleRef}
          sx={{ color: textColor }} // Usa el color de texto pasado como prop
        >
          {title} {/* Mantiene el texto como se pasa, sin uppercase */}
        </LoadingTitle>
        
        <LoadingYear 
          ref={yearRef}
          sx={{ color: textColor }} // Usa el color de texto pasado como prop
        >
          {year}
        </LoadingYear>
        
        <ProgressBarContainer>
          <ProgressBarFill 
            progress={loadProgress}
            sx={{ backgroundColor: progressColor }} // Usa el color de progreso pasado como prop
          />
        </ProgressBarContainer>
      </LoadingScreen>
    </>
  );
};

export default GalleryLoadingScreen;
