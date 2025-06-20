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
      fontFamily: 'Helvetica-Bold',
      src: 'url("/fonts/Helvetica-Bold.ttf") format("truetype")',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fontDisplay: 'swap',
    }
  ]
});

// Hide default cursor
const BodyStyle = styled('style')({
  'body': {
    cursor: 'none !important',
    backgroundColor: '#000',
    transition: 'background-color 0.5s ease-out'
  }
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

// Project info container
const ProjectInfoContainer = styled(Box)(({ isVisible }) => ({
  position: 'fixed',
  bottom: '20px',
  left: '50%',
  textAlign: 'center',
  zIndex: 1000,
  pointerEvents: 'none',
  color: '#000',
  fontFamily: '"Helvetica", Helvetica, Arial, sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  lineHeight: '1.4',
  textShadow: '0 0 10px rgba(255,255,255,0.8)',
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

  const handleOffCanvasState = (show) => {
    setIsOffCanvasOpen(show);
  };

  useEffect(() => {
    const fallback = '#ffffff';
    const hex = bgColor?.main || fallback;

    console.log('||||| ---> bgColor RECIBIDO:', hex);

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
    
    // Forzar cursor hidden
    const enforceHiddenCursor = () => {
      document.body.style.cursor = 'none';
      
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (getComputedStyle(el).cursor !== 'none') {
          el.style.cursor = 'none';
        }
      });
    };
    
    enforceHiddenCursor();
    
    const cursorInterval = setInterval(enforceHiddenCursor, 2000);
    
    return () => clearInterval(cursorInterval);
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

  // Function to return to main carousel
  const handleBackToCarousel = () => {
    setShowGallery(false);
    setCollection("");
    setSelectedProjectInfo(null);
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
            fov: 64,
            position: [0, 0, 45],
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

  return (
    <>
      {/* Global styles */}
      <GlobalStyle />
      <BodyStyle />
      
      {/* Componente de cursor global */}
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

        {/* Información del proyecto */}
        {!showGallery && (
          <ProjectInfoContainer isVisible={!!selectedProjectInfo}>
            {selectedProjectInfo && (
              <>
                <ProjectName>
                  {selectedProjectInfo.name || 'UNTITLED'}
                </ProjectName>
                <ProjectYear>
                  {selectedProjectInfo.year || '2024'}
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
    </>
  );
}

export default App;
