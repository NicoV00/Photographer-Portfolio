import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Box, 
  Button, 
  Drawer, 
  Typography, 
  Link,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material';

// Componente mejorado para texto con efecto glitch (versión anterior que le gustaba)
const SequentialGlitchText = ({ text, fontSize, fontFamily, fontWeight, color, letterSpacing, style, initialGlitch = false, isNeonGreen = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isInitializing, setIsInitializing] = useState(initialGlitch);
  const textRef = useRef(null);
  const underlineRef = useRef(null);
  const animationRef = useRef(null);
  const glitchTimerRef = useRef(null);
  const underlineAnimationRef = useRef(null);
  
  // Conjuntos de caracteres para el efecto
  const symbolsSet = "!<>-_\\/[]{}=+*^?#.:;()%&@$~|`\"'";
  const numbersSet = "0123456789";
  const lettersSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  
  // Efecto para inicialización y animación
  useEffect(() => {
    if (!textRef.current) return;
    
    // Detener animaciones previas
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (glitchTimerRef.current) {
      clearTimeout(glitchTimerRef.current);
      glitchTimerRef.current = null;
    }
    
    // Inicializar el texto con spans para cada letra preservando espacios
    const initializeText = () => {
      // Limpiar el contenido actual
      textRef.current.innerHTML = '';
      
      // Crear span para cada carácter, manteniendo espacios intactos
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.dataset.index = index;
        span.dataset.original = char;
        
        // Si es espacio, asegurarse de que se preserve
        if (char === ' ') {
          span.innerHTML = '&nbsp;';
          span.style.marginRight = '0.25em'; // Asegurar espaciado visible
        } else {
          span.style.display = 'inline-block';
          span.style.transition = 'transform 0.1s ease, scale 0.2s ease';
          span.style.transformOrigin = 'center';
        }
        
        textRef.current.appendChild(span);
      });
    };
    
    // Inicializar siempre para asegurar la estructura correcta
    initializeText();
    
    // Función para obtener un carácter aleatorio para el glitch
    const getRandomChar = () => {
      const charSet = Math.random() < 0.6 ? symbolsSet : 
                   (Math.random() < 0.5 ? numbersSet : lettersSet);
      return charSet[Math.floor(Math.random() * charSet.length)];
    };
    
    // Función para aplicar efecto de glitch secuencial (versión anterior)
    const applySequentialGlitch = () => {
      if (!textRef.current) return;
      
      const chars = textRef.current.querySelectorAll('span');
      if (!chars.length) return;
      
      // Ventana de glitch adaptativa (más grande para textos largos)
      const baseWindowSize = 5; // Mínimo 5 letras
      const adaptiveSize = Math.max(baseWindowSize, Math.floor(text.length / 15)); // Escalar para textos largos
      const windowSize = Math.min(adaptiveSize, 12); // No más de 12 a la vez para mantener el efecto visible
      
      let currentIndex = 0;
      
      const animateNextGroup = () => {
        // Resetear todas las letras previas
        for (let i = 0; i < currentIndex; i++) {
          if (chars[i]) {
            chars[i].textContent = chars[i].dataset.original;
            if (chars[i].dataset.original === ' ') {
              chars[i].innerHTML = '&nbsp;';
            }
            chars[i].style.scale = '1';
            chars[i].style.transform = 'translateY(0)';
          }
        }
        
        // Animar grupo actual
        for (let i = currentIndex; i < Math.min(currentIndex + windowSize, chars.length); i++) {
          if (chars[i] && chars[i].dataset.original.trim() !== '') {
            // Aplicar glitch solo a caracteres no espacios
            chars[i].textContent = getRandomChar();
            chars[i].style.scale = '1.2';
            chars[i].style.transform = 'translateY(-1px)';
          }
        }
        
        // Avanzar al siguiente grupo, más rápido
        currentIndex += 2; // Avanzar de 2 en 2 para acelerar
        
        // Continuar o terminar
        if (currentIndex < chars.length) {
          // Reducir el tiempo entre grupos para acelerar el efecto
          glitchTimerRef.current = setTimeout(animateNextGroup, 30); // 30ms en lugar de 40ms
        } else {
          // Restaurar todo al final, más rápido
          setTimeout(() => {
            chars.forEach(span => {
              span.textContent = span.dataset.original;
              if (span.dataset.original === ' ') {
                span.innerHTML = '&nbsp;';
              }
              span.style.scale = '1';
              span.style.transform = 'translateY(0)';
            });
          }, 150); // 150ms en lugar de 200ms
        }
      };
      
      // Iniciar la animación
      glitchTimerRef.current = setTimeout(animateNextGroup, 30); // Reducido de 50ms a 30ms
    };
    
    // Aplicar glitch según estado
    if (initialGlitch && isInitializing) {
      applySequentialGlitch();
      
      // Terminar inicialización después de la animación, más rápido para textos largos
      const animationDuration = Math.min(text.length * 30, 800); // Limitar a 800ms máximo
      glitchTimerRef.current = setTimeout(() => {
        setIsInitializing(false);
      }, animationDuration);
    } else if (isHovered) {
      applySequentialGlitch();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (glitchTimerRef.current) {
        clearTimeout(glitchTimerRef.current);
      }
    };
  }, [text, isHovered, isInitializing, initialGlitch]);
  
  // Efecto para la animación de la barra de subrayado al hacer hover
  useEffect(() => {
    if (!isNeonGreen || !underlineRef.current) return;
    
    if (underlineAnimationRef.current) {
      underlineAnimationRef.current.kill();
      underlineAnimationRef.current = null;
    }
    
    // Animación de la barra cuando se hace hover
    if (isHovered) {
      const tl = gsap.timeline();
      underlineAnimationRef.current = tl;
      
      // Animación de entrada y salida de la barra (más fluida)
      tl.fromTo(underlineRef.current, 
        { width: "0%", left: "0%", right: "auto" }, 
        { width: "100%", duration: 0.35, ease: "power2.inOut" }
      ).to(underlineRef.current, 
        { left: "auto", right: "0%", width: "0%", duration: 0.35, delay: 0.1, ease: "power2.inOut" }
      );
    } else {
      gsap.set(underlineRef.current, { width: "0%", left: "0%", right: "auto" });
    }
    
    return () => {
      if (underlineAnimationRef.current) {
        underlineAnimationRef.current.kill();
      }
    };
  }, [isHovered, isNeonGreen]);
  
  // Determinar estilos basados en isNeonGreen
  const baseStyles = {
    fontSize: fontSize || 'inherit',
    fontFamily: fontFamily || 'monospace',
    fontWeight: fontWeight || 'inherit',
    color: isNeonGreen ? '#00ff00' : (color || 'inherit'),
    letterSpacing: letterSpacing || '0px',
    cursor: 'default',
    transition: 'letter-spacing 0.2s, text-shadow 0.3s',
    wordSpacing: '0.25em', // Asegurar espaciado entre palabras
    position: 'relative', // Para posicionar la barra de subrayado
    ...(isHovered && { 
      letterSpacing: '0.5px',
    }),
    // Añadir efecto de glow para neon verde
    ...(isNeonGreen && {
      textShadow: isHovered 
        ? '0 0 4px #00ff00, 0 0 8px #00ff00, 0 0 12px #00ff00, 0 0 16px #00ff00'
        : '0 0 2px #00ff00, 0 0 4px #00ff00, 0 0 6px #00ff00',
      fontWeight: 'bold'
    }),
    ...style
  };
  
  return (
    <Box position="relative" display="inline-block">
      <Typography 
        ref={textRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={baseStyles}
      >
        {text}
      </Typography>
      {isNeonGreen && (
        <Box
          ref={underlineRef}
          sx={{
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            height: '2px',
            width: '0%',
            backgroundColor: '#00ff00',
            boxShadow: '0 0 4px #00ff00, 0 0 8px #00ff00',
            transition: 'width 0.3s'
          }}
        />
      )}
    </Box>
  );
};

