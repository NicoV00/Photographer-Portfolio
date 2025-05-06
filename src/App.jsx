import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import About1 from './components/About1';
import Footer from './components/Footer';
import OffCanvas from './components/OffCanvas';
import { CircularProgress, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import IntroVideo from './components/IntroVideo';
import CursorManager from './components/CursorManager';

// Lazy loaded galleries - pero iniciar precarga inmediatamente
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
const PasarelaGallery = lazy(() => import('./components/Galleries/PasarelaGallery')); // Añadir PasarelaGallery

// Iniciar precarga de componentes clave inmediatamente
import('./components/Galleries/BluaGallery');

// Font loading and global styles
const GlobalStyle = styled('style')({
  '@font-face': {
    fontFamily: 'Medium',
    src: 'url("/fonts/Medium.otf") format("opentype")',
    fontWeight: 'normal',
    fontStyle: 'normal',
  }
});

// Hide default cursor
const BodyStyle = styled('style')({
  'body': {
    cursor: 'none !important', // Forzar el cursor oculto en todo momento
    backgroundColor: '#000',
    transition: 'background-color 0.5s ease-out'
  }
});

// Container for the entire app - VISIBLE INMEDIATAMENTE
const ContainerCloud = styled(Box)({
  position: 'relative',
  width: '100vw',
  height: '100vh',
  opacity: 1, // Visible inmediatamente para evitar retrasos
});

// Photographer name with rotation and styling
const PhotographerName = styled(Box)({
  position: 'absolute',
  top: '160px', 
  fontFamily: '"Medium", Helvetica, sans-serif',
  fontSize: '35px',
  fontWeight: 'bold',
  color: 'black',
  transform: 'rotate(-90deg)',
  transformOrigin: 'top left',
  zIndex: 10,
  letterSpacing: '0px',
  transition: 'letter-spacing 0.3s ease, opacity 0.5s ease',
  opacity: 0, // Inicialmente invisible
});

// Style for individual letters
const Letter = styled('span')({
  display: 'inline-block',
  transition: 'color 0.2s ease, text-shadow 0.3s ease',
  marginRight: '0.5px'
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
  
  // Estados para la transición
  const [initialTransition, setInitialTransition] = useState(false);
  const [transitionImageUrl, setTransitionImageUrl] = useState(null);
  const transitionInProgressRef = useRef(false);
  const [scene3DReady, setScene3DReady] = useState(false);

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
    "./images/PASARELA/PASARELA MUF-12(PORTADA).jpg": "pasarela" // Añadir PASARELA
  };

  const handleOffCanvasState = (show) => {
    setIsOffCanvasOpen(show);
  };

  // Preparar escena 3D inmediatamente al cargar
  useEffect(() => {
    if (containerRef.current) {
      // Todo visible desde el principio para evitar retrasos
      containerRef.current.style.display = 'block';
      document.body.style.backgroundColor = 'white';
    }
    
    // Notificar que la escena 3D está lista
    setScene3DReady(true);
    
    // IMPORTANTE: Forzar a que el cursor siempre sea 'none'
    const enforceHiddenCursor = () => {
      document.body.style.cursor = 'none';
      
      // Aplicar a todos los elementos
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (getComputedStyle(el).cursor !== 'none') {
          el.style.cursor = 'none';
        }
      });
    };
    
    // Ejecutar inicialmente
    enforceHiddenCursor();
    
    // Y también periódicamente para asegurar que los elementos dinámicos también lo reciban
    const cursorInterval = setInterval(enforceHiddenCursor, 2000);
    
    return () => clearInterval(cursorInterval);
  }, []);

  // Handler optimizado para la transición sin retrasos
  const handleIntroComplete = (finalImageUrl) => {
    // Evitar inicios múltiples
    if (transitionInProgressRef.current) return;
    transitionInProgressRef.current = true;
    
    console.log("Iniciando transición sin retrasos");
    
    // Iniciar la animación inmediatamente
    setTransitionImageUrl(finalImageUrl);
    setInitialTransition(true);
    
    // Ocultar el intro completamente después de un breve momento
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
    
    // Mostrar elementos de UI
    if (photographerNameRef.current) {
      photographerNameRef.current.style.opacity = '1';
    }
    
    transitionInProgressRef.current = false;
  };

  // Glitch effect
  const glitchEffect = (element, text) => {
    const characters = "we@#$asn!@dvcv0123456789#$%^&*";
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
      
      nameContainer.style.letterSpacing = '1px';
    };

    const handleMouseOut = () => {
      lettersRef.current.forEach(letter => {
        if (!letter) return;
        letter.style.color = 'black';
        letter.style.textShadow = 'none';
      });
      
      nameContainer.style.letterSpacing = '0px';
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
  };

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
        >
          <About1 
            setIndex={setIndex} 
            setShowCollection={() => {setShowGallery(!showGallery)}} 
            setCollection={(index) => { setCollection(index);}}
            setActiveGalleryColor={null}
            // Props para la transición
            initialTransition={initialTransition}
            initialImageUrl={transitionImageUrl}
            onTransitionComplete={handleTransitionComplete}
            onCarouselReady={handleCarouselReady}
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
      } else if (collectionType === "pasarela") { // Añadir case para PASARELA
        return (
          <Suspense fallback={loadingComponent}>
            <PasarelaGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else {
        // Fallback
        return (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100vh',
            padding: '20px'
          }}>
            <h2>Proyecto en desarrollo</h2>
            <p>Este proyecto aún no tiene una galería específica.</p>
            <p>Ruta de imagen: {collection}</p>
            <button 
              onClick={handleBackToCarousel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'none', // Asegurar cursor invisible incluso en botones
                marginTop: '20px'
              }}
            >
              Volver al carrusel
            </button>
          </Box>
        );
      }
    }
  };

  return (
    <>
      {/* Global styles */}
      <GlobalStyle />
      <BodyStyle />
      
      {/* Componente de cursor global - siempre presente */}
      <CursorManager isOffCanvasOpen={isOffCanvasOpen} />
      
      {/* Mostrar IntroVideo solo mientras es necesario */}
      {showIntro && (
        <IntroVideo onIntroComplete={handleIntroComplete} />
      )}
      
      {/* Contenedor principal - SIEMPRE VISIBLE */}
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

        <Footer 
          onShowChange={handleOffCanvasState} 
          onGalleryToggle={null}
        />
      </ContainerCloud>
    </>
  );
}

export default App;
