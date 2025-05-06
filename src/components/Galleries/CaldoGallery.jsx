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
  [theme.breakpoints.down('sm')]: {
    fontSize: '32px', // Smaller font on mobile
  },
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
  [theme.breakpoints.down('sm')]: {
    fontSize: '28px', // Smaller font on mobile
  },
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
    // Keep horizontal scrolling for mobile
    overflowX: 'auto',
    overflowY: 'hidden',
    height: '100vh', // Keep full height on mobile
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
    width: '4000px', // Aumentado de 3350px para acomodar elementos más grandes
    padding: '20px', // Less padding on mobile
    paddingRight: '150px', // Less padding on mobile
  },
}));

// Image item - Responsive version with adaptive sizing for mobile
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => !['isMobile', 'top', 'left', 'isVisible', 'mobileTop', 'mobileLeft', 'mobileHeight', 'mobileWidth'].includes(prop)
})(({ 
  theme, 
  top, 
  left, 
  width, 
  height, 
  zIndex = 1, 
  isMobile = false, 
  isVisible = true,
  // Props especiales para móvil
  mobileTop,
  mobileLeft,
  mobileHeight,
  mobileWidth
}) => ({
  position: 'absolute',
  top: top,
  left: left,
  width: width,
  height: height,
  zIndex: zIndex,
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
    boxShadow: 'none',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)', // Force GPU acceleration
  },
  [theme.breakpoints.down('sm')]: {
    top: mobileTop || top,
    left: mobileLeft || (left ? `${parseInt(left) * 0.6}px` : left), // Aumentado de 0.5 a 0.6
    width: mobileWidth || (width === 'auto' ? 'auto' : width ? `${parseInt(width) * 0.7}px` : width), // Aumentado de 0.5 a 0.7
    height: mobileHeight || (height === 'auto' ? 'auto' : height ? (height.includes('vh') ? `${parseInt(height) * 0.9}vh` : `${parseInt(height) * 0.7}px`) : height), // Aumentado de 0.8/0.5 a 0.9/0.7
  },
}));

// Video container - Responsive version with adaptive sizing for mobile
const VideoContainer = styled(Box, {
  shouldForwardProp: (prop) => 
    !['isMobile', 'top', 'left', 'isVisible', 'videoTop', 'videoLeft', 'videoWidth', 'videoHeight', 
      'mobileTop', 'mobileLeft', 'mobileWidth', 'mobileHeight',
      'mobileVideoTop', 'mobileVideoLeft', 'mobileVideoWidth', 'mobileVideoHeight'].includes(prop)
})(({ 
  theme, 
  top, 
  left, 
  width, 
  height, 
  zIndex = 1, 
  isMobile = false, 
  isVisible = true,
  // Props para posición del video en desktop
  videoTop = '16%',
  videoLeft = '16%',
  videoWidth = '68%',
  videoHeight = '60%',
  // Props especiales para móvil
  mobileTop,
  mobileLeft,
  mobileWidth,
  mobileHeight,
  // Props para posición del video en móvil
  mobileVideoTop,
  mobileVideoLeft,
  mobileVideoWidth,
  mobileVideoHeight
}) => ({
  position: 'absolute',
  top: top,
  left: left,
  width: width,
  height: height,
  zIndex: zIndex,
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
  },
  [theme.breakpoints.down('sm')]: {
    top: mobileTop || top,
    left: mobileLeft || (left ? `${parseInt(left) * 0.6}px` : left), // Aumentado de 0.5 a 0.6
    width: mobileWidth || (width.includes('vh') ? `${parseInt(width) * 0.75}vh` : `${parseInt(width) * 0.7}px`), // Aumentado de 0.6/0.5 a 0.75/0.7
    height: mobileHeight || (height.includes('vh') ? `${parseInt(height) * 0.75}vh` : `${parseInt(height) * 0.7}px`), // Aumentado de 0.6/0.5 a 0.75/0.7
    '& .video': {
      top: mobileVideoTop || videoTop,
      left: mobileVideoLeft || videoLeft,
      width: mobileVideoWidth || videoWidth,
      height: mobileVideoHeight || videoHeight,
    }
  },
}));

