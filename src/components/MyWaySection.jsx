// src/components/MyWaySection.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box } from '@mui/material';

// Declaración de la fuente Helvetica-Bold
const fontFaceStyle = `
  @font-face {
    font-family: 'Helvetica-Bold';
    src: url('/fonts/Helvetica-Bold.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
`;

// Custom Scrollbar Component - Simplificado
const CustomScrollbar = () => {
  const scrollbarRef = useRef(null);
  const thumbRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ start: { y: 0, scroll: 0 } });

  const setScrollbar = useCallback(() => {
    if (!scrollbarRef.current || !thumbRef.current) return;

    const safeHeight = window.innerHeight;
    const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const maxScrollTop = documentHeight - safeHeight;
    
    if (maxScrollTop <= 0) return;
    
    const scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScrollTop));
    const scrollbarHeight = Math.max(20, (safeHeight / documentHeight) * safeHeight);
    const scrollbarTop = scrollProgress * (safeHeight - scrollbarHeight);

    scrollbarRef.current.style.setProperty('--scrollbar-height', `${scrollbarHeight}px`);
    scrollbarRef.current.style.setProperty('--scrollbar-top', `${scrollbarTop}px`);
  }, []);

  const onDragStart = useCallback((e) => {
    const clientY = e.clientY || e.touches[0].clientY;
    const safeHeight = window.innerHeight;
    const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const maxScrollTop = documentHeight - safeHeight;
    
    if (maxScrollTop <= 0) return;
    
    setIsDragging(true);
    dragRef.current.start.y = clientY;
    dragRef.current.start.scroll = Math.max(0, Math.min(1, window.scrollY / maxScrollTop));
    
    if (scrollbarRef.current) {
      scrollbarRef.current.classList.add('is-dragging');
    }
    e.preventDefault();
  }, []);

  const onDragMove = useCallback((e) => {
    if (!isDragging) return;

    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (!clientY) return;
    
    const safeHeight = window.innerHeight;
    const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const maxScrollTop = documentHeight - safeHeight;
    
    if (maxScrollTop <= 0) return;
    
    const dragDelta = clientY - dragRef.current.start.y;
    const dragProgress = dragDelta / safeHeight;
    const newScrollProgress = Math.max(0, Math.min(1, dragRef.current.start.scroll + dragProgress));
    const scrollMove = newScrollProgress * maxScrollTop;

    window.scrollTo(0, scrollMove);
    e.preventDefault();
  }, [isDragging]);

  const onDragEnd = useCallback((e) => {
    if (!isDragging) return;

    setIsDragging(false);
    if (scrollbarRef.current) {
      scrollbarRef.current.classList.remove('is-dragging');
    }
    e.preventDefault();
  }, [isDragging]);

  useEffect(() => {
    const handleScroll = () => setScrollbar();
    const handleResize = () => setScrollbar();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);

    setScrollbar();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      document.removeEventListener('touchmove', onDragMove);
      document.removeEventListener('touchend', onDragEnd);
    };
  }, [setScrollbar, onDragMove, onDragEnd]);

  return (
    <Box
      ref={scrollbarRef}
      className="site-scrollbar"
      sx={{
        '--border-width': '16px',
        '--scrollbar-height': '0px',
        '--scrollbar-top': '0px',
        
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 20,
        width: 'var(--border-width)',
        height: '100%',
        scale: '1 1',
        transition: 'scale 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'scale',
        
        '@media (max-width: 768px)': {
          '--border-width': '8px',
        },
        
        '&.is-dragging': {
          cursor: 'grabbing',
          '& .scrollbar-thumb': {
            cursor: 'grabbing',
            '&::after': {
              width: 'calc(var(--border-width) - 2px)',
              backgroundColor: '#fff',
            },
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          pointerEvents: 'none',
        }}
      />
      
      <Box
        ref={thumbRef}
        className="scrollbar-thumb"
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          zIndex: 3,
          width: 'calc(var(--border-width) * 0.5)',
          height: 'var(--scrollbar-height)',
          cursor: 'grab',
          transform: 'translateX(-50%) translateY(var(--scrollbar-top))',
          scale: '1 1',
          transition: 'scale 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.07s linear',
          willChange: 'opacity, scale, transform',
          
          '.is-transitioning &': {
            scale: '0 1',
          },
          
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 'calc(var(--border-width) * -1)',
            left: 'calc(50% - var(--border-width) * 0.5)',
            width: 'var(--border-width)',
            height: 'calc(100% + var(--border-width))',
          },
          
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 'var(--border-width)',
            bottom: 'var(--border-width)',
            left: '50%',
            width: '100%',
            height: 'auto',
            backgroundColor: '#000',
            borderRadius: 'inherit',
            transform: 'translateX(-50%)',
            transition: 'width 0.1s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'background, width',
          },
          
          '&:hover::after': {
            width: 'calc(var(--border-width) - 2px)',
          },
        }}
      />
    </Box>
  );
};

