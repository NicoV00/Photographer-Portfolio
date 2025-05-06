'use client';

// Importaciones necesarias
import React, { useState, useRef, useEffect } from 'react';
import { Box, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow';
import useSmoothScroll from './useSmoothScroll';
import { getGalleryColors } from '../utils/galleryColors';

// Obtener el tema de colores para esta galería
const galleryTheme = getGalleryColors('vestimeteo');

// FUENTES PERSONALIZADAS
// --------------------------------------
const GlobalStyle = styled('style')({
  '@font-face': {
    fontFamily: 'Medium OTF',
    src: 'url("/fonts/Medium.otf") format("opentype")',
    fontWeight: 'normal',
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
  backgroundColor: '#f5f5f5',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  transition: 'opacity 0.5s ease-out',
  overflow: 'hidden',
  padding: '20px',
}));

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

const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
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
  const scrollThreshold = 2500;
  const transitionLength = 800;
  const gradientProgress = Math.min(Math.max((scrollPosition - scrollThreshold) / transitionLength, 0), 1);
  const initialColor = '#F1F2F2';
  const finalColor = galleryTheme.main;

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

  const bgColor = scrollPosition < scrollThreshold ? initialColor : interpolateColor(gradientProgress);

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
    willChange: 'scroll-position',
    '-webkit-overflow-scrolling': 'touch',
    '&::-webkit-scrollbar': { display: 'none' },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };
});

// Contenido de la galería
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  padding: '40px',
  paddingRight: '300px',
  position: 'relative',
  transform: 'translateZ(0)',
  width: '7500px',
  [theme.breakpoints.down('lg')]: {
    width: '7000px',
  },
  [theme.breakpoints.down('md')]: {
    width: '6000px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '5200px',
  },
  [theme.breakpoints.down('xs')]: {
     width: '4800px',
  },
}));

// ELEMENTO DE IMAGEN
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


