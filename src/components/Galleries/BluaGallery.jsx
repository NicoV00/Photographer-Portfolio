import React, { useState, useRef, useEffect } from 'react';
import { Box, Modal, IconButton, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
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

// Separate components for BLUA and 2024
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

// Styled components using MUI styling system
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

const GalleryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '4800px', // Wide enough for horizontal content
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
  marginBottom: isMobile ? '40px' : '0', // Aumentado el espacio entre imágenes en móvil
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateZ(0)' : 'translateZ(0) scale(0.98)', // Pequeña animación de escala + aceleración hardware
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  willChange: 'transform, opacity', // Optimización para animaciones
  '& img': {
    width: '100%',
    height: isPhoto ? '100%' : 'auto',
    objectFit: isPhoto ? 'cover' : 'contain',
    borderRadius: isPhoto ? '2px' : '0',
    boxShadow: isPhoto ? '0 3px 8px rgba(0,0,0,0.25)' : 'none',
    backfaceVisibility: 'hidden', // Reduce flickering en WebKit
    cursor: isPhoto ? 'pointer' : 'default',
  }
}));

// Spotify Container with custom styling
const SpotifyContainer = styled(Box)(({ theme, top, left, width = '300px', zIndex = 1, isMobile = false, isVisible = true }) => ({
  position: isMobile ? 'relative' : 'absolute',
  top: isMobile ? 'auto' : top,
  left: isMobile ? 'auto' : left,
  width: isMobile ? '100%' : width,
  height: '80px',
  zIndex: zIndex,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: '12px',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateZ(0)' : 'translateZ(0) scale(0.98)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  marginBottom: isMobile ? '40px' : '0',
  '& iframe': {
    border: 'none',
    width: '100%',
    height: '80px',
    backgroundColor: 'transparent',
    borderRadius: '12px',
  }
}));

// Modal container for enlarged images
const ModalContainer = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxHeight: '80vh',
  maxWidth: '90vw',
  outline: 'none',
  '& img': {
    maxHeight: '80vh',
    maxWidth: '90vw',
    objectFit: 'contain',
    borderRadius: '1px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5)',
  },
});

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  right: '20px',
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
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

