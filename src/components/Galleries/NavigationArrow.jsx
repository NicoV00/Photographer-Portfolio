import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

// Flecha de navegación con colores adaptables a cada galería
const NavigationArrowButton = styled(IconButton, {
  shouldForwardProp: (prop) => !['isVisible', 'isMobile', 'colors'].includes(prop)
})(({ theme, isVisible, isMobile, colors = null }) => {
  // Colores por defecto en caso de que no se reciban colores del tema
  const defaultColors = {
    arrowColor: '#FFFFFF',      // Color blanco para la flecha
    borderColor: '#FFFFFF',     // Borde blanco
    hoverBgColor: '#1a1a1a',    // Fondo negro en hover
    hoverColor: '#FFFFFF'       // Color blanco en hover
  };
  
  // Si recibimos colores del tema, los usamos; si no, usamos los por defecto
  const {
    arrowColor = defaultColors.arrowColor,
    borderColor = defaultColors.borderColor,
    hoverBgColor = defaultColors.hoverBgColor,
    hoverColor = defaultColors.hoverColor
  } = colors || defaultColors;

  return {
    position: 'fixed',
    top: isMobile ? '15px' : '20px',
    left: isMobile ? '15px' : '20px',
    color: arrowColor,
    backgroundColor: isMobile ? 'rgba(26, 26, 26, 0.75)' : 'transparent',
    border: `1px solid ${borderColor}`,
    borderRadius: '2px',
    padding: isMobile ? '6px 10px' : '8px 12px',
    transition: 'all 0.3s ease',
    zIndex: 9999, // Aumentado para asegurar que esté siempre por encima de todo
    opacity: isMobile ? 1 : (isVisible ? 1 : 0),
    visibility: isMobile ? 'visible' : (isVisible ? 'visible' : 'hidden'),
    transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
    boxShadow: isMobile ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
    '&:hover': {
      backgroundColor: hoverBgColor,
      color: hoverColor,
      border: `1px solid ${hoverColor}`,
    },
    '&:active': {
      backgroundColor: hoverBgColor,
      color: hoverColor,
    },
    '& .MuiSvgIcon-root': {
      fontSize: isMobile ? '18px' : '20px',
      transform: 'translateX(-2px)',
    }
  };
});

const NavigationArrow = ({ onBack, containerRef, colors = null, isLoading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isVisible, setIsVisible] = useState(false); // Empieza oculto inicialmente
  const [isScrollingForward, setIsScrollingForward] = useState(false);
  const [isReady, setIsReady] = useState(false); // Nuevo estado para controlar si el componente está listo para mostrarse
  const lastScrollPosition = useRef(0);
  const scrollTimeout = useRef(null);
  const initialTimeout = useRef(null);
  
  // Procesamos los colores del tema si están disponibles
  const processedColors = React.useMemo(() => {
    if (!colors) return null;
    
    return {
      arrowColor: colors.text,          // Color del texto para la flecha
      borderColor: colors.text,         // Color del texto para el borde
      hoverBgColor: colors.main === '#1e1e1d' ? '#333333' : colors.main, // Fondo en hover
      hoverColor: colors.highlight      // Color del highlight para hover
    };
  }, [colors]);
  
  // Efecto para retrasar la aparición inicial después de que la carga se complete
  useEffect(() => {
    // Limpiamos cualquier timeout existente para evitar memory leaks
    if (initialTimeout.current) {
      clearTimeout(initialTimeout.current);
    }
    
    // Si la galería está cargando, mantenemos la flecha oculta y marcamos como no lista
    if (isLoading) {
      setIsReady(false);
      setIsVisible(false);
      return;
    }
    
    // Una vez que la carga termina, esperamos un poco antes de marcar como lista
    initialTimeout.current = setTimeout(() => {
      setIsReady(true); // Ahora el componente está listo para mostrarse
      
      // En móvil mostramos inmediatamente, en desktop esperamos un poco más
      if (isMobile) {
        setIsVisible(true);
      } else {
        // En desktop, mostramos la flecha durante unos segundos y luego ocultamos
        setIsVisible(true);
        
        // Después de mostrar por unos segundos, ocultamos (solo en desktop)
        scrollTimeout.current = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }
    }, 800); // Retraso para que la flecha aparezca después de que la animación de carga termine
    
    return () => {
      clearTimeout(initialTimeout.current);
      clearTimeout(scrollTimeout.current);
    };
  }, [isLoading, isMobile]);
  
  // Controlar la visibilidad basada en la dirección del scroll (solo para desktop)
  useEffect(() => {
    // Si la galería está cargando o el componente no está listo, no configuramos el scroll
    if (isLoading || !isReady || !containerRef?.current || isMobile) return;
    
    const container = containerRef.current;
    
    // Función throttle para limitar llamadas
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
    
    const handleScroll = throttle(() => {
      // Obtener la posición de scroll según dispositivo
      const currentScrollPosition = container.scrollLeft;
      
      // Determinar dirección de scroll
      const isGoingForward = currentScrollPosition > lastScrollPosition.current;
      
      // Actualizar el estado
      setIsScrollingForward(isGoingForward);
      
      // Lógica de visibilidad solo para desktop
      if (isGoingForward) {
        // Si está avanzando, ocultar la flecha
        setIsVisible(false);
      } else if (currentScrollPosition > 0) {
        // Si está retrocediendo y no está al inicio, mostrar la flecha
        setIsVisible(true);
      } else if (currentScrollPosition === 0) {
        // Si está en el principio, ocultar la flecha después de un tiempo
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }
      
      // Guardar posición actual para la próxima comparación
      lastScrollPosition.current = currentScrollPosition;
    }, 100); // Limitar a 10 actualizaciones por segundo
    
    // Agregar listener para scroll
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Limpieza
    return () => {
      clearTimeout(scrollTimeout.current);
      // Solo verificar si el container todavía existe para evitar el error
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [containerRef, isMobile, isLoading, isReady]);

  const handleClick = () => {
    // Al hacer clic, si hay una función onBack, la llamamos
    if (onBack) {
      onBack();
      return; // Si tenemos onBack, lo usamos y retornamos
    }
    
    // Si no hay onBack, hacemos scroll al inicio
    if (containerRef?.current) {
      const scrollTarget = isMobile 
        ? { scrollTop: 0 } // Para móvil: scroll vertical al inicio
        : { scrollLeft: 0 }; // Para desktop: scroll horizontal al inicio
      
      gsap.to(containerRef.current, {
        ...scrollTarget,
        duration: 0.8,
        ease: "power2.inOut"
      });
    }
  };

  // Si la galería está cargando o el componente no está listo, no renderizamos
  if (isLoading || !isReady) {
    return null;
  }

  return (
    <NavigationArrowButton 
      isVisible={isVisible}
      isMobile={isMobile}
      colors={processedColors}
      onClick={handleClick}
      aria-label="Back"
    >
      <ArrowBackIosNewIcon />
    </NavigationArrowButton>
  );
};

export default NavigationArrow;
