import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow';
import GalleryLoadingScreen from './GalleryLoadingScreen';
import useSmoothScroll from './useSmoothScroll';

// Register GSAP plugins if needed
if (typeof gsap.registerPlugin === 'function') {
  try {
    if (typeof window !== 'undefined') {
      const { CSSPlugin } = require('gsap/CSSPlugin');
      gsap.registerPlugin(CSSPlugin);
    }
  } catch (e) {
    console.warn('GSAP plugin registration failed:', e);
  }
}

// Gallery theme colors
const galleryTheme = {
  main: '#f9f9f9',
  text: '#000000',
  highlight: '#333333',
  accent: '#666666'
};

// Scroll progress bar
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

// Content container - adjusted width for 11 images
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '9300px', // Adjusted for 11 images like other galleries
  height: '100%',
  padding: '40px',
  paddingRight: '300px',
  position: 'relative',
  transform: 'translateZ(0)',
  [theme.breakpoints.down('sm')]: {
    width: '9600px', // Reduced for mobile
    flexDirection: 'row',
    height: '100%',
    padding: '20px',
    paddingRight: '150px',
  },
}));

// Image item with absolute positioning
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
  mobileTop,
  mobileLeft,
  mobileHeight,
  mobileWidth
}) => ({
  position: 'absolute',
  top: isMobile ? mobileTop || top : top,
  left: isMobile ? mobileLeft || (left ? `${parseInt(left) * 0.6}px` : left) : left,
  width: isMobile ? mobileWidth || (width === 'auto' ? 'auto' : width ? `${parseInt(width) * 0.7}px` : width) : width,
  height: isMobile ? mobileHeight || (height === 'auto' ? 'auto' : height ? (height.includes('vh') ? `${parseInt(height) * 0.85}vh` : `${parseInt(height) * 0.7}px`) : height) : height,
  zIndex: zIndex,
  marginBottom: '0',
  opacity: isVisible ? 1 : 0,
  transform: 'translateZ(0)',
  transition: 'opacity 0.5s ease',
  willChange: 'opacity',
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

const EnzoGallery = ({ onBack }) => {
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

  // Images for ENZO X gallery
  const images = useMemo(() => [
    '/images/X/webp/@enzocimillo_ex-_1.webp',
    '/images/X/webp/@enzocimillo_ex-_2.webp',
    '/images/X/webp/@enzocimillo_ex-_3.webp',
    '/images/X/webp/@enzocimillo_ex-_4.webp',
    '/images/X/webp/@enzocimillo_ex-_5.webp',
    '/images/X/webp/@enzocimillo_ex-_6.webp',
    '/images/X/webp/@enzocimillo_ex-_7.webp',
    '/images/X/webp/@enzocimillo_ex-_8.webp',
    '/images/X/webp/@enzocimillo_ex-_9.webp',
    '/images/X/webp/@enzocimillo_ex-_10.webp',
    '/images/X/webp/@enzocimillo_ex-_11.webp',
  ], []);

  // Visibility check
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

  // Loading progress animation
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

  // Force loading to complete after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Handle loading complete
  const handleLoadingComplete = () => {
    setLoading(false);
  };

  // Optimize browser performance and cleanup on unmount
  useEffect(() => {
    if (!loading) {
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    return () => {
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.scrollBehavior = '';

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

  // Gallery content with layout based on reference image
  const renderGalleryContent = () => (
    <>
      {/* Image 1 - Portrait left */}
      <ImageItem
        ref={el => imageRefs.current[0] = el}
        left="0px"
        height="100vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[0] !== false}
        isMobile={isMobile}
        mobileLeft="0px"
        mobileHeight="100vh"
      >
        <Box component="img" src={images[0]} alt="ex- 1" loading="eager" />
      </ImageItem>

      {/* Image 2 - Small top */}
      <ImageItem
        ref={el => imageRefs.current[1] = el}
        left="800px"
        height="90vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[1] !== false}
        isMobile={isMobile}
        mobileLeft="850px"
        mobileHeight="90vh"
      >
        <Box component="img" src={images[1]} alt="ex- 2" loading="lazy" />
      </ImageItem>

      {/* Image 3 - Small bottom */}
      <ImageItem
        ref={el => imageRefs.current[2] = el}
        left="1940px"
        height="90vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[2] !== false}
        isMobile={isMobile}
        mobileLeft="2000px"
        mobileHeight="90vh"
      >
        <Box component="img" src={images[2]} alt="ex- 3" loading="lazy" />
      </ImageItem>

      {/* Image 4 - Small square */}
      <ImageItem
        ref={el => imageRefs.current[3] = el}
        left="2800px"
        height="70vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[3] !== false}
        isMobile={isMobile}
        mobileLeft="2950px"
        mobileHeight="60vh"
      >
        <Box component="img" src={images[3]} alt="ex- 4" loading="lazy" />
      </ImageItem>

      {/* Image 5 - Medium portrait */}
      <ImageItem
        ref={el => imageRefs.current[4] = el}
        left="3340px"
        height="70vh"
        width="auto"
        zIndex={3}
        isVisible={visibleImages[4] !== false}
        isMobile={isMobile}
        mobileLeft="3430px"
        mobileHeight="60vh"
      >
        <Box component="img" src={images[4]} alt="ex- 5" loading="lazy" />
      </ImageItem>

      {/* Image 6 - Wide landscape */}
      <ImageItem
        ref={el => imageRefs.current[5] = el}
        left="4000px"
        height="100vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[5] !== false}
        isMobile={isMobile}
        mobileLeft="4100px"
        mobileHeight="100vh"
      >
        <Box component="img" src={images[5]} alt="ex- 6" loading="lazy" />
      </ImageItem>

      {/* Image 7 - Two portraits side by side */}
      <ImageItem
        ref={el => imageRefs.current[6] = el}
        left="5300px"
        height="100vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[6] !== false}
        isMobile={isMobile}
        mobileLeft="5420px"
        mobileHeight="100vh"
      >
        <Box component="img" src={images[6]} alt="ex- 7" loading="lazy" />
      </ImageItem>

      {/* Image 8 - Small portrait */}
      <ImageItem
        ref={el => imageRefs.current[7] = el}
        left="5990px"
        height="100vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[7] !== false}
        isMobile={isMobile}
        mobileLeft="6130px"
        mobileHeight="100vh"
      >
        <Box component="img" src={images[7]} alt="ex- 8" loading="lazy" />
      </ImageItem>

      {/* Image 9 - Large portrait */}
      <ImageItem
        ref={el => imageRefs.current[8] = el}
        left="7200px"
        height="90vh"
        width="auto"
        zIndex={3}
        isVisible={visibleImages[8] !== false}
        isMobile={isMobile}
        mobileLeft="7280px"
        mobileHeight="90vh"
      >
        <Box component="img" src={images[8]} alt="ex- 9" loading="lazy" />
      </ImageItem>

      {/* Image 10 - Small square */}
      <ImageItem
        ref={el => imageRefs.current[9] = el}
        left="7900px"
        height="90vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[9] !== false}
        isMobile={isMobile}
        mobileLeft="8050px"
        mobileHeight="90vh"
      >
        <Box component="img" src={images[9]} alt="ex- 10" loading="lazy" />
      </ImageItem>

      {/* Image 11 - Final portrait */}
      <ImageItem
        ref={el => imageRefs.current[10] = el}
        left="8600px"
        height="100vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[10] !== false}
        isMobile={isMobile}
        mobileLeft="8850px"
        mobileHeight="100vh"
      >
        <Box component="img" src={images[10]} alt="ex- 11" loading="lazy" />
      </ImageItem>
    </>
  );

  return (
    <>
      {/* Loading screen */}
      <GalleryLoadingScreen
        title="ex-"
        year="2026"
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
        style={{ cursor: 'grab' }}
      >
        <GalleryContent>
          {renderGalleryContent()}
        </GalleryContent>
      </GalleryContainer>
    </>
  );
};

export default EnzoGallery;