const BluaGallery = ({ onBack }) => {
  // Estado para la pantalla de carga
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Referencias para los elementos de animación
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const loadingScreenRef = useRef(null);
  
  // Ref para imagen con animación
  const animatedImageRef = useRef(null);
  const containerRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Estado para controlar la visibilidad de las imágenes
  const [visibleImages, setVisibleImages] = useState({});
  // Referencias para todas las imágenes
  const imageRefs = useRef([]);

  // State for modal
  const [selectedImage, setSelectedImage] = useState(null);

  // Images for the gallery - Updated order based on description
  const images = [
    '/images/blua/b4.jpg', // 1. Persona acostada sobre rocas con objeto metálico
    '/images/blua/b2.jpg', // 2. Primer plano del objeto metálico sobre arena
    '/images/blua/b3.jpg', // 3. Silueta en paisaje nevado con sol detrás
    '/images/blua/b1.jpg', // 4. Retrato de joven con suéter gris
    '/images/blua/b5.jpg', // 5. Figura en movimiento con luz azul neón
    '/images/blua/b6.jpg', // 6. Cuerpo cayendo en espacio azul oscuro
  ];
  
  // Phrase images - Updated to match description
  const phraseImages = [
    '/images/blua/f1.png', // "el cielo" - arriba de foto 3
    '/images/blua/f2.png', // "tu barco" - debajo de foto 4
    '/images/blua/f3.png', // "construcción" - arriba de foto 5
    '/images/blua/f4.png', // "no dejes que el tiempo te persiga" - parte inferior derecha, cerca de foto 6
  ];
  
  // Logo background image - will be inverted to be visible on white background
  const logoBackground = '/images/blua/f6.png';
  
  // Apply invert filter to logo for better visibility
  const LogoBackgroundImage = styled(Box)(({ theme }) => ({
    '& img': {
      filter: 'invert(1)', // Invierte los colores para que el logo sea negro
      width: '100%',
      height: 'auto',
      objectFit: 'contain',
    }
  }));

  // Spotify track data
  const spotifyTracks = [
    {
      id: '3VEQBNtshnnRnad8e0UhKV',
      embedUrl: 'https://open.spotify.com/embed/track/3VEQBNtshnnRnad8e0UhKV?utm_source=generator'
    },
    {
      id: '3BP4REyXj5TppWeyJWP1Nk',
      embedUrl: 'https://open.spotify.com/embed/track/3BP4REyXj5TppWeyJWP1Nk?utm_source=generator'
    }
  ];
  
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
  const checkVisibility = React.useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    
    // Margen para precarga (carga imágenes un poco antes de que sean visibles)
    const preloadMargin = containerWidth * 0.8;
    
    // Actualizar visibilidad de las imágenes
    const newVisibility = {};
    
    imageRefs.current.forEach((ref, index) => {
      if (ref && ref.current) {
        const imageRect = ref.current.getBoundingClientRect();
        
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

    // Agregar eventos
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousemove', handleMouseMove);
    
    // Event listener para detectar cambios de scroll (tanto manuales como animados)
    const handleScroll = throttle(() => {
      setScrollLeft(container.scrollLeft);
      checkVisibility();
    }, 150);
    
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
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('scroll', handleScroll);
      };
    }
    
    // Limpieza
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, checkVisibility]);

  // Configurar la animación de la imagen con efecto cuando se comienza a hacer scroll
  useEffect(() => {
    if (isMobile || !animatedImageRef.current || !containerRef.current || loading) return;

    // Posiciones inicial y final
    const originalLeft = 2850; // Adjusted position for the fifth photo (blue motion)
    const startLeft = 2650;

    // Configuración inicial
    gsap.set(animatedImageRef.current, {
      left: startLeft,
      opacity: 0.7,
      scale: 0.95
    });

    // Variable para rastrear si ya se ha activado la animación
    let animationTriggered = false;

    // Función que maneja el evento de scroll con throttle
    const handleScroll = throttle(() => {
      // Solo activar la animación cuando se hace scroll hasta cierto punto
      if (!animationTriggered && containerRef.current.scrollLeft > 1500) {
        animationTriggered = true;
        
        // Animar la imagen a su posición final con efectos adicionales
        gsap.to(animatedImageRef.current, {
          left: originalLeft,
          opacity: 1,
          scale: 1,
          duration: 1.5,
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

  // Handle image click to open modal
  const handleImageClick = (src) => {
    setSelectedImage(src);
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedImage(null);
  };

  // Mobile view rendering with lazy loading
  const renderMobileView = () => (
    <>
      {/* Background Logo for mobile - with inverted colors */}
      <LogoBackgroundImage
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto',
          marginTop: '20px',
          marginBottom: '-60px', // Negative margin to overlap with content
          opacity: 0.6,
          zIndex: 1,
        }}
      >
        <Box
          component="img"
          src={logoBackground}
          alt="BLUA Logo Background"
        />
      </LogoBackgroundImage>
      
      {/* 1. First photo - Person lying on rocks with metallic object */}
      <ImageItem 
        ref={el => imageRefs.current[1] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[1] !== false}
      >
        <Box 
          component="img" 
          src={images[0]} 
          alt="Persona acostada sobre rocas" 
          loading="eager"
          onClick={() => handleImageClick(images[0])}
        />
      </ImageItem>

      {/* 2. Second photo - Close-up of metallic object */}
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[2] !== false}
      >
        <Box 
          component="img" 
          src={images[1]} 
          alt="Primer plano objeto metálico" 
          loading="eager"
          onClick={() => handleImageClick(images[1])}
        />
      </ImageItem>

      {/* "el cielo" phrase */}
      <ImageItem 
        ref={el => imageRefs.current[3] = el}
        isMobile={true}
        width="90%"
        height="auto"
        isVisible={visibleImages[3] !== false}
        isPhoto={false}
      >
        <Box 
          component="img" 
          src={phraseImages[0]} 
          alt="el cielo" 
          loading="eager"
        />
      </ImageItem>

      {/* 3. Third photo - Silhouette in snowy landscape */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[4] !== false}
      >
        <Box 
          component="img" 
          src={images[2]} 
          alt="Silueta en paisaje nevado" 
          loading="lazy"
          onClick={() => handleImageClick(images[2])}
        />
      </ImageItem>

      {/* First Spotify embed - positioned in center-left */}
      <SpotifyContainer 
        ref={el => imageRefs.current[5] = el}
        isMobile={true}
        isVisible={visibleImages[5] !== false}
      >
        <Box 
          component="iframe" 
          src={spotifyTracks[0].embedUrl}
          width="100%"
          height="80px"
          frameBorder="0"
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </SpotifyContainer>

      {/* 4. Fourth photo - Portrait of young man with gray sweater */}
      <ImageItem 
        ref={el => imageRefs.current[6] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[6] !== false}
      >
        <Box 
          component="img" 
          src={images[3]} 
          alt="Retrato de joven con suéter gris" 
          loading="lazy"
          onClick={() => handleImageClick(images[3])}
        />
      </ImageItem>

      {/* "tu barco" phrase */}
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        isMobile={true}
        width="90%"
        height="auto"
        isVisible={visibleImages[7] !== false}
        isPhoto={false}
      >
        <Box 
          component="img" 
          src={phraseImages[1]} 
          alt="tu barco" 
          loading="lazy"
        />
      </ImageItem>

      {/* "construcción" phrase */}
      <ImageItem 
        ref={el => imageRefs.current[8] = el}
        isMobile={true}
        width="90%"
        height="auto"
        isVisible={visibleImages[8] !== false}
        isPhoto={false}
      >
        <Box 
          component="img" 
          src={phraseImages[2]} 
          alt="construcción" 
          loading="lazy"
        />
      </ImageItem>

      {/* 5. Fifth photo - Figure with blue neon light */}
      <ImageItem 
        ref={el => imageRefs.current[9] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[9] !== false}
      >
        <Box 
          component="img" 
          src={images[4]} 
          alt="Figura con luz azul neón" 
          loading="lazy"
          onClick={() => handleImageClick(images[4])}
        />
      </ImageItem>

      {/* Second Spotify embed (optional in mobile) */}
      <SpotifyContainer 
        ref={el => imageRefs.current[10] = el}
        isMobile={true}
        isVisible={visibleImages[10] !== false}
      >
        <Box 
          component="iframe" 
          src={spotifyTracks[1].embedUrl}
          width="100%"
          height="80px"
          frameBorder="0"
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </SpotifyContainer>

      {/* 6. Sixth photo - Body falling in blue space */}
      <ImageItem 
        ref={el => imageRefs.current[11] = el}
        isMobile={true}
        width="100%"
        height="auto"
        isVisible={visibleImages[11] !== false}
      >
        <Box 
          component="img" 
          src={images[5]} 
          alt="Cuerpo cayendo en espacio azul" 
          loading="lazy"
          onClick={() => handleImageClick(images[5])}
        />
      </ImageItem>

      {/* "no dejes que el tiempo te persiga" phrase */}
      <ImageItem 
        ref={el => imageRefs.current[12] = el}
        isMobile={true}
        width="90%"
        height="auto"
        isVisible={visibleImages[12] !== false}
        isPhoto={false}
      >
        <Box 
          component="img" 
          src={phraseImages[3]} 
          alt="no dejes que el tiempo te persiga" 
          loading="lazy"
        />
      </ImageItem>
    </>
  );

  // Desktop view rendering with absolute positioning and animations
  const renderDesktopView = () => (
    <>
      {/* Background Logo with inverted colors */}
      <LogoBackgroundImage
        sx={{
          position: 'absolute',
          top: '50%',
          left: '1800px', // Centered in the composition
          width: '800px',
          height: '90vh',
          opacity: 0.6,
          zIndex: 1,
          transform: 'translateY(-50%)'
        }}
      >
        <Box
          component="img"
          src={logoBackground}
          alt="BLUA Logo Background"
        />
      </LogoBackgroundImage>
      
      {/* 1. First photo - Person lying on rocks with metallic object - EXTREME LEFT */}
      <ImageItem 
        ref={el => imageRefs.current[1] = el}
        top="50%"
        left="250px"
        width="400px"
        height="540px"
        zIndex={2}
        isVisible={visibleImages[1] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box 
          component="img" 
          src={images[0]} 
          alt="Persona acostada sobre rocas" 
          loading="eager"
          onClick={() => handleImageClick(images[0])}
        />
      </ImageItem>

      {/* 2. Second photo - Close-up of metallic object - NEXT TO FIRST */}
      <ImageItem 
        ref={el => imageRefs.current[2] = el}
        top="50%"
        left="700px"
        width="360px"
        height="480px"
        zIndex={2}
        isVisible={visibleImages[2] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box 
          component="img" 
          src={images[1]} 
          alt="Primer plano objeto metálico" 
          loading="eager"
          onClick={() => handleImageClick(images[1])}
        />
      </ImageItem>

      {/* Music player - CENTER-LEFT */}
      <SpotifyContainer 
        ref={el => imageRefs.current[3] = el}
        top="50%"
        left="1150px"
        width="300px"
        zIndex={2}
        isVisible={visibleImages[3] !== false}
        sx={{ transform: 'translateY(-30%) translateZ(0)' }}
      >
        <Box 
          component="iframe" 
          src={spotifyTracks[0].embedUrl}
          width="100%"
          height="80px"
          frameBorder="0"
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </SpotifyContainer>

      {/* "el cielo" phrase - ABOVE THIRD PHOTO */}
      <ImageItem 
        ref={el => imageRefs.current[4] = el}
        top="25%"
        left="1550px"
        width="180px"
        height="auto"
        zIndex={3}
        isVisible={visibleImages[4] !== false}
        isPhoto={false}
      >
        <Box 
          component="img" 
          src={phraseImages[0]} 
          alt="el cielo" 
          loading="eager"
        />
      </ImageItem>

      {/* 3. Third photo - Silhouette in snowy landscape - CENTER */}
      <ImageItem 
        ref={el => imageRefs.current[5] = el}
        top="50%"
        left="1500px"
        width="380px"
        height="500px"
        zIndex={2}
        isVisible={visibleImages[5] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box 
          component="img" 
          src={images[2]} 
          alt="Silueta en paisaje nevado" 
          loading="lazy"
          onClick={() => handleImageClick(images[2])}
        />
      </ImageItem>

      {/* 4. Fourth photo - Portrait with gray sweater - CENTER-RIGHT */}
      <ImageItem 
        ref={el => imageRefs.current[6] = el}
        top="50%"
        left="2000px"
        width="360px"
        height="480px"
        zIndex={2}
        isVisible={visibleImages[6] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box 
          component="img" 
          src={images[3]} 
          alt="Retrato de joven con suéter gris" 
          loading="lazy"
          onClick={() => handleImageClick(images[3])}
        />
      </ImageItem>

      {/* "tu barco" phrase - BELOW FOURTH PHOTO */}
      <ImageItem 
        ref={el => imageRefs.current[7] = el}
        top="75%"
        left="2050px"
        width="180px"
        height="auto"
        zIndex={3}
        isVisible={visibleImages[7] !== false}
        isPhoto={false}
      >
        <Box 
          component="img" 
          src={phraseImages[1]} 
          alt="tu barco" 
          loading="lazy"
        />
      </ImageItem>

      {/* "construcción" phrase - ABOVE FIFTH PHOTO */}
      <ImageItem 
        ref={el => imageRefs.current[8] = el}
        top="25%"
        left="2700px"
        width="180px"
        height="auto"
        zIndex={3}
        isVisible={visibleImages[8] !== false}
        isPhoto={false}
      >
        <Box 
          component="img" 
          src={phraseImages[2]} 
          alt="construcción" 
          loading="lazy"
        />
      </ImageItem>

      {/* 5. Fifth photo - Figure with blue light - RIGHT, with animation */}
      <ImageItem 
        ref={animatedImageRef}
        top="50%"
        left="2850px"
        width="380px"
        height="500px"
        zIndex={3}
        isVisible={visibleImages[9] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box 
          component="img" 
          src={images[4]} 
          alt="Figura con luz azul neón" 
          loading="lazy"
          onClick={() => handleImageClick(images[4])}
        />
      </ImageItem>

      {/* 6. Sixth photo - Body falling in blue space - EXTREME RIGHT */}
      <ImageItem 
        ref={el => imageRefs.current[10] = el}
        top="50%"
        left="3350px"
        width="420px"
        height="560px"
        zIndex={2}
        isVisible={visibleImages[10] !== false}
        sx={{ transform: 'translateY(-50%) translateZ(0)' }}
      >
        <Box 
          component="img" 
          src={images[5]} 
          alt="Cuerpo cayendo en espacio azul" 
          loading="lazy"
          onClick={() => handleImageClick(images[5])}
        />
      </ImageItem>

      {/* "no dejes que el tiempo te persiga" - BOTTOM RIGHT near sixth photo */}
      <ImageItem 
        ref={el => imageRefs.current[11] = el}
        top="75%"
        left="3500px"
        width="180px"
        height="auto"
        zIndex={3}
        isVisible={visibleImages[11] !== false}
        isPhoto={false}
      >
        <Box 
          component="img" 
          src={phraseImages[3]} 
          alt="no dejes que el tiempo te persiga" 
          loading="lazy"
        />
      </ImageItem>
    </>
  );

  return (
    <>
      <GlobalStyle />
      
      {/* Pantalla de carga con texto animado y círculo de progreso */}
      {loading && (
        <LoadingScreen ref={loadingScreenRef}>
          {/* Título "BLUA" con animación de entrada desde abajo */}
          <LoadingTitle ref={titleRef}>
            BLUA
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
      
      {/* Flecha de navegación */}
      <NavigationArrow 
        onBack={onBack} 
        containerRef={containerRef} 
      />
      
      <GalleryContainer ref={containerRef}>
        <GalleryContent>
          {isMobile ? renderMobileView() : renderDesktopView()}
        </GalleryContent>
        
        {/* Modal for displaying enlarged images */}
        <Modal
          open={selectedImage !== null}
          onClose={handleClose}
          aria-labelledby="image-modal"
        >
          <ModalContainer>
            <Box
              component="img"
              src={selectedImage}
              alt="Selected"
            />
            <CloseButton onClick={handleClose} aria-label="Close">
              <CloseIcon />
            </CloseButton>
          </ModalContainer>
        </Modal>
      </GalleryContainer>
    </>
  );
};

export default BluaGallery;