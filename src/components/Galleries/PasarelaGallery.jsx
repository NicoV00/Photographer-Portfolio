import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow';
import GalleryLoadingScreen from './GalleryLoadingScreen';
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
const galleryTheme = getGalleryColors('pasarela');

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

// Main container with horizontal scroll - optimized
const GalleryContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'scrollPosition'
})(({ theme, scrollPosition = 0 }) => {
  // Start transition after 5th image (around 3900px scroll)
  const scrollThreshold = 3900;
  // Complete transition over 800px of scrolling
  const transitionLength = 800;
  // Calculate transition progress (0 to 1)
  const gradientProgress = Math.min(Math.max((scrollPosition - scrollThreshold) / transitionLength, 0), 1);

  // Color stays the same (dark) throughout
  const initialColor = galleryTheme.main;
  const finalColor = galleryTheme.main;


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

// Content container with GPU acceleration
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '9300px',
  padding: '40px',
  paddingRight: '300px', // Extra padding at the end
  position: 'relative',
  transform: 'translateZ(0)',  // Force GPU acceleration
  [theme.breakpoints.down('sm')]: {
    width: '5800px', // Reducido para móvil (aproximadamente 62% del desktop)
    flexDirection: 'row',
    height: '100%',
    padding: '20px', // Menos padding
    paddingRight: '150px', // Menos padding al final
  },
}));

// Image item - optimized with GPU acceleration and mobile support
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) =>
    !['isMobile', 'top', 'left', 'isVisible', 'mobileTop', 'mobileLeft', 'mobileHeight', 'mobileWidth'].includes(prop)
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
  position: 'absolute', // Always use absolute positioning
  top: isMobile ? mobileTop || top : top,
  left: isMobile ? mobileLeft || (left ? `${parseInt(left) * 0.6}px` : left) : left,
  width: isMobile ? mobileWidth || (width === 'auto' ? 'auto' : width ? `${parseInt(width) * 0.7}px` : width) : width,
  height: isMobile ? mobileHeight || (height === 'auto' ? 'auto' : height ? (height.includes('vh') ? `${parseInt(height) * 0.85}vh` : `${parseInt(height) * 0.7}px`) : height) : height,
  zIndex: zIndex,
  marginBottom: '0', // No margin needed with absolute positioning
  opacity: isVisible ? 1 : 0,
  transform: 'translateZ(0)', // Solo GPU acceleration, sin animación de escala
  transition: 'opacity 0.5s ease', // Solo transición de opacidad
  willChange: 'opacity', // Solo opacidad cambiará
  backfaceVisibility: 'hidden', // GPU optimization
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '2px',
    boxShadow: 'none', // No shadows
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)', // Force GPU acceleration
  }
}));

