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

// Get the color theme for this gallery
const galleryTheme = getGalleryColors('amour');

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

// Loading screen
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
  overflow: 'hidden', // Prevent any overflow during animations
  padding: '20px',
}));

// Optimized scroll progress bar with GPU acceleration
const ScrollProgressBar = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  height: '3px',
  width: '0%',
  backgroundColor: galleryTheme.highlight, // Using theme highlight color
  zIndex: 9999,
  transform: 'translateZ(0)',  // Force GPU acceleration
  willChange: 'width',
  boxShadow: '0 0 3px rgba(0,0,0,0.2)', // Subtle shadow for better visibility
});

// Title component for loading screen - FUENTE ACTUALIZADA A BOLD
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Suisse Intl Bold", sans-serif',
  fontSize: '45px',
  fontWeight: 'bold',
  color: galleryTheme.text, // Using theme text color
  letterSpacing: '2px',
  position: 'relative', // For positioning relative to container
  transform: 'translateY(100px)', // Start below viewport (for animation)
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
  color: galleryTheme.text, // Using theme text color
  letterSpacing: '2px',
  marginTop: '8px', // Space between the title and year
  position: 'relative', // For positioning relative to container
  transform: 'translateY(100px)', // Start below viewport (for animation)
  opacity: 0,
  marginBottom: '40px', // Space between text and loading circle
  textAlign: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    fontSize: '28px',
    letterSpacing: '1.5px',
    marginTop: '5px',
    marginBottom: '30px',
  },
}));

// Main container with horizontal scroll - optimized
const GalleryContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'scrollPosition'
})(({ theme, scrollPosition = 0 }) => {
  // Start transition after 5th image (around 3900px scroll)
  const scrollThreshold = 2000; // Adelantado para ocurrir antes
  // Complete transition over 800px of scrolling
  const transitionLength = 800;
  // Calculate transition progress (0 to 1)
  const gradientProgress = Math.min(Math.max((scrollPosition - scrollThreshold) / transitionLength, 0), 1);
  
  // Color stays the same (red) throughout
  const initialColor = '#e82d2d'; // Red
  const finalColor = '#e82d2d';   // Red
  
  // Color interpolation function
  const interpolateColor = (progress) => {
    // Parse hex colors to RGB
    const parseColor = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    
    const [r1, g1, b1] = parseColor(initialColor);
    const [r2, g2, b2] = parseColor(finalColor);
    
    // Interpolate between colors
    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Get current background color based on scroll
  const bgColor = interpolateColor(gradientProgress);
  
  return {
    backgroundColor: bgColor,
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflowX: 'auto',
    overflowY: 'hidden',
    transform: 'translateZ(0)',  // Force GPU acceleration
    perspective: '1000px',       // Enhance GPU acceleration
    backfaceVisibility: 'hidden', // Further GPU optimization
    willChange: 'scroll-position, background-color',
    '-webkit-overflow-scrolling': 'touch',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    transition: 'background-color 0.1s ease-out', // Add small transition for smoother color change
    [theme.breakpoints.down('sm')]: {
      overflowX: 'auto',
      overflowY: 'hidden',
      height: '100vh',
      minHeight: '100vh',
    },
  };
});

// Content container with GPU acceleration - ANCHO AJUSTADO
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  padding: '40px',
  paddingRight: '300px', // Extra padding at the end
  position: 'relative',
  transform: 'translateZ(0)',  // Force GPU acceleration
  // Ancho ajustado por breakpoints
  width: '7000px', // Base para XL y desktop
  [theme.breakpoints.down('sm')]: { // Para SM (móviles)
    width: '5000px', // Reducido para móvil
    flexDirection: 'row',
    height: '100%',
    padding: '40px 300px 40px 40px',
  },
  [theme.breakpoints.down('xs')]: { // Para XS (móviles muy pequeños)
    width: '4500px',
  },
}));

// Image item - optimized with GPU acceleration
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => 
    prop !== 'isVisible' && 
    prop !== 'isMobile' && 
    prop !== 'isPhoto'
})(({ theme, top, left, width, height, zIndex = 1, isVisible = true, isPhoto = true }) => ({
  position: 'absolute', // Always use absolute positioning for both mobile and desktop
  top: top,
  left: left,
  width: width,
  height: height,
  zIndex: zIndex,
  marginBottom: '0', // No margin needed with absolute positioning
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(-50%) translateZ(0)' : 'translateY(-50%) translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden', // GPU optimization
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: isPhoto ? '2px' : '0',
    boxShadow: 'none', // No shadows
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)', // Force GPU acceleration
  }
}));

