import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import NavigationArrow from './NavigationArrow'; // Assuming this component exists
import GalleryLoadingScreen from './GalleryLoadingScreen';
import useSmoothScroll from './useSmoothScroll'; // Assuming this hook exists
import { getGalleryColors } from '../utils/galleryColors'; // Assuming this utility exists

// Register GSAP plugins if needed (kept as is)
if (typeof window !== 'undefined' && typeof require === 'function') {
  try {
    const { gsap } = require('gsap');
    const { CSSPlugin } = require('gsap/CSSPlugin');
    if (typeof gsap.registerPlugin === 'function') {
      gsap.registerPlugin(CSSPlugin);
    }
  } catch (e) {
    console.warn('GSAP plugin registration failed:', e);
  }
}

// Get the color theme for this gallery (kept as is)
const galleryTheme = getGalleryColors('kaboa');

// Custom font loading - separating each font declaration into its own component
const MediumFontStyle = styled('style')({
  '@font-face': {
    fontFamily: 'Medium OTF',
    src: 'url("/fonts/Medium.otf") format("opentype")',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  }
});

const MyriadFontStyle = styled('style')({
  '@font-face': {
    fontFamily: 'MYRIADPRO-BOLD',
    src: 'url("/fonts/MYRIADPRO-BOLD.OTF") format("opentype")',
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  }
});

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
    transform: 'translateZ(0)',  // Force GPU acceleration
    perspective: '1000px',      // Enhance GPU acceleration
    backfaceVisibility: 'hidden', // Further GPU optimization
    willChange: 'scroll-position',
    WebkitOverflowScrolling: 'touch',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    transition: 'background-color 0.1s ease-out',
    // Ensures full height on all devices
    minHeight: '100vh',
    [theme.breakpoints.down('sm')]: {
      overflowX: 'auto', // Ensure horizontal scrolling on mobile
      overflowY: 'hidden', // Prevent vertical scrolling
      height: '100vh',
    },
  };
});

// Content container - Responsive width and padding
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center', // Vertically center items within the container height
  height: '100%',
  position: 'relative', // Keep relative for absolute children positioning
  transform: 'translateZ(0)', // GPU acceleration
  width: '8295px', // Desktop width
  padding: theme.spacing(5), // 40px desktop padding
  paddingRight: theme.spacing(37.5), // 300px desktop padding right

  [theme.breakpoints.down('md')]: {
    width: '5200px', // Mobile width
    padding: theme.spacing(2.5), // 20px using theme spacing
    paddingRight: theme.spacing(18.75), // 150px mobile padding right
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

  const progressBarRef = useRef(null);
  const containerRef = useRef(null);

  const [visibleImages, setVisibleImages] = useState({});
  const imageRefs = useRef([]);

  const content = useMemo(() => ({
    FRAME: '/images/KABOA/KABOA-7 MARCO.png',
    K1: '/images/KABOA/webp/KABOA-1.webp',
    K2: '/images/KABOA/webp/KABOA-2.webp',
    K3: '/images/KABOA/webp/KABOA-3.webp',
    K4: '/images/KABOA/webp/KABOA-4.webp',
    K5: '/images/KABOA/webp/KABOA-5.webp',
    K6: '/images/KABOA/webp/KABOA-6.webp',
    K7: '/images/KABOA/KABOA-7.mp4',
    K8: '/images/KABOA/webp/KABOA-8.webp',
    K9: '/images/KABOA/webp/KABOA-9.webp',
  }), []);

  const theme = useTheme();
  // Still use isMobile for logic if needed (e.g., in useSmoothScroll), but not for styling components
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Using 'md' as the breakpoint

  // Visibility Check - simplified for better performance
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

        // Always use horizontal scrolling check logic
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
  }, []);


  // Use Smooth Scroll Hook
  const { scrollLeft, scrollProgress, lenis } = useSmoothScroll({
    containerRef,
    isMobile,
    isLoading: loading,
    checkVisibility,
    horizontal: true, // Always use horizontal scrolling
    duration: 2.5,           // Extended duration for smoother motion
    wheelMultiplier: 1.2,     // Higher multiplier for more responsive scrolling
    touchMultiplier: 2,       // Higher touch multiplier
    lerp: 0.04,               // Lower lerp for ultra smooth motion
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

  // Handle loading animation complete
  const handleLoadingComplete = () => {
    setLoading(false);
  };

  // Optimize browser performance
  useEffect(() => {
    if (!loading) {
      // Add will-change hint for smoother overall page performance
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
        root: containerRef.current, // Use container as root for both mobile and desktop
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
  }, [loading, checkVisibility]);

  // Specific mobile device adjustments (simplified)
  useEffect(() => {
    const detectRealMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (detectRealMobile()) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  const renderGalleryContent = () => (
    <>
      {/* Image 1 */}
      <ImageItem
        ref={el => imageRefs.current[0] = el}
        top="50%" left="450px" height="80vh" width="auto" zIndex={2}
        isVisible={visibleImages[0] !== false}
        mobileTop="45%" mobileLeft="270px" mobileHeight="75vh" mobileWidth="85vw"
      >
        <Box component="img" src={content.K1} alt="KABOA 1" loading="eager" />
      </ImageItem>

      {/* Image 2 */}
      <ImageItem
        ref={el => imageRefs.current[1] = el}
        top="50%" left="1400px" height="85vh" width="auto" zIndex={2}
        isVisible={visibleImages[1] !== false}
        mobileTop="45%" mobileLeft="840px" mobileHeight="75vh" mobileWidth="85vw"
      >
        <Box component="img" src={content.K2} alt="KABOA 2" loading="lazy" />
      </ImageItem>

      {/* Image 3 */}
      <ImageItem
        ref={el => imageRefs.current[2] = el}
        top="33%" left="2100px" height="45vh" width="auto" zIndex={2}
        isVisible={visibleImages[2] !== false}
        mobileTop="33%" mobileLeft="1260px" mobileHeight="40vh" mobileWidth="65vw"
      >
        <Box component="img" src={content.K3} alt="KABOA 3" loading="lazy" />
      </ImageItem>

      {/* Image 4 */}
      <ImageItem
        ref={el => imageRefs.current[3] = el}
        top="50%" left="2700px" height="80vh" width="auto" zIndex={2}
        isVisible={visibleImages[3] !== false}
        mobileTop="45%" mobileLeft="1620px" mobileHeight="75vh" mobileWidth="85vw"
      >
        <Box component="img" src={content.K4} alt="KABOA 4" loading="lazy" />
      </ImageItem>

      {/* Image 5 */}
      <ImageItem
        ref={el => imageRefs.current[4] = el}
        top="50%" left="3500px" height="80vh" width="auto" zIndex={2}
        isVisible={visibleImages[4] !== false}
        mobileTop="45%" mobileLeft="2100px" mobileHeight="75vh" mobileWidth="180vw"
      >
        <Box component="img" src={content.K5} alt="KABOA 5" loading="lazy" />
      </ImageItem>

      {/* Image 6 */}
      <ImageItem
        ref={el => imageRefs.current[5] = el}
        top="42%" left="4450px" height="70vh" width="auto" zIndex={2}
        isVisible={visibleImages[5] !== false}
        mobileTop="42%" mobileLeft="2670px" mobileHeight="63vh" mobileWidth="85vw"
      >
        <Box component="img" src={content.K6} alt="KABOA 6" loading="lazy" />
      </ImageItem>

      {/* Video 7 in frame */}
      <VideoContainer
        ref={el => imageRefs.current[6] = el}
        top="50%" left="5300px" width="70vh" height="90vh" zIndex={2}
        isVisible={visibleImages[6] !== false}
        videoTop="3%" videoLeft="17%" videoWidth="67%" videoHeight="94%"
        mobileTop="45%" mobileLeft="3180px" mobileHeight="75vh" mobileWidth="85vw"
        mobileVideoTop="3%" mobileVideoLeft="7%" mobileVideoWidth="86%" mobileVideoHeight="94%"
      >
        <Box
          component="video" className="video" src={content.K7} alt="KABOA Video 7"
          autoPlay loop muted playsInline
        />
        <Box
          component="img" className="frame" src={content.FRAME} alt="KABOA Video Frame"
        />
      </VideoContainer>

      {/* Image 8 */}
      <ImageItem
        ref={el => imageRefs.current[7] = el}
        top="50%" left="6200px" height="80vh" width="auto" zIndex={2}
        isVisible={visibleImages[7] !== false}
        mobileTop="45%" mobileLeft="3720px" mobileHeight="72vh" mobileWidth="85vw"
      >
        <Box component="img" src={content.K8} alt="KABOA 8" loading="lazy" />
      </ImageItem>

      {/* Image 9 */}
      <ImageItem
        ref={el => imageRefs.current[8] = el}
        top="50%" left="7100px" height="80vh" width="auto" zIndex={2}
        isVisible={visibleImages[8] !== false}
        mobileTop="35%" mobileLeft="4140px" mobileHeight="67vh" mobileWidth="180vw"
      >
        <Box component="img" src={content.K9} alt="KABOA 9" loading="lazy" />
      </ImageItem>
    </>
  );

  return (
    <>
      <MediumFontStyle />
      <MyriadFontStyle />

      {/* Loading screen component */}
      <GalleryLoadingScreen
        title="Kaboa SS24"
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