// Logo item - Responsive version with adaptive sizing for mobile with new hover effect
const LogoItem = styled(Box, {
  shouldForwardProp: (prop) => !['isMobile', 'top', 'left', 'isVisible', 'mobileTop', 'mobileLeft', 'mobileWidth', 'mobileHeight', 'isInteractive', 'isPlaying'].includes(prop)
})(({ 
  theme, 
  top, 
  left, 
  width, 
  height, 
  zIndex = 1, 
  isMobile = false, 
  isVisible = true,
  // Props especiales para móvil
  mobileTop,
  mobileLeft,
  mobileWidth,
  mobileHeight,
  // New props for interactivity
  isInteractive = false,
  isPlaying = false
}) => ({
  position: 'absolute',
  top: top,
  left: left,
  width: width,
  height: height,
  zIndex: zIndex,
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateZ(0)' : 'translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden', // GPU optimization
  cursor: isInteractive ? 'pointer' : 'default',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '0',
    boxShadow: 'none',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)', // Force GPU acceleration
    transition: 'transform 0.3s ease-in-out', // Smooth transition for hover effect
    ...(isInteractive && {
      '&:hover': {
        transform: 'translateZ(0) scale(1.08)', // Scale up on hover
      },
      ...(isPlaying && {
        transform: 'translateZ(0) scale(1.05)', // Slightly scaled when playing
        filter: 'brightness(1.1)', // Slightly brighter when playing
      }),
    }),
  },
  [theme.breakpoints.down('sm')]: {
    top: mobileTop || top,
    left: mobileLeft || (left ? `${parseInt(left) * 0.6}px` : left), // Aumentado de 0.5 a 0.6
    width: mobileWidth || (width === 'auto' ? 'auto' : `${parseInt(width) * 0.7}px`), // Aumentado de 0.5 a 0.7
    height: mobileHeight || height, // Mantener altura si es 'auto', sino reducir
  },
}));

const CaldoGallery = ({ onBack }) => {
  // Loading screen state
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  
  // New audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

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
    C8: '/images/CALDO/CALDO-8.png',  // Logo GRDN
    AUDIO: '/videos/CALDO AUDIO.mp3', // New audio file
  }), []);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Handle audio playback toggle
  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => {
          console.error('Error playing audio:', e);
          // Fallback for browsers that require user interaction
          alert('Click again to play audio');
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);
  
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
        
        // Always check horizontal visibility
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
  }, [isMobile]);

  // Use the optimized smooth scroll hook with theme colors
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

  // Set up IntersectionObserver for visibility detection - use container as root for both
  useEffect(() => {
    if (loading || !containerRef.current) return;

    checkVisibility();
    
    if ('IntersectionObserver' in window) {
      const options = {
        root: containerRef.current, // Always use container as root for horizontal scrolling
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

  // Setup audio element
  useEffect(() => {
    // Set up audio element and event listeners when component mounts
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      // Optional: preload audio
      audioRef.current.load();
    }
    
    // Clean up when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {
          setIsPlaying(false);
        });
      }
    };
  }, []);

  // Single gallery content rendering function for both mobile and desktop
  const renderGalleryContent = () => (
    <>
      {/* Hidden audio element */}
      <Box 
        component="audio" 
        ref={audioRef} 
        src={content.AUDIO} 
        sx={{ display: 'none' }} 
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Imagen de portada - izquierda */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        top="50%"
        left="450px"
        height="85vh"
        width="auto"
        zIndex={2}
        isVisible={visibleImages[0] !== false}
        isMobile={isMobile}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="50%"
        mobileLeft="270px"
        mobileHeight="67vh"
        mobileWidth="55vh"
      >
        <Box component="img" src={content.C1} alt="CALDO 1" loading="eager" />
      </ImageItem>
      
      {/* Video 1 - CALDO-2.mp4 en marco - izquierda */}
      <VideoContainer 
        ref={el => imageRefs.current[1] = el}
        top="50%"
        left="1300px"
        width="60vh"
        height="80vh"
        zIndex={2}
        isVisible={visibleImages[1] !== false}
        isMobile={isMobile}
        // Ajustes personalizados para este video
        videoTop="3%"
        videoLeft="18%"
        videoWidth="64%"
        videoHeight="92%"
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="50%"
        mobileLeft="780px"
        mobileWidth="48vh"
        mobileHeight="67vh"
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
      
      {/* Video 2 - CALDO-3.mp4 - centro */}
      <VideoContainer 
        ref={el => imageRefs.current[2] = el}
        top="0%"
        left="2000px"
        width="100vh"
        height="70vh"
        zIndex={2}
        isVisible={visibleImages[2] !== false}
        isMobile={isMobile}
        // Ajustes específicos para móvil
        mobileTop="10%"
        mobileLeft="1200px"
        mobileWidth="73vh"
        mobileHeight="55vh"
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
        top="35%"
        left="2630px"
        width="100vh"
        height="70vh"
        zIndex={2}
        isVisible={visibleImages[3] !== false}
        isMobile={isMobile}
        // Ajustes específicos para móvil
        mobileTop="40%"
        mobileLeft="1540px"
        mobileWidth="73vh"
        mobileHeight="58vh"
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
      
      {/* Video 4 - CALDO-5.mp4 en marco */}
      <VideoContainer 
        ref={el => imageRefs.current[4] = el}
        top="50%"
        left="3500px"
        width="60vh"
        height="80vh"
        zIndex={2}
        isVisible={visibleImages[4] !== false}
        isMobile={isMobile}
        // Ajustes personalizados para este video
        videoTop="3%"
        videoLeft="18%"
        videoWidth="64%"
        videoHeight="92%"
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="50%"
        mobileLeft="2100px"
        mobileWidth="48vh"
        mobileHeight="67vh"
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
      
      {/* Logo CALDO BASTARDO - CALDO-6.png - centro - WITH AUDIO INTERACTION */}
      <LogoItem 
        ref={el => imageRefs.current[5] = el}
        top="45%"
        left="4270px"
        width="670px"
        height="auto"
        zIndex={3}
        isVisible={visibleImages[5] !== false}
        isMobile={isMobile}
        isInteractive={true} // New prop for hover effect
        isPlaying={isPlaying} // New prop to track audio state
        onClick={toggleAudio} // Click handler to play/pause audio
        sx={{ 
          transform: 'translateY(-50%) translateZ(0)',
          cursor: 'pointer', // Show pointer on hover
        }}
        // Ajustes específicos para móvil
        mobileTop="45%"
        mobileLeft="2550px"
        mobileWidth="450px"
      >
        <Box 
          component="img" 
          src={content.C6} 
          alt="CALDO BASTARDO" 
          loading="eager"
          sx={{ 
            // Visual indicator when audio is playing
            filter: isPlaying ? 'brightness(1.1)' : 'brightness(1)',
          }}
        />
      </LogoItem>
      
      {/* Video 5 - CALDO-7.mp4 en marco */}
      <VideoContainer 
        ref={el => imageRefs.current[6] = el}
        top="50%"
        left="5150px"
        width="60vh"
        height="80vh"
        zIndex={2}
        isVisible={visibleImages[6] !== false}
        isMobile={isMobile}
        // Ajustes personalizados para este video
        videoTop="3%"
        videoLeft="18%"
        videoWidth="64%"
        videoHeight="92%"
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
        // Ajustes específicos para móvil
        mobileTop="50%"
        mobileLeft="3100px"
        mobileWidth="48vh"
        mobileHeight="67vh"
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
        zIndex={3}
        isVisible={visibleImages[7] !== false}
        isMobile={isMobile}
        // Ajustes específicos para móvil
        mobileTop="10%"
        mobileLeft="3670px"
        mobileWidth="175px"
      >
        <Box component="img" src={content.C8} alt="GRDN" loading="lazy" />
      </LogoItem>
    </>
  );

  // Añadido useEffect para detección específica de dispositivos móviles reales
  useEffect(() => {
    // Detectar dispositivos móviles reales con mayor precisión
    const detectRealMobile = () => {
      const ua = navigator.userAgent;
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    };
    
    // Si estamos en un dispositivo móvil real, forzar ciertos ajustes
    if (detectRealMobile()) {
      // Asegurar que los elementos se muestren correctamente
      document.documentElement.style.fontSize = '14px';
      // Deshabilitar el comportamiento elástico en iOS
      document.body.style.overscrollBehavior = 'none';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      // Limpiar ajustes
      document.documentElement.style.fontSize = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
    };
  }, []);

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
            size={isMobile ? 40 : 60} 
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
          {renderGalleryContent()}
        </GalleryContent>
      </GalleryContainer>
    </>
  );
};

export default CaldoGallery;
