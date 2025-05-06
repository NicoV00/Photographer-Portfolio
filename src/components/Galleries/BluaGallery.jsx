import React, { useState, useRef, useEffect } from 'react';
import { Box, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow';
import useSmoothScroll from './useSmoothScroll';

// Custom color theme for Constelacion gallery
const galleryTheme = {
  main: '#dbdae5', // Light lavender/purple background color
  text: '#000000', // Black text
  highlight: '#8481a0', // Darker version of the main color for highlights
  secondary: '#f0f0f5', // Light color for secondary elements
};

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
  backgroundColor: galleryTheme.main, // Using theme main color
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  transition: 'opacity 0.5s ease-out',
  overflow: 'hidden', // Prevent any overflow during animations
}));

// Separate components for CONSTELACION and 2024
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '45px',
  fontWeight: 'bold',
  color: galleryTheme.text, // Using theme text color
  letterSpacing: '2px',
  position: 'relative', // For positioning relative to container
  transform: 'translateY(100px)', // Start below viewport (for animation)
  opacity: 0,
  [theme.breakpoints.down('sm')]: {
    fontSize: '32px', // Más pequeño en móvil
  },
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
  [theme.breakpoints.down('sm')]: {
    fontSize: '28px', // Más pequeño en móvil
  },
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

// Styled components using MUI styling system
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
    height: '100vh', // Keep full height
    minHeight: '100vh',
  },
}));

const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '4600px', // Wide enough for horizontal content
  height: '100%',
  padding: '40px',
  paddingRight: '300px', // Extra padding at the end
  position: 'relative',
  transform: 'translateZ(0)',  // Force GPU acceleration
  [theme.breakpoints.down('sm')]: {
    width: '3000px', // Reduced width for mobile (65% of desktop)
    height: '100%', 
    padding: '20px', // Menos padding en móvil
    paddingRight: '150px', // Menos padding en móvil
    transform: 'translateZ(0)', // Keep GPU acceleration
  },
}));

// Image item - Updated to include mobile-specific properties like in MaisonGallery
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => 
    !['isMobile', 'top', 'left', 'isVisible', 'isPhoto', 'mobileTop', 'mobileLeft', 'mobileHeight', 'mobileWidth'].includes(prop)
})(({ 
  theme, 
  top, 
  left, 
  width, 
  height, 
  zIndex = 1, 
  isMobile = false, 
  isVisible = true, 
  isPhoto = true,
  // Props específicos para móvil
  mobileTop,
  mobileLeft,
  mobileHeight,
  mobileWidth
}) => ({
  position: 'absolute',
  top: isMobile ? mobileTop || top : top,
  left: isMobile ? mobileLeft || (left ? `${parseInt(left) * 0.6}px` : left) : left,
  width: isMobile ? mobileWidth || (width === 'auto' ? 'auto' : width ? `${parseInt(width) * 0.7}px` : width) : width,
  height: isMobile ? mobileHeight || (height === 'auto' ? 'auto' : height ? (height.includes('vh') ? `${parseInt(height) * 0.9}vh` : `${parseInt(height) * 0.7}px`) : height) : height,
  zIndex: zIndex,
  marginBottom: '0', // Remove margin 
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateZ(0)' : 'translateZ(0) scale(0.98)', // Pequeña animación de escala + aceleración hardware
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity', // Optimización para animaciones
  backfaceVisibility: 'hidden', // GPU optimization
  '& img': {
    width: '100%',
    height: isPhoto ? '100%' : 'auto',
    objectFit: isPhoto ? 'cover' : 'contain',
    borderRadius: isPhoto ? '2px' : '0',
    boxShadow: 'none', // Remove all shadows
    backfaceVisibility: 'hidden', // Reduce flickering en WebKit
    transform: 'translateZ(0)', // Force GPU acceleration
    cursor: isPhoto ? 'pointer' : 'default',
  }
}));

// Spotify Container with custom minimal styling - Updated for consistent positioning
const SpotifyContainer = styled(Box, {
  shouldForwardProp: (prop) => 
    !['isMobile', 'top', 'left', 'isVisible', 'mobileTop', 'mobileLeft', 'mobileWidth'].includes(prop)
})(({ 
  theme, 
  top, 
  left, 
  width = '300px', 
  zIndex = 1, 
  isMobile = false, 
  isVisible = true,
  // Props específicos para móvil
  mobileTop,
  mobileLeft,
  mobileWidth
}) => ({
  position: 'absolute',
  top: isMobile ? mobileTop || top : top,
  left: isMobile ? mobileLeft || (left ? `${parseInt(left) * 0.6}px` : left) : left,
  width: isMobile ? mobileWidth || (width ? `${parseInt(width) * 0.7}px` : width) : width,
  height: '80px',
  zIndex: zIndex,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: '12px',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateZ(0)' : 'translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  marginBottom: '0', // Remove margin
  backfaceVisibility: 'hidden', // GPU optimization
  backgroundColor: 'transparent',
  '& iframe': {
    border: 'none',
    width: '100%',
    height: '80px',
    backgroundColor: 'transparent',
    borderRadius: '12px',
    filter: 'grayscale(100%)', // Makes the player monochrome
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none', // Allows clicks to pass through to the iframe
    borderRadius: '12px',
    boxShadow: 'none', // Remove shadow
  }
}));

// Custom CSS injection for further Spotify player customization
const SpotifyCustomStyle = styled('style')({
  // This injects CSS that targets the Spotify iframe content
  // Note: This has limitations due to cross-origin restrictions
  html: {
    '--spotify-minimal-color': '#000',
    '--spotify-minimal-bg': 'transparent'
  }
});

const ConstelacionGallery = ({ onBack }) => {
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

  // Spotify track data for constellation with custom minimal UI
  const spotifyTrack = {
    id: '3VEQBNtshnnRnad8e0UhKV',
    // Using theme parameter to create a minimal UI and hide_cover=1 to hide album art
    embedUrl: 'https://open.spotify.com/embed/track/3VEQBNtshnnRnad8e0UhKV?utm_source=generator&theme=0&hide_cover=1'
  };
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Check which images are visible - updated for horizontal scrolling for both mobile and desktop
  const checkVisibility = React.useCallback(() => {
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
        let isVisible = (
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

  // Use the optimized smooth scroll hook with theme colors and horizontal for both desktop and mobile
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

  // Set up IntersectionObserver for visibility detection - horizontal for both
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

  // Añadido useEffect para detección específica de dispositivos móviles reales
  useEffect(() => {
    // Detectar dispositivos móviles reales con mayor precisión
    const detectRealMobile = () => {
      const ua = navigator.userAgent;
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    };
    
    // Si estamos en un dispositivo móvil real, forzar ciertos ajustes
    if (detectRealMobile()) {
      // Asegurar que los elementos se muestren correctamente
      document.documentElement.style.fontSize = '14px';
      // Deshabilitar el comportamiento elástico en iOS
      document.body.style.overscrollBehavior = 'none';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      // Limpiar ajustes
      document.documentElement.style.fontSize = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
    };
  }, []);

  // Single gallery content rendering function for both mobile and desktop with mobile-specific positioning
  const renderGalleryContent = () => (
    <>
      {/* b1.jpg - Main photo */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        top="50%"
        left="450px"
        width="auto"
        height="85vh"
        zIndex={2}
        isVisible={visibleImages[0] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="45%" 
        mobileLeft="270px"
        mobileHeight="70vh"
        mobileWidth="70vh"
      >
        <Box 
          component="img" 
          src="/images/blua/b1.jpg" 
          alt="Retrato de joven con suéter gris" 
          loading="eager"
        />
      </ImageItem>

      {/* Spotify embed */}
      <SpotifyContainer 
        ref={el => imageRefs.current[1] = el}
        top="50%"
        left="1400px"
        width="320px" 
        zIndex={2}
        isVisible={visibleImages[1] !== false}
        isMobile={isMobile}
        sx={{ 
          transform: 'translateY(-50%) translateZ(0)',
          '& iframe': {
            opacity: 0.9
          }
        }}
        // Ajustes específicos para móvil
        mobileTop="50%" 
        mobileLeft="940px"
        mobileWidth="220px"
      >
        <Box 
          component="iframe" 
          src={spotifyTrack.embedUrl}
          width="100%"
          height="80px"
          frameBorder="0"
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </SpotifyContainer>

      {/* 2.png image */}
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        top="50%"
        left="2000px"
        width="2000px"
        height="auto"
        zIndex={2}
        isVisible={visibleImages[2] !== false}
        isPhoto={false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="45%" 
        mobileLeft="1300px"
        mobileHeight="auto"
        mobileWidth="1500px"
      >
        <Box 
          component="img" 
          src="/images/blua/2.png" 
          alt="Constelación" 
          loading="lazy"
        />
      </ImageItem>
    </>
  );

  return (
    <>
      <GlobalStyle />
      <SpotifyCustomStyle />
      
      {/* Pantalla de carga con texto animado y círculo de progreso */}
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          {/* Título "CONSTELACION" con animación de entrada desde abajo */}
          <LoadingTitle ref={titleRef}>
            CONSTELACION
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
      
      {/* Flecha de navegación */}
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

export default ConstelacionGallery;
