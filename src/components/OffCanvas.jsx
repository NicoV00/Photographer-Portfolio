import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Box, 
  Link,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';

// Importar la fuente Suisse Intl Medium
import { createGlobalStyle } from 'styled-components';

// Componente para importar la fuente globalmente
const GlobalFontStyle = createGlobalStyle`
  @font-face {
    font-family: 'Suisse Intl Medium';
    src: url('fonnts.com-Suisse_Intl_Medium.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
`;

// Import components
import SequentialGlitchText from './SequentialGlitchText';
import { 
  InfoButton, 
  OverlayBackdrop, 
  CloseButton 
} from './StyledComponents';

// Componente UruguayTime modificado con dos puntos parpadeantes
const UruguayTime = ({ fontFamily, fontSize }) => {
  const [time, setTime] = useState('');
  const [showColon, setShowColon] = useState(true);
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const uruguayTime = now.toLocaleTimeString('en-US', {
        timeZone: 'America/Montevideo',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setTime(uruguayTime);
    };

    // Actualizar tiempo cada segundo
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Parpadear los dos puntos cada 500ms
    const blinkInterval = setInterval(() => {
      setShowColon(prev => !prev);
    }, 500);

    return () => {
      clearInterval(timeInterval);
      clearInterval(blinkInterval);
    };
  }, []);

  const formatTimeWithBlinkingColons = (timeString) => {
    const parts = timeString.split(':');
    return (
      <Box component="span" sx={{ fontFamily, fontSize, fontWeight: '500' }}>
        {parts[0]}
        <Box component="span" sx={{ opacity: showColon ? 1 : 0.3, transition: 'opacity 0.1s ease' }}>
          :
        </Box>
        {parts[1]}
        <Box component="span" sx={{ opacity: showColon ? 1 : 0.3, transition: 'opacity 0.1s ease' }}>
          :
        </Box>
        {parts[2]} UYT
      </Box>
    );
  };

  return formatTimeWithBlinkingColons(time);
};

