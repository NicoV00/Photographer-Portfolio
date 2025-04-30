import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow';
import useSmoothScroll from './useSmoothScroll';
import { getGalleryColors } from '../utils/galleryColors';
import InfinityLoader from './InfinityLoader';

// Get the color theme for this gallery
const galleryTheme = getGalleryColors('maison');

// Custom font loading
const GlobalStyle = styled('style')({
  '@font-face': [
    {
      fontFamily: 'Medium OTF',
      src: 'url("/fonts/Medium.otf") format("opentype")',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontDisplay: 'swap',
    },
    {
      fontFamily: 'Old London',
      src: 'url("/fonts/OldLondon.ttf") format("truetype")',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontDisplay: 'swap',
    }
  ],
});

// Scroll ribbon component that runs horizontally
const ScrollRibbon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isBottom'
})(({ theme, position = 'top', isBottom = false }) => ({
  position: 'fixed',
  [position]: 0,
  left: 0,
  width: '100%',
  height: isBottom ? '30px' : '30px',
  padding: isBottom ? '0 0 0 0' : '0 0 0 0',
  overflowX: 'hidden',
  overflowY: 'hidden',
  backgroundColor: '#000',
  zIndex: isBottom ? 100 : 9998, // Lower z-index for bottom ribbon
  display: 'flex',
  alignItems: 'center',
  pointerEvents: 'none', // Make sure it doesn't block interaction
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundImage: 'linear-gradient(to right, #000 0%, rgba(0,0,0,0.5) 5%, rgba(0,0,0,0.5) 95%, #000 100%)',
    zIndex: 1,
  },
  [theme.breakpoints.down('sm')]: {
    height: isBottom ? '24px' : '24px', // Ligeramente más pequeño en móvil
  },
}));

// Text container with infinite scroll animation
const ScrollText = styled(Box)({
  display: 'flex',
  whiteSpace: 'nowrap',
  animation: 'scrollText 35s linear infinite',
  fontFamily: '"Old London", serif',
  fontSize: '17px',
  letterSpacing: '1px',
  color: '#fff',
  '@keyframes scrollText': {
    '0%': {
      transform: 'translateX(0)',
    },
    '100%': {
      transform: 'translateX(-50%)',
    },
  },
  '@media (max-width: 600px)': {
    fontSize: '14px', // Texto más pequeño en móvil
  },
});

// Loading screen
const LoadingScreen = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: galleryTheme.main,
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

// Separate components for MAISON and 2024
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '45px',
  fontWeight: 'bold',
  color: galleryTheme.text,
  letterSpacing: '2px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  [theme.breakpoints.down('sm')]: {
    fontSize: '32px', // Más pequeño en móvil
  },
}));

const LoadingYear = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '40px',
  fontWeight: 'bold',
  color: galleryTheme.text,
  letterSpacing: '2px',
  marginTop: '8px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  marginBottom: '40px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '28px', // Más pequeño en móvil
  },
}));

// Optimized container with GPU acceleration for smoother scrolling
const GalleryContainer = styled(Box)(({ theme }) => ({
  backgroundColor: galleryTheme.main,
  width: '100vw',
  height: '100vh',
  position: 'relative',
  overflowX: 'auto',
  overflowY: 'hidden',
  transform: 'translateZ(0)',  // Force GPU acceleration
  perspective: '1000px',      // Enhance GPU acceleration
  backfaceVisibility: 'hidden', // Further GPU optimization
  willChange: 'scroll-position',
  '-webkit-overflow-scrolling': 'touch',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  [theme.breakpoints.down('sm')]: {
    overflowX: 'auto', // Changed from 'hidden' to 'auto' to allow horizontal scrolling on mobile
    overflowY: 'hidden', // Changed from 'auto' to 'hidden' to prevent vertical scrolling on mobile
    height: '100vh', // Keep same height as desktop
    minHeight: '100vh',
  }
}));

// Content container
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '10100px',
  height: '100%',
  padding: '40px',
  paddingRight: '300px',
  position: 'relative',
  transform: 'translateZ(0)',  // Force GPU acceleration
  [theme.breakpoints.down('sm')]: {
    width: '6060px', // 60% del ancho original (10100 * 0.6)
    flexDirection: 'row', // Changed from 'column' to 'row' for horizontal layout
    height: '100%', // Keep the same height as desktop
    padding: '20px', // Menos padding en móvil
    paddingRight: '150px', // Menos padding en móvil
  },
}));

