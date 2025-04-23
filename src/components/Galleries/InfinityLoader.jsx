// InfinityLoader.jsx - Versión mejorada
import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

// Contenedor principal - Más grande para mejor visibilidad
const InfinityContainer = styled(Box)(({ theme }) => ({
  width: '140px',  // Aumentado de 100px
  height: '80px',  // Aumentado de 60px
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

// Componente para crear una barrita individual en el infinito
const InfinitySegment = styled(Box)(({ 
  active, 
  segmentColor, 
  rotate, 
  top, 
  left, 
  delay,
  glow = false
}) => ({
  position: 'absolute',
  width: '6px',       // Ligeramente más grande
  height: '14px',     // Ligeramente más grande
  borderRadius: '2px',
  backgroundColor: segmentColor,
  opacity: active ? 1 : 0.15,
  transform: `rotate(${rotate}deg)`,
  top: top,
  left: left,
  transition: 'opacity 0.3s ease',
  ...(active && glow && {
    boxShadow: `0 0 8px ${segmentColor}`,
  }),
}));

// Componentes de conexión entre los círculos
const ConnectorSegment = styled(Box)(({
  active,
  segmentColor
}) => ({
  position: 'absolute',
  backgroundColor: segmentColor,
  opacity: active ? 1 : 0.15,
  transition: 'opacity 0.3s ease',
  borderRadius: '2px',
  ...(active && {
    boxShadow: `0 0 5px ${segmentColor}88`,
  }),
}));

const InfinityLoader = ({ color = '#ffffff', progress = 0, size = 1 }) => {
  // Aplicar factor de escala basado en size
  const scale = size;
  
  // Generamos más barritas para un movimiento más fluido
  const segmentCount = 32; // Aumentado de 24
  const activeSegments = Math.ceil((progress / 100) * segmentCount) || 1;
  
  // Arreglos para almacenar los segmentos y conectores
  const segments = [];
  const connectors = [];
  
  // Tamaño ajustado de los círculos para que estén más cerca
  const circleRadius = 20 * scale;
  const centerDistance = 40 * scale; // Reducido para que estén más cerca
  
  // Centros de los círculos
  const leftCircleX = 40 * scale;
  const rightCircleX = leftCircleX + centerDistance;
  const circleY = 40 * scale;
  
  // Parte izquierda del infinito (primer círculo)
  for (let i = 0; i < segmentCount / 2; i++) {
    const angle = (i / (segmentCount / 2)) * 360;
    const radians = (angle * Math.PI) / 180;
    
    // Posición de la barrita
    const x = leftCircleX + circleRadius * Math.cos(radians);
    const y = circleY + circleRadius * Math.sin(radians);
    
    // Rotación para que las barritas sigan la forma del círculo
    const rotation = angle + 90;
    
    // Determinar si esta barrita debe estar activa según el progreso
    const isActive = i < activeSegments;
    
    // Efecto de brillo para barritas específicas para acentuar la forma
    const shouldGlow = angle % 90 === 0;
    
    segments.push({
      id: `left-${i}`,
      rotate: rotation,
      top: `${y}px`,
      left: `${x}px`,
      active: isActive,
      index: i,
      glow: shouldGlow
    });
  }
  
  // Parte derecha del infinito (segundo círculo)
  for (let i = 0; i < segmentCount / 2; i++) {
    const angle = (i / (segmentCount / 2)) * 360;
    const radians = (angle * Math.PI) / 180;
    
    // Posición de la barrita
    const x = rightCircleX + circleRadius * Math.cos(radians);
    const y = circleY + circleRadius * Math.sin(radians);
    
    // Rotación para que las barritas sigan la forma del círculo
    const rotation = angle + 90;
    
    // Determinar si esta barrita debe estar activa según el progreso
    const isActive = i + segmentCount / 2 < activeSegments;
    
    // Efecto de brillo para barritas específicas
    const shouldGlow = angle % 90 === 0;
    
    segments.push({
      id: `right-${i}`,
      rotate: rotation,
      top: `${y}px`,
      left: `${x}px`,
      active: isActive,
      index: i + segmentCount / 2,
      glow: shouldGlow
    });
  }
  
  // Añadir conectores entre los círculos - parte superior e inferior
  // Estos crean el efecto visual de "8" o infinito
  connectors.push({
    id: 'connector-top',
    top: `${circleY - 3 * scale}px`,
    left: `${leftCircleX + circleRadius * 0.7}px`,
    width: `${centerDistance - circleRadius * 1.4}px`,
    height: `${6 * scale}px`,
    active: progress >= 25,
    transform: 'rotate(-15deg)'
  });
  
  connectors.push({
    id: 'connector-bottom',
    top: `${circleY + 3 * scale}px`,
    left: `${leftCircleX + circleRadius * 0.7}px`,
    width: `${centerDistance - circleRadius * 1.4}px`,
    height: `${6 * scale}px`,
    active: progress >= 75,
    transform: 'rotate(15deg)'
  });
  
  // Ordenar los segmentos para una animación secuencial
  segments.sort((a, b) => a.index - b.index);
  
  return (
    <InfinityContainer sx={{ transform: `scale(${scale})` }}>
      {/* Conectores entre círculos */}
      {connectors.map((connector) => (
        <ConnectorSegment
          key={connector.id}
          segmentColor={color}
          active={connector.active}
          sx={{
            top: connector.top,
            left: connector.left,
            width: connector.width,
            height: connector.height,
            transform: connector.transform
          }}
        />
      ))}
      
      {/* Segmentos de los círculos */}
      {segments.map((segment) => (
        <InfinitySegment
          key={segment.id}
          segmentColor={color}
          rotate={segment.rotate}
          top={segment.top}
          left={segment.left}
          active={segment.active}
          glow={segment.glow}
        />
      ))}
    </InfinityContainer>
  );
};

export default InfinityLoader;
