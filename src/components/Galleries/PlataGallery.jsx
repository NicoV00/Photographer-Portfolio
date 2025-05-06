import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow';
import useSmoothScroll from './useSmoothScroll';
import { getGalleryColors } from '../utils/galleryColors';

// Get the color theme for this gallery
const galleryTheme = getGalleryColors('plata');

// Custom font loading - separamos cada declaración de fuente en su propio componente
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

// Loading screen
const LoadingScreen = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: '#e6e6e6', // Color de fondo gris claro para la pantalla de carga
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
  backgroundColor: galleryTheme.highlight,
  zIndex: 9999,
  transform: 'translateZ(0)',  // Force GPU acceleration
  willChange: 'width',
  boxShadow: '0 0 3px rgba(255,255,255,0.2)',
});

// Separate components for PLATA and 2024 - Ahora usando MYRIADPRO-BOLD
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"MYRIADPRO-BOLD", sans-serif',
  fontSize: '45px',
  fontWeight: 'bold',
  color: '#000000', // Texto negro en la pantalla de carga
  letterSpacing: '2px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
}));

const LoadingYear = styled(Box)(({ theme }) => ({
  fontFamily: '"MYRIADPRO-BOLD", sans-serif',
  fontSize: '40px',
  fontWeight: 'bold',
  color: '#000000', // Texto negro en la pantalla de carga
  letterSpacing: '2px',
  marginTop: '8px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  marginBottom: '40px',
}));

// Barra de progreso personalizada
const ProgressBarContainer = styled(Box)({
  width: '300px', // Más ancha que el texto PLATA
  height: '8px', // Altura de la barra
  backgroundColor: 'rgba(0, 0, 0, 0.1)', // Fondo sutil
  borderRadius: '4px',
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
  backgroundColor: '#000000', // Color negro igual que el texto
  borderRadius: '4px',
  transition: 'width 0.3s ease-out', // Transición suave de la barra
}));

// Modificación del gradiente en GalleryContainer
const GalleryContainer = styled(Box)(({ theme }) => ({
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflowX: 'auto',
    overflowY: 'hidden',
    transform: 'translateZ(0)',  // Force GPU acceleration
    perspective: '1000px',      // Enhance GPU acceleration
    backfaceVisibility: 'hidden', // Further GPU optimization
    willChange: 'scroll-position',
    WebkitOverflowScrolling: 'touch',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    // Gradiente mejorado con transición más temprana y negro absoluto al final
    background: 'linear-gradient(to right, #e6e6e6 0%, #e6e6e6 25%, #c8c8c8 40%, #898989 55%, #3b3b3b 70%, #111111 80%, #000000 85%, #000000 100%)',
    backgroundSize: '9600px 100%',
    backgroundAttachment: 'local',
    [theme.breakpoints.down('sm')]: {
      overflowX: 'auto', // Changed from 'hidden' to 'auto' for horizontal scrolling on mobile
      overflowY: 'hidden', // Changed from 'auto' to 'hidden' to prevent vertical scrolling
      height: '100vh', // Keep full height on mobile
      minHeight: '100vh',
      // Exact same horizontal gradient as desktop
      background: 'linear-gradient(to right, #e6e6e6 0%, #e6e6e6 25%, #c8c8c8 40%, #898989 55%, #3b3b3b 70%, #111111 80%, #000000 85%, #000000 100%)',
      backgroundSize: '9600px 100%', // Same size as desktop
      backgroundAttachment: 'local',
    },
  }));

// Content container
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '9600px',
  height: '100%',
  padding: '40px',
  paddingRight: '300px',
  position: 'relative',
  transform: 'translateZ(0)',  // Force GPU acceleration
  [theme.breakpoints.down('sm')]: {
    width: '9600px', // Keep the same width as desktop
    flexDirection: 'row', // Keep row direction for horizontal layout
    height: '100%', // Same height as desktop
    padding: '40px', // Same padding
    paddingRight: '300px', // Same right padding
  },
}));

// Image item with GPU acceleration - Sin sombras
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMobile' && prop !== 'top' && prop !== 'left' && prop !== 'isVisible'
})(({ theme, top, left, width, height, zIndex = 1, isMobile = false, isVisible = true }) => ({
  position: isMobile ? 'absolute' : 'absolute', // Changed from 'relative' to 'absolute' for mobile
  top: isMobile ? top : top, // Use the same top positioning for mobile
  left: isMobile ? left : left, // Use the same left positioning for mobile
  width: width,
  height: height,
  zIndex: zIndex,
  marginBottom: isMobile ? '0' : '0', // Removed margin for mobile
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateZ(0)' : 'translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden', // GPU optimization
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '2px',
    boxShadow: 'none', // Sin sombras
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)', // Force GPU acceleration
  },
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '2px',
    boxShadow: 'none', // Sin sombras
    transform: 'translateZ(0)', // Force GPU acceleration
  }
}));

const PlataGallery = ({ onBack }) => {
  // Loading screen state
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  
  // References for animation elements
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  
  // Image visibility state and references with optimized memory usage
  const [visibleImages, setVisibleImages] = useState({});
  const imageRefs = useRef([]);

  // Images for PLATA - using the correct folder path
  const images = useMemo(() => ({
    P1: '/images/PLATA/PLATA-1.png',
    P2: '/images/PLATA/PLATA-2.jpg',
    P3: '/images/PLATA/PLATA-3.jpg',
    P4: '/images/PLATA/PLATA-4.png',
    P5: '/images/PLATA/PLATA-5.png',
    P6: '/images/PLATA/PLATA-6.jpg',
    P7: '/images/PLATA/PLATA-7.png',
    P8: '/images/PLATA/PLATA-8.png',
    P9: '/images/PLATA/PLATA-9.jpg',
    P10: '/images/PLATA/PLATA-10.png',
    P11: '/images/PLATA/PLATA-11.png',
    P12: '/images/PLATA/PLATA-12.jpg',
    P13: '/images/PLATA/PLATA-13.jpg'
  }), []);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Optimized visibility checking - throttled for performance
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
        
        // Always use horizontal scrolling check logic regardless of device
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
  }, [isMobile]);

  // Use the optimized smooth scroll hook with theme colors
  const { scrollLeft, scrollProgress, lenis } = useSmoothScroll({
    containerRef,
    isMobile,
    isLoading: loading,
    checkVisibility,
    horizontal: true, // Always use horizontal scrolling for both desktop and mobile
    duration: 2.5,           // Extended duration for smoother motion
    wheelMultiplier: 1.2,     // Higher multiplier for more responsive scrolling
    touchMultiplier: 2,       // Higher touch multiplier
    lerp: 0.04,               // Lower lerp for ultra smooth motion
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
    // Optimize browser performance during scrolling
    if (!loading) {
      // Add will-change hint to body for smoother overall page performance
      document.body.style.willChange = 'scroll-position';
      
      // Disable overscroll for smoother experience
      document.body.style.overscrollBehavior = 'none';
      
      // Enable smooth scrolling at the browser level for maximum smoothness
      document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    return () => {
      // Cleanup optimizations when component unmounts
      document.body.style.willChange = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.scrollBehavior = '';
    };
  }, [loading]);

  // Set up optimized IntersectionObserver for visibility detection
  useEffect(() => {
    if (loading || !containerRef.current) return;

    checkVisibility();
    
    if ('IntersectionObserver' in window) {
      const options = {
        root: containerRef.current, // Always use container as root for both mobile and desktop
        rootMargin: '300px', // Increased margin for earlier loading
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

  // Always use desktop view rendering regardless of device
  const renderGalleryContent = () => (
    <>
      {/* Grupo de primeras imágenes (basado en el layout que se ve en la imagen) */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        top="90%" 
        left="450px"
        height="10vh" 
        zIndex={2}
        isVisible={visibleImages[0] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.P1} alt="PLATA 1" loading="eager" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[1] = el}
        top="50%" 
        left="600px"
        height="75vh" 
        zIndex={2}
        isVisible={visibleImages[1] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.P2} alt="PLATA 2" loading="eager" />
      </ImageItem>

      {/* Icono plus */}
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        top="50%" 
        left="1350px"
        height="75vh" 
        zIndex={3}
        isVisible={visibleImages[2] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.P3} alt="PLATA 3" loading="eager" />
      </ImageItem>


      {/* Imagen central */}
      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        top="50%" 
        left="2000px"
        height="100vh" 
        zIndex={2}
        isVisible={visibleImages[3] !== false}
        isMobile={isMobile}
        sx={{ 
          transform: 'translateY(-50%) translateZ(0) rotate(10deg) scale(1.4)', // Añadido rotate y scale
          transformOrigin: 'center center'
        }}
      >
        <Box component="img" src={images.P4} alt="PLATA 4" loading="eager" />
      </ImageItem>

      {/* Logo BLUE */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top="80%" 
        left="2780px"
        height="10vh" 
        zIndex={2}
        isVisible={visibleImages[4] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.P5} alt="PLATA 5" loading="eager" />
      </ImageItem>

      {/* imagen central */}
      <ImageItem 
        ref={el => imageRefs.current[5] = el}
        top="45%" 
        left="2900px"
        height="60vh" 
        zIndex={2}
        isVisible={visibleImages[5] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.P6} alt="PLATA 6" loading="eager" />
      </ImageItem>

      {/* Logo PLATA grande como textura de fondo */}
      <ImageItem 
        ref={el => imageRefs.current[6] = el}
        top="88%" 
        left="3550px"
        height="15vh" 
        zIndex={1}
        isVisible={visibleImages[6] !== false}
        isMobile={isMobile}
        sx={{ 
          transform: 'translateY(-50%) translateZ(0)',
        }}
      >
        <Box component="img" src={images.P7} alt="PLATA 7" loading="lazy" />
      </ImageItem>

      {/* Imágenes en UV (morado) */}
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        top="6%" 
        left="4050px"
        height="5vh" 
        zIndex={3}
        isVisible={visibleImages[7] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.P8} alt="PLATA 8" loading="lazy" />
      </ImageItem>

      <ImageItem 
        ref={el => imageRefs.current[8] = el}
        top="50%" 
        left="4300px"
        height="90vh" 
        zIndex={3}
        isVisible={visibleImages[8] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.P9} alt="PLATA 9" loading="lazy" />
      </ImageItem>

      {/* remeras */}
      <ImageItem 
        ref={el => imageRefs.current[9] = el}
        top="50%" 
        left="5350px"
        height="170vh" 
        zIndex={3}
        isVisible={visibleImages[9] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.P10} alt="PLATA 10" loading="lazy" />
      </ImageItem>

      <ImageItem 
        ref={el => imageRefs.current[10] = el}
        top="55%" 
        left="5300px"
        height="70vh" 
        zIndex={1}
        isVisible={visibleImages[10] !== false}
        isMobile={isMobile}
        sx={{ 
            transform: 'translateY(-50%) translateZ(0)',
            opacity: 0.2  // Aquí defines la opacidad (0 es completamente transparente, 1 es completamente opaco)
        }}
        >
        <Box component="img" src={images.P11} alt="PLATA 11" loading="lazy" />
        </ImageItem>

      {/* Las dos últimas fotos sobre fondo negro puro */}
      <ImageItem 
        ref={el => imageRefs.current[11] = el}
        top="50%" 
        left="7980px"
        height="100vh" 
        zIndex={4}
        isVisible={visibleImages[11] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.P12} alt="PLATA 12" loading="lazy" />
      </ImageItem>

      <ImageItem 
        ref={el => imageRefs.current[12] = el}
        top="50%" 
        left="8700px"
        height="100vh" 
        zIndex={4}
        isVisible={visibleImages[12] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.P13} alt="PLATA 13" loading="lazy" />
      </ImageItem>
    </>
  );

  return (
    <>
      <MediumFontStyle />
      <MyriadFontStyle />
      
      {/* Loading screen with title animation */}
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          <LoadingTitle ref={titleRef}>
            Plata
          </LoadingTitle>
          
          <LoadingYear ref={yearRef}>
            2024
          </LoadingYear>
          
          {/* Barra de progreso personalizada en lugar del círculo */}
          <ProgressBarContainer>
            <ProgressBarFill progress={loadProgress} />
          </ProgressBarContainer>
        </LoadingScreen>
      )}
      
      {/* Scroll progress bar - always visible after loading but controlled by Lenis via data-scroll-progress */}
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

export default PlataGallery;