const OffCanvas = ({ name, onShowChange, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [open, setOpen] = useState(false);
  const [mouseInsideCanvas, setMouseInsideCanvas] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorCloseRef = useRef(null);
  
  // Estados para el cursor personalizado
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [cursorText, setCursorText] = useState('');

  const handleOpen = () => {
    setOpen(true);
    if (onShowChange) onShowChange(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (onShowChange) onShowChange(false);
    // Reset state for next opening
    setTimeout(() => setCanvasReady(false), 500);
  };

  const handleOverlayClick = (e) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target)) {
      handleClose();
    }
  };

  // GSAP effect for custom drawer animation
  useEffect(() => {
    if (!drawerRef.current) return;

    if (open) {
      // Important: set canvasReady to true immediately on desktop
      // to ensure title displays correctly
      if (!isMobile) {
        setCanvasReady(true);
      }
      
      gsap.to(drawerRef.current, { 
        x: 0, 
        duration: 0.5, 
        ease: 'power2.out',
        onComplete: () => {
          // On mobile, set canvasReady after animation
          if (isMobile) {
            setCanvasReady(true);
          }
        }
      });
      if (overlayRef.current) {
        gsap.to(overlayRef.current, { opacity: 1, visibility: 'visible', duration: 0.5 });
      }
    } else {
      gsap.to(drawerRef.current, { 
        x: '100%', 
        duration: 0.5, 
        ease: 'power2.in', 
        onComplete: () => {
          if (overlayRef.current) {
            gsap.set(overlayRef.current, { visibility: 'hidden' });
          }
        }
      });
      if (overlayRef.current) {
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.5 });
      }
    }
  }, [open, isMobile]);

  // Efecto para manejar el cursor personalizado
  useEffect(() => {
    if (isMobile || isTablet || !open) return;

    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e) => {
      const target = e.target;
      if (target.dataset.cursorText) {
        setCursorText(target.dataset.cursorText);
      } else if (target.closest('[data-cursor-hover]')) {
        const hoverElement = target.closest('[data-cursor-hover]');
        setCursorText(hoverElement.dataset.cursorHover || '');
      }
    };

    const handleMouseLeave = () => {
      setCursorText('');
    };

    // Add event listeners to all interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [data-cursor-hover], [data-cursor-text]'
    );

    interactiveElements.forEach((element) => {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    });

    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Esconder el cursor nativo
    if (drawerRef.current) {
      drawerRef.current.style.cursor = 'none';
      const elements = drawerRef.current.querySelectorAll('*');
      elements.forEach(element => {
        element.style.cursor = 'none';
      });
    }
    document.body.style.cursor = 'none';
    
    return () => {
      interactiveElements.forEach((element) => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      });
      
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'auto';
    };
  }, [isMobile, isTablet, open]);

  const handleMouseEnterCanvas = () => {
    setMouseInsideCanvas(true);
  };
  
  const handleMouseLeaveCanvas = () => {
    setMouseInsideCanvas(false);
  };
  
  const handleCursorClick = () => {
    if (!mouseInsideCanvas) handleClose();
  };
  
  // Calculate responsive dimensions
  const drawerWidth = isMobile ? '100%' : isTablet ? '90%' : '800px';
  
  // Estilo común para todos los textos que NO son "ENZO CIMILLO"
  const suisseTextStyle = {
    fontFamily: "'Suisse Intl Medium', sans-serif"
  };
  
  return (
    <>
      {/* Importar la fuente globalmente */}
      <GlobalFontStyle />
      
      <InfoButton
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{ 
          backgroundColor: isHovered ? 'white' : 'black',
          color: isHovered ? 'black' : 'white',
          boxShadow: isHovered ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
          fontFamily: "'Suisse Intl Medium', sans-serif" // Aplicar fuente al botón de info
        }}
      >
        i
      </InfoButton>

      {open && (
        <OverlayBackdrop 
          ref={overlayRef} 
          onClick={handleOverlayClick}
        >
          <Box 
            ref={drawerRef}
            onMouseEnter={handleMouseEnterCanvas}
            onMouseLeave={handleMouseLeaveCanvas}
            sx={{ 
              width: drawerWidth,
              height: '100%',
              bgcolor: 'black',
              color: 'white',
              padding: isMobile ? '14px 24px 14px 14px' : isTablet ? '18px 26px 18px 18px' : '22px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transform: 'translateX(100%)',
              overflowY: 'auto', // Allow scrolling on small screens
              overflowX: 'hidden',
              cursor: 'none', // Hide default cursor in the drawer
              '& *': { 
                cursor: 'none !important', // Force cursor:none on all child elements
                fontFamily: "'Suisse Intl Medium', sans-serif" // Aplicar fuente globalmente
              }
            }}
          >
            {/* Close button for mobile/tablet */}
            {(isMobile || isTablet) && (
              <CloseButton isMobile={isMobile} onClick={handleClose}>
                ✖
              </CloseButton>
            )}
            
            <Box sx={{ 
              position: 'relative', // Changed from absolute to relative for better mobile layout
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              pt: { xs: '12px', sm: '16px', md: '8px' }, // menos espacio arriba
              pb: { xs: '12px', sm: '12px', md: '12px' }, // mantengo bottom
              marginBottom: isMobile ? '2.5rem' : '0.5rem'
            }}>
              <Box
                component="img"
                src="/images/image3.png"
                alt="enzo cimillo"
                sx={{
                  // Ajustar tamaño según el dispositivo
                  width: { 
                    xs: '80%',   // Móvil
                    sm: '70%',   // Tablet
                    md: '100%'    // Desktop
                  },
                  maxWidth: '1050px',
                  
                  // Invertir colores de la imagen para que coincida con el tema oscuro
                  filter: 'invert(1)',
                  
                  // Asegurar que la imagen se carga con transición suave
                  opacity: canvasReady ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  
                  // Mantener proporciones de la imagen
                  objectFit: 'contain',
                }}
              />
            </Box>
            
            {/* Content sections with improved responsiveness - BAJADAS MÁS */}
            <Box sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              top: { md: '22rem' }, // CAMBIADO: de 18rem a 22rem para más separación
              left: '12px', 
              right: '12px', 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginBottom: { xs: '2.5rem', md: 0 } 
            }}>
              <Box sx={{ 
                width: { xs: '100%', sm: '12rem' },
                marginBottom: { xs: '1.2rem', sm: 0 },
                marginRight: { sm: '2.5rem' },
                paddingRight: { xs: '10px', sm: 0 }
              }}>
                <SequentialGlitchText 
                  text="(Based in Montevideo, Uruguay)" 
                  fontWeight="bold" 
                  fontSize={{ xs: '0.8rem', sm: '0.95rem' }}
                  initialGlitch={canvasReady}
                  style={suisseTextStyle}
                />
              </Box>
              <Box sx={{ 
                flex: 1,
                // Mejorar text wrapping para evitar cortes de palabras
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                wordBreak: 'keep-all' // CAMBIADO: mantener palabras completas
              }}>
                <SequentialGlitchText 
                  text="I'm a young photographer and videographer with a strong inclination towards fashion production."
                  fontSize={{ xs: '0.95rem', sm: '1.1rem' }}
                  lineHeight={{ xs: '1.25rem', sm: '1.35rem' }}
                  fontWeight="500"
                  style={{ 
                    ...suisseTextStyle, 
                    marginBottom: '1.2rem',
                    // Asegurar que las palabras no se corten
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}
                  initialGlitch={canvasReady}
                />
              </Box>
            </Box>
            
            <Box sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              top: { md: '30rem' }, // CAMBIADO: de 26rem a 30rem para más separación
              left: '12px', 
              right: '12px', 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginBottom: { xs: '2.5rem', md: 0 } 
            }}>
              <Box sx={{ 
                width: { xs: '100%', sm: '12rem' },
                marginBottom: { xs: '1.2rem', sm: 0 },
                marginRight: { sm: '2.5rem' }
              }}>
                <SequentialGlitchText 
                  text="(Capabilities)" 
                  fontWeight="bold" 
                  fontSize={{ xs: '0.8rem', sm: '0.95rem' }}
                  initialGlitch={canvasReady}
                  style={suisseTextStyle}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ marginBottom: '0.7rem' }}>
                  <SequentialGlitchText 
                    text="Editing"
                    fontSize={{ xs: '0.95rem', sm: '1.1rem' }}
                    lineHeight={{ xs: '1.25rem', sm: '1.45rem' }}
                    fontWeight="500"
                    initialGlitch={canvasReady}
                    style={suisseTextStyle}
                  />
                </Box>
                <Box sx={{ marginBottom: '0.7rem' }}>
                  <SequentialGlitchText 
                    text="Photography"
                    fontSize={{ xs: '0.95rem', sm: '1.1rem' }}
                    lineHeight={{ xs: '1.25rem', sm: '1.45rem' }}
                    fontWeight="500"
                    initialGlitch={canvasReady}
                    style={suisseTextStyle}
                  />
                </Box>
                <Box sx={{ marginBottom: '0.7rem' }}>
                  <SequentialGlitchText 
                    text="Videography"
                    fontSize={{ xs: '0.95rem', sm: '1.1rem' }}
                    lineHeight={{ xs: '1.25rem', sm: '1.45rem' }}
                    fontWeight="500"
                    initialGlitch={canvasReady}
                    style={suisseTextStyle}
                  />
                </Box>
                <Box sx={{ marginBottom: '0.7rem' }}>
                  <SequentialGlitchText 
                    text="Visual communication"
                    fontSize={{ xs: '0.95rem', sm: '1.1rem' }}
                    lineHeight={{ xs: '1.25rem', sm: '1.45rem' }}
                    fontWeight="500"
                    initialGlitch={canvasReady}
                    style={suisseTextStyle}
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              bottom: { md: '6rem' },
              left: '12px', 
              right: '12px', 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginBottom: { xs: '2.5rem', md: 0 },
              mt: { xs: '3rem', md: 0 }
            }}>
              <Box sx={{ 
                width: { xs: '100%', sm: '12rem' },
                marginBottom: { xs: '1.2rem', sm: 0 },
                marginRight: { sm: '2.5rem' }
              }}>
                <SequentialGlitchText 
                  text="(Contact)" 
                  fontWeight="bold" 
                  fontSize={{ xs: '0.8rem', sm: '0.95rem' }}
                  initialGlitch={canvasReady}
                  isNeonGreen={true}
                  style={suisseTextStyle}
                />
              </Box>
              <Box sx={{ 
                flex: 1,
                // Mejorar text wrapping
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                wordBreak: 'keep-all'
              }}>
                <SequentialGlitchText 
                  text="Available for commission and freelance work."
                  fontSize={{ xs: '0.95rem', sm: '1.1rem' }}
                  lineHeight={{ xs: '1.25rem', sm: '1.45rem' }}
                  fontWeight="500"
                  style={{ 
                    ...suisseTextStyle, 
                    marginBottom: '1.2rem',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}
                  initialGlitch={canvasReady}
                />
                <Box sx={{ 
                  display: 'flex', 
                  gap: '1.2rem',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexWrap: 'wrap'
                }}>
                  <Box position="relative" display="inline-block">
                    <Link 
                      href="mailto:cimillo.enzo@gmail.com" 
                      onMouseEnter={() => {
                        const el = document.getElementById('email-underline');
                        if (el) {
                          gsap.killTweensOf(el);
                          gsap.fromTo(el, 
                            { width: "0%", left: "0%", right: "auto" }, 
                            { width: "100%", duration: 0.35, ease: "power2.inOut" }
                          ).then(() => {
                            gsap.to(el, 
                              { left: "auto", right: "0%", width: "0%", duration: 0.35, delay: 0.1, ease: "power2.inOut" }
                            );
                          });
                        }
                      }}
                      sx={{ 
                        fontSize: { xs: '0.95rem', sm: '1.1rem' }, 
                        textDecoration: 'underline', 
                        color: '#00ff00', 
                        fontWeight: '500',
                        fontFamily: "'Suisse Intl Medium', sans-serif",
                        textShadow: '0 0 2px #00ff00, 0 0 4px #00ff00, 0 0 6px #00ff00',
                        transition: 'text-shadow 0.3s ease, color 0.3s ease',
                        '&:hover': {
                          color: '#00ff00',
                          textDecoration: 'none',
                          textShadow: '0 0 4px #00ff00, 0 0 8px #00ff00, 0 0 12px #00ff00, 0 0 16px #00ff00'
                        }
                      }}
                    >
                      email
                    </Link>
                    <Box
                      id="email-underline"
                      sx={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: 0,
                        height: '2px',
                        width: '0%',
                        backgroundColor: '#00ff00',
                        boxShadow: '0 0 4px #00ff00, 0 0 8px #00ff00',
                      }}
                    />
                  </Box>
                  
                  <Box position="relative" display="inline-block">
                    <Link 
                      href="https://www.instagram.com/enzocimillo" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onMouseEnter={() => {
                        const el = document.getElementById('instagram-underline');
                        if (el) {
                          gsap.killTweensOf(el);
                          gsap.fromTo(el, 
                            { width: "0%", left: "0%", right: "auto" }, 
                            { width: "100%", duration: 0.35, ease: "power2.inOut" }
                          ).then(() => {
                            gsap.to(el, 
                              { left: "auto", right: "0%", width: "0%", duration: 0.35, delay: 0.1, ease: "power2.inOut" }
                            );
                          });
                        }
                      }}
                      sx={{ 
                        fontSize: { xs: '0.95rem', sm: '1.1rem' }, 
                        textDecoration: 'underline', 
                        color: '#00ff00', 
                        fontWeight: '500',
                        fontFamily: "'Suisse Intl Medium', sans-serif",
                        textShadow: '0 0 2px #00ff00, 0 0 4px #00ff00, 0 0 6px #00ff00',
                        transition: 'text-shadow 0.3s ease, color 0.3s ease',
                        '&:hover': {
                          color: '#00ff00',
                          textDecoration: 'none',
                          textShadow: '0 0 4px #00ff00, 0 0 8px #00ff00, 0 0 12px #00ff00, 0 0 16px #00ff00'
                        }
                      }}
                    >
                      instagram
                    </Link>
                    <Box
                      id="instagram-underline"
                      sx={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: 0,
                        height: '2px',
                        width: '0%',
                        backgroundColor: '#00ff00',
                        boxShadow: '0 0 4px #00ff00, 0 0 8px #00ff00',
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              bottom: { md: '3rem' },
              left: '12px', 
              right: '12px', 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginTop: { xs: '1.2rem', md: 0 }
            }}>
              <Box sx={{ 
                width: { xs: '100%', sm: '12rem' },
                marginBottom: { xs: '0.7rem', sm: 0 },
                marginRight: { sm: '2.5rem' }
              }}>
                <SequentialGlitchText 
                  text="(Local time)" 
                  fontWeight="bold" 
                  fontSize={{ xs: '0.8rem', sm: '0.95rem' }}
                  initialGlitch={canvasReady}
                  style={suisseTextStyle}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                {/* Componente UruguayTime con dos puntos parpadeantes */}
                <UruguayTime 
                  fontFamily="'Suisse Intl Medium', sans-serif" 
                  fontSize={{ xs: '0.95rem', sm: '1.1rem' }} 
                />
              </Box>
            </Box>
          </Box>
        </OverlayBackdrop>
      )}
      
      {/* Custom cursors - solo para desktop */}
      {!isMobile && !isTablet && open && (
        <>
          {/* Cursor X - solo visible FUERA del canvas */}
          <Box
            ref={cursorCloseRef}
            onClick={handleCursorClick}
            sx={{
              position: 'fixed',
              width: '30px',
              height: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: "'Suisse Intl Medium', sans-serif",
              backgroundColor: 'black',
              color: 'white',
              border: '2px solid white',
              borderRadius: '0',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 10000,
              cursor: 'none',
              left: `${position.x}px`,
              top: `${position.y}px`,
              visibility: mouseInsideCanvas ? 'hidden' : 'visible',
            }}
          >
            ✖
          </Box>
          
          {/* Cursor circular - solo visible DENTRO del canvas */}
          <Box
            ref={cursorRef}
            className="cursor-dot bg-white mix-blend-difference"
            sx={{
              position: 'fixed',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'white',
              mixBlendMode: 'difference',
              pointerEvents: 'none',
              zIndex: 10000,
              transform: 'translate(-50%, -50%)',
              left: `${position.x}px`,
              top: `${position.y}px`,
              scale: mouseInsideCanvas ? (isClicking ? 0.8 : 2) : 0,
              transition: 'scale 0.3s ease',
              visibility: mouseInsideCanvas ? 'visible' : 'hidden',
            }}
          />
          
          {/* Texto del cursor cuando corresponda */}
          {cursorText && mouseInsideCanvas && (
            <Box
              sx={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y + 30}px`,
                transform: 'translate(-50%, -50%)',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: "'Suisse Intl Medium', sans-serif",
                pointerEvents: 'none',
                zIndex: 10001,
                padding: '2px 4px',
                opacity: 1,
                transition: 'opacity 0.3s ease',
              }}
            >
              {cursorText}
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default OffCanvas;