// Image item with GPU acceleration
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => !['isMobile', 'top', 'left', 'isVisible', 'mobileTop', 'mobileLeft', 'mobileHeight', 'mobileWidth'].includes(prop)
})(({ 
  theme, 
  top, 
  left, 
  width, 
  height, 
  zIndex = 1, 
  isMobile = false, 
  isVisible = true,
  // Props específicos para móvil
  mobileTop,
  mobileLeft,
  mobileHeight,
  mobileWidth
}) => ({
  position: 'absolute',
  top: top,
  left: left,
  width: width,
  height: height,
  zIndex: zIndex,
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
    boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)', // Force GPU acceleration
  },
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '2px',
    boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
    transform: 'translateZ(0)', // Force GPU acceleration
  },
  [theme.breakpoints.down('sm')]: {
    top: mobileTop || top,
    left: mobileLeft || (left ? `${parseInt(left) * 0.6}px` : left),
    width: mobileWidth || (width === 'auto' ? 'auto' : width ? `${parseInt(width) * 0.7}px` : width),
    height: mobileHeight || (height === 'auto' ? 'auto' : height ? (height.includes('vh') ? `${parseInt(height) * 0.9}vh` : `${parseInt(height) * 0.7}px`) : height),
    '& img': {
      boxShadow: 'none', // Sin sombras en móvil
    },
    '& video': {
      boxShadow: 'none', // Sin sombras en móvil
    }
  },
}));

// Frame for video with glow effect
const VideoFrame = styled(Box, {
  shouldForwardProp: (prop) => !['isMobile', 'top', 'left', 'isVisible', 'mobileTop', 'mobileLeft', 'mobileHeight', 'mobileWidth'].includes(prop)
})(({ 
  theme, 
  top, 
  left, 
  width, 
  height, 
  zIndex = 1, 
  isMobile = false, 
  isVisible = true,
  // Props específicos para móvil
  mobileTop,
  mobileLeft,
  mobileHeight,
  mobileWidth
}) => ({
  position: 'absolute',
  top: top,
  left: left,
  width: width,
  height: height,
  zIndex: zIndex,
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateZ(0)' : 'translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
  border: `1px solid ${galleryTheme.text}`,
  borderRadius: '2px',
  padding: '0',
  boxShadow: `0 0 15px ${galleryTheme.highlight}33`,
  overflow: 'hidden',
  background: galleryTheme.text,
  backfaceVisibility: 'hidden', // GPU optimization
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'translateZ(0)', // Force GPU acceleration
  },
  [theme.breakpoints.down('sm')]: {
    top: mobileTop || top,
    left: mobileLeft || (left ? `${parseInt(left) * 0.6}px` : left),
    width: mobileWidth || (width === 'auto' ? 'auto' : width ? `${parseInt(width) * 0.7}px` : width),
    height: mobileHeight || (height === 'auto' ? 'auto' : height ? (height.includes('vh') ? `${parseInt(height) * 0.9}vh` : `${parseInt(height) * 0.7}px`) : height),
    boxShadow: 'none', // Sin sombras en móvil
    border: `1px solid ${galleryTheme.text}`, // Mantener el borde
  },
}));

