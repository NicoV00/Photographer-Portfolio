import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Box, 
  Button, 
  Drawer, 
  Typography, 
  Link,
  styled
} from '@mui/material';

// Componente para texto con efecto ASCII glitch
const AsciiGlitchText = ({ text, fontSize, fontFamily, fontWeight, color, letterSpacing, style }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const originalText = useRef(text);
  const glitchTimerRef = useRef(null);
  
  // Conjuntos de caracteres ASCII para el efecto
  const symbolsSet = "!<>-_\\/[]{}=+*^?#.:;()%&@$~|`\"'";
  const numbersSet = "0123456789";
  const lettersSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const asciiChars = symbolsSet + numbersSet + lettersSet;
  
  // Función para generar texto ASCII aleatorio de longitud similar al original
  const generateAsciiText = (originalStr, density = 0.7) => {
    return originalStr.split('').map(char => {
      // Mantener espacios
      if (char === ' ') return ' ';
      
      // Probabilidad de reemplazar con ASCII
      if (Math.random() < density) {
        // Diferentes tipos de caracteres para variedad
        const charSet = Math.random() < 0.5 ? 
                        (Math.random() < 0.7 ? symbolsSet : numbersSet) : 
                        lettersSet;
                        
        return charSet[Math.floor(Math.random() * charSet.length)];
      }
      return char;
    }).join('');
  };
  
  // Efecto para las transiciones graduales entre estados
  useEffect(() => {
    // Función para transformar texto gradualmente
    const transformText = (steps = 5, finalText) => {
      let currentStep = 0;
      
      const transform = () => {
        currentStep++;
        
        // Calcular la proporción de caracteres originales vs. ASCII
        const progress = currentStep / steps;
        const asciiDensity = isHovered ? (1 - progress) : progress;
        
        // Combinar caracteres originales y ASCII según la progresión
        if (currentStep < steps) {
          // Durante la transición, generar un texto intermedio
          setDisplayText(generateAsciiText(finalText, asciiDensity));
          glitchTimerRef.current = setTimeout(transform, 100);
        } else {
          // Al finalizar la transición
          setDisplayText(finalText);
        }
      };
      
      transform();
    };
    
    // Cancelar timer actual si existe
    if (glitchTimerRef.current) {
      clearTimeout(glitchTimerRef.current);
    }
    
    // Iniciar la transición apropiada según el hover
    if (isHovered) {
      // Al entrar, transformar de texto original a ASCII
      const asciiText = generateAsciiText(originalText.current, 1.0);
      transformText(5, asciiText);
    } else {
      // Al salir, volver al texto original
      transformText(3, originalText.current);
    }
    
    return () => {
      if (glitchTimerRef.current) {
        clearTimeout(glitchTimerRef.current);
      }
    };
  }, [isHovered]);
  
  return (
    <Typography 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        fontSize: fontSize || 'inherit',
        fontFamily: fontFamily || 'monospace', // Fuente monospace por defecto para efecto ASCII
        fontWeight: fontWeight || 'inherit',
        color: color || 'inherit',
        letterSpacing: letterSpacing || '0px',
        cursor: 'default',
        transition: 'letter-spacing 0.3s',
        ...(isHovered && { letterSpacing: '1px' }),  // Expandir espaciado al hover
        ...style
      }}
    >
      {displayText}
    </Typography>
  );
};

// Componente para mostrar la hora de Montevideo, Uruguay
const UruguayTime = () => {
  const [time, setTime] = useState('');
  const [blinkOn, setBlinkOn] = useState(true);
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Calcular correctamente la hora en Uruguay (GMT-3)
      let hours = now.getUTCHours() - 3;
      // Ajustar si pasa a día anterior
      if (hours < 0) hours += 24;
      
      const minutes = now.getUTCMinutes();
      const seconds = now.getUTCSeconds();
      
      const timeString = 
        String(hours).padStart(2, '0') + 
        ':' + 
        String(minutes).padStart(2, '0') + 
        ':' + 
        String(seconds).padStart(2, '0') + 
        ' UYT';
      
      setTime(timeString);
    };
    
    // Actualizar el tiempo cada segundo
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    
    // Parpadeo del punto cada 500ms
    const blinkInterval = setInterval(() => {
      setBlinkOn(prev => !prev);
    }, 500);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(blinkInterval);
    };
  }, [blinkOn]);
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box 
        sx={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: 'white', 
          marginRight: '8px',
          opacity: blinkOn ? 1 : 0,
          transition: 'opacity 0.1s ease'
        }} 
      />
      <Typography sx={{ 
        fontSize: '1.125rem', 
        fontFamily: 'monospace',
        fontWeight: '500',
        letterSpacing: '1px'
      }}>
        {time}
      </Typography>
    </Box>
  );
};

