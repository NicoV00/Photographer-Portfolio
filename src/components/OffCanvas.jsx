import { useState, useEffect, useRef, useCallback, memo } from 'react';
// OPTIMIZACIÓN 1: Lazy load de GSAP
let gsap = null;
const loadGSAP = async () => {
  if (!gsap) {
    const module = await import('gsap');
    gsap = module.gsap;
  }
  return gsap;
};

import { 
  Box, 
  Link,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';

// Import components
import SequentialGlitchText from './SequentialGlitchText';
import { 
  InfoButton, 
  OverlayBackdrop, 
  CloseButton 
} from './StyledComponents';

// Declaración de la fuente Suisse Intl Mono
const fontFaceStyle = `
  @font-face {
    font-family: 'Suisse Intl Mono';
    src: url('/fonts.com-Suisse_Intl_Mono.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
`;

// OPTIMIZACIÓN 2: Memoizar el componente de tiempo para evitar re-renders del padre
const UruguayTime = memo(({ fontSize }) => {
  const [time, setTime] = useState('');
  const [showColon, setShowColon] = useState(true);
  
  useEffect(() => {
    // Inyectar los estilos de fuente si no están ya presentes
    if (!document.getElementById('suisse-intl-mono-font')) {
      const style = document.createElement('style');
      style.id = 'suisse-intl-mono-font';
      style.innerHTML = fontFaceStyle;
      document.head.appendChild(style);
    }

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

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

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
      <Box component="span" sx={{ 
        fontFamily: "'Suisse Intl Mono', monospace", 
        fontSize, 
        fontWeight: '400',
        letterSpacing: '0.02em'
      }}>
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
});

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
  
  const handleOpen = useCallback(() => {
    setOpen(true);
    if (onShowChange) onShowChange(true);
  }, [onShowChange]);

  const handleClose = useCallback(() => {
    setOpen(false);
    if (onShowChange) onShowChange(false);
    setTimeout(() => setCanvasReady(false), 500);
  }, [onShowChange]);

  const handleOverlayClick = useCallback((e) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target)) {
      handleClose();
    }
  }, [handleClose]);

  // OPTIMIZACIÓN 4: GSAP effect con lazy loading
  useEffect(() => {
    if (!drawerRef.current) return;

    const animateDrawer = async () => {
      const gsapLib = await loadGSAP();
      
      if (open) {
        if (!isMobile) {
          setCanvasReady(true);
        }
        
        gsapLib.to(drawerRef.current, { 
          x: 0, 
          duration: 0.5, 
          ease: 'power2.out',
          onComplete: () => {
            if (isMobile) {
              setCanvasReady(true);
            }
          }
        });
        if (overlayRef.current) {
          gsapLib.to(overlayRef.current, { opacity: 1, visibility: 'visible', duration: 0.5 });
        }
      } else {
        gsapLib.to(drawerRef.current, { 
          x: '100%', 
          duration: 0.5, 
          ease: 'power2.in', 
          onComplete: () => {
            if (overlayRef.current) {
              gsapLib.set(overlayRef.current, { visibility: 'hidden' });
            }
          }
        });
        if (overlayRef.current) {
          gsapLib.to(overlayRef.current, { opacity: 0, duration: 0.5 });
        }
      }
    };

    animateDrawer();
  }, [open, isMobile]);

  // OPTIMIZACIÓN 5: Throttle del cursor movement
  const throttledUpdatePosition = useCallback(() => {
    let rafId = null;
    let lastX = 0;
    let lastY = 0;

    return (e) => {
      lastX = e.clientX;
      lastY = e.clientY;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          setPosition({ x: lastX, y: lastY });
          rafId = null;
        });
      }
    };
  }, []);

  useEffect(() => {
    if (isMobile || isTablet || !open) return;

    const updatePositionThrottled = throttledUpdatePosition();

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

    // Usar event delegation en lugar de agregar listeners a cada elemento
    const container = drawerRef.current;
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter, true);
      container.addEventListener('mouseleave', handleMouseLeave, true);
    }

    document.addEventListener('mousemove', updatePositionThrottled);
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
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter, true);
        container.removeEventListener('mouseleave', handleMouseLeave, true);
      }
      
      document.removeEventListener('mousemove', updatePositionThrottled);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'auto';
    };
  }, [isMobile, isTablet, open, throttledUpdatePosition]);

  const handleMouseEnterCanvas = useCallback(() => {
    setMouseInsideCanvas(true);
  }, []);
  
  const handleMouseLeaveCanvas = useCallback(() => {
    setMouseInsideCanvas(false);
  }, []);
  
  const handleCursorClick = useCallback(() => {
    if (!mouseInsideCanvas) handleClose();
  }, [mouseInsideCanvas, handleClose]);
  
  const drawerWidth = isMobile ? '100%' : isTablet ? '90%' : '800px';
  
  const helveticaTextStyle = {
    fontFamily: 'Helvetica-Regular, Helvetica, Arial, sans-serif'
  };
  
  // OPTIMIZACIÓN 6: Lazy load de links con GSAP
  const handleLinkHover = useCallback(async (underlineId) => {
    const el = document.getElementById(underlineId);
    if (el) {
      const gsapLib = await loadGSAP();
      gsapLib.killTweensOf(el);
      gsapLib.fromTo(el, 
        { width: "0%", left: "0%", right: "auto" }, 
        { width: "100%", duration: 0.35, ease: "power2.inOut" }
      ).then(() => {
        gsapLib.to(el, 
          { left: "auto", right: "0%", width: "0%", duration: 0.35, delay: 0.1, ease: "power2.inOut" }
        );
      });
    }
  }, []);
  
  return (
    <>
      <InfoButton
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{ 
          backgroundColor: isHovered ? 'white' : 'black',
          color: isHovered ? 'black' : 'white',
          boxShadow: isHovered ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
          fontFamily: 'Helvetica-Regular, Helvetica, Arial, sans-serif'
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
              overflowY: 'auto',
              overflowX: 'hidden',
              cursor: 'none',
              '& *': { 
                cursor: 'none !important',
                fontFamily: 'Helvetica-Regular, Helvetica, Arial, sans-serif'
              }
            }}
          >
            {/* Close button for mobile/tablet */}
            {(isMobile || isTablet) && (
              <CloseButton isMobile={isMobile} onClick={handleClose}>
                ✖
              </CloseButton>
            )}
            
            {/* TÍTULO ENZO CIMILLO - Alineado con el resto del contenido */}
            <Box sx={{ 
              position: 'relative',
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'flex-start',
              pt: { xs: '20px', sm: '24px', md: '10px' },
              pb: { xs: '20px', sm: '24px', md: '28px' },
              px: '20px', // MISMO MARGEN QUE EL RESTO: 20px
              marginBottom: isMobile ? '2.5rem' : '1.5rem'
            }}>
              <Typography
                sx={{
                  fontFamily: 'Helvetica-Bold, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: { 
                    xs: '3.5rem',
                    sm: '5rem',
                    md: '8.1rem'
                  },
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: '0.9',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  opacity: canvasReady ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                }}
              >
                enzo cimillo
              </Typography>
            </Box>
            
            {/* Content sections - TODOS CON MARGEN 20px */}
            <Box sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              top: { md: '25rem' },
              left: '20px', // MARGEN CONSISTENTE: 20px
              right: '20px', // MARGEN CONSISTENTE: 20px
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginBottom: { xs: '2rem', md: 0 }
            }}>
              <Box sx={{ 
                width: { xs: '100%', sm: '12rem' },
                marginBottom: { xs: '1.2rem', sm: 0 },
                marginRight: { sm: '2.5rem' },
                paddingRight: { xs: '10px', sm: 0 }
              }}>
                <SequentialGlitchText 
                  text="(Based in Montevideo,  Uruguay)" 
                  fontWeight="bold" 
                  fontSize={{ xs: '0.8rem', sm: '0.95rem' }}
                  initialGlitch={canvasReady}
                  style={helveticaTextStyle}
                />
              </Box>
              <Box sx={{ 
                flex: 1,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                wordBreak: 'keep-all'
              }}>
                <SequentialGlitchText 
                  text="I'm a young photographer and videographer with a strong inclination towards fashion productions."
                  fontSize={{ xs: '0.95rem', sm: '1.1rem' }}
                  lineHeight={{ xs: '1.25rem', sm: '1.35rem' }}
                  fontWeight="500"
                  style={{ 
                    ...helveticaTextStyle, 
                    marginBottom: '1.2rem',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'manual',
                    wordBreak: 'normal'
                  }}
                  initialGlitch={canvasReady}
                />
              </Box>
            </Box>
            
            {/* Capabilities section - MARGEN 20px */}
            <Box sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              top: { md: '34rem' },
              left: '20px', // MARGEN CONSISTENTE: 20px
              right: '20px', // MARGEN CONSISTENTE: 20px
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginBottom: { xs: '2rem', md: 0 }
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
                  style={helveticaTextStyle}
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
                    style={helveticaTextStyle}
                  />
                </Box>
                <Box sx={{ marginBottom: '0.7rem' }}>
                  <SequentialGlitchText 
                    text="Photography"
                    fontSize={{ xs: '0.95rem', sm: '1.1rem' }}
                    lineHeight={{ xs: '1.25rem', sm: '1.45rem' }}
                    fontWeight="500"
                    initialGlitch={canvasReady}
                    style={helveticaTextStyle}
                  />
                </Box>
                <Box sx={{ marginBottom: '0.7rem' }}>
                  <SequentialGlitchText 
                    text="Videography"
                    fontSize={{ xs: '0.95rem', sm: '1.1rem' }}
                    lineHeight={{ xs: '1.25rem', sm: '1.45rem' }}
                    fontWeight="500"
                    initialGlitch={canvasReady}
                    style={helveticaTextStyle}
                  />
                </Box>
              </Box>
            </Box>
            
            {/* Contact section - MARGEN 20px */}
            <Box sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              bottom: { md: '8rem' },
              left: '20px', // MARGEN CONSISTENTE: 20px
              right: '20px', // MARGEN CONSISTENTE: 20px
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginBottom: { xs: '2.5rem', md: 0 },
              mt: { xs: '2rem', md: 0 }
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
                  style={helveticaTextStyle}
                />
              </Box>
              <Box sx={{ 
                flex: 1,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'manual',
                wordBreak: 'normal'
              }}>
                <SequentialGlitchText 
                  text="Available for commission and freelance work."
                  fontSize={{ xs: '0.95rem', sm: '1.1rem' }}
                  lineHeight={{ xs: '1.25rem', sm: '1.45rem' }}
                  fontWeight="500"
                  style={{ 
                    ...helveticaTextStyle, 
                    marginBottom: '1.2rem',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'manual',
                    wordBreak: 'normal'
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
                      onMouseEnter={() => handleLinkHover('email-underline')}
                      sx={{ 
                        fontSize: { xs: '0.95rem', sm: '1.1rem' }, 
                        textDecoration: 'underline', 
                        color: '#00ff00', 
                        fontWeight: '500',
                        fontFamily: 'Helvetica-Regular, Helvetica, Arial, sans-serif',
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
                      onMouseEnter={() => handleLinkHover('instagram-underline')}
                      sx={{ 
                        fontSize: { xs: '0.95rem', sm: '1.1rem' }, 
                        textDecoration: 'underline', 
                        color: '#00ff00', 
                        fontWeight: '500',
                        fontFamily: 'Helvetica-Regular, Helvetica, Arial, sans-serif',
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
            
            {/* Local time section - MARGEN 20px */}
            <Box sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              bottom: { md: '3rem' },
              left: '20px', // MARGEN CONSISTENTE: 20px
              right: '20px', // MARGEN CONSISTENTE: 20px
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
                  style={helveticaTextStyle}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                {/* Componente UruguayTime optimizado con memo y fuente Suisse Intl Mono */}
                <UruguayTime 
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
              fontFamily: 'Helvetica-Regular, Helvetica, Arial, sans-serif',
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
                fontFamily: 'Helvetica-Regular, Helvetica, Arial, sans-serif',
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