const VestimeTeoGallery = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);
  const progressBarRef = useRef(null);
  const containerRef = useRef(null);
  const [visibleImages, setVisibleImages] = useState({});
  const imageRefs = useRef([]);

  const images = [
    '/images/TEO/V1.jpg', '/images/TEO/V2.jpg', '/images/TEO/asd.jpg',
    '/images/TEO/V6.jpg', '/images/TEO/V8.jpg', '/images/TEO/V9.jpg',
    '/images/TEO/V5.jpg', '/images/TEO/V7.jpg',
  ];

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('xs'));
  const isSm = useMediaQuery(theme.breakpoints.between('xs', 'sm'));
  const isMd = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLg = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isXl = useMediaQuery(theme.breakpoints.up('lg'));
  const activeBreakpoints = { isXs, isSm, isMd, isLg, isXl };
  const isMobileForScroll = useMediaQuery(theme.breakpoints.down('sm'));


  const imageConfigurations = {
    V1: { // img index 0
      xl: { top: "50%", left: "450px", height: "70%", innerMaxWidth: "550px", zIndex: 2 },
      lg: { top: "50%", left: "380px", height: "70%", innerMaxWidth: "500px", zIndex: 2 },
      md: { top: "50%", left: "250px", height: "75%", innerMaxWidth: "400px", zIndex: 2 },
      sm: { top: "50%", left: "120px", height: "85%", innerMaxWidth: "350px", zIndex: 2 },
      xs: { top: "50%", left: "80px",  height: "80%", innerMaxWidth: "80vw", zIndex: 2 },
    },
    V2: { // img index 1
      xl: { top: "50%", left: "1100px", height: "70%", innerMaxWidth: "550px", zIndex: 2 },
      lg: { top: "50%", left: "950px",  height: "70%", innerMaxWidth: "500px", zIndex: 2 },
      md: { top: "50%", left: "750px",  height: "75%", innerMaxWidth: "400px", zIndex: 2 },
      sm: { top: "50%", left: "700px",  height: "85%", innerMaxWidth: "350px", zIndex: 2 },
      xs: { top: "50%", left: "550px",  height: "80%", innerMaxWidth: "80vw", zIndex: 2 },
    },
    asd: { // img index 2 - AJUSTADO
      xl: { top: "50%", left: "1900px", height: "100%", innerMaxWidth: "none", zIndex: 2 }, // Desktop: 100% height, sin restricción explícita de maxWidth interno
      lg: { top: "50%", left: "1700px", height: "100%", innerMaxWidth: "none", zIndex: 2 }, // Desktop: 100% height
      md: { top: "50%", left: "1400px", height: "100%", innerMaxWidth: "none", zIndex: 2 },  // Tablet: 100% height
      sm: { top: "45%", left: "1300px", height: "100%", innerMaxWidth: "1100px", zIndex: 2 },// Mobile: 100% height como solicitado
      xs: { top: "45%", left: "1100px", height: "100%", innerMaxWidth: "90vw",   zIndex: 2 }, // Mobile: 100% height
    },
    V6: { // img index 3
      xl: { top: "50%", left: "3950px", height: "70%", innerMaxWidth: "550px", zIndex: 2 },
      lg: { top: "50%", left: "3500px", height: "70%", innerMaxWidth: "500px", zIndex: 2 },
      md: { top: "50%", left: "2900px", height: "75%", innerMaxWidth: "400px", zIndex: 2 },
      sm: { top: "50%", left: "2600px", height: "85%", innerMaxWidth: "350px", zIndex: 2 },
      xs: { top: "50%", left: "2200px", height: "80%", innerMaxWidth: "80vw", zIndex: 2 },
    },
    V8: { // img index 4
      xl: { top: "50%", left: "4650px", height: "70%", innerMaxWidth: "550px", zIndex: 2 },
      lg: { top: "50%", left: "4200px", height: "70%", innerMaxWidth: "500px", zIndex: 2 },
      md: { top: "50%", left: "3500px", height: "75%", innerMaxWidth: "400px", zIndex: 2 },
      sm: { top: "50%", left: "3100px", height: "85%", innerMaxWidth: "350px", zIndex: 2 },
      xs: { top: "50%", left: "2700px", height: "80%", innerMaxWidth: "80vw", zIndex: 2 },
    },
    V9: { // img index 5
      xl: { top: "30%", left: "5470px", height: "50%", innerMaxWidth: "450px", zIndex: 1 },
      lg: { top: "30%", left: "4900px", height: "50%", innerMaxWidth: "400px", zIndex: 1 },
      md: { top: "32%", left: "4100px", height: "50%", innerMaxWidth: "350px", zIndex: 1 },
      sm: { top: "35%", left: "3700px", height: "50%", innerMaxWidth: "300px", zIndex: 1 },
      xs: { top: "35%", left: "3200px", height: "45%", innerMaxWidth: "70vw", zIndex: 1 },
    },
    V5: { // img index 6
      xl: { top: "70%", left: "5800px", height: "50%", innerMaxWidth: "450px", zIndex: 0 },
      lg: { top: "70%", left: "5200px", height: "50%", innerMaxWidth: "400px", zIndex: 0 },
      md: { top: "68%", left: "4450px", height: "50%", innerMaxWidth: "350px", zIndex: 0 },
      sm: { top: "60%", left: "4000px", height: "50%", innerMaxWidth: "300px", zIndex: 0 },
      xs: { top: "60%", left: "3500px", height: "45%", innerMaxWidth: "70vw", zIndex: 0 },
    },
    V7: { // img index 7
      xl: { top: "50%", left: "6800px", height: "100%", innerMaxWidth: "700px", zIndex: 2 },
      lg: { top: "50%", left: "6100px", height: "100%", innerMaxWidth: "650px", zIndex: 2 },
      md: { top: "48%", left: "5200px", height: "100%", innerMaxWidth: "600px", zIndex: 2 },
      sm: { top: "45%", left: "4700px", height: "100%", innerMaxWidth: "600px", zIndex: 2 },
      xs: { top: "45%", left: "4200px", height: "95%",  innerMaxWidth: "90vw",  zIndex: 2 },
    },
  };

  const getCurrentStyles = (imageKey, breakpoints) => {
    const config = imageConfigurations[imageKey];
    if (!config) return { top: "50%", left: "0px", height: "50%", innerMaxWidth: "300px", zIndex: 1 }; // Fallback muy genérico
    if (breakpoints.isXs) return config.xs || config.sm;
    if (breakpoints.isSm) return config.sm;
    if (breakpoints.isMd) return config.md;
    if (breakpoints.isLg) return config.lg;
    if (breakpoints.isXl) return config.xl;
    return config.xl;
  };

  const checkVisibility = React.useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const preloadMargin = containerWidth * 1.2;
    const newVisibility = {};
    imageRefs.current.forEach((itemRef, index) => {
      if (itemRef && itemRef.current) {
        const imageRect = itemRef.current.getBoundingClientRect();
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

  const { scrollLeft, scrollProgress } = useSmoothScroll({
    containerRef,
    isMobile: isMobileForScroll,
    isLoading: loading,
    checkVisibility,
    horizontal: true,
    duration: 2.5,
    wheelMultiplier: 1.2,
    touchMultiplier: 2,
    lerp: 0.04,
    colors: galleryTheme
  });

  useEffect(() => {
    if (!loading) return;
    if (titleRef.current && yearRef.current) {
      gsap.to(titleRef.current, { y: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 0.3 });
      gsap.to(yearRef.current, { y: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 0.5 });
    }
    return () => {
      if (titleRef.current) gsap.killTweensOf(titleRef.current);
      if (yearRef.current) gsap.killTweensOf(yearRef.current);
    };
  }, [loading]);

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
                y: -100, opacity: 0, duration: 0.8, ease: "power2.in", stagger: 0.1,
                onComplete: () => {
                  gsap.to(loadingScreenRef.current, {
                    opacity: 0, duration: 0.5, delay: 0.2,
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Forcing loading to complete');
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

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

  useEffect(() => {
    if (loading || !containerRef.current) return;
    checkVisibility();
    if ('IntersectionObserver' in window) {
      const options = { root: containerRef.current, rootMargin: '200px', threshold: 0.1 };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const id = entry.target.dataset.id;
          if (id) {
            setVisibleImages(prev => ({ ...prev, [id]: entry.isIntersecting }));
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

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOSDevice) {
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden';
    }
    return () => {
      if (isIOSDevice) {
        document.documentElement.style.height = '';
        document.body.style.height = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
      }
    };
  }, []);

  const renderImageItems = () => {
    const imageKeys = ['V1', 'V2', 'asd', 'V6', 'V8', 'V9', 'V5', 'V7'];
    return images.map((src, index) => {
      const imageKey = imageKeys[index];
      const styles = getCurrentStyles(imageKey, activeBreakpoints);

      if (!imageRefs.current[index]) {
        imageRefs.current[index] = React.createRef();
      }

      const imgSxStyles = { // Construir el objeto sx para la imagen interna
        objectFit: "contain",
        width: "100%",
        height: "100%",
      };

      if (styles.innerMaxWidth && styles.innerMaxWidth !== "none") {
        imgSxStyles.maxWidth = styles.innerMaxWidth;
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
            alt={`Vestimeteo ${imageKey}`}
            loading={index < 3 ? "eager" : "lazy"}
            sx={imgSxStyles}
          />
        </ImageItem>
      );
    });
  };

  return (
    <>
      <GlobalStyle />
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          <LoadingTitle ref={titleRef}>VESTIMETEO</LoadingTitle>
          <LoadingYear ref={yearRef}>2024</LoadingYear>
          <CircularProgress
            variant="determinate"
            value={loadProgress}
            size={70}
            thickness={3}
            sx={{ color: galleryTheme.text, marginTop: '10px' }}
          />
        </LoadingScreen>
      )}
      <ScrollProgressBar
        ref={progressBarRef}
        data-scroll-progress
        sx={{ opacity: loading ? 0 : 1 }}
      />
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
          {renderImageItems()}
        </GalleryContent>
      </GalleryContainer>
    </>
  );
};

export default VestimeTeoGallery;
