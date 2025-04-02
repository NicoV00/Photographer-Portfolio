import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Box, 
  Link,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';

// Import components
import SequentialGlitchText from './SequentialGlitchText';
import SmoothGlowingTitle from './SmoothGlowingTitle';
import UruguayTime from './UruguayTime';
import { 
  InfoButton, 
  OverlayBackdrop, 
  CloseButton 
} from './StyledComponents';

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
  
  return (
    <>
      <InfoButton
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{ 
          backgroundColor: isHovered ? 'white' : 'black',
          color: isHovered ? 'black' : 'white',
          boxShadow: isHovered ? '0 0 8px rgba(255,255,255,0.8)' : 'none'
        }}
      >
        I
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
              padding: isMobile ? '12px 20px 12px 12px' : isTablet ? '16px 24px 16px 16px' : '20px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transform: 'translateX(100%)',
              overflowY: 'auto', // Allow scrolling on small screens
              overflowX: 'hidden',
              cursor: 'none', // Hide default cursor in the drawer
              '& *': { 
                cursor: 'none !important' // Force cursor:none on all child elements
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
              padding: isMobile ? '40px 0 10px' : '20px 0',
              marginBottom: isMobile ? '2rem' : 0
            }}>
              <SmoothGlowingTitle 
                text="ENZO CIMILLO" 
                open={canvasReady} 
                isMobile={isMobile}
                noGlowOnMobile={true} // Desactivar glow en móvil
              />
            </Box>
            
            {/* Content sections with improved responsiveness */}
            <Box sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              top: { md: '20rem' },
              left: '8px', 
              right: '8px', 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'flex-start',
              marginBottom: { xs: '2rem', md: 0 } 
            }}>
              <Box sx={{ 
                width: { xs: '100%', sm: '11rem' },
                marginBottom: { xs: '1rem', sm: 0 },
                marginRight: { sm: '2rem' },
                paddingRight: { xs: '8px', sm: 0 } // Padding adicional en móvil
              }}>
                <SequentialGlitchText 
                  text="(BASED IN MONTEVIDEO, URUGUAY)" 
                  fontWeight="bold" 
                  fontSize={{ xs: '0.75rem', sm: '0.875rem' }}
                  initialGlitch={canvasReady}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SequentialGlitchText 
                  text="I AM A YOUNG PHOTOGRAPHER AND VIDEOGRAPHER WITH A STRONG INCLINATION TOWARD FASHION PRODUCTIONS."
                  fontSize={{ xs: '0.875rem', sm: '1rem' }}
                  lineHeight={{ xs: '1.1rem', sm: '1.2rem' }}
                  fontWeight="500"
                  style={{ marginBottom: '1rem' }}
                  initialGlitch={canvasReady}
                />
                <SequentialGlitchText 
                  text="REEL 2024" 
                  fontWeight="bold" 
                  fontSize={{ xs: '0.75rem', sm: '0.875rem' }}
                  initialGlitch={canvasReady}
                />
              </Box>
            </Box>
            
            <Box sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              top: { md: '32rem' },
              left: '8px', 
              right: '8px', 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'flex-start',
              marginBottom: { xs: '2rem', md: 0 } 
            }}>
              <Box sx={{ 
                width: { xs: '100%', sm: '11rem' },
                marginBottom: { xs: '1rem', sm: 0 },
                marginRight: { sm: '2rem' }
              }}>
                <SequentialGlitchText 
                  text="(CAPABILITIES)" 
                  fontWeight="bold" 
                  fontSize={{ xs: '0.75rem', sm: '0.875rem' }}
                  initialGlitch={canvasReady}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ marginBottom: '0.5rem' }}>
                  <SequentialGlitchText 
                    text="EDITING"
                    fontSize={{ xs: '0.875rem', sm: '1rem' }}
                    lineHeight={{ xs: '1.2rem', sm: '1.4rem' }}
                    fontWeight="500"
                    initialGlitch={canvasReady}
                  />
                </Box>
                <Box sx={{ marginBottom: '0.5rem' }}>
                  <SequentialGlitchText 
                    text="PHOTOGRAPHY"
                    fontSize={{ xs: '0.875rem', sm: '1rem' }}
                    lineHeight={{ xs: '1.2rem', sm: '1.4rem' }}
                    fontWeight="500"
                    initialGlitch={canvasReady}
                  />
                </Box>
                <Box sx={{ marginBottom: '0.5rem' }}>
                  <SequentialGlitchText 
                    text="VIDEOGRAPHY"
                    fontSize={{ xs: '0.875rem', sm: '1rem' }}
                    lineHeight={{ xs: '1.2rem', sm: '1.4rem' }}
                    fontWeight="500"
                    initialGlitch={canvasReady}
                  />
                </Box>
                <Box sx={{ marginBottom: '0.5rem' }}>
                  <SequentialGlitchText 
                    text="VISUAL COMMUNICATION"
                    fontSize={{ xs: '0.875rem', sm: '1rem' }}
                    lineHeight={{ xs: '1.2rem', sm: '1.4rem' }}
                    fontWeight="500"
                    initialGlitch={canvasReady}
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              bottom: { md: '12rem' },
              left: '8px', 
              right: '8px', 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'flex-start',
              marginBottom: { xs: '2rem', md: 0 } 
            }}>
              <Box sx={{ 
                width: { xs: '100%', sm: '11rem' },
                marginBottom: { xs: '1rem', sm: 0 },
                marginRight: { sm: '2rem' }
              }}>
                <SequentialGlitchText 
                  text="(CONTACT)" 
                  fontWeight="bold" 
                  fontSize={{ xs: '0.75rem', sm: '0.875rem' }}
                  initialGlitch={canvasReady}
                  isNeonGreen={true}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SequentialGlitchText 
                  text="AVAILABLE FOR COMMISSION AND FREELANCE WORK."
                  fontSize={{ xs: '0.875rem', sm: '1rem' }}
                  lineHeight={{ xs: '1.2rem', sm: '1.4rem' }}
                  fontWeight="500"
                  style={{ marginBottom: '1rem' }}
                  initialGlitch={canvasReady}
                />
                <Box sx={{ 
                  display: 'flex', 
                  gap: '1rem',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' }
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
                        fontSize: { xs: '0.875rem', sm: '1rem' }, 
                        textDecoration: 'underline', 
                        color: '#00ff00', 
                        fontWeight: '500',
                        fontFamily: 'monospace',
                        textShadow: '0 0 2px #00ff00, 0 0 4px #00ff00, 0 0 6px #00ff00',
                        transition: 'text-shadow 0.3s ease, color 0.3s ease',
                        '&:hover': {
                          color: '#00ff00',
                          textDecoration: 'none',
                          textShadow: '0 0 4px #00ff00, 0 0 8px #00ff00, 0 0 12px #00ff00, 0 0 16px #00ff00'
                        }
                      }}
                    >
                      EMAIL
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
                        fontSize: { xs: '0.875rem', sm: '1rem' }, 
                        textDecoration: 'underline', 
                        color: '#00ff00', 
                        fontWeight: '500',
                        fontFamily: 'monospace',
                        textShadow: '0 0 2px #00ff00, 0 0 4px #00ff00, 0 0 6px #00ff00',
                        transition: 'text-shadow 0.3s ease, color 0.3s ease',
                        '&:hover': {
                          color: '#00ff00',
                          textDecoration: 'none',
                          textShadow: '0 0 4px #00ff00, 0 0 8px #00ff00, 0 0 12px #00ff00, 0 0 16px #00ff00'
                        }
                      }}
                    >
                      INSTAGRAM
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
              left: '8px', 
              right: '8px', 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: 'flex-start',
              marginTop: { xs: '1rem', md: 0 }
            }}>
              <Box sx={{ 
                width: { xs: '100%', sm: '11rem' },
                marginBottom: { xs: '0.5rem', sm: 0 },
                marginRight: { sm: '2rem' }
              }}>
                <SequentialGlitchText 
                  text="(LOCAL TIME)" 
                  fontWeight="bold" 
                  fontSize={{ xs: '0.75rem', sm: '0.875rem' }}
                  initialGlitch={canvasReady}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <UruguayTime />
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
              fontFamily: 'monospace',
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
