import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const OffCanvas = ({ name, onShowChange, ...props }) => {
    const [show, setShow] = useState(false);
    const [mouseInsideCanvas, setMouseInsideCanvas] = useState(false); // Track if mouse is inside canvas
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const cursorRef = useRef(null); // Reference for custom cursor
    const [isHovered, setIsHovered] = useState(false); // State to track hover

    const handleShow = () => {setShow(true); if (onShowChange) onShowChange(true);};
    const handleClose = () => {setShow(false); if (onShowChange) onShowChange(false);};

    useEffect(() => {
        if (show) {
            // Animate the off-canvas in
            gsap.to(canvasRef.current, { 
                x: 0, 
                duration: 0.5, 
                ease: 'power2.out' 
            });
            gsap.to(overlayRef.current, { 
                opacity: 1, 
                visibility: 'visible', 
                duration: 0.5 
            });
        } else {
            // Animate the off-canvas out
            gsap.to(canvasRef.current, { 
                x: '100%', 
                duration: 0.5, 
                ease: 'power2.in',
                onComplete: () => {
                    // Once the off-canvas is out, hide the overlay
                    gsap.set(overlayRef.current, { visibility: 'hidden' });
                }
            });
            gsap.to(overlayRef.current, { 
                opacity: 0, 
                duration: 0.5 
            });
        }
    }, [show]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (cursorRef.current) {
                cursorRef.current.style.left = `${e.pageX}px`;
                cursorRef.current.style.top = `${e.pageY}px`;
                cursorRef.current.style.visibility = (show && !mouseInsideCanvas) ? 'visible' : 'hidden'; // Show/hide the custom cursor based on state
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [show, mouseInsideCanvas]);

    const handleOverlayClick = (e) => {
        // Close the modal if clicking outside of it
        if (canvasRef.current && !canvasRef.current.contains(e.target)) {
            handleClose();
        }
    };

    const handleMouseEnterCanvas = () => {
        setMouseInsideCanvas(true); // Mouse enters the canvas
    };

    const handleMouseLeaveCanvas = () => {
        setMouseInsideCanvas(false); // Mouse leaves the canvas
    };

    const handleCursorClick = () => {
        if (!mouseInsideCanvas) {
            handleClose(); // Close modal if the cursor is outside
        }
    };

    return (
      <>
        <button 
          style={{
            ...styles.infoButton,
            border: isHovered ? '1px solid #000' : '1px solid #ccc', // Cambia el borde en hover
            color: isHovered ? 'black' : 'black', // Cambia el color del texto si lo deseas
          }} 
          onClick={handleShow}
          onMouseEnter={() => setIsHovered(true)} // Activar hover
          onMouseLeave={() => setIsHovered(false)} // Desactivar hover
        >
          I
        </button>

        <div 
          ref={overlayRef} 
          style={styles.overlay} 
          onClick={handleOverlayClick} // Handle click on the overlay
        >
          <div 
            ref={canvasRef} 
            style={styles.canvas} 
            onMouseEnter={handleMouseEnterCanvas} // Set mouse inside state to true
            onMouseLeave={handleMouseLeaveCanvas} // Set mouse inside state to false
          >
            <div style={styles.body}>
              Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
            </div>
          </div>
        </div>

        <div 
          id="custom-cursor2" 
          ref={cursorRef} 
          style={styles.customCursor} 
          onClick={handleCursorClick} // Close modal on cursor click
        >
          ✖
        </div>
      </>
    );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(1, 1, 1, 0.2)',
    opacity: 0,
    visibility: 'hidden',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  canvas: {
    width: '1200px',
    height: '100%',
    color: 'white',
    backgroundColor: 'black',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    transform: 'translateX(100%)', // Initial position (off-screen to the right)
    position: 'relative',
  },
  body: {
    marginTop: '20px',
  },
  infoButton: {
    margin: '0 4px',
    padding: '6px 13px',
    border: '1px solid #ccc',
    borderRadius: '2px', // Moderately rounded borders
    backgroundColor: 'transparent', // Transparent background
    color: 'black', // Text color
    fontFamily: 'Courier New, Courier, monospace',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'border 0.3s ease, background-color 0.3s ease, border-radius 0.3s ease, color 0.3s ease',
    position: 'relative',  // Mantiene la posición original
    top: '-10px',
  },
  customCursor: {
    position: 'fixed',
    width: '30px', // Tamaño más adecuado
    height: '30px',
    backgroundColor: 'white', // Fondo blanco
    color: 'black', // Color de la "X"
    border: '2px solid black', // Borde negro
    borderRadius: '0', // Sin esquinas redondeadas
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px', // Tamaño grande de la "X"
    fontFamily: 'Helvetica, Arial, sans-serif', // Fuente para la "X"
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none', // Elimina las interacciones con el cursor
    zIndex: 1000,
    visibility: 'hidden', // Oculto por defecto
    cursor: 'none', // Oculta el cursor por defecto
  }
};

export default OffCanvas;
