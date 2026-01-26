'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import NavigationArrow from './NavigationArrow';
import GalleryLoadingScreen from './GalleryLoadingScreen';
import useSmoothScroll from './useSmoothScroll';
import { getGalleryColors } from '../utils/galleryColors';

// Get the color theme for this gallery
const galleryTheme = {
  main: '#0d2aa8',
  highlight: '#ffffff',
  text: '#ffffff'
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

// Optimized scroll progress bar with GPU acceleration
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
  boxShadow: '0 0 3px rgba(255,255,255,0.2)',
});

// Main container with horizontal scroll
const GalleryContainer = styled(Box)(({ theme }) => ({
  backgroundColor: galleryTheme.main,
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
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  [theme.breakpoints.down('sm')]: {
    overflowX: 'auto',
    overflowY: 'hidden',
    height: '100vh',
    minHeight: '100vh',
  },
}));

// Content container with GPU acceleration
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  padding: '40px',
  paddingRight: '300px',
  position: 'relative',
  transform: 'translateZ(0)',
  width: '6000px',
  [theme.breakpoints.down('sm')]: {
    width: '4000px',
    flexDirection: 'row',
    height: '100%',
    padding: '40px 300px 40px 40px',
  },
}));

// Image item - optimized with GPU acceleration
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'isVisible' &&
    prop !== 'isMobile' &&
    prop !== 'isPhoto'
})(({ theme, top, left, width, height, zIndex = 1, isVisible = true, isPhoto = true }) => ({
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
    borderRadius: isPhoto ? '2px' : '0',
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
  const progressBarRef = useRef(null);
  const containerRef = useRef(null);

  // Image visibility state and references
  const [visibleImages, setVisibleImages] = useState({});
  const imageRefs = useRef([]);

  // Get theme for media queries
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('xs'));
  const isSm = useMediaQuery(theme.breakpoints.between('xs', 'sm'));
  const isMd = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLg = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isXl = useMediaQuery(theme.breakpoints.up('lg'));

  // Estado de breakpoints activos
  const activeBreakpoints = { isXs, isSm, isMd, isLg, isXl };
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Images for IDENTIDAD gallery
  const images = useMemo(() => [
    '/images/IDENTIDAD/webp/IDENTIDAD MUF-1 (PORTADA).webp',
    '/images/IDENTIDAD/webp/IDENTIDAD MUF-2.webp',
    '/images/IDENTIDAD/webp/IDENTIDAD MUF-3.webp',
    '/images/IDENTIDAD/IDENTIDAD MUF-4.png',
    '/images/IDENTIDAD/webp/IDENTIDAD MUF-5.webp',
    '/images/IDENTIDAD/webp/IDENTIDAD MUF-6.webp',
    '/images/IDENTIDAD/webp/IDENTIDAD MUF-7.webp',
  ], []);

  // Configuración de estilos responsivos para imágenes
  const imageConfigurations = {
    // =========== IMAGEN 1 (PORTADA) ===========
    IDENTIDAD1: {
      // Desktop
      xl: { top: "50%", left: "400px", height: "70vh", zIndex: 3 },
      lg: { top: "50%", left: "400px", height: "70vh", innerMaxWidth: "550px", zIndex: 3 },
      md: { top: "50%", left: "400px", height: "70vh", innerMaxWidth: "500px", zIndex: 3 },
      // Mobile
      sm: { top: "50%", left: "200px", height: "60vh", innerMaxWidth: "350px", zIndex: 3 },
      xs: { top: "50%", left: "150px", height: "55vh", innerMaxWidth: "80vw", zIndex: 3 },
    },

    // =========== IMAGEN 2 ===========
    IDENTIDAD2: {
      // Desktop
      xl: { top: "50%", left: "1100px", height: "70vh", innerMaxWidth: "auto", zIndex: 2 },
      lg: { top: "50%", left: "1100px", height: "70vh", innerMaxWidth: "480px", zIndex: 2 },
      md: { top: "50%", left: "1100px", height: "70vh", innerMaxWidth: "450px", zIndex: 2 },
      // Mobile
      sm: { top: "50%", left: "700px", height: "60vh", innerMaxWidth: "300px", zIndex: 2 },
      xs: { top: "50%", left: "600px", height: "55vh", innerMaxWidth: "70vw", zIndex: 2 },
    },

    // =========== IMAGEN 3 ===========
    IDENTIDAD3: {
      // Desktop
      xl: { top: "50%", left: "1800px", height: "70vh", innerMaxWidth: "auto", zIndex: 2 },
      lg: { top: "50%", left: "1800px", height: "70vh", innerMaxWidth: "480px", zIndex: 2 },
      md: { top: "50%", left: "1800px", height: "70vh", innerMaxWidth: "450px", zIndex: 2 },
      // Mobile
      sm: { top: "50%", left: "1200px", height: "60vh", innerMaxWidth: "300px", zIndex: 2 },
      xs: { top: "50%", left: "1100px", height: "55vh", innerMaxWidth: "70vw", zIndex: 2 },
    },

    // =========== IMAGEN 4 ===========
    IDENTIDAD4: {
      // Desktop
      xl: { top: "50%", left: "2600px", height: "100vh", innerMaxWidth: "auto", zIndex: 2 },
      lg: { top: "50%", left: "2600px", height: "95vh", innerMaxWidth: "750px", zIndex: 2 },
      md: { top: "50%", left: "2600px", height: "90vh", innerMaxWidth: "700px", zIndex: 2 },
      // Mobile
      sm: { top: "50%", left: "1700px", height: "90vh", innerMaxWidth: "600px", zIndex: 2 },
      xs: { top: "50%", left: "1600px", height: "85vh", innerMaxWidth: "90vw", zIndex: 2 },
    },

    // =========== IMAGEN 5 ===========
    IDENTIDAD5: {
      // Desktop
      xl: { top: "50%", left: "3600px", height: "70vh", innerMaxWidth: "auto", zIndex: 2 },
      lg: { top: "50%", left: "3600px", height: "70vh", innerMaxWidth: "480px", zIndex: 2 },
      md: { top: "50%", left: "3600px", height: "70vh", innerMaxWidth: "450px", zIndex: 2 },
      // Mobile
      sm: { top: "50%", left: "2400px", height: "60vh", innerMaxWidth: "300px", zIndex: 2 },
      xs: { top: "50%", left: "2300px", height: "55vh", innerMaxWidth: "70vw", zIndex: 2 },
    },

    // =========== IMAGEN 6 ===========
    IDENTIDAD6: {
      // Desktop
      xl: { top: "50%", left: "4300px", height: "70vh", innerMaxWidth: "auto", zIndex: 2 },
      lg: { top: "50%", left: "4300px", height: "70vh", innerMaxWidth: "480px", zIndex: 2 },
      md: { top: "50%", left: "4300px", height: "70vh", innerMaxWidth: "450px", zIndex: 2 },
      // Mobile
      sm: { top: "50%", left: "2900px", height: "60vh", innerMaxWidth: "300px", zIndex: 2 },
      xs: { top: "50%", left: "2800px", height: "55vh", innerMaxWidth: "70vw", zIndex: 2 },
    },

    // =========== IMAGEN 7 ===========
    IDENTIDAD7: {
      // Desktop
      xl: { top: "50%", left: "5000px", height: "70vh", innerMaxWidth: "auto", zIndex: 2 },
      lg: { top: "50%", left: "5000px", height: "70vh", innerMaxWidth: "480px", zIndex: 2 },
      md: { top: "50%", left: "5000px", height: "70vh", innerMaxWidth: "450px", zIndex: 2 },
      // Mobile
      sm: { top: "50%", left: "3400px", height: "60vh", innerMaxWidth: "300px", zIndex: 2 },
      xs: { top: "50%", left: "3300px", height: "55vh", innerMaxWidth: "70vw", zIndex: 2 },
    },
  };

  // Función para obtener estilos según breakpoint
  const getCurrentStyles = (imageKey, breakpoints) => {
    const config = imageConfigurations[imageKey];
    if (!config) return {};
    if (breakpoints.isXs) return config.xs || config.sm;
    if (breakpoints.isSm) return config.sm;
    if (breakpoints.isMd) return config.md;
    if (breakpoints.isLg) return config.lg;
    if (breakpoints.isXl) return config.xl;
    return config.xl;
  };

  // Updated visibility check
  const checkVisibility = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;

    const preloadMargin = containerWidth * 1.2;

    const newVisibility = {};

    imageRefs.current.forEach((ref, index) => {
      if (ref && ref.current) {
        const imageRect = ref.current.getBoundingClientRect();

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
    horizontal: true,
    duration: 2.5,
    wheelMultiplier: 1.2,
    touchMultiplier: 2,
    lerp: 0.04,
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
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Handle loading animation complete
  const handleLoadingComplete = () => {
    setLoading(false);
  };

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

  // Render gallery content
  const renderGalleryContent = () => (
    <>
      {/* Image 1 (PORTADA) */}
      <ImageItem
        ref={el => imageRefs.current[0] = el}
        top={getCurrentStyles('IDENTIDAD1', activeBreakpoints).top}
        left={getCurrentStyles('IDENTIDAD1', activeBreakpoints).left}
        height={getCurrentStyles('IDENTIDAD1', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('IDENTIDAD1', activeBreakpoints).zIndex}
        isVisible={visibleImages[0] !== false}
      >
        <Box
          component="img"
          src={images[0]}
          alt="IDENTIDAD 1 PORTADA"
          loading="eager"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('IDENTIDAD1', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>

      {/* Image 2 */}
      <ImageItem
        ref={el => imageRefs.current[1] = el}
        top={getCurrentStyles('IDENTIDAD2', activeBreakpoints).top}
        left={getCurrentStyles('IDENTIDAD2', activeBreakpoints).left}
        height={getCurrentStyles('IDENTIDAD2', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('IDENTIDAD2', activeBreakpoints).zIndex}
        isVisible={visibleImages[1] !== false}
      >
        <Box
          component="img"
          src={images[1]}
          alt="IDENTIDAD 2"
          loading="eager"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('IDENTIDAD2', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>

      {/* Image 3 */}
      <ImageItem
        ref={el => imageRefs.current[2] = el}
        top={getCurrentStyles('IDENTIDAD3', activeBreakpoints).top}
        left={getCurrentStyles('IDENTIDAD3', activeBreakpoints).left}
        height={getCurrentStyles('IDENTIDAD3', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('IDENTIDAD3', activeBreakpoints).zIndex}
        isVisible={visibleImages[2] !== false}
      >
        <Box
          component="img"
          src={images[2]}
          alt="IDENTIDAD 3"
          loading="lazy"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('IDENTIDAD3', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>

      {/* Image 4 */}
      <ImageItem
        ref={el => imageRefs.current[3] = el}
        top={getCurrentStyles('IDENTIDAD4', activeBreakpoints).top}
        left={getCurrentStyles('IDENTIDAD4', activeBreakpoints).left}
        height={getCurrentStyles('IDENTIDAD4', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('IDENTIDAD4', activeBreakpoints).zIndex}
        isVisible={visibleImages[3] !== false}
      >
        <Box
          component="img"
          src={images[3]}
          alt="IDENTIDAD 4"
          loading="lazy"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('IDENTIDAD4', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>

      {/* Image 5 */}
      <ImageItem
        ref={el => imageRefs.current[4] = el}
        top={getCurrentStyles('IDENTIDAD5', activeBreakpoints).top}
        left={getCurrentStyles('IDENTIDAD5', activeBreakpoints).left}
        height={getCurrentStyles('IDENTIDAD5', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('IDENTIDAD5', activeBreakpoints).zIndex}
        isVisible={visibleImages[4] !== false}
      >
        <Box
          component="img"
          src={images[4]}
          alt="IDENTIDAD 5"
          loading="lazy"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('IDENTIDAD5', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>

      {/* Image 6 */}
      <ImageItem
        ref={el => imageRefs.current[5] = el}
        top={getCurrentStyles('IDENTIDAD6', activeBreakpoints).top}
        left={getCurrentStyles('IDENTIDAD6', activeBreakpoints).left}
        height={getCurrentStyles('IDENTIDAD6', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('IDENTIDAD6', activeBreakpoints).zIndex}
        isVisible={visibleImages[5] !== false}
      >
        <Box
          component="img"
          src={images[5]}
          alt="IDENTIDAD 6"
          loading="lazy"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('IDENTIDAD6', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>

      {/* Image 7 */}
      <ImageItem
        ref={el => imageRefs.current[6] = el}
        top={getCurrentStyles('IDENTIDAD7', activeBreakpoints).top}
        left={getCurrentStyles('IDENTIDAD7', activeBreakpoints).left}
        height={getCurrentStyles('IDENTIDAD7', activeBreakpoints).height}
        width="auto"
        zIndex={getCurrentStyles('IDENTIDAD7', activeBreakpoints).zIndex}
        isVisible={visibleImages[6] !== false}
      >
        <Box
          component="img"
          src={images[6]}
          alt="IDENTIDAD 7"
          loading="lazy"
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            maxWidth: getCurrentStyles('IDENTIDAD7', activeBreakpoints).innerMaxWidth,
          }}
        />
      </ImageItem>
    </>
  );

  return (
    <>
      <GlobalStyle />

      {/* Loading screen component */}
      <GalleryLoadingScreen
        title="Montevideo Under Fashion"
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
        style={{ cursor: 'grab' }}
      >
        <GalleryContent>
          {renderGalleryContent()}
        </GalleryContent>
      </GalleryContainer>
    </>
  );
};

export default IdentidadGallery;