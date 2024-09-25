import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const OffCanvas = ({ name, ...props }) => {
    const [show, setShow] = useState(false);
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);

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

    return (
      <>
        <button style={{ width: '100px', backgroundColor: 'black' }} onClick={handleShow}>
          {name}
        </button>

        <div ref={overlayRef} style={styles.overlay}>
          <div ref={canvasRef} style={styles.canvas}>
            <div style={styles.header}>
              <h2>Offcanvas</h2>
              <button onClick={handleClose} style={styles.closeButton}>X</button>
            </div>
            <div style={styles.body}>
              Some text as placeholder. In real life you can have the elements you
              have chosen. Like, text, images, lists, etc.
            </div>
          </div>
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
    width: '900px',
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
};

export default OffCanvas;
