import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Box, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow';
import useSmoothScroll from './useSmoothScroll';
import { getGalleryColors } from '../utils/galleryColors';

// Get the color theme for this gallery
const galleryTheme = getGalleryColors('ana-livni');

// Custom font loading
const GlobalStyle = styled('style')({
  '@font-face': {
    fontFamily: 'Medium OTF',
    src: 'url("/fonts/Medium.otf") format("opentype")',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  },
});

// Loading screen
const LoadingScreen = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: galleryTheme.main, // Using theme color
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  transition: 'opacity 0.5s ease-out',
  overflow: 'hidden', // Prevent any overflow during animations
}));

// Optimized scroll progress bar with GPU acceleration
const ScrollProgressBar = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  height: '3px',
  width: '0%',
  backgroundColor: galleryTheme.highlight, // Using theme color
  zIndex: 9999,
  transform: 'translateZ(0)',  // Force GPU acceleration
  willChange: 'width',
  boxShadow: '0 0 3px rgba(0,0,0,0.2)', // Subtle shadow for better visibility
});

// Separate components for ANA LIVNI and 2024
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '45px',
  fontWeight: 'bold',
  color: galleryTheme.text, // Using theme text color
  letterSpacing: '2px',
  position: 'relative', // For positioning relative to container
  transform: 'translateY(100px)', // Start below viewport (for animation)
  opacity: 0,
}));

const LoadingYear = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '40px',
  fontWeight: 'bold',
  color: galleryTheme.text, // Using theme text color
  letterSpacing: '2px',
  marginTop: '8px', // Space between the title and year
  position: 'relative', // For positioning relative to container
  transform: 'translateY(100px)', // Start below viewport (for animation)
  opacity: 0,
  marginBottom: '40px', // Space between text and loading circle
}));

// Main container with horizontal scroll - Optimizado con will-change
const GalleryContainer = styled(Box)(({ theme }) => ({
  backgroundColor: galleryTheme.main, // Using theme main color
  width: '100vw',
  height: '100vh',
  position: 'relative',
  overflowX: 'auto',
  overflowY: 'hidden',
  transform: 'translateZ(0)',  // Force GPU acceleration
  perspective: '1000px',       // Enhance GPU acceleration
  backfaceVisibility: 'hidden', // Further GPU optimization
  willChange: 'scroll-position', // Optimización para scroll
  '-webkit-overflow-scrolling': 'touch', // Mejor scroll en iOS
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  [theme.breakpoints.down('sm')]: {
    // Keep horizontal scrolling for mobile instead of vertical
    overflowX: 'auto',
    overflowY: 'hidden',
    height: '100vh', // Keep full height on mobile
    minHeight: '100vh',
  },
}));

// Content container - con width aumentado para acomodar el mayor espaciado
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '7500px', // Aumentado desde 4500px para el mayor espaciado
  height: '100%',
  padding: '40px',
  paddingRight: '300px', // Extra padding at the end
  position: 'relative',
  transform: 'translateZ(0)',  // Force GPU acceleration
  [theme.breakpoints.down('sm')]: {
    width: '7500px', // Keep the same width as desktop
    flexDirection: 'row', // Keep row direction for horizontal layout
    height: '100%', // Same height as desktop
    padding: '40px', // Same padding
    paddingRight: '300px', // Same right padding
  },
}));

// Image item - Optimizado con transformZ para aceleración por hardware
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMobile' && prop !== 'top' && prop !== 'left' && prop !== 'isVisible'
})(({ theme, top, left, width, height, zIndex = 1, isMobile = false, isVisible = true }) => ({
  position: 'absolute', // Always use absolute positioning
  top: top,
  left: left,
  width: width,
  height: height,
  zIndex: zIndex,
  marginBottom: '0', // No margin needed with absolute positioning
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateZ(0)' : 'translateZ(0) scale(0.98)', // Pequeña animación de escala + aceleración hardware
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity', // Optimización para animaciones
  backfaceVisibility: 'hidden', // GPU optimization
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '2px',
    boxShadow: 'none', // Remove shadows
    backfaceVisibility: 'hidden', // Reduce flickering en WebKit
    transform: 'translateZ(0)', // Force GPU acceleration
  }
}));

