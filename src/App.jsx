import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import About1 from './components/About1';
import Footer from './components/Footer';
import OffCanvas from './components/OffCanvas';
import { OverlayPy } from './components/OverlayPy';
import Gallery from './components/gallery/Gallery';

function App() {
  const photographerName = "enzo";
  const lettersRef = useRef([]);
  const [showDiv, setShowDiv] = useState(false);
  const [index, setIndex] = useState('false');
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [collection, setCollection] = useState("");
  const [matchedCollection, setMatchedCollection] = useState(null);

  const images = [
    {
      "collection-1": [
        "./images/LF-11.jpg",
        "./images/LFF-15.jpg",
        "./images/D2F-10.jpg",
        "./images/L-5.jpg",
        "./images/L-8.jpg",
      ]
    },
    {
      "collection-5": [
        "./images/blua_constelaciones_finales.jpg",
        "./images/PLATA-2.jpg",
        "./images/L-5.jpg",
        "./images/L-8.jpg",
      ]
    }
  ]

  const handleOffCanvasState = (show) => {
    setIsOffCanvasOpen(show);
    console.log('OffCanvas state in App:', show);
  };

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

  useEffect(() => {
    const nameContainer = document.querySelector('.photographer-name');

    const handleMouseOver = () => {
      lettersRef.current.forEach((letter, index) => {
        letter.style.transitionDelay = `${index * 50}ms`;
        // Cambio al color verde neón específico
        letter.style.color = '#00ff00';
        // Añadir un efecto de resplandor SUTIL
        letter.style.textShadow = '0 0 2px rgba(0, 255, 0, 0.5), 0 0 3px rgba(0, 255, 0, 0.3)';
        // Conservar el efecto glitch
        glitchEffect(letter, photographerName[index]);
      });
      
      // Aplicar el espaciado aumentado a las letras
      nameContainer.style.letterSpacing = '1px';
    };

    const handleMouseOut = () => {
      lettersRef.current.forEach(letter => {
        letter.style.color = 'black';
        // Eliminar el efecto de resplandor cuando sale el mouse
        letter.style.textShadow = 'none';
      });
      
      // Restablecer el espaciado original
      nameContainer.style.letterSpacing = '0px';
    };

    nameContainer.addEventListener('mouseover', handleMouseOver);
    nameContainer.addEventListener('mouseout', handleMouseOut);

    return () => {
      nameContainer.removeEventListener('mouseover', handleMouseOver);
      nameContainer.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');

    const handleMouseMove = (e) => {
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

  useEffect(() => {
    const foundCollection = images.find(obj =>
      Object.values(obj)[0].includes(collection)
    );
  
    if (foundCollection) {
      setMatchedCollection(Object.values(foundCollection)[0]); // Save the matched list
    } else {
      setMatchedCollection([]); // Reset if no match is found
    }
  
    console.log("Collection:", collection);
    console.log("Matched Collection:", foundCollection ? Object.values(foundCollection)[0] : "Not found");
  }, [collection]);

  return (
    <div className="containerCloud">
      <div className="photographer-name">
        {photographerName.split('').map((letter, index) => (
          <span 
            key={index} 
            className="letter" 
            ref={el => lettersRef.current[index] = el}
          >
            {letter}
          </span>
        ))}
      </div>

      {!showGallery ? (
        <Canvas
          camera={{
            fov: 64,
            position: [0, 0, 45],
          }}
        >
          <About1 setIndex={setIndex} setShowCollection={() => {setShowGallery(!showGallery)}} setCollection={(index) => { setCollection(index);}} />
        </Canvas>
      ) : (
        <Gallery images={matchedCollection} />
      )}

      <Footer 
        onShowChange={handleOffCanvasState} 
        onGalleryToggle={() => setShowGallery(!showGallery)}
      />

      <div 
        id="custom-cursor"
        style={{
          visibility: isOffCanvasOpen ? 'hidden' : 'visible'
        }}
      >
        <div id="point1" className="point"></div>
        <div id="point2" className="point"></div>
        <div id="point3" className="point"></div>
        <div id="point4" className="point"></div>
      </div>
    </div>
  );
}

export default App;