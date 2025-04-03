import React, { useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PortfolioButton = ({ onClick, imageMeshRef }) => {
  const buttonCursorRef = useRef(null);
  const xCursorRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const isOverMeshRef = useRef(false);
  const isClickingRef = useRef(false);
  const canvasRef = useRef(null);
  
  // Create and manage cursors
  useEffect(() => {
    // Función para ocultar cualquier cursor personalizado en la página
    const hideAllCustomCursors = () => {
      // Ocultar todos los elementos con id que contenga 'cursor'
      document.querySelectorAll('[id*="cursor"]').forEach(el => {
        if (el.id !== 'portfolio-button-cursor' && el.id !== 'portfolio-x-cursor') {
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          el.style.display = 'none'; // Forzar ocultación
        }
      });
      
      // Ocultar elementos que podrían ser cursores (basado en sus estilos)
      document.querySelectorAll('div[style*="pointer-events: none"]').forEach(el => {
        if (el.id !== 'portfolio-button-cursor' && el.id !== 'portfolio-x-cursor') {
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          el.style.display = 'none'; // Forzar ocultación
        }
      });
      
      // Añadir estilos CSS directamente para ocultar cursores
      const style = document.createElement('style');
      style.id = 'hide-cursors-style';
      style.innerHTML = `
        body * {
          cursor: none !important;
        }
        
        /* Ocultar cursores personalizados que no sean nuestros */
        [id*="cursor"]:not(#portfolio-button-cursor):not(#portfolio-x-cursor) {
          visibility: hidden !important;
          opacity: 0 !important;
          display: none !important;
        }
      `;
      
      if (!document.getElementById('hide-cursors-style')) {
        document.head.appendChild(style);
      }
    };
    
    // Función para restaurar los cursores personalizados
    const restoreAllCustomCursors = () => {
      // Restaurar visibilidad de los cursores
      document.querySelectorAll('[id*="cursor"]').forEach(el => {
        if (el.id !== 'portfolio-button-cursor' && el.id !== 'portfolio-x-cursor') {
          el.style.visibility = '';
          el.style.opacity = '';
          el.style.display = ''; 
        }
      });
      
      // Restaurar elementos que podrían ser cursores
      document.querySelectorAll('div[style*="pointer-events: none"]').forEach(el => {
        if (el.id !== 'portfolio-button-cursor' && el.id !== 'portfolio-x-cursor') {
          el.style.visibility = '';
          el.style.opacity = '';
          el.style.display = '';
        }
      });
      
      // Eliminar estilos CSS
      const style = document.getElementById('hide-cursors-style');
      if (style) {
        style.remove();
      }
    };
    
    // Find canvas element
    canvasRef.current = document.querySelector('canvas');
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'none';
    }
    
    // Create portfolio button cursor con Z-INDEX EXTREMADAMENTE ALTO y efecto GLOW
    let buttonCursor = document.getElementById('portfolio-button-cursor');
    if (!buttonCursor) {
      buttonCursor = document.createElement('div');
      buttonCursor.id = 'portfolio-button-cursor';
      buttonCursor.style.position = 'fixed';
      buttonCursor.style.backgroundColor = 'transparent';
      buttonCursor.style.color = 'white';
      buttonCursor.style.padding = '12px 20px';
      buttonCursor.style.border = '1px solid white';
      buttonCursor.style.borderRadius = '0';
      buttonCursor.style.fontFamily = '"Space Grotesk", "Inter", sans-serif';
      buttonCursor.style.fontSize = '14px';
      buttonCursor.style.letterSpacing = '1px';
      buttonCursor.style.fontWeight = '400';
      buttonCursor.style.transform = 'translate(-50%, -50%)';
      buttonCursor.style.pointerEvents = 'none';
      buttonCursor.style.zIndex = '2147483647'; // El máximo valor posible de z-index
      buttonCursor.style.textTransform = 'lowercase';
      buttonCursor.style.opacity = '0';
      buttonCursor.style.transition = 'background-color 0.3s ease, color 0.3s ease, transform 0.15s ease, opacity 0.2s ease';
      
      // Añadir glow effect al borde del botón y al texto
      buttonCursor.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.7)';
      buttonCursor.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.8)';
      
      buttonCursor.textContent = 'enter portfolio';
      document.body.appendChild(buttonCursor);
    } else {
      // Actualizar z-index y glow si ya existe
      buttonCursor.style.zIndex = '2147483647';
      buttonCursor.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.7)';
      buttonCursor.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.8)';
    }
    buttonCursorRef.current = buttonCursor;
    
    // Create X cursor
    let xCursor = document.getElementById('portfolio-x-cursor');
    if (!xCursor) {
      xCursor = document.createElement('div');
      xCursor.id = 'portfolio-x-cursor';
      xCursor.style.position = 'fixed';
      xCursor.style.width = '30px';
      xCursor.style.height = '30px';
      xCursor.style.display = 'flex';
      xCursor.style.justifyContent = 'center';
      xCursor.style.alignItems = 'center';
      xCursor.style.fontSize = '24px';
      xCursor.style.fontWeight = 'bold';
      xCursor.style.fontFamily = 'monospace';
      xCursor.style.backgroundColor = 'black';
      xCursor.style.color = 'white';
      xCursor.style.border = '2px solid white';
      xCursor.style.borderRadius = '0';
      xCursor.style.transform = 'translate(-50%, -50%)';
      xCursor.style.pointerEvents = 'none';
      xCursor.style.zIndex = '2147483646'; // Justo por debajo del botón
      xCursor.textContent = '✖';
      xCursor.style.opacity = '0';
      xCursor.style.transition = 'transform 0.15s ease, opacity 0.2s ease';
      document.body.appendChild(xCursor);
    } else {
      // Actualizar z-index si ya existe
      xCursor.style.zIndex = '2147483646';
    }
    xCursorRef.current = xCursor;
    
    // Define event handlers
    const handleCanvasEnter = () => {
      if (xCursorRef.current && !isOverMeshRef.current) {
        xCursorRef.current.style.opacity = '1';
      }
    };
    
    const handleCanvasLeave = () => {
      if (buttonCursorRef.current) buttonCursorRef.current.style.opacity = '0';
      if (xCursorRef.current) xCursorRef.current.style.opacity = '0';
      
      // Restaurar cursores cuando salimos del canvas
      restoreAllCustomCursors();
    };
    
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      
      // Update cursor positions
      if (buttonCursorRef.current) {
        buttonCursorRef.current.style.left = `${x}px`;
        buttonCursorRef.current.style.top = `${y}px`;
      }
      
      if (xCursorRef.current) {
        xCursorRef.current.style.left = `${x}px`;
        xCursorRef.current.style.top = `${y}px`;
      }
      
      // Update mouse for raycasting
      mouseRef.current.x = (x / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(y / window.innerHeight) * 2 + 1;
    };
    
    const handleMouseDown = () => {
      isClickingRef.current = true;
      
      if (isOverMeshRef.current && buttonCursorRef.current) {
        buttonCursorRef.current.style.transform = 'translate(-50%, -50%) scale(0.95)';
        buttonCursorRef.current.style.backgroundColor = 'white';
        buttonCursorRef.current.style.color = 'black';
        // Invertir el glow para el estado pulsado
        buttonCursorRef.current.style.boxShadow = '0 0 8px rgba(0, 0, 0, 0.7)';
        buttonCursorRef.current.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.8)';
      } else if (xCursorRef.current) {
        xCursorRef.current.style.transform = 'translate(-50%, -50%) scale(0.9)';
      }
    };
    
    const handleMouseUp = () => {
      if (isClickingRef.current && isOverMeshRef.current && onClick) {
        onClick();
      }
      
      isClickingRef.current = false;
      
      if (buttonCursorRef.current) {
        buttonCursorRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
        buttonCursorRef.current.style.backgroundColor = 'transparent';
        buttonCursorRef.current.style.color = 'white';
        // Restaurar el glow original
        buttonCursorRef.current.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.7)';
        buttonCursorRef.current.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.8)';
      }
      
      if (xCursorRef.current) {
        xCursorRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };
    
    // Add event listeners
    if (canvasRef.current) {
      canvasRef.current.addEventListener('mouseenter', handleCanvasEnter);
      canvasRef.current.addEventListener('mouseleave', handleCanvasLeave);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup function
    return () => {
      // Restaurar cursores
      restoreAllCustomCursors();
      
      if (canvasRef.current) {
        canvasRef.current.style.cursor = '';
        canvasRef.current.removeEventListener('mouseenter', handleCanvasEnter);
        canvasRef.current.removeEventListener('mouseleave', handleCanvasLeave);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Only remove cursors if this is the last component using them
      const portfolioButtons = document.querySelectorAll('[data-portfolio-button]');
      if (portfolioButtons.length <= 1) {
        if (buttonCursorRef.current) buttonCursorRef.current.remove();
        if (xCursorRef.current) xCursorRef.current.remove();
      }
    };
  }, [onClick]);
  
  // Use useFrame to check intersections with the mesh
  useFrame(({ camera }) => {
    if (!imageMeshRef?.current) return;
    
    try {
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      // Realizar raycasting directamente con el mesh
      const intersects = raycasterRef.current.intersectObject(imageMeshRef.current);
      
      // Actualizar estado
      const wasOverMesh = isOverMeshRef.current;
      isOverMeshRef.current = intersects.length > 0;
      
      // Solo actualizar visibilidad de cursores si el estado cambió
      if (wasOverMesh !== isOverMeshRef.current) {
        if (isOverMeshRef.current) {
          // Mouse está sobre la imagen: mostrar SOLO "enter portfolio"
          if (buttonCursorRef.current) {
            buttonCursorRef.current.style.opacity = '1';
          }
          if (xCursorRef.current) {
            xCursorRef.current.style.opacity = '0';
          }
          
          // Buscar todos los cursores personalizados y ocultarlos
          document.querySelectorAll('[id*="cursor"]').forEach(el => {
            if (el.id !== 'portfolio-button-cursor' && el.id !== 'portfolio-x-cursor') {
              el.style.visibility = 'hidden';
              el.style.opacity = '0';
              el.style.display = 'none'; // Forzar ocultación
            }
          });
          
          // Ocultar elementos con estilos típicos de cursores personalizados
          document.querySelectorAll('div[style*="pointer-events: none"]').forEach(el => {
            if (el.id !== 'portfolio-button-cursor' && el.id !== 'portfolio-x-cursor') {
              el.style.visibility = 'hidden';
              el.style.opacity = '0';
              el.style.display = 'none'; // Forzar ocultación
            }
          });
          
          // Asegurarse de que el cursor del navegador esté completamente oculto
          document.body.style.cursor = 'none';
          if (canvasRef.current) {
            canvasRef.current.style.cursor = 'none';
          }
        } else {
          // Mouse ya no está sobre la imagen
          if (buttonCursorRef.current) {
            buttonCursorRef.current.style.opacity = '0';
          }
          
          // Restaurar cursores personalizados
          document.querySelectorAll('[id*="cursor"]').forEach(el => {
            if (el.id !== 'portfolio-button-cursor' && el.id !== 'portfolio-x-cursor') {
              el.style.visibility = '';
              el.style.opacity = '';
              el.style.display = '';
            }
          });
          
          // Restaurar elementos con estilos típicos de cursores
          document.querySelectorAll('div[style*="pointer-events: none"]').forEach(el => {
            if (el.id !== 'portfolio-button-cursor' && el.id !== 'portfolio-x-cursor') {
              el.style.visibility = '';
              el.style.opacity = '';
              el.style.display = '';
            }
          });
          
          // Verificar si estamos en el canvas para mostrar X
          if (xCursorRef.current && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const mouseX = (mouseRef.current.x * 0.5 + 0.5) * window.innerWidth;
            const mouseY = (mouseRef.current.y * -0.5 + 0.5) * window.innerHeight;
            
            if (
              mouseX >= rect.left && 
              mouseX <= rect.right && 
              mouseY >= rect.top && 
              mouseY <= rect.bottom
            ) {
              xCursorRef.current.style.opacity = '1';
            }
          }
        }
      }
    } catch (error) {
      console.log("Raycasting error (can be ignored):", error);
    }
  });
  
  return (
    <Html>
      <div data-portfolio-button style={{ display: 'none' }} />
    </Html>
  );
};

export default PortfolioButton;
