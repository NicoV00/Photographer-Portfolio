import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const OffCanvas = ({ name, onShowChange, ...props }) => {
    const [show, setShow] = useState(false);
    const [mouseInsideCanvas, setMouseInsideCanvas] = useState(false);
    const [glitchedText, setGlitchedText] = useState('');
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const cursorRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleShow = () => {
        setShow(true);
        if (onShowChange) onShowChange(true);
    };

    const handleClose = () => {
        setShow(false);
        if (onShowChange) onShowChange(false);
    };

    useEffect(() => {
        if (show) {
            gsap.to(canvasRef.current, { x: 0, duration: 0.5, ease: 'power2.out' });
            gsap.to(overlayRef.current, { opacity: 1, visibility: 'visible', duration: 0.5 });
        } else {
            gsap.to(canvasRef.current, { 
                x: '100%', 
                duration: 0.5, 
                ease: 'power2.in', 
                onComplete: () => gsap.set(overlayRef.current, { visibility: 'hidden' }) 
            });
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.5 });
        }
    }, [show]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (cursorRef.current) {
                cursorRef.current.style.left = `${e.pageX}px`;
                cursorRef.current.style.top = `${e.pageY}px`;
                cursorRef.current.style.visibility = show && !mouseInsideCanvas ? 'visible' : 'hidden';
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, [show, mouseInsideCanvas]);

    const handleOverlayClick = (e) => {
        if (canvasRef.current && !canvasRef.current.contains(e.target)) {
            handleClose();
        }
    };

    const handleMouseEnterCanvas = () => setMouseInsideCanvas(true);
    const handleMouseLeaveCanvas = () => setMouseInsideCanvas(false);
    const handleCursorClick = () => {
        if (!mouseInsideCanvas) handleClose();
    };

    // Efecto de glitch en el texto (rápido y con muchos cambios)
    useEffect(() => {
        const originalText = `#############################################
#               CONTACT INFO                #
#############################################

Photographer: Enzo Cimillo
Location: Montevideo, Uruguay

---------------------------------------------
|  LinkedIn:                               |
|  https://www.linkedin.com/in/enzocimillo |
|  Instagram:                              |
|  https://instagram.com/enzocimillo       |
|  Email:                                  |
|  enzo.cimillo@email.com                  |
|  Phone:                                  |
|  +598 1234 5678                          |
---------------------------------------------

Press "✖" to close this contact modal.`;

        let glitchInterval;
        let index = 0;

        const glitchEffect = () => {
            const glitchText = originalText.split('');
            
            // Realiza múltiples cambios de caracteres aleatorios
            for (let i = 0; i < 5; i++) { // Cambiar 5 caracteres por intervalo
                const randomIndex = Math.floor(Math.random() * glitchText.length);
                glitchText[randomIndex] = String.fromCharCode(33 + Math.floor(Math.random() * 94)); // Caracter aleatorio
            }
            
            setGlitchedText(glitchText.join(''));

            index = (index + 1) % originalText.length;
        };

        // Cambia el texto más rápido y con mayor frecuencia
        glitchInterval = setInterval(glitchEffect, 20); // 20ms para cambios rápidos

        return () => clearInterval(glitchInterval);
    }, []);

    return (
        <>
            <button 
                style={{
                    ...styles.infoButton,
                    border: isHovered ? '1px solid #000' : '1px solid #ccc',
                    color: isHovered ? 'black' : 'black',
                }} 
                onClick={handleShow}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
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
                    <div style={styles.body}>
                        <pre style={styles.asciiText}>
                            {glitchedText}
                        </pre>
                    </div>
                </div>
            </div>

            <div 
                id="custom-cursor2" 
                ref={cursorRef} 
                style={{
                    ...styles.customCursor,
                    backgroundColor: mouseInsideCanvas ? 'black' : 'white',
                    color: mouseInsideCanvas ? 'white' : 'black',
                }} 
                onClick={handleCursorClick}
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
        transform: 'translateX(100%)',
        position: 'relative',
        fontFamily: 'Courier New, Courier, monospace', // Estilo monoespaciado tipo terminal
    },
    body: {
        marginTop: '20px',
    },
    infoButton: {
        margin: '0 4px',
        padding: '6px 13px',
        border: '1px solid #ccc',
        borderRadius: '2px',
        backgroundColor: 'transparent',
        color: 'black',
        fontFamily: 'Courier New, Courier, monospace',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'border 0.3s ease, background-color 0.3s ease, border-radius 0.3s ease, color 0.3s ease',
        position: 'relative',
        top: '-10px',
    },
    customCursor: {
        position: 'fixed',
        width: '30px',
        height: '30px',
        border: '2px solid black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 1000,
        visibility: 'hidden',
        cursor: 'none',
    },
    asciiText: {
        color: '#0f0',
        backgroundColor: 'black',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '16px',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap',
    }
};

export default OffCanvas;