// Componentes estilizados para mantener la apariencia personalizada
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '800px',
    backgroundColor: 'black',
    color: 'white',
    padding: '20px',
    position: 'relative',
    fontFamily: 'DM Sans, sans-serif'
  }
}));

const InfoButton = styled(Button)(({ isHovered }) => ({
  margin: '0 4px',
  padding: '6px 13px',
  border: isHovered ? '1px solid #000' : '1px solid #ccc',
  borderRadius: '2px',
  backgroundColor: 'transparent',
  color: 'black',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'border 0.3s ease, background-color 0.3s ease, border-radius 0.3s ease, color 0.3s ease',
  position: 'relative',
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: 'transparent',
  }
}));

const CustomCursor = styled(Box)(({ backgroundColor, color }) => ({
  position: 'fixed',
  width: '24px',
  height: '24px',
  border: '2px solid black',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '18px',
  fontFamily: 'monospace',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
  zIndex: 1000,
  visibility: 'hidden',
  cursor: 'none',
  backgroundColor,
  color
}));

const OverlayBackdrop = styled(Box)({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: 'rgba(1, 1, 1, 0.2)',
  display: 'flex',
  justifyContent: 'flex-end',
});

const OffCanvas = ({ name, onShowChange, ...props }) => {
  const [open, setOpen] = useState(false);
  const [mouseInsideCanvas, setMouseInsideCanvas] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorRef2 = useRef(null);

  const handleOpen = () => {
    setOpen(true);
    if (onShowChange) onShowChange(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (onShowChange) onShowChange(false);
  };

  // Efecto GSAP para la animación personalizada del drawer
  useEffect(() => {
    if (!drawerRef.current) return;

    if (open) {
      gsap.to(drawerRef.current, { x: 0, duration: 0.5, ease: 'power2.out' });
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
  }, [open]);

  // Efecto para el cursor personalizado
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.pageX}px`;
        cursorRef.current.style.top = `${e.pageY}px`;
        cursorRef.current.style.visibility = open && !mouseInsideCanvas ? 'visible' : 'hidden';
      }
      if (cursorRef2.current) {
        cursorRef2.current.style.left = `${e.pageX}px`;
        cursorRef2.current.style.top = `${e.pageY}px`;
        cursorRef2.current.style.visibility = open && mouseInsideCanvas ? 'visible' : 'hidden';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [open, mouseInsideCanvas]);

  const handleOverlayClick = (e) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target)) {
      handleClose();
    }
  };

  const handleMouseEnterCanvas = () => setMouseInsideCanvas(true);
  const handleMouseLeaveCanvas = () => setMouseInsideCanvas(false);
  
  const handleCursorClick = () => {
    if (!mouseInsideCanvas) handleClose();
  };

  return (
    <>
      <InfoButton
        isHovered={isHovered}
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
            sx={{ 
              width: '800px',
              height: '100%',
              bgcolor: 'black',
              color: 'white',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transform: 'translateX(100%)'
            }}
            onMouseEnter={handleMouseEnterCanvas}
            onMouseLeave={handleMouseLeaveCanvas}
          >
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Typography sx={{
                fontFamily: 'Medium, sans-serif',
                textTransform: 'uppercase',
                fontSize: '4.5rem',
                letterSpacing: '2px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
                width: '100%',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                ENZO CIMILLO
              </Typography>
            </Box>
            
            <Box sx={{ position: 'absolute', top: '20rem', left: '8px', right: '8px', display: 'flex', alignItems: 'flex-start' }}>
              <Box sx={{ width: '11rem', flexDirection: 'column', justifyContent: 'start', marginRight: '2rem' }}>
                <AsciiGlitchText 
                  text="(BASED IN MONTEVIDEO, URUGUAY)" 
                  fontWeight="bold" 
                  fontSize="0.875rem" 
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <AsciiGlitchText 
                  text="I AM A YOUNG PHOTOGRAPHER AND VIDEOGRAPHER WITH A STRONG INCLINATION TOWARD FASHION PRODUCTIONS."
                  fontSize="1rem"
                  lineHeight="1.4rem"
                  fontWeight="500"
                  style={{ marginBottom: '1rem' }}
                />
                <AsciiGlitchText 
                  text="REEL 2024" 
                  fontWeight="bold" 
                  fontSize="0.875rem" 
                />
              </Box>
            </Box>
            
            <Box sx={{ position: 'absolute', top: '32rem', left: '8px', right: '8px', display: 'flex', alignItems: 'flex-start' }}>
              <Box sx={{ width: '11rem', flexDirection: 'column', justifyContent: 'start', marginRight: '2rem' }}>
                <AsciiGlitchText 
                  text="(CAPABILITIES)" 
                  fontWeight="bold" 
                  fontSize="0.875rem" 
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <AsciiGlitchText 
                  text="EDITING"
                  fontSize="1rem"
                  lineHeight="1.4rem"
                  fontWeight="500"
                  style={{ marginBottom: '0.5rem' }}
                />
                <AsciiGlitchText 
                  text="PHOTOGRAPHY"
                  fontSize="1rem"
                  lineHeight="1.4rem"
                  fontWeight="500"
                  style={{ marginBottom: '0.5rem' }}
                />
                <AsciiGlitchText 
                  text="COMMUNICATION"
                  fontSize="1rem"
                  lineHeight="1.4rem"
                  fontWeight="500"
                  style={{ marginBottom: '0.5rem' }}
                />
                <AsciiGlitchText 
                  text="MARKETING"
                  fontSize="1rem"
                  lineHeight="1.4rem"
                  fontWeight="500"
                  style={{ marginBottom: '0.5rem' }}
                />
              </Box>
            </Box>
            
            <Box sx={{ position: 'absolute', bottom: '12rem', left: '8px', right: '8px', display: 'flex', alignItems: 'flex-start' }}>
              <Box sx={{ width: '11rem', flexDirection: 'column', justifyContent: 'start', marginRight: '2rem' }}>
                <AsciiGlitchText 
                  text="(CONTACT)" 
                  fontWeight="bold" 
                  fontSize="0.875rem" 
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <AsciiGlitchText 
                  text="AVAILABLE FOR COMMISSION AND FREELANCE WORK."
                  fontSize="1rem"
                  lineHeight="1.4rem"
                  fontWeight="500"
                  style={{ marginBottom: '1rem' }}
                />
                <Box sx={{ display: 'flex', gap: '1rem' }}>
                  <Link href="mailto:cimillo.enzo@gmail.com" sx={{ 
                    fontSize: '1rem', 
                    textDecoration: 'underline', 
                    color: 'white', 
                    fontWeight: '500',
                    fontFamily: 'monospace',
                    '&:hover': {
                      color: '#cccccc',
                      textDecoration: 'none'
                    }
                  }}>
                    EMAIL
                  </Link>
                  <Link href="https://www.instagram.com/enzocimillo" target="_blank" rel="noopener noreferrer" sx={{ 
                    fontSize: '1rem', 
                    textDecoration: 'underline', 
                    color: 'white', 
                    fontWeight: '500',
                    fontFamily: 'monospace',
                    '&:hover': {
                      color: '#cccccc',
                      textDecoration: 'none'
                    }
                  }}>
                    INSTAGRAM
                  </Link>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ position: 'absolute', bottom: '3rem', left: '8px', right: '8px', display: 'flex', alignItems: 'flex-start' }}>
              <Box sx={{ width: '11rem', flexDirection: 'column', justifyContent: 'start', marginRight: '2rem' }}>
                <AsciiGlitchText 
                  text="(LOCAL TIME)" 
                  fontWeight="bold" 
                  fontSize="0.875rem" 
                />
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <UruguayTime />
                <Link href="mailto:cimillo.enzo@gmail.com" sx={{ 
                  fontSize: '0.875rem', 
                  textDecoration: 'underline', 
                  color: 'white',
                  fontFamily: 'monospace',
                  '&:hover': {
                    color: '#cccccc',
                    textDecoration: 'none'
                  }
                }}>
                  Send An Email
                </Link>
              </Box>
            </Box>
          </Box>
        </OverlayBackdrop>
      )}
      
      <CustomCursor
        id="custom-cursor2" 
        ref={cursorRef} 
        backgroundColor={mouseInsideCanvas ? 'black' : 'white'}
        color={mouseInsideCanvas ? 'white' : 'black'}
        onClick={handleCursorClick}
      >
        ✖
      </CustomCursor>
      
      {open && mouseInsideCanvas && (
        <CustomCursor
          id="custom-cursor3" 
          ref={cursorRef2} 
          backgroundColor={mouseInsideCanvas ? 'black' : 'white'}
          color={mouseInsideCanvas ? 'white' : 'black'}
          onClick={handleCursorClick}
        >
          EC
        </CustomCursor>
      )}
    </>
  );
};

export default OffCanvas;