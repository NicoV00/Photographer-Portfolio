import React, { useEffect } from 'react';

/**
 * CursorManager simplificado - Asegura que el cursor del sistema esté visible
 */
const CursorManager = ({ isOffCanvasOpen = false }) => {
  // Asegurar que el cursor del sistema esté siempre visible (excepto cuando está el OffCanvas)
  useEffect(() => {
    if (!isOffCanvasOpen) {
      document.body.style.cursor = 'auto';
      
      // Remover cualquier estilo que oculte el cursor
      const style = document.createElement('style');
      style.innerHTML = `
        body, * {
          cursor: auto !important;
        }
      `;
      style.id = 'system-cursor-style';
      
      // Remover estilo anterior si existe
      const existingStyle = document.getElementById('system-cursor-style');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
      
      document.head.appendChild(style);

      return () => {
        const styleToRemove = document.getElementById('system-cursor-style');
        if (styleToRemove) {
          document.head.removeChild(styleToRemove);
        }
      };
    }
  }, [isOffCanvasOpen]);
  
  return null;
};

export default CursorManager;