// Componente para el título con efecto de máquina de escribir mejorado
const SmoothGlowingTitle = ({ text, open, isMobile = false }) => {
  const titleRef = useRef(null);
  const charElements = useRef([]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const glowTimeline = useRef(null);
  
  // Dividir el texto para dispositivos móviles
  const displayName = isMobile ? text.split(' ') : [text];
  
  // Efecto de entrada con resplandor suave y máquina de escribir
  useEffect(() => {
    if (open && titleRef.current && !hasAnimated) {
      // Crear timeline para animación del glow
      const tl = gsap.timeline();
      glowTimeline.current = tl;
      
      // Comenzar con un glow neon verde en el contenedor
      tl.fromTo(titleRef.current, 
        {
          textShadow: '0 0 0px rgba(0, 255, 0, 0)'
        },
        {
          textShadow: '0 0 4px rgba(0, 255, 0, 0.5), 0 0 8px rgba(0, 255, 0, 0.3)',
          duration: 1.5,
          ease: 'power1.inOut'
        }
      );
      
      // Limpiar caracteres existentes
      if (isMobile) {
        // Para móvil, manejado de forma diferente con dos líneas
        return;
      }
      
      // Seleccionar todos los spans (caracteres)
      const chars = titleRef.current.querySelectorAll('.char');
      charElements.current = chars;
      
      // Ocultar todos los caracteres inicialmente
      gsap.set(chars, { 
        opacity: 0,
        display: 'inline-block' 
      });
      
      // Crear timeline para la animación de tipeo
      const typeTimeline = gsap.timeline({
        onComplete: () => {
          // Cuando se complete, intensificar el glow y mantenerlo más fuerte
          tl.to(titleRef.current, {
            textShadow: '0 0 8px rgba(0, 255, 0, 0.7), 0 0 15px rgba(0, 255, 0, 0.5), 0 0 20px rgba(0, 255, 0, 0.3)',
            duration: 1.2,
            ease: 'power2.inOut'
          }).to(titleRef.current, {
            textShadow: '0 0 5px rgba(0, 255, 0, 0.6), 0 0 10px rgba(0, 255, 0, 0.4), 0 0 15px rgba(0, 255, 0, 0.3)',
            duration: 1.8,
            ease: 'power2.out',
            delay: 0.5
          });
          
          setHasAnimated(true);
        }
      });
      
      // Animar cada carácter con un retraso ascendente
      chars.forEach((char, index) => {
        const delay = 0.05 + index * 0.04; // Ajustar velocidad aquí
        typeTimeline.to(char, {
          opacity: 1,
          duration: 0.1,
          ease: "none"
        }, delay);
      });
      
    } else if (!open) {
      // Reiniciar si se cierra el panel
      setHasAnimated(false);
      
      // Limpiar timeline
      if (glowTimeline.current) {
        glowTimeline.current.kill();
        glowTimeline.current = null;
      }
      
      // Reiniciar opacidad de los caracteres para la próxima animación
      if (charElements.current.length > 0) {
        gsap.set(charElements.current, { opacity: 0 });
      }
    }
    
    return () => {
      if (glowTimeline.current) {
        glowTimeline.current.kill();
      }
    };
  }, [open, text, isMobile, hasAnimated]);
  
  // Efecto para hover del título
  useEffect(() => {
    if (titleRef.current) {
      // Añadir interactividad sutil al título
      const handleMouseEnter = () => {
        gsap.to(titleRef.current, {
          textShadow: '0 0 8px rgba(0, 255, 0, 0.8), 0 0 15px rgba(0, 255, 0, 0.6), 0 0 20px rgba(0, 255, 0, 0.4)',
          duration: 0.6,
          ease: 'power1.inOut'
        });
      };
      
      const handleMouseLeave = () => {
        gsap.to(titleRef.current, {
          textShadow: '0 0 5px rgba(0, 255, 0, 0.6), 0 0 10px rgba(0, 255, 0, 0.4), 0 0 15px rgba(0, 255, 0, 0.3)',
          duration: 0.8,
          ease: 'power1.out'
        });
      };
      
      titleRef.current.addEventListener('mouseenter', handleMouseEnter);
      titleRef.current.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        if (titleRef.current) {
          titleRef.current.removeEventListener('mouseenter', handleMouseEnter);
          titleRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, []);
  
  // Renderizado según el dispositivo
  if (isMobile) {
    // Versión móvil: título en dos líneas
    return (
      <Box ref={titleRef} sx={{ textAlign: 'center', width: '100%' }}>
        <Typography
          sx={{
            fontFamily: 'Medium, sans-serif',
            textTransform: 'uppercase',
            fontSize: '3rem',
            letterSpacing: '1px',
            fontWeight: 'bold',
            color: 'white',
            lineHeight: '1',
            whiteSpace: 'nowrap',
            cursor: 'default',
            textShadow: '0 0 3px #00ff00, 0 0 5px #00ff00'
          }}
        >
          {displayName[0]}
        </Typography>
        <Typography
          sx={{
            fontFamily: 'Medium, sans-serif',
            textTransform: 'uppercase',
            fontSize: '3rem',
            letterSpacing: '1px',
            fontWeight: 'bold',
            color: 'white',
            lineHeight: '1.1',
            whiteSpace: 'nowrap',
            cursor: 'default',
            textShadow: '0 0 3px #00ff00, 0 0 5px #00ff00'
          }}
        >
          {displayName.length > 1 ? displayName[1] : ''}
        </Typography>
      </Box>
    );
  }
  
  // Versión desktop con texto separado en spans para animar
  // Separar manualmente "ENZO" y "CIMILLO" para asegurar espacio correcto
  const titleParts = text.split(' ');
  
  return (
    <Typography 
      ref={titleRef}
      sx={{
        fontFamily: 'Medium, sans-serif',
        textTransform: 'uppercase',
        fontSize: '4.5rem',
        letterSpacing: '2px',
        fontWeight: 'bold',
        color: 'white',
        width: '100%',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        cursor: 'default',
        textShadow: '0 0 3px #00ff00, 0 0 5px #00ff00'
      }}
    >
      {/* Primera parte: ENZO */}
      {titleParts[0].split('').map((char, index) => (
        <span key={`first-${index}`} className="char" style={{opacity: 1}}>
          {char}
        </span>
      ))}
      
      {/* Espacio visible entre palabras */}
      <span className="char" style={{opacity: 1, width: '0.5em', display: 'inline-block'}}>&nbsp;</span>
      
      {/* Segunda parte: CIMILLO */}
      {titleParts.length > 1 && titleParts[1].split('').map((char, index) => (
        <span key={`second-${index}`} className="char" style={{opacity: 1}}>
          {char}
        </span>
      ))}
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

const CloseButton = styled(Box)(({ isMobile }) => ({
  position: 'absolute',
  top: isMobile ? '10px' : '20px',
  right: isMobile ? '10px' : '20px',
  width: isMobile ? '24px' : '30px',
  height: isMobile ? '24px' : '30px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  fontSize: isMobile ? '18px' : '22px',
  fontFamily: 'monospace',
  cursor: 'pointer',
  zIndex: 1010,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '2px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
}));

const OffCanvas = ({ name, onShowChange, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [open, setOpen] = useState(false);
  const [mouseInsideCanvas, setMouseInsideCanvas] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  
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
    // Reiniciar el estado para la próxima apertura
    setTimeout(() => setCanvasReady(false), 500);
  };

  // Efecto GSAP para la animación personalizada del drawer
  useEffect(() => {
    if (!drawerRef.current) return;

    if (open) {
      // Importante: establecer canvasReady true inmediatamente en desktop
      // para asegurar que el título se muestre correctamente
      if (!isMobile) {
        setCanvasReady(true);
      }
      
      gsap.to(drawerRef.current, { 
        x: 0, 
        duration: 0.5, 
        ease: 'power2.out',
        onComplete: () => {
          // En móvil, establecer canvasReady después de la animación
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

  // Efecto para el cursor personalizado (solo en desktop)
  useEffect(() => {
    if (isMobile) return; // No usar cursor personalizado en móvil
    
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
  }, [open, mouseInsideCanvas, isMobile]);
  
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
  
  // Calcular dimensiones responsivas
  const drawerWidth = isMobile ? '100%' : '800px';
  
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
              width: drawerWidth,
              height: '100%',
              bgcolor: 'black',
              color: 'white',
              padding: isMobile ? '12px' : '20px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transform: 'translateX(100%)'
            }}
            onMouseEnter={handleMouseEnterCanvas}
            onMouseLeave={handleMouseLeaveCanvas}
          >
            {/* Botón de cierre para móvil */}
            {isMobile && (
              <CloseButton isMobile={isMobile} onClick={handleClose}>
                ✖
              </CloseButton>
            )}
            
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              padding: isMobile ? '40px 0 10px' : '20px 0'
            }}>
              <SmoothGlowingTitle text="ENZO CIMILLO" open={canvasReady} isMobile={isMobile} />
            </Box>
            
            <Box sx={{ 
              position: 'absolute', 
              top: isMobile ? '12rem' : '20rem', 
              left: '8px', 
              right: '8px', 
              display: 'flex', 
              alignItems: 'flex-start' 
            }}>
              <Box sx={{ width: '11rem', flexDirection: 'column', justifyContent: 'start', marginRight: '2rem' }}>
                <SequentialGlitchText 
                  text="(BASED IN MONTEVIDEO, URUGUAY)" 
                  fontWeight="bold" 
                  fontSize="0.875rem"
                  initialGlitch={canvasReady}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SequentialGlitchText 
                  text="I AM A YOUNG PHOTOGRAPHER AND VIDEOGRAPHER WITH A STRONG INCLINATION TOWARD FASHION PRODUCTIONS."
                  fontSize="1rem"
                  lineHeight="1.4rem"
                  fontWeight="500"
                  style={{ marginBottom: '1rem' }}
                  initialGlitch={canvasReady}
                />
                <SequentialGlitchText 
                  text="REEL 2024" 
                  fontWeight="bold" 
                  fontSize="0.875rem"
                  initialGlitch={canvasReady}
                />
              </Box>
            </Box>
            
            <Box sx={{ 
              position: 'absolute', 
              top: isMobile ? '24rem' : '32rem', 
              left: '8px', 
              right: '8px', 
              display: 'flex', 
              alignItems: 'flex-start' 
            }}>
              <Box sx={{ width: '11rem', flexDirection: 'column', justifyContent: 'start', marginRight: '2rem' }}>
                <SequentialGlitchText 
                  text="(CAPABILITIES)" 
                  fontWeight="bold" 
                  fontSize="0.875rem"
                  initialGlitch={canvasReady}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ marginBottom: '0.5rem' }}>
                  <SequentialGlitchText 
                    text="EDITING"
                    fontSize="1rem"
                    lineHeight="1.4rem"
                    fontWeight="500"
                    initialGlitch={canvasReady}
                  />
                </Box>
                <Box sx={{ marginBottom: '0.5rem' }}>
                  <SequentialGlitchText 
                    text="PHOTOGRAPHY"
                    fontSize="1rem"
                    lineHeight="1.4rem"
                    fontWeight="500"
                    initialGlitch={canvasReady}
                  />
                </Box>
                <Box sx={{ marginBottom: '0.5rem' }}>
                  <SequentialGlitchText 
                    text="VIDEOGRAPHY"
                    fontSize="1rem"
                    lineHeight="1.4rem"
                    fontWeight="500"
                    initialGlitch={canvasReady}
                  />
                </Box>
                <Box sx={{ marginBottom: '0.5rem' }}>
                  <SequentialGlitchText 
                    text="VISUAL COMMUNICATION"
                    fontSize="1rem"
                    lineHeight="1.4rem"
                    fontWeight="500"
                    initialGlitch={canvasReady}
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ 
              position: 'absolute', 
              bottom: isMobile ? '8rem' : '12rem', 
              left: '8px', 
              right: '8px', 
              display: 'flex', 
              alignItems: 'flex-start' 
            }}>
              <Box sx={{ width: '11rem', flexDirection: 'column', justifyContent: 'start', marginRight: '2rem' }}>
                <SequentialGlitchText 
                  text="(CONTACT)" 
                  fontWeight="bold" 
                  fontSize="0.875rem"
                  initialGlitch={canvasReady}
                  isNeonGreen={true}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SequentialGlitchText 
                  text="AVAILABLE FOR COMMISSION AND FREELANCE WORK."
                  fontSize="1rem"
                  lineHeight="1.4rem"
                  fontWeight="500"
                  style={{ marginBottom: '1rem' }}
                  initialGlitch={canvasReady}
                />
                <Box sx={{ display: 'flex', gap: '1rem' }}>
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
                        fontSize: '1rem', 
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
                        fontSize: '1rem', 
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
              position: 'absolute', 
              bottom: '3rem', 
              left: '8px', 
              right: '8px', 
              display: 'flex', 
              alignItems: 'flex-start' 
            }}>
              <Box sx={{ width: '11rem', flexDirection: 'column', justifyContent: 'start', marginRight: '2rem' }}>
                <SequentialGlitchText 
                  text="(LOCAL TIME)" 
                  fontWeight="bold" 
                  fontSize="0.875rem"
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
      
      {/* Cursores personalizados solo para desktop */}
      {!isMobile && (
        <>
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
      )}
    </>
  );
};

export default OffCanvas;