const AnaLivniGallery = ({ onBack }) => {
  // Estado para la pantalla de carga
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Referencias para los elementos de animación
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);
  const progressBarRef = useRef(null);

  const containerRef = useRef(null);
  
  // Estado para controlar la visibilidad de las imágenes
  const [visibleImages, setVisibleImages] = useState({});
  // Referencias para todas las imágenes
  const imageRefs = useRef([]);

  // Images for ANA LIVNI - Memoizado para prevenir re-creaciones
  const images = useMemo(() => ({
    L1: '/images/ANA/L1.jpg',
    L2: '/images/ANA/L3.png',
    L3: '/images/ANA/L2.png',
    L4: '/images/ANA/L4.jpg',
    L5: '/images/ANA/L5.jpg',
    L6: '/images/ANA/L6.jpg',
    L7: '/images/ANA/L7.jpg',
    L8: '/images/ANA/L8.jpg',
    L9: '/images/ANA/L9.jpg',
    L10: '/images/ANA/L10.jpg',
    L11: '/images/ANA/L11.jpg',
    L12: '/images/ANA/L12.jpg',
    L13: '/images/ANA/L13.jpg'
  }), []);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Updated visibility check to always use horizontal scrolling logic
  const checkVisibility = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    
    // Margen para precarga (carga imágenes un poco antes de que sean visibles)
    const preloadMargin = containerWidth * 0.8;
    
    // Actualizar visibilidad de las imágenes
    const newVisibility = {};
    
    imageRefs.current.forEach((ref, index) => {
      if (ref && ref.current) {
        const imageRect = ref.current.getBoundingClientRect();
        
        // Always check horizontal visibility
        const isVisible = (
          imageRect.left < containerRect.right + preloadMargin &&
          imageRect.right > containerRect.left - preloadMargin
        );
        
        newVisibility[index] = isVisible;
      }
    });
    
    setVisibleImages(prev => {
      // Solo actualizar si hay cambios
      if (JSON.stringify(prev) !== JSON.stringify(newVisibility)) {
        return newVisibility;
      }
      return prev;
    });
  }, [isMobile]);

  // Use the optimized smooth scroll hook with theme colors
  const { scrollLeft, scrollProgress } = useSmoothScroll({
    containerRef,
    isMobile,
    isLoading: loading,
    checkVisibility,
    horizontal: true, // Always use horizontal scrolling
    duration: 2.5,           // Increased duration for smoother motion
    wheelMultiplier: 1.2,     // Increased multiplier for more responsive scrolling
    touchMultiplier: 2,       // Increased touch multiplier for mobile
    lerp: 0.04,               // Reduced lerp for ultra smooth transitions
    colors: galleryTheme
  });
  
  // Efecto para animar el título y año en la pantalla de carga
  useEffect(() => {
    if (!loading) return;
    
    // Asegurarse de que las referencias existen
    if (titleRef.current && yearRef.current) {
      // Animación de entrada desde abajo
      gsap.to(titleRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        delay: 0.3, // Pequeño retraso para que sea más natural
      });
      
      gsap.to(yearRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        delay: 0.5, // El año aparece después del título
      });
    }
    
    // Limpieza de la animación al desmontar
    return () => {
      gsap.killTweensOf(titleRef.current);
      gsap.killTweensOf(yearRef.current);
    };
  }, [loading]);
  
  // Efecto para controlar la pantalla de carga con progreso
  useEffect(() => {
    let interval;
    
    // Simular carga progresiva
    if (loading) {
      interval = setInterval(() => {
        setLoadProgress(prev => {
          const next = prev + (Math.random() * 15);
          if (next >= 100) {
            clearInterval(interval);
            
            // Animación de salida hacia arriba cuando la carga está completa
            if (titleRef.current && yearRef.current && loadingScreenRef.current) {
              // Primero animamos los textos hacia arriba
              gsap.to([titleRef.current, yearRef.current], {
                y: -100,
                opacity: 0,
                duration: 0.8,
                ease: "power2.in",
                stagger: 0.1,
                onComplete: () => {
                  // Luego desvanecemos toda la pantalla de carga
                  gsap.to(loadingScreenRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    delay: 0.2,
                    onComplete: () => setLoading(false)
                  });
                }
              });
            } else {
              // Fallback si las referencias no están disponibles
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
        console.log('Forcing loading to complete');
        setLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Optimize browser performance
  useEffect(() => {
    // Optimize browser performance during scrolling
    if (!loading) {
      // Disable overscroll for smoother experience
      document.body.style.overscrollBehavior = 'none';
      
      // Enable smooth scrolling at the browser level for maximum smoothness
      document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    return () => {
      // Cleanup optimizations when component unmounts
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.scrollBehavior = '';
    };
  }, [loading]);

  // Set up IntersectionObserver for visibility detection - using container as root for both
  useEffect(() => {
    if (loading || !containerRef.current) return;

    checkVisibility();
    
    if ('IntersectionObserver' in window) {
      const options = {
        root: containerRef.current, // Always use container as root for horizontal scrolling
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
  }, [loading, isMobile, checkVisibility]);

  // Use a single gallery content rendering function for both mobile and desktop
  const renderGalleryContent = () => (
    <>
      {/* 1. Large image (L1) */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        top="50%"
        left="450px"
        height="85vh"
        zIndex={2}
        isVisible={visibleImages[0] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L1} alt="ANA LIVNI 1" loading="eager" />
      </ImageItem>
      
      {/* 2 & 3. "ANA" and "LIVNI" text */}
      <Box 
        ref={el => imageRefs.current[1] = el}
        sx={{ 
          position: 'absolute', 
          top: '85%', 
          left: '1300px', 
          transform: 'translateY(-50%) translateZ(0)',
          zIndex: 2,
          width: '170px',
          display: 'flex',
          flexDirection: 'column',
          opacity: visibleImages[1] !== false ? 1 : 0,
          transition: 'opacity 0.5s ease',
          willChange: 'opacity',
          backfaceVisibility: 'hidden', // GPU optimization
        }}
      >
        <Box component="img" src={images.L2} alt="ANA" sx={{ width: '100%', marginBottom: '5px' }} loading="eager" />
        <Box component="img" src={images.L3} alt="LIVNI" sx={{ width: '100%' }} loading="eager" />
      </Box>
      
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        top="1%" 
        left="1500px" 
        height="55vh" 
        zIndex={2}
        isVisible={visibleImages[2] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images.L4} alt="ANA LIVNI 4" loading="eager" />
      </ImageItem>
      
      {/* Aumentamos el espaciado horizontal entre imágenes */}
      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        top="44%" 
        left="1875px" 
        height="55vh" 
        zIndex={2}
        isVisible={visibleImages[3] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images.L5} alt="ANA LIVNI 5" loading="eager" />
      </ImageItem>
      
      {/* Resto de imágenes centradas verticalmente con mayor espaciado */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top="50%" 
        left="2460px" // Aumentado el espaciado
        height="50vh" 
        zIndex={1}
        isVisible={visibleImages[4] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L6} alt="ANA LIVNI 6" loading="eager" />
      </ImageItem>
      
      {/* Imagen 7 ahora es estática - ya no tiene animación */}
      <ImageItem 
        ref={el => imageRefs.current[5] = el}
        top="50%" 
        left="3100px" 
        height="50vh" 
        zIndex={2}
        isVisible={visibleImages[5] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L7} alt="ANA LIVNI 7" loading="eager" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[6] = el}
        top="50%" 
        left="3750px" // Aumentado el espaciado
        height="100vh" 
        zIndex={1}
        isVisible={visibleImages[6] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L8} alt="ANA LIVNI 8" loading="eager" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        top="50%" 
        left="5650px" // Aumentado el espaciado
        height="55vh"
        zIndex={2}
        isVisible={visibleImages[7] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L9} alt="ANA LIVNI 9" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[8] = el}
        top="50%" 
        left="5250px" // Aumentado el espaciado
        height="55vh"
        zIndex={3}
        isVisible={visibleImages[8] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L10} alt="ANA LIVNI 10" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[9] = el}
        top="50%" 
        left="4850px" // Aumentado el espaciado
        height="55vh" 
        zIndex={2}
        isVisible={visibleImages[9] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L11} alt="ANA LIVNI 11" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[10] = el}
        top="40%" 
        left="6400px" // Aumentado el espaciado
        height="70vh" 
        zIndex={2}
        isVisible={visibleImages[10] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L12} alt="ANA LIVNI 12" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[11] = el}
        top="65%" 
        left="6800px" // Aumentado el espaciado
        height="70vh" 
        zIndex={1}
        isVisible={visibleImages[11] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L13} alt="ANA LIVNI 13" loading="lazy" />
      </ImageItem>
    </>
  );

  return (
    <>
      <GlobalStyle />
      
      {/* Pantalla de carga con texto animado y círculo de progreso */}
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          {/* Título "ANA LIVNI" con animación de entrada desde abajo */}
          <LoadingTitle ref={titleRef}>
            ANA LIVNI
          </LoadingTitle>
          
          {/* Año "2024" debajo con su propia animación */}
          <LoadingYear ref={yearRef}>
            2024
          </LoadingYear>
          
          <CircularProgress 
            variant="determinate" 
            value={loadProgress} 
            size={60} 
            thickness={4}
            sx={{ color: galleryTheme.text }}
          />
        </LoadingScreen>
      )}
      
      {/* Scroll progress bar - always visible after loading but controlled by Lenis */}
      <ScrollProgressBar 
        ref={progressBarRef}
        data-scroll-progress 
        sx={{ 
          opacity: loading ? 0 : 1
        }} 
      />
      
      {/* Flecha de navegación que siempre es visible en móvil */}
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

export default AnaLivniGallery;
