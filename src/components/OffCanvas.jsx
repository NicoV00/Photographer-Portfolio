import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const OffCanvas = ({ name, ...props }) => {
    const [show, setShow] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [mouseInsideCanvas, setMouseInsideCanvas] = useState(false); // Track if mouse is inside canvas
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const cursorRef = useRef(null); // Reference for custom cursor

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

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
    }, [show, mouseInsideCanvas]); // Add mouseInsideCanvas to the dependency array

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
          onClick={handleOverlayClick} // Handle click on the overlay
        >
          <div 
            ref={canvasRef} 
            style={styles.canvas} 
            onMouseEnter={handleMouseEnterCanvas} // Set mouse inside state to true
            onMouseLeave={handleMouseLeaveCanvas} // Set mouse inside state to false
          >
            <div style={styles.header}>
              <h2>Offcanvas</h2>
              <button onClick={handleClose} style={styles.closeButton}>X</button>
            </div>
            <div style={styles.body}>
              Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
            </div>
          </div>
        </div>

        <div id="custom-cursor2" ref={cursorRef} style={styles.customCursor}>✖</div> {/* Custom cursor */}
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
    border: '2px solid black', // Initial curved border
    borderRadius: '20px', // Moderately rounded borders
    backgroundColor: 'transparent', // Transparent background
    color: 'black', // Text color
    fontFamily: 'Courier New, Courier, monospace',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'border 0.3s ease, background-color 0.3s ease, border-radius 0.3s ease',
  },
  infoButtonHover: {
    border: '2px solid black', // Maintain the border on hover
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Background color on hover
    borderRadius: '0', // Change to square borders on hover
  },
  customCursor: {
    position: 'fixed',
    width: '20px',
    height: '20px',
    backgroundColor: 'white',
    color: 'black',
    border: '2px solid black',
    borderRadius: '0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none', // Ignore interactions with the cursor
    zIndex: 1000,
    visibility: 'hidden', // Hidden by default
  }
};

export default OffCanvas;
