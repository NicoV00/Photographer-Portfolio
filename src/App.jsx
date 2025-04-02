import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import About1 from './components/About1';
import Footer from './components/Footer';
import OffCanvas from './components/OffCanvas';
import { OverlayPy } from './components/OverlayPy';
import { CircularProgress, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

// Lazy loaded galleries - actualizadas a nuevas rutas
const AnaLivniGallery = lazy(() => import('./components/Galleries/AnaLivniGallery'));
const BluaGallery = lazy(() => import('./components/Galleries/BluaGallery'));
const MaisonGallery = lazy(() => import('./components/Galleries/MaisonGallery'));
const VestimeTeoGallery = lazy(() => import('./components/Galleries/VestimeTeoGallery')); // Nueva importación

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
    cursor: 'none'
  }
});

// Container for the entire app
const ContainerCloud = styled(Box)({
  position: 'relative',
  width: '100vw',
  height: '100vh'
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
  transition: 'letter-spacing 0.3s ease'
});

// Style for individual letters
const Letter = styled('span')({
  display: 'inline-block',
  transition: 'color 0.2s ease, text-shadow 0.3s ease',
  marginRight: '0.5px'
});

// Custom cursor
const CustomCursor = styled(Box)({
  position: 'fixed',
  width: '15px',
  height: '15px',
  backgroundColor: 'rgb(255, 0, 0)',
  borderRadius: '2px',
  pointerEvents: 'none',
  transform: 'translate(-50%, -50%)',
  transition: 'transform 0.1s',
  willChange: 'transform',
  zIndex: 1000
});

// Define points for the custom cursor
const Point = styled('div')({
  position: 'absolute',
  width: '4px',
  height: '4px',
  backgroundColor: 'black',
  borderRadius: '50%'
});

function App() {
  const photographerName = "enzo";
  const lettersRef = useRef([]);
  const [showDiv, setShowDiv] = useState(false);
  const [index, setIndex] = useState('false');
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [collection, setCollection] = useState("");

  // Collection mapping
  const specialCollections = {
    "./images/S-1.jpg": "ana-livni",
    "./images/blua_constelaciones_finales.jpg": "blua",
    "./images/MDLST/MDLST-1.png": "maison",
    "./images/TEO/V1.jpg": "vestimeteo" // Nueva entrada para VestimeTeo
  };

  const handleOffCanvasState = (show) => {
    setIsOffCanvasOpen(show);
  };

  // Simplified glitch effect - optimized for performance
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
    // Only apply if we're not showing a gallery
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

  // Optimized custom cursor with throttling for better performance
  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;
    
    // Throttle the mousemove event for better performance
    let lastTime = 0;
    const throttleTime = 10; // Only update every 10ms (instead of every frame)
    
    const handleMouseMove = (e) => {
      const currentTime = Date.now();
      if (currentTime - lastTime < throttleTime) return;
      
      lastTime = currentTime;
      const x = e.pageX;
      const y = e.pageY;
      const angle = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2) * (180 / Math.PI);
      
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      cursor.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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
      } else if (collectionType === "vestimeteo") {
        return (
          <Suspense fallback={loadingComponent}>
            <VestimeTeoGallery onBack={handleBackToCarousel} />
          </Suspense>
        );
      } else {
        // Fallback for collections without specific component
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
            <button 
              onClick={handleBackToCarousel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
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
      
      <ContainerCloud className="containerCloud">
        {/* Only show photographer name when not in gallery */}
        {!showGallery && (
          <PhotographerName className="photographer-name">
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

        {/* Custom cursor */}
        <CustomCursor
          id="custom-cursor"
          sx={{
            visibility: isOffCanvasOpen ? 'hidden' : 'visible'
          }}
        >
          <Point id="point1" className="point" sx={{ top: 0, left: 0 }} />
          <Point id="point2" className="point" sx={{ top: 0, right: 0 }} />
          <Point id="point3" className="point" sx={{ bottom: 0, left: 0 }} />
          <Point id="point4" className="point" sx={{ bottom: 0, right: 0 }} />
        </CustomCursor>
      </ContainerCloud>
    </>
  );
}

export default App;