const MyWaySection = ({ onBack, onBackToGalleries }) => {
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef({ p: 0, sp: 0 });

  // Inyectar los estilos de fuente al montarse el componente
  useEffect(() => {
    if (!document.getElementById('helvetica-bold-font')) {
      const style = document.createElement('style');
      style.id = 'helvetica-bold-font';
      style.innerHTML = fontFaceStyle;
      document.head.appendChild(style);
    }
  }, []);

  // Optimizado: usar requestAnimationFrame directamente para mejor rendimiento
  useEffect(() => {
    let animationFrameId = null;
    
    const tick = () => {
      const scroll = scrollRef.current;
      scroll.sp += (scroll.p - scroll.sp) * 0.1;
      setScrollProgress(scroll.sp);
      animationFrameId = requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;
      
      const start = rect.top + scrollY;
      const end = start + sectionHeight + windowHeight;
      const trigger = scrollY + windowHeight;

      if (trigger < start) {
        scrollRef.current.p = 0;
      } else if (trigger > end) {
        scrollRef.current.p = 1;
      } else {
        scrollRef.current.p = (trigger - start) / (end - start);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    handleScroll(); // Initial calculation
    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <>
      <CustomScrollbar />
      
      <Box
        ref={sectionRef}
        sx={{
          '--padding': '25rem', // REDUCIDO para ver las letras antes
          '--scroll-progress': scrollProgress,
          '--distortion': 50,

          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 3,
          padding: 'calc(var(--padding) * 0.3) 0 calc(var(--padding) * 0.8)', // REDUCIDO
          minHeight: '120vh', // REDUCIDO de 200vh a 120vh
          background: '#f5f5f5',

          '@media (max-width: 768px)': {
            '--padding': '6rem', // Reducido AUN MAS para móvil (de 8rem a 6rem)
            minHeight: '90vh', // Reducido para scroll más corto
            padding: 'calc(var(--padding) * 0.15) 0 calc(var(--padding) * 0.4)', // Menos espacio arriba y abajo
          }
        }}
      >
        {/* EL TEXTO PRINCIPAL CON MATRIX3D */}
        <Box
          sx={{
            '--amplitude': '50%',
            '--offset': '15%',
            position: 'absolute',
            bottom: 0,
            left: 0,
            zIndex: 2,
            width: '100%',
            height: 'calc(var(--padding) * 1.05 + 5rem)',
            perspective: 'calc(var(--distortion) * 0.85em)',
            userSelect: 'none',
            fontFamily: 'Helvetica-Bold, Helvetica, Arial, sans-serif',
            fontWeight: 700,
            fontSize: 'calc(var(--padding) * 1.2)',
            lineHeight: 0.82,
            textAlign: 'center',
            textTransform: 'none', // Sin transformación
            whiteSpace: 'nowrap',

            '@media (max-width: 768px)': {
              '--amplitude': '75%',
              '--offset': '27.5%',
              perspective: 'calc(var(--distortion) * 1.05em)',
              fontSize: 'calc(var(--padding) * 0.9)',
            }
          }}
        >
          {/* Distorted wrapper */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: 'calc(var(--padding) * 1.5)',
              overflow: 'hidden',
              perspective: 'calc(var(--distortion) * 0.7em)',

              '@media (max-width: 768px)': {
                perspective: 'calc(var(--distortion) * 0.85em)',
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: '-100%',
                width: '300%',
                height: 'calc(var(--padding) * 1.05 + 5rem)',
                transformOrigin: '50% 100%',
                transform: `matrix3d(
                  1,
                  0,
                  0,
                  0,
                  0,
                  1,
                  var(--distortion),
                  0,
                  0,
                  0,
                  1,
                  0,
                  0,
                  0,
                  0,
                  1
                )`,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  willChange: 'transform',
                  color: '#000',
                  transform: `translate3d(
                    0,
                    calc(var(--scroll-progress) * var(--amplitude) - var(--offset)),
                    0
                  )`,
                }}
              >
                Project <br />
                under <br />
                creation <br />
                <Box component="span" sx={{ color: '#ff0000', fontSize: '1.2em' }}>
                  
                  404
                </Box>
                
                {/* Botón volver a galerías */}
                <Box
                  sx={{
                    marginTop: '6rem',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    component="button"
                    onClick={onBackToGalleries}
                    sx={{
                      padding: '12px 24px',
                      backgroundColor: '#000',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      fontFamily: 'Helvetica-Bold, Helvetica, Arial, sans-serif',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#333',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    ← volver a las galerías
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Normal wrapper */}
          <Box
            sx={{
              position: 'absolute',
              top: 'calc(100% - 1px)',
              left: 0,
              width: '100%',
              height: 'calc(100% + 100vh)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '300%',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  willChange: 'transform',
                  color: '#000',
                  transform: `translate3d(
                    0,
                    calc(
                      var(--scroll-progress) * var(--amplitude) - 100% - var(--offset)
                    ),
                    0
                  )`,
                }}
              >
                project <br />
                under <br />
                creation <br />
                <Box component="span" sx={{ color: '#ff0000', fontSize: '1.2em' }}>
                  404
                </Box>
                
                {/* Botón duplicado para el wrapper normal */}
                <Box
                  sx={{
                    marginTop: '6rem',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    component="button"
                    onClick={onBackToGalleries}
                    sx={{
                      padding: '12px 24px',
                      backgroundColor: '#000',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      fontFamily: 'Helvetica-Bold, Helvetica, Arial, sans-serif',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#333',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    ← volver a las galerías
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Botón volver arriba (fijo) */}
        <button 
          onClick={onBack}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            padding: '12px 24px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease',
            fontFamily: 'Helvetica-Bold, Helvetica, Arial, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#333';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#000';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← volver al carrusel
        </button>
      </Box>
    </>
  );
};

export default MyWaySection;