const PasarelaGallery = ({ onBack }) => {
  // Loading screen state
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // References for animation elements
  const progressBarRef = useRef(null);
  const containerRef = useRef(null);

  // Image visibility state and references
  const [visibleImages, setVisibleImages] = useState({});
  const imageRefs = useRef([]);

  // Get theme for media queries
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Images for PASARELA gallery
  const images = useMemo(() => [
    '/images/PASARELA/webp/PASARELA MUF-1.webp',
    '/images/PASARELA/webp/PASARELA MUF-2.webp',
    '/images/PASARELA/webp/PASARELA MUF-3.webp',
    '/images/PASARELA/webp/PASARELA MUF-4.webp',
    '/images/PASARELA/webp/PASARELA MUF-5.webp',
    '/images/PASARELA/PASARELA MUF-6.png',
    '/images/PASARELA/webp/PASARELA MUF-7.webp',
    '/images/PASARELA/webp/PASARELA MUF-8.webp',
    '/images/PASARELA/PASARELA MUF-9.png',
    '/images/PASARELA/webp/PASARELA MUF-10.webp',
    '/images/PASARELA/webp/PASARELA MUF-11.webp',
    '/images/PASARELA/webp/PASARELA MUF-12(PORTADA).webp',
    '/images/PASARELA/webp/PASARELA MUF-13.webp',
  ], []);

  // Updated visibility check to always use horizontal scrolling logic
  const checkVisibility = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;

    const preloadMargin = containerWidth * 0.8;

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

  // Loading progress animation effect
  useEffect(() => {
    let interval;

    if (loading) {
      interval = setInterval(() => {
        setLoadProgress(prev => {
          const next = prev + (Math.random() * 15);
          if (next >= 100) {
            clearInterval(interval);
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

  // Handle loading animation complete
  const handleLoadingComplete = () => {
    setLoading(false);
  };

  // Optimize browser performance AND cleanup on unmount
  useEffect(() => {
    if (!loading) {
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    return () => {
      console.log('🧹 Cleaning up PasarelaGallery...');
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.scrollBehavior = '';

      // Kill all GSAP animations for this component
      if (window.gsap) {
        window.gsap.killTweensOf("*");
      }
    };
  }, [loading]);

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
  }, [loading, isMobile, checkVisibility]);

  // Gallery content rendering function - Using fixed positioning with mobile support
  const renderGalleryContent = () => (
    <>
      {/* Imagen 1 - Primera fila (izquierda) */}
      <ImageItem
        ref={el => imageRefs.current[0] = el}
        top="50%"
        left="0px"
        height="100vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[0] !== false}
        isMobile={isMobile}
        mobileTop="42%"
        mobileLeft="0px"
        mobileHeight="85vh"
      >
        <Box component="img" src={images[0]} alt="PASARELA 1" loading="eager" />
      </ImageItem>

      {/* Imagen 2 - Primera fila */}
      <ImageItem
        ref={el => imageRefs.current[1] = el}
        top="50%"
        left="1900px"
        height="80vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[1] !== false}
        isMobile={isMobile}
        mobileTop="42%"
        mobileLeft="1140px"
        mobileHeight="68vh"
      >
        <Box component="img" src={images[1]} alt="PASARELA 2" loading="lazy" />
      </ImageItem>

      {/* Imagen 3 - Primera fila */}
      <ImageItem
        ref={el => imageRefs.current[2] = el}
        top="40%"
        left="2800px"
        height="40vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[2] !== false}
        isMobile={isMobile}
        mobileTop="32%"
        mobileLeft="1680px"
        mobileHeight="34vh"
      >
        <Box component="img" src={images[2]} alt="PASARELA 3" loading="lazy" />
      </ImageItem>

      {/* Imagen 4 - Primera fila */}
      <ImageItem
        ref={el => imageRefs.current[3] = el}
        top="50%"
        left="3100px"
        height="85vh"
        width="auto"
        zIndex={1}
        isVisible={visibleImages[3] !== false}
        isMobile={isMobile}
        mobileTop="42%"
        mobileLeft="1860px"
        mobileHeight="72vh"
      >
        <Box component="img" src={images[3]} alt="PASARELA 4" loading="lazy" />
      </ImageItem>

      {/* Imagen 5 - Primera fila */}
      <ImageItem
        ref={el => imageRefs.current[4] = el}
        top="50%"
        left="3800px"
        height="85vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[4] !== false}
        isMobile={isMobile}
        mobileTop="42%"
        mobileLeft="2280px"
        mobileHeight="72vh"
      >
        <Box component="img" src={images[4]} alt="PASARELA 5" loading="lazy" />
      </ImageItem>

      {/* Imagen 6 - Primera fila */}
      <ImageItem
        ref={el => imageRefs.current[5] = el}
        top="50%"
        left="4300px"
        height="70vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[5] !== false}
        isMobile={isMobile}
        mobileTop="42%"
        mobileLeft="2580px"
        mobileHeight="60vh"
      >
        <Box component="img" src={images[5]} alt="PASARELA 6" loading="lazy" />
      </ImageItem>

      {/* Imagen 7 - Segunda fila */}
      <ImageItem
        ref={el => imageRefs.current[6] = el}
        top="63%"
        left="4600px"
        height="55vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[6] !== false}
        isMobile={isMobile}
        mobileTop="52%"
        mobileLeft="2760px"
        mobileHeight="47vh"
      >
        <Box component="img" src={images[6]} alt="PASARELA 7" loading="lazy" />
      </ImageItem>

      {/* Imagen 8 - Segunda fila */}
      <ImageItem
        ref={el => imageRefs.current[7] = el}
        top="50%"
        left="5500px"
        height="70vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[7] !== false}
        isMobile={isMobile}
        mobileTop="42%"
        mobileLeft="3300px"
        mobileHeight="60vh"
      >
        <Box component="img" src={images[7]} alt="PASARELA 8" loading="lazy" />
      </ImageItem>

      {/* Imagen 9 - Segunda fila */}
      <ImageItem
        ref={el => imageRefs.current[8] = el}
        top="50%"
        left="6000px"
        height="60vh"
        width="auto"
        zIndex={5}
        isVisible={visibleImages[8] !== false}
        isMobile={isMobile}
        mobileTop="42%"
        mobileLeft="3600px"
        mobileHeight="51vh"
      >
        <Box component="img" src={images[8]} alt="PASARELA 9" loading="lazy" />
      </ImageItem>

      {/* Imagen 10 - Segunda fila (segunda) */}
      <ImageItem
        ref={el => imageRefs.current[9] = el}
        top="50%"
        left="6000px"
        height="70vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[9] !== false}
        isMobile={isMobile}
        mobileTop="42%"
        mobileLeft="3600px"
        mobileHeight="60vh"
      >
        <Box component="img" src={images[9]} alt="PASARELA 10" loading="lazy" />
      </ImageItem>

      {/* Imagen 11 - (final) */}
      <ImageItem
        ref={el => imageRefs.current[10] = el}
        top="50%"
        left="6515px"
        height="70vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[10] !== false}
        isMobile={isMobile}
        mobileTop="42%"
        mobileLeft="3909px"
        mobileHeight="60vh"
      >
        <Box component="img" src={images[10]} alt="PASARELA 11" loading="lazy" />
      </ImageItem>

      {/* Imagen PORTADA (centro destacado) */}
      <ImageItem
        ref={el => imageRefs.current[11] = el}
        top="50%"
        left="7400px"
        height="100vh"
        width="auto"
        zIndex={3}
        isVisible={visibleImages[11] !== false}
        isMobile={isMobile}
        mobileTop="42%"
        mobileLeft="4440px"
        mobileHeight="85vh"
      >
        <Box component="img" src={images[11]} alt="PASARELA 12 (PORTADA)" loading="lazy" />
      </ImageItem>

      {/* Imagen 13 - (final) */}
      <ImageItem
        ref={el => imageRefs.current[12] = el}
        top="50%"
        left="8500px"
        height="85vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[12] !== false}
        isMobile={isMobile}
        mobileTop="42%"
        mobileLeft="5100px"
        mobileHeight="72vh"
      >
        <Box component="img" src={images[12]} alt="PASARELA 13" loading="lazy" />
      </ImageItem>
    </>
  );

  return (
    <>
      <GlobalStyle />

      {/* Loading screen component */}
      <GalleryLoadingScreen
        title="Pasarela MUF"
        year="2024"
        loading={loading}
        loadProgress={loadProgress}
        onAnimationComplete={handleLoadingComplete}
        backgroundColor={galleryTheme.main}
        textColor={galleryTheme.text}
        progressColor={galleryTheme.text}
      />

      {/* Scroll progress bar */}
      <ScrollProgressBar
        ref={progressBarRef}
        data-scroll-progress
        sx={{
          opacity: loading ? 0 : 1,
          width: `${scrollProgress}%`
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

export default PasarelaGallery;
