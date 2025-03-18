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
}));

const LoadingText = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '32px',
  fontWeight: 'bold',
  color: 'black',
  letterSpacing: '2px',
  marginBottom: '30px', // Espacio para el círculo abajo
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
  width: '4800px', // Aumentado desde 4500px para el mayor espaciado
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

  // Referencia para la imagen 7 que tendrá animación
  const image7Ref = useRef(null);
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
            // Dar un poco de tiempo para mostrar el 100% antes de cerrar
            setTimeout(() => setLoading(false), 300);
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
      setScrollLeft(container.scrollLeft);
      checkVisibility();
    }, 150); // Checking visibility no necesita ser tan frecuente
    
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

  // Configurar la animación de la imagen 7 solo cuando se comienza a hacer scroll
  useEffect(() => {
    if (isMobile || !image7Ref.current || !containerRef.current || loading) return;

    // Configuración inicial - posición más a la izquierda y completamente fuera de la imagen 8
    const originalLeft = 1950; // Posición final actualizada para coincidir con el nuevo espaciado
    const startLeft = 1700;    // Posición inicial más a la izquierda (fuera de la imagen 6)

    // Primero configuramos la posición inicial - sin cambio de opacidad
    gsap.set(image7Ref.current, {
      left: startLeft,
    });

    // Variable para rastrear si ya se ha activado la animación
    let animationTriggered = false;

    // Función que maneja el evento de scroll con throttle
    const handleScroll = throttle(() => {
      // Solo activar la animación la primera vez que se hace scroll
      if (!animationTriggered && containerRef.current.scrollLeft > 0) {
        animationTriggered = true;
        
        // Animar la imagen 7 a su posición final - solo movimiento
        gsap.to(image7Ref.current, {
          left: originalLeft,
          duration: 1.5, // Duración ligeramente mayor para mayor distancia
          ease: "power2.out"
        });
        
        // Eliminar el event listener después de que se activa
        containerRef.current.removeEventListener('scroll', handleScroll);
      }
    }, 50);

    // Agregar el event listener para el scroll
    containerRef.current.addEventListener('scroll', handleScroll, { passive: true });

    // Limpieza
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isMobile, loading]);

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
        left="80px"
        width="400px"
        height="650px"
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
          top: '75%', 
          left: '550px', 
          transform: 'translateY(-50%)',
          zIndex: 2,
          width: '120px',
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
        top="15%" 
        left="700px" 
        width="270px" 
        height="380px" 
        zIndex={2}
        isVisible={visibleImages[2] !== false}
      >
        <Box component="img" src={images.L4} alt="ANA LIVNI 4" loading="eager" />
      </ImageItem>
      
      {/* Aumentamos el espaciado horizontal entre imágenes */}
      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        top="50%" 
        left="970px" 
        width="270px" 
        height="380px" 
        zIndex={2}
        isVisible={visibleImages[3] !== false}
      >
        <Box component="img" src={images.L5} alt="ANA LIVNI 5" loading="eager" />
      </ImageItem>
      
      {/* Resto de imágenes centradas verticalmente con mayor espaciado */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top="50%" 
        left="1360px" // Aumentado el espaciado
        width="280px" 
        height="380px" 
        zIndex={1}
        isVisible={visibleImages[4] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L6} alt="ANA LIVNI 6" loading="eager" />
      </ImageItem>
      
      {/* Imagen 7 con animación activada por scroll - solo movimiento */}
      <ImageItem 
        ref={image7Ref}
        top="50%" 
        left="1950px" // Posición final aumentada para mayor separación
        width="430px" 
        height="380px" 
        zIndex={2}
        isVisible={visibleImages[5] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L7} alt="ANA LIVNI 7" loading="eager" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[6] = el}
        top="50%" 
        left="2250px" // Aumentado el espaciado
        width="450px" 
        height="790px" 
        zIndex={1}
        isVisible={visibleImages[6] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L8} alt="ANA LIVNI 8" loading="eager" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        top="50%" 
        left="2850px" // Aumentado el espaciado
        width="280px" 
        height="380px" 
        zIndex={2}
        isVisible={visibleImages[7] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L9} alt="ANA LIVNI 9" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[8] = el}
        top="50%" 
        left="3200px" // Aumentado el espaciado
        width="280px" 
        height="380px" 
        zIndex={3}
        isVisible={visibleImages[8] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L10} alt="ANA LIVNI 10" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[9] = el}
        top="50%" 
        left="3550px" // Aumentado el espaciado
        width="280px" 
        height="380px" 
        zIndex={2}
        isVisible={visibleImages[9] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L11} alt="ANA LIVNI 11" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[10] = el}
        top="25%" 
        left="3950px" // Aumentado el espaciado
        width="380px" 
        height="430px" 
        zIndex={2}
        isVisible={visibleImages[10] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box component="img" src={images.L12} alt="ANA LIVNI 12" loading="lazy" />
      </ImageItem>
      
      <ImageItem 
        ref={el => imageRefs.current[11] = el}
        top="65%" 
        left="4150px" // Aumentado el espaciado
        width="480px" 
        height="630px" 
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
      
      {/* Pantalla de carga con círculo de progreso */}
      {loading && (
        <LoadingScreen>
          <LoadingText>
            ANA LIVNI 2024
          </LoadingText>
          <CircularProgress 
            variant="determinate" 
            value={loadProgress} 
            size={60} 
            thickness={4}
            sx={{ color: 'black' }}
          />
        </LoadingScreen>
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