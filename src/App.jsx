import { useEffect, useRef } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import About1 from './components/About1';
import Footer from './components/footer';
import OffCanvas from './components/OffCanvas';

function App() {
  const photographerName = "Enzo Cimilo";
  const lettersRef = useRef([]);
  const cursorRef = useRef(null);
  
  useEffect(() => {
    const handleMouseOver = () => {
      lettersRef.current.forEach((letter, index) => {
        letter.style.transitionDelay = `${index * 50}ms`; // Retraso por letra
        letter.style.color = 'rgba(255, 0, 0, 1)'; // Color al pasar el mouse (rojo)
      });
    };

    const handleMouseOut = () => {
      lettersRef.current.forEach(letter => {
        letter.style.color = 'black'; // Color original al salir
        letter.style.transitionDelay = '0ms'; // Restablecer retraso
      });
    };

    const nameContainer = document.querySelector('.photographer-name');
    nameContainer.addEventListener('mouseover', handleMouseOver);
    nameContainer.addEventListener('mouseout', handleMouseOut);

    return () => {
      nameContainer.removeEventListener('mouseover', handleMouseOver);
      nameContainer.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');

    document.addEventListener('mousemove', (e) => {
      const x = e.pageX;
      const y = e.pageY;

      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;

      // Efecto de seguimiento suave
      const followDelay = 30; // Retraso en milisegundos
      cursor.style.transition = `transform ${followDelay}ms ease-out`;
      cursor.style.transform = `translate(-50%, -50%) translate(${Math.sin(Date.now() / 100) * 2}px, ${Math.cos(Date.now() / 100) * 2}px)`;
    });

    const rotateCursor = () => {
      cursor.style.transform += ' rotate(1deg)'; // Gira el cursor
    };

    const interval = setInterval(rotateCursor, 16); // Aproximadamente 60 FPS

    return () => {
      clearInterval(interval); // Limpiar el intervalo al desmontar
    };
  }, []);

  return (
    <div className="container">
      <div className="photographer-name">
        {photographerName.split('').map((letter, index) => (
          <span 
            key={index} 
            className="letter" 
            ref={el => lettersRef.current[index] = el} // Guardar referencia de cada letra
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Canvas de Three.js */}
      <Canvas
        camera={{
          fov: 64,
          position: [0, 0, 50],
        }}
      >
        <About1 />
      </Canvas>
      <Footer />
      <div id="custom-cursor">
        <div className="point" id="point1"></div>
        <div className="point" id="point2"></div>
        <div className="point" id="point3"></div>
        <div className="point" id="point4"></div>
      </div>
    </div>
  );
}

export default App;
