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

// Scroll progress bar
const ScrollProgressBar = styled(Box)(({ theme, progress = 0 }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  height: '3px',
  width: `${progress}%`,
  backgroundColor: '#000',
  zIndex: 100,
  transition: 'width 0.2s ease-out',
}));

// Separate components for ANA LIVNI and 2024
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

// Main container with horizontal scroll - Optimizado con will-change
const GalleryContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  width: '100vw',
  height: '100vh',
  position: 'relative',
  overflowX: 'auto',
  overflowY: 'hidden',
  willChange: 'scroll-position', // Optimización para scroll
  '-webkit-overflow-scrolling': 'touch', // Mejor scroll en iOS
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

// Content container - con width aumentado para acomodar el mayor espaciado
const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '7500px', // Aumentado desde 4500px para el mayor espaciado
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

// Image item - Optimizado con transformZ para aceleración por hardware
const ImageItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMobile' && prop !== 'top' && prop !== 'left' && prop !== 'isVisible'
})(({ theme, top, left, width, height, zIndex = 1, isMobile = false, isVisible = true }) => ({
  position: isMobile ? 'relative' : 'absolute',
  top: isMobile ? 'auto' : top,
  left: isMobile ? 'auto' : left,
  width: width,
  height: height,
  zIndex: zIndex,
  marginBottom: isMobile ? '40px' : '0', // Aumentado el espacio entre imágenes en móvil
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateZ(0)' : 'translateZ(0) scale(0.98)', // Pequeña animación de escala + aceleración hardware
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity', // Optimización para animaciones
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '2px',
    boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
    backfaceVisibility: 'hidden', // Reduce flickering en WebKit
  }
}));

// Función para throttle (limitar frecuencia de llamadas)
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

