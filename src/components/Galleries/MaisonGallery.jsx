import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Box, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow';

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
  backgroundColor: '#f5f5f5', // Color grisáceo
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  transition: 'opacity 0.5s ease-out',
  overflow: 'hidden', // Prevent any overflow during animations
}));

// Separate components for MAISON and 2024
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '45px',
  fontWeight: 'bold',
  color: 'black',
  letterSpacing: '2px',
  position: 'relative', // For positioning relative to container
  transform: 'translateY(100px)', // Start below viewport (for animation)
  opacity: 0,
}));

const LoadingYear = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '40px',
  fontWeight: 'bold',
  color: 'black',
  letterSpacing: '2px',
  marginTop: '8px', // Space between the title and year
  position: 'relative', // For positioning relative to container
  transform: 'translateY(100px)', // Start below viewport (for animation)
  opacity: 0,
  marginBottom: '40px', // Space between text and loading circle
}));

// Main container with horizontal scroll
const GalleryContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgb(30,30,29)', // Dark background color as specified
  width: '100vw',
  height: '100vh',
  position: 'relative',
  overflowX: 'auto',
  overflowY: 'hidden',
  willChange: 'scroll-position',
  '-webkit-overflow-scrolling': 'touch',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  [theme.breakpoints.down('sm')]: {
    overflowX: 'hidden',
    overflowY: 'auto',
    height: 'auto',
    minHeight: '100vh',
  },
}));

// Content container - Updated width to 7000px
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '10100px', // Updated from 4800px to 7000px as per image requirements
  height: '100%',
  padding: '40px',
  paddingRight: '300px', // Extra padding at the end
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    flexDirection: 'column',
    height: 'auto',
    padding: '20px',
  },
}));

// Image item
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMobile' && prop !== 'top' && prop !== 'left' && prop !== 'isVisible'
})(({ theme, top, left, width, height, zIndex = 1, isMobile = false, isVisible = true }) => ({
  position: isMobile ? 'relative' : 'absolute',
  top: isMobile ? 'auto' : top,
  left: isMobile ? 'auto' : left,
  width: width,
  height: height,
  zIndex: zIndex,
  marginBottom: isMobile ? '40px' : '0',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateZ(0)' : 'translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '2px',
    boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
    backfaceVisibility: 'hidden',
  },
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '2px',
    boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
  }
}));

// Frame for video with glow effect
const VideoFrame = styled(Box)(({ theme, top, left, width, height, zIndex = 1, isMobile = false, isVisible = true }) => ({
  position: isMobile ? 'relative' : 'absolute',
  top: isMobile ? 'auto' : top,
  left: isMobile ? 'auto' : left,
  width: width,
  height: height,
  zIndex: zIndex,
  marginBottom: isMobile ? '40px' : '0',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateZ(0)' : 'translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
  border: '1px solid white',
  borderRadius: '2px',
  padding: '0',
  boxShadow: '0 0 15px rgba(255,255,255,0.3)', // Glow effect
  overflow: 'hidden', // Keep video within bounds
  background: 'white', // White background
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }
}));

// Throttle function to limit frequency of calls
function throttle(callback, limit) {
  let waiting = false;
  return function() {
    if (!waiting) {
      callback.apply(this, arguments);
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, limit);
    }
  };
}

