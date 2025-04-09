import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Box, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow';
import useSmoothScroll from './useSmoothScroll';
import { getGalleryColors } from '../utils/galleryColors';

// Get the color theme for this gallery
const galleryTheme = getGalleryColors('caldo');

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

// Separate components for CALDO BASTARDO and 2024
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
const GalleryContainer = styled(Box)(({ theme }) => ({
  backgroundColor: galleryTheme.main, // Using theme main color
  width: '100vw',
  height: '100vh',
  position: 'relative',
  overflowX: 'auto',
  overflowY: 'hidden',
  transform: 'translateZ(0)',  // Force GPU acceleration
  perspective: '1000px',       // Enhance GPU acceleration
  backfaceVisibility: 'hidden', // Further GPU optimization
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

// Content container - Width set to 7500px - with GPU acceleration
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '6700px', // Set to match the image requirements
  height: '100%',
  padding: '40px',
  paddingRight: '300px', // Extra padding at the end
  position: 'relative',
  transform: 'translateZ(0)',  // Force GPU acceleration
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    flexDirection: 'column',
    height: 'auto',
    padding: '20px',
  },
}));

// Image item - Quitando sombras por defecto - optimized with GPU acceleration
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
  backfaceVisibility: 'hidden', // GPU optimization
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '2px',
    boxShadow: 'none', // Quitando sombras para CALDO BASTARDO y GRDN
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)', // Force GPU acceleration
  }
}));

// Video item with frame - GPU optimized
const VideoContainer = styled(Box, {
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
  overflow: 'visible',
  backfaceVisibility: 'hidden', // GPU optimization
  '& .frame': {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    zIndex: 5, // Aumentado para asegurar que esté encima del video
    boxShadow: 'none', // Sin sombra para los marcos
    pointerEvents: 'none',
    transform: 'translateZ(0)', // Force GPU acceleration
  },
  '& .video': {
    position: 'absolute',
    top: '16%', // Ajustado para centrarlo mejor
    left: '16%', // Ajustado para centrarlo mejor
    width: '68%', // Ajustado para que quepa dentro del marco
    height: '60%', // Ajustado para que quepa dentro del marco
    objectFit: 'cover',
    zIndex: 3, // Por debajo del marco
    borderRadius: '0',
    transform: 'translateZ(0)', // Force GPU acceleration
  }
}));

// Logo item - GPU optimized
const LogoItem = styled(Box, {
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
  backfaceVisibility: 'hidden', // GPU optimization
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '0',
    boxShadow: 'none',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)', // Force GPU acceleration
  }
}));

const CaldoGallery = ({ onBack }) => {
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

  // Images and videos for CALDO
  const content = useMemo(() => ({
    LOGO: '/images/CALDO/CALDO-MARCOS.png',
    C1: '/images/CALDO/CALDO-1 (PORTADA).jpg',
    C2: '/images/CALDO/CALDO-2.mp4',
    C3: '/images/CALDO/CALDO-3.mp4',
    C4: '/images/CALDO/CALDO-4.mp4',
    C5: '/images/CALDO/CALDO-5.mp4',
    C6: '/images/CALDO/CALDO-6.png', // Logo CALDO BASTARDO
    C7: '/images/CALDO/CALDO-7.mp4',
    C8: '/images/CALDO/CALDO-8.png'  // Logo GRDN
  }), []);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

  // Use the optimized smooth scroll hook with theme colors
  const { scrollLeft, scrollProgress } = useSmoothScroll({
    containerRef,
    isMobile,
    isLoading: loading,
    checkVisibility,
    horizontal: true,
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

  // Set up IntersectionObserver for visibility detection
  useEffect(() => {
    if (loading || !containerRef.current) return;

    checkVisibility();
    
    if ('IntersectionObserver' in window) {
      const options = {
        root: isMobile ? null : containerRef.current,
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

  // Mobile view rendering
  const renderMobileView = () => (
    <>
      {/* Imagen de portada - CALDO-1 */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[0] !== false}
      >
        <Box component="img" src={content.C1} alt="CALDO 1" loading="eager" />
      </ImageItem>

      {/* Video 1 con marco - CALDO-2.mp4 */}
      <VideoContainer 
        ref={el => imageRefs.current[1] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[1] !== false}
      >
        <Box 
          component="video"
          className="video"
          src={content.C2}
          alt="CALDO Video 2"
          autoPlay
          loop
          muted
          playsInline
        />
        <Box 
          component="img" 
          className="frame" 
          src={content.LOGO} 
          alt="CALDO Video Frame" 
        />
      </VideoContainer>

      {/* Video 2 con marco - CALDO-3.mp4 */}
      <VideoContainer 
        ref={el => imageRefs.current[2] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[2] !== false}
      >
        <Box 
          component="video"
          className="video"
          src={content.C3}
          alt="CALDO Video 3"
          autoPlay
          loop
          muted
          playsInline
        />
        <Box 
          component="img" 
          className="frame" 
          src={content.LOGO} 
          alt="CALDO Video Frame" 
        />
      </VideoContainer>

      {/* Video 3 con marco - CALDO-4.mp4 */}
      <VideoContainer 
        ref={el => imageRefs.current[3] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[3] !== false}
      >
        <Box 
          component="video"
          className="video"
          src={content.C4}
          alt="CALDO Video 4"
          autoPlay
          loop
          muted
          playsInline
        />
        <Box 
          component="img" 
          className="frame" 
          src={content.LOGO} 
          alt="CALDO Video Frame" 
        />
      </VideoContainer>

      {/* Video 4 con marco - CALDO-5.mp4 */}
      <VideoContainer 
        ref={el => imageRefs.current[4] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[4] !== false}
      >
        <Box 
          component="video"
          className="video"
          src={content.C5}
          alt="CALDO Video 5"
          autoPlay
          loop
          muted
          playsInline
        />
        <Box 
          component="img" 
          className="frame" 
          src={content.LOGO} 
          alt="CALDO Video Frame" 
        />
      </VideoContainer>

      {/* Logo CALDO BASTARDO - CALDO-6.png */}
      <LogoItem 
        ref={el => imageRefs.current[5] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[5] !== false}
      >
        <Box component="img" src={content.C6} alt="CALDO BASTARDO" loading="eager" />
      </LogoItem>

      {/* Video 5 con marco - CALDO-7.mp4 */}
      <VideoContainer 
        ref={el => imageRefs.current[6] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[6] !== false}
      >
        <Box 
          component="video"
          className="video"
          src={content.C7}
          alt="CALDO Video 7"
          autoPlay
          loop
          muted
          playsInline
        />
        <Box 
          component="img" 
          className="frame" 
          src={content.LOGO} 
          alt="CALDO Video Frame" 
        />
      </VideoContainer>

      {/* Logo GRDN - CALDO-8.png */}
      <LogoItem 
        ref={el => imageRefs.current[7] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[7] !== false}
      >
        <Box component="img" src={content.C8} alt="GRDN" loading="lazy" />
      </LogoItem>
    </>
  );

  // Desktop view rendering exactamente como en la imagen de referencia
  const renderDesktopView = () => (
    <>
      {/* Imagen de portada - izquierda */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        left="450px"
        height="75vh"
        zIndex={2}
        isVisible={visibleImages[0] !== false}
      >
        <Box component="img" src={content.C1} alt="CALDO 1" loading="eager" />
      </ImageItem>
      
      {/* Video 1 - CALDO-2.mp4 en marco - izquierda */}
      <VideoContainer 
        ref={el => imageRefs.current[1] = el}
        left="1300px"
        width="60vh"
        height="80vh"
        zIndex={2}
        isVisible={visibleImages[1] !== false}
      >
        <Box 
          component="video"
          className="video"
          src={content.C2}
          alt="CALDO Video 2"
          autoPlay
          loop
          muted
          playsInline
        />
        <Box 
          component="img" 
          className="frame" 
          src={content.LOGO} 
          alt="CALDO Video Frame" 
        />
      </VideoContainer>
      
      {/* Video 2 - CALDO-3.mp4 en marco - centro */}
      <VideoContainer 
        ref={el => imageRefs.current[2] = el}
        top="5%"
        left="2000px"
        width="90vh"
        height="60vh"
        zIndex={2}
        isVisible={visibleImages[2] !== false}
      >
        <Box 
          component="video"
          className="video"
          src={content.C3}
          alt="CALDO Video 3"
          autoPlay
          loop
          muted
          playsInline
        />
      </VideoContainer>
      
      {/* Video 3 - CALDO-4.mp4 - derecha */}
      <VideoContainer 
        ref={el => imageRefs.current[3] = el}
        top="40%"
        left="2560px"
        width="90vh"
        height="60vh"
        zIndex={2}
        isVisible={visibleImages[3] !== false}
      >
        <Box 
          component="video"
          className="video"
          src={content.C4}
          alt="CALDO Video 4"
          autoPlay
          loop
          muted
          playsInline
        />
      </VideoContainer>
      
      {/* Video 4 - CALDO-5.mp4  */}
      <VideoContainer 
        ref={el => imageRefs.current[4] = el}
        left="3500px"
         width="60vh"
        height="80vh"
        zIndex={2}
        isVisible={visibleImages[4] !== false}
      >
        <Box 
          component="video"
          className="video"
          src={content.C5}
          alt="CALDO Video 5"
          autoPlay
          loop
          muted
          playsInline
        />
        <Box 
          component="img" 
          className="frame" 
          src={content.LOGO} 
          alt="CALDO Video Frame" 
        />
      </VideoContainer>
      
      {/* Logo CALDO BASTARDO - CALDO-6.png - centro */}
      <LogoItem 
        ref={el => imageRefs.current[5] = el}
        top="45%"
        left="4270px"
        width="670px"
        height="auto"
        isVisible={visibleImages[5] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={content.C6} alt="CALDO BASTARDO" loading="eager" />
      </LogoItem>
      
      {/* Video 5 - CALDO-7.mp4 en marco */}
      <VideoContainer 
        ref={el => imageRefs.current[6] = el}
        left="5150px"
        width="60vh"
        height="80vh"
        zIndex={2}
        isVisible={visibleImages[6] !== false}
      >
        <Box 
          component="video"
          className="video"
          src={content.C7}
          alt="CALDO Video 7"
          autoPlay
          loop
          muted
          playsInline
        />
        <Box 
          component="img" 
          className="frame" 
          src={content.LOGO} 
          alt="CALDO Video Frame" 
        />
      </VideoContainer>
      
      {/* Logo GRDN - CALDO-8.png - extremo derecho */}
      <LogoItem 
        ref={el => imageRefs.current[7] = el}
        top="10%"
        left="6100px"
        width="250px"
        height="auto"
        isVisible={visibleImages[7] !== false}
      >
        <Box component="img" src={content.C8} alt="GRDN" loading="lazy" />
      </LogoItem>
    </>
  );

  return (
    <>
      <GlobalStyle />
      
      {/* Loading screen with title animation */}
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          <LoadingTitle ref={titleRef}>
            CALDO BASTARDO
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
      
      {/* Scroll progress bar - always visible after loading but controlled by Lenis */}
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
      
      <GalleryContainer ref={containerRef}>
        <GalleryContent>
          {isMobile ? renderMobileView() : renderDesktopView()}
        </GalleryContent>
      </GalleryContainer>
    </>
  );
};

export default CaldoGallery;
