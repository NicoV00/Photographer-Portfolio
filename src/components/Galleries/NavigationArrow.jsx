import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { gsap } from 'gsap';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

// Flecha de navegación mejorada con borde y hover efecto
const NavigationArrowButton = styled(IconButton)(({ theme, isVisible, isMobile }) => ({
  position: 'fixed',
  top: isMobile ? '15px' : '20px',
  left: isMobile ? '15px' : '20px',
  color: '#fae8e0', // Color rosa claro como el fondo de la imagen
  backgroundColor: isMobile ? 'rgba(26, 26, 26, 0.75)' : 'transparent', // Fondo oscuro en móvil para mejor visibilidad
  border: '1px solid #fae8e0',
  borderRadius: '2px',
  padding: isMobile ? '6px 10px' : '8px 12px', // Tamaño ajustado para móvil
  transition: 'all 0.3s ease',
  zIndex: 1000,
  opacity: isMobile ? 1 : (isVisible ? 1 : 0), // Siempre visible en móvil
  visibility: isMobile ? 'visible' : (isVisible ? 'visible' : 'hidden'), // Siempre visible en móvil
  transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
  boxShadow: isMobile ? '0 2px 4px rgba(0,0,0,0.2)' : 'none', // Sombra para destacar en móvil
  '&:hover': {
    backgroundColor: '#1a1a1a', // Fondo negro en hover
    color: '#fae8e0', // Flecha blanca en hover
    border: '1px solid #fae8e0', // Borde blanco en hover
  },
  '&:active': {
    backgroundColor: '#1a1a1a', // Para dispositivos táctiles
    color: '#fae8e0',
  },
  '& .MuiSvgIcon-root': {
    fontSize: isMobile ? '18px' : '20px', // Tamaño ajustado para móvil
    transform: 'translateX(-2px)', // Ajustar posición para compensar el cambio de icono
  }
}));

const NavigationArrow = ({ onBack, containerRef }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isVisible, setIsVisible] = useState(true);
  const [isScrollingForward, setIsScrollingForward] = useState(false);
  const lastScrollPosition = useRef(0);
  const scrollTimeout = useRef(null);
  
  // Controlar la visibilidad basada en la dirección del scroll (solo para desktop)
  useEffect(() => {
    // No aplicar lógica de visibilidad en móvil ya que siempre será visible
    if (isMobile || !containerRef?.current) return;
    
    const container = containerRef.current;
    
    // Inicialmente mostrar la flecha durante unos segundos y luego ocultarla
    setIsVisible(true);
    const initialTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
    
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
      clearTimeout(initialTimeout);
      clearTimeout(scrollTimeout.current);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [containerRef, isMobile]);

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

  return (
    <NavigationArrowButton 
      isVisible={isVisible}
      isMobile={isMobile}
      onClick={handleClick}
      aria-label="Back"
    >
      <ArrowBackIosNewIcon />
    </NavigationArrowButton>
  );
};

export default NavigationArrow;