'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
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
  backgroundColor: '#f5f5f5',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  transition: 'opacity 0.5s ease-out',
  overflow: 'hidden',
}));

// Components for VESTIMETEO and 2024
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '45px',
  fontWeight: 'bold',
  color: 'black',
  letterSpacing: '2px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
}));

const LoadingYear = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '40px',
  fontWeight: 'bold',
  color: 'black',
  letterSpacing: '2px',
  marginTop: '8px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  marginBottom: '40px',
}));

// Gallery container con degradado dinámico
const GalleryContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'scrollPosition'
})(({ theme, scrollPosition = 0 }) => {
  // Valor de scroll donde comienza la transición (después de la tercera imagen)
  const scrollThreshold = 1200;
  // Cantidad de scroll necesaria para completar la transición
  const transitionLength = 800;
  // Progreso de la transición (0 a 1)
  const gradientProgress = Math.min(Math.max((scrollPosition - scrollThreshold) / transitionLength, 0), 1);
  
  // Color inicial y final
  const initialColor = '#F1F2F2'; // Gris claro
  const finalColor = '#B4E5F3';   // Celeste
  
  // Función para interpolar color
  const interpolateColor = (progress) => {
    // Parseamos colores hex a RGB
    const parseColor = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    
    const [r1, g1, b1] = parseColor(initialColor);
    const [r2, g2, b2] = parseColor(finalColor);
    
    // Interpolamos entre los dos colores
    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);
    
    // Convertimos de vuelta a hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Color resultante basado en el scroll
  const bgColor = scrollPosition < scrollThreshold ? initialColor : interpolateColor(gradientProgress);
  
  return {
    backgroundColor: bgColor,
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
      backgroundImage: scrollPosition < scrollThreshold ? 
        'none' : 
        `linear-gradient(to bottom, ${initialColor} 0%, ${interpolateColor(gradientProgress)} 100%)`,
    },
  };
});

// Aumentamos aún más el ancho para tener más espacio para las imágenes
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '7000px', // Aumentado de 6000px a 8000px para dar más espacio
  height: '100%',
  padding: '40px',
  paddingRight: '300px',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    flexDirection: 'column',
    height: 'auto',
    padding: '20px',
  },
}));

// Image item - mantenemos el mismo que antes
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => 
    prop !== 'isMobile' && 
    prop !== 'top' && 
    prop !== 'left' && 
    prop !== 'isVisible' &&
    prop !== 'isPhoto'
})(({ theme, top, left, width, height, zIndex = 1, isMobile = false, isVisible = true, isPhoto = true }) => ({
  position: isMobile ? 'relative' : 'absolute',
  top: isMobile ? 'auto' : top,
  left: isMobile ? 'auto' : left,
  width: width,
  height: height,
  zIndex: zIndex,
  marginBottom: isMobile ? '40px' : '0',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(-50%)' : 'translateY(-50%) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: isPhoto ? 'cover' : 'contain',
    borderRadius: isPhoto ? '2px' : '0',
    boxShadow: isPhoto ? '0 3px 8px rgba(0,0,0,0.25)' : 'none',
    backfaceVisibility: 'hidden',
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

const VestimeTeoGallery = ({ onBack }) => {
  // Loading state
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Refs for animation elements
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);
  
  const containerRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  // State to control image visibility
  const [visibleImages, setVisibleImages] = useState({});
  // Refs for all images
  const imageRefs = useRef([]);

  // Images for the gallery - Reordenadas según instrucciones
  // Secuencia: V1, V2, [V3, V4], V6, V8, [V9, V5], V7
  const images = [
    '/images/TEO/V1.jpg',
    '/images/TEO/V2.jpg',
    '/images/TEO/V3.jpg',
    '/images/TEO/V4.jpg',
    '/images/TEO/V6.jpg',
    '/images/TEO/V8.jpg',
    '/images/TEO/V9.jpg',
    '/images/TEO/V5.jpg',
    '/images/TEO/V7.jpg',
  ];
  
  // U1.png for placement between photos
  const artImage = '/images/TEO/U1.png';
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Effect to animate title and year in loading screen
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
  
  // Effect to control loading screen with progress
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

  // Function to check which images are visible
  const checkVisibility = React.useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
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

  // Set up optimized scroll
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

    // Drag functionality
    let isDown = false;
    let startX;
    let scrollStartLeft;

    const handleMouseDown = (e) => {
      if (isMobile) return;
      isDown = true;
      container.style.cursor = 'grabbing';
      startX = e.pageX - container.offsetLeft;
      scrollStartLeft = container.scrollLeft;
    };

    const handleMouseUp = () => {
      if (isMobile) return;
      isDown = false;
      container.style.cursor = 'grab';
    };

    const handleMouseLeave = () => {
      if (isMobile) return;
      isDown = false;
      container.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
      if (!isDown || isMobile) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollStartLeft - walk;
      setScrollLeft(container.scrollLeft);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousemove', handleMouseMove);
    
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
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('scroll', handleScroll);
      };
    }
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, checkVisibility]);

  // Mobile view rendering - orden: V1, V2, [V3, V4], V6, V8, [V9, V5], V7
  const renderMobileView = () => (
    <>
      {/* V1 */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[0] !== false}
      >
        <Box 
          component="img" 
          src={images[0]} 
          alt="Vestimeteo 1" 
          loading="eager"
        />
      </ImageItem>

      {/* V2 */}
      <ImageItem 
        ref={el => imageRefs.current[1] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[1] !== false}
      >
        <Box 
          component="img" 
          src={images[1]} 
          alt="Vestimeteo 2" 
          loading="eager"
        />
      </ImageItem>

      {/* V3 */}
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[2] !== false}
      >
        <Box 
          component="img" 
          src={images[2]} 
          alt="Vestimeteo 3" 
          loading="eager"
        />
      </ImageItem>

      {/* V4 */}
      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[3] !== false}
      >
        <Box 
          component="img" 
          src={images[3]} 
          alt="Vestimeteo 4" 
          loading="lazy"
        />
      </ImageItem>

      {/* Art graphic between photos */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        isMobile={true}
        width="90%"
        height="auto"
        isVisible={visibleImages[4] !== false}
        isPhoto={false}
      >
        <Box 
          component="img" 
          src={artImage} 
          alt="Vestimeteo Art" 
          loading="lazy"
        />
      </ImageItem>

      {/* V6 */}
      <ImageItem 
        ref={el => imageRefs.current[5] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[5] !== false}
      >
        <Box 
          component="img" 
          src={images[4]} 
          alt="Vestimeteo 6" 
          loading="lazy"
        />
      </ImageItem>

      {/* V8 */}
      <ImageItem 
        ref={el => imageRefs.current[6] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[6] !== false}
      >
        <Box 
          component="img" 
          src={images[5]} 
          alt="Vestimeteo 8" 
          loading="lazy"
        />
      </ImageItem>

      {/* V9 */}
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[7] !== false}
      >
        <Box 
          component="img" 
          src={images[6]} 
          alt="Vestimeteo 9" 
          loading="lazy"
        />
      </ImageItem>

      {/* V5 */}
      <ImageItem 
        ref={el => imageRefs.current[8] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[8] !== false}
      >
        <Box 
          component="img" 
          src={images[7]} 
          alt="Vestimeteo 5" 
          loading="lazy"
        />
      </ImageItem>

      {/* V7 - última imagen */}
      <ImageItem 
        ref={el => imageRefs.current[9] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[9] !== false}
      >
        <Box 
          component="img" 
          src={images[8]} 
          alt="Vestimeteo 7" 
          loading="lazy"
        />
      </ImageItem>
    </>
  );

  // Desktop view: V1, V2, [V3, V4], V6, V8, [V9, V5], V7
  // Ajustando las posiciones left para evitar superposiciones
  const renderDesktopView = () => (
    <>
      {/* V1 */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        top="50%"
        left="450px" // Ajustado para aumentar separación
        height="70vh"
        zIndex={2}
        isVisible={visibleImages[0] !== false}
      >
        <Box 
          component="img" 
          src={images[0]} 
          alt="Vestimeteo 1" 
          loading="eager"
        />
      </ImageItem>

      {/* V2 */}
      <ImageItem 
        ref={el => imageRefs.current[1] = el}
        top="50%"
        left="1100px" // Aumentado para separar de V1
        height="70vh"
        zIndex={2}
        isVisible={visibleImages[1] !== false}
      >
        <Box 
          component="img" 
          src={images[1]} 
          alt="Vestimeteo 2" 
          loading="eager"
        />
      </ImageItem>

      {/* V3 y V4 juntas con mismo tamaño - más espaciadas */}
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        top="50%"
        left="2000px" // Separado más de V2
        height="100vh"
        zIndex={2}
        isVisible={visibleImages[2] !== false}
      >
        <Box 
          component="img" 
          src={images[2]} 
          alt="Vestimeteo 3" 
          loading="eager"
        />
      </ImageItem>

      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        top="50%"
        left="2733px" // Posicionado justo al lado de V3 con espacio
        height="100vh"
        zIndex={2}
        isVisible={visibleImages[3] !== false}
      >
        <Box 
          component="img" 
          src={images[3]} 
          alt="Vestimeteo 4" 
          loading="lazy"
        />
      </ImageItem>

      {/* Art graphic */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top="50%"
        left="3170px" // Reposicionado
        height="100vh" // Ajustando el tamaño para mantener proporción
        zIndex={3}
        isVisible={visibleImages[4] !== false}
        isPhoto={false}
      >
        <Box 
          component="img" 
          src={artImage} 
          alt="Vestimeteo Art" 
          loading="lazy"
        />
      </ImageItem>

      {/* V6 */}
      <ImageItem 
        ref={el => imageRefs.current[5] = el}
        top="50%"
        left="3950px" // Ajustado
        height="70vh"
        zIndex={2}
        isVisible={visibleImages[5] !== false}
      >
        <Box 
          component="img" 
          src={images[4]} 
          alt="Vestimeteo 6" 
          loading="lazy"
        />
      </ImageItem>

      {/* V8 */}
      <ImageItem 
        ref={el => imageRefs.current[6] = el}
        top="50%"
        left="4650px" // Ajustado
        height="70vh"
        zIndex={2}
        isVisible={visibleImages[6] !== false}
      >
        <Box 
          component="img" 
          src={images[5]} 
          alt="Vestimeteo 8" 
          loading="lazy"
        />
      </ImageItem>

      {/* V9 y V5 tocándose en los vértices - ajustadas para tocar vértices */}
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        top="30%"
        left="5470px" // Ajustado
        height="50vh"
        zIndex={1}
        isVisible={visibleImages[7] !== false}
      >
        <Box 
          component="img" 
          src={images[6]} 
          alt="Vestimeteo 9" 
          loading="lazy"
        />
      </ImageItem>

      <ImageItem 
        ref={el => imageRefs.current[8] = el}
        top="70%"
        left="5800px" // Ajustado para tocar vértice con V9
        height="50vh"
        zIndex={0}
        isVisible={visibleImages[8] !== false}
      >
        <Box 
          component="img" 
          src={images[7]} 
          alt="Vestimeteo 5" 
          loading="lazy"
        />
      </ImageItem>

      {/* V7 al final de todo - ocupando todo el height */}
      <ImageItem 
        ref={el => imageRefs.current[9] = el}
        top="50%"
        left="6600px" // Ajustado
        width="700px"
        height="100vh"
        zIndex={2}
        isVisible={visibleImages[9] !== false}
      >
        <Box 
          component="img" 
          src={images[8]} 
          alt="Vestimeteo 7" 
          loading="lazy"
        />
      </ImageItem>
    </>
  );

  return (
    <>
      <GlobalStyle />
      
      {/* Loading screen with animated text and progress circle */}
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          <LoadingTitle ref={titleRef}>
            VESTIMETEO
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
      
      <GalleryContainer 
        ref={containerRef} 
        scrollPosition={scrollLeft}
        style={{ cursor: isMobile ? 'default' : 'grab' }}
      >
        <GalleryContent>
          {isMobile ? renderMobileView() : renderDesktopView()}
        </GalleryContent>
      </GalleryContainer>
    </>
  );
};

export default VestimeTeoGallery;
