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
                    <div className="absolute top-0 left-0 w-full flex justify-center">
                        <p style={{ 
                            fontFamily: 'Helvetica, Arial, sans-serif', 
                            textTransform: 'uppercase', 
                            fontSize: '9rem', 
                            letterSpacing: '1px', 
                            fontWeight: 'bold', 
                            color: 'white',
                        }}>
                            ENZO CIMILLO
                        </p>
                    </div>
                    <div className="absolute top-[15rem] left-8 right-8 flex space-x-8">
                    <div className="flex flex-col justify-start">
                        <p className="font-bold text-sm">(BASED IN MONTEVIDEO, URUGUAY)</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm leading-6 mb-4">
                            I’M A GRAPHIC DESIGNER SPECIALIZING IN CRAFTING STRIKING TITLE SEQUENCES AND LOGOS FOR MUSIC VIDEOS, SHORT FILMS, AND VISUAL PROJECTS. WITH EXPERTISE IN TYPOGRAPHY, MOTION DESIGN, AND ART DIRECTION, I DEVELOP BOLD CONCEPTS THAT ELEVATE STORYTELLING THROUGH DYNAMIC VISUALS. MY FOCUS IS ON COLLABORATING CLOSELY WITH ARTISTS AND FILMMAKERS TO BRING THEIR VISION TO LIFE, CREATING DESIGNS THAT ARE BOTH IMPACTFUL AND VISUALLY COMPELLING.
                        </p>
                        <p className="text-sm leading-6">
                            IN ADDITION TO TITLE DESIGN, I BRING EXTENSIVE EXPERIENCE IN BRANDING FOR ARTISTS, MUSICIANS, AND CREATIVE PROJECTS. FROM DEVELOPING UNIQUE LOGOS TO CRAFTING COHESIVE VISUAL IDENTITIES, I ENSURE EVERY ELEMENT REFLECTS THE CLIENT’S PERSONALITY AND ARTISTIC VISION. WHETHER IT’S DESIGNING KEY VISUALS FOR ALBUM RELEASES, PROMOTIONAL CAMPAIGNS, OR MERCHANDISE, MY GOAL IS TO CREATE BRANDING THAT RESONATES DEEPLY WITH AUDIENCES AND STANDS OUT ACROSS PLATFORMS.
                        </p>
                        <p className="font-bold text-sm">REEL 2024</p>
                    </div>
                    </div>
                    <div className="absolute bottom-12 left-8 right-8 flex space-x-8">
                    <div className="flex flex-col justify-start">
                        <p className="font-bold text-sm">(CONTACT)</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm leading-6 mb-4">AVAILABLE FOR COMMISSION AND FREELANCE WORK.</p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-sm underline">EMAIL</a>
                            <a href="#" className="text-sm underline">INSTAGRAM</a>
                        </div>
                    </div>
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
};

export default OffCanvas;