const AmourGallery = ({ onBack }) => {
  // Loading screen state
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // References for animation elements
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);
  const progressBarRef = useRef(null);
  const containerRef = useRef(null);
  
  // Image visibility state and references
  const [visibleImages, setVisibleImages] = useState({});
  const imageRefs = useRef([]);

  // Get theme for media queries
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

  // Images for AMOUR gallery - ELIMINADA la imagen 3 problemática
  const images = useMemo(() => [
    '/images/AMOUR/ADELAMOUR-1.jpg',
    '/images/AMOUR/ADELAMOUR-2.jpg',
    '/images/AMOUR/ADELAMOUR-6.jpg',
    // ADELAMOUR-3.jpg ha sido eliminada
    '/images/AMOUR/ADELAMOUR-4.jpg',
    '/images/AMOUR/ADELAMOUR-5.jpg',
    '/images/AMOUR/sape.jpg',
    '/images/AMOUR/ADELAMOUR-7.jpg',
    '/images/AMOUR/ADELAMOUR-8.jpg',
  ], []);

  // CONFIGURACIÓN DE ESTILOS RESPONSIVOS PARA IMÁGENES
  // --------------------------------------------------
  // NOTA: Solo se han ajustado las posiciones en móvil (sm y xs)
  // Los valores de desktop (xl, lg, md) permanecen iguales a los originales
  const imageConfigurations = {
    // =========== IMAGEN 1 ===========
    AMOUR1: { 
      // Desktop - valores originales sin cambios
      xl: { top: "50%", left: "450px", height: "85vh", innerMaxWidth: "600px", zIndex: 2 },
      lg: { top: "50%", left: "450px", height: "85vh", innerMaxWidth: "550px", zIndex: 2 },
      md: { top: "50%", left: "450px", height: "85vh", innerMaxWidth: "500px", zIndex: 2 },
      // Móvil - AJUSTADO
      sm: { top: "45%", left: "220px", height: "70vh", innerMaxWidth: "350px", zIndex: 2 },
      xs: { top: "45%", left: "180px", height: "65vh", innerMaxWidth: "80vw", zIndex: 2 },
    },
    
    // =========== IMAGEN 2 ===========
    AMOUR2: { 
      // Desktop - valores originales sin cambios
      xl: { top: "50%", left: "1350px", height: "60vh", innerMaxWidth: "500px", zIndex: 2 },
      lg: { top: "50%", left: "1350px", height: "60vh", innerMaxWidth: "480px", zIndex: 2 },
      md: { top: "50%", left: "1350px", height: "60vh", innerMaxWidth: "450px", zIndex: 2 },
      // Móvil - AJUSTADO: Más a la izquierda para superposición
      sm: { top: "45%", left: "850px", height: "55vh", innerMaxWidth: "300px", zIndex: 2 },
      xs: { top: "45%", left: "650px", height: "50vh", innerMaxWidth: "70vw", zIndex: 2 },
    },
    
    // =========== IMAGEN 6 en posición 3 ===========
    // Esta configuración es para la imagen 6 que aparece en el lugar donde estaba la imagen 3
    AMOUR6_POSITION3: { 
      // Desktop - valores originales del renderGalleryContent() original
      xl: { top: "55%", left: "1770px", height: "60vh", innerMaxWidth: "500px", zIndex: 2 },
      lg: { top: "55%", left: "1770px", height: "60vh", innerMaxWidth: "480px", zIndex: 2 },
      md: { top: "55%", left: "1770px", height: "60vh", innerMaxWidth: "450px", zIndex: 2 },
      // Móvil - AJUSTADO
      sm: { top: "50%", left: "1100px", height: "55vh", innerMaxWidth: "300px", zIndex: 2 },
      xs: { top: "50%", left: "1000px", height: "50vh", innerMaxWidth: "70vw", zIndex: 2 },
    },
    
    // =========== IMAGEN 4 ===========
    AMOUR4: { 
      // Desktop - valores originales sin cambios
      xl: { top: "50%", left: "3450px", height: "65vh", innerMaxWidth: "550px", zIndex: 3 },
      lg: { top: "50%", left: "3450px", height: "65vh", innerMaxWidth: "520px", zIndex: 3 },
      md: { top: "50%", left: "3450px", height: "65vh", innerMaxWidth: "500px", zIndex: 3 },
      // Móvil - AJUSTADO
      sm: { top: "55%", left: "2400px", height: "60vh", innerMaxWidth: "320px", zIndex: 2 },
      xs: { top: "55%", left: "2300px", height: "55vh", innerMaxWidth: "80vw", zIndex: 2 },
    },
    
    // =========== IMAGEN 5 ===========
    AMOUR5: { 
      // Desktop - valores originales sin cambios
      xl: { top: "50%", left: "2750px", height: "100vh", innerMaxWidth: "800px", zIndex: 2 },
      lg: { top: "50%", left: "2750px", height: "95vh", innerMaxWidth: "750px", zIndex: 2 },
      md: { top: "50%", left: "2750px", height: "90vh", innerMaxWidth: "700px", zIndex: 2 },
      // Móvil - AJUSTADO
      sm: { top: "45%", left: "1700px", height: "90vh", innerMaxWidth: "600px", zIndex: 2 },
      xs: { top: "45%", left: "1600px", height: "85vh", innerMaxWidth: "90vw", zIndex: 2 },
    },
    
    // =========== IMAGEN 6 en posición normal ===========
    AMOUR6: { 
      // Desktop - valores originales sin cambios
      xl: { top: "50%", left: "4450px", height: "85vh", innerMaxWidth: "650px", zIndex: 2 },
      lg: { top: "50%", left: "4450px", height: "80vh", innerMaxWidth: "620px", zIndex: 2 },
      md: { top: "50%", left: "4450px", height: "80vh", innerMaxWidth: "600px", zIndex: 2 },
      // Móvil - AJUSTADO
      sm: { top: "40%", left: "2750px", height: "55vh", innerMaxWidth: "300px", zIndex: 2 },
      xs: { top: "40%", left: "2550px", height: "50vh", innerMaxWidth: "70vw", zIndex: 2 },
    },
    
    // =========== IMAGEN 7 ===========
    AMOUR7: { 
      // Desktop - valores originales sin cambios
      xl: { top: "50%", left: "5250px", height: "85vh", innerMaxWidth: "650px", zIndex: 2 },
      lg: { top: "50%", left: "5250px", height: "85vh", innerMaxWidth: "600px", zIndex: 2 },
      md: { top: "50%", left: "5250px", height: "85vh", innerMaxWidth: "550px", zIndex: 2 },
      // Móvil - AJUSTADO
      sm: { top: "45%", left: "3300px", height: "75vh", innerMaxWidth: "400px", zIndex: 2 },
      xs: { top: "45%", left: "3100px", height: "70vh", innerMaxWidth: "85vw", zIndex: 2 },
    },
    
    // =========== IMAGEN 8 ===========
    AMOUR8: { 
      // Desktop - valores originales sin cambios
      xl: { top: "50%", left: "6000px", height: "85vh", innerMaxWidth: "650px", zIndex: 2 },
      lg: { top: "50%", left: "6000px", height: "85vh", innerMaxWidth: "600px", zIndex: 2 },
      md: { top: "50%", left: "6000px", height: "85vh", innerMaxWidth: "550px", zIndex: 2 },
      // Móvil - AJUSTADO
      sm: { top: "45%", left: "3800px", height: "75vh", innerMaxWidth: "400px", zIndex: 2 },
      xs: { top: "45%", left: "3900px", height: "70vh", innerMaxWidth: "85vw", zIndex: 2 },
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
  
  // Updated visibility check to always use horizontal scrolling logic
  const checkVisibility = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    
    const preloadMargin = containerWidth * 1.2; // Aumentado para mejor precarga
    
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
    
    setVisibleImages(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(newVisibility)) {
        return newVisibility;
      }
      return prev;
    });
  }, []);

  // Use the smooth scroll hook
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
  
  // Loading screen title and year animation effect
  useEffect(() => {
    if (!loading) return;
    
    if (titleRef.current && yearRef.current) {
      const options = { 
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out"
      };
      
      gsap.to(titleRef.current, {
        ...options,
        delay: 0.3,
      });
      
      gsap.to(yearRef.current, {
        ...options,
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
              const options = {
                y: -100,
                opacity: 0,
                duration: 0.8,
                ease: "power2.in"
              };
              
              gsap.to(titleRef.current, options);
              gsap.to(yearRef.current, {
                ...options,
                delay: 0.1,
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
        console.log('Forcing loading to complete');
        setLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Optimize browser performance
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

  // Set up IntersectionObserver for visibility detection
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

  // Renderizar imágenes - AJUSTADO para mostrar la imagen 6 en la posición 3
  const renderGalleryContent = () => (
    <>
      {/* Image 1 */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        top={getCurrentStyles('AMOUR1', activeBreakpoints).top}
        left={getCurrentStyles('AMOUR1', activeBreakpoints).left}
        height={getCurrentStyles('AMOUR1', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('AMOUR1', activeBreakpoints).zIndex}
        isVisible={visibleImages[0] !== false}
      >
        <Box 
          component="img" 
          src={images[0]} 
          alt="ADELAMOUR 1" 
          loading="eager"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('AMOUR1', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>
      
      {/* Image 2 */}
      <ImageItem 
        ref={el => imageRefs.current[1] = el}
        top={getCurrentStyles('AMOUR2', activeBreakpoints).top}
        left={getCurrentStyles('AMOUR2', activeBreakpoints).left}
        height={getCurrentStyles('AMOUR2', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('AMOUR2', activeBreakpoints).zIndex}
        isVisible={visibleImages[1] !== false}
      >
        <Box 
          component="img" 
          src={images[1]} 
          alt="ADELAMOUR 2" 
          loading="eager"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('AMOUR2', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>
      
      {/* Image 6 en posición 3 - Usando la imagen 6 (índice 4) pero en la posición donde iba la imagen 3 */}
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        top={getCurrentStyles('AMOUR6_POSITION3', activeBreakpoints).top}
        left={getCurrentStyles('AMOUR6_POSITION3', activeBreakpoints).left}
        height={getCurrentStyles('AMOUR6_POSITION3', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('AMOUR6_POSITION3', activeBreakpoints).zIndex}
        isVisible={visibleImages[2] !== false}
      >
        <Box 
          component="img" 
          src={images[4]} /* Usando imagen 6 (índice 4 en el array) */
          alt="ADELAMOUR 6 (en pos. 3)" 
          loading="eager"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('AMOUR6_POSITION3', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>
      
      {/* Image 4 */}
      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        top={getCurrentStyles('AMOUR4', activeBreakpoints).top}
        left={getCurrentStyles('AMOUR4', activeBreakpoints).left}
        height={getCurrentStyles('AMOUR4', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('AMOUR4', activeBreakpoints).zIndex}
        isVisible={visibleImages[3] !== false}
      >
        <Box 
          component="img" 
          src={images[2]} /* Imagen 4 es índice 2 en array actualizado */
          alt="ADELAMOUR 4" 
          loading="lazy"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('AMOUR4', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>
      
      {/* Image 5 */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top={getCurrentStyles('AMOUR5', activeBreakpoints).top}
        left={getCurrentStyles('AMOUR5', activeBreakpoints).left}
        height={getCurrentStyles('AMOUR5', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('AMOUR5', activeBreakpoints).zIndex}
        isVisible={visibleImages[4] !== false}
      >
        <Box 
          component="img" 
          src={images[3]} /* Imagen 5 es índice 3 en array actualizado */
          alt="ADELAMOUR 5" 
          loading="lazy"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('AMOUR5', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>
      
      {/* Image 6 en su posición original */}
      <ImageItem 
        ref={el => imageRefs.current[5] = el}
        top={getCurrentStyles('AMOUR6', activeBreakpoints).top}
        left={getCurrentStyles('AMOUR6', activeBreakpoints).left}
        height={getCurrentStyles('AMOUR6', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('AMOUR6', activeBreakpoints).zIndex}
        isVisible={visibleImages[5] !== false}
      >
        <Box 
          component="img" 
          src={images[4]} /* Imagen 6 es índice 4 en array actualizado */
          alt="ADELAMOUR 6" 
          loading="lazy"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('AMOUR6', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>
      
      {/* Image 7 */}
      <ImageItem 
        ref={el => imageRefs.current[6] = el}
        top={getCurrentStyles('AMOUR7', activeBreakpoints).top}
        left={getCurrentStyles('AMOUR7', activeBreakpoints).left}
        height={getCurrentStyles('AMOUR7', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('AMOUR7', activeBreakpoints).zIndex}
        isVisible={visibleImages[6] !== false}
      >
        <Box 
          component="img" 
          src={images[5]} /* Imagen 7 es índice 5 en array actualizado */
          alt="ADELAMOUR 7" 
          loading="lazy"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('AMOUR7', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>
      
      {/* Image 8 */}
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        top={getCurrentStyles('AMOUR8', activeBreakpoints).top}
        left={getCurrentStyles('AMOUR8', activeBreakpoints).left}
        height={getCurrentStyles('AMOUR8', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('AMOUR8', activeBreakpoints).zIndex}
        isVisible={visibleImages[7] !== false}
      >
        <Box 
          component="img" 
          src={images[6]} /* Imagen 8 es índice 6 en array actualizado */
          alt="ADELAMOUR 8" 
          loading="lazy"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('AMOUR8', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>
    </>
  );

  return (
    <>
      <GlobalStyle />
      
      {/* Loading screen with title animation */}
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          <LoadingTitle ref={titleRef}>
            AMOUR
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
      
      <GalleryContainer 
        ref={containerRef} 
        scrollPosition={scrollLeft}
        style={{ cursor: 'grab' }}
      >
        <GalleryContent>
          {renderGalleryContent()}
        </GalleryContent>
      </GalleryContainer>
    </>
  );
};

export default AmourGallery;
