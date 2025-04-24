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
const galleryTheme = getGalleryColors('kaboa');

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
  backgroundColor: galleryTheme.highlight, // Using theme highlight color
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
  color: galleryTheme.text, // Using theme text color
  letterSpacing: '2px',
  position: 'relative', // For positioning relative to container
  transform: 'translateY(100px)', // Start below viewport (for animation)
  opacity: 0,
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
}));

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
  
  // Color transition from cream to light gray
  const initialColor = '#ededed'; // Cream color
  const finalColor = '#ededed';   // Same color but could be changed later if needed
  
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
  width: '8000px', // Wide content area for all images
  height: '100%',
  padding: '40px',
  paddingRight: '300px', // Extra padding at the end
  position: 'relative',
  transform: 'translateZ(0)',  // Force GPU acceleration
  [theme.breakpoints.down('sm')]: {
    width: '8000px', // Keep same width for mobile
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

// Video item with frame - GPU optimized - With custom video positioning
const VideoContainer = styled(Box, {
  shouldForwardProp: (prop) => 
    !['isMobile', 'top', 'left', 'isVisible', 'videoTop', 'videoLeft', 'videoWidth', 'videoHeight'].includes(prop)
})(({ 
  theme, 
  top, 
  left, 
  width, 
  height, 
  zIndex = 1, 
  isMobile = false, 
  isVisible = true,
  // Custom properties for internal video
  videoTop = '16%',
  videoLeft = '16%',
  videoWidth = '68%',
  videoHeight = '60%'
}) => ({
  position: 'absolute', // Always use absolute positioning
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
  overflow: 'visible',
  backfaceVisibility: 'hidden', // GPU optimization
  '& .frame': {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    zIndex: 5,
    boxShadow: 'none',
    pointerEvents: 'none',
    transform: 'translateZ(0)', // Force GPU acceleration
  },
  '& .video': {
    position: 'absolute',
    top: videoTop,
    left: videoLeft,
    width: videoWidth,
    height: videoHeight,
    objectFit: 'cover',
    zIndex: 3,
    borderRadius: '0',
    transform: 'translateZ(0)', // Force GPU acceleration
  }
}));

const KaboaGallery = ({ onBack }) => {
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

  // Images and videos for KABOA
  const content = useMemo(() => ({
    FRAME: '/images/KABOA/KABOA-7 MARCO.png', // Corrected frame path
    K1: '/images/KABOA/KABOA-1.jpg',
    K2: '/images/KABOA/KABOA-2.jpg',
    K3: '/images/KABOA/KABOA-3.jpg',
    K4: '/images/KABOA/KABOA-4.jpg',
    K5: '/images/KABOA/KABOA-5.jpg',
    K6: '/images/KABOA/KABOA-6.jpg',
    K7: '/images/KABOA/KABOA-7.mp4', // Video with frame
    K8: '/images/KABOA/KABOA-8.jpg',
    K9: '/images/KABOA/KABOA-9.jpg',
  }), []);
  
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
    if (!loading) {
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    return () => {
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.scrollBehavior = '';
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

  // Gallery content rendering function for both mobile and desktop
  const renderGalleryContent = () => (
    <>
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
        <Box component="img" src={content.K1} alt="KABOA 1" loading="eager" />
      </ImageItem>
      
      {/* Image 2 */}
      <ImageItem 
        ref={el => imageRefs.current[1] = el}
        top="50%"
        left="1400px"
        height="85vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[1] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={content.K2} alt="KABOA 2" loading="lazy" />
      </ImageItem>
      
      {/* Image 3 */}
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        top="33%"
        left="2100px"
        height="45vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[2] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={content.K3} alt="KABOA 3" loading="lazy" />
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
        <Box component="img" src={content.K4} alt="KABOA 4" loading="lazy" />
      </ImageItem>
      
      {/* Image 5 */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top="50%"
        left="3500px"
        height="80vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[4] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={content.K5} alt="KABOA 5" loading="lazy" />
      </ImageItem>
      
      {/* Image 6 */}
      <ImageItem 
        ref={el => imageRefs.current[5] = el}
        top="42%"
        left="4450px"
        height="70vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[5] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={content.K6} alt="KABOA 6" loading="lazy" />
      </ImageItem>
      
      {/* Video 7 in frame */}
      <VideoContainer 
        ref={el => imageRefs.current[6] = el}
        top="50%"
        left="5300px"
        width="70vh"
        height="90vh"
        zIndex={2}
        isVisible={visibleImages[6] !== false}
        isMobile={isMobile}
        // Custom adjustments for video position within frame
        videoTop="3%"
        videoLeft="17%"
        videoWidth="67%"
        videoHeight="94%"
      >
        <Box 
          component="video"
          className="video"
          src={content.K7}
          alt="KABOA Video 7"
          autoPlay
          loop
          muted
          playsInline
        />
        <Box 
          component="img" 
          className="frame" 
          src={content.FRAME} 
          alt="KABOA Video Frame" 
        />
      </VideoContainer>
      
      {/* Image 8 */}
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        top="50%"
        left="6200px"
        height="80vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[7] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={content.K8} alt="KABOA 8" loading="lazy" />
      </ImageItem>
      
      {/* Image 9 */}
      <ImageItem 
        ref={el => imageRefs.current[8] = el}
        top="35%"
        left="6900px"
        height="75vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[8] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={content.K9} alt="KABOA 9" loading="lazy" />
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
            KABOA
          </LoadingTitle>
          
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

export default KaboaGallery;