const MaisonGallery = ({ onBack }) => {
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

  // Images for MAISON - using the correct folder path
  const images = useMemo(() => ({
    M1: '/images/MDLST/MDLST-1.png',
    M2: '/images/MDLST/MDLST-2.png',
    M3: '/images/MDLST/MDLST-3.png',
    M4: '/images/MDLST/MDLST-4.png',
    M5: '/images/MDLST/MDLST-5.png',
    M6: '/images/MDLST/MDLST-6.jpg',
    M7: '/images/MDLST/MDLST-7.jpg',
    M8: '/images/MDLST/MDLST-8.jpg',
    M9: '/images/MDLST/MDLST-9.mp4',
    M10: '/images/MDLST/MDLST-10.jpg',
    M11: '/images/MDLST/MDLST-11.jpg',
    M12: '/images/MDLST/MDLST-12.jpg',
    M13: '/images/MDLST/MDLST-13.jpg'
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

  // Generate repeating scroll text
  const generateScrollText = () => {
    // Create 40 repetitions to ensure it fully covers the screen width with no gaps
    const repeats = [...Array(40)].map((_, i) => (
      <span key={i} style={{ margin: '0 3px' }}>
        DLST - - →
      </span>
    ));
    return repeats;
  };

  // Renderizado del contenido de la galería adaptado para móvil
  const renderGalleryContent = () => (
    <>
      {/* 1. First image - Man seated in industrial space */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        top="50%"
        left="450px"
        height="85vh"
        width="auto" // Añadido width original para referencia
        zIndex={2}
        isVisible={visibleImages[0] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="50%"
        mobileLeft="270px"
        mobileHeight="76vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 35% del ancho de pantalla
      >
        <Box component="img" src={images.M1} alt="MAISON 1" loading="eager" />
      </ImageItem>
      
      {/* 2. Close-up of hand with rings */}
      <ImageItem 
        ref={el => imageRefs.current[1] = el}
        top="25%"
        left="1300px"
        height="55vh"
        width="auto" // Añadido width original para referencia
        zIndex={3}
        isVisible={visibleImages[1] !== false}
        isMobile={isMobile}
        // Ajustes específicos para móvil
        mobileTop="25%"
        mobileLeft="780px"
        mobileHeight="49vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 30% del ancho de pantalla
      >
        <Box component="img" src={images.M2} alt="MAISON 2" loading="eager" />
      </ImageItem>
      
      {/* 3. Man walking on metro platform */}
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        left="1550px" 
        height="100vh"
        width="auto" // Añadido width original para referencia
        zIndex={2}
        isVisible={visibleImages[2] !== false}
        isMobile={isMobile}
        // Ajustes específicos para móvil
        mobileLeft="930px"
        mobileHeight="90vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 33% del ancho de pantalla
      >
        <Box component="img" src={images.M3} alt="MAISON 3" loading="eager" />
      </ImageItem>
      
      {/* 4. Abstract logo */}
      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        top="35%" 
        left="2240px" 
        height="55vh"
        width="auto" // Añadido width original para referencia
        zIndex={3}
        isVisible={visibleImages[3] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="35%"
        mobileLeft="1344px"
        mobileHeight="49vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 30% del ancho de pantalla
      >
        <Box component="img" src={images.M4} alt="MAISON 4" loading="eager" />
      </ImageItem>

      {/* 5. Logo (background) */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top="70%" 
        left="2110px"
        height="120vh"
        width="auto" // Añadido width original para referencia
        zIndex={1}
        isVisible={visibleImages[4] !== false}
        isMobile={isMobile}
        sx={{ 
          transform: 'translateY(-50%) translateZ(0) rotate(35deg)', 
          opacity: 0.1,
          '& img': {
            boxShadow: 'none',
            borderRadius: 0
          }
        }}
        // Ajustes específicos para móvil
        mobileTop="70%"
        mobileLeft="1266px"
        mobileHeight="108vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 40% del ancho de pantalla (más grande por ser un fondo)
      >
        <Box component="img" src={images.M5} alt="MAISON 5" loading="eager" />
      </ImageItem>
      
      {/* 6. Image */}
      <ImageItem 
        ref={el => imageRefs.current[5] = el}
        top="50%" 
        left="3500px"
        height="70vh"
        width="auto" // Añadido width original para referencia
        zIndex={2}
        isVisible={visibleImages[5] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="50%"
        mobileLeft="2100px"
        mobileHeight="63vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 32% del ancho de pantalla
      >
        <Box component="img" src={images.M6} alt="MAISON 6" loading="eager" />
      </ImageItem>
      
      {/* 7. Double panel of man seated in metro */}
      <ImageItem 
        ref={el => imageRefs.current[6] = el}
        top="50%" 
        left="4120px"
        height="70vh"
        width="auto" // Añadido width original para referencia
        zIndex={2}
        isVisible={visibleImages[6] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="50%"
        mobileLeft="2472px"
        mobileHeight="63vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 32% del ancho de pantalla
      >
        <Box component="img" src={images.M7} alt="MAISON 7" loading="eager" />
      </ImageItem>
      
      {/* 8. Man standing on metro platform */}
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        top="50%" 
        left="4735px"
        height="70vh"
        width="auto" // Añadido width original para referencia
        zIndex={2}
        isVisible={visibleImages[7] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="50%"
        mobileLeft="2841px"
        mobileHeight="63vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 30% del ancho de pantalla
      >
        <Box component="img" src={images.M8} alt="MAISON 8" loading="lazy" />
      </ImageItem>
      
      {/* 9. White frame with video and glow effect */}
      <VideoFrame 
        ref={el => imageRefs.current[8] = el}
        top="50%" 
        left="5560px"
        height="85vh"
        width="auto" // Añadido width original para referencia
        zIndex={2}
        isVisible={visibleImages[8] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="50%"
        mobileLeft="3336px"
        mobileHeight="76vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 37% del ancho de pantalla (ligeramente más grande por ser video)
      >
        <Box 
          component="video"
          src={images.M9}
          alt="MAISON Video"
          autoPlay
          loop
          muted
          playsInline
        />
      </VideoFrame>
      
      {/* 10. Man leaning on column in metro */}
      <ImageItem 
        ref={el => imageRefs.current[9] = el}
        top="41%" 
        left="6340px"
        height="55vh"
        width="auto" // Añadido width original para referencia
        zIndex={2}
        isVisible={visibleImages[9] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="41%"
        mobileLeft="3804px"
        mobileHeight="49vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 32% del ancho de pantalla
      >
        <Box component="img" src={images.M10} alt="MAISON 10" loading="lazy" />
      </ImageItem>
      
      {/* 11. Image #11 */}
      <ImageItem 
        ref={el => imageRefs.current[10] = el}
        top="124px" 
        left="7020px"
        height="55vh"
        width="auto" // Añadido width original para referencia
        zIndex={2}
        isVisible={visibleImages[10] !== false}
        isMobile={isMobile}
        // Ajustes específicos para móvil
        mobileTop="111px"
        mobileLeft="4212px"
        mobileHeight="49vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 33% del ancho de pantalla
      >
        <Box component="img" src={images.M11} alt="MAISON 11" loading="lazy" />
      </ImageItem>
      
      {/* 12. Image #12 */}
      <ImageItem 
        ref={el => imageRefs.current[11] = el}
        left="8000px"
        height="80vh"
        width="auto" // Añadido width original para referencia
        zIndex={2}
        isVisible={visibleImages[11] !== false}
        isMobile={isMobile}
        // Ajustes específicos para móvil
        mobileLeft="4800px"
        mobileHeight="72vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 34% del ancho de pantalla
      >
        <Box component="img" src={images.M12} alt="MAISON 12" loading="lazy" />
      </ImageItem>
      
      {/* 13. Image #13 */}
      <ImageItem 
        ref={el => imageRefs.current[12] = el}
        top="50%" 
        left="9000px"
        height="100vh"
        width="auto" // Añadido width original para referencia
        zIndex={2}
        isVisible={visibleImages[12] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="50%"
        mobileLeft="5400px"
        mobileHeight="90vh"
        mobileWidth="auto" // Ancho relativo al viewport - aproximadamente 38% del ancho de pantalla (imagen más importante)
      >
        <Box component="img" src={images.M13} alt="MAISON 13" loading="lazy" />
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
            MAISON
          </LoadingTitle>
          
          <LoadingYear ref={yearRef}>
            2024
          </LoadingYear>
          
          <InfinityLoader 
            color={galleryTheme.text}
            progress={loadProgress}
          />
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
      
      {/* Top scroll ribbon */}
      <ScrollRibbon position="top">
        <ScrollText>
          {generateScrollText()}
        </ScrollText>
      </ScrollRibbon>
      
      {/* Bottom scroll ribbon */}
      <ScrollRibbon position="bottom" isBottom={true}>
        <ScrollText>
          {generateScrollText()}
        </ScrollText>
      </ScrollRibbon>
      
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

export default MaisonGallery;
