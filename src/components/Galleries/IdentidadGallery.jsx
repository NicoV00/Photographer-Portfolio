import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow';
import useSmoothScroll from './useSmoothScroll';
import { getGalleryColors } from '../utils/galleryColors';

// Get the color theme for this gallery
const galleryTheme = {
  main: '#0d2aa8', // Fondo azul como se ve en la imagen
  highlight: '#ffffff',
  text: '#ffffff' // Texto blanco para contraste
};

// Custom font loading - separating each font declaration into its own component
const MediumFontStyle = styled('style')({
  '@font-face': {
    fontFamily: 'Medium OTF',
    src: 'url("/fonts/Medium.otf") format("opentype")',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  }
});

const MyriadFontStyle = styled('style')({
  '@font-face': {
    fontFamily: 'MYRIADPRO-BOLD',
    src: 'url("/fonts/MYRIADPRO-BOLD.OTF") format("opentype")',
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  }
});

// Adding PPEditorialNew-Ultrabold font for titles
const PPEditorialUltraboldStyle = styled('style')({
  '@font-face': {
    fontFamily: 'PPEditorialNew-Ultrabold',
    src: 'url("/fonts/PPEditorialNew-Ultrabold.otf") format("opentype")',
    fontWeight: 'normal',
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
  backgroundColor: galleryTheme.main, // Fondo azul
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  transition: 'opacity 0.5s ease-out',
  overflow: 'hidden',
}));

// Optimized scroll progress bar with GPU acceleration
const ScrollProgressBar = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  height: '3px',
  width: '0%',
  backgroundColor: galleryTheme.highlight, // Barra blanca sobre fondo azul
  zIndex: 9999,
  transform: 'translateZ(0)',  // Force GPU acceleration
  willChange: 'width',
  boxShadow: '0 0 3px rgba(255,255,255,0.2)',
});

// Título con la fuente PPEditorialNew-Ultrabold
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"PPEditorialNew-Ultrabold", sans-serif',
  fontSize: '80px',
  fontWeight: 'normal',
  color: galleryTheme.text, // Texto blanco para el azul
  letterSpacing: '2px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  textTransform: 'uppercase',
  [theme.breakpoints.down('sm')]: {
    fontSize: '60px',
  },
}));

const LoadingYear = styled(Box)(({ theme }) => ({
  fontFamily: '"MYRIADPRO-BOLD", sans-serif',
  fontSize: '40px',
  fontWeight: 'bold',
  color: galleryTheme.text, // Texto blanco
  letterSpacing: '2px',
  marginTop: '8px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  marginBottom: '40px',
}));

// Barra de progreso minimalista
const ProgressBarContainer = styled(Box)({
  width: '300px',
  height: '3px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fondo sutil blanco para la barra
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
  backgroundColor: '#ffffff', // Blanco para el relleno
  borderRadius: '0',
  transition: 'width 0.2s ease-out',
}));

// Contenedor principal con fondo azul
const GalleryContainer = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  position: 'relative',
  overflowX: 'auto',
  overflowY: 'hidden',
  transform: 'translateZ(0)',
  perspective: '1000px',
  backfaceVisibility: 'hidden',
  willChange: 'scroll-position',
  WebkitOverflowScrolling: 'touch',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  backgroundColor: galleryTheme.main, // Fondo azul constante
  [theme.breakpoints.down('sm')]: {
    overflowX: 'auto',
    overflowY: 'hidden',
    height: '100vh',
  },
}));

// Contenedor de contenido
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '6000px', // Ancho suficiente para todas las imágenes
  height: '100%',
  padding: '40px',
  paddingRight: '300px',
  position: 'relative',
  transform: 'translateZ(0)',
  [theme.breakpoints.down('sm')]: {
    width: '4000px',
    flexDirection: 'row',
    height: '100%',
    padding: '20px',
    paddingRight: '150px',
  },
}));

// ImageItem con GPU acceleration
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMobile' && prop !== 'top' && prop !== 'left' && prop !== 'isVisible'
})(({ theme, top, left, width, height, zIndex = 1, isMobile = false, isVisible = true }) => ({
  position: 'absolute',
  top: top,
  left: left,
  width: width,
  height: height,
  zIndex: zIndex,
  marginBottom: '0',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(-50%) translateZ(0)' : 'translateY(-50%) translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '2px',
    boxShadow: 'none',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
  }
}));

const IdentidadGallery = ({ onBack }) => {
  // Loading screen state
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  
  // References for animation elements
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  
  // Image visibility state and references
  const [visibleImages, setVisibleImages] = useState({});
  const imageRefs = useRef([]);

  // Images for IDENTIDAD - usando las imágenes numeradas como se ve en la imagen 1
  const images = useMemo(() => [
    '/images/IDENTIDAD/IDENTIDAD MUF-1 (PORTADA).jpg',
    '/images/IDENTIDAD/IDENTIDAD MUF-2.jpg',
    '/images/IDENTIDAD/IDENTIDAD MUF-3.jpg',
    '/images/IDENTIDAD/IDENTIDAD MUF-4.jpg',
    '/images/IDENTIDAD/IDENTIDAD MUF-5.jpg',
    '/images/IDENTIDAD/IDENTIDAD MUF-6.jpg',
    '/images/IDENTIDAD/IDENTIDAD MUF-7.jpg',
  ], []);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Visibility checking - optimized
  const checkVisibility = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    
    // Increased preload margin for smoother experience
    const preloadMargin = containerWidth * 1.2;
    
    const newVisibility = {};
    
    imageRefs.current.forEach((ref, index) => {
      if (ref && ref.current) {
        const imageRect = ref.current.getBoundingClientRect();
        
        // Check horizontal visibility
        const isVisible = (
          imageRect.left < containerRect.right + preloadMargin &&
          imageRect.right > containerRect.left - preloadMargin
        );
        
        newVisibility[index] = isVisible;
      }
    });
    
    // Only update state if visibility has changed
    setVisibleImages(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(newVisibility)) {
        return newVisibility;
      }
      return prev;
    });
  }, []);

  // Use the optimized smooth scroll hook
  const { scrollLeft, scrollProgress, lenis } = useSmoothScroll({
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
  
  // Loading progress animation effect
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

  // Force loading to complete after a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Optimize browser performance
  useEffect(() => {
    if (!loading) {
      document.body.style.willChange = 'scroll-position';
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    return () => {
      document.body.style.willChange = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.scrollBehavior = '';
    };
  }, [loading]);

  // Set up IntersectionObserver for visibility detection
  useEffect(() => {
    if (loading || !containerRef.current) return;

    checkVisibility();
    
    if ('IntersectionObserver' in window) {
      const options = {
        root: containerRef.current,
        rootMargin: '300px',
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
      
      imageRefs.current.forEach((ref, index) => {
        if (ref?.current) {
          ref.current.dataset.id = index;
          observer.observe(ref.current);
        }
      });
      
      return () => {
        imageRefs.current.forEach(ref => {
          if (ref?.current) observer.unobserve(ref.current);
        });
        observer.disconnect();
      };
    }
  }, [loading, checkVisibility]);

  // Configuración de posicionamiento según la imagen 2 (distribución horizontal de imágenes)
  const renderGalleryContent = () => (
    <>
      {/* Imagen central (PORTADA) */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        top="50%" 
        left="400px"
        height="70vh" 
        width="auto"
        zIndex={3}
        isVisible={visibleImages[0] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images[0]} alt="IDENTIDAD 1 PORTADA" loading="eager" />
      </ImageItem>
      
      {/* Imágenes a la izquierda de la portada */}
      <ImageItem 
        ref={el => imageRefs.current[1] = el}
        top="50%" 
        left="200px"
        height="40vh"
        width="auto" 
        zIndex={2}
        isVisible={visibleImages[1] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images[1]} alt="IDENTIDAD 2" loading="eager" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        top="50%" 
        left="800px"
        height="40vh" 
        width="auto"
        zIndex={2}
        isVisible={visibleImages[2] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images[2]} alt="IDENTIDAD 3" loading="lazy" />
      </ImageItem>
      
      {/* Imágenes a la derecha de la portada */}
      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        top="50%" 
        left="1200px"
        height="40vh" 
        width="auto"
        zIndex={2}
        isVisible={visibleImages[3] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images[3]} alt="IDENTIDAD 4" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top="50%" 
        left="1600px"
        height="40vh" 
        width="auto"
        zIndex={2}
        isVisible={visibleImages[4] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images[4]} alt="IDENTIDAD 5" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[5] = el}
        top="50%" 
        left="2000px"
        height="40vh" 
        width="auto"
        zIndex={2}
        isVisible={visibleImages[5] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images[5]} alt="IDENTIDAD 6" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[6] = el}
        top="50%" 
        left="2400px"
        height="40vh" 
        width="auto"
        zIndex={2}
        isVisible={visibleImages[6] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images[6]} alt="IDENTIDAD 7" loading="lazy" />
      </ImageItem>
    </>
  );

  return (
    <>
      <MediumFontStyle />
      <MyriadFontStyle />
      <PPEditorialUltraboldStyle />
      
      {/* Loading screen with title animation */}
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          <LoadingTitle ref={titleRef}>
            IDENTIDAD
          </LoadingTitle>
          
          <LoadingYear ref={yearRef}>
            2024
          </LoadingYear>
          
          {/* Barra de progreso minimalista */}
          <ProgressBarContainer>
            <ProgressBarFill progress={loadProgress} />
          </ProgressBarContainer>
        </LoadingScreen>
      )}
      
      {/* Scroll progress bar */}
      <ScrollProgressBar 
        ref={progressBarRef}
        data-scroll-progress 
        sx={{ 
          opacity: loading ? 0 : 1
        }} 
      />
      
      {/* Navigation arrow */}
      <NavigationArrow 
        onBack={onBack} 
        containerRef={containerRef}
        colors={galleryTheme}
        isLoading={loading}
      />
      
      <GalleryContainer ref={containerRef}>
        <GalleryContent>
          {renderGalleryContent()}
        </GalleryContent>
      </GalleryContainer>
    </>
  );
};

export default IdentidadGallery;
