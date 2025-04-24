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
    width: '10100px', // Keep the same width as desktop
    flexDirection: 'row', // Changed from 'column' to 'row' for horizontal layout
    height: '100%', // Keep the same height as desktop
    padding: '40px', // Keep the same padding as desktop
    paddingRight: '300px', // Keep the same right padding as desktop
  },
}));

// Image item with GPU acceleration
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
    boxShadow: isMobile ? 'none' : '0 3px 8px rgba(0,0,0,0.25)', // Removed shadow for mobile
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)', // Force GPU acceleration
  },
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '2px',
    boxShadow: isMobile ? 'none' : '0 3px 8px rgba(0,0,0,0.25)', // Removed shadow for mobile
    transform: 'translateZ(0)', // Force GPU acceleration
  }
}));

// Frame for video with glow effect
const VideoFrame = styled(Box)(({ theme, top, left, width, height, zIndex = 1, isMobile = false, isVisible = true }) => ({
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
  border: `1px solid ${galleryTheme.text}`,
  borderRadius: '2px',
  padding: '0',
  boxShadow: isMobile ? 'none' : `0 0 15px ${galleryTheme.highlight}33`, // Removed shadow for mobile
  overflow: 'hidden',
  background: galleryTheme.text,
  backfaceVisibility: 'hidden', // GPU optimization
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'translateZ(0)', // Force GPU acceleration
  }
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

  // Always use desktop view rendering regardless of device
  const renderGalleryContent = () => (
    <>
      {/* 1. First image - Man seated in industrial space */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        top="50%"
        left="450px"
        height="85vh"
        zIndex={2}
        isVisible={visibleImages[0] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.M1} alt="MAISON 1" loading="eager" />
      </ImageItem>
      
      {/* 2. Close-up of hand with rings */}
      <ImageItem 
        ref={el => imageRefs.current[1] = el}
        top="25%"
        left="1300px"
        height="55vh"
        zIndex={3}
        isVisible={visibleImages[1] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images.M2} alt="MAISON 2" loading="eager" />
      </ImageItem>
      
      {/* 3. Man walking on metro platform */}
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        left="1550px" 
        height="100vh" 
        zIndex={2}
        isVisible={visibleImages[2] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images.M3} alt="MAISON 3" loading="eager" />
      </ImageItem>
      
      {/* 4. Abstract logo */}
      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        top="35%" 
        left="2240px" 
        height="55vh" 
        zIndex={3}
        isVisible={visibleImages[3] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.M4} alt="MAISON 4" loading="eager" />
      </ImageItem>

      {/* 5. Logo */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top="70%" 
        left="2110px"
        height="120vh" 
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
      >
        <Box component="img" src={images.M5} alt="MAISON 5" loading="eager" />
      </ImageItem>
      
      {/* 5. Double */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top="50%" 
        left="3500px"
        height="70vh" 
        zIndex={2}
        isVisible={visibleImages[4] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.M6} alt="MAISON 5" loading="eager" />
      </ImageItem>
      
      {/* 6. White frame with video and glow effect */}
      <VideoFrame 
        ref={el => imageRefs.current[5] = el}
        top="50%" 
        left="5560px"
        height="85vh" 
        zIndex={2}
        isVisible={visibleImages[5] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
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
      
      {/* 7. Double panel of man seated in metro */}
      <ImageItem 
        ref={el => imageRefs.current[6] = el}
        top="50%" 
        left="4120px"
        height="70vh" 
        zIndex={2}
        isVisible={visibleImages[6] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.M7} alt="MAISON 7" loading="eager" />
      </ImageItem>
      
      {/* 8. Man standing on metro platform */}
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        top="50%" 
        left="4735px"
        height="70vh" 
        zIndex={2}
        isVisible={visibleImages[7] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.M8} alt="MAISON 8" loading="lazy" />
      </ImageItem>
      
      {/* 9. Man leaning on column in metro */}
      <ImageItem 
        ref={el => imageRefs.current[8] = el}
        top="41%" 
        left="6340px"
        height="55vh" 
        zIndex={2}
        isVisible={visibleImages[8] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.M10} alt="MAISON 10" loading="lazy" />
      </ImageItem>
      
      {/* 10. Image #11 */}
      <ImageItem 
        ref={el => imageRefs.current[9] = el}
        top="124px" 
        left="7020px"
        height="55vh" 
        zIndex={2}
        isVisible={visibleImages[9] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images.M11} alt="MAISON 11" loading="lazy" />
      </ImageItem>
      
      {/* 11. Image #12 */}
      <ImageItem 
        ref={el => imageRefs.current[10] = el}
        left="8000px"
        height="80vh" 
        zIndex={2}
        isVisible={visibleImages[10] !== false}
        isMobile={isMobile}
      >
        <Box component="img" src={images.M12} alt="MAISON 12" loading="lazy" />
      </ImageItem>
      
      {/* 12. Image #13 */}
      <ImageItem 
        ref={el => imageRefs.current[11] = el}
        top="50%" 
        left="9000px"
        height="100vh" 
        zIndex={2}
        isVisible={visibleImages[11] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
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
