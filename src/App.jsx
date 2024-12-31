import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import About1 from './components/About1';
import Footer from './components/Footer';
import OffCanvas from './components/OffCanvas';
import { OverlayPy } from './components/OverlayPy';

function App() {
  const photographerName = "ENZO"; // Nombre del fotógrafo
  const lettersRef = useRef([]); // Referencia a las letras del nombre
  const [showDiv, setShowDiv] = useState(false);
  const [index, setIndex] = useState('false');
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);

  const images = [
    "./images/blua_constelaciones_finales.jpg",
    "./images/LF-11.jpg",
    "./images/LFF-15.jpg",
    "./images/D2F-10.jpg",
    "./images/PLATA-2.jpg",
    "./images/L-5.jpg",
    "./images/L-8.jpg",
  ];

  // Función para controlar el estado de la off-canvas
  const handleOffCanvasState = (show) => {
    setIsOffCanvasOpen(show);
    console.log('OffCanvas state in App:', show);
  };

  // Efecto glitch para las letras del nombre
  const glitchEffect = (element, text) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * characters.length);
      element.innerText = characters[randomIndex];
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      element.innerText = text; // Restablece el texto original después del efecto
    }, 1000); // Duración del efecto de glitch
  };

  useEffect(() => {
    const nameContainer = document.querySelector('.photographer-name');

    // Evento mouseover para aplicar el efecto de glitch a cada letra
    nameContainer.addEventListener('mouseover', () => {
      lettersRef.current.forEach((letter, index) => {
        letter.style.transitionDelay = `${index * 50}ms`;
        letter.style.color = 'rgba(255, 0, 0, 1)'; // Cambia el color a rojo al pasar el mouse

        // Aplica el efecto de glitch
        glitchEffect(letter, photographerName[index]);
      });
    });

    // Evento mouseout para restaurar el color de las letras
    nameContainer.addEventListener('mouseout', () => {
      lettersRef.current.forEach(letter => {
        letter.style.color = 'black'; // Vuelve al color original (negro)
      });
    });

    return () => {
      nameContainer.removeEventListener('mouseover', () => {});
      nameContainer.removeEventListener('mouseout', () => {});
    };
  }, []);

  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');

    // Evento de movimiento del mouse para actualizar la posición del cursor personalizado
    document.addEventListener('mousemove', (e) => {
      const x = e.pageX;
      const y = e.pageY;

      // Calculamos un ángulo de rotación basado en las coordenadas del cursor
      const angle = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2) * (180 / Math.PI);

      // Aplicamos la posición y el ángulo de rotación
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      cursor.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`; // Añadimos la rotación

    });

    return () => {
      document.removeEventListener('mousemove', () => {});
    };
  }, []);

  return (
    <div className="containerCloud">
      {/* Nombre del fotógrafo */}
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

      <Canvas
        camera={{
          fov: 64,
          position: [0, 0, 35],
        }}
      >
        <About1 setIndex={setIndex} setShowDiv={setShowDiv} />
      </Canvas>

      {/*<OverlayPy image={images[index]} showDiv={showDiv} /> */}
      <Footer onShowChange={handleOffCanvasState} />

      {/* Cursor personalizado */}
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