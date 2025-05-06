import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Box, CircularProgress, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow'; // Assuming this component exists
import useSmoothScroll from './useSmoothScroll'; // Assuming this hook exists
import { getGalleryColors } from '../utils/galleryColors'; // Assuming this utility exists

// Register GSAP plugins if needed (kept as is)
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

// Get the color theme for this gallery (kept as is)
const galleryTheme = getGalleryColors('kaboa');

// Custom font loading (kept as is)
const GlobalStyle = styled('style')({
  '@font-face': {
    fontFamily: 'Medium OTF',
    src: 'url("/fonts/Medium.otf") format("opentype")',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  },
});

// Loading screen (kept as is, already uses theme)
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

// Optimized scroll progress bar (kept as is, already uses theme)
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

// Loading Title - Responsive font size using MUI breakpoints
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontWeight: 'bold',
  color: galleryTheme.text,
  letterSpacing: '2px',
  position: 'relative',
  transform: 'translateY(100px)', // Start below viewport (for animation)
  opacity: 0,
  // Responsive font size
  fontSize: '32px', // Base size (mobile first)
  [theme.breakpoints.up('sm')]: {
    fontSize: '45px', // Larger on sm screens and up
  },
}));

// Loading Year - Responsive font size using MUI breakpoints
const LoadingYear = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontWeight: 'bold',
  color: galleryTheme.text,
  letterSpacing: '2px',
  marginTop: '8px',
  position: 'relative',
  transform: 'translateY(100px)', // Start below viewport (for animation)
  opacity: 0,
  marginBottom: '40px',
  // Responsive font size
  fontSize: '28px', // Base size (mobile first)
  [theme.breakpoints.up('sm')]: {
    fontSize: '40px', // Larger on sm screens and up
  },
}));

// Main container with horizontal scroll - Optimized with responsive background logic
const GalleryContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'scrollPosition'
})(({ theme, scrollPosition = 0 }) => {
  // Define scroll thresholds for different screen sizes if needed
  // For simplicity, using the desktop threshold for now. Adjust if the mobile layout differs drastically in scroll length.
  const scrollThreshold = 3900; // Might need adjustment based on final mobile content width
  const transitionLength = 800;

  const gradientProgress = Math.min(Math.max((scrollPosition - scrollThreshold) / transitionLength, 0), 1);

  const initialColor = '#ededed';
  const finalColor = '#ededed'; // Kept same, change if needed

  // Interpolate function remains the same
  const interpolateColor = (progress) => {
    const parseColor = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    const [r1, g1, b1] = parseColor(initialColor);
    const [r2, g2, b2] = parseColor(finalColor);
    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const bgColor = interpolateColor(gradientProgress);

  return {
    backgroundColor: bgColor,
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflowX: 'auto',
    overflowY: 'hidden',
    transform: 'translateZ(0)',
    perspective: '1000px',
    backfaceVisibility: 'hidden',
    willChange: 'scroll-position, background-color', // Keep will-change
    '-webkit-overflow-scrolling': 'touch',
    '&::-webkit-scrollbar': { display: 'none' },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    transition: 'background-color 0.1s ease-out',
    // Ensures full height on all devices
    minHeight: '100vh', 
    // No specific mobile overrides needed here anymore as overflow is handled
  };
});

// Content container - Responsive width and padding
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center', // Vertically center items within the container height
  height: '100%',
  position: 'relative', // Keep relative for absolute children positioning
  transform: 'translateZ(0)', // GPU acceleration

  // Responsive width and padding
  // Mobile first approach: start with mobile values (xs breakpoint implicitly)
  width: '5200px', // Mobile width from original code
  padding: theme.spacing(2.5), // 20px using theme spacing
  paddingRight: theme.spacing(18.75), // 150px mobile padding right

  // Styles for 'md' breakpoint and up (tablets/desktops)
  [theme.breakpoints.up('md')]: {
    width: '8000px', // Desktop width
    padding: theme.spacing(5), // 40px desktop padding
    paddingRight: theme.spacing(37.5), // 300px desktop padding right
  },
}));

// --- Refactored ImageItem ---
const ImageItem = styled(Box, {
  // Forward all props except those explicitly used for styling logic here
  shouldForwardProp: (prop) => 
    !['top', 'left', 'width', 'height', 'zIndex', 'isVisible'].includes(prop)
})(({ 
  theme, 
  // Define desktop values as direct props (will be overridden by breakpoints)
  top = '50%', 
  left = '0px', 
  width = 'auto', 
  height = 'auto', 
  zIndex = 1, 
  isVisible = true,
  // Add props for mobile overrides (used internally now, not passed from parent)
  mobileTop,
  mobileLeft,
  mobileHeight,
  mobileWidth
}) => ({
  position: 'absolute',
  zIndex: zIndex,
  marginBottom: '0', 
  opacity: isVisible ? 1 : 0,
  // Center vertically using translateY(-50%) based on the 'top' property
  transform: isVisible ? 'translateY(-50%) translateZ(0)' : 'translateY(-50%) translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden', 

  // --- Responsive Styles ---
  // Mobile styles (applied on xs, sm breakpoints - screens smaller than 'md')
  [theme.breakpoints.down('md')]: {
    top: mobileTop || top, // Use mobile override if provided, else fallback to desktop 'top'
    left: mobileLeft || left, // Use mobile override for left
    width: mobileWidth || width, // Use mobile override for width
    height: mobileHeight || height, // Use mobile override for height
  },
  
  // Desktop styles (applied on md, lg, xl breakpoints)
  [theme.breakpoints.up('md')]: {
    top: top, // Use the 'top' prop directly
    left: left, // Use the 'left' prop directly
    width: width, // Use the 'width' prop directly
    height: height, // Use the 'height' prop directly
  },
  
  // Styles for the inner image element
  '& img': {
    display: 'block', // Prevents potential bottom space
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '2px',
    boxShadow: 'none',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
  }
}));


// --- Refactored VideoContainer ---
const VideoContainer = styled(Box, {
  // Forward props except those used for styling logic here
  shouldForwardProp: (prop) => 
    !['top', 'left', 'width', 'height', 'zIndex', 'isVisible', 
      'videoTop', 'videoLeft', 'videoWidth', 'videoHeight'].includes(prop)
})(({ 
  theme, 
  // Desktop container values
  top = '50%', 
  left = '0px', 
  width = 'auto', 
  height = 'auto', 
  zIndex = 1, 
  isVisible = true,
  // Desktop internal video values
  videoTop = '16%',
  videoLeft = '16%',
  videoWidth = '68%',
  videoHeight = '60%',
  // Mobile overrides (used internally)
  mobileTop, mobileLeft, mobileHeight, mobileWidth,
  mobileVideoTop, mobileVideoLeft, mobileVideoWidth, mobileVideoHeight
}) => ({
  position: 'absolute',
  zIndex: zIndex,
  marginBottom: '0',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(-50%) translateZ(0)' : 'translateY(-50%) translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
  overflow: 'visible',
  backfaceVisibility: 'hidden',

  // --- Responsive Styles for the Container ---
  [theme.breakpoints.down('md')]: {
    top: mobileTop || top,
    left: mobileLeft || left,
    width: mobileWidth || width,
    height: mobileHeight || height,
  },
  [theme.breakpoints.up('md')]: {
    top: top,
    left: left,
    width: width,
    height: height,
  },

  // Styles for the frame (assumed to always fill the container)
  '& .frame': {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'contain', // Use contain to see the whole frame
    zIndex: 5,
    boxShadow: 'none',
    pointerEvents: 'none',
    transform: 'translateZ(0)',
  },

  // Styles for the inner video element
  '& .video': {
    position: 'absolute',
    objectFit: 'cover',
    zIndex: 3,
    borderRadius: '0',
    transform: 'translateZ(0)',

    // --- Responsive Styles for the Video inside the Frame ---
    [theme.breakpoints.down('md')]: {
        top: mobileVideoTop || videoTop,
        left: mobileVideoLeft || videoLeft,
        width: mobileVideoWidth || videoWidth,
        height: mobileVideoHeight || videoHeight,
    },
    [theme.breakpoints.up('md')]: {
        top: videoTop,
        left: videoLeft,
        width: videoWidth,
        height: videoHeight,
    },
  }
}));


// --- Main KaboaGallery Component ---
const KaboaGallery = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);
  const progressBarRef = useRef(null);
  const containerRef = useRef(null);
  
  const [visibleImages, setVisibleImages] = useState({});
  const imageRefs = useRef([]);

  const content = useMemo(() => ({
    FRAME: '/images/KABOA/KABOA-7 MARCO.png',
    K1: '/images/KABOA/KABOA-1.jpg',
    K2: '/images/KABOA/KABOA-2.jpg',
    K3: '/images/KABOA/KABOA-3.jpg',
    K4: '/images/KABOA/KABOA-4.jpg',
    K5: '/images/KABOA/KABOA-5.jpg',
    K6: '/images/KABOA/KABOA-6.jpg',
    K7: '/images/KABOA/KABOA-7.mp4',
    K8: '/images/KABOA/KABOA-8.jpg',
    K9: '/images/KABOA/KABOA-9.jpg',
  }), []);
  
  const theme = useTheme();
  // Still use isMobile for logic if needed (e.g., in useSmoothScroll), but not for styling components
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Using 'md' as the breakpoint

  // Visibility Check (Keep as is, uses container dimensions)
  const checkVisibility = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const preloadMargin = containerWidth * 0.8; // Preload when 80% of viewport width away
    const newVisibility = {};

    imageRefs.current.forEach((itemRef, index) => {
      if (itemRef && itemRef.current) {
        const element = itemRef.current;
        // Get bounding client rect relative to viewport
        const elementRect = element.getBoundingClientRect();
        
        // Check if the element's horizontal range overlaps with the container's
        // visible range plus the preload margin on both sides.
        const isVisible = (
          elementRect.left < containerRect.right + preloadMargin &&
          elementRect.right > containerRect.left - preloadMargin
        );

        // Update visibility state only if it changes
        if (visibleImages[index] !== isVisible) {
             newVisibility[index] = isVisible;
        } else if (visibleImages[index] === undefined && isVisible) {
             // Handle initial visibility
             newVisibility[index] = isVisible;
        } else if (visibleImages[index] !== undefined) {
             // Keep previous state if no change
             newVisibility[index] = visibleImages[index];
        }
      }
    });

    // Only update state if there are actual changes to avoid unnecessary re-renders
     if (Object.keys(newVisibility).length > 0 && JSON.stringify(visibleImages) !== JSON.stringify({...visibleImages, ...newVisibility})) {
       setVisibleImages(prev => ({...prev, ...newVisibility}));
     }
  }, [visibleImages]); // Add visibleImages dependency


  // Use Smooth Scroll Hook (Pass isMobile if the hook uses it internally)
  const { scrollLeft, scrollProgress } = useSmoothScroll({
    containerRef,
    isMobile, // Pass the breakpoint-based isMobile flag
    isLoading: loading,
    checkVisibility, // Pass the visibility check function
    horizontal: true,
    duration: 2.5,
    wheelMultiplier: 1.2,
    touchMultiplier: 2,
    lerp: 0.04,
    colors: galleryTheme
  });
  
  // Loading screen animations (Keep as is)
  useEffect(() => {
    if (!loading) return;
    if (titleRef.current && yearRef.current) {
      const options = { y: 0, opacity: 1, duration: 1, ease: "power2.out" };
      gsap.to(titleRef.current, { ...options, delay: 0.3 });
      gsap.to(yearRef.current, { ...options, delay: 0.5 });
    }
    return () => {
      gsap.killTweensOf(titleRef.current);
      gsap.killTweensOf(yearRef.current);
    };
  }, [loading]);
  
  // Loading progress animation (Keep as is)
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadProgress(prev => {
          const next = prev + (Math.random() * 15);
          if (next >= 100) {
            clearInterval(interval);
            if (titleRef.current && yearRef.current && loadingScreenRef.current) {
              const options = { y: -100, opacity: 0, duration: 0.8, ease: "power2.in" };
              gsap.to(titleRef.current, options);
              gsap.to(yearRef.current, {
                ...options,
                delay: 0.1,
                onComplete: () => {
                  gsap.to(loadingScreenRef.current, {
                    opacity: 0, duration: 0.5, delay: 0.2,
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

  // Force loading timeout (Keep as is)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Forcing loading to complete');
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Optimize browser performance (Keep as is)
  useEffect(() => {
    if (!loading) {
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.scrollBehavior = 'auto'; // Use 'auto' for smooth scroll libraries
    }
    return () => {
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.scrollBehavior = '';
    };
  }, [loading]);
  
   // IntersectionObserver for visibility (Revised to simplify state updates)
   // NOTE: Using the checkVisibility on scroll might be more reliable for this horizontal layout
   // than IntersectionObserver, which usually works better with vertical scrolling roots.
   // Consider removing IO if checkVisibility on scroll works well. Keep IO for now.
   useEffect(() => {
     if (loading || !containerRef.current || !('IntersectionObserver' in window)) {
        // If IO not supported or loading, rely solely on scroll-based checkVisibility
        return;
     };

     // Initial check
     checkVisibility(); 
     
     const options = {
       root: null, // Observe intersections relative to the viewport
       rootMargin: '0px 150px 0px 150px', // Horizontal margin for preloading/unloading
       threshold: 0.01 // Trigger even if only a small part is visible
     };
     
     const observer = new IntersectionObserver((entries) => {
       const newVisibility = {};
       let changed = false;
       entries.forEach(entry => {
         const id = entry.target.dataset.id;
         if (id) {
             const index = parseInt(id, 10);
             const isNowVisible = entry.isIntersecting;
             if (visibleImages[index] !== isNowVisible) {
                 newVisibility[index] = isNowVisible;
                 changed = true;
             }
         }
       });

       if (changed) {
         setVisibleImages(prev => ({ ...prev, ...newVisibility }));
       }
     }, options);
     
     const refs = imageRefs.current; // Cache refs
     refs.forEach((itemRef, index) => {
       if (itemRef?.current) {
         itemRef.current.dataset.id = index; // Set ID for observer callback
         observer.observe(itemRef.current);
       }
     });
     
     return () => {
        refs.forEach(itemRef => {
            if (itemRef?.current) {
                // Check if observer is still valid before unobserving
                try {
                    observer.unobserve(itemRef.current);
                } catch (e) {
                    console.warn("Error unobserving element:", e);
                }
            }
        });
       // Make sure to disconnect the observer
       observer.disconnect(); 
     };
   }, [loading, checkVisibility, visibleImages]); // Added visibleImages

  // Specific mobile device adjustments (Keep as is, if needed)
  useEffect(() => {
    const detectRealMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (detectRealMobile()) {
      // Apply styles carefully - 'position: fixed' on body can break scrolling.
      // document.documentElement.style.fontSize = '14px'; // Be careful with global font size changes
      document.body.style.overscrollBehavior = 'none'; // Good for preventing pull-to-refresh
      // Avoid fixing body position if using a scroll container like GalleryContainer
      // document.body.style.position = 'fixed'; 
      // document.body.style.width = '100%';
      // document.body.style.height = '100%';
      // document.body.style.overflow = 'hidden';
    }
    
    return () => {
      // document.documentElement.style.fontSize = '';
      document.body.style.overscrollBehavior = '';
      // document.body.style.position = '';
      // document.body.style.width = '';
      // document.body.style.height = '';
      // document.body.style.overflow = '';
    };
  }, []);

  // --- Render Gallery Content ---
  // Pass desktop values as props. Mobile overrides are handled *inside* the styled components.
  const renderGalleryContent = () => (
    <>
      {/* Image 1 */}
      <ImageItem 
        ref={el => imageRefs.current[0] = { current: el }} // Ensure ref is assigned correctly
        top="50%" left="450px" height="80vh" width="auto" zIndex={2}
        isVisible={!!visibleImages[0]} // Use boolean check
        // Mobile overrides passed to the styled component for internal use
        mobileTop="45%" mobileLeft="270px" mobileHeight="75vh" mobileWidth="85vw"
      >
        <Box component="img" src={content.K1} alt="KABOA 1" loading="eager" />
      </ImageItem>
      
      {/* Image 2 */}
      <ImageItem 
        ref={el => imageRefs.current[1] = { current: el }}
        top="50%" left="1400px" height="85vh" width="auto" zIndex={2}
        isVisible={!!visibleImages[1]}
        mobileTop="45%" mobileLeft="840px" mobileHeight="75vh" mobileWidth="85vw"
      >
        <Box component="img" src={content.K2} alt="KABOA 2" loading="lazy" />
      </ImageItem>
      
      {/* Image 3 */}
      <ImageItem 
        ref={el => imageRefs.current[2] = { current: el }}
        top="33%" left="2100px" height="45vh" width="auto" zIndex={2}
        isVisible={!!visibleImages[2]}
        mobileTop="33%" mobileLeft="1260px" mobileHeight="40vh" mobileWidth="65vw"
      >
        <Box component="img" src={content.K3} alt="KABOA 3" loading="lazy" />
      </ImageItem>
      
      {/* Image 4 */}
      <ImageItem 
        ref={el => imageRefs.current[3] = { current: el }}
        top="50%" left="2700px" height="80vh" width="auto" zIndex={2}
        isVisible={!!visibleImages[3]}
        mobileTop="45%" mobileLeft="1620px" mobileHeight="75vh" mobileWidth="85vw"
      >
        <Box component="img" src={content.K4} alt="KABOA 4" loading="lazy" />
      </ImageItem>
      
      {/* Image 5 */}
      <ImageItem 
        ref={el => imageRefs.current[4] = { current: el }}
        top="50%" left="3500px" height="80vh" width="auto" zIndex={2}
        isVisible={!!visibleImages[4]}
        mobileTop="45%" mobileLeft="2100px" mobileHeight="75vh" mobileWidth="180vw" // Kept 180vw as per original mobile spec
      >
        <Box component="img" src={content.K5} alt="KABOA 5" loading="lazy" />
      </ImageItem>
      
      {/* Image 6 */}
      <ImageItem 
        ref={el => imageRefs.current[5] = { current: el }}
        top="42%" left="4450px" height="70vh" width="auto" zIndex={2}
        isVisible={!!visibleImages[5]}
        mobileTop="42%" mobileLeft="2670px" mobileHeight="63vh" mobileWidth="85vw"
      >
        <Box component="img" src={content.K6} alt="KABOA 6" loading="lazy" />
      </ImageItem>
      
      {/* Video 7 in frame */}
      <VideoContainer 
        ref={el => imageRefs.current[6] = { current: el }}
        top="50%" left="5300px" width="70vh" height="90vh" zIndex={2}
        isVisible={!!visibleImages[6]}
        // Desktop internal video position
        videoTop="3%" videoLeft="17%" videoWidth="67%" videoHeight="94%"
        // Mobile overrides for container
        mobileTop="45%" mobileLeft="3180px" mobileHeight="75vh" mobileWidth="85vw"
        // Mobile overrides for internal video position
        mobileVideoTop="3%" mobileVideoLeft="7%" mobileVideoWidth="86%" mobileVideoHeight="94%"
      >
        <Box 
          component="video" className="video" src={content.K7} alt="KABOA Video 7"
          autoPlay loop muted playsInline // playsInline is important for mobile
        />
        <Box 
          component="img" className="frame" src={content.FRAME} alt="KABOA Video Frame" 
        />
      </VideoContainer>
      
      {/* Image 8 */}
      <ImageItem 
        ref={el => imageRefs.current[7] = { current: el }}
        top="50%" left="6200px" height="80vh" width="auto" zIndex={2}
        isVisible={!!visibleImages[7]}
        mobileTop="45%" mobileLeft="3720px" mobileHeight="72vh" mobileWidth="85vw"
      >
        <Box component="img" src={content.K8} alt="KABOA 8" loading="lazy" />
      </ImageItem>
      
      {/* Image 9 */}
      <ImageItem 
        ref={el => imageRefs.current[8] = { current: el }}
        // Desktop: Note original was top: 35%, using that instead of 50%? Let's use 35% as specified.
        top="35%" left="6900px" height="75vh" width="auto" zIndex={2} 
        isVisible={!!visibleImages[8]}
        // Mobile overrides
        mobileTop="35%" mobileLeft="4140px" mobileHeight="67vh" mobileWidth="180vw" // Kept 180vw as per original mobile spec
      >
        <Box component="img" src={content.K9} alt="KABOA 9" loading="lazy" />
      </ImageItem>
    </>
  );

  return (
    <>
      <GlobalStyle />
      
      {/* Loading screen */}
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          <LoadingTitle ref={titleRef}>KABOA</LoadingTitle>
          <LoadingYear ref={yearRef}>2024</LoadingYear>
          <CircularProgress 
            variant="determinate" value={loadProgress} size={60} thickness={4}
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
          width: `${scrollProgress}%` // Use state from smooth scroll hook
        }} 
      />
      
      {/* Navigation arrow */}
      <NavigationArrow 
        onBack={onBack} 
        containerRef={containerRef} // Pass container ref if needed by arrow
        colors={galleryTheme}
        isLoading={loading}
      />
      
      {/* Main Gallery Container */}
      <GalleryContainer 
        ref={containerRef} 
        scrollPosition={scrollLeft} // Pass scrollLeft from hook for background effect
        style={{ cursor: loading ? 'default' : 'grab' }} // Change cursor when not loading
      >
        <GalleryContent>
          {/* Render content only when not loading to potentially improve initial perf */}
          {!loading && renderGalleryContent()} 
        </GalleryContent>
      </GalleryContainer>
    </>
  );
};

export default KaboaGallery;
