import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const OffCanvas = ({ name, onShowChange, ...props }) => {
    const [show, setShow] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [mouseInsideCanvas, setMouseInsideCanvas] = useState(false);
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const cursorRef = useRef(null); // Ref for custom cursor

    const handleShow = () => setShow(true);
    const handleClose = () => {
        setMouseInsideCanvas(false);
        setShow(false);
        if (onShowChange) onShowChange(false);
    };

    useEffect(() => {
      const cursor = document.getElementById('custom-cursor2');
  
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

    useEffect(() => {
        if (onShowChange) {
            onShowChange(show);
        }

        if (show) {
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
            gsap.to(canvasRef.current, { 
                x: '100%', 
                duration: 0.5, 
                ease: 'power2.in',
                onComplete: () => {
                    gsap.set(overlayRef.current, { visibility: 'hidden' });
                }
            });
            gsap.to(overlayRef.current, { 
                opacity: 0, 
                duration: 0.5 
            });

            if (cursorRef.current) {
                cursorRef.current.style.visibility = 'hidden'; // Hide cursor when offcanvas is closed
            }
        }
    }, [show, onShowChange]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (cursorRef.current) {
                cursorRef.current.style.left = `${e.pageX}px`;
                cursorRef.current.style.top = `${e.pageY}px`;
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const handleOverlayClick = (e) => {
        if (canvasRef.current && !canvasRef.current.contains(e.target)) {
            handleClose();
        }
    };

    const handleMouseEnterCanvas = () => {
        setMouseInsideCanvas(true);
        if (cursorRef.current) {
            cursorRef.current.style.visibility = 'visible'; // Show cursor when mouse is inside
        }
    };

    const handleMouseLeaveCanvas = () => {
        setMouseInsideCanvas(false);
        if (cursorRef.current) {
            cursorRef.current.style.visibility = 'visible'; // Keep cursor visible when mouse leaves canvas
        }
    };

    // Determine cursor style and character based on mouseInsideCanvas
    const cursorStyle = mouseInsideCanvas ? styles.customCursorInside : styles.customCursorOutside;
    const cursorCharacter = mouseInsideCanvas ? ' ' : '✖';

    return (
        <>
            <button 
                style={{
                    ...styles.infoButton,
                    ...(hovered ? styles.infoButtonHover : {})
                }} 
                onClick={handleShow}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                I
            </button>

            <div 
                ref={overlayRef} 
                style={styles.overlay} 
                onClick={handleOverlayClick}
            >
                <div 
                    ref={canvasRef} 
                    style={styles.canvas} 
                    onMouseEnter={handleMouseEnterCanvas} 
                    onMouseLeave={handleMouseLeaveCanvas} 
                >
                    <div style={styles.header}>
                        <h2>Offcanvas</h2>
                    </div>
                    <div style={styles.body}>
                        Some text as placeholder.
                    </div>
                </div>
            </div>

            <div 
                id="custom-cursor2" 
                ref={cursorRef} 
                style={{ ...cursorStyle, visibility: 'visible' }} // Use dynamic style
            >
                {cursorCharacter} {/* Use dynamic character */}
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
        backgroundColor: 'rgba(1, 1, 1, 0.8)',
        opacity: 0,
        visibility: 'hidden',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    canvas: {
        width: '75vw',
        height: '100%',
        color: 'white',
        backgroundColor: 'black',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        transform: 'translateX(100%)',
        position: 'relative',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
    },
    body: {
        marginTop: '20px',
    },
    infoButton: {
        margin: '0 3px',
        padding: '8px 16px',
        border: '2px solid black',
        borderRadius: '25px',
        backgroundColor: 'transparent',
        color: 'black',
        fontFamily: 'Courier New, Courier, monospace',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'border 0.3s ease, background-color 0.3s ease, border-radius 0.3s ease',
    },
    infoButtonHover: {
        border: '2px solid black',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '0',
    },
    customCursorInside: {
        position: 'fixed',
        width: '15px',
        height: '15px',
        backgroundColor: '#ff000080',
        color: 'white',
        borderRadius: '2px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 1000,
        transition: 'transform 0.1s', /* Suavizar el movimiento */
        willChange: 'transform',
    },
    customCursorOutside: {
        position: 'fixed',
        width: '25px',
        height: '25px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        color: 'black',
        border: '1px solid black',
        borderRadius: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 1000,
    },
};

export default OffCanvas;
