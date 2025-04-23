import React, { useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// Custom cursor
const CustomCursor = styled(Box)({
  position: 'fixed',
  width: '15px',
  height: '15px',
  backgroundColor: 'rgb(255, 0, 0)',
  borderRadius: '2px',
  pointerEvents: 'none',
  transform: 'translate(-50%, -50%)',
  transition: 'transform 0.1s',
  willChange: 'transform',
  zIndex: 9999, // Aumentado para asegurar que siempre esté encima de todo
});

// Define points for the custom cursor
const Point = styled('div')({
  position: 'absolute',
  width: '4px',
  height: '4px',
  backgroundColor: 'black',
  borderRadius: '50%'
});

/**
 * Componente que maneja el cursor personalizado globalmente
 * Este componente debe montarse UNA SOLA VEZ en el nivel superior de la aplicación
 */
const CursorManager = ({ isOffCanvasOpen = false }) => {
  const cursorRef = useRef(null);
  
  // Efecto de cursor mejorado - más robusto
  useEffect(() => {
    // 1. Asegurar que el cursor esté visible al inicio
    if (cursorRef.current) {
      cursorRef.current.style.opacity = '1';
    }
    
    // 2. Manejar movimiento del cursor con throttling
    let lastTime = 0;
    const throttleTime = 10;
    
    const handleMouseMove = (e) => {
      const currentTime = Date.now();
      if (currentTime - lastTime < throttleTime) return;
      
      lastTime = currentTime;
      
      if (!cursorRef.current) return;
      
      const x = e.clientX;
      const y = e.clientY;
      const angle = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2) * (180 / Math.PI);
      
      // Actualizar posición del cursor
      cursorRef.current.style.left = `${x}px`;
      cursorRef.current.style.top = `${y}px`;
      cursorRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      
      // Asegurar que el cursor esté visible
      cursorRef.current.style.opacity = '1';
      cursorRef.current.style.display = 'block';
    };
    
    // 3. Manejar cuando el mouse sale de la ventana
    const handleMouseLeave = () => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
    };
    
    // 4. Manejar cuando el mouse entra a la ventana
    const handleMouseEnter = () => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '1';
      }
    };
    
    // 5. Detectar clics para efecto visual
    const handleMouseDown = () => {
      if (cursorRef.current) {
        // Pequeño efecto de escala al hacer clic
        cursorRef.current.style.transform = `${cursorRef.current.style.transform} scale(0.8)`;
      }
    };
    
    const handleMouseUp = () => {
      if (cursorRef.current) {
        // Restaurar escala normal
        cursorRef.current.style.transform = cursorRef.current.style.transform.replace(' scale(0.8)', '');
      }
    };
    
    // 6. Asegurarse de que el cursor permanece visible al cambiar entre páginas/componentes
    const handlePageVisibilityChange = () => {
      if (!document.hidden && cursorRef.current) {
        cursorRef.current.style.opacity = '1';
        cursorRef.current.style.display = 'block';
      }
    };
    
    // Agregar event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('visibilitychange', handlePageVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('visibilitychange', handlePageVisibilityChange);
    };
  }, []);
  
  // Efecto para ocultar/mostrar el cursor basado en props
  useEffect(() => {
    if (!cursorRef.current) return;
    
    if (isOffCanvasOpen) {
      cursorRef.current.style.opacity = '0';
    } else {
      cursorRef.current.style.opacity = '1';
    }
  }, [isOffCanvasOpen]);
  
  return (
    <CustomCursor id="global-custom-cursor" ref={cursorRef}>
      <Point id="point1" className="point" sx={{ top: 0, left: 0 }} />
      <Point id="point2" className="point" sx={{ top: 0, right: 0 }} />
      <Point id="point3" className="point" sx={{ bottom: 0, left: 0 }} />
      <Point id="point4" className="point" sx={{ bottom: 0, right: 0 }} />
    </CustomCursor>
  );
};

export default CursorManager;