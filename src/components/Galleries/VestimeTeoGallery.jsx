'use client';

// Importaciones necesarias 
import React, { useState, useRef, useEffect } from 'react';
import { Box, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';
import NavigationArrow from './NavigationArrow';
import useSmoothScroll from './useSmoothScroll';
import { getGalleryColors } from '../utils/galleryColors';

// Obtener el tema de colores para esta galería
const galleryTheme = getGalleryColors('vestimeteo');

// FUENTES PERSONALIZADAS
// --------------------------------------
// Carga de la fuente Medium OTF para los textos de la galería
const GlobalStyle = styled('style')({
  '@font-face': {
    fontFamily: 'Medium OTF',
    src: 'url("/fonts/Medium.otf") format("opentype")',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  },
});

// PANTALLA DE CARGA
// --------------------------------------
// Pantalla de carga inicial 
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
  padding: '20px',
}));

// Barra de progreso de scroll - optimizada con aceleración GPU
const ScrollProgressBar = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  height: '3px',
  width: '0%',
  backgroundColor: galleryTheme.highlight,
  zIndex: 9999,
  transform: 'translateZ(0)',  // Forzar aceleración GPU
  willChange: 'width',
  boxShadow: '0 0 3px rgba(0,0,0,0.2)', // Sombra sutil para mejor visibilidad
});

// Componentes para VESTIMETEO y 2024 en pantalla de carga
const LoadingTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '45px',
  fontWeight: 'bold',
  color: galleryTheme.text,
  letterSpacing: '2px',
  position: 'relative',
  transform: 'translateY(100px)',
  opacity: 0,
  textAlign: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    fontSize: '32px',
    letterSpacing: '1.5px',
  },
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
  textAlign: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    fontSize: '28px',
    letterSpacing: '1.5px',
    marginTop: '5px',
    marginBottom: '30px',
  },
}));

// CONTENEDOR PRINCIPAL DE LA GALERÍA
// --------------------------------------
// Contenedor principal con degradado dinámico basado en scroll
// IMPORTANTE: Mismo comportamiento para móvil y desktop (scroll horizontal)
const GalleryContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'scrollPosition'
})(({ theme, scrollPosition = 0 }) => {
  // Valor de scroll donde comienza la transición (después de la tercera imagen)
  const scrollThreshold = 3500;
  // Cantidad de scroll necesaria para completar la transición
  const transitionLength = 800;
  // Progreso de la transición (0 a 1)
  const gradientProgress = Math.min(Math.max((scrollPosition - scrollThreshold) / transitionLength, 0), 1);
  
  // Color inicial y final para el degradado
  const initialColor = '#F1F2F2'; // Gris claro
  const finalColor = galleryTheme.main;   // Color principal del tema
  
  // Función para interpolar color - no modificar
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
    transform: 'translateZ(0)',  // Forzar aceleración GPU
    perspective: '1000px',       // Mejorar aceleración GPU
    backfaceVisibility: 'hidden', // Optimización GPU
    willChange: 'scroll-position',
    '-webkit-overflow-scrolling': 'touch',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    // IMPORTANTE: Móvil con el mismo comportamiento que desktop - scroll horizontal
    [theme.breakpoints.down('sm')]: {
      overflowX: 'auto',
      overflowY: 'hidden',
      height: '100vh',  // Mantener altura completa
      minHeight: '100vh',
    },
  };
});

// Contenido de la galería - mantener mismo ancho para mobile y desktop
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '7000px', // Ancho grande - IMPORTANTE: mantener suficiente espacio
  height: '100%',
  padding: '40px',
  paddingRight: '300px',
  position: 'relative',
  transform: 'translateZ(0)',  // Force GPU acceleration
  // Mobile con mismo ancho y comportamiento que desktop
  [theme.breakpoints.down('sm')]: {
    width: '7000px', // MISMO ancho que desktop para conservar espacios exactos
    flexDirection: 'row', // Mantener dirección de fila
    height: '100%', // Mantener altura
    padding: '40px 300px 40px 40px', // Mismo padding que desktop
  },
}));

// ELEMENTO DE IMAGEN - sin sombreados
// --------------------------------------
// Componente para cada imagen de la galería - optimizado para rendimiento
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => 
    prop !== 'isMobile' && 
    prop !== 'top' && 
    prop !== 'left' && 
    prop !== 'isVisible' &&
    prop !== 'isPhoto'
})(({ theme, top, left, width, height, zIndex = 1, isMobile = false, isVisible = true, isPhoto = true }) => ({
  position: 'absolute', // Posición absoluta para control preciso
  top: top,
  left: left,
  width: width,
  height: height,
  zIndex: zIndex,
  marginBottom: 0,
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(-50%) translateZ(0)' : 'translateY(-50%) translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden', // Optimización GPU
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: isPhoto ? 'cover' : 'contain',
    borderRadius: isPhoto ? '2px' : '0',
    boxShadow: 'none', // IMPORTANTE: Sin sombras como solicitado
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)', // Forzar aceleración GPU
  }
}));

