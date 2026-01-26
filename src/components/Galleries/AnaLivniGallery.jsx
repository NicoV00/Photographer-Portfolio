import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigationArrow from './NavigationArrow'; // Assuming this path is correct
import GalleryLoadingScreen from './GalleryLoadingScreen';
import useSmoothScroll from './useSmoothScroll'; // Assuming this path is correct
import { getGalleryColors } from '../utils/galleryColors'; // Assuming this path is correct

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

// Content container
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '7500px', // This is our base width for percentage calculations
  height: '100%',
  padding: '40px', // Fixed padding, can be vw/vh if preferred
  paddingRight: '300px', // Fixed padding, can be vw/vh if preferred
  position: 'relative',
  transform: 'translateZ(0)',
  [theme.breakpoints.down('sm')]: {
    width: '7500px',
    flexDirection: 'row',
    height: '100%',
    padding: '40px',
    paddingRight: '300px',
  },
}));

// Image item
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMobile' && prop !== 'top' && prop !== 'left' && prop !== 'isVisible' // No changes needed here based on request
})(({ theme, top, left, width, height, zIndex = 1, isMobile = false, isVisible = true }) => ({
  position: 'absolute',
  top: top,
  left: left, // This will now receive a percentage value
  width: width, // This will receive a percentage for the text box, otherwise usually undefined for images
  height: height,
  zIndex: zIndex,
  marginBottom: '0',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateZ(0)' : 'translateZ(0) scale(0.98)',
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

// Define the total width of the gallery content for percentage calculations
const TOTAL_CONTENT_WIDTH = 7500;

const AnaLivniGallery = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const progressBarRef = useRef(null);
  const containerRef = useRef(null);

  const [visibleImages, setVisibleImages] = useState({});
  const imageRefs = useRef([]);

  const images = useMemo(() => ({
    L1: '/images/ANA/webp/L1.webp',
    L2: '/images/ANA/webp/L3.webp', // ANA text
    L3: '/images/ANA/L2.png', // LIVNI text
    L4: '/images/ANA/webp/L4.webp',
    L5: '/images/ANA/webp/L5.webp',
    L6: '/images/ANA/webp/L6.webp',
    L7: '/images/ANA/webp/L7.webp',
    L8: '/images/ANA/webp/L8.webp',
    L9: '/images/ANA/webp/L9.webp',
    L10: '/images/ANA/webp/L10.webp',
    L11: '/images/ANA/webp/L11.webp',
    L12: '/images/ANA/webp/L12.webp',
    L13: '/images/ANA/webp/L13.webp'
  }), []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  }, [isMobile]); // isMobile dependency kept if other logic relies on it, though checkVisibility itself is now always horizontal

  const { scrollLeft, scrollProgress } = useSmoothScroll({
    containerRef,
    isMobile, // This can still be used by useSmoothScroll for different physics if needed
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
    checkVisibility(); // Initial check

    if ('IntersectionObserver' in window) {
      const options = {
        root: containerRef.current,
        rootMargin: '200px', // Preload margin for IntersectionObserver
        threshold: 0.1 // At least 10% of item visible
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const id = entry.target.dataset.id;
          if (id) {
            setVisibleImages(prev => ({ ...prev, [id]: entry.isIntersecting }));
          }
        });
      }, options);

      imageRefs.current.forEach((imageRef, index) => {
        if (imageRef?.current) {
          imageRef.current.dataset.id = index; // Assign index as id for tracking
          observer.observe(imageRef.current);
        }
      });

      return () => {
        imageRefs.current.forEach(imageRef => {
          if (imageRef?.current) observer.unobserve(imageRef.current);
        });
        observer.disconnect();
      };
    } else {
      // Fallback for older browsers: use scroll event based checkVisibility
      // This part of checkVisibility is already called by useSmoothScroll,
      // so it will run on scroll.
    }
  }, [loading, checkVisibility]); // Removed isMobile as IntersectionObserver root is always containerRef

  const renderGalleryContent = () => (
    <>
      {/* 1. Large image (L1) */}
      <ImageItem
        ref={el => imageRefs.current[0] = { current: el }} // Ensure ref structure compatibility
        top="50%"
        left={`${(450 / TOTAL_CONTENT_WIDTH) * 100}%`} // 6%
        height="85vh"
        // width prop intentionally omitted to let aspect ratio determine it
        zIndex={2}
        isVisible={visibleImages[0] !== false}
        isMobile={isMobile} // Prop can still be passed if ImageItem uses it internally
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L1} alt="ANA LIVNI 1" loading="eager" />
      </ImageItem>

      {/* 2 & 3. "ANA" and "LIVNI" text images */}
      <Box
        ref={el => imageRefs.current[1] = { current: el }}
        sx={{
          position: 'absolute',
          top: '85%',
          left: `${(1300 / TOTAL_CONTENT_WIDTH) * 100}%`, // approx 17.33%
          width: `${(170 / TOTAL_CONTENT_WIDTH) * 100}%`, // approx 2.27%
          transform: 'translateY(-50%) translateZ(0)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          opacity: visibleImages[1] !== false ? 1 : 0,
          transition: 'opacity 0.5s ease',
          willChange: 'opacity',
          backfaceVisibility: 'hidden',
        }}
      >
        <Box component="img" src={images.L2} alt="ANA" sx={{ width: '100%', marginBottom: '5px' }} loading="eager" />
        <Box component="img" src={images.L3} alt="LIVNI" sx={{ width: '100%' }} loading="eager" />
      </Box>

      <ImageItem
        ref={el => imageRefs.current[2] = { current: el }}
        top="1%"
        left={`${(1500 / TOTAL_CONTENT_WIDTH) * 100}%`} // 20%
        height="55vh"
        zIndex={2}
        isVisible={visibleImages[2] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images.L4} alt="ANA LIVNI 4" loading="eager" />
      </ImageItem>

      <ImageItem
        ref={el => imageRefs.current[3] = { current: el }}
        top="44%"
        left={`${(1875 / TOTAL_CONTENT_WIDTH) * 100}%`} // 25%
        height="55vh"
        zIndex={2}
        isVisible={visibleImages[3] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images.L5} alt="ANA LIVNI 5" loading="eager" />
      </ImageItem>

      <ImageItem
        ref={el => imageRefs.current[4] = { current: el }}
        top="50%"
        left={`${(2460 / TOTAL_CONTENT_WIDTH) * 100}%`} // 32.8%
        height="50vh"
        zIndex={1}
        isVisible={visibleImages[4] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L6} alt="ANA LIVNI 6" loading="eager" />
      </ImageItem>

      <ImageItem
        ref={el => imageRefs.current[5] = { current: el }}
        top="50%"
        left={`${(3100 / TOTAL_CONTENT_WIDTH) * 100}%`} // approx 41.33%
        height="50vh"
        zIndex={2}
        isVisible={visibleImages[5] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L7} alt="ANA LIVNI 7" loading="eager" />
      </ImageItem>

      <ImageItem
        ref={el => imageRefs.current[6] = { current: el }}
        top="50%"
        left={`${(3750 / TOTAL_CONTENT_WIDTH) * 100}%`} // 50%
        height="100vh"
        zIndex={1}
        isVisible={visibleImages[6] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L8} alt="ANA LIVNI 8" loading="eager" />
      </ImageItem>

      <ImageItem
        ref={el => imageRefs.current[7] = { current: el }}
        top="50%"
        left={`${(5650 / TOTAL_CONTENT_WIDTH) * 100}%`} // approx 75.33%
        height="55vh"
        zIndex={2}
        isVisible={visibleImages[7] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L9} alt="ANA LIVNI 9" loading="lazy" />
      </ImageItem>

      <ImageItem
        ref={el => imageRefs.current[8] = { current: el }}
        top="50%"
        left={`${(5250 / TOTAL_CONTENT_WIDTH) * 100}%`} // 70%
        height="55vh"
        zIndex={3}
        isVisible={visibleImages[8] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L10} alt="ANA LIVNI 10" loading="lazy" />
      </ImageItem>

      <ImageItem
        ref={el => imageRefs.current[9] = { current: el }}
        top="50%"
        left={`${(4850 / TOTAL_CONTENT_WIDTH) * 100}%`} // approx 64.67%
        height="55vh"
        zIndex={2}
        isVisible={visibleImages[9] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L11} alt="ANA LIVNI 11" loading="lazy" />
      </ImageItem>

      <ImageItem
        ref={el => imageRefs.current[10] = { current: el }}
        top="35%"
        left={`${(6400 / TOTAL_CONTENT_WIDTH) * 100}%`} // approx 85.33%
        height="70vh"
        zIndex={2}
        isVisible={visibleImages[10] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L12} alt="ANA LIVNI 12" loading="lazy" />
      </ImageItem>

      <ImageItem
        ref={el => imageRefs.current[11] = { current: el }}
        top="65%"
        left={`${(6800 / TOTAL_CONTENT_WIDTH) * 100}%`} // approx 90.67%
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

      {/* Loading screen component */}
      <GalleryLoadingScreen
        title="Ana Livni"
        year="2024"
        loading={loading}
        loadProgress={loadProgress}
        onAnimationComplete={handleLoadingComplete}
        backgroundColor={galleryTheme.main}
        textColor={galleryTheme.text}
        progressColor={galleryTheme.text}
      />

      <ScrollProgressBar
        ref={progressBarRef}
        data-scroll-progress // For potential direct manipulation by scroll library if needed
        sx={{
          opacity: loading ? 0 : 1,
          width: `${scrollProgress * 100}%` // Controlled by useSmoothScroll
        }}
      />

      <NavigationArrow
        onBack={onBack}
        containerRef={containerRef} // Pass containerRef if needed by NavigationArrow
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
