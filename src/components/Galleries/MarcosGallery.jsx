'use client';

// Importaciones necesarias
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Box, CircularProgress, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow';
import useSmoothScroll from './useSmoothScroll';
import { getGalleryColors } from '../utils/galleryColors';

// Register GSAP plugins if needed
if (typeof gsap.registerPlugin === 'function') {
  try {
    // Only try to import if in a browser environment
    if (typeof window !== 'undefined') {
      const { CSSPlugin } = require('gsap/CSSPlugin');
      gsap.registerPlugin(CSSPlugin);
    }
  } catch (e) {
    console.warn('GSAP plugin registration failed:', e);
  }
}

// Obtener el tema de colores para esta galería
const galleryTheme = getGalleryColors('marcos');

// FUENTES PERSONALIZADAS - ACTUALIZADO A BOLD
// --------------------------------------
const GlobalStyle = styled('style')({
  '@font-face': {
    fontFamily: 'Suisse Intl Bold',
    src: 'url("/fonts/Suisse_Intl_Bold.ttf") format("truetype")',
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  },
});

// PANTALLA DE CARGA
// --------------------------------------
const LoadingScreen = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: galleryTheme.main, // Using theme main color
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  transition: 'opacity 0.5s ease-out',
  overflow: 'hidden',
  padding: '20px',
}));

// Barra de progreso de scroll
const ScrollProgressBar = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  height: '3px',
  width: '0%',
  backgroundColor: galleryTheme.highlight,
  zIndex: 9999,
  transform: 'translateZ(0)',
  willChange: 'width',
  boxShadow: '0 0 3px rgba(0,0,0,0.2)',
});

// Componentes para pantalla de carga - FUENTE ACTUALIZADA A BOLD
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Suisse Intl Bold", sans-serif',
  fontSize: '45px',
  fontWeight: 'bold',
  color: galleryTheme.text,
  letterSpacing: '2px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  textAlign: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    fontSize: '32px',
    letterSpacing: '1.5px',
  },
}));

const LoadingYear = styled(Box)(({ theme }) => ({
  fontFamily: '"Suisse Intl Bold", sans-serif',
  fontSize: '40px',
  fontWeight: 'bold',
  color: galleryTheme.text,
  letterSpacing: '2px',
  marginTop: '8px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  marginBottom: '40px',
  textAlign: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    fontSize: '28px',
    letterSpacing: '1.5px',
    marginTop: '5px',
    marginBottom: '30px',
  },
}));

// CONTENEDOR PRINCIPAL DE LA GALERÍA
// --------------------------------------
const GalleryContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'scrollPosition'
})(({ theme, scrollPosition = 0 }) => {
  // Adelantamos la transición (aunque en este caso el color siempre es el mismo)
  const scrollThreshold = 2000;
  const transitionLength = 800;
  const gradientProgress = Math.min(Math.max((scrollPosition - scrollThreshold) / transitionLength, 0), 1);
  
  // Color stays the same (lime green) throughout
  const initialColor = '#c2dd52'; // Lime green
  const finalColor = '#c2dd52';   // Lime green
  
  // Función para interpolar color
  const interpolateColor = (progress) => {
    const parseColor = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    
    const [r1, g1, b1] = parseColor(initialColor);
    const [r2, g2, b2] = parseColor(finalColor);
    
    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Color resultante basado en el scroll
  const bgColor = interpolateColor(gradientProgress);
  
  return {
    backgroundColor: bgColor,
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflowX: 'auto',
    overflowY: 'hidden',
    transform: 'translateZ(0)',
    perspective: '1000px',
    backfaceVisibility: 'hidden',
    willChange: 'scroll-position, background-color',
    '-webkit-overflow-scrolling': 'touch',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    transition: 'background-color 0.1s ease-out',
  };
});

// Contenido de la galería con ancho responsivo
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  padding: '40px',
  paddingRight: '300px',
  position: 'relative',
  transform: 'translateZ(0)',
  // Ancho ajustado por breakpoints
  width: '7500px', // Base para XL
  [theme.breakpoints.down('lg')]: { // Para LG (desktops pequeños)
    width: '7000px',
  },
  [theme.breakpoints.down('md')]: { // Para MD (tablets)
    width: '6000px',
  },
  [theme.breakpoints.down('sm')]: { // Para SM (móviles)
    width: '5000px',
  },
  [theme.breakpoints.down('xs')]: { // Para XS (móviles muy pequeños)
     width: '4500px',
  },
}));

// ELEMENTO DE IMAGEN
// --------------------------------------
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'top' && 
    prop !== 'left' &&
    prop !== 'isVisible' &&
    prop !== 'isPhoto'
})(({ theme, top, left, width, height, zIndex = 1, isVisible = true, isPhoto = true }) => ({
  position: 'absolute',
  top: top,
  left: left,
  width: width,
  height: height,
  zIndex: zIndex,
  marginBottom: 0,
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(-50%) translateZ(0)' : 'translateY(-50%) translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: isPhoto ? '2px' : '0',
    boxShadow: 'none',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
  }
}));

const MarcosGallery = ({ onBack }) => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [visibleImages, setVisibleImages] = useState({});

  // Referencias
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);
  const progressBarRef = useRef(null);
  const containerRef = useRef(null);
  const imageRefs = useRef([]);

  // Imágenes para la galería
  const images = useMemo(() => [
    '/images/MARCOS/MARCOSMUF-1.png',
    '/images/MARCOS/MARCOSMUF-2.jpg',
    '/images/MARCOS/MARCOSMUF-3.jpg',
    '/images/MARCOS/MARCOSMUF-4.jpg',
    '/images/MARCOS/MARCOSMUF-5 (PORTADA).jpg',
    '/images/MARCOS/MARCOSMUF-6.jpg',
    '/images/MARCOS/MARCOSMUF-7.jpg',
    '/images/MARCOS/MARCOSMUF-8.jpg',
    '/images/MARCOS/MARCOSMUF-9.jpg',
    '/images/MARCOS/MARCOSMUF-10.jpg',
  ], []);

  // Theme y breakpoints
  const theme = useTheme();
  // Definición de breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down('xs'));
  const isSm = useMediaQuery(theme.breakpoints.between('xs', 'sm'));
  const isMd = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLg = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isXl = useMediaQuery(theme.breakpoints.up('lg'));

  // Estado de breakpoints activos
  const activeBreakpoints = { isXs, isSm, isMd, isLg, isXl };
  // Para useSmoothScroll
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // CONFIGURACIÓN DE ESTILOS RESPONSIVOS PARA IMÁGENES
  // --------------------------------------------------
  // NOTA: Solo se han ajustado las posiciones en móvil (sm y xs)
  // Los valores de desktop (xl, lg, md) permanecen iguales a los originales
  const imageConfigurations = {
    // =========== IMAGEN 1 (PNG) ===========
    MARCOS1: { 
      // Desktop - valores originales sin cambios
      xl: { top: "80%", left: "200px", height: "80vh", innerMaxWidth: "600px", zIndex: 3 },
      lg: { top: "80%", left: "100px", height: "75vh", innerMaxWidth: "550px", zIndex: 3 },
      md: { top: "75%", left: "100px", height: "70vh", innerMaxWidth: "500px", zIndex: 3 },
      // Móvil - AJUSTADO: Posición más abajo para superposición
      sm: { top: "65%", left: "120px", height: "70vh", innerMaxWidth: "350px", zIndex: 3 },
      xs: { top: "65%", left: "80px", height: "65vh", innerMaxWidth: "80vw", zIndex: 3 },
      // Para ajustar la posición vertical en móvil, modifica el valor de "top" en sm y xs
    },
    
    // =========== IMAGEN 2 ===========
    MARCOS2: { 
      // Desktop - valores originales sin cambios
      xl: { top: "50%", left: "450px", height: "80vh", innerMaxWidth: "600px", zIndex: 2 },
      lg: { top: "50%", left: "320px", height: "75vh", innerMaxWidth: "550px", zIndex: 2 },
      md: { top: "50%", left: "280px", height: "70vh", innerMaxWidth: "500px", zIndex: 2 },
      // Móvil - AJUSTADO: Más a la izquierda para superposición
      sm: { top: "45%", left: "250px", height: "70vh", innerMaxWidth: "350px", zIndex: 2 },
      xs: { top: "45%", left: "200px", height: "65vh", innerMaxWidth: "80vw", zIndex: 2 },
      // Para ajustar la superposición en móvil, modifica el valor de "left" en sm y xs
    },
    
    // =========== IMAGEN 3 ===========
    MARCOS3: { 
      // Desktop - valores originales sin cambios
      xl: { top: "50%", left: "1100px", height: "80vh", innerMaxWidth: "600px", zIndex: 2 },
      lg: { top: "50%", left: "1050px", height: "75vh", innerMaxWidth: "550px", zIndex: 2 },
      md: { top: "50%", left: "950px", height: "70vh", innerMaxWidth: "500px", zIndex: 2 },
      // Móvil - AJUSTADO: Más a la izquierda
      sm: { top: "45%", left: "700px", height: "70vh", innerMaxWidth: "350px", zIndex: 2 },
      xs: { top: "45%", left: "600px", height: "65vh", innerMaxWidth: "80vw", zIndex: 2 },
      // Para ajustar en móvil, modifica el valor de "left" en sm y xs
    },
    
    // =========== IMAGEN 4 ===========
    MARCOS4: { 
      // Desktop - valores originales sin cambios
      xl: { top: "50%", left: "1750px", height: "80vh", innerMaxWidth: "600px", zIndex: 2 },
      lg: { top: "50%", left: "1600px", height: "75vh", innerMaxWidth: "550px", zIndex: 2 },
      md: { top: "50%", left: "1450px", height: "70vh", innerMaxWidth: "500px", zIndex: 2 },
      // Móvil - AJUSTADO: Más a la izquierda
      sm: { top: "45%", left: "1150px", height: "70vh", innerMaxWidth: "350px", zIndex: 2 },
      xs: { top: "45%", left: "1050px", height: "65vh", innerMaxWidth: "80vw", zIndex: 2 },
      // Para ajustar en móvil, modifica el valor de "left" en sm y xs
    },
    
    // =========== IMAGEN 5 (PORTADA) ===========
    MARCOS5: { 
      // Desktop - valores originales sin cambios
      xl: { top: "50%", left: "2800px", height: "100vh", innerMaxWidth: "800px", zIndex: 2 },
      lg: { top: "50%", left: "2500px", height: "95vh", innerMaxWidth: "750px", zIndex: 2 },
      md: { top: "50%", left: "2200px", height: "90vh", innerMaxWidth: "700px", zIndex: 2 },
      // Móvil - AJUSTADO: Más a la izquierda
      sm: { top: "45%", left: "1750px", height: "90vh", innerMaxWidth: "600px", zIndex: 2 },
      xs: { top: "45%", left: "1600px", height: "85vh", innerMaxWidth: "90vw", zIndex: 2 },
      // Para ajustar en móvil, modifica el valor de "left" en sm y xs
    },
    
    // =========== IMAGEN 6 ===========
    MARCOS6: { 
      // Desktop - valores originales sin cambios
      xl: { top: "45%", left: "3300px", height: "60vh", innerMaxWidth: "450px", zIndex: 2 },
      lg: { top: "45%", left: "3000px", height: "55vh", innerMaxWidth: "420px", zIndex: 2 },
      md: { top: "45%", left: "2800px", height: "50vh", innerMaxWidth: "400px", zIndex: 2 },
      // Móvil - AJUSTADO: Más a la izquierda
      sm: { top: "40%", left: "2200px", height: "50vh", innerMaxWidth: "300px", zIndex: 2 },
      xs: { top: "40%", left: "2100px", height: "45vh", innerMaxWidth: "70vw", zIndex: 2 },
      // Para ajustar en móvil, modifica el valor de "left" en sm y xs
    },
    
    // =========== IMAGEN 7 ===========
    MARCOS7: { 
      // Desktop - valores originales sin cambios
      xl: { top: "25%", left: "4350px", height: "55vh", innerMaxWidth: "550px", zIndex: 2 },
      lg: { top: "28%", left: "4000px", height: "55vh", innerMaxWidth: "520px", zIndex: 2 },
      md: { top: "28%", left: "3600px", height: "50vh", innerMaxWidth: "500px", zIndex: 2 },
      // Móvil - AJUSTADO: Más a la izquierda
      sm: { top: "25%", left: "2800px", height: "40vh", innerMaxWidth: "400px", zIndex: 2 },
      xs: { top: "25%", left: "2500px", height: "35vh", innerMaxWidth: "75vw", zIndex: 2 },
      // Para ajustar en móvil, modifica el valor de "left" en sm y xs
    },
    
    // =========== IMAGEN 8 ===========
    MARCOS8: { 
      // Desktop - valores originales sin cambios
      xl: { top: "55%", left: "5000px", height: "70vh", innerMaxWidth: "550px", zIndex: 2 },
      lg: { top: "55%", left: "4800px", height: "70vh", innerMaxWidth: "520px", zIndex: 2 },
      md: { top: "55%", left: "4300px", height: "65vh", innerMaxWidth: "500px", zIndex: 2 },
      // Móvil - AJUSTADO: Más a la izquierda
      sm: { top: "50%", left: "3300px", height: "60vh", innerMaxWidth: "350px", zIndex: 2 },
      xs: { top: "50%", left: "3200px", height: "55vh", innerMaxWidth: "80vw", zIndex: 2 },
      // Para ajustar en móvil, modifica el valor de "left" en sm y xs
    },
    
    // =========== IMAGEN 9 ===========
    MARCOS9: { 
      // Desktop - valores originales sin cambios
      xl: { top: "55%", left: "5550px", height: "70vh", innerMaxWidth: "550px", zIndex: 2 },
      lg: { top: "55%", left: "5300px", height: "70vh", innerMaxWidth: "520px", zIndex: 2 },
      md: { top: "55%", left: "4800px", height: "65vh", innerMaxWidth: "500px", zIndex: 2 },
      // Móvil - AJUSTADO: Más a la izquierda
      sm: { top: "50%", left: "3700px", height: "60vh", innerMaxWidth: "350px", zIndex: 2 },
      xs: { top: "50%", left: "3500px", height: "55vh", innerMaxWidth: "80vw", zIndex: 2 },
      // Para ajustar en móvil, modifica el valor de "left" en sm y xs
    },
    
    // =========== IMAGEN 10 (ÚLTIMA) ===========
    MARCOS10: { 
      // Desktop - valores originales sin cambios
      xl: { top: "50%", left: "6600px", height: "100vh", innerMaxWidth: "750px", zIndex: 2 },
      lg: { top: "50%", left: "6000px", height: "95vh", innerMaxWidth: "700px", zIndex: 2 },
      md: { top: "50%", left: "5400px", height: "90vh", innerMaxWidth: "650px", zIndex: 2 },
      // Móvil - AJUSTADO: Más a la izquierda
      sm: { top: "45%", left: "4300px", height: "90vh", innerMaxWidth: "600px", zIndex: 2 },
      xs: { top: "45%", left: "4000px", height: "85vh", innerMaxWidth: "90vw", zIndex: 2 },
      // Para ajustar en móvil, modifica el valor de "left" en sm y xs
    },
  };

  // Función para obtener estilos según breakpoint
  const getCurrentStyles = (imageKey, breakpoints) => {
    const config = imageConfigurations[imageKey];
    if (!config) return {}; // Fallback
    if (breakpoints.isXs) return config.xs || config.sm; // Fallback a sm si xs no está definido
    if (breakpoints.isSm) return config.sm;
    if (breakpoints.isMd) return config.md;
    if (breakpoints.isLg) return config.lg;
    if (breakpoints.isXl) return config.xl;
    return config.xl; // Default a xl
  };

  // Checkear visibilidad de imágenes
  const checkVisibility = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const preloadMargin = containerWidth * 1.2;
    const newVisibility = {};
    
    imageRefs.current.forEach((itemRef, index) => {
      if (itemRef && itemRef.current) {
        const imageRect = itemRef.current.getBoundingClientRect();
        
        // Verificación horizontal para ambos dispositivos
        const isVisible = (
          imageRect.left < containerRect.right + preloadMargin &&
          imageRect.right > containerRect.left - preloadMargin
        );
        
        newVisibility[index] = isVisible;
      }
    });
    
    setVisibleImages(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(newVisibility)) {
        return newVisibility;
      }
      return prev;
    });
  }, []);

  // Smooth scroll
  const { scrollLeft, scrollProgress } = useSmoothScroll({
    containerRef,
    isMobile,
    isLoading: loading,
    checkVisibility,
    horizontal: true,
    duration: 2.5,
    wheelMultiplier: 1.2,
    touchMultiplier: 2,
    lerp: 0.04,
    colors: galleryTheme
  });

  // Efecto para animar título en pantalla de carga
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

  // Efecto para controlar animación de carga
  useEffect(() => {
    let interval;
    
    if (loading) {
      interval = setInterval(() => {
        setLoadProgress(prev => {
          const next = prev + (Math.random() * 15);
          if (next >= 100) {
            clearInterval(interval);
            
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
                    onComplete: () => setLoading(false)
                  });
                }
              });
            } else {
              setTimeout(() => setLoading(false), 500);
            }
            
            return 100;
          }
          return next;
        });
      }, 250);
    }
    
    return () => clearInterval(interval);
  }, [loading]);

  // Forzar fin de carga después de un timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Forcing loading to complete');
        setLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Optimizar rendimiento del navegador
  useEffect(() => {
    if (!loading) {
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    return () => {
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.scrollBehavior = '';
    };
  }, [loading]);

  // Configurar IntersectionObserver para detección de visibilidad
  useEffect(() => {
    if (loading || !containerRef.current) return;

    checkVisibility();
    
    if ('IntersectionObserver' in window) {
      const options = {
        root: containerRef.current,
        rootMargin: '200px',
        threshold: 0.1
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const id = entry.target.dataset.id;
          if (id) {
            setVisibleImages(prev => ({
              ...prev,
              [id]: entry.isIntersecting
            }));
          }
        });
      }, options);
      
      imageRefs.current.forEach((itemRef, index) => {
        if (itemRef?.current) {
          itemRef.current.dataset.id = index;
          observer.observe(itemRef.current);
        }
      });
      
      return () => {
        imageRefs.current.forEach(itemRef => {
          if (itemRef?.current) observer.unobserve(itemRef.current);
        });
        observer.disconnect();
      };
    }
  }, [loading, checkVisibility]);

  // Ajustes específicos para iOS
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden';
    }
    
    return () => {
      if (isIOS) {
        document.documentElement.style.height = '';
        document.body.style.height = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
      }
    };
  }, []);

  // Renderizar imágenes con estilos responsivos
  const renderImageItems = () => {
    const imageKeys = ['MARCOS1', 'MARCOS2', 'MARCOS3', 'MARCOS4', 'MARCOS5', 
                       'MARCOS6', 'MARCOS7', 'MARCOS8', 'MARCOS9', 'MARCOS10'];
    
    return images.map((src, index) => {
      const imageKey = imageKeys[index];
      const styles = getCurrentStyles(imageKey, activeBreakpoints);
      
      // Asegurarse de que imageRefs.current[index] sea una ref válida
      if (!imageRefs.current[index]) {
        imageRefs.current[index] = React.createRef();
      }

      return (
        <ImageItem
          key={index}
          ref={imageRefs.current[index]}
          top={styles.top}
          left={styles.left}
          height={styles.height}
          width="auto"
          zIndex={styles.zIndex}
          isVisible={visibleImages[index] !== false}
        >
          <Box
            component="img"
            src={src}
            alt={`MARCOS ${index + 1}`}
            loading={index < 3 ? "eager" : "lazy"}
            sx={{
              objectFit: "contain",
              width: "100%",
              height: "100%",
              maxWidth: styles.innerMaxWidth,
            }}
          />
        </ImageItem>
      );
    });
  };

  return (
    <>
      <GlobalStyle />
      
      {/* Pantalla de carga con animación de texto y círculo de progreso */}
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          <LoadingTitle ref={titleRef}>
            MARCOS
          </LoadingTitle>
          
          <LoadingYear ref={yearRef}>
            2024
          </LoadingYear>
          
          <CircularProgress 
            variant="determinate" 
            value={loadProgress} 
            size={70} 
            thickness={3}
            sx={{ 
              color: galleryTheme.text,
              marginTop: '10px',
            }}
          />
        </LoadingScreen>
      )}
      
      {/* Barra de progreso de scroll */}
      <ScrollProgressBar 
        ref={progressBarRef}
        data-scroll-progress 
        sx={{ 
          opacity: loading ? 0 : 1
        }} 
      />
      
      {/* Flecha de navegación */}
      <NavigationArrow 
        onBack={onBack} 
        containerRef={containerRef}
        colors={galleryTheme}
        isLoading={loading}
      />
      
      {/* Contenedor principal con scroll horizontal */}
      <GalleryContainer 
        ref={containerRef} 
        scrollPosition={scrollLeft}
        style={{ cursor: 'grab' }}
      >
        <GalleryContent>
          {renderImageItems()}
        </GalleryContent>
      </GalleryContainer>
    </>
  );
};

export default MarcosGallery;