const MaisonGallery = ({ onBack }) => {
  // Loading screen state
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // References for animation elements
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);
  const containerRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Image visibility state and references
  const [visibleImages, setVisibleImages] = useState({});
  const imageRefs = useRef([]);

  // Images for MAISON - using the correct folder path
  const images = useMemo(() => ({
    M1: '/images/MDLST/MDLST-1.png', // Man seated in industrial space
    M2: '/images/MDLST/MDLST-2.png', // Close-up of hand with rings
    M3: '/images/MDLST/MDLST-3.png', // Man walking on metro platform
    M4: '/images/MDLST/MDLST-4.png', // Abstract typographic logo
    M5: '/images/MDLST/MDLST-5.png', // Double panel of man walking in metro
    M6: '/images/MDLST/MDLST-6.jpg', // Empty frame (will be video)
    M7: '/images/MDLST/MDLST-7.jpg', // Double panel of man seated in metro
    M8: '/images/MDLST/MDLST-8.jpg', // Man standing on metro platform
    M9: '/images/MDLST/MDLST-9.mp4', // Video file
    M10: '/images/MDLST/MDLST-10.jpg', // Man leaning on column in metro
    M11: '/images/MDLST/MDLST-11.jpg',
    M12: '/images/MDLST/MDLST-12.jpg',
    M13: '/images/MDLST/MDLST-13.jpg'
  }), []);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

  // Check which images are visible
  const checkVisibility = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerLeft = isMobile ? 0 : container.scrollLeft;
    const containerWidth = containerRect.width;
    
    const preloadMargin = containerWidth * 0.8;
    
    const newVisibility = {};
    
    imageRefs.current.forEach((ref, index) => {
      if (ref && ref.current) {
        const imageRect = ref.current.getBoundingClientRect();
        
        let isVisible;
        if (isMobile) {
          isVisible = (
            imageRect.top < containerRect.bottom + preloadMargin &&
            imageRect.bottom > containerRect.top - preloadMargin
          );
        } else {
          isVisible = (
            imageRect.left < containerRect.right + preloadMargin &&
            imageRect.right > containerRect.left - preloadMargin
          );
        }
        
        newVisibility[index] = isVisible;
      }
    });
    
    setVisibleImages(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(newVisibility)) {
        return newVisibility;
      }
      return prev;
    });
  }, [isMobile]);

  // Set up optimized scroll behavior
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    container.style.scrollBehavior = 'auto';

    const handleWheel = throttle((e) => {
      if (isMobile) return;
      
      e.preventDefault();
      
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const scrollSpeed = 1.5;
      const targetScrollLeft = container.scrollLeft + delta * scrollSpeed;
      
      gsap.to(container, {
        scrollLeft: targetScrollLeft,
        duration: 0.4,
        ease: "power2.out",
        overwrite: true
      });
      
      setScrollLeft(targetScrollLeft);
    }, 16);

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    const handleScroll = throttle(() => {
      setScrollLeft(container.scrollLeft);
      checkVisibility();
    }, 150);
    
    container.addEventListener('scroll', handleScroll, { passive: true });

    checkVisibility();
    
    if ('IntersectionObserver' in window) {
      const options = {
        root: isMobile ? null : container,
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
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('scroll', handleScroll);
      };
    }
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, checkVisibility]);

  // Mobile view rendering
  const renderMobileView = () => (
    <>
      {/* First image (1) - Man seated in industrial space */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[0] !== false}
      >
        <Box component="img" src={images.M1} alt="MAISON 1" loading="eager" />
      </ImageItem>

      {/* Second image (2) - Close-up of hand with rings */}
      <ImageItem 
        ref={el => imageRefs.current[1] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[1] !== false}
      >
        <Box component="img" src={images.M2} alt="MAISON 2" loading="eager" />
      </ImageItem>

      {/* Third image (3) - Man walking on metro platform */}
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[2] !== false}
      >
        <Box component="img" src={images.M3} alt="MAISON 3" loading="eager" />
      </ImageItem>

      {/* Fourth image (4) - Abstract typographic logo */}
      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[3] !== false}
      >
        <Box component="img" src={images.M4} alt="MAISON 4" loading="eager" />
      </ImageItem>

      {/* Fifth image (5) - Double panel of man walking in metro */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[4] !== false}
      >
        <Box component="img" src={images.M5} alt="MAISON 5" loading="eager" />
      </ImageItem>

      {/* Sixth position - Video with white frame and glow */}
      <VideoFrame 
        ref={el => imageRefs.current[5] = el}
        isMobile={true}
        width="100%"
        height="auto" 
        isVisible={visibleImages[5] !== false}
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

      {/* Rest of images in order */}
      {[images.M7, images.M8, images.M10, images.M11, images.M12, images.M13].map((img, index) => (
        <ImageItem 
          key={`mobile-img-${index}`}
          ref={el => imageRefs.current[index + 6] = el}
          isMobile={true}
          width="100%"
          height="auto"
          isVisible={visibleImages[index + 6] !== false}
        >
          <Box 
            component="img" 
            src={img} 
            alt={`MAISON ${index + 7}`} 
            loading="lazy" 
          />
        </ImageItem>
      ))}
    </>
  );

  // Desktop view rendering with specific positioning - Updated with vh units
  const renderDesktopView = () => (
    <>
      {/* 1. First image - Man seated in industrial space */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        top="50%"
        left="450px"
        height="85vh"
        zIndex={2}
        isVisible={visibleImages[0] !== false}
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
      >
        <Box component="img" src={images.M3} alt="MAISON 3" loading="eager" />
      </ImageItem>

      
      {/* 4. Abstr go */}
      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        top="35%" 
        left="2240px" 
        height="55vh" 
        zIndex={3}
        isVisible={visibleImages[3] !== false}
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
      
      {/* 5. Doubl*/}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top="50%" 
        left="3500px"
        height="70vh" 
        zIndex={2}
        isVisible={visibleImages[4] !== false}
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
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.M8} alt="MAISON 8" loading="lazy" />
      </ImageItem>
      
      {/* 9. Man leaning on column in metro */}
      <ImageItem 
        ref={el => imageRefs.current[8] = el}
        top="41%" 
        left="6340px"
        width="35vw" 
        height="55vh" 
        zIndex={2}
        isVisible={visibleImages[8] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.M10} alt="MAISON 10" loading="lazy" />
      </ImageItem>
      
      {/* 10. Image #11 */}
      <ImageItem 
        ref={el => imageRefs.current[9] = el}
        top="124px" 
        left="7020px"
        width="35vw" 
        height="55vh" 
        zIndex={2}
        isVisible={visibleImages[9] !== false}
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
          
          <CircularProgress 
            variant="determinate" 
            value={loadProgress} 
            size={60} 
            thickness={4}
            sx={{ color: 'black' }}
          />
        </LoadingScreen>
      )}
      
      {/* Navigation arrow */}
      <NavigationArrow 
        onBack={onBack} 
        containerRef={containerRef} 
      />
      
      <GalleryContainer ref={containerRef}>
        <GalleryContent>
          {isMobile ? renderMobileView() : renderDesktopView()}
        </GalleryContent>
      </GalleryContainer>
    </>
  );
};

export default MaisonGallery;