const AnaLivniGallery = ({ onBack }) => {
  // Estado para la pantalla de carga
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Referencias para los elementos de animación
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);

  const containerRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Estado para controlar la visibilidad de las imágenes
  const [visibleImages, setVisibleImages] = useState({});
  // Referencias para todas las imágenes
  const imageRefs = useRef([]);

  // Images for ANA LIVNI - Memoizado para prevenir re-creaciones
  const images = useMemo(() => ({
    L1: '/images/ANA/L1.jpg',
    L2: '/images/ANA/L3.png',
    L3: '/images/ANA/L2.png',
    L4: '/images/ANA/L4.jpg',
    L5: '/images/ANA/L5.jpg',
    L6: '/images/ANA/L6.jpg',
    L7: '/images/ANA/L7.jpg',
    L8: '/images/ANA/L8.jpg',
    L9: '/images/ANA/L9.jpg',
    L10: '/images/ANA/L10.jpg',
    L11: '/images/ANA/L11.jpg',
    L12: '/images/ANA/L12.jpg',
    L13: '/images/ANA/L13.jpg'
  }), []);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Efecto para animar el título y año en la pantalla de carga
  useEffect(() => {
    if (!loading) return;
    
    // Asegurarse de que las referencias existen
    if (titleRef.current && yearRef.current) {
      // Animación de entrada desde abajo
      gsap.to(titleRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        delay: 0.3, // Pequeño retraso para que sea más natural
      });
      
      gsap.to(yearRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        delay: 0.5, // El año aparece después del título
      });
    }
    
    // Limpieza de la animación al desmontar
    return () => {
      gsap.killTweensOf(titleRef.current);
      gsap.killTweensOf(yearRef.current);
    };
  }, [loading]);
  
  // Efecto para controlar la pantalla de carga con progreso
  useEffect(() => {
    let interval;
    
    // Simular carga progresiva
    if (loading) {
      interval = setInterval(() => {
        setLoadProgress(prev => {
          const next = prev + (Math.random() * 15);
          if (next >= 100) {
            clearInterval(interval);
            
            // Animación de salida hacia arriba cuando la carga está completa
            if (titleRef.current && yearRef.current && loadingScreenRef.current) {
              // Primero animamos los textos hacia arriba
              gsap.to([titleRef.current, yearRef.current], {
                y: -100,
                opacity: 0,
                duration: 0.8,
                ease: "power2.in",
                stagger: 0.1,
                onComplete: () => {
                  // Luego desvanecemos toda la pantalla de carga
                  gsap.to(loadingScreenRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    delay: 0.2,
                    onComplete: () => setLoading(false)
                  });
                }
              });
            } else {
              // Fallback si las referencias no están disponibles
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

  // Función para comprobar qué imágenes están visibles
  const checkVisibility = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerLeft = isMobile ? 0 : container.scrollLeft;
    const containerWidth = containerRect.width;
    
    // Margen para precarga (carga imágenes un poco antes de que sean visibles)
    const preloadMargin = containerWidth * 0.8;
    
    // Actualizar visibilidad de las imágenes
    const newVisibility = {};
    
    imageRefs.current.forEach((ref, index) => {
      if (ref && ref.current) {
        const imageRect = ref.current.getBoundingClientRect();
        const imageLeft = isMobile ? imageRect.top : imageRect.left;
        const imageWidth = isMobile ? imageRect.height : imageRect.width;
        
        // Para móvil: comprobar visibilidad vertical
        // Para desktop: comprobar visibilidad horizontal
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
      // Solo actualizar si hay cambios
      if (JSON.stringify(prev) !== JSON.stringify(newVisibility)) {
        return newVisibility;
      }
      return prev;
    });
  }, [isMobile]);

  // Configurar el scroll optimizado
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Desactivar comportamiento smooth nativo para evitar conflictos
    container.style.scrollBehavior = 'auto';

    // Manejador de eventos para la rueda del mouse (optimizado con throttle)
    const handleWheel = throttle((e) => {
      if (isMobile) return; // Solo aplicar en desktop
      
      e.preventDefault();
      
      // Si es un evento de la rueda vertical (deltaY) o horizontal (deltaX)
      // Usamos deltaY para la rueda normal del mouse y deltaX para gestos de mousepad
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      
      // Determinar la velocidad de desplazamiento
      const scrollSpeed = 1.5;
      
      // Calcular posición de destino
      const targetScrollLeft = container.scrollLeft + delta * scrollSpeed;
      
      // Animación suave con GSAP
      gsap.to(container, {
        scrollLeft: targetScrollLeft,
        duration: 0.4,
        ease: "power2.out",
        overwrite: true
      });
      
      // Actualizar estado para facilitar la detección de visibilidad
      setScrollLeft(targetScrollLeft);
    }, 16); // Limitar a aproximadamente 60fps

    // Agregar eventos
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    // Event listener para detectar cambios de scroll (tanto manuales como animados)
    const handleScroll = throttle(() => {
      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const progress = (currentScroll / maxScroll) * 100;
      
      setScrollProgress(progress);
      setScrollLeft(currentScroll);
      checkVisibility();
    }, 100); // Checking visibility no necesita ser tan frecuente
    
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Comprobar visibilidad inicial
    checkVisibility();
    
    // Observer de intersección para optimización adicional
    if ('IntersectionObserver' in window) {
      const options = {
        root: isMobile ? null : container,
        rootMargin: '200px', // Margen para precargar
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
      
      // Observar cada imagen
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
    
    // Limpieza para navegadores sin IntersectionObserver
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, checkVisibility]);

  // Mobile view rendering con lazy loading
  const renderMobileView = () => (
    <>
      {/* Main large image (L1) */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[0] !== false} // Asume visible hasta que se marque como no visible
      >
        <Box component="img" src={images.L1} alt="ANA LIVNI 1" loading="eager" />
      </ImageItem>

      {/* ANA and LIVNI text */}
      <Box 
        ref={el => imageRefs.current[1] = el}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '30px 0 40px', // Más espacio
          width: '100%',
          opacity: visibleImages[1] !== false ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }}
      >
        <Box component="img" src={images.L3} alt="LIVNI" sx={{ width: '120px' }} loading="eager" />
        <Box component="img" src={images.L2} alt="ANA" sx={{ width: '120px', marginBottom: '5px' }} loading="eager" />
      </Box>
      
      {/* Rest of images in order - con lazy loading */}
      {[images.L4, images.L5, images.L6, images.L7, images.L8, images.L9, 
        images.L10, images.L11, images.L12, images.L13].map((img, index) => (
        <ImageItem 
          key={`mobile-img-${index}`}
          ref={el => imageRefs.current[index + 2] = el}
          isMobile={true}
          width="100%"
          height="auto"
          isVisible={visibleImages[index + 2] !== false}
        >
          <Box 
            component="img" 
            src={img} 
            alt={`ANA LIVNI ${index + 4}`} 
            loading="lazy" 
          />
        </ImageItem>
      ))}
    </>
  );

  // Desktop view rendering con mayor espaciado entre imágenes y lazy loading
  const renderDesktopView = () => (
    <>
      {/* 1. Large image (L1) */}
      <ImageItem 
        ref={el => imageRefs.current[0] = el}
        top="50%"
        left="450px"
        height="85vh"
        zIndex={2}
        isVisible={visibleImages[0] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L1} alt="ANA LIVNI 1" loading="eager" />
      </ImageItem>
      
      {/* 2 & 3. "ANA" and "LIVNI" text */}
      <Box 
        ref={el => imageRefs.current[1] = el}
        sx={{ 
          position: 'absolute', 
          top: '85%', 
          left: '1300px', 
          transform: 'translateY(-50%)',
          zIndex: 2,
          width: '170px',
          display: 'flex',
          flexDirection: 'column',
          opacity: visibleImages[1] !== false ? 1 : 0,
          transition: 'opacity 0.5s ease',
          willChange: 'opacity'
        }}
      >
        <Box component="img" src={images.L2} alt="ANA" sx={{ width: '100%', marginBottom: '5px' }} loading="eager" />
        <Box component="img" src={images.L3} alt="LIVNI" sx={{ width: '100%' }} loading="eager" />
      </Box>
      
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        top="1%" 
        left="1500px" 
        height="55vh" 
        zIndex={2}
        isVisible={visibleImages[2] !== false}
      >
        <Box component="img" src={images.L4} alt="ANA LIVNI 4" loading="eager" />
      </ImageItem>
      
      {/* Aumentamos el espaciado horizontal entre imágenes */}
      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        top="44%" 
        left="1875px" 
        height="55vh" 
        zIndex={2}
        isVisible={visibleImages[3] !== false}
      >
        <Box component="img" src={images.L5} alt="ANA LIVNI 5" loading="eager" />
      </ImageItem>
      
      {/* Resto de imágenes centradas verticalmente con mayor espaciado */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top="50%" 
        left="2460px" // Aumentado el espaciado
        height="50vh" 
        zIndex={1}
        isVisible={visibleImages[4] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L6} alt="ANA LIVNI 6" loading="eager" />
      </ImageItem>
      
      {/* Imagen 7 ahora es estática - ya no tiene animación */}
      <ImageItem 
        ref={el => imageRefs.current[5] = el}
        top="50%" 
        left="3100px" 
        height="50vh" 
        zIndex={2}
        isVisible={visibleImages[5] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L7} alt="ANA LIVNI 7" loading="eager" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[6] = el}
        top="50%" 
        left="3750px" // Aumentado el espaciado
        height="100vh" 
        zIndex={1}
        isVisible={visibleImages[6] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L8} alt="ANA LIVNI 8" loading="eager" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        top="50%" 
        left="5650px" // Aumentado el espaciado
        height="55vh"
        zIndex={2}
        isVisible={visibleImages[7] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L9} alt="ANA LIVNI 9" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[8] = el}
        top="50%" 
        left="5250px" // Aumentado el espaciado
        height="55vh"
        zIndex={3}
        isVisible={visibleImages[8] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L10} alt="ANA LIVNI 10" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[9] = el}
        top="50%" 
        left="4850px" // Aumentado el espaciado
        height="55vh" 
        zIndex={2}
        isVisible={visibleImages[9] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L11} alt="ANA LIVNI 11" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[10] = el}
        top="40%" 
        left="6400px" // Aumentado el espaciado
        height="70vh" 
        zIndex={2}
        isVisible={visibleImages[10] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L12} alt="ANA LIVNI 12" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[11] = el}
        top="65%" 
        left="6800px" // Aumentado el espaciado
        height="70vh" 
        zIndex={1}
        isVisible={visibleImages[11] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L13} alt="ANA LIVNI 13" loading="lazy" />
      </ImageItem>
    </>
  );

  return (
    <>
      <GlobalStyle />
      
      {/* Pantalla de carga con texto animado y círculo de progreso */}
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          {/* Título "ANA LIVNI" con animación de entrada desde abajo */}
          <LoadingTitle ref={titleRef}>
            ANA LIVNI
          </LoadingTitle>
          
          {/* Año "2024" debajo con su propia animación */}
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
      
      {/* Barra de progreso del scroll */}
      {!loading && (
        <ScrollProgressBar progress={scrollProgress} />
      )}
      
      {/* Flecha de navegación que siempre es visible en móvil */}
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

export default AnaLivniGallery;