import React from 'react';
import { useEffect, useRef, useState, lazy, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import About1 from './components/About1';
import Footer from './components/Footer';
import OffCanvas from './components/OffCanvas';
import { CircularProgress, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import IntroVideo from './components/IntroVideo';
import CursorManager from './components/CursorManager';
import ScreensaverBanner from './components/ScreensaverBanner';
import { gsap } from 'gsap';
import * as THREE from 'three';
import MyWaySection from './components/MyWaySection';
import { Analytics } from '@vercel/analytics/react';
import MobileComingSoon from './components/MobileComingSoon';

// Lazy loaded galleries
const AnaLivniGallery = lazy(() => import('./components/Galleries/AnaLivniGallery'));
const BluaGallery = lazy(() => import('./components/Galleries/BluaGallery'));
const MaisonGallery = lazy(() => import('./components/Galleries/MaisonGallery'));
const VestimeTeoGallery = lazy(() => import('./components/Galleries/VestimeTeoGallery'));
const CaldoGallery = lazy(() => import('./components/Galleries/CaldoGallery')); 
const PlataGallery = lazy(() => import('./components/Galleries/PlataGallery'));
const LenoirGallery = lazy(() => import('./components/Galleries/LenoirGallery'));
const KaboaGallery = lazy(() => import('./components/Galleries/KaboaGallery'));
const AmourGallery = lazy(() => import('./components/Galleries/AmourGallery'));
const MarcosGallery = lazy(() => import('./components/Galleries/MarcosGallery'));
const PasarelaGallery = lazy(() => import('./components/Galleries/PasarelaGallery'));
const IdentidadGallery = lazy(() => import('./components/Galleries/IdentidadGallery'));

// Precarga
import('./components/Galleries/BluaGallery');

// Función para detectar dispositivos móviles
const isMobileDevice = () => {
  // Detecta por user agent
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Detecta por tamaño de pantalla
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  
  // Detecta por capacidades táctiles
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return mobileRegex.test(userAgent.toLowerCase()) || (screenWidth <= 768 && hasTouch);
};

// Componente para el texto con efecto glitch
const GlitchText = ({ text }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const prevTextRef = useRef(text);
  
  useEffect(() => {
    // Activar glitch cuando cambia el texto
    if (text !== prevTextRef.current) {
      prevTextRef.current = text;
      setIsGlitching(true);
      const characters = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let iterations = 0;
      
      const interval = setInterval(() => {
        setDisplayText(text
          .split("")
          .map((letter, index) => {
            if (index < iterations) {
              return text[index];
            }
            if (letter === ' ') return ' '; // Mantener espacios
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
        );
        
        if (iterations >= text.length) {
          clearInterval(interval);
          setIsGlitching(false);
          setDisplayText(text);
        }
        
        iterations += 1;
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [text]);
  
  return <span>{displayText}</span>;
};

// Font loading and global styles
const GlobalStyle = styled('style')({
  '@font-face': [
    {
      fontFamily: 'Medium',
      src: 'url("/fonts/Medium.otf") format("opentype")',
      fontWeight: 'normal',
      fontStyle: 'normal',
    },
    {
      fontFamily: 'Helvetica-Regular',
      src: 'url("/fonts/Helvetica.ttf") format("truetype")',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontDisplay: 'swap',
    },
    {
      fontFamily: 'Helvetica-Bold',
      src: 'url("/fonts/Helvetica-Bold.ttf") format("truetype")',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fontDisplay: 'swap',
    }
  ]
});

// Container for the entire app
const ContainerCloud = styled(Box)({
  position: 'relative',
  width: '100vw',
  height: '100vh',
  opacity: 1,
});

// Photographer name with rotation and styling
const PhotographerName = styled(Box)({
  position: 'absolute',
  top: '140px',
  left: '0px',
  fontFamily: 'Helvetica-Bold, "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize: '50px',
  fontWeight: 'bold',
  color: 'black',
  transform: 'rotate(-90deg)',
  transformOrigin: 'top left',
  zIndex: 10,
  letterSpacing: '-2px',
  textTransform: 'lowercase',
  transition: 'letter-spacing 0.3s ease, opacity 0.5s ease, color 0.2s ease',
  opacity: 0,
  cursor: 'pointer',
  userSelect: 'none',
});

// Style for individual letters
const Letter = styled('span')({
  display: 'inline-block',
  transition: 'color 0.2s ease, text-shadow 0.3s ease',
  marginRight: '0.5px'
});

// Project info container actualizado para usar colores del tema directamente
const ProjectInfoContainer = styled(Box)(({ isVisible, textColor }) => ({
  position: 'fixed',
  bottom: '20px',
  left: '50%',
  textAlign: 'center',
  zIndex: 1000,
  pointerEvents: 'none',
  color: textColor || '#000000', // Usar el color del tema directamente
  fontFamily: '"Helvetica", Helvetica, Arial, sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  lineHeight: '1.4',
  opacity: isVisible ? 1 : 0,
  transform: isVisible 
    ? 'translateX(-50%) translateY(0)' 
    : 'translateX(-50%) translateY(20px)',
  transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
}));

const ProjectName = styled(Box)({
  marginBottom: '4px',
  fontSize: '18px',
  fontWeight: 'bold',
  letterSpacing: '1px',
});

const ProjectYear = styled(Box)({
  fontSize: '14px',
  opacity: 0.7,
  fontWeight: 'bold',
});

function App() {
  const photographerName = "enzo";
  const lettersRef = useRef([]);
  const [showDiv, setShowDiv] = useState(false);
  const [index, setIndex] = useState('false');
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [collection, setCollection] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const containerRef = useRef(null);
  const photographerNameRef = useRef(null);

  const [bgColor, setBgColor] = useState('#ffffff');
  const glRef = useRef(null);
  const clearColor = useRef(new THREE.Color(bgColor));

  // Estados para la transición
  const [initialTransition, setInitialTransition] = useState(false);
  const [transitionImageUrl, setTransitionImageUrl] = useState(null);
  const transitionInProgressRef = useRef(false);
  const [scene3DReady, setScene3DReady] = useState(false);

  // Estado para la información del proyecto seleccionado
  const [selectedProjectInfo, setSelectedProjectInfo] = useState(null);

  // Estados del screensaver
  const [screensaverActive, setScreensaverActive] = useState(true);
  const [isUserInactive, setIsUserInactive] = useState(false);

  // NUEVO ESTADO para almacenar los colores del tema actual
  const [themeColors, setThemeColors] = useState(null);

  // NUEVO ESTADO para detectar dispositivos móviles
  const [isMobile, setIsMobile] = useState(isMobileDevice());

  // Collection mapping
  const specialCollections = {
    "./images/CALDO/CALDO-1 (PORTADA).jpg": "caldo",
    "./images/S-1.jpg": "ana-livni",
    "./images/blua_constelaciones_finales.jpg": "blua",
    "./images/MDLST/MDLST-1.png": "maison",
    "./images/TEO/V1.jpg": "vestimeteo",
    "./images/PLATA/PLATA-2.jpg": "plata",
    "./images/LENOIR/LENOIR-1.jpg": "lenoir",
    "./images/KABOA/KABOA-1.jpg": "kaboa",
    "./images/AMOUR/portada.jpg": "amour",
    "./images/MARCOS/MARCOSMUF-5 (PORTADA).jpg": "marcos",
    "./images/PASARELA/PASARELA MUF-12(PORTADA).jpg": "pasarela",
    "./images/IDENTIDAD/IDENTIDAD MUF-1 (PORTADA).jpg": "identidad"
  };

  // NUEVO: Detectar cambios en el tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOffCanvasState = (show) => {
    setIsOffCanvasOpen(show);
  };

  // FIX: Manejo correcto del reset de color a blanco
  useEffect(() => {
    const fallback = '#ffffff';
    
    // Si bgColor es null, undefined, o se está reseteando, volver a blanco
    if (!bgColor) {
      setThemeColors(null);
      
      console.log('||||| ---> Reseteando color a BLANCO');
      
      const whiteColor = new THREE.Color('#ffffff');
      gsap.to(clearColor.current, {
        r: whiteColor.r,
        g: whiteColor.g,
        b: whiteColor.b,
        duration: 1,
        onUpdate: () => {
          if (glRef.current) {
            glRef.current.setClearColor(clearColor.current);
          }
        },
      });
      return;
    }
    
    // Si bgColor es un objeto con la estructura del tema
    if (typeof bgColor === 'object' && bgColor.main) {
      setThemeColors(bgColor); // Guardar todo el objeto de colores
      const hex = bgColor.main || fallback;
      
      console.log('||||| ---> Tema COMPLETO recibido:', bgColor);
      console.log('||||| ---> Color de fondo:', bgColor.main);
      console.log('||||| ---> Color de texto:', bgColor.text);

      const newColor = new THREE.Color(hex);
      gsap.to(clearColor.current, {
        r: newColor.r,
        g: newColor.g,
        b: newColor.b,
        duration: 1,
        onUpdate: () => {
          if (glRef.current) {
            glRef.current.setClearColor(clearColor.current);
          }
        },
      });
    } else if (typeof bgColor === 'string') {
      // Si bgColor es solo un string de color
      const hex = bgColor;
      setThemeColors(null);
      
      console.log('||||| ---> Color simple recibido:', hex);

      const newColor = new THREE.Color(hex);
      gsap.to(clearColor.current, {
        r: newColor.r,
        g: newColor.g,
        b: newColor.b,
        duration: 1,
        onUpdate: () => {
          if (glRef.current) {
            glRef.current.setClearColor(clearColor.current);
          }
        },
      });
    }
  }, [bgColor]);

  const hexToRGB = (hex) => {
    if (typeof hex !== 'string') return [0, 0, 0];

    const cleanedHex = hex.replace('#', '');

    const bigint = parseInt(cleanedHex, 16);
    return [
      ((bigint >> 16) & 255) / 255,
      ((bigint >> 8) & 255) / 255,
      (bigint & 255) / 255,
    ];
  };

  // Preparar escena 3D inmediatamente al cargar
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.display = 'block';
      document.body.style.backgroundColor = 'white';
    }
    
    setScene3DReady(true);
  }, []);

  // Handler optimizado para la transición sin retrasos
  const handleIntroComplete = (finalImageUrl) => {
    if (transitionInProgressRef.current) return;
    transitionInProgressRef.current = true;
    
    console.log("Iniciando transición sin retrasos");
    
    setTransitionImageUrl(finalImageUrl);
    setInitialTransition(true);
    
    setTimeout(() => {
      setShowIntro(false);
    }, 300);
  };

  // Callback instantáneo para cuando el carrusel está listo
  const handleCarouselReady = () => {
    console.log("Carrusel listo para animación");
  };

  // Finalizar la transición y mostrar elementos de UI
  const handleTransitionComplete = () => {
    console.log("Transición completada");
    setInitialTransition(false);
    
    if (photographerNameRef.current) {
      photographerNameRef.current.style.opacity = '1';
    }
    
    transitionInProgressRef.current = false;
  };

  // Glitch effect - solo letras y números para mantener tamaño consistente
  const glitchEffect = (element, text) => {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * characters.length);
      element.innerText = characters[randomIndex];
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      element.innerText = text;
    }, 1000);
  };

  // Photographer name hover effect
  useEffect(() => {
    if (showGallery) return;
    
    const nameContainer = document.querySelector('.photographer-name');
    if (!nameContainer) return;

    const handleMouseOver = () => {
      lettersRef.current.forEach((letter, index) => {
        if (!letter) return;
        letter.style.transitionDelay = `${index * 50}ms`;
        letter.style.color = '#00ff00';
        letter.style.textShadow = '0 0 2px rgba(0, 255, 0, 0.5), 0 0 3px rgba(0, 255, 0, 0.3)';
        glitchEffect(letter, photographerName[index]);
      });
      
      nameContainer.style.letterSpacing = '-1px';
    };

    const handleMouseOut = () => {
      lettersRef.current.forEach(letter => {
        if (!letter) return;
        letter.style.color = 'black';
        letter.style.textShadow = 'none';
      });
      
      nameContainer.style.letterSpacing = '-2px';
    };

    nameContainer.addEventListener('mouseover', handleMouseOver);
    nameContainer.addEventListener('mouseout', handleMouseOut);

    return () => {
      nameContainer.removeEventListener('mouseover', handleMouseOver);
      nameContainer.removeEventListener('mouseout', handleMouseOut);
    };
  }, [showGallery, photographerName]);

  // FIX: Function to return to main carousel - reset color to white
  const handleBackToCarousel = () => {
    setShowGallery(false);
    setCollection("");
    setSelectedProjectInfo(null);
    setThemeColors(null); // Limpiar colores del tema
    setBgColor('#ffffff'); // FIX: Resetear explícitamente a blanco
  };

  // Handlers memoizados para evitar re-renders
  const handleProjectInfoChange = useCallback((projectInfo) => {
    console.log("Project info changed:", projectInfo);
    setSelectedProjectInfo(projectInfo);
  }, []);

  const handleUserInactivity = useCallback((inactive) => {
    setIsUserInactive(inactive);
    console.log(`🎯 Usuario ${inactive ? 'INACTIVO' : 'ACTIVO'} - Carrusel ${inactive ? 'PAUSADO' : 'ACTIVO'}`);
  }, []);

  const handleScreensaverDismiss = useCallback(() => {
    console.log("Screensaver dismissed by user activity");
    setIsUserInactive(false);
  }, []);

  // Determine content to show
  const renderContent = () => {
    if (!showGallery) {
      // 3D carousel
      return (
        <Canvas
          camera={{
            fov: 65,
            position: [0, 0, 40],
          }}
          onCreated={({ gl }) => {
            gl.setClearColor("white");
            glRef.current = gl;
          }}
        >
          <About1 
            setIndex={setIndex} 
            setShowCollection={() => {setShowGallery(!showGallery)}} 
            setCollection={(index) => { setCollection(index);}}
            setActiveGalleryColor={setBgColor}
            setSelectedProjectInfo={handleProjectInfoChange}
            initialTransition={initialTransition}
            initialImageUrl={transitionImageUrl}
            onTransitionComplete={handleTransitionComplete}
            onCarouselReady={handleCarouselReady}
            isUserInactive={isUserInactive}
          />
        </Canvas>
      );
    } else {
      // Check for special collections
      const collectionType = specialCollections[collection];
      
      // Loading component
      const loadingComponent = (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100vh' 
        }}>
          <CircularProgress />
        </Box>
      );
      
      // Display appropriate gallery
      if (collectionType === "ana-livni") {
        return (
          <Suspense fallback={loadingComponent}>
            <AnaLivniGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else if (collectionType === "blua") {
        return (
          <Suspense fallback={loadingComponent}>
            <BluaGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else if (collectionType === "maison") {
        return (
          <Suspense fallback={loadingComponent}>
            <MaisonGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else if (collectionType === "caldo") {
        return (
          <Suspense fallback={loadingComponent}>
            <CaldoGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else if (collectionType === "vestimeteo") {
        return (
          <Suspense fallback={loadingComponent}>
            <VestimeTeoGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else if (collectionType === "plata") {
        return (
          <Suspense fallback={loadingComponent}>
            <PlataGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else if (collectionType === "lenoir") {
        return (
          <Suspense fallback={loadingComponent}>
            <LenoirGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else if (collectionType === "kaboa") {
        return (
          <Suspense fallback={loadingComponent}>
            <KaboaGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else if (collectionType === "amour") {
        return (
          <Suspense fallback={loadingComponent}>
            <AmourGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else if (collectionType === "marcos") {
        return (
          <Suspense fallback={loadingComponent}>
            <MarcosGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else if (collectionType === "pasarela") {
        return (
          <Suspense fallback={loadingComponent}>
            <PasarelaGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else if (collectionType === "identidad") {
        return (
          <Suspense fallback={loadingComponent}>
            <IdentidadGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else {
        return (
          <MyWaySection 
            onBack={handleBackToCarousel}
            collection={collection}
          />
        );
      }
    }
  };

  // RENDERIZADO CONDICIONAL: Si es móvil, mostrar Coming Soon
  if (isMobile) {
    return <MobileComingSoon />;
  }

  // Si no es móvil, mostrar la aplicación completa
  return (
    <>
      {/* Global styles */}
      <GlobalStyle />
      
      {/* Componente de cursor global (ahora inactivo) */}
      <CursorManager isOffCanvasOpen={isOffCanvasOpen} />
      
      {/* SCREENSAVER BANNER ULTRA SMOOTH - 20 SEGUNDOS */}
      <ScreensaverBanner 
        isActive={screensaverActive}
        timeout={20000} // 20 SEGUNDOS exactos
        onDismiss={handleScreensaverDismiss}
        onInactivityChange={handleUserInactivity}
        text={{
          line1: "enzo cimillo",
          line2: "fashion photographer"
        }}
      />
      
      {/* Mostrar IntroVideo solo mientras es necesario */}
      {showIntro && (
        <IntroVideo onIntroComplete={handleIntroComplete} />
      )}
      
      {/* Contenedor principal */}
      <ContainerCloud 
        className="containerCloud" 
        ref={containerRef}
      >
        {/* Photographer name */}
        {!showGallery && (
          <PhotographerName 
            className="photographer-name"
            ref={photographerNameRef}
          >
            {photographerName.split('').map((letter, index) => (
              <Letter 
                key={index} 
                className="letter" 
                ref={el => lettersRef.current[index] = el}
              >
                {letter}
              </Letter>
            ))}
          </PhotographerName>
        )}

        {renderContent()}

        {/* Información del proyecto - ACTUALIZADA PARA USAR COLORES DEL TEMA */}
        {!showGallery && (
          <ProjectInfoContainer 
            isVisible={!!selectedProjectInfo} 
            textColor={themeColors?.text || '#000000'} // Usar el color de texto del tema
          >
            {selectedProjectInfo && (
              <>
                <ProjectName>
                  <GlitchText 
                    text={selectedProjectInfo.name || 'UNTITLED'} 
                  />
                </ProjectName>
                <ProjectYear>
                  <GlitchText 
                    text={selectedProjectInfo.year || '2024'} 
                  />
                </ProjectYear>
              </>
            )}
          </ProjectInfoContainer>
        )}

        <Footer 
          onShowChange={handleOffCanvasState} 
          onGalleryToggle={null}
        />
      </ContainerCloud>
      
      {/* Vercel Analytics */}
      <Analytics />
    </>
  );
}

export default App;