const VestimeTeoGallery = ({ onBack }) => {
  // Loading state
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Refs for animation elements
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);
  const progressBarRef = useRef(null);
  
  const containerRef = useRef(null);

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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // LÓGICA DE VISIBILIDAD DE IMÁGENES
  // --------------------------------------
  // Determina qué imágenes están visibles en el viewport
  // Esto optimiza el rendimiento cargando solo lo necesario
  const checkVisibility = React.useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    
    // IMPORTANTE: Mayor margen de precarga para mejorar la experiencia visual
    // Carga las imágenes antes de que estén completamente visibles
    const preloadMargin = containerWidth * 1.2;
    
    const newVisibility = {};
    
    imageRefs.current.forEach((ref, index) => {
      if (ref && ref.current) {
        const imageRect = ref.current.getBoundingClientRect();
        
        // Verificación horizontal para ambos dispositivos
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
  
  // CONFIGURACIÓN DE SMOOTH SCROLL
  // --------------------------------------
  // Configuración del scroll suave - misma experiencia en móvil y desktop
  const { scrollLeft, scrollProgress } = useSmoothScroll({
    containerRef,
    isMobile,
    isLoading: loading,
    checkVisibility,
    horizontal: true, // IMPORTANTE: Mantener horizontal en todos los dispositivos
    duration: 2.5,           // Mayor duración para movimiento más suave
    wheelMultiplier: 1.2,     // Multiplicador aumentado para scroll más responsive
    touchMultiplier: 2,       // Multiplicador táctil aumentado para móvil
    lerp: 0.04,               // Lerp reducido para transiciones ultra suaves
    colors: galleryTheme
  });
  
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

  // Set up IntersectionObserver for visibility detection - siempre usando el container como root
  useEffect(() => {
    if (loading || !containerRef.current) return;

    checkVisibility();
    
    if ('IntersectionObserver' in window) {
      const options = {
        root: containerRef.current, // Siempre usar container como root para scroll horizontal
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

  // Vista para móvil y desktop - Secuencia: V1, V2, [V3, V4], V6, V8, [V9, V5], V7
  const renderGalleryContent = () => (
    <>
      {/* V1 - Primera imagen */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        top="50%"
        left={isMobile ? "450px" : "450px"} // Mismo espacio inicial que en desktop (450px)
        height={isMobile ? "60vh" : "70vh"}
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

      {/* V2 - Segunda imagen */}
      <ImageItem 
        ref={el => imageRefs.current[1] = el}
        top="50%"
        left={isMobile ? "1100px" : "1100px"} // Mismo espaciado que en desktop
        height={isMobile ? "60vh" : "70vh"}
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

      {/* V3 y V4 juntas - IMPORTANTE: Estas imágenes deben ir MUY juntas */}
      {/* porque forman una sola composición visual */}
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        top="50%"
        left={isMobile ? "2180px" : "1900px"} // Mismo espaciado que en desktop
        height={isMobile ? "85vh" : "100vh"}
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
        left={isMobile ? "2680px" : "2733px"} // Pegada a V3 (aún más cerca que antes)
        height={isMobile ? "85vh" : "100vh"}
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

      {/* V6 - Imagen después del par V3/V4 */}
      <ImageItem 
        ref={el => imageRefs.current[5] = el}
        top="50%"
        left={isMobile ? "3950px" : "3950px"} // Mismo valor que desktop
        height={isMobile ? "60vh" : "70vh"}
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
        left={isMobile ? "4650px" : "4650px"} // Mismo valor que desktop
        height={isMobile ? "60vh" : "70vh"}
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

      {/* V9 y V5 tocándose en los vértices - par importante */}
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        top={isMobile ? "30%" : "30%"} // Mismo valor que desktop
        left={isMobile ? "5470px" : "5470px"} // Mismo valor que desktop
        height={isMobile ? "50vh" : "50vh"} // Mismo valor que desktop
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
        top={isMobile ? "70%" : "70%"} // Mismo valor que desktop
        left={isMobile ? "5800px" : "5800px"} // Mismo valor que desktop
        height={isMobile ? "50vh" : "50vh"} // Mismo valor que desktop
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
        left={isMobile ? "6600px" : "6600px"} // Mismo valor que desktop
        width={isMobile ? "700px" : "700px"} // Mismo valor que desktop
        height={isMobile ? "100vh" : "100vh"} // Mismo valor que desktop
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
            size={70} 
            thickness={3}
            sx={{ 
              color: galleryTheme.text,
              marginTop: '10px',
            }}
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

export default VestimeTeoGallery;
