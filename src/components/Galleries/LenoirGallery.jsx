import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
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
const galleryTheme = getGalleryColors('lenoir');

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

// Optimized scroll progress bar with GPU acceleration
const ScrollProgressBar = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  height: '3px',
  width: '0%',
  backgroundColor: '#e6e6e6', // Grayish tone as requested
  zIndex: 9999,
  transform: 'translateZ(0)',  // Force GPU acceleration
  willChange: 'width',
  boxShadow: '0 0 3px rgba(0,0,0,0.2)', // Subtle shadow for better visibility
});

// Title component for loading screen
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '45px',
  fontWeight: 'bold',
  color: '#e6e6e6', // Color as requested
  letterSpacing: '2px',
  position: 'relative', // For positioning relative to container
  transform: 'translateY(100px)', // Start below viewport (for animation)
  opacity: 0,
}));

const LoadingYear = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '40px',
  fontWeight: 'bold',
  color: '#e6e6e6', // Color as requested
  letterSpacing: '2px',
  marginTop: '8px', // Space between the title and year
  position: 'relative', // For positioning relative to container
  transform: 'translateY(100px)', // Start below viewport (for animation)
  opacity: 0,
  marginBottom: '40px', // Space between text and loading circle
}));

// Main container with horizontal scroll and dynamic background color
const GalleryContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'scrollPosition'
})(({ theme, scrollPosition = 0 }) => {
  // Start transition after 5th image (around 3900px scroll)
  const scrollThreshold = 3200;
  // Complete transition over 800px of scrolling
  const transitionLength = 1000;
  // Calculate transition progress (0 to 1)
  const gradientProgress = Math.min(Math.max((scrollPosition - scrollThreshold) / transitionLength, 0), 1);
  
  // Color transition from lilac to light gray
  const initialColor = '#aa88ef'; // Lilac color
  const finalColor = '#e6e6e6';   // Light gray
  
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

// Content container - with wider width and increased spacing
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '8500px', // Increased width as requested
  height: '100%',
  padding: '40px',
  paddingRight: '300px', // Extra padding at the end
  position: 'relative',
  transform: 'translateZ(0)',  // Force GPU acceleration
  [theme.breakpoints.down('sm')]: {
    width: '8000px', // Keep the same width as desktop
    flexDirection: 'row',
    height: '100%',
    padding: '40px',
    paddingRight: '300px',
  },
}));

// Image item - optimized with GPU acceleration
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMobile' && prop !== 'top' && prop !== 'left' && prop !== 'isVisible'
})(({ theme, top, left, width, height, zIndex = 1, isMobile = false, isVisible = true }) => ({
  position: 'absolute', // Always use absolute positioning for both mobile and desktop
  top: top,
  left: left,
  width: width,
  height: height,
  zIndex: zIndex,
  marginBottom: '0', // No margin needed with absolute positioning
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(-50%)' : 'translateY(-50%) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
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

const LenoirGallery = ({ onBack }) => {
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Images for LENOIR
  const images = useMemo(() => [
    "./images/LENOIR/LENOIR-1.jpg",
    "./images/LENOIR/LENOIR-2.jpg",
    "./images/LENOIR/LENOIR-3.jpg",
    "./images/LENOIR/LENOIR-4.jpg",
    "./images/LENOIR/LENOIR-5.jpg",
    "./images/LENOIR/LENOIR-6.jpg",
    "./images/LENOIR/LENOIR-7.jpg",
    "./images/LENOIR/LENOIR-8.jpg",
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

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = images.map(src => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      
      await Promise.all(imagePromises);
    };
    
    preloadImages();
  }, [images]);

  return (
    <>
      <GlobalStyle />
      
      {/* Loading screen with title animation */}
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          <LoadingTitle ref={titleRef}>
            LENOIR
          </LoadingTitle>
          
          <LoadingYear ref={yearRef}>
            2024
          </LoadingYear>
          
          <CircularProgress 
            variant="determinate" 
            value={loadProgress} 
            size={60} 
            thickness={4}
            sx={{ color: '#e6e6e6' }}
          />
        </LoadingScreen>
      )}
      
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
          {/* Image 1 */}
          <ImageItem 
            ref={el => imageRefs.current[0] = el}
            top="50%"
            left="450px"
            height="80vh"
            width="auto"
            zIndex={2}
            isVisible={visibleImages[0] !== false}
            isMobile={isMobile}
          >
            <Box component="img" src={images[0]} alt="LENOIR 1" loading="eager" />
          </ImageItem>
          
          {/* Image 2 */}
          <ImageItem 
            ref={el => imageRefs.current[1] = el}
            top="50%"
            left="1200px"
            height="80vh"
            width="auto"
            zIndex={2}
            isVisible={visibleImages[1] !== false}
            isMobile={isMobile}
          >
            <Box component="img" src={images[1]} alt="LENOIR 2" loading="lazy" />
          </ImageItem>
          
          {/* Image 3 */}
          <ImageItem 
            ref={el => imageRefs.current[2] = el}
            top="50%"
            left="1950px"
            height="80vh"
            width="auto"
            zIndex={2}
            isVisible={visibleImages[2] !== false}
            isMobile={isMobile}
          >
            <Box component="img" src={images[2]} alt="LENOIR 3" loading="lazy" />
          </ImageItem>
          
          {/* Image 4 */}
          <ImageItem 
            ref={el => imageRefs.current[3] = el}
            top="50%"
            left="2700px"
            height="80vh"
            width="auto"
            zIndex={2}
            isVisible={visibleImages[3] !== false}
            isMobile={isMobile}
          >
            <Box component="img" src={images[3]} alt="LENOIR 4" loading="lazy" />
          </ImageItem>
          
          {/* Image 5 - Transition starts around here */}
          <ImageItem 
            ref={el => imageRefs.current[4] = el}
            top="50%"
            left="3900px"
            height="80vh"
            width="auto"
            zIndex={2}
            isVisible={visibleImages[4] !== false}
            isMobile={isMobile}
          >
            <Box component="img" src={images[4]} alt="LENOIR 5" loading="lazy" />
          </ImageItem>
          
          {/* Image 6 - Transition completes around here */}
          <ImageItem 
            ref={el => imageRefs.current[5] = el}
            top="50%"
            left="5000px"
            height="80vh"
            width="auto"
            zIndex={2}
            isVisible={visibleImages[5] !== false}
            isMobile={isMobile}
          >
            <Box component="img" src={images[5]} alt="LENOIR 6" loading="lazy" />
          </ImageItem>
          
          {/* Image 7 */}
          <ImageItem 
            ref={el => imageRefs.current[6] = el}
            top="50%"
            left="5700px"
            height="80vh"
            width="auto"
            zIndex={2}
            isVisible={visibleImages[6] !== false}
            isMobile={isMobile}
          >
            <Box component="img" src={images[6]} alt="LENOIR 7" loading="lazy" />
          </ImageItem>
          
          {/* Image 8 */}
          <ImageItem 
            ref={el => imageRefs.current[7] = el}
            top="50%"
            left="6900px"
            height="100vh"
            width="auto"
            zIndex={2}
            isVisible={visibleImages[7] !== false}
            isMobile={isMobile}
          >
            <Box component="img" src={images[7]} alt="LENOIR 8" loading="lazy" />
          </ImageItem>
        </GalleryContent>
      </GalleryContainer>
    </>
  );
};

export default LenoirGallery